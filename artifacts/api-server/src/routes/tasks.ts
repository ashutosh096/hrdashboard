import { Router, Request, Response } from 'express';
import { db, tasks, employees, departments, entities, users, notifications, sprints, epics, initiatives, projects, entityCounters, generateNextGlobalCode, taskChecklists, taskComments, taskNotes, eq, and, or, inArray, sql, asc, desc, recordHistory } from '@workspace/db';
import { sendTaskAssignedEmail, sendDelayRequestEmail } from '../services/email.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getCallerInfo } from '../utils/userSnapshot.js';
import { insertNotification, pruneNotificationsToLimit } from '../services/notificationService.js';

const router = Router();

// Apply requireAuth to all task endpoints
router.use(requireAuth);

router.get('/', async (req, res) => {
  const {
    page,
    pageSize,
    limit,
    employeeId,
    priority,
    status,
    search,
    epicId,
    initiativeId,
    projectId,
    entityCode,
    paginate,
  } = req.query;

  try {
    const isPaginatedRequest =
      paginate === 'true' ||
      page !== undefined ||
      pageSize !== undefined ||
      limit !== undefined ||
      employeeId !== undefined ||
      priority !== undefined ||
      status !== undefined ||
      search !== undefined;

    const conditions: any[] = [];

    // 1. Employee Filter
    if (employeeId && employeeId !== 'ALL') {
      conditions.push(eq(tasks.assigneeId, String(employeeId)));
    }

    // 2. Priority Filter
    if (priority && priority !== 'ALL') {
      const p = String(priority).toUpperCase().trim();
      if (p === 'P1' || p === 'URGENT') {
        conditions.push(sql`UPPER(${tasks.priority}::text) IN ('P1', '1', 'URGENT', 'CRITICAL')`);
      } else if (p === 'P2' || p === 'HIGH') {
        conditions.push(sql`UPPER(${tasks.priority}::text) IN ('P2', '2', 'HIGH')`);
      } else if (p === 'P3' || p === 'MEDIUM') {
        conditions.push(sql`UPPER(${tasks.priority}::text) IN ('P3', '3', 'MEDIUM')`);
      } else if (p === 'P4' || p === 'LOW') {
        conditions.push(sql`UPPER(${tasks.priority}::text) IN ('P4', '4', 'LOW')`);
      } else {
        conditions.push(sql`UPPER(${tasks.priority}::text) = ${p}`);
      }
    }

    // 3. Status Filter
    if (status && status !== 'ALL') {
      const s = String(status).toUpperCase().trim();
      if (s === 'DONE') {
        conditions.push(sql`UPPER(${tasks.status}::text) IN ('DONE', 'COMPLETED', 'APPROVED')`);
      } else if (s === 'IN_PROGRESS') {
        conditions.push(sql`UPPER(${tasks.status}::text) IN ('IN_PROGRESS', 'IN PROGRESS', 'ACTIVE')`);
      } else if (s === 'PLANNED') {
        conditions.push(sql`UPPER(${tasks.status}::text) IN ('PLANNED', 'TODO', 'TO DO')`);
      } else if (s === 'BACKLOG') {
        conditions.push(sql`UPPER(${tasks.status}::text) IN ('BACKLOG')`);
      } else {
        conditions.push(sql`UPPER(${tasks.status}::text) = ${s}`);
      }
    }

    // 4. Search Filter (search across title, taskCode, description)
    if (search && typeof search === 'string' && search.trim()) {
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${tasks.title}) LIKE ${searchPattern} OR LOWER(${tasks.taskCode}) LIKE ${searchPattern} OR LOWER(COALESCE(${tasks.description}, '')) LIKE ${searchPattern})`
      );
    }

    // 5. Epic / Initiative / Project Filter
    if (epicId && typeof epicId === 'string' && epicId !== 'ALL') {
      conditions.push(eq(tasks.epicId, epicId));
    }
    if (initiativeId && typeof initiativeId === 'string' && initiativeId !== 'ALL') {
      conditions.push(eq(tasks.initiativeId, initiativeId));
    }
    if (projectId && typeof projectId === 'string' && projectId !== 'ALL') {
      conditions.push(eq(tasks.projectId, projectId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (!isPaginatedRequest) {
      const allTasks = whereClause
        ? await db.select().from(tasks).where(whereClause).orderBy(sql`LOWER(${tasks.title}) ASC`)
        : await db.select().from(tasks).orderBy(sql`LOWER(${tasks.title}) ASC`);
      const enriched = await enrichTasks(allTasks);
      enriched.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
      return res.json(enriched);
    }

    // Server-side Pagination with real COUNT(*) query
    const targetPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
    const targetPageSize = Math.max(1, Math.min(100, parseInt(String(pageSize || limit || 25), 10) || 25));
    const offset = (targetPage - 1) * targetPageSize;

    const [countRow] = whereClause
      ? await db.select({ count: sql<number>`count(*)` }).from(tasks).where(whereClause)
      : await db.select({ count: sql<number>`count(*)` }).from(tasks);

    const totalCount = Number(countRow?.count || 0);

    const taskRows = whereClause
      ? await db
          .select()
          .from(tasks)
          .where(whereClause)
          .orderBy(sql`LOWER(${tasks.title}) ASC`)
          .limit(targetPageSize)
          .offset(offset)
      : await db
          .select()
          .from(tasks)
          .orderBy(sql`LOWER(${tasks.title}) ASC`)
          .limit(targetPageSize)
          .offset(offset);

    const enriched = await enrichTasks(taskRows);
    enriched.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));

    return res.json({
      tasks: enriched,
      totalCount,
      page: targetPage,
      pageSize: targetPageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / targetPageSize)),
    });
  } catch (err: any) {
    console.error('[GET TASKS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch tasks', error: err?.message });
  }
});

// GET /api/tasks/:id - Fetch single task by UUID or taskCode
router.get('/:id', async (req, res) => {
  const rawId = req.params.id?.trim();
  if (!rawId) {
    return res.status(400).json({ message: 'Task ID or taskCode required' });
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);
    let targetTask: any = null;

    if (isUuid) {
      const [taskRow] = await db.select().from(tasks).where(eq(tasks.id, rawId));
      targetTask = taskRow;
    }

    if (!targetTask) {
      const [taskRow] = await db
        .select()
        .from(tasks)
        .where(sql`LOWER(${tasks.taskCode}) = ${rawId.toLowerCase()}`);
      targetTask = taskRow;
    }

    if (!targetTask) {
      return res.status(404).json({ message: `Task not found for identifier: ${rawId}` });
    }

    const [enriched] = await enrichTasks([targetTask]);
    return res.json(enriched || targetTask);
  } catch (err: any) {
    console.error('[GET TASK BY ID ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch task', error: err?.message });
  }
});

export async function enrichTasks(tasksList: any[]) {
  if (!Array.isArray(tasksList) || tasksList.length === 0) return [];
  const allEmployees = await db.select().from(employees);
  const allEpics = await db.select().from(epics);
  const allInitiatives = await db.select().from(initiatives);
  const allProjects = await db.select().from(projects);
  const allEntities = await db.select().from(entities);

  return tasksList.map(t => {
    const assigneeEmp = allEmployees.find(e => e.id === t.assigneeId);
    const leadEmp = allEmployees.find(e => e.id === t.reviewingLeadId);
    const creatorEmp = allEmployees.find(e => e.id === t.creatorId);
    const parentEpic = allEpics.find(e => e.id === t.epicId);
    const parentInit = allInitiatives.find(i => i.id === (t.initiativeId || parentEpic?.initiativeId));
    const parentProj = allProjects.find(p => p.id === (t.projectId || parentEpic?.projectId));
    const entity = allEntities.find(ent => ent.id === t.entityId);

    const assigneeName = assigneeEmp 
      ? `${assigneeEmp.firstName || ''} ${assigneeEmp.lastName || ''}`.trim() || assigneeEmp.employeeCode 
      : 'Unassigned';

    const reviewingLead = leadEmp 
      ? `${leadEmp.firstName || ''} ${leadEmp.lastName || ''}`.trim() || leadEmp.employeeCode 
      : 'Manager Lead';

    return {
      ...t,
      assignee: assigneeName,
      assigneeName,
      assigneeEmail: assigneeEmp?.email || '',
      assigneeCode: assigneeEmp?.employeeCode || '',
      reviewingLead,
      reviewingLeadName: reviewingLead,
      reviewingLeadEmail: leadEmp?.email || '',
      creatorName: creatorEmp ? `${creatorEmp.firstName || ''} ${creatorEmp.lastName || ''}`.trim() : 'Admin',
      createdByName: t.createdByName || (creatorEmp ? `${creatorEmp.firstName || ''} ${creatorEmp.lastName || ''}`.trim() : 'Admin'),
      epicCode: parentEpic?.epicCode || null,
      epicTitle: parentEpic?.title || null,
      parentEpicCode: parentEpic?.epicCode || null,
      parentEpicTitle: parentEpic?.title || null,
      initiativeCode: parentInit?.initiativeCode || null,
      initiativeTitle: parentInit?.title || null,
      projectCode: parentProj?.code || null,
      projectName: parentProj?.name || null,
      projectId: t.projectId || parentEpic?.projectId || null,
      taskId: t.taskCode || t.id,
      taskCode: t.taskCode,
      entity: entity?.code === 'CAG'
        ? 'CLIMAGRO'
        : entity?.code === 'COMMON'
        ? 'COMMON'
        : 'EHM',
      entityCode: entity?.code || 'EHM',
      entityName: entity?.name || (entity?.code === 'CAG' ? 'Climagro Analytics' : entity?.code === 'COMMON' ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
    };
  });
}

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
      await insertNotification({
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

// Allow ADMIN, MANAGER, and EMPLOYEE to create tasks
router.post('/', requireRole(['ADMIN', 'MANAGER', 'EMPLOYEE']), async (req, res) => {
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
    projectId,
    storyPoints,
    priority,
    status,
    dueDate,
    deliverableUrl,
    checklists,
    comments,
  } = req.body;

  // Resolve array of target assignees (allows unassigned tasks when assignee is null or unassigned)
  const isExplicitlyUnassigned = assigneeId === null || assigneeId === '' || assigneeId === 'unassigned' || req.body.unassigned === true;
  let targetAssigneeIds: (string | null)[] = [];
  if (isExplicitlyUnassigned) {
    targetAssigneeIds = [null];
  } else if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
    targetAssigneeIds = assigneeIds;
  } else if (assigneeId) {
    targetAssigneeIds = [assigneeId];
  } else if (req.user?.employeeId) {
    targetAssigneeIds = [req.user.employeeId];
  } else {
    targetAssigneeIds = [null];
  }

  const isGroupTask = targetAssigneeIds.length > 1;
  const groupTaskId = isGroupTask ? crypto.randomUUID() : null;

  try {
    const createdTasks: any[] = [];

    for (const empId of targetAssigneeIds) {
      const taskResult = await db.transaction(async (tx) => {
        // 1. Fetch Assignee details if assigned
        let assignee: any = null;
        if (empId) {
          const [foundEmp] = await tx
            .select()
            .from(employees)
            .where(eq(employees.id, empId));
          assignee = foundEmp || null;
        }

        let targetEntityId = assignee?.entityId;
        if (req.body.entityId) {
          targetEntityId = req.body.entityId;
        } else if (req.body.entityCode) {
          const entCodeUpper = String(req.body.entityCode).toUpperCase().trim();
          const mappedCode = entCodeUpper === 'CLIMAGRO' ? 'CAG' : entCodeUpper;
          const [foundEnt] = await tx.select().from(entities).where(eq(entities.code, mappedCode));
          if (foundEnt) targetEntityId = foundEnt.id;
        }

        if (!targetEntityId) {
          const [defaultEnt] = await tx.select().from(entities).limit(1);
          targetEntityId = defaultEnt?.id;
        }

        const [entity] = await tx
          .select({ code: entities.code, id: entities.id })
          .from(entities)
          .where(eq(entities.id, targetEntityId));

        if (!entity) {
          throw new Error(`Entity not found for ID: ${targetEntityId}`);
        }

        const entityCode = entity.code; // "EHM" or "CAG" or "COMMON"

        // 2. Lineage Derivation & Task Code Generation
        let taskType: 'EPIC_TASK' | 'SPRINT_TASK' | 'BACKLOG' = 'BACKLOG';
        let finalEpicId: string | null = null;
        let finalSprintId: string | null = null;
        let finalInitiativeId: string | null = initiativeId || null;
        let finalProjectId: string | null = projectId || null;
        let generatedTaskCode = '';

        if (epicId) {
          // EPIC_TASK Lineage
          taskType = 'EPIC_TASK';
          finalEpicId = epicId;
          finalSprintId = null;

          // Lock Epic row & auto-derive Initiative ID & Project ID
          const [parentEpic] = await tx
            .select()
            .from(epics)
            .where(eq(epics.id, epicId))
            .for('update');

          if (!parentEpic) throw new Error(`Parent Epic not found for ID: ${epicId}`);

          finalInitiativeId = parentEpic.initiativeId;
          if (!finalProjectId && parentEpic.projectId) {
            finalProjectId = parentEpic.projectId;
          }

          generatedTaskCode = await generateNextGlobalCode('TASK', tx);
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

          generatedTaskCode = await generateNextGlobalCode('STSK', tx);
        } else {
          // BACKLOG Lineage
          taskType = 'BACKLOG';
          finalEpicId = null;
          finalSprintId = null;

          generatedTaskCode = await generateNextGlobalCode('BLOG', tx);
        }

        // 3. Resolve sprintWeek string
        let sprintWeekStr = req.body.sprintWeek || null;
        if (!sprintWeekStr && finalSprintId) {
          const [sprint] = await tx.select({ targetWeek: sprints.targetWeek, name: sprints.name }).from(sprints).where(eq(sprints.id, finalSprintId));
          if (sprint) sprintWeekStr = sprint.targetWeek || sprint.name;
        }

        // 4. Resolve Creator & Reviewing Lead
        const caller = await getCallerInfo(req.user, tx);
        const targetCreatorId = creatorId || req.user?.employeeId || assignee?.id || caller.employeeId;
        const targetReviewingLeadId = reviewingLeadId || (req.user?.employeeId && (!assignee || req.user.employeeId !== assignee.id) ? req.user.employeeId : null);

        // Resolve Department ID safely
        let finalDeptId = departmentId || assignee?.departmentId;
        if (!finalDeptId) {
          const [firstDept] = await tx.select().from(departments).limit(1);
          finalDeptId = firstDept?.id;
        }

        // 5. Insert Task
        const dueDateVal = dueDate ? new Date(dueDate) : null;
        const [newTask] = await tx
          .insert(tasks)
          .values({
            taskCode: generatedTaskCode,
            title: title || 'Untitled Task',
            description: description || '',
            entityId: entity.id,
            departmentId: finalDeptId,
            taskType,
            sprintWeek: sprintWeekStr,
            sprintId: finalSprintId,
            initiativeId: finalInitiativeId,
            epicId: finalEpicId,
            projectId: finalProjectId,
            groupTaskId,
            storyPoints: storyPoints ? Number(storyPoints) : null,
            assigneeId: assignee?.id || null,
            creatorId: targetCreatorId,
            reviewingLeadId: targetReviewingLeadId,
            status: normalizeTaskStatus(status),
            priority: normalizeTaskPriority(priority),
            dueDate: dueDateVal,
            deliverableUrl: deliverableUrl || null,
            createdById: caller.employeeId,
            createdByName: caller.callerName,
          })
          .returning();

        // 5a. Record history for Task creation
        await recordHistory(tx, {
          tableName: 'tasks',
          recordId: newTask.id,
          action: 'CREATED',
          changes: [{ field: 'title', old: null, new: newTask.title }],
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });

        // 5b. Record CHILD_ADDED on parent Epic if present
        if (finalEpicId) {
          await recordHistory(tx, {
            tableName: 'epics',
            recordId: finalEpicId,
            action: 'CHILD_ADDED',
            changes: [{ field: 'task', old: null, new: `Task added: ${newTask.title}` }],
            changedById: caller.employeeId,
            changedByName: caller.callerName,
          });
        }

        // 5c. Record CHILD_ADDED on parent Sprint if present
        if (finalSprintId) {
          await recordHistory(tx, {
            tableName: 'sprints',
            recordId: finalSprintId,
            action: 'CHILD_ADDED',
            changes: [{ field: 'task', old: null, new: `Task added: ${newTask.title}` }],
            changedById: caller.employeeId,
            changedByName: caller.callerName,
          });
        }

        // 5d. Record CHILD_ADDED on parent Initiative if present
        if (finalInitiativeId) {
          await recordHistory(tx, {
            tableName: 'initiatives',
            recordId: finalInitiativeId,
            action: 'CHILD_ADDED',
            changes: [{ field: 'task', old: null, new: `Task added: ${newTask.title}` }],
            changedById: caller.employeeId,
            changedByName: caller.callerName,
          });
        }

        // 5e. Record CHILD_ADDED on parent Project if present
        if (finalProjectId) {
          await recordHistory(tx, {
            tableName: 'projects',
            recordId: finalProjectId,
            action: 'CHILD_ADDED',
            changes: [{ field: 'task', old: null, new: `Task added: ${newTask.title}` }],
            changedById: caller.employeeId,
            changedByName: caller.callerName,
          });
        }

        // 5a. Persist Initial Checklists (Subtasks) if provided
        if (Array.isArray(checklists) && checklists.length > 0) {
          for (let i = 0; i < checklists.length; i++) {
            const chk = checklists[i];
            const text = typeof chk === 'string' ? chk : (chk.itemText || chk.title || '');
            if (text && text.trim()) {
              await tx.insert(taskChecklists).values({
                taskId: newTask.id,
                itemText: text.trim(),
                isCompleted: typeof chk === 'object' ? Boolean(chk.isCompleted) : false,
                sortOrder: i + 1,
              });
            }
          }
        }

        // 5b. Persist Initial Comments if provided
        if (Array.isArray(comments) && comments.length > 0) {
          for (const c of comments) {
            const content = typeof c === 'string' ? c : (c.content || '');
            if (content && content.trim()) {
              await tx.insert(taskComments).values({
                taskId: newTask.id,
                authorName: typeof c === 'object' ? (c.authorName || 'User') : 'User',
                content: content.trim(),
                isSystemLog: typeof c === 'object' ? Boolean(c.isSystemLog) : false,
              });
            }
          }
        }

        // 6. Insert notification for assignee
        const [assigneeUser] = await tx
          .select()
          .from(users)
          .where(eq(users.employeeId, assignee.id));

        if (assigneeUser) {
          const notifTitle = `New Sprint Task Assigned: [${newTask.taskCode}] "${newTask.title}"`;
          const notifMsg = `You have been assigned to sprint task [${newTask.taskCode}] "${newTask.title}".${dueDateVal ? ` Target Due Date: ${dueDateVal.toISOString().split('T')[0]}.` : ''}`;
          await insertNotification(
            {
              userId: assigneeUser.id,
              type: 'TASK_ASSIGNED',
              payload: {
                taskId: newTask.id,
                taskCode: newTask.taskCode,
                taskTitle: newTask.title,
                title: notifTitle,
                message: notifMsg,
                assigneeId: assignee.id,
                assigneeName: `${assignee.firstName} ${assignee.lastName}`.trim(),
                dueDate: dueDateVal ? dueDateVal.toISOString().split('T')[0] : null,
                tagged: true,
              },
            },
            tx
          );
        }

        return {
          newTask,
          assigneeEmail: assignee?.email || null,
          assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}`.trim() : 'Unassigned',
        };
      });

      // Send Notification Email asynchronously if assignee exists
      if (taskResult.assigneeEmail) {
        sendTaskAssignedEmail(
          taskResult.assigneeEmail,
          taskResult.assigneeName,
          taskResult.newTask.taskCode,
          taskResult.newTask.title,
          taskResult.newTask.dueDate ? new Date(taskResult.newTask.dueDate).toISOString().split('T')[0] : ''
        ).catch(console.error);
      }

      createdTasks.push(taskResult.newTask);
    }

    const enrichedList = await enrichTasks(createdTasks);
    res.status(201).json(isGroupTask ? enrichedList : enrichedList[0]);
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
    projectId,
    title,
    assigneeId,
    assigneeName,
    reviewingLeadId,
    reviewingLead,
    dueDate,
    entityId,
    entity,
    entityCode,
    waitingOn,
    checklists,
    comments,
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
      if (projectId !== undefined) {
        updateData.projectId = projectId || null;
      }

      // Handle Assignee ID / Name (Support removing assignee and keeping unassigned)
      if (assigneeId === null || assigneeId === '' || assigneeName === '' || assigneeName === 'Unassigned' || assigneeName === 'None') {
        updateData.assigneeId = null;
      } else if (assigneeId && typeof assigneeId === 'string' && assigneeId.length === 36) {
        updateData.assigneeId = assigneeId;
      } else if (assigneeName || assigneeId) {
        const rawTarget = String(assigneeName || assigneeId || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
        if (rawTarget === 'unassigned' || rawTarget === 'none' || rawTarget === '') {
          updateData.assigneeId = null;
        } else {
          const allEmps = await tx.select().from(employees);
          const matchedEmp = allEmps.find(
            (e) =>
              e.id === assigneeId ||
              `${e.firstName} ${e.lastName}`.trim().toLowerCase() === rawTarget ||
              e.firstName.toLowerCase() === rawTarget ||
              e.lastName?.toLowerCase() === rawTarget
          );
          if (matchedEmp) {
            updateData.assigneeId = matchedEmp.id;
          }
        }
      }

      // Handle Reviewing Lead ID / Name (Support removing lead and keeping unassigned/none)
      if (reviewingLeadId === null || reviewingLeadId === '' || reviewingLead === '' || reviewingLead === 'Unassigned' || reviewingLead === 'None') {
        updateData.reviewingLeadId = null;
      } else if (reviewingLeadId && typeof reviewingLeadId === 'string' && reviewingLeadId.length === 36) {
        updateData.reviewingLeadId = reviewingLeadId;
      } else if (reviewingLead || reviewingLeadId) {
        const rawTarget = String(reviewingLead || reviewingLeadId || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
        if (rawTarget === 'unassigned' || rawTarget === 'none' || rawTarget === '' || rawTarget === 'manager lead') {
          updateData.reviewingLeadId = null;
        } else {
          const allEmps = await tx.select().from(employees);
          const matchedLead = allEmps.find(
            (e) =>
              e.id === reviewingLeadId ||
              `${e.firstName} ${e.lastName}`.trim().toLowerCase() === rawTarget ||
              e.firstName.toLowerCase() === rawTarget ||
              e.lastName?.toLowerCase() === rawTarget
          );
          if (matchedLead) {
            updateData.reviewingLeadId = matchedLead.id;
          }
        }
      }

      // Handle Due Date
      if (dueDate !== undefined) {
        if (!dueDate || dueDate === '' || dueDate === null) {
          updateData.dueDate = null;
        } else {
          const parsedDate = new Date(dueDate);
          if (!isNaN(parsedDate.getTime())) {
            updateData.dueDate = parsedDate;
          } else {
            updateData.dueDate = null;
          }
        }
      }

      // Handle Entity (Prioritize explicit entity/entityCode selection over stale entityId)
      const targetEntityStr = (entity || entityCode || '').toString().trim();
      if (targetEntityStr) {
        const entStr = targetEntityStr.toLowerCase();
        const allEnts = await tx.select().from(entities);
        const matchedEnt = allEnts.find((e) => {
          if (entStr === e.id) return true;
          if (entStr === 'common' || entStr.includes('common') || entStr.includes('both') || entStr.includes('&')) {
            return e.code === 'COMMON' || e.name.toLowerCase().includes('common');
          }
          if (entStr === 'cag' || entStr === 'climagro' || entStr.includes('climagro')) {
            return e.code === 'CAG';
          }
          if (entStr === 'ehm' || (!entStr.includes('&') && entStr.includes('ehm'))) {
            return e.code === 'EHM';
          }
          return e.code.toLowerCase() === entStr || e.name.toLowerCase().includes(entStr);
        });
        if (matchedEnt) {
          updateData.entityId = matchedEnt.id;
        }
      } else if (entityId && typeof entityId === 'string' && entityId.length === 36) {
        updateData.entityId = entityId;
      }

      // Handle Lineage Updates (Epic / Sprint reassignment) while keeping taskCode IMMUTABLE
      if (epicId !== undefined) {
        if (epicId) {
          const [newEpic] = await tx.select().from(epics).where(eq(epics.id, epicId));
          if (!newEpic) throw new Error('Target epic not found');

          updateData.epicId = epicId;
          updateData.taskType = existingTaskCheck.sprintId ? 'SPRINT_TASK' : 'EPIC_TASK';
          updateData.initiativeId = newEpic.initiativeId || existingTaskCheck.initiativeId;
          if (!updateData.projectId && newEpic.projectId) {
            updateData.projectId = newEpic.projectId;
          }
        } else {
          updateData.epicId = null;
          if (!existingTaskCheck.sprintId) {
            updateData.taskType = 'BACKLOG';
          }
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

      // Record changed fields in history
      const caller = await getCallerInfo(req.user, tx);
      const changes: { field: string; old: any; new: any }[] = [];
      for (const [key, newVal] of Object.entries(updateData)) {
        if (key.toLowerCase() === 'updatedat' || key.toLowerCase() === 'updated_at' || key.toLowerCase() === 'createdat' || key.toLowerCase() === 'created_at') continue;
        const oldVal = (existingTaskCheck as any)[key];
        const oldStr = oldVal instanceof Date ? oldVal.toISOString() : String(oldVal ?? '');
        const newStr = newVal instanceof Date ? newVal.toISOString() : String(newVal ?? '');
        if (oldStr !== newStr) {
          if (oldStr.trim() === newStr.trim()) continue;
          if (key.toLowerCase().includes('date') || oldVal instanceof Date || newVal instanceof Date) {
            const d1 = oldStr ? oldStr.split('T')[0] : '';
            const d2 = newStr ? newStr.split('T')[0] : '';
            if (d1 === d2) continue;
          }
          changes.push({ field: key, old: oldVal, new: newVal });
        }
      }

      if (changes.length > 0) {
        await recordHistory(tx, {
          tableName: 'tasks',
          recordId: taskId,
          action: 'UPDATED',
          changes,
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      // Persist Checklists if provided
      if (Array.isArray(checklists)) {
        const existingChecklists = await tx.select().from(taskChecklists).where(eq(taskChecklists.taskId, taskId));
        const keepIds = new Set(checklists.filter(c => c.id && c.id.length === 36).map(c => c.id));
        for (const ec of existingChecklists) {
          if (!keepIds.has(ec.id)) {
            await tx.delete(taskChecklists).where(eq(taskChecklists.id, ec.id));
          }
        }
        for (let i = 0; i < checklists.length; i++) {
          const chk = checklists[i];
          if (chk.id && chk.id.length === 36) {
            const [existingChk] = await tx.select().from(taskChecklists).where(eq(taskChecklists.id, chk.id));
            if (existingChk) {
              if (existingChk.isCompleted !== Boolean(chk.isCompleted)) {
                const verb = Boolean(chk.isCompleted) ? 'Completed' : 'Marked pending';
                await recordHistory(tx, {
                  tableName: 'tasks',
                  recordId: taskId,
                  action: 'STATUS_CHANGED',
                  changes: [{
                    field: 'checklist',
                    old: existingChk.isCompleted ? 'Completed' : 'Pending',
                    new: `${verb} subtask: "${chk.itemText || chk.title || existingChk.itemText}"`,
                  }],
                  changedById: caller.employeeId,
                  changedByName: caller.callerName,
                });
              }
              await tx.update(taskChecklists)
                .set({
                  itemText: chk.itemText || chk.title || existingChk.itemText,
                  isCompleted: Boolean(chk.isCompleted),
                  sortOrder: i + 1,
                })
                .where(eq(taskChecklists.id, chk.id));
            }
          } else if (chk.itemText || chk.title) {
            const text = (chk.itemText || chk.title).trim();
            await tx.insert(taskChecklists).values({
              taskId: taskId,
              itemText: text,
              isCompleted: Boolean(chk.isCompleted),
              sortOrder: i + 1,
            });
            await recordHistory(tx, {
              tableName: 'tasks',
              recordId: taskId,
              action: 'CHILD_ADDED',
              changes: [{
                field: 'checklist',
                old: null,
                new: `Added subtask item: "${text}"`,
              }],
              changedById: caller.employeeId,
              changedByName: caller.callerName,
            });
          }
        }
      }

      // Persist Comments if provided
      if (Array.isArray(comments)) {
        const existingComments = await tx.select().from(taskComments).where(eq(taskComments.taskId, taskId));
        const keepCommentIds = new Set(comments.filter(c => c.id && c.id.length === 36).map(c => c.id));
        for (const ec of existingComments) {
          if (!keepCommentIds.has(ec.id)) {
            await tx.delete(taskComments).where(eq(taskComments.id, ec.id));
          }
        }
        for (const c of comments) {
          if (c.id && c.id.length === 36) {
            const content = typeof c === 'string' ? c : (c.content || '');
            if (content && content.trim()) {
              await tx.update(taskComments)
                .set({ content: content.trim() })
                .where(eq(taskComments.id, c.id));
            }
          } else if (!c.id || c.id.startsWith('cmt-') || c.id.startsWith('temp-') || c.id.startsWith('cm-')) {
            const content = typeof c === 'string' ? c : (c.content || '');
            if (content && content.trim()) {
              await tx.insert(taskComments).values({
                taskId: taskId,
                authorName: typeof c === 'object' ? (c.authorName || 'User') : 'User',
                content: content.trim(),
                isSystemLog: typeof c === 'object' ? Boolean(c.isSystemLog) : false,
              });
            }
          }
        }
      }

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

    const [enriched] = await enrichTasks([updatedTask]);
    res.json(enriched || updatedTask);
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
    const updatedTask = await db.transaction(async (tx) => {
      const [resTask] = await tx
        .update(tasks)
        .set({ status: normalizedStatus, updatedAt: new Date() })
        .where(eq(tasks.id, taskId))
        .returning();

      if (resTask && targetTask.status !== normalizedStatus) {
        const caller = await getCallerInfo(req.user, tx);
        await recordHistory(tx, {
          tableName: 'tasks',
          recordId: taskId,
          action: 'STATUS_CHANGED',
          changes: [{ field: 'status', old: targetTask.status, new: normalizedStatus }],
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      return resTask;
    });

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

    const [enriched] = await enrichTasks([updatedTask]);
    res.json(enriched || updatedTask);
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
      await insertNotification({
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

// POST /api/tasks/:id/clone
router.post('/:id/clone', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const id = req.params.id as string;
  try {
    const [sourceTask] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!sourceTask) {
      return res.status(404).json({ message: 'Source task not found' });
    }

    const cloneResult = await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);

      // Preserve exact entity from source task
      const [sourceEntity] = await tx.select().from(entities).where(eq(entities.id, sourceTask.entityId));
      const entityCode = sourceEntity?.code || 'CAG';

      // Derive new task code according to category
      let generatedTaskCode = '';
      if (sourceTask.taskType === 'EPIC_TASK' || sourceTask.epicId) {
        generatedTaskCode = await generateNextGlobalCode('TASK', tx);
      } else if (sourceTask.taskType === 'SPRINT_TASK' || sourceTask.sprintId) {
        generatedTaskCode = await generateNextGlobalCode('STSK', tx);
      } else {
        generatedTaskCode = await generateNextGlobalCode('BLOG', tx);
      }

      // Insert cloned task with server-authenticated creator
      const [clonedTask] = await tx
        .insert(tasks)
        .values({
          taskCode: generatedTaskCode,
          title: `[CLONE] ${sourceTask.title}`,
          description: sourceTask.description ? `[Cloned from ${sourceTask.taskCode}]\n\n${sourceTask.description}` : `Cloned from ${sourceTask.taskCode}`,
          entityId: sourceTask.entityId,
          departmentId: sourceTask.departmentId,
          taskType: sourceTask.taskType,
          sprintWeek: sourceTask.sprintWeek,
          sprintId: sourceTask.sprintId,
          initiativeId: sourceTask.initiativeId,
          epicId: sourceTask.epicId,
          projectId: sourceTask.projectId,
          storyPoints: sourceTask.storyPoints,
          assigneeId: sourceTask.assigneeId,
          creatorId: req.user?.employeeId || sourceTask.creatorId,
          reviewingLeadId: sourceTask.reviewingLeadId,
          status: 'BACKLOG',
          priority: sourceTask.priority,
          dueDate: sourceTask.dueDate,
          deliverableUrl: sourceTask.deliverableUrl,
          createdById: caller.employeeId,
          createdByName: caller.callerName,
        })
        .returning();

      // Clone checklists from source task
      const sourceChecklists = await tx
        .select()
        .from(taskChecklists)
        .where(eq(taskChecklists.taskId, sourceTask.id))
        .orderBy(asc(taskChecklists.sortOrder));

      const clonedChecklists = [];
      for (const c of sourceChecklists) {
        const [clonedItem] = await tx
          .insert(taskChecklists)
          .values({
            taskId: clonedTask.id,
            itemText: c.itemText,
            isCompleted: false, // Reset completion for clone
            sortOrder: c.sortOrder,
          })
          .returning();
        clonedChecklists.push(clonedItem);
      }

      // Add initial system comment
      await tx.insert(taskComments).values({
        taskId: clonedTask.id,
        authorName: 'System Log',
        content: `Cloned from task [${sourceTask.taskCode}] "${sourceTask.title}"`,
        isSystemLog: true,
      });

      // Record CLONED history
      await recordHistory(tx, {
        tableName: 'tasks',
        recordId: clonedTask.id,
        action: 'CLONED',
        changes: [{ field: 'clonedFrom', old: sourceTask.id, new: clonedTask.id }],
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      return {
        ...clonedTask,
        entity: entityCode,
        checklists: clonedChecklists,
      };
    });

    res.status(201).json(cloneResult);
  } catch (err: any) {
    console.error('[TASK CLONE ERROR]:', err);
    res.status(500).json({ message: 'Failed to clone task', error: err.message });
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

    const caller = await getCallerInfo(req.user);
    await recordHistory(db, {
      tableName: 'tasks',
      recordId: id,
      action: 'CHILD_ADDED',
      changes: [{
        field: 'checklist',
        old: null,
        new: `Added subtask item: "${itemText}"`,
      }],
      changedById: caller.employeeId,
      changedByName: caller.callerName,
    });

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

    const caller = await getCallerInfo(req.user);
    if (typeof isCompleted === 'boolean') {
      const verb = isCompleted ? 'Completed' : 'Marked pending';
      await recordHistory(db, {
        tableName: 'tasks',
        recordId: targetTask.id,
        action: 'STATUS_CHANGED',
        changes: [{
          field: 'checklist',
          old: checklist.isCompleted ? 'Completed' : 'Pending',
          new: `${verb} subtask: "${checklist.itemText}"`,
        }],
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });
    }

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

// DELETE /api/tasks/checklists/:checklistId
router.delete('/checklists/:checklistId', async (req, res) => {
  const { checklistId } = req.params;
  try {
    const [checklist] = await db.select().from(taskChecklists).where(eq(taskChecklists.id, checklistId));
    if (!checklist) return res.status(404).json({ message: 'Checklist item not found' });

    const [targetTask] = await db.select().from(tasks).where(eq(tasks.id, checklist.taskId));
    if (!targetTask) return res.status(404).json({ message: 'Task not found' });

    if (req.user?.role === 'EMPLOYEE' && targetTask.assigneeId !== req.user.employeeId) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    await db.delete(taskChecklists).where(eq(taskChecklists.id, checklistId));

    const caller = await getCallerInfo(req.user);
    await recordHistory(db, {
      tableName: 'tasks',
      recordId: targetTask.id,
      action: 'DELETED',
      changes: [{
        field: 'checklist',
        old: `Deleted subtask: "${checklist.itemText}"`,
        new: null,
      }],
      changedById: caller.employeeId,
      changedByName: caller.callerName,
    });

    res.json({ message: 'Checklist item deleted', id: checklistId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete checklist item' });
  }
});

// Helper to extract clean username or full name
function formatDisplayNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) return email || 'User';
  const raw = email.split('@')[0].replace(/[._-]/g, ' ');
  return raw
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// GET /api/tasks/:id/comments (Always ORDER BY created_at ASC)
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await db
      .select()
      .from(taskComments)
      .where(eq(taskComments.taskId, id))
      .orderBy(asc(taskComments.createdAt));

    const allEmployees = await db.select().from(employees);

    const enriched = comments.map((c) => {
      let displayName = c.authorName;

      // Try lookup by authorId
      if (c.authorId) {
        const emp = allEmployees.find((e) => e.id === c.authorId);
        if (emp) {
          const empFullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
          if (empFullName) displayName = empFullName;
        }
      }

      // If displayName still contains an email or is empty
      if (!displayName || displayName.includes('@')) {
        const matchEmp = allEmployees.find(
          (e) => (e.email || '').toLowerCase() === (displayName || '').toLowerCase()
        );
        if (matchEmp) {
          const fullName = `${matchEmp.firstName || ''} ${matchEmp.lastName || ''}`.trim();
          if (fullName) displayName = fullName;
        } else if (displayName && displayName.includes('@')) {
          displayName = formatDisplayNameFromEmail(displayName);
        }
      }

      return {
        ...c,
        authorName: displayName || 'User',
      };
    });

    res.json(enriched);
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

    // Resolve author real name / username
    let authorName = 'User';
    if (req.user?.employeeId) {
      const [emp] = await db.select().from(employees).where(eq(employees.id, req.user.employeeId));
      if (emp) {
        authorName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeCode || '';
      }
    }
    if ((!authorName || authorName === 'User') && req.user?.email) {
      // Check if employee exists by email
      const [emp] = await db.select().from(employees).where(eq(employees.email, req.user.email));
      if (emp) {
        authorName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
      } else {
        authorName = formatDisplayNameFromEmail(req.user.email);
      }
    }

    const [newComment] = await db
      .insert(taskComments)
      .values({
        taskId: id,
        authorId: req.user?.employeeId || null,
        authorName: authorName || 'User',
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

// PATCH /api/tasks/comments/:commentId
router.patch('/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: 'content is required' });

  try {
    const [comment] = await db.select().from(taskComments).where(eq(taskComments.id, commentId));
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isAuthor = Boolean(comment.authorId && req.user?.employeeId && comment.authorId === req.user.employeeId);
    const isManagerOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'MANAGER';
    if (!isAuthor && !isManagerOrAdmin && req.user?.role === 'EMPLOYEE') {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    const [updated] = await db
      .update(taskComments)
      .set({ content: content.trim() })
      .where(eq(taskComments.id, commentId))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// DELETE /api/tasks/comments/:commentId
router.delete('/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  try {
    const [comment] = await db.select().from(taskComments).where(eq(taskComments.id, commentId));
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isAuthor = Boolean(comment.authorId && req.user?.employeeId && comment.authorId === req.user.employeeId);
    const isManagerOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'MANAGER';
    if (!isAuthor && !isManagerOrAdmin && req.user?.role === 'EMPLOYEE') {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await db.delete(taskComments).where(eq(taskComments.id, commentId));

    res.json({ message: 'Comment deleted', id: commentId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment' });
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
      const caller = await getCallerInfo(req.user, tx);
      await recordHistory(tx, {
        tableName: 'tasks',
        recordId: taskId,
        action: 'DELETED',
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

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
