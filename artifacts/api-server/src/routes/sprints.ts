import { Router } from 'express';
import { db, sprints, employees, entities, epics, tasks, entityCounters, eq, sql, and } from '@workspace/db';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/sprints - Server-side RBAC filtered Sprints endpoint
router.get('/', async (req, res) => {
  try {
    const isEmployee = req.user?.role === 'EMPLOYEE';
    const userEmployeeId = req.user?.employeeId;

    let allSprints;
    if (isEmployee && userEmployeeId) {
      // Server-side RBAC restriction: Employees can only view their own personal sprints
      allSprints = await db
        .select()
        .from(sprints)
        .where(eq(sprints.employeeId, userEmployeeId));
    } else {
      // Managers can view all sprints, or filter by employeeId query param
      const { employeeId } = req.query;
      if (employeeId && typeof employeeId === 'string') {
        allSprints = await db
          .select()
          .from(sprints)
          .where(eq(sprints.employeeId, employeeId));
      } else {
        allSprints = await db.select().from(sprints);
      }
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

      const seqNumber = (counter?.nextSprintSeq || 2) - 1;
      const sprintCode = `${entityCode}-${empShortCode}-SPR-${String(seqNumber).padStart(2, '0')}`; // e.g. EHM-EMP01-SPR-01

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
          name: name || `Sprint ${seqNumber}`,
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

export default router;
