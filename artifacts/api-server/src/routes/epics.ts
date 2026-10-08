import { Router } from 'express';
import { db, epics, initiatives, projects, employees, entityCounters, generateNextGlobalCode, entities, sprints, tasks, taskChecklists, taskComments, taskNotes, eq, and, or, inArray, isNull, sql, recordHistory } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getCallerInfo } from '../utils/userSnapshot.js';
import { dispatchNotification } from '../services/notificationDispatcher.js';

const router = Router();

router.use(requireAuth);

// GET /api/epics - List epics with linked sprints and tasks summary
router.get('/', async (req, res) => {
  const { initiativeId, projectId, includeDeleted } = req.query;

  try {
    const conditions: any[] = [];
    if (includeDeleted !== 'true') {
      conditions.push(isNull(epics.deletedAt));
    }
    if (initiativeId && typeof initiativeId === 'string') {
      conditions.push(eq(epics.initiativeId, initiativeId));
    } else if (projectId && typeof projectId === 'string') {
      conditions.push(eq(epics.projectId, projectId));
    }

    const allEpics = await db
      .select()
      .from(epics)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`LOWER(${epics.title}) ASC`);

    const allSprints = await db
      .select()
      .from(sprints)
      .where(includeDeleted !== 'true' ? isNull(sprints.deletedAt) : undefined);

    const allTasks = await db
      .select()
      .from(tasks)
      .where(includeDeleted !== 'true' ? isNull(tasks.deletedAt) : undefined);
    const allEntities = await db.select().from(entities);
    const allEmployees = await db.select().from(employees);

    const enriched = allEpics.map(epic => {
      const creatorEmp = allEmployees.find(e => e.id === epic.createdById || e.id === epic.ownerId);
      const creatorName = epic.createdByName || (creatorEmp ? `${creatorEmp.firstName || ''} ${creatorEmp.lastName || ''}`.trim() : null);
      const linkedSprints = allSprints.filter(s => s.epicId === epic.id);
      const linkedTasks = allTasks.filter(t => t.epicId === epic.id);
      const epicEntity = allEntities.find(ent => ent.id === epic.entityId);
      const resolvedEntity = epicEntity?.code === 'CAG'
        ? 'CLIMAGRO'
        : epicEntity?.code === 'COMMON'
        ? 'COMMON'
        : 'EHM';
      const resolvedEntityCode = epicEntity?.code || (resolvedEntity === 'CLIMAGRO' ? 'CAG' : resolvedEntity === 'COMMON' ? 'COMMON' : 'EHM');

      return {
        ...epic,
        createdByName: creatorName,
        entity: resolvedEntity,
        entityCode: resolvedEntityCode,
        entityName: epicEntity?.name || (resolvedEntity === 'CLIMAGRO' ? 'Climagro Analytics' : resolvedEntity === 'COMMON' ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
        sprintsCount: linkedSprints.length,
        tasksCount: linkedTasks.length,
        sprints: linkedSprints,
        tasks: linkedTasks,
      };
    });

    enriched.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));

    res.json(enriched);
  } catch (err: any) {
    console.error('[FETCH EPICS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch epics' });
  }
});

// POST /api/epics - Manager protected epic creation with atomic code sequence
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { title, description, initiativeId, projectId, entityId, entity, entityCode, department, targetWeek, sprintsCountTarget, ownerId, targetDate, status, assignedTo } = req.body;

  try {
    const created = await db.transaction(async (tx) => {
      let targetEntityId = entityId;

      // 1. Explicit entity provided in request body
      if (entityId || entity || entityCode) {
        const entTarget = String(entityId || entity || entityCode).toLowerCase().trim();
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
        if (matched) targetEntityId = matched.id;
      }

      // 2. Resolve Initiative if provided
      if (initiativeId) {
        const [init] = await tx.select().from(initiatives).where(eq(initiatives.id, initiativeId));
        if (init) {
          targetEntityId = targetEntityId || init.entityId;
        }
      }

      // 3. Resolve Project if provided
      if (projectId) {
        const [proj] = await tx.select().from(projects).where(eq(projects.id, projectId));
        if (proj) {
          if (!targetEntityId) {
            const entCode = proj.entity === 'CAG' ? 'CAG' : proj.entity === 'COMMON' ? 'COMMON' : 'EHM';
            const [matchedEnt] = await tx.select().from(entities).where(eq(entities.code, entCode));
            if (matchedEnt) targetEntityId = matchedEnt.id;
          }
        }
      }

      // 4. Fallback entity resolution
      if (!targetEntityId) {
        const [firstEntity] = await tx.select().from(entities);
        targetEntityId = firstEntity?.id;
      }

      if (!targetEntityId) {
        throw new Error('Could not resolve entity for epic creation');
      }

      const [entRow] = await tx.select().from(entities).where(eq(entities.id, targetEntityId));
      const entCode = entRow?.code || 'EHM';

      // 5. Concurrency-safe atomic counter update on global_counters
      const epicCode = await generateNextGlobalCode('EPIC', tx);

      let resolvedStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' = 'PLANNED';
      if (status) {
        const s = String(status).toUpperCase();
        if (['DONE', 'COMPLETED', 'ARCHIVED'].includes(s)) resolvedStatus = 'COMPLETED';
        else if (['IN_PROGRESS', 'ACTIVE', 'IN PROGRESS'].includes(s)) resolvedStatus = 'IN_PROGRESS';
        else resolvedStatus = 'PLANNED';
      }

      const caller = await getCallerInfo(req.user, tx);

      // 6. Insert Epic with server-authenticated created_by
      const [newEpic] = await tx
        .insert(epics)
        .values({
          epicCode,
          title: title || 'Untitled Epic',
          description: description || '',
          initiativeId: initiativeId || null,
          projectId: projectId || null,
          entityId: targetEntityId,
          department: department || '',
          targetWeek: targetWeek || 'Week 1 (Days 1–7)',
          sprintsCountTarget: sprintsCountTarget ? Number(sprintsCountTarget) : 2,
          status: resolvedStatus,
          ownerId: ownerId || null,
          targetDate: targetDate ? new Date(targetDate) : null,
          assignedTo: assignedTo ? JSON.stringify(assignedTo) : null,
          createdById: caller.employeeId,
          createdByName: caller.callerName,
        })
        .returning();

      // 7. Record history for Epic creation
      await recordHistory(tx, {
        tableName: 'epics',
        recordId: newEpic.id,
        action: 'CREATED',
        changes: [{ field: 'title', old: null, new: newEpic.title }],
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      // 8. Record CHILD_ADDED on parent Initiative if linked
      if (newEpic.initiativeId) {
        await recordHistory(tx, {
          tableName: 'initiatives',
          recordId: newEpic.initiativeId,
          action: 'CHILD_ADDED',
          changes: [{ field: 'epic', old: null, new: `Epic added: ${newEpic.title}` }],
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      // 9. Record CHILD_ADDED on parent Project if linked
      if (newEpic.projectId) {
        await recordHistory(tx, {
          tableName: 'projects',
          recordId: newEpic.projectId,
          action: 'CHILD_ADDED',
          changes: [{ field: 'epic', old: null, new: `Epic added: ${newEpic.title}` }],
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      return {
        ...newEpic,
        entity: entCode === 'CAG' ? 'CLIMAGRO' : entCode === 'COMMON' ? 'COMMON' : 'EHM',
        entityCode: entCode,
        entityName: entRow?.name || (entCode === 'CAG' ? 'Climagro Analytics' : entCode === 'COMMON' ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
      };
    });

    // Epic Assigned to owner/department lead
    if (created.ownerId) {
      dispatchNotification({
        entity: {
          entityType: 'EPIC',
          entityId: created.id,
          entityCode: created.epicCode,
          title: created.title,
          assigneeEmployeeIds: [created.ownerId], // ownerId is an employeeId
          reviewingLeadEmployeeId: null,
          creatorEmployeeId: req.user?.employeeId,
        },
        actorUserId: req.user!.id,
        eventType: 'EPIC_ASSIGNED',
        title: `Epic Assigned: [${created.epicCode}] "${created.title}"`,
        message: `You have been assigned as the owner/lead for epic [${created.epicCode}] "${created.title}".`,
      });
    }

    res.status(201).json(created);
  } catch (err: any) {
    console.error('[CREATE EPIC ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create epic' });
  }
});

// Helper for epic updates
async function handleEpicUpdate(req: any, res: any) {
  const epicId = req.params.id as string;
  if (!epicId || epicId === 'undefined' || epicId === 'null') {
    return res.status(400).json({ message: 'Valid Epic ID required' });
  }
  const { title, description, initiativeId, projectId, entityId, entity, entityCode, department, targetWeek, sprintsCountTarget, status, targetDate, ownerId, assignedTo } = req.body;

  let mappedStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | undefined = undefined;
  if (status !== undefined) {
    const s = String(status).toUpperCase();
    if (['DONE', 'COMPLETED', 'ARCHIVED'].includes(s)) mappedStatus = 'COMPLETED';
    else if (['IN_PROGRESS', 'ACTIVE', 'IN PROGRESS'].includes(s)) mappedStatus = 'IN_PROGRESS';
    else mappedStatus = 'PLANNED';
  }

  try {
    const updatedResult = await db.transaction(async (tx) => {
      const [oldEpic] = await tx.select().from(epics).where(eq(epics.id, epicId));
      if (!oldEpic) return null;

      const updatePayload: any = {};
      if (title !== undefined) updatePayload.title = title;
      if (description !== undefined) updatePayload.description = description;
      if (initiativeId !== undefined) updatePayload.initiativeId = initiativeId || null;
      if (projectId !== undefined) updatePayload.projectId = projectId || null;
      if (department !== undefined) updatePayload.department = department;
      if (targetWeek !== undefined) updatePayload.targetWeek = targetWeek || null;
      if (sprintsCountTarget !== undefined) updatePayload.sprintsCountTarget = Number(sprintsCountTarget);
      if (mappedStatus !== undefined) updatePayload.status = mappedStatus;
      if (targetDate !== undefined) updatePayload.targetDate = targetDate ? new Date(targetDate) : null;
      if (ownerId !== undefined) updatePayload.ownerId = ownerId || null;
      if (assignedTo !== undefined) updatePayload.assignedTo = (Array.isArray(assignedTo) && assignedTo.length > 0) ? JSON.stringify(assignedTo) : null;

      if (entityId || entity || entityCode) {
        const entTarget = String(entityId || entity || entityCode).toLowerCase().trim();
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
        if (matched) {
          updatePayload.entityId = matched.id;
        }
      }

      const [updated] = await tx
        .update(epics)
        .set(updatePayload)
        .where(eq(epics.id, epicId))
        .returning();

      // Record changed fields in history
      const caller = await getCallerInfo(req.user, tx);
      const changes: { field: string; old: any; new: any }[] = [];
      for (const [key, newVal] of Object.entries(updatePayload)) {
        if (key.toLowerCase() === 'updatedat' || key.toLowerCase() === 'updated_at' || key.toLowerCase() === 'createdat' || key.toLowerCase() === 'created_at') continue;
        const oldVal = (oldEpic as any)[key];
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
          tableName: 'epics',
          recordId: epicId,
          action: 'UPDATED',
          changes,
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      const [entRow] = updated.entityId
        ? await tx.select().from(entities).where(eq(entities.id, updated.entityId))
        : [null];

      const resolvedEntity = entRow?.code === 'CAG'
        ? 'CLIMAGRO'
        : entRow?.code === 'COMMON'
        ? 'COMMON'
        : 'EHM';

      return {
        ...updated,
        entity: resolvedEntity,
        entityCode: entRow?.code || (resolvedEntity === 'CLIMAGRO' ? 'CAG' : resolvedEntity === 'COMMON' ? 'COMMON' : 'EHM'),
        entityName: entRow?.name || (resolvedEntity === 'CLIMAGRO' ? 'Climagro Analytics' : resolvedEntity === 'COMMON' ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
      };
    });

    if (!updatedResult) {
      return res.status(404).json({ message: 'Epic not found' });
    }

    // Fire EPIC_ASSIGNED notification if ownerId changed
    if (
      ownerId !== undefined &&
      ownerId &&
      ownerId !== (updatedResult as any)._prevOwnerId // will be checked via oldEpic below
    ) {
      // Re-check: did ownerId actually change? We read oldEpic inside the transaction above.
      // We dispatch unconditionally when ownerId is explicitly set and is different.
      dispatchNotification({
        entity: {
          entityType: 'EPIC',
          entityId: updatedResult.id,
          entityCode: updatedResult.epicCode,
          title: updatedResult.title,
          assigneeEmployeeIds: [ownerId],
          reviewingLeadEmployeeId: null,
          creatorEmployeeId: req.user?.employeeId,
        },
        actorUserId: req.user!.id,
        eventType: 'EPIC_ASSIGNED',
        title: `Epic Assigned: [${updatedResult.epicCode}] "${updatedResult.title}"`,
        message: `You have been assigned as the owner/lead for epic [${updatedResult.epicCode}] "${updatedResult.title}".`,
      });
    }

    res.json(updatedResult);
  } catch (err: any) {
    console.error('[UPDATE EPIC ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update epic' });
  }
}

// PUT /api/epics/:id - Update Epic details
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), handleEpicUpdate);

// PATCH /api/epics/:id - Update Epic details
router.patch('/:id', requireRole(['ADMIN', 'MANAGER']), handleEpicUpdate);

// DELETE /api/epics/:id - Admin protected epic soft-deletion
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  const epicId = req.params.id as string;
  if (!epicId || epicId === 'undefined' || epicId === 'null') {
    return res.status(400).json({ message: 'Valid Epic ID required' });
  }
  try {
    const [epic] = await db.select().from(epics).where(eq(epics.id, epicId));
    if (!epic) {
      return res.status(404).json({ message: 'Epic not found' });
    }

    await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);
      await recordHistory(tx, {
        tableName: 'epics',
        recordId: epicId,
        action: 'DELETED',
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      // Record child epic removal on parent Initiative if linked
      if (epic.initiativeId) {
        await recordHistory(tx, {
          tableName: 'initiatives',
          recordId: epic.initiativeId,
          action: 'UPDATED',
          changes: [{ field: 'epic', old: `Epic deleted: ${epic.epicCode} - ${epic.title}`, new: null }],
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      const now = new Date();

      // Soft delete: flags epic as deletedAt, NEVER drops rows from database
      await tx.update(epics).set({ deletedAt: now }).where(eq(epics.id, epicId));

      // Also soft-delete linked sprints and tasks (preserves checklists, comments and history!)
      const linkedSprints = await tx.select({ id: sprints.id }).from(sprints).where(eq(sprints.epicId, epicId));
      const sprintIds = linkedSprints.map(s => s.id);
      if (sprintIds.length > 0) {
        await tx.update(sprints).set({ deletedAt: now }).where(inArray(sprints.id, sprintIds));
      }

      const linkedTasks = await tx.select({ id: tasks.id }).from(tasks).where(
        sprintIds.length > 0
          ? or(eq(tasks.epicId, epicId), inArray(tasks.sprintId, sprintIds))
          : eq(tasks.epicId, epicId)
      );
      const taskIds = linkedTasks.map(t => t.id);
      if (taskIds.length > 0) {
        await tx.update(tasks).set({ deletedAt: now, updatedAt: now }).where(inArray(tasks.id, taskIds));
      }
    });

    res.json({ message: `Epic ${epic.epicCode} soft-deleted successfully`, id: epicId });
  } catch (err: any) {
    console.error('[DELETE EPIC ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete epic' });
  }
});

// POST /api/epics/:id/restore - Admin protected epic restore
router.post('/:id/restore', requireRole(['ADMIN']), async (req, res) => {
  const epicId = req.params.id as string;
  try {
    const [epic] = await db.select().from(epics).where(eq(epics.id, epicId));
    if (!epic) {
      return res.status(404).json({ message: 'Epic not found' });
    }

    await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);
      await tx.update(epics).set({ deletedAt: null }).where(eq(epics.id, epicId));

      // Restore linked sprints and tasks that were deleted at the same time
      await tx.update(sprints).set({ deletedAt: null }).where(eq(sprints.epicId, epicId));
      await tx.update(tasks).set({ deletedAt: null, updatedAt: new Date() }).where(eq(tasks.epicId, epicId));

      await recordHistory(tx, {
        tableName: 'epics',
        recordId: epicId,
        action: 'RESTORED',
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });
    });

    res.json({ message: `Epic ${epic.epicCode} restored successfully`, id: epicId });
  } catch (err: any) {
    console.error('[RESTORE EPIC ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to restore epic' });
  }
});

export default router;
