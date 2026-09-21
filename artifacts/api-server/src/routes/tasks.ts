import { Router } from 'express';
import crypto from 'node:crypto';
import { db, tasks, employees, entities, users, notifications, sprints, epics, entityCounters, initiatives, taskChecklists, taskComments, taskNotes, eq, sql, asc } from '@workspace/db';
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

function normalizeTaskPriority(priority: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  if (!priority) return 'MEDIUM';
  const p = String(priority).toUpperCase().trim();
  if (p === 'P1' || p === '1' || p.includes('CRITICAL') || p.includes('URGENT') || p === 'URGENT') return 'URGENT';
  if (p === 'P2' || p === '2' || p.includes('HIGH') || p === 'HIGH') return 'HIGH';
  if (p === 'P3' || p === '3' || p.includes('MEDIUM') || p === 'MEDIUM') return 'MEDIUM';
  if (p === 'P4' || p === '4' || p.includes('LOW') || p === 'LOW') return 'LOW';
  return 'MEDIUM';
}

function normalizeTaskStatus(status: any): 'PLANNED' | 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'TO_REVIEW' | 'DONE' | 'DELAYED' | 'BLOCKED' | 'CANCELLED' {
  if (!status) return 'TODO';
  const s = String(status).toUpperCase().trim();
  if (s === 'DONE' || s.includes('APPROV') || s === 'APPROVED' || s === 'COMPLETED') return 'DONE';
  if (s === 'TO_REVIEW' || s === 'TO REVIEW' || s === 'IN_REVIEW' || s === 'REVIEW') return 'TO_REVIEW';
  if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') return 'IN_PROGRESS';
  if (s === 'PLANNED') return 'PLANNED';
  if (s === 'TODO' || s === 'TO DO' || s === 'TO-DO') return 'TODO';
  if (s === 'BACKLOG') return 'BACKLOG';
  if (s === 'DELAYED') return 'DELAYED';
  if (s === 'BLOCKED') return 'BLOCKED';
  if (s === 'CANCELLED') return 'CANCELLED';
  return 'TODO';
}

export async function createTaskNotification({
  targetEmployeeId,
  targetUserId,
  type,
  title,
  message,
  taskId,
  taskCode,
  taskTitle,
  extraPayload = {},
}: {
  targetEmployeeId?: string | null;
  targetUserId?: string | null;
  type: string;
  title: string;
  message: string;
  taskId: string;
  taskCode?: string | null;
  taskTitle?: string | null;
  extraPayload?: any;
}) {
  try {
    let resolvedUserId = targetUserId;
    if (!resolvedUserId && targetEmployeeId) {
      const [userRow] = await db.select().from(users).where(eq(users.employeeId, targetEmployeeId));
      if (userRow) resolvedUserId = userRow.id;
    }

    if (!resolvedUserId) {
      const [fallbackAdmin] = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
      if (fallbackAdmin) resolvedUserId = fallbackAdmin.id;
    }

    if (resolvedUserId) {
      await db.insert(notifications).values({
        userId: resolvedUserId,
        type,
        payload: {
          title,
          message,
          taskId,
          taskCode,
          taskTitle,
          ...extraPayload,
        },
      });
      console.log(`[NOTIFICATION DISPATCHED] type: ${type} to user: ${resolvedUserId} for task: ${taskCode}`);
    }
  } catch (err) {
    console.error('[TASK NOTIFICATION DISPATCH ERROR]:', err);
  }
}

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
        const targetCreatorId = creatorId || req.user?.employeeId || assignee.id;
        const targetReviewingLeadId = reviewingLeadId || (req.user?.employeeId && req.user.employeeId !== assignee.id ? req.user.employeeId : null);

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
            status: normalizeTaskStatus(status),
            priority: normalizeTaskPriority(priority),
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

// Unified Task Update Handler (Supports both PATCH & PUT /api/tasks/:id)
const handleTaskUpdate = async (req: any, res: any) => {
  const taskId = req.params.id;
  const {
    status,
    deliverableUrl,
    outputUrl,
    description,
    notes,
    sprintWeek,
    targetWeek,
    priority,
    epicId,
    sprintId,
    title,
    assigneeId,
    assigneeName,
    reviewingLeadId,
    reviewingLead,
    dueDate,
    entityId,
    entity,
    waitingOn,
  } = req.body;

  try {
    const [existingTaskCheck] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!existingTaskCheck) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user?.role === 'EMPLOYEE' && existingTaskCheck.assigneeId !== req.user.employeeId) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    const updatedTask = await db.transaction(async (tx) => {
      const updateData: any = { updatedAt: new Date() };
      if (status !== undefined) {
        const nextStatus = normalizeTaskStatus(status);
        if (nextStatus === 'DONE' && (req as any).user?.role === 'EMPLOYEE') {
          const callerEmpId = (req as any).user?.employeeId;
          if (existingTaskCheck.reviewingLeadId !== callerEmpId && existingTaskCheck.creatorId !== callerEmpId) {
            updateData.status = 'TO_REVIEW';
          } else {
            updateData.status = nextStatus;
          }
        } else {
          updateData.status = nextStatus;
        }
      }
      if (deliverableUrl !== undefined || outputUrl !== undefined) {
        updateData.deliverableUrl = deliverableUrl !== undefined ? deliverableUrl : outputUrl;
      }
      if (description !== undefined || notes !== undefined) {
        updateData.description = description !== undefined ? description : notes;
      }
      if (sprintWeek !== undefined || targetWeek !== undefined) {
        updateData.sprintWeek = sprintWeek !== undefined ? sprintWeek : targetWeek;
      }
      if (priority !== undefined) {
        updateData.priority = normalizeTaskPriority(priority);
      }
      if (title !== undefined && typeof title === 'string' && title.trim()) {
        updateData.title = title.trim();
      }
      if (waitingOn !== undefined) {
        updateData.waitingOn = String(waitingOn).trim() || 'None (Self)';
      }

      // Handle Assignee ID / Name
      if (assigneeId && typeof assigneeId === 'string' && assigneeId.length === 36) {
        updateData.assigneeId = assigneeId;
      } else if (assigneeName || assigneeId) {
        const rawTarget = String(assigneeName || assigneeId || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
        const allEmps = await tx.select().from(employees);
        const matchedEmp = allEmps.find(
          (e) =>
            e.id === assigneeId ||
            `${e.firstName} ${e.lastName}`.trim().toLowerCase() === rawTarget ||
            e.firstName.toLowerCase() === rawTarget ||
            e.lastName?.toLowerCase() === rawTarget ||
            e.employeeCode.toLowerCase() === rawTarget
        );
        if (matchedEmp) {
          updateData.assigneeId = matchedEmp.id;
        }
      }

      // Handle Reviewing Lead ID / Name
      if (reviewingLeadId && typeof reviewingLeadId === 'string' && reviewingLeadId.length === 36) {
        updateData.reviewingLeadId = reviewingLeadId;
      } else if (reviewingLead || reviewingLeadId) {
        const rawTarget = String(reviewingLead || reviewingLeadId || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
        const allEmps = await tx.select().from(employees);
        const matchedLead = allEmps.find(
          (e) =>
            e.id === reviewingLeadId ||
            `${e.firstName} ${e.lastName}`.trim().toLowerCase() === rawTarget ||
            e.firstName.toLowerCase() === rawTarget ||
            e.lastName?.toLowerCase() === rawTarget ||
            e.employeeCode.toLowerCase() === rawTarget
        );
        if (matchedLead) {
          updateData.reviewingLeadId = matchedLead.id;
        }
      }

      // Handle Due Date
      if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
        const parsedDate = new Date(dueDate);
        if (!isNaN(parsedDate.getTime())) {
          updateData.dueDate = parsedDate;
        }
      }

      // Handle Entity
      if (entityId && typeof entityId === 'string' && entityId.length === 36) {
        updateData.entityId = entityId;
      } else if (entity && typeof entity === 'string') {
        const allEnts = await tx.select().from(entities);
        const matchedEnt = allEnts.find(
          (e) =>
            e.id === entity ||
            e.code.toLowerCase() === entity.toLowerCase() ||
            e.name.toLowerCase().includes(entity.toLowerCase()) ||
            (entity.toLowerCase().includes('ehm') && e.code === 'EHM') ||
            (entity.toLowerCase().includes('climagro') && e.code === 'CAG')
        );
        if (matchedEnt) {
          updateData.entityId = matchedEnt.id;
        }
      }

      // Handle Lineage Updates (Epic / Sprint reassignment) while keeping taskCode IMMUTABLE
      if (epicId !== undefined) {
        if (epicId) {
          const [newEpic] = await tx.select().from(epics).where(eq(epics.id, epicId));
          if (!newEpic) throw new Error('Target epic not found');

          updateData.epicId = epicId;
          updateData.sprintId = null;
          updateData.taskType = 'EPIC_TASK';
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

    // Trigger lifecycle notifications based on changes:
    const oldStatus = existingTaskCheck.status;
    const newStatus = updatedTask.status;

    // 1. If assigned to a new assignee:
    if (updatedTask.assigneeId && updatedTask.assigneeId !== existingTaskCheck.assigneeId) {
      createTaskNotification({
        targetEmployeeId: updatedTask.assigneeId,
        type: 'TASK_ASSIGNED',
        title: `Task Reassigned: [${updatedTask.taskCode}]`,
        message: `You have been assigned to task [${updatedTask.taskCode}] "${updatedTask.title}".`,
        taskId: updatedTask.id,
        taskCode: updatedTask.taskCode,
        taskTitle: updatedTask.title,
      }).catch(console.error);
    }

    // 2. If status moved to TO_REVIEW / IN_REVIEW or deliverable URL submitted:
    if (
      (req.body.status === 'TO_REVIEW' || req.body.status === 'IN_REVIEW' || req.body.status === 'To Review') ||
      (updatedTask.deliverableUrl && updatedTask.deliverableUrl !== existingTaskCheck.deliverableUrl)
    ) {
      const targetLeadId = updatedTask.reviewingLeadId || updatedTask.creatorId;
      createTaskNotification({
        targetEmployeeId: targetLeadId,
        type: 'TASK_REVIEW_SUBMITTED',
        title: `Review Pending: [${updatedTask.taskCode}]`,
        message: `Task [${updatedTask.taskCode}] "${updatedTask.title}" has deliverables ready for your manager review & sign-off.`,
        taskId: updatedTask.id,
        taskCode: updatedTask.taskCode,
        taskTitle: updatedTask.title,
        extraPayload: { deliverableUrl: updatedTask.deliverableUrl },
      }).catch(console.error);
    }

    // 3. If status marked as DONE:
    if (newStatus === 'DONE' && oldStatus !== 'DONE') {
      createTaskNotification({
        targetEmployeeId: updatedTask.assigneeId,
        type: 'TASK_COMPLETED',
        title: `Task Approved & Completed: [${updatedTask.taskCode}]`,
        message: `Your deliverable for task [${updatedTask.taskCode}] "${updatedTask.title}" has been signed off and marked Done!`,
        taskId: updatedTask.id,
        taskCode: updatedTask.taskCode,
        taskTitle: updatedTask.title,
      }).catch(console.error);
    }

    res.json(updatedTask);
  } catch (err: any) {
    console.error('[TASK UPDATE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update task' });
  }
};

// PATCH /api/tasks/:id - Update Task details with Code Immutability & Auto Ancestry Derivation
router.patch('/:id', handleTaskUpdate);

// PUT /api/tasks/:id - Update Task details
router.put('/:id', handleTaskUpdate);

// PATCH /api/tasks/:id/status
router.patch('/:id/status', async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status required' });
  }

  try {
    const [targetTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!targetTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user?.role === 'EMPLOYEE' && targetTask.assigneeId !== req.user.employeeId) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    // Restrict DELAYED and BLOCKED statuses to ADMIN/MANAGER roles
    if (['DELAYED', 'BLOCKED'].includes(status) && !['ADMIN', 'MANAGER'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'Only managers and leads can mark tasks as DELAYED or BLOCKED' });
    }

    let normalizedStatus = normalizeTaskStatus(status);
    if (normalizedStatus === 'DONE' && req.user?.role === 'EMPLOYEE') {
      if (targetTask.reviewingLeadId !== req.user.employeeId && targetTask.creatorId !== req.user.employeeId) {
        normalizedStatus = 'TO_REVIEW';
      }
    }
    const [updatedTask] = await db
      .update(tasks)
      .set({ status: normalizedStatus, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Notifications for status change:
    if (normalizedStatus === 'DONE' && targetTask.status !== 'DONE') {
      createTaskNotification({
        targetEmployeeId: updatedTask.assigneeId,
        type: 'TASK_COMPLETED',
        title: `Task Approved & Completed: [${updatedTask.taskCode}]`,
        message: `Task [${updatedTask.taskCode}] "${updatedTask.title}" has been marked Done.`,
        taskId: updatedTask.id,
        taskCode: updatedTask.taskCode,
        taskTitle: updatedTask.title,
      }).catch(console.error);
    } else if (status === 'TO_REVIEW' || status === 'IN_REVIEW' || status === 'To Review') {
      createTaskNotification({
        targetEmployeeId: updatedTask.reviewingLeadId || updatedTask.creatorId,
        type: 'TASK_REVIEW_SUBMITTED',
        title: `Review Pending: [${updatedTask.taskCode}]`,
        message: `Task [${updatedTask.taskCode}] "${updatedTask.title}" is ready for review.`,
        taskId: updatedTask.id,
        taskCode: updatedTask.taskCode,
        taskTitle: updatedTask.title,
      }).catch(console.error);
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

    if (req.user?.role === 'EMPLOYEE' && targetTask.assigneeId !== req.user.employeeId) {
      return res.status(403).json({ message: 'You can only request delay extensions for tasks assigned to you' });
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
    const [targetTask] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!targetTask) return res.status(404).json({ message: 'Task not found' });

    if (req.user?.role === 'EMPLOYEE' && targetTask.assigneeId !== req.user.employeeId) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }
    const existing = await db
      .select()
      .from(taskChecklists)
      .where(eq(taskChecklists.taskId, id));

    const [created] = await db
      .insert(taskChecklists)
      .values({
        taskId: id,
        itemText,
        isCompleted: false,
        sortOrder: existing.length,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add checklist item' });
  }
});

// PATCH /api/tasks/checklists/:checklistId
router.patch('/checklists/:checklistId', async (req, res) => {
  const { checklistId } = req.params;
  const { isCompleted, itemText } = req.body;

  try {
    const [checklist] = await db.select().from(taskChecklists).where(eq(taskChecklists.id, checklistId));
    if (!checklist) return res.status(404).json({ message: 'Checklist item not found' });

    const [targetTask] = await db.select().from(tasks).where(eq(tasks.id, checklist.taskId));
    if (!targetTask) return res.status(404).json({ message: 'Task not found' });

    if (req.user?.role === 'EMPLOYEE' && targetTask.assigneeId !== req.user.employeeId) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }
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

    // Check if all checklists are now completed:
    if (isCompleted) {
      const allItems = await db.select().from(taskChecklists).where(eq(taskChecklists.taskId, targetTask.id));
      const allDone = allItems.every(c => c.id === checklistId || c.isCompleted);
      if (allDone && allItems.length > 0) {
        createTaskNotification({
          targetEmployeeId: targetTask.reviewingLeadId || targetTask.creatorId,
          type: 'TASK_CHECKLIST_COMPLETE',
          title: `Checklist Completed: [${targetTask.taskCode}]`,
          message: `All checklist items have been checked off for task [${targetTask.taskCode}] "${targetTask.title}".`,
          taskId: targetTask.id,
          taskCode: targetTask.taskCode,
          taskTitle: targetTask.title,
        }).catch(console.error);
      }
    }

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
    const [targetTask] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!targetTask) return res.status(404).json({ message: 'Task not found' });

    if (req.user?.role === 'EMPLOYEE' && targetTask.assigneeId !== req.user.employeeId) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }
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

    // Notify the other party about the comment:
    if (!isSystemLog) {
      const isAuthorAssignee = req.user?.employeeId === targetTask.assigneeId;
      const targetRecipientEmpId = isAuthorAssignee
        ? (targetTask.reviewingLeadId || targetTask.creatorId)
        : targetTask.assigneeId;

      if (targetRecipientEmpId) {
        createTaskNotification({
          targetEmployeeId: targetRecipientEmpId,
          type: 'TASK_COMMENT',
          title: `Task Comment: [${targetTask.taskCode}]`,
          message: `${authorName} commented on task [${targetTask.taskCode}]: "${content.slice(0, 80)}"`,
          taskId: targetTask.id,
          taskCode: targetTask.taskCode,
          taskTitle: targetTask.title,
        }).catch(console.error);
      }
    }

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

// DELETE /api/tasks/:id - Admin & Manager protected task deletion
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const taskId = String(req.params.id);
  try {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await db.transaction(async (tx) => {
      await tx.delete(taskChecklists).where(eq(taskChecklists.taskId, taskId));
      await tx.delete(taskComments).where(eq(taskComments.taskId, taskId));
      await tx.delete(taskNotes).where(eq(taskNotes.taskId, taskId));
      await tx.delete(tasks).where(eq(tasks.id, taskId));
    });

    res.json({ message: `Task ${task.taskCode || task.title} deleted successfully`, id: taskId });
  } catch (err: any) {
    console.error('[DELETE TASK ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete task' });
  }
});

export default router;
