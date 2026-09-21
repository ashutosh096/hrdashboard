import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, users, employees, entities, departments, entityCounters, initiatives, epics, sprints, tasks, taskChecklists, taskComments, attendance, meetings, meetingAttendees, googleTokens, notifications, invites, and, eq, ne } from '@workspace/db';

dotenv.config();

export async function runSeed() {
  console.log('[SEED] Purging dummy data, notifications, Google Calendar tokens, and keeping only Admin account...');
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  try {
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

    // 2. Seed / Upsert Departments (MAR, DEV, OPS)
    const departmentsData = [
      { code: 'MAR', name: 'Marketing' },
      { code: 'DEV', name: 'Engineering & Product' },
      { code: 'OPS', name: 'Operations' },
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

    // 4. Keep ONLY Admin User Accounts & Purge Non-Admin Users and Invites FIRST
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

    const allowDestructive = process.env.ALLOW_DESTRUCTIVE_SEED === 'true';

    if (allowDestructive) {
      console.log('[SEED] ALLOW_DESTRUCTIVE_SEED=true confirmed. Purging non-admin users, invites, and employee profiles...');
      // Purge non-admin users & invites before deleting employee records to honor foreign key constraints
      await db.delete(invites);
      await db.delete(users).where(ne(users.role, 'ADMIN'));
      console.log('[SEED] Purged all non-admin user accounts and invites.');

      // Delete non-admin employees AFTER deleting dependent user/invite records
      await db.delete(employees).where(ne(employees.id, adminEmp.id));
      console.log('[SEED] Purged all dummy non-admin employee profiles.');
    } else {
      console.warn('⚠️ [SEED SAFEGUARD ACTIVE]: Destructive delete skipped! To enable destructive database resets, set ALLOW_DESTRUCTIVE_SEED=true.');
    }

    console.log('✅ [SEED COMPLETE]: Idempotent seed completed safely.');
  } catch (err) {
    console.error('[SEED ERROR]: Failed to seed database:', err);
  }
}

