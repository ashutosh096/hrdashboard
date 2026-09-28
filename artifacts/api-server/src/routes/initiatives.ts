import { Router } from 'express';
import { db, initiatives, entityCounters, entities, departments, employees, epics, tasks, eq, sql } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['ADMIN', 'MANAGER']));

// GET /api/initiatives - Fetch list of initiatives with linked epics count
router.get('/', async (req, res) => {
  try {
    const allInitiatives = await db
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
      })
      .from(initiatives);

    // Fetch linked epics, entities & departments for each initiative
    const allEpics = await db.select().from(epics);
    const allEntities = await db.select().from(entities);
    const allDepts = await db.select().from(departments);

    const enriched = allInitiatives.map(init => {
      const entity = allEntities.find(e => e.id === init.entityId);
      const dept = allDepts.find(d => d.id === init.departmentId);
      const linkedEpics = allEpics.filter(e => e.initiativeId === init.id);
      const resolvedEntity = entity?.code === 'CAG'
        ? 'CLIMAGRO'
        : entity?.code === 'COMMON'
        ? 'COMMON'
        : entity?.code === 'EHM'
        ? 'EHM'
        : init.initiativeCode.startsWith('CAG')
        ? 'CLIMAGRO'
        : (init.initiativeCode.startsWith('COMMON') || init.initiativeCode.startsWith('COM-'))
        ? 'COMMON'
        : 'EHM';
      const resolvedCode = entity?.code || (resolvedEntity === 'CLIMAGRO' ? 'CAG' : resolvedEntity === 'COMMON' ? 'COMMON' : 'EHM');

      return {
        ...init,
        entity: resolvedEntity,
        entityName: entity?.name || (resolvedEntity === 'CLIMAGRO' ? 'Climagro Analytics' : resolvedEntity === 'COMMON' ? 'EHM & CLIMAGRO (COMMON)' : 'EHM Consultancy'),
        entityCode: resolvedCode,
        departmentName: dept?.name || init.subDepartment || 'Product & Tech',
        epicsCount: linkedEpics.length,
        epics: linkedEpics,
      };
    });

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
      const entityCode = entity.code; // "EHM" or "CAG"

      // 2. Concurrency-safe atomic update on entity_counters
      await tx
        .insert(entityCounters)
        .values({ entityId: targetEntityId, nextInitiativeSeq: 1 })
        .onConflictDoNothing();

      const [counter] = await tx
        .update(entityCounters)
        .set({ nextInitiativeSeq: sql`${entityCounters.nextInitiativeSeq} + 1` })
        .where(eq(entityCounters.entityId, targetEntityId))
        .returning();

      const seqNumber = (counter?.nextInitiativeSeq || 2) - 1;
      const initiativeCode = `${entityCode}-I${String(seqNumber).padStart(2, '0')}`;

      // 3. Insert Initiative
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
        })
        .returning();

      return newInitiative;
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error('[CREATE INITIATIVE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create initiative' });
  }
});

// PUT /api/initiatives/:id - Update initiative status & details
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const initId = req.params.id as string;
  const { status, title, description, targetMonth, epicsCountTarget, targetDeliverableMetric, subDepartment, entityId } = req.body;

  let mappedStatus: 'PLANNED' | 'ACTIVE' | 'DONE' | undefined = undefined;
  if (status === 'IN_PROGRESS' || status === 'ACTIVE') mappedStatus = 'ACTIVE';
  else if (status === 'COMPLETED' || status === 'DONE') mappedStatus = 'DONE';
  else if (status === 'PLANNED') mappedStatus = 'PLANNED';

  try {
    const updatePayload: any = {};
    if (mappedStatus !== undefined) updatePayload.status = mappedStatus;
    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (targetMonth !== undefined) updatePayload.targetMonth = targetMonth;
    if (epicsCountTarget !== undefined) updatePayload.epicsCountTarget = Number(epicsCountTarget);
    if (targetDeliverableMetric !== undefined) updatePayload.targetDeliverableMetric = targetDeliverableMetric;
    if (subDepartment !== undefined) updatePayload.subDepartment = subDepartment;

    if (entityId !== undefined) {
      const entTarget = String(entityId || '').toLowerCase().trim();
      const allEntities = await db.select().from(entities);
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

    const [updated] = await db
      .update(initiatives)
      .set(updatePayload)
      .where(eq(initiatives.id, initId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Initiative not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[UPDATE INITIATIVE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update initiative' });
  }
});

// PATCH /api/initiatives/:id - Update initiative status & details
router.patch('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const initId = req.params.id as string;
  const { status, title, description, targetMonth, epicsCountTarget, targetDeliverableMetric, subDepartment, entityId } = req.body;

  let mappedStatus: 'PLANNED' | 'ACTIVE' | 'DONE' | undefined = undefined;
  if (status === 'IN_PROGRESS' || status === 'ACTIVE') mappedStatus = 'ACTIVE';
  else if (status === 'COMPLETED' || status === 'DONE') mappedStatus = 'DONE';
  else if (status === 'PLANNED') mappedStatus = 'PLANNED';

  try {
    const updatePayload: any = {};
    if (mappedStatus !== undefined) updatePayload.status = mappedStatus;
    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (targetMonth !== undefined) updatePayload.targetMonth = targetMonth;
    if (epicsCountTarget !== undefined) updatePayload.epicsCountTarget = Number(epicsCountTarget);
    if (targetDeliverableMetric !== undefined) updatePayload.targetDeliverableMetric = targetDeliverableMetric;
    if (subDepartment !== undefined) updatePayload.subDepartment = subDepartment;

    if (entityId !== undefined) {
      const entTarget = String(entityId || '').toLowerCase().trim();
      const allEntities = await db.select().from(entities);
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

    const [updated] = await db
      .update(initiatives)
      .set(updatePayload)
      .where(eq(initiatives.id, initId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Initiative not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[PATCH INITIATIVE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update initiative' });
  }
});

// DELETE /api/initiatives/:id - Admin protected initiative deletion
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  const initId = req.params.id as string;
  try {
    const [init] = await db.select().from(initiatives).where(eq(initiatives.id, initId));
    if (!init) {
      return res.status(404).json({ message: 'Initiative not found' });
    }

    await db.transaction(async (tx) => {
      // 1. Detach all linked epics (set initiativeId = null)
      await tx
        .update(epics)
        .set({ initiativeId: null })
        .where(eq(epics.initiativeId, initId));

      // 2. Detach any tasks referencing this initiative directly (set initiativeId = null)
      await tx
        .update(tasks)
        .set({ initiativeId: null })
        .where(eq(tasks.initiativeId, initId));

      // 3. Delete the initiative row itself
      await tx.delete(initiatives).where(eq(initiatives.id, initId));
    });

    res.json({ message: `Initiative ${init.initiativeCode} deleted successfully`, id: initId });
  } catch (err: any) {
    console.error('[DELETE INITIATIVE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete initiative' });
  }
});

export default router;
