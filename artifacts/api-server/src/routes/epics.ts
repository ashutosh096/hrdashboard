import { Router } from 'express';
import { db, epics, initiatives, entityCounters, entities, sprints, tasks, taskChecklists, taskComments, taskNotes, eq, or, inArray, sql } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/epics - List epics with linked sprints and tasks summary
router.get('/', async (req, res) => {
  const { initiativeId } = req.query;

  try {
    let query = db.select().from(epics);
    if (initiativeId && typeof initiativeId === 'string') {
      query = db.select().from(epics).where(eq(epics.initiativeId, initiativeId)) as any;
    }

    const allEpics = await query;
    const allSprints = await db.select().from(sprints);
    const allTasks = await db.select().from(tasks);

    const enriched = allEpics.map(epic => {
      const linkedSprints = allSprints.filter(s => s.epicId === epic.id);
      const linkedTasks = allTasks.filter(t => t.epicId === epic.id);
      return {
        ...epic,
        sprintsCount: linkedSprints.length,
        tasksCount: linkedTasks.length,
        sprints: linkedSprints,
        tasks: linkedTasks,
      };
    });

    res.json(enriched);
  } catch (err: any) {
    console.error('[FETCH EPICS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch epics' });
  }
});

// POST /api/epics - Manager protected epic creation with atomic code sequence (EHM-EPIC-001)
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { title, description, initiativeId, entityId, department, targetWeek, sprintsCountTarget, ownerId, targetDate, status } = req.body;

  if (!initiativeId) {
    return res.status(400).json({ message: 'initiativeId is required' });
  }

  try {
    const created = await db.transaction(async (tx) => {
      // 1. Resolve Initiative & Entity
      const [init] = await tx.select().from(initiatives).where(eq(initiatives.id, initiativeId));
      if (!init) throw new Error('Parent initiative not found');

      const targetEntityId = entityId || init.entityId;
      const [entity] = await tx.select().from(entities).where(eq(entities.id, targetEntityId));
      if (!entity) throw new Error('Entity not found');

      const entityCode = entity.code; // "EHM" or "CAG"

      // 2. Concurrency-safe atomic counter update
      await tx
        .insert(entityCounters)
        .values({ entityId: targetEntityId, nextEpicSeq: 1 })
        .onConflictDoNothing();

      const [counter] = await tx
        .update(entityCounters)
        .set({ nextEpicSeq: sql`${entityCounters.nextEpicSeq} + 1` })
        .where(eq(entityCounters.entityId, targetEntityId))
        .returning();

      const seqNumber = (counter?.nextEpicSeq || 2) - 1;
      const initCode = init.initiativeCode || 'EHM-I01';
      const epicCode = `${initCode}-EP${String(seqNumber).padStart(2, '0')}`;

      // 3. Insert Epic
      const [newEpic] = await tx
        .insert(epics)
        .values({
          epicCode,
          title: title || 'Untitled Epic',
          description: description || '',
          initiativeId,
          entityId: targetEntityId,
          department: department || '',
          targetWeek: targetWeek || 'Week 1 (Days 1–7)',
          sprintsCountTarget: sprintsCountTarget ? Number(sprintsCountTarget) : 2,
          status: status || 'PLANNED',
          ownerId: ownerId || null,
          targetDate: targetDate ? new Date(targetDate) : null,
        })
        .returning();

      return newEpic;
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error('[CREATE EPIC ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create epic' });
  }
});

// PUT /api/epics/:id - Update Epic details
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const epicId = req.params.id as string;
  const { title, description, initiativeId, department, targetWeek, sprintsCountTarget, status } = req.body;

  let mappedStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | undefined = undefined;
  if (status !== undefined) {
    const s = String(status).toUpperCase();
    if (['DONE', 'COMPLETED', 'ARCHIVED'].includes(s)) mappedStatus = 'COMPLETED';
    else if (['IN_PROGRESS', 'ACTIVE'].includes(s)) mappedStatus = 'IN_PROGRESS';
    else if (s === 'PLANNED') mappedStatus = 'PLANNED';
  }

  try {
    const [updated] = await db
      .update(epics)
      .set({
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        initiativeId: initiativeId !== undefined ? initiativeId : undefined,
        department: department !== undefined ? department : undefined,
        targetWeek: targetWeek !== undefined ? targetWeek : undefined,
        sprintsCountTarget: sprintsCountTarget !== undefined ? Number(sprintsCountTarget) : undefined,
        status: mappedStatus !== undefined ? mappedStatus : undefined,
      })
      .where(eq(epics.id, epicId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Epic not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[UPDATE EPIC ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update epic' });
  }
});

// DELETE /api/epics/:id - Admin protected epic deletion
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  const epicId = req.params.id as string;
  try {
    const [epic] = await db.select().from(epics).where(eq(epics.id, epicId));
    if (!epic) {
      return res.status(404).json({ message: 'Epic not found' });
    }

    await db.transaction(async (tx) => {
      // 1. Find linked sprints
      const linkedSprints = await tx.select({ id: sprints.id }).from(sprints).where(eq(sprints.epicId, epicId));
      const sprintIds = linkedSprints.map(s => s.id);

      // 2. Find linked tasks
      const linkedTasks = await tx.select({ id: tasks.id }).from(tasks).where(
        sprintIds.length > 0
          ? or(eq(tasks.epicId, epicId), inArray(tasks.sprintId, sprintIds))
          : eq(tasks.epicId, epicId)
      );
      const taskIds = linkedTasks.map(t => t.id);

      // 3. Delete task child items
      if (taskIds.length > 0) {
        await tx.delete(taskChecklists).where(inArray(taskChecklists.taskId, taskIds));
        await tx.delete(taskComments).where(inArray(taskComments.taskId, taskIds));
        await tx.delete(taskNotes).where(inArray(taskNotes.taskId, taskIds));
        await tx.delete(tasks).where(inArray(tasks.id, taskIds));
      }

      // 4. Delete sprints
      if (sprintIds.length > 0) {
        await tx.delete(sprints).where(inArray(sprints.id, sprintIds));
      }

      // 5. Delete epic
      await tx.delete(epics).where(eq(epics.id, epicId));
    });

    res.json({ message: `Epic ${epic.epicCode} deleted successfully`, id: epicId });
  } catch (err: any) {
    console.error('[DELETE EPIC ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete epic' });
  }
});

export default router;
