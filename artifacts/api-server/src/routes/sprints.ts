import { Router } from 'express';
import { db, sprints, employees, entities, epics, tasks, users, notifications, taskChecklists, taskComments, taskNotes, entityCounters, generateNextGlobalCode, eq, inArray, isNull, sql, and, recordHistory } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getCallerInfo } from '../utils/userSnapshot.js';
import { insertNotification } from '../services/notificationService.js';
import { dispatchNotification } from '../services/notificationDispatcher.js';

const router = Router();

router.use(requireAuth);

// GET /api/sprints - View all sprints for all authenticated roles
router.get('/', async (req, res) => {
  try {
    const { employeeId, includeDeleted } = req.query;
    const conditions: any[] = [];
    if (includeDeleted !== 'true') {
      conditions.push(isNull(sprints.deletedAt));
    }
    if (employeeId && typeof employeeId === 'string') {
      conditions.push(eq(sprints.employeeId, employeeId));
    }

    const allSprints = await db
      .select()
      .from(sprints)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`LOWER(${sprints.name}) ASC`);

    const allTasks = await db
      .select()
      .from(tasks)
      .where(includeDeleted !== 'true' ? isNull(tasks.deletedAt) : undefined);
    const allEmployees = await db.select().from(employees);
    const allEpics = await db.select().from(epics);
    const allEntities = await db.select().from(entities);

    const enriched = allSprints.map(sprint => {
      const creatorEmp = allEmployees.find(e => e.id === sprint.createdById);
      const creatorName = sprint.createdByName || (creatorEmp ? `${creatorEmp.firstName || ''} ${creatorEmp.lastName || ''}`.trim() : null);
      const sprintTasks = allTasks.filter(t => t.sprintId === sprint.id);
      const sprintEmp = allEmployees.find(e => e.id === sprint.employeeId);
      const sprintEpic = allEpics.find(e => e.id === sprint.epicId);
      const sprintEntity = allEntities.find(ent => ent.id === (sprint.entityId || sprintEmp?.entityId));
      const resolvedEntity = sprintEntity?.code === 'CAG'
        ? 'CLIMAGRO'
        : sprintEntity?.code === 'COMMON'
        ? 'COMMON'
        : 'EHM';
      const resolvedCode = sprintEntity?.code || (resolvedEntity === 'CLIMAGRO' ? 'CAG' : resolvedEntity === 'COMMON' ? 'COMMON' : 'EHM');

      return {
        ...sprint,
        createdByName: creatorName,
        entity: resolvedEntity,
        entityCode: resolvedCode,
        entityName: sprintEntity?.name || (resolvedEntity === 'CLIMAGRO' ? 'Climagro Analytics' : resolvedEntity === 'COMMON' ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
        tasks: sprintTasks,
        tasksCount: sprintTasks.length,
        employeeName: sprintEmp ? `${sprintEmp.firstName} ${sprintEmp.lastName}` : 'Unassigned',
        employeeCode: sprintEmp?.employeeCode || 'EMP00',
        designation: sprintEmp?.designation || 'Team Member',
        epicTitle: sprintEpic?.title || 'Standalone Sprint',
      };
    });

    enriched.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

    res.json(enriched);
  } catch (err: any) {
    console.error('[FETCH SPRINTS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch sprints' });
  }
});

// POST /api/sprints - Manager creation of personal employee sprints with atomic sprintCode
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { employeeId, name, startDate, endDate, goal, epicId, reviewingLeadId, department, targetWeek, status } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: 'employeeId (Personal Sprint Owner) is required' });
  }

  try {
    const created = await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);

      // 1. Fetch Target Employee & Entity
      const [emp] = await tx.select().from(employees).where(eq(employees.id, employeeId));
      if (!emp) throw new Error('Target employee for sprint not found');

      const [entity] = await tx.select().from(entities).where(eq(entities.id, emp.entityId));
      if (!entity) throw new Error('Entity not found');

      // Atomic counter for Sprint sequence on global_counters
      const sprintCode = await generateNextGlobalCode('SPRT', tx);

      // 3. Insert Personal Sprint with server-authenticated created_by
      const [newSprint] = await tx
        .insert(sprints)
        .values({
          sprintCode,
          entityId: emp.entityId,
          departmentId: emp.departmentId,
          employeeId: emp.id,
          epicId: epicId || null,
          reviewingLeadId: reviewingLeadId || null,
          department: department || '',
          targetWeek: targetWeek || 'Week 1 (Days 1–7)',
          name: name || `Sprint ${sprintCode}`,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : new Date(Date.now() + 14 * 86400000), // Default 2 weeks
          status: (() => {
            const raw = (status || 'PLANNED').toString().toUpperCase();
            if (raw === 'DONE' || raw === 'COMPLETED') return 'COMPLETED';
            if (raw === 'IN_PROGRESS' || raw === 'ACTIVE' || raw === 'TODO' || raw === 'TO_REVIEW') return 'ACTIVE';
            return 'PLANNED';
          })(),
          goal: goal || '',
          createdById: caller.employeeId,
          createdByName: caller.callerName,
        })
        .returning();

      // 4. Record history for Sprint creation
      await recordHistory(tx, {
        tableName: 'sprints',
        recordId: newSprint.id,
        action: 'CREATED',
        changes: [{ field: 'name', old: null, new: newSprint.name }],
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      // 5. Record CHILD_ADDED on parent Epic if linked
      if (newSprint.epicId) {
        await recordHistory(tx, {
          tableName: 'epics',
          recordId: newSprint.epicId,
          action: 'CHILD_ADDED',
          changes: [{ field: 'sprint', old: null, new: `Sprint added: ${newSprint.name}` }],
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      // Targeted notification: Sprint Assigned → sprint owner ONLY (not reviewing lead at creation time)
      dispatchNotification({
        entity: {
          entityType: 'SPRINT',
          entityId: newSprint.id,
          entityCode: newSprint.sprintCode,
          title: newSprint.name,
          assigneeEmployeeIds: [emp.id], // emp = the sprint owner
          reviewingLeadEmployeeId: null,  // Lead is intentionally NOT notified at creation
          creatorEmployeeId: caller.employeeId,
        },
        actorUserId: req.user!.id,
        eventType: 'SPRINT_ASSIGNED',
        title: `New Sprint Assigned: [${newSprint.sprintCode}] "${newSprint.name}"`,
        message: `You have been assigned to sprint [${newSprint.sprintCode}] "${newSprint.name}" (${newSprint.targetWeek || 'Week 1'}).`,
      });

      return newSprint;
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error('[CREATE SPRINT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create sprint' });
  }
});

// Helper for sprint updates
async function handleSprintUpdate(req: any, res: any) {
  const sprintId = req.params.id as string;
  const { name, goal, startDate, endDate, status, targetWeek, department, epicId, reviewingLeadId, entityId, entity } = req.body;

  try {
    const updated = await db.transaction(async (tx) => {
      const [oldSprint] = await tx.select().from(sprints).where(eq(sprints.id, sprintId));
      if (!oldSprint) return null;

      const updatePayload: any = {};
      if (name !== undefined) updatePayload.name = name;
      if (goal !== undefined) updatePayload.goal = goal;
      if (startDate !== undefined) updatePayload.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updatePayload.endDate = endDate ? new Date(endDate) : null;
      if (status !== undefined) updatePayload.status = status;
      if (targetWeek !== undefined) updatePayload.targetWeek = targetWeek || null;
      if (department !== undefined) updatePayload.department = department;
      if (epicId !== undefined) updatePayload.epicId = epicId || null;
      if (reviewingLeadId !== undefined) updatePayload.reviewingLeadId = reviewingLeadId || null;

      if (entityId || entity) {
        const entTarget = String(entityId || entity || '').toLowerCase().trim();
        const allEnts = await tx.select().from(entities);
        const matched = allEnts.find((e: any) => {
          if (e.id === entityId) return true;
          if (entTarget === 'common' || entTarget.includes('common') || entTarget.includes('both') || entTarget.includes('&')) {
            return e.code === 'COMMON' || e.name.toLowerCase().includes('common');
          }
          if (entTarget === 'cag' || entTarget === 'climagro' || entTarget.includes('climagro')) {
            return e.code === 'CAG';
          }
          if (entTarget === 'ehm' || (!entTarget.includes('&') && entTarget.includes('ehm'))) {
            return e.code === 'EHM';
          }
          return e.code.toLowerCase() === entTarget || e.name.toLowerCase().includes(entTarget);
        });
        if (matched) updatePayload.entityId = matched.id;
      }

      const [resSprint] = await tx
        .update(sprints)
        .set(updatePayload)
        .where(eq(sprints.id, sprintId))
        .returning();

      // Record changed fields in history
      const caller = await getCallerInfo(req.user, tx);
      const changes: { field: string; old: any; new: any }[] = [];
      for (const [key, newVal] of Object.entries(updatePayload)) {
        if (key.toLowerCase() === 'updatedat' || key.toLowerCase() === 'updated_at' || key.toLowerCase() === 'createdat' || key.toLowerCase() === 'created_at') continue;
        const oldVal = (oldSprint as any)[key];
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
          tableName: 'sprints',
          recordId: sprintId,
          action: 'UPDATED',
          changes,
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      // Bidirectional sync: keep linked tasks updated when sprint is updated
      if (updatePayload.status !== undefined || updatePayload.name !== undefined) {
        const taskUpdate: any = { updatedAt: new Date() };
        if (updatePayload.status !== undefined) {
          const s = String(updatePayload.status).toUpperCase().trim();
          taskUpdate.status = s === 'DONE' ? 'DONE' : (s === 'IN_REVIEW' || s === 'TO_REVIEW' || s === 'TO REVIEW') ? 'TO_REVIEW' : (s === 'IN_PROGRESS' || s === 'IN PROGRESS') ? 'IN_PROGRESS' : s === 'PLANNED' ? 'PLANNED' : 'BACKLOG';
        }
        try {
          await tx.update(tasks).set(taskUpdate).where(eq(tasks.sprintId, sprintId));
        } catch (taskErr) {
          console.error('[SPRINT-TASK STATUS SYNC ERROR]:', taskErr);
        }
      }

      return resSprint;
    });

    if (!updated) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[UPDATE SPRINT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update sprint' });
  }
}

// PUT /api/sprints/:id - Manager/Admin protected sprint properties update
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), handleSprintUpdate);

// PATCH /api/sprints/:id
router.patch('/:id', requireRole(['ADMIN', 'MANAGER']), handleSprintUpdate);

// DELETE /api/sprints/:id - Admin & Manager protected sprint soft-deletion
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const sprintId = req.params.id as string;
  try {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, sprintId));
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);
      await recordHistory(tx, {
        tableName: 'sprints',
        recordId: sprintId,
        action: 'DELETED',
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      const now = new Date();

      // Soft delete sprint: sets deletedAt timestamp, NEVER drops rows
      await tx.update(sprints).set({ deletedAt: now }).where(eq(sprints.id, sprintId));

      // Also soft-delete linked tasks (preserves checklists, comments and history!)
      const linkedTasks = await tx.select({ id: tasks.id }).from(tasks).where(eq(tasks.sprintId, sprintId));
      const taskIds = linkedTasks.map(t => t.id);
      if (taskIds.length > 0) {
        await tx.update(tasks).set({ deletedAt: now, updatedAt: now }).where(inArray(tasks.id, taskIds));
      }
    });

    res.json({ message: `Sprint ${sprint.sprintCode || sprint.name} soft-deleted successfully`, id: sprintId });
  } catch (err: any) {
    console.error('[DELETE SPRINT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete sprint' });
  }
});

// POST /api/sprints/:id/restore - Admin & Manager protected sprint restore
router.post('/:id/restore', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const sprintId = req.params.id as string;
  try {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, sprintId));
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);
      await tx.update(sprints).set({ deletedAt: null }).where(eq(sprints.id, sprintId));

      // Restore linked tasks
      await tx.update(tasks).set({ deletedAt: null, updatedAt: new Date() }).where(eq(tasks.sprintId, sprintId));

      await recordHistory(tx, {
        tableName: 'sprints',
        recordId: sprintId,
        action: 'RESTORED',
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });
    });

    res.json({ message: `Sprint ${sprint.sprintCode || sprint.name} restored successfully`, id: sprintId });
  } catch (err: any) {
    console.error('[RESTORE SPRINT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to restore sprint' });
  }
});

export default router;
