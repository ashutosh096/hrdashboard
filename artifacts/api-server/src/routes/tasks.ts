import { Router } from 'express';
import crypto from 'node:crypto';
import { db, tasks, employees, entities, users, notifications, sprints, epics, entityCounters, initiatives, taskChecklists, taskComments, eq, sql, asc } from '@workspace/db';
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
  const {
    title,
    description,
    assigneeId,
    assigneeIds, // Array of employee IDs for multi-employee cloning
    creatorId,
    reviewingLeadId,
    departmentId,
    sprintId,
    initiativeId,
    epicId,
    storyPoints,
    priority,
    status,
    dueDate,
    deliverableUrl,
  } = req.body;

  // Resolve array of target assignees
  let targetAssigneeIds: string[] = [];
  if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
    targetAssigneeIds = assigneeIds;
  } else if (assigneeId) {
    targetAssigneeIds = [assigneeId];
  }

  if (targetAssigneeIds.length === 0) {
    const [firstEmp] = await db.select().from(employees).limit(1);
    if (firstEmp) targetAssigneeIds = [firstEmp.id];
  }

  if (targetAssigneeIds.length === 0) {
    return res.status(400).json({ message: 'No assignee employee found' });
  }

  const isGroupTask = targetAssigneeIds.length > 1;
  const groupTaskId = isGroupTask ? crypto.randomUUID() : null;

  try {
    const createdTasks: any[] = [];

    for (const empId of targetAssigneeIds) {
      const taskResult = await db.transaction(async (tx) => {
        // 1. Fetch Assignee details
        const [assignee] = await tx
          .select()
          .from(employees)
          .where(eq(employees.id, empId));

        if (!assignee) {
          throw new Error(`Assignee employee not found for ID: ${empId}`);
        }

        const [entity] = await tx
          .select({ code: entities.code })
          .from(entities)
          .where(eq(entities.id, assignee.entityId));

        if (!entity) {
          throw new Error(`Entity not found for ID: ${assignee.entityId}`);
        }

        const entityCode = entity.code; // "EHM" or "CAG"

        // 2. Lineage Derivation & Task Code Generation
        let taskType: 'EPIC_TASK' | 'SPRINT_TASK' | 'BACKLOG' = 'BACKLOG';
        let finalEpicId: string | null = null;
        let finalSprintId: string | null = null;
        let finalInitiativeId: string | null = initiativeId || null;
        let generatedTaskCode = '';

        if (epicId) {
          // EPIC_TASK Lineage
          taskType = 'EPIC_TASK';
          finalEpicId = epicId;
          finalSprintId = null;

          // Lock Epic row & auto-derive Initiative ID
          const [parentEpic] = await tx
            .select()
            .from(epics)
            .where(eq(epics.id, epicId))
            .for('update');

          if (!parentEpic) throw new Error(`Parent Epic not found for ID: ${epicId}`);

          finalInitiativeId = parentEpic.initiativeId;

          const seqNumber = parentEpic.nextTaskSeq;
          generatedTaskCode = `${parentEpic.epicCode}-T${String(seqNumber).padStart(3, '0')}`;

          // Increment nextTaskSeq on parent epic
          await tx
            .update(epics)
            .set({ nextTaskSeq: sql`${epics.nextTaskSeq} + 1` })
            .where(eq(epics.id, epicId));
        } else if (sprintId) {
          // SPRINT_TASK Lineage
          taskType = 'SPRINT_TASK';
          finalSprintId = sprintId;
          finalEpicId = null;

          // Lock Sprint row
          const [parentSprint] = await tx
            .select()
            .from(sprints)
            .where(eq(sprints.id, sprintId))
            .for('update');

          if (!parentSprint) throw new Error(`Parent Sprint not found for ID: ${sprintId}`);

          const seqNumber = parentSprint.nextTaskSeq;
          generatedTaskCode = `${parentSprint.sprintCode}-T${String(seqNumber).padStart(3, '0')}`;

          // Increment nextTaskSeq on parent sprint
          await tx
            .update(sprints)
            .set({ nextTaskSeq: sql`${sprints.nextTaskSeq} + 1` })
            .where(eq(sprints.id, sprintId));
        } else {
          // BACKLOG Lineage
          taskType = 'BACKLOG';
          finalEpicId = null;
          finalSprintId = null;

          // Lock entity_counters row for backlog counter
          await tx
            .insert(entityCounters)
            .values({ entityId: assignee.entityId, nextBacklogTaskSeq: 1 })
            .onConflictDoNothing();

          const [counter] = await tx
            .update(entityCounters)
            .set({ nextBacklogTaskSeq: sql`${entityCounters.nextBacklogTaskSeq} + 1` })
            .where(eq(entityCounters.entityId, assignee.entityId))
            .returning();

          const seqNumber = (counter?.nextBacklogTaskSeq || 2) - 1;
          generatedTaskCode = `${entityCode}-T${String(seqNumber).padStart(3, '0')}`;
        }

        // 3. Resolve sprintWeek string
        let sprintWeekStr = req.body.sprintWeek || null;
        if (!sprintWeekStr && finalSprintId) {
          const [sprint] = await tx.select({ targetWeek: sprints.targetWeek, name: sprints.name }).from(sprints).where(eq(sprints.id, finalSprintId));
          if (sprint) sprintWeekStr = sprint.targetWeek || sprint.name;
        }

        // 4. Resolve Creator & Reviewing Lead
        const targetCreatorId = creatorId || assignee.id;
        const targetReviewingLeadId = reviewingLeadId || targetCreatorId;

        // 5. Insert Task
        const dueDateVal = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000);
        const [newTask] = await tx
          .insert(tasks)
          .values({
            taskCode: generatedTaskCode,
            title: title || 'Untitled Task',
            description: description || '',
            entityId: assignee.entityId,
            departmentId: departmentId || assignee.departmentId,
            taskType,
            sprintWeek: sprintWeekStr,
            sprintId: finalSprintId,
            initiativeId: finalInitiativeId,
            epicId: finalEpicId,
            groupTaskId,
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

        // 6. Insert notification for assignee
        const [assigneeUser] = await tx
          .select()
          .from(users)
          .where(eq(users.employeeId, assignee.id));

        if (assigneeUser) {
          await tx.insert(notifications).values({
            userId: assigneeUser.id,
            type: 'TASK_ASSIGNED',
            payload: {
              taskId: newTask.id,
              taskCode: newTask.taskCode,
              title: newTask.title,
              dueDate: dueDateVal.toISOString().split('T')[0],
            },
          });
        }

        return { newTask, assigneeEmail: assignee.email, assigneeName: `${assignee.firstName} ${assignee.lastName}` };
      });

      // Send Notification Email asynchronously
      sendTaskAssignedEmail(
        taskResult.assigneeEmail,
        taskResult.assigneeName,
        taskResult.newTask.taskCode,
        taskResult.newTask.title,
        taskResult.newTask.dueDate ? new Date(taskResult.newTask.dueDate).toISOString().split('T')[0] : ''
      ).catch(console.error);

      createdTasks.push(taskResult.newTask);
    }

    res.status(201).json(isGroupTask ? createdTasks : createdTasks[0]);
  } catch (err: any) {
    console.error('[TASK CREATION ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id - Update Task details with Code Immutability & Auto Ancestry Derivation
router.patch('/:id', async (req, res) => {
  const taskId = req.params.id;
  const { status, deliverableUrl, description, sprintWeek, priority, epicId, sprintId, title, assigneeId } = req.body;

  try {
    const updatedTask = await db.transaction(async (tx) => {
      const [existingTask] = await tx.select().from(tasks).where(eq(tasks.id, taskId));
      if (!existingTask) return null;

      const updateData: any = { updatedAt: new Date() };

      if (status !== undefined) updateData.status = status;
      if (deliverableUrl !== undefined) updateData.deliverableUrl = deliverableUrl;
      if (description !== undefined) updateData.description = description;
      if (sprintWeek !== undefined) updateData.sprintWeek = sprintWeek;
      if (priority !== undefined) updateData.priority = priority;
      if (title !== undefined) updateData.title = title;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId;

      // Handle Lineage Updates (Epic / Sprint reassignment) while keeping taskCode IMMUTABLE
      if (epicId !== undefined) {
        if (epicId) {
          const [newEpic] = await tx.select().from(epics).where(eq(epics.id, epicId));
          if (!newEpic) throw new Error('Target epic not found');

          updateData.epicId = epicId;
          updateData.sprintId = null;
          updateData.taskType = 'EPIC_TASK';
          // Auto-update initiativeId to new epic's parent initiative!
          updateData.initiativeId = newEpic.initiativeId;
        } else {
          updateData.epicId = null;
          updateData.taskType = 'BACKLOG';
          updateData.initiativeId = null;
        }
      } else if (sprintId !== undefined) {
        if (sprintId) {
          updateData.sprintId = sprintId;
          updateData.epicId = null;
          updateData.taskType = 'SPRINT_TASK';
          updateData.initiativeId = null;
        } else {
          updateData.sprintId = null;
          updateData.taskType = 'BACKLOG';
        }
      }

      // Explicitly EXCLUDE taskCode from updates to strictly enforce taskCode IMMUTABILITY!
      delete updateData.taskCode;

      const [resTask] = await tx
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, taskId))
        .returning();

      return resTask;
    });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err: any) {
    console.error('[TASK UPDATE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update task' });
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

// POST /api/tasks/:id/delay-request
router.post('/:id/delay-request', async (req, res) => {
  const taskId = req.params.id;
  const { reason, requestedDays } = req.body;

  try {
    const [targetTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!targetTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

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
      ).catch(console.error);
    }

    res.json({ message: 'Delay extension request submitted successfully', taskId });
  } catch (err: any) {
    console.error('[DELAY REQUEST ERROR]:', err);
    res.status(500).json({ message: 'Failed to submit delay request' });
  }
});

// GET /api/tasks/:id/checklists
router.get('/:id/checklists', async (req, res) => {
  const { id } = req.params;
  try {
    const items = await db
      .select()
      .from(taskChecklists)
      .where(eq(taskChecklists.taskId, id))
      .orderBy(asc(taskChecklists.sortOrder));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task checklists' });
  }
});

// POST /api/tasks/:id/checklists
router.post('/:id/checklists', async (req, res) => {
  const { id } = req.params;
  const { itemText } = req.body;
  if (!itemText) return res.status(400).json({ message: 'itemText is required' });

  try {
    const existing = await db
      .select()
      .from(taskChecklists)
      .where(eq(taskChecklists.taskId, id));

    const nextSortOrder = existing.length + 1;

    const [newItem] = await db
      .insert(taskChecklists)
      .values({
        taskId: id,
        itemText,
        isCompleted: false,
        sortOrder: nextSortOrder,
      })
      .returning();

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add checklist item' });
  }
});

// PATCH /api/tasks/checklists/:checklistId
router.patch('/checklists/:checklistId', async (req, res) => {
  const { checklistId } = req.params;
  const { isCompleted, itemText } = req.body;

  try {
    const updatePayload: any = {};
    if (typeof itemText === 'string') updatePayload.itemText = itemText;

    if (typeof isCompleted === 'boolean') {
      updatePayload.isCompleted = isCompleted;
      if (isCompleted) {
        updatePayload.completedAt = new Date(); // Server-side automatic timestamp
        if (req.user?.employeeId) {
          updatePayload.completedBy = req.user.employeeId;
        }
      } else {
        updatePayload.completedAt = null;
        updatePayload.completedBy = null;
      }
    }

    const [updated] = await db
      .update(taskChecklists)
      .set(updatePayload)
      .where(eq(taskChecklists.id, checklistId))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update checklist item' });
  }
});

// GET /api/tasks/:id/comments (Always ORDER BY created_at ASC)
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await db
      .select()
      .from(taskComments)
      .where(eq(taskComments.taskId, id))
      .orderBy(asc(taskComments.createdAt));
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task comments' });
  }
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { content, isSystemLog } = req.body;
  if (!content) return res.status(400).json({ message: 'content is required' });

  try {
    const authorName = req.user?.email || 'User';
    const [newComment] = await db
      .insert(taskComments)
      .values({
        taskId: id,
        authorId: req.user?.employeeId || null,
        authorName,
        content,
        isSystemLog: Boolean(isSystemLog),
      })
      .returning();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

export default router;
