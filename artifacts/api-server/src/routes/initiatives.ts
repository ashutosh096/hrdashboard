import { Router } from 'express';
import { db, initiatives, entityCounters, generateNextGlobalCode, entities, departments, employees, epics, tasks, eq, isNull, sql, recordHistory } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getCallerInfo } from '../utils/userSnapshot.js';
import { dispatchNotification } from '../services/notificationDispatcher.js';

const router = Router();

router.use(requireAuth);

// GET /api/initiatives - Fetch list of initiatives with linked epics count
router.get('/', async (req, res) => {
  try {
    const { includeDeleted } = req.query;
    let query = db
      .select({
        id: initiatives.id,
        initiativeCode: initiatives.initiativeCode,
        title: initiatives.title,
        description: initiatives.description,
        status: initiatives.status,
        entityId: initiatives.entityId,
        departmentId: initiatives.departmentId,
        subDepartment: initiatives.subDepartment,
        targetMonth: initiatives.targetMonth,
        epicsCountTarget: initiatives.epicsCountTarget,
        targetDeliverableMetric: initiatives.targetDeliverableMetric,
        ownerId: initiatives.ownerId,
        targetDate: initiatives.targetDate,
        createdAt: initiatives.createdAt,
        createdById: initiatives.createdById,
        createdByName: initiatives.createdByName,
      })
      .from(initiatives);

    if (includeDeleted !== 'true') {
      query = query.where(isNull(initiatives.deletedAt)) as any;
    }

    const allInitiatives = await query.orderBy(sql`LOWER(${initiatives.title}) ASC`);

    const allEpics = await db
      .select()
      .from(epics)
      .where(includeDeleted !== 'true' ? isNull(epics.deletedAt) : undefined);
    const allEntities = await db.select().from(entities);
    const allDepts = await db.select().from(departments);
    const allEmployees = await db.select().from(employees);

    const enriched = allInitiatives.map(init => {
      const creatorEmp = allEmployees.find(e => e.id === init.createdById || e.id === init.ownerId);
      const creatorName = init.createdByName || (creatorEmp ? `${creatorEmp.firstName || ''} ${creatorEmp.lastName || ''}`.trim() : null);
      const entity = allEntities.find(e => e.id === init.entityId);
      const dept = allDepts.find(d => d.id === init.departmentId);
      const linkedEpics = allEpics.filter(e => e.initiativeId === init.id);
      const resolvedEntity = entity?.code === 'CAG'
        ? 'CLIMAGRO'
        : entity?.code === 'COMMON'
        ? 'COMMON'
        : 'EHM';
      const resolvedCode = entity?.code || (resolvedEntity === 'CLIMAGRO' ? 'CAG' : resolvedEntity === 'COMMON' ? 'COMMON' : 'EHM');

      return {
        ...init,
        createdByName: creatorName,
        entity: resolvedEntity,
        entityName: entity?.name || (resolvedEntity === 'CLIMAGRO' ? 'Climagro Analytics' : resolvedEntity === 'COMMON' ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
        entityCode: resolvedCode,
        departmentName: dept?.name || init.subDepartment || 'Product & Tech',
        epicsCount: linkedEpics.length,
        epics: linkedEpics,
      };
    });

    enriched.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));

    res.json(enriched);
  } catch (err: any) {
    console.error('[FETCH INITIATIVES ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch initiatives' });
  }
});

// POST /api/initiatives - Manager protected initiative creation with atomic sequence code
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { title, description, entityId, departmentId, subDepartment, targetMonth, epicsCountTarget, targetDeliverableMetric, ownerId, targetDate, status } = req.body;

  try {
    const created = await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);

      // 1. Resolve Entity ID and Entity Code safely
      const allEntities = await tx.select().from(entities);
      let entity = allEntities.find(e =>
        e.id === entityId ||
        e.code.toLowerCase() === (entityId || '').toLowerCase() ||
        e.name.toLowerCase().replace(/\s+/g, '').includes((entityId || '').toLowerCase().replace(/\s+/g, '')) ||
        ((entityId || '').toLowerCase().includes('ehm') && e.code === 'EHM') ||
        ((entityId || '').toLowerCase().includes('climagro') && e.code === 'CAG')
      );

      if (!entity) {
        entity = allEntities[0];
      }

      if (!entity) throw new Error('No entity found in database');

      const targetEntityId = entity.id;

      // 2. Concurrency-safe atomic update on global_counters
      const initiativeCode = await generateNextGlobalCode('INIT', tx);

      // 3. Insert Initiative with server-authenticated created_by
      const [newInitiative] = await tx
        .insert(initiatives)
        .values({
          initiativeCode,
          entityId: targetEntityId,
          departmentId: departmentId || null,
          subDepartment: subDepartment || '',
          title: title || 'Untitled Initiative',
          description: description || '',
          targetMonth: targetMonth || 'Month 1 (Weeks 1–4)',
          epicsCountTarget: epicsCountTarget ? Number(epicsCountTarget) : 3,
          targetDeliverableMetric: targetDeliverableMetric || '',
          status: status || 'PLANNED',
          ownerId: ownerId || null,
          targetDate: targetDate ? new Date(targetDate) : null,
          createdById: caller.employeeId,
          createdByName: caller.callerName,
        })
        .returning();

      // 4. Record history for creation
      await recordHistory(tx, {
        tableName: 'initiatives',
        recordId: newInitiative.id,
        action: 'CREATED',
        changes: [{ field: 'title', old: null, new: newInitiative.title }],
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      return newInitiative;
    });

    const caller = await getCallerInfo(req.user);
    dispatchNotification({
      entity: {
        entityType: 'INITIATIVE',
        entityId: created.id,
        entityCode: created.initiativeCode,
        title: created.title,
        assigneeEmployeeIds: created.ownerId ? [created.ownerId] : [],
        reviewingLeadEmployeeId: null,
        creatorEmployeeId: req.user?.employeeId,
      },
      actorUserId: req.user!.id,
      actorName: caller.callerName,
      eventType: 'CREATED',
      title: created.title,
      message: `New Initiative '${created.title}' created by ${caller.callerName || 'a team member'}`,
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error('[CREATE INITIATIVE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create initiative' });
  }
});

// Helper for initiative updates
async function handleInitiativeUpdate(req: any, res: any) {
  const initId = req.params.id as string;
  const { status, title, description, targetMonth, epicsCountTarget, targetDeliverableMetric, subDepartment, entityId, targetDate, ownerId } = req.body;

  let mappedStatus: 'PLANNED' | 'ACTIVE' | 'DONE' | undefined = undefined;
  if (status === 'IN_PROGRESS' || status === 'ACTIVE') mappedStatus = 'ACTIVE';
  else if (status === 'COMPLETED' || status === 'DONE' || status === 'ARCHIVED') mappedStatus = 'DONE';
  else if (status === 'PLANNED') mappedStatus = 'PLANNED';

  try {
    const updated = await db.transaction(async (tx) => {
      const [oldInit] = await tx.select().from(initiatives).where(eq(initiatives.id, initId));
      if (!oldInit) return null;

      const updatePayload: any = {};
      if (mappedStatus !== undefined) updatePayload.status = mappedStatus;
      if (title !== undefined) updatePayload.title = title;
      if (description !== undefined) updatePayload.description = description;
      if (targetMonth !== undefined) updatePayload.targetMonth = targetMonth || null;
      if (epicsCountTarget !== undefined) updatePayload.epicsCountTarget = Number(epicsCountTarget);
      if (targetDeliverableMetric !== undefined) updatePayload.targetDeliverableMetric = targetDeliverableMetric;
      if (subDepartment !== undefined) updatePayload.subDepartment = subDepartment;
      if (targetDate !== undefined) updatePayload.targetDate = targetDate ? new Date(targetDate) : null;
      if (ownerId !== undefined) updatePayload.ownerId = ownerId || null;

      if (entityId !== undefined) {
        const entTarget = String(entityId || '').toLowerCase().trim();
        const allEntities = await tx.select().from(entities);
        let entity = allEntities.find((e: any) => {
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
        if (entity) updatePayload.entityId = entity.id;
      }

      if (Object.keys(updatePayload).length === 0) {
        return oldInit;
      }

      const [resInit] = await tx
        .update(initiatives)
        .set(updatePayload)
        .where(eq(initiatives.id, initId))
        .returning();

      // Record changed fields in history
      const caller = await getCallerInfo(req.user, tx);
      const changes: { field: string; old: any; new: any }[] = [];
      for (const [key, newVal] of Object.entries(updatePayload)) {
        if (key.toLowerCase() === 'updatedat' || key.toLowerCase() === 'updated_at' || key.toLowerCase() === 'createdat' || key.toLowerCase() === 'created_at') continue;
        const oldVal = (oldInit as any)[key];
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
          tableName: 'initiatives',
          recordId: initId,
          action: 'UPDATED',
          changes,
          changedById: caller.employeeId,
          changedByName: caller.callerName,
        });
      }

      return { ...resInit, _prevOwnerId: oldInit.ownerId, _prevStatus: oldInit.status, _prevTargetDate: oldInit.targetDate };
    });

    if (!updated) {
      return res.status(404).json({ message: 'Initiative not found' });
    }

    const caller = await getCallerInfo(req.user);
    let whatChanged = '';
    let eventType: 'STATUS_CHANGED' | 'DUE_DATE_CHANGED' = 'STATUS_CHANGED';
    if (mappedStatus !== undefined && mappedStatus !== (updated as any)._prevStatus) {
      whatChanged = `status changed to ${mappedStatus}`;
      eventType = 'STATUS_CHANGED';
    } else if (targetDate !== undefined && targetDate !== (updated as any)._prevTargetDate) {
      whatChanged = `target date updated to ${targetDate}`;
      eventType = 'DUE_DATE_CHANGED';
    } else if (ownerId !== undefined && ownerId !== (updated as any)._prevOwnerId) {
      whatChanged = 'ownership updated';
      eventType = 'STATUS_CHANGED';
    } else if (title !== undefined && title !== (updated as any).title) {
      whatChanged = 'title updated';
      eventType = 'STATUS_CHANGED';
    }

    if (whatChanged) {
      dispatchNotification({
        entity: {
          entityType: 'INITIATIVE',
          entityId: updated.id,
          entityCode: updated.initiativeCode,
          title: updated.title,
          assigneeEmployeeIds: updated.ownerId ? [updated.ownerId] : [],
          reviewingLeadEmployeeId: null,
          creatorEmployeeId: req.user?.employeeId,
        },
        actorUserId: req.user!.id,
        actorName: caller.callerName,
        eventType,
        title: updated.title,
        message: `Initiative '${updated.title}' updated by ${caller.callerName || 'a team member'}: ${whatChanged}`,
        extraPayload: { whatChanged },
      });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[UPDATE INITIATIVE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update initiative' });
  }
}

// PUT /api/initiatives/:id - Update initiative status & details
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), handleInitiativeUpdate);

// PATCH /api/initiatives/:id - Update initiative status & details
router.patch('/:id', requireRole(['ADMIN', 'MANAGER']), handleInitiativeUpdate);

// DELETE /api/initiatives/:id - Admin/Manager protected initiative soft-deletion
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const initId = req.params.id as string;
  try {
    const [init] = await db.select().from(initiatives).where(eq(initiatives.id, initId));
    if (!init) {
      return res.status(404).json({ message: 'Initiative not found' });
    }

    await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);
      await recordHistory(tx, {
        tableName: 'initiatives',
        recordId: initId,
        action: 'DELETED',
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });

      // Soft delete initiative: sets deletedAt timestamp, NEVER drops rows
      await tx
        .update(initiatives)
        .set({ deletedAt: new Date() })
        .where(eq(initiatives.id, initId));
    });

    res.json({ message: `Initiative ${init.initiativeCode} soft-deleted successfully`, id: initId });
  } catch (err: any) {
    console.error('[DELETE INITIATIVE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete initiative' });
  }
});

// POST /api/initiatives/:id/restore - Admin/Manager protected initiative restore
router.post('/:id/restore', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const initId = req.params.id as string;
  try {
    const [init] = await db.select().from(initiatives).where(eq(initiatives.id, initId));
    if (!init) {
      return res.status(404).json({ message: 'Initiative not found' });
    }

    await db.transaction(async (tx) => {
      const caller = await getCallerInfo(req.user, tx);
      await tx
        .update(initiatives)
        .set({ deletedAt: null })
        .where(eq(initiatives.id, initId));

      await recordHistory(tx, {
        tableName: 'initiatives',
        recordId: initId,
        action: 'RESTORED',
        changedById: caller.employeeId,
        changedByName: caller.callerName,
      });
    });

    res.json({ message: `Initiative ${init.initiativeCode} restored successfully`, id: initId });
  } catch (err: any) {
    console.error('[RESTORE INITIATIVE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to restore initiative' });
  }
});

export default router;
