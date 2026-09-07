import { Router } from 'express';
import crypto from 'node:crypto';
import { db, tasks, employees, entities, users, notifications, sprints, eq, sql } from '@workspace/db';
import { sendTaskAssignedEmail, sendDelayRequestEmail } from '../services/email.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Apply requireAuth to all task endpoints
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const allTasks = await db.select().from(tasks);
    res.json(allTasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Enforce ADMIN and MANAGER role for creating tasks
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { title, description, assigneeId, creatorId, reviewingLeadId, departmentId, sprintId, initiativeId, epicId, storyPoints, priority, status, dueDate, deliverableUrl } = req.body;

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Resolve Assignee & their entityId
      let targetAssigneeId = assigneeId;
      if (!targetAssigneeId) {
        const [firstEmp] = await tx.select().from(employees).limit(1);
        targetAssigneeId = firstEmp?.id;
      }

      const [assignee] = await tx
        .select({
          id: employees.id,
          email: employees.email,
          firstName: employees.firstName,
          lastName: employees.lastName,
          entityId: employees.entityId,
          departmentId: employees.departmentId,
          employeeCode: employees.employeeCode,
        })
        .from(employees)
        .where(eq(employees.id, targetAssigneeId));

      if (!assignee) {
        throw new Error(`Assignee employee not found for ID: ${targetAssigneeId}`);
      }

      // 2. Fetch entityCode using Assignee's own entityId
      const [entity] = await tx
        .select({ code: entities.code })
        .from(entities)
        .where(eq(entities.id, assignee.entityId));

      if (!entity) {
        throw new Error(`Entity not found for ID: ${assignee.entityId}`);
      }

      const entityCode = entity.code; // "EHM" or "CAG"

      // 3. Atomically increment taskSeqCounter on Assignee
      const [updatedEmp] = await tx
        .update(employees)
        .set({ taskSeqCounter: sql`${employees.taskSeqCounter} + 1` })
        .where(eq(employees.id, assignee.id))
        .returning();

      // Format taskCode (e.g. "EHM-EMP01-002")
      const empShortCode = updatedEmp.employeeCode.replace(/^[^-]+-/, ''); // "EMP01"
      const seqPadded = String(updatedEmp.taskSeqCounter).padStart(3, '0');
      const taskCode = `${entityCode}-${empShortCode}-${seqPadded}`;

      // 4. Resolve sprintWeek text from sprintId if available
      let sprintWeekStr = req.body.sprintWeek;
      if (!sprintWeekStr && sprintId) {
        const [sprint] = await tx.select({ name: sprints.name }).from(sprints).where(eq(sprints.id, sprintId));
        if (sprint) sprintWeekStr = sprint.name;
      }
      if (!sprintWeekStr) {
        sprintWeekStr = status === 'BACKLOG' ? 'Backlog' : 'Sprint 35';
      }

      // 5. Resolve creator ID & reviewingLeadId
      let targetCreatorId = creatorId || assignee.id;
      let targetReviewingLeadId = reviewingLeadId || targetCreatorId || assignee.id;

      // 6. Insert Task enforcing assignee.entityId
      const dueDateVal = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000);
      const [createdTask] = await tx
        .insert(tasks)
        .values({
          taskCode,
          title: title || 'Untitled Task',
          description: description || '',
          entityId: assignee.entityId, // Derived directly from Assignee!
          departmentId: departmentId || assignee.departmentId,
          sprintWeek: sprintWeekStr,
          sprintId: sprintId || null,
          initiativeId: initiativeId || null,
          epicId: epicId || null,
          storyPoints: storyPoints ? Number(storyPoints) : null,
          assigneeId: assignee.id,
          creatorId: targetCreatorId,
          reviewingLeadId: targetReviewingLeadId,
          status: status || 'TODO',
          priority: priority || 'MEDIUM',
          dueDate: dueDateVal,
          deliverableUrl: deliverableUrl || null,
        })
        .returning();

      // 7. Look up users row for assignee.id and insert notifications row
      const [assigneeUser] = await tx
        .select()
        .from(users)
        .where(eq(users.employeeId, assignee.id));

      if (assigneeUser) {
        await tx.insert(notifications).values({
          userId: assigneeUser.id,
          type: 'TASK_ASSIGNED',
          payload: {
            taskId: createdTask.id,
            taskCode: createdTask.taskCode,
            title: createdTask.title,
            dueDate: dueDateVal.toISOString().split('T')[0],
          },
        });
      }

      return { createdTask, assigneeEmail: assignee.email, assigneeName: `${assignee.firstName} ${assignee.lastName}` };
    });

    // 8. Trigger task assigned email
    await sendTaskAssignedEmail(
      result.assigneeEmail,
      result.assigneeName,
      result.createdTask.taskCode,
      result.createdTask.title,
      result.createdTask.dueDate ? new Date(result.createdTask.dueDate).toISOString().split('T')[0] : ''
    );

    res.status(201).json(result.createdTask);
  } catch (err: any) {
    console.error('[TASK ASSIGNMENT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  const taskId = req.params.id;
  const { status, deliverableUrl, description, sprintWeek, priority } = req.body;

  try {
    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (deliverableUrl !== undefined) updateData.deliverableUrl = deliverableUrl;
    if (description !== undefined) updateData.description = description;
    if (sprintWeek !== undefined) updateData.sprintWeek = sprintWeek;
    if (priority !== undefined) updateData.priority = priority;

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err: any) {
    console.error('[TASK UPDATE ERROR]:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// PATCH /api/tasks/:id/status
router.patch('/:id/status', async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status required' });
  }

  // Restrict DELAYED and BLOCKED statuses to ADMIN/MANAGER roles
  if (['DELAYED', 'BLOCKED'].includes(status) && !['ADMIN', 'MANAGER'].includes(req.user?.role || '')) {
    return res.status(403).json({ message: 'Only managers and leads can mark tasks as DELAYED or BLOCKED' });
  }

  try {
    const [updatedTask] = await db
      .update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err: any) {
    console.error('[TASK STATUS UPDATE ERROR]:', err);
    res.status(500).json({ message: 'Failed to update task status' });
  }
});

// Step 7 & Requirement 1: POST /api/tasks/:id/delay-request
router.post('/:id/delay-request', async (req, res) => {
  const taskId = req.params.id;
  const { reason, requestedDays } = req.body;

  try {
    const [targetTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!targetTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Priority Order Resolution for Delay Request Recipient:
    // a. If task.reviewingLeadId is set, look up users where users.employeeId = task.reviewingLeadId
    // b. Else, look up users where users.employeeId = task.creatorId
    // c. Fall back to first ADMIN with server warning log
    let targetUser: any = null;

    if (targetTask.reviewingLeadId) {
      const [leadUser] = await db.select().from(users).where(eq(users.employeeId, targetTask.reviewingLeadId));
      if (leadUser) targetUser = leadUser;
    }

    if (!targetUser && targetTask.creatorId) {
      const [creatorUser] = await db.select().from(users).where(eq(users.employeeId, targetTask.creatorId));
      if (creatorUser) targetUser = creatorUser;
    }

    if (!targetUser) {
      console.warn(`[DELAY REQUEST WARNING] Fallback to default ADMIN user for task ${targetTask.taskCode}`);
      const [fallbackAdmin] = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
      targetUser = fallbackAdmin;
    }

    if (targetUser) {
      await db.insert(notifications).values({
        userId: targetUser.id,
        type: 'DELAY_REQUEST',
        payload: {
          taskId: targetTask.id,
          taskCode: targetTask.taskCode,
          title: targetTask.title,
          reason: reason || 'Deadline extension requested',
          requestedDays: requestedDays || 2,
          requestedBy: req.user?.email || 'Employee',
        },
      });

      await sendDelayRequestEmail(
        targetUser.email,
        'Manager',
        targetTask.taskCode,
        targetTask.title,
        req.user?.email || 'Employee'
      );
    }

    res.json({ message: 'Delay extension request submitted successfully', taskId });
  } catch (err: any) {
    console.error('[DELAY REQUEST ERROR]:', err);
    res.status(500).json({ message: 'Failed to submit delay request' });
  }
});

export default router;
