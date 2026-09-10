import { Router } from 'express';
import { db, initiatives, entityCounters, entities, employees, epics, eq, sql } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

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

    // Fetch linked epics & entities for each initiative
    const allEpics = await db.select().from(epics);
    const allEntities = await db.select().from(entities);

    const enriched = allInitiatives.map(init => {
      const entity = allEntities.find(e => e.id === init.entityId);
      const linkedEpics = allEpics.filter(e => e.initiativeId === init.id);
      return {
        ...init,
        entityName: (entity?.name || '').toLowerCase().includes('cag') || (entity?.name || '').toLowerCase().includes('climagro') || init.initiativeCode.startsWith('CAG') ? 'CLIMAGRO' : 'EHM',
        entityCode: entity?.code || (init.initiativeCode.startsWith('CAG') ? 'CAG' : 'EHM'),
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
      const allEntities = await db.select().from(entities);
      let entity = allEntities.find(e =>
        e.id === entityId ||
        e.code.toLowerCase() === (entityId || '').toLowerCase() ||
        ((entityId || '').toLowerCase().includes('ehm') && e.code === 'EHM') ||
        ((entityId || '').toLowerCase().includes('climagro') && e.code === 'CAG')
      );
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

export default router;
