import { Router } from 'express';
import { db, sprints, employees, entities, epics, tasks, taskChecklists, taskComments, taskNotes, entityCounters, eq, inArray, sql, and } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/sprints - View all sprints for all authenticated roles
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query;
    let allSprints;
    if (employeeId && typeof employeeId === 'string') {
      allSprints = await db
        .select()
        .from(sprints)
        .where(eq(sprints.employeeId, employeeId));
    } else {
      allSprints = await db.select().from(sprints);
    }

    const allTasks = await db.select().from(tasks);
    const allEmployees = await db.select().from(employees);
    const allEpics = await db.select().from(epics);

    const enriched = allSprints.map(sprint => {
      const sprintTasks = allTasks.filter(t => t.sprintId === sprint.id);
      const sprintEmp = allEmployees.find(e => e.id === sprint.employeeId);
      const sprintEpic = allEpics.find(e => e.id === sprint.epicId);

      return {
        ...sprint,
        tasks: sprintTasks,
        tasksCount: sprintTasks.length,
        employeeName: sprintEmp ? `${sprintEmp.firstName} ${sprintEmp.lastName}` : 'Unassigned',
        employeeCode: sprintEmp?.employeeCode || 'EMP00',
        designation: sprintEmp?.designation || 'Team Member',
        epicTitle: sprintEpic?.title || 'Standalone Sprint',
      };
    });

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
      // 1. Fetch Target Employee & Entity
      const [emp] = await tx.select().from(employees).where(eq(employees.id, employeeId));
      if (!emp) throw new Error('Target employee for sprint not found');

      const [entity] = await tx.select().from(entities).where(eq(entities.id, emp.entityId));
      if (!entity) throw new Error('Entity not found');

      const entityCode = entity.code; // "EHM" or "CAG"
      const empShortCode = emp.employeeCode.replace(/^[^-]+-/, ''); // "EMP01"

      // 2. Concurrency-safe atomic counter for Sprint sequence
      await tx
        .insert(entityCounters)
        .values({ entityId: emp.entityId, nextSprintSeq: 1 })
        .onConflictDoNothing();

      const [counter] = await tx
        .update(entityCounters)
        .set({ nextSprintSeq: sql`${entityCounters.nextSprintSeq} + 1` })
        .where(eq(entityCounters.entityId, emp.entityId))
        .returning();

      let weekNum = '1';
      if (targetWeek) {
        const match = String(targetWeek).match(/\d+/);
        if (match) weekNum = match[0];
      }
      const empCodeFormatted = emp.employeeCode.replace('-EMP', '-E');
      const sprintCode = `${empCodeFormatted}-W${weekNum}`;

      // 3. Insert Personal Sprint
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
          name: name || `Sprint ${weekNum}`,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : new Date(Date.now() + 14 * 86400000), // Default 2 weeks
          status: status || 'PLANNED',
          goal: goal || '',
        })
        .returning();

      return newSprint;
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error('[CREATE SPRINT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create sprint' });
  }
});

// PUT /api/sprints/:id - Manager/Admin protected sprint properties update
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const sprintId = req.params.id as string;
  const { name, goal, startDate, endDate, status, targetWeek, department, epicId, reviewingLeadId } = req.body;

  try {
    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (goal !== undefined) updatePayload.goal = goal;
    if (startDate !== undefined) updatePayload.startDate = new Date(startDate);
    if (endDate !== undefined) updatePayload.endDate = new Date(endDate);
    if (status !== undefined) updatePayload.status = status;
    if (targetWeek !== undefined) updatePayload.targetWeek = targetWeek;
    if (department !== undefined) updatePayload.department = department;
    if (epicId !== undefined) updatePayload.epicId = epicId || null;
    if (reviewingLeadId !== undefined) updatePayload.reviewingLeadId = reviewingLeadId || null;

    const [updated] = await db
      .update(sprints)
      .set(updatePayload)
      .where(eq(sprints.id, sprintId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[UPDATE SPRINT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update sprint' });
  }
});

// Also support PATCH /api/sprints/:id
router.patch('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const sprintId = req.params.id as string;
  const { name, goal, startDate, endDate, status, targetWeek, department, epicId, reviewingLeadId } = req.body;

  try {
    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (goal !== undefined) updatePayload.goal = goal;
    if (startDate !== undefined) updatePayload.startDate = new Date(startDate);
    if (endDate !== undefined) updatePayload.endDate = new Date(endDate);
    if (status !== undefined) updatePayload.status = status;
    if (targetWeek !== undefined) updatePayload.targetWeek = targetWeek;
    if (department !== undefined) updatePayload.department = department;
    if (epicId !== undefined) updatePayload.epicId = epicId || null;
    if (reviewingLeadId !== undefined) updatePayload.reviewingLeadId = reviewingLeadId || null;

    const [updated] = await db
      .update(sprints)
      .set(updatePayload)
      .where(eq(sprints.id, sprintId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('[PATCH SPRINT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to update sprint' });
  }
});

// DELETE /api/sprints/:id - Admin & Manager protected sprint deletion
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const sprintId = req.params.id as string;
  try {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, sprintId));
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    await db.transaction(async (tx) => {
      // Find linked tasks
      const linkedTasks = await tx.select({ id: tasks.id }).from(tasks).where(eq(tasks.sprintId, sprintId));
      const taskIds = linkedTasks.map(t => t.id);

      if (taskIds.length > 0) {
        await tx.delete(taskChecklists).where(inArray(taskChecklists.taskId, taskIds));
        await tx.delete(taskComments).where(inArray(taskComments.taskId, taskIds));
        await tx.delete(taskNotes).where(inArray(taskNotes.taskId, taskIds));
        await tx.delete(tasks).where(inArray(tasks.id, taskIds));
      }

      await tx.delete(sprints).where(eq(sprints.id, sprintId));
    });

    res.json({ message: `Sprint ${sprint.sprintCode || sprint.name} deleted successfully`, id: sprintId });
  } catch (err: any) {
    console.error('[DELETE SPRINT ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete sprint' });
  }
});

export default router;
