import { Router } from 'express';
import crypto from 'node:crypto';
import { db, employees, entities, entityCounters, departments, eq, sql } from '@workspace/db';
import { sendInviteEmail } from '../services/email.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const allEmployees = await db.select().from(employees);
    res.json(allEmployees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

router.post('/', async (req, res) => {
  const { firstName, lastName, email, entityId, departmentId, designation, salary, joiningDate } = req.body;

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Fetch entityCode dynamically from entities table by entityId
      let targetEntityId = entityId;
      if (!targetEntityId) {
        const [firstEntity] = await tx.select({ id: entities.id }).from(entities).limit(1);
        targetEntityId = firstEntity?.id;
      }

      const [entity] = await tx
        .select({ code: entities.code })
        .from(entities)
        .where(eq(entities.id, targetEntityId));

      if (!entity) {
        throw new Error(`Entity not found for ID: ${targetEntityId}`);
      }

      const entityCode = entity.code; // "EHM" or "CAG"

      // 2. Atomic sequence increment for employeeCode (e.g. EHM-EMP01)
      const [updatedCounter] = await tx
        .insert(entityCounters)
        .values({ entityId: targetEntityId, nextEmployeeSeq: 2 })
        .onConflictDoUpdate({
          target: entityCounters.entityId,
          set: { nextEmployeeSeq: sql`${entityCounters.nextEmployeeSeq} + 1` },
        })
        .returning();

      const seq = updatedCounter.nextEmployeeSeq - 1;
      const employeeCode = `${entityCode}-EMP${String(seq).padStart(2, '0')}`;

      // 3. Resolve department ID
      let targetDeptId = departmentId;
      if (!targetDeptId) {
        const [firstDept] = await tx.select({ id: departments.id }).from(departments).limit(1);
        targetDeptId = firstDept?.id;
      }

      // 4. Insert Employee
      const [newEmployee] = await tx
        .insert(employees)
        .values({
          employeeCode,
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          entityId: targetEntityId,
          departmentId: targetDeptId,
          designation: designation || 'Specialist',
          salary: String(salary || 85000),
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        })
        .returning();

      return { newEmployee, entityCode };
    });

    const inviteToken = crypto.randomBytes(32).toString('hex');
    await sendInviteEmail(email, inviteToken, `${firstName} ${lastName}`);

    res.status(201).json({ employee: result.newEmployee, inviteToken });
  } catch (err: any) {
    console.error('[EMPLOYEE CREATION ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create employee' });
  }
});

export default router;
