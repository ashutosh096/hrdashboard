import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, users, employees, entities, departments, entityCounters, initiatives, epics, tasks, and, eq } from '@workspace/db';

dotenv.config();

export async function runSeed() {
  console.log('[SEED] Seeding database with HROS initial data...');
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  try {
    // 1. Seed / Upsert Entities (EHM & CAG)
    const entitiesList = [
      { code: 'EHM', name: 'EHM Consultancy' },
      { code: 'CAG', name: 'Climagro Analytics' },
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
      } else {
        console.log(`[SEED] Entity exists: ${ent.code}`);
      }

      seededEntities[ent.code] = existingEntity.id;

      // Seed / Upsert Entity Counter
      const [existingCounter] = await db
        .select()
        .from(entityCounters)
        .where(eq(entityCounters.entityId, existingEntity.id));

      if (!existingCounter) {
        await db
          .insert(entityCounters)
          .values({ entityId: existingEntity.id, nextEmployeeSeq: 2 });
        console.log(`[SEED] Entity Counter initialized for ${ent.code}`);
      }
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
          console.log(`[SEED] Department inserted: ${dept.code} for ${entityCode}`);
        }
        seededDepts[`${entityCode}_${dept.code}`] = existingDept.id;
      }
    }

    // 3. Seed / Upsert Admin Employee Record
    let [adminEmployee] = await db
      .select()
      .from(employees)
      .where(eq(employees.employeeCode, 'EHM-EMP01'));

    if (!adminEmployee) {
      [adminEmployee] = await db
        .select()
        .from(employees)
        .where(eq(employees.email, adminEmail));
    }

    if (!adminEmployee) {
      [adminEmployee] = await db
        .insert(employees)
        .values({
          firstName: 'Admin',
          lastName: 'User',
          email: adminEmail,
          employeeCode: 'EHM-EMP01',
          entityId: seededEntities['EHM'],
          departmentId: seededDepts['EHM_DEV'] || seededDepts['EHM_HR'],
          designation: 'System Administrator',
          salary: '150000',
          joiningDate: new Date(),
        })
        .returning();
      console.log(`[SEED] Admin Employee inserted: EHM-EMP01 (${adminEmail})`);
    }

    // 4. Seed / Upsert Admin User
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (!existingUser) {
      await db.insert(users).values({
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        employeeId: adminEmployee.id,
      });
      console.log(`[SEED] Admin User inserted: ${adminEmail}`);
    } else {
      await db.update(users)
        .set({ passwordHash, role: 'ADMIN', status: 'ACTIVE', employeeId: adminEmployee.id })
        .where(eq(users.email, adminEmail));
      console.log(`[SEED] Admin User updated: ${adminEmail}`);
    }

    // 5. Seed / Upsert Default Strategic Initiatives (CAG-INIT-001 & EHM-INIT-001)
    let [cagInit] = await db.select().from(initiatives).where(eq(initiatives.initiativeCode, 'CAG-INIT-001'));
    if (!cagInit) {
      [cagInit] = await db.insert(initiatives).values({
        initiativeCode: 'CAG-INIT-001',
        title: 'Climagro Analytics Platform & Carbon Engine',
        description: 'Core sustainability platform & AI carbon footprint analytics module',
        entityId: seededEntities['CAG'],
        departmentId: seededDepts['CAG_DEV'],
        subDepartment: 'Product & Tech - Core Engine',
        targetMonth: 'Month 1 (Weeks 1–4)',
        epicsCountTarget: 3,
        targetDeliverableMetric: '100% OAuth & Carbon Reporting Pass',
        status: 'ACTIVE',
      }).returning();
      console.log('[SEED] Default Initiative inserted: CAG-INIT-001');
    }

    let [ehmInit] = await db.select().from(initiatives).where(eq(initiatives.initiativeCode, 'EHM-INIT-001'));
    if (!ehmInit) {
      [ehmInit] = await db.insert(initiatives).values({
        initiativeCode: 'EHM-INIT-001',
        title: 'EHM Consultancy Operational ERP & Client Portal',
        description: 'Environmental consultancy workflow & compliance tracking dashboard',
        entityId: seededEntities['EHM'],
        departmentId: seededDepts['EHM_DEV'],
        subDepartment: 'Operations & Tech',
        targetMonth: 'Month 1 (Weeks 1–4)',
        epicsCountTarget: 2,
        targetDeliverableMetric: 'Automated Compliance Workflow',
        status: 'ACTIVE',
      }).returning();
      console.log('[SEED] Default Initiative inserted: EHM-INIT-001');
    }

    // 6. Seed / Upsert Default Epics (CAG-EPIC-001 & EHM-EPIC-001)
    let [cagEpic] = await db.select().from(epics).where(eq(epics.epicCode, 'CAG-EPIC-001'));
    if (!cagEpic) {
      [cagEpic] = await db.insert(epics).values({
        epicCode: 'CAG-EPIC-001',
        title: 'Auth, RBAC & Core Analytics Engine',
        description: 'Multi-tenant authentication and analytics calculation pipeline',
        initiativeId: cagInit.id,
        entityId: seededEntities['CAG'],
        department: 'Product & Tech',
        targetWeek: 'Week 1 (Days 1–7)',
        sprintsCountTarget: 2,
        status: 'IN_PROGRESS',
      }).returning();
      console.log('[SEED] Default Epic inserted: CAG-EPIC-001');
    }

    let [ehmEpic] = await db.select().from(epics).where(eq(epics.epicCode, 'EHM-EPIC-001'));
    if (!ehmEpic) {
      [ehmEpic] = await db.insert(epics).values({
        epicCode: 'EHM-EPIC-001',
        title: 'Client Onboarding & Project Management Module',
        description: 'Client portal setup and project deliverable tracking',
        initiativeId: ehmInit.id,
        entityId: seededEntities['EHM'],
        department: 'Operations & Delivery',
        targetWeek: 'Week 2 (Days 8–14)',
        sprintsCountTarget: 2,
        status: 'IN_PROGRESS',
      }).returning();
      console.log('[SEED] Default Epic inserted: EHM-EPIC-001');
    }

    // 7. Seed / Upsert Default Backlog Tasks
    const defaultTasks = [
      {
        taskCode: 'EHM-EMP01-001',
        title: 'Product Backlog & Tech Architecture Setup',
        description: 'Establish initiative -> epic -> task 3-tier hierarchy structure.',
        entityId: seededEntities['EHM'],
        departmentId: seededDepts['EHM_DEV'],
        assigneeId: adminEmployee.id,
        creatorId: adminEmployee.id,
        reviewingLeadId: adminEmployee.id,
        initiativeId: ehmInit.id,
        epicId: ehmEpic.id,
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        dueDate: new Date(Date.now() + 3 * 86400000),
      },
      {
        taskCode: 'CAG-EMP01-002',
        title: 'Multi-tenant RBAC & Environment Compliance Module',
        description: 'Configure entity switching for EHM Consultancy and Climagro Analytics.',
        entityId: seededEntities['CAG'],
        departmentId: seededDepts['CAG_DEV'],
        assigneeId: adminEmployee.id,
        creatorId: adminEmployee.id,
        reviewingLeadId: adminEmployee.id,
        initiativeId: cagInit.id,
        epicId: cagEpic.id,
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date(Date.now() + 5 * 86400000),
      },
      {
        taskCode: 'CAG-EMP01-003',
        title: 'Do proper planning make the doc how we have to make this dashboard',
        description: 'Create technical design spec and flow diagram for dashboard backlog.',
        entityId: seededEntities['CAG'],
        departmentId: seededDepts['CAG_DEV'],
        assigneeId: adminEmployee.id,
        creatorId: adminEmployee.id,
        reviewingLeadId: adminEmployee.id,
        initiativeId: cagInit.id,
        epicId: cagEpic.id,
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
    ];

    for (const tsk of defaultTasks) {
      const [existingTask] = await db.select().from(tasks).where(eq(tasks.taskCode, tsk.taskCode));
      if (!existingTask) {
        // Also check if old EHM- prefix task exists
        const oldCode = tsk.taskCode.replace(/^CAG-/, 'EHM-');
        const [oldTask] = await db.select().from(tasks).where(eq(tasks.taskCode, oldCode));
        if (oldTask) {
          await db.update(tasks).set({
            taskCode: tsk.taskCode,
            entityId: tsk.entityId,
            departmentId: tsk.departmentId,
            initiativeId: tsk.initiativeId,
            epicId: tsk.epicId,
          }).where(eq(tasks.id, oldTask.id));
          console.log(`[SEED] Updated existing task ${oldCode} -> ${tsk.taskCode}`);
        } else {
          await db.insert(tasks).values(tsk);
          console.log(`[SEED] Default Task inserted: ${tsk.taskCode}`);
        }
      } else {
        await db.update(tasks).set({
          entityId: tsk.entityId,
          departmentId: tsk.departmentId,
          initiativeId: tsk.initiativeId,
          epicId: tsk.epicId,
        }).where(eq(tasks.id, existingTask.id));
      }
    }

    console.log(`[SEED] Admin Credentials: ${adminEmail} (password: ${adminPassword})`);
    console.log('[SEED] Database seeding complete!');
  } catch (err) {
    console.error('[SEED ERROR] Database seed failure:', err);
  }
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed().catch(console.error);
}
