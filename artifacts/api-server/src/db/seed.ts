import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, users, employees, entities, departments, entityCounters, initiatives, epics, sprints, tasks, attendance, meetings, meetingAttendees, and, eq, ne } from '@workspace/db';

dotenv.config();

export async function runSeed() {
  console.log('[SEED] Purging dummy data and keeping only Admin account...');
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  try {
    // 0. Clean up / Purge all dummy operational data
    await db.delete(meetingAttendees);
    await db.delete(meetings);
    await db.delete(attendance);
    await db.delete(tasks);
    await db.delete(sprints);
    await db.delete(epics);
    await db.delete(initiatives);
    console.log('[SEED] Purged dummy tasks, epics, initiatives, sprints, meetings, and attendance.');

    // 1. Seed / Upsert Entities (EHM & CAG)
    const entitiesList = [
      { code: 'EHM', name: 'EHM' },
      { code: 'CAG', name: 'CLIMAGRO' },
    ];

    const seededEntities: Record<string, string> = {};

    for (const ent of entitiesList) {
      let [existingEntity] = await db
        .select()
        .from(entities)
        .where(eq(entities.code, ent.code));

      if (!existingEntity) {
        [existingEntity] = await db
          .insert(entities)
          .values({ code: ent.code, name: ent.name })
          .returning();
        console.log(`[SEED] Entity inserted: ${ent.code} (${ent.name})`);
      }

      seededEntities[ent.code] = existingEntity.id;

      // Reset Entity Counter for fresh employee code generation
      await db
        .insert(entityCounters)
        .values({ entityId: existingEntity.id, nextEmployeeSeq: 2 })
        .onConflictDoUpdate({
          target: entityCounters.entityId,
          set: { nextEmployeeSeq: 2 },
        });
    }

    // 2. Seed / Upsert Departments (MAR, DEV, OPS, HR, FIN)
    const departmentsData = [
      { code: 'MAR', name: 'Marketing' },
      { code: 'DEV', name: 'Engineering & Product' },
      { code: 'OPS', name: 'Operations' },
      { code: 'HR', name: 'Human Resources' },
      { code: 'FIN', name: 'Finance' },
    ];

    const seededDepts: Record<string, string> = {};

    for (const entityCode of ['EHM', 'CAG']) {
      const entityId = seededEntities[entityCode];
      for (const dept of departmentsData) {
        let [existingDept] = await db
          .select()
          .from(departments)
          .where(and(eq(departments.entityId, entityId), eq(departments.code, dept.code)));

        if (!existingDept) {
          [existingDept] = await db
            .insert(departments)
            .values({ entityId, code: dept.code, name: dept.name })
            .returning();
        }
        seededDepts[`${entityCode}_${dept.code}`] = existingDept.id;
      }
    }

    // 3. Keep ONLY Admin Employee Record & Purge Non-Admin Employees
    const adminEmployeeCode = 'EHM-EMP01';
    let [adminEmp] = await db.select().from(employees).where(eq(employees.employeeCode, adminEmployeeCode));
    if (!adminEmp) {
      [adminEmp] = await db.select().from(employees).where(eq(employees.email, adminEmail));
    }

    if (!adminEmp) {
      [adminEmp] = await db
        .insert(employees)
        .values({
          firstName: 'Admin',
          lastName: 'User',
          email: adminEmail,
          employeeCode: adminEmployeeCode,
          entityId: seededEntities['EHM'],
          departmentId: seededDepts['EHM_DEV'],
          designation: 'System Administrator & VP Tech',
          salary: '150000',
          joiningDate: new Date(),
        })
        .returning();
      console.log(`[SEED] Admin Employee inserted: ${adminEmployeeCode} (${adminEmail})`);
    } else {
      await db
        .update(employees)
        .set({
          firstName: 'Admin',
          lastName: 'User',
          designation: 'System Administrator & VP Tech',
        })
        .where(eq(employees.id, adminEmp.id));
    }

    // Delete non-admin employees
    await db.delete(employees).where(ne(employees.id, adminEmp.id));
    console.log('[SEED] Purged all dummy non-admin employee profiles.');

    // 4. Keep ONLY Admin User Accounts & Purge Non-Admin Users
    const [existingAdminUser] = await db.select().from(users).where(eq(users.email, adminEmail));
    if (!existingAdminUser) {
      await db.insert(users).values({
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        employeeId: adminEmp.id,
      });
    } else {
      await db.update(users)
        .set({ passwordHash, role: 'ADMIN', status: 'ACTIVE', employeeId: adminEmp.id })
        .where(eq(users.email, adminEmail));
    }

    const secondaryEmail = 'ashutosh@ehmconsultancy.com';
    const [existingSecUser] = await db.select().from(users).where(eq(users.email, secondaryEmail));
    if (!existingSecUser) {
      await db.insert(users).values({
        email: secondaryEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        employeeId: adminEmp.id,
      });
    } else {
      await db.update(users)
        .set({ passwordHash, role: 'ADMIN', status: 'ACTIVE', employeeId: adminEmp.id })
        .where(eq(users.email, secondaryEmail));
    }

    // Purge non-admin users
    await db.delete(users).where(ne(users.role, 'ADMIN'));
    console.log('[SEED] Purged all non-admin user accounts.');

    console.log('✅ [SEED COMPLETE]: All dummy data deleted! Workspace reset to zero with Admin account preserved.');
  } catch (err) {
    console.error('[SEED ERROR]: Failed to seed/reset database:', err);
  }
}
