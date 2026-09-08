import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, users, employees, entities, departments, entityCounters, initiatives, epics, tasks, attendance, meetings, meetingAttendees, and, eq } from '@workspace/db';

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
          .values({ entityId: existingEntity.id, nextEmployeeSeq: 4 });
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

    // 3. Seed / Upsert Admin & Team Employee Records
    const teamMembersData = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        employeeCode: 'EHM-EMP01',
        entityCode: 'EHM',
        deptCode: 'DEV',
        designation: 'System Administrator & VP Tech',
        salary: '150000',
      },
      {
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.j@ehmconsultancy.com',
        employeeCode: 'EHM-EMP02',
        entityCode: 'EHM',
        deptCode: 'DEV',
        designation: 'Lead Product Manager',
        salary: '120000',
      },
      {
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex.r@ehmconsultancy.com',
        employeeCode: 'EHM-EMP03',
        entityCode: 'EHM',
        deptCode: 'OPS',
        designation: 'Senior Fullstack Engineer',
        salary: '110000',
      },
      {
        firstName: 'Vikram',
        lastName: 'Sharma',
        email: 'vikram.s@climagro.com',
        employeeCode: 'CAG-EMP01',
        entityCode: 'CAG',
        deptCode: 'DEV',
        designation: 'Principal Carbon & AI Specialist',
        salary: '135000',
      },
      {
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.p@climagro.com',
        employeeCode: 'CAG-EMP02',
        entityCode: 'CAG',
        deptCode: 'OPS',
        designation: 'Agile Delivery Lead',
        salary: '105000',
      },
      {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.k@climagro.com',
        employeeCode: 'CAG-EMP03',
        entityCode: 'CAG',
        deptCode: 'DEV',
        designation: 'Sustainability Data Analyst',
        salary: '95000',
      },
    ];

    const seededEmployeesMap: Record<string, any> = {};

    for (const tm of teamMembersData) {
      let [emp] = await db.select().from(employees).where(eq(employees.employeeCode, tm.employeeCode));
      if (!emp) {
        [emp] = await db.select().from(employees).where(eq(employees.email, tm.email));
      }

      if (!emp) {
        [emp] = await db
          .insert(employees)
          .values({
            firstName: tm.firstName,
            lastName: tm.lastName,
            email: tm.email,
            employeeCode: tm.employeeCode,
            entityId: seededEntities[tm.entityCode],
            departmentId: seededDepts[`${tm.entityCode}_${tm.deptCode}`],
            designation: tm.designation,
            salary: tm.salary,
            joiningDate: new Date(),
          })
          .returning();
        console.log(`[SEED] Employee inserted: ${tm.employeeCode} (${tm.email})`);
      } else {
        await db
          .update(employees)
          .set({
            firstName: tm.firstName,
            lastName: tm.lastName,
            designation: tm.designation,
          })
          .where(eq(employees.id, emp.id));
      }
      seededEmployeesMap[tm.employeeCode] = emp;
    }

    const adminEmployee = seededEmployeesMap['EHM-EMP01'];

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

    // 7. Seed / Upsert Default & Team Backlog Tasks
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
        taskType: 'EPIC_TASK' as const,
        status: 'DONE' as const,
        priority: 'HIGH' as const,
        dueDate: new Date(Date.now() - 2 * 86400000),
      },
      {
        taskCode: 'CAG-EMP01-002',
        title: 'Multi-tenant RBAC & Environment Compliance Module',
        description: 'Configure entity switching for EHM Consultancy and Climagro Analytics.',
        entityId: seededEntities['CAG'],
        departmentId: seededDepts['CAG_DEV'],
        assigneeId: seededEmployeesMap['CAG-EMP01']?.id || adminEmployee.id,
        creatorId: adminEmployee.id,
        reviewingLeadId: adminEmployee.id,
        initiativeId: cagInit.id,
        epicId: cagEpic.id,
        taskType: 'EPIC_TASK' as const,
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date(Date.now() + 3 * 86400000),
      },
      {
        taskCode: 'CAG-EMP01-003',
        title: 'Dashboard Performance & Analytics Specs',
        description: 'Create technical design spec and flow diagram for dashboard backlog.',
        entityId: seededEntities['CAG'],
        departmentId: seededDepts['CAG_DEV'],
        assigneeId: seededEmployeesMap['CAG-EMP02']?.id || adminEmployee.id,
        creatorId: adminEmployee.id,
        reviewingLeadId: adminEmployee.id,
        initiativeId: cagInit.id,
        epicId: cagEpic.id,
        taskType: 'EPIC_TASK' as const,
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date(Date.now() + 5 * 86400000),
      },
      {
        taskCode: 'EHM-EMP02-004',
        title: 'Client Onboarding & Project Scope Sign-off',
        description: 'Finalize client agreements and environmental compliance docs.',
        entityId: seededEntities['EHM'],
        departmentId: seededDepts['EHM_DEV'],
        assigneeId: seededEmployeesMap['EHM-EMP02']?.id || adminEmployee.id,
        creatorId: adminEmployee.id,
        reviewingLeadId: adminEmployee.id,
        initiativeId: ehmInit.id,
        epicId: ehmEpic.id,
        taskType: 'EPIC_TASK' as const,
        status: 'DONE' as const,
        priority: 'HIGH' as const,
        dueDate: new Date(Date.now() - 1 * 86400000),
      },
      {
        taskCode: 'CAG-EMP03-005',
        title: 'AI Carbon Emissions Footprint Algorithm',
        description: 'Build calculation pipeline for Scope 1, 2, and 3 GHG emissions.',
        entityId: seededEntities['CAG'],
        departmentId: seededDepts['CAG_DEV'],
        assigneeId: seededEmployeesMap['CAG-EMP03']?.id || adminEmployee.id,
        creatorId: adminEmployee.id,
        reviewingLeadId: adminEmployee.id,
        initiativeId: cagInit.id,
        epicId: cagEpic.id,
        taskType: 'EPIC_TASK' as const,
        status: 'IN_PROGRESS' as const,
        priority: 'URGENT' as const,
        dueDate: new Date(Date.now() + 2 * 86400000),
      },
    ];

    for (const tsk of defaultTasks) {
      const [existingTask] = await db.select().from(tasks).where(eq(tasks.taskCode, tsk.taskCode));
      if (!existingTask) {
        await db.insert(tasks).values(tsk);
        console.log(`[SEED] Task inserted: ${tsk.taskCode}`);
      } else {
        await db.update(tasks).set({
          entityId: tsk.entityId,
          departmentId: tsk.departmentId,
          initiativeId: tsk.initiativeId,
          epicId: tsk.epicId,
          status: tsk.status,
        }).where(eq(tasks.id, existingTask.id));
      }
    }

    // 8. Seed 1 Month (30 Days) of Attendance Records for all employees
    const allEmpsList = Object.values(seededEmployeesMap);
    const nowMs = Date.now();
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const targetDateObj = new Date(nowMs - dayOffset * 86400000);
      const dateStr = targetDateObj.toISOString().split('T')[0];
      const isWeekend = targetDateObj.getDay() === 0 || targetDateObj.getDay() === 6;

      if (isWeekend) continue; // Skip weekends for attendance

      for (let i = 0; i < allEmpsList.length; i++) {
        const emp = allEmpsList[i];
        const [existingAtt] = await db
          .select()
          .from(attendance)
          .where(and(eq(attendance.employeeId, emp.id), eq(attendance.date, dateStr)));

        if (!existingAtt) {
          // Status variation
          let status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' = 'PRESENT';
          if ((dayOffset + i) % 7 === 0) status = 'LATE';
          else if ((dayOffset + i) % 11 === 0) status = 'HALF_DAY';
          else if ((dayOffset + i) % 19 === 0) status = 'ABSENT';

          const workMode: 'IN_OFFICE' | 'REMOTE' | 'HYBRID' = i % 3 === 0 ? 'IN_OFFICE' : i % 3 === 1 ? 'HYBRID' : 'REMOTE';
          const clockInTime = new Date(targetDateObj);
          clockInTime.setHours(9, status === 'LATE' ? 30 : 0, 0);

          const clockOutTime = new Date(targetDateObj);
          clockOutTime.setHours(17, 30, 0);

          await db.insert(attendance).values({
            employeeId: emp.id,
            date: dateStr,
            clockIn: clockInTime,
            clockOut: status === 'ABSENT' ? null : clockOutTime,
            workMode,
            status,
            totalHours: status === 'PRESENT' ? '8.50' : status === 'LATE' ? '8.00' : status === 'HALF_DAY' ? '4.25' : '0.00',
          });
        }
      }
    }
    console.log('[SEED] 30 Days Attendance seeded for all team members!');

    // 9. Seed Live Meetings for Schedule & Calendar
    const meetingSamples = [
      {
        title: 'Sprint Planning & Backlog Review',
        description: 'Review upcoming sprint deliverables, epic targets, and task commitments.',
        startTime: new Date(nowMs + 30 * 60000), // Today in 30 mins
        endTime: new Date(nowMs + 90 * 60000),
        location: 'Google Meet',
        googleMeetUrl: 'https://meet.google.com/abc-defg-hij',
        organizerId: adminEmployee.id,
        invitees: allEmpsList.slice(0, 3).map(e => e.id),
      },
      {
        title: 'Climagro ESG & Carbon Engine Sync',
        description: 'Technical sync on AI carbon algorithm calculation & Scope 3 reporting.',
        startTime: new Date(nowMs + 4 * 3600000), // Today afternoon
        endTime: new Date(nowMs + 5 * 3600000),
        location: 'Google Meet',
        googleMeetUrl: 'https://meet.google.com/cag-esg-sync',
        organizerId: seededEmployeesMap['CAG-EMP01']?.id || adminEmployee.id,
        invitees: allEmpsList.map(e => e.id),
      },
      {
        title: 'Daily Agile Standup & Blockers',
        description: 'Quick 15-min sync on daily progress and blocker resolution.',
        startTime: new Date(nowMs + 24 * 3600000), // Tomorrow morning
        endTime: new Date(nowMs + 24.5 * 3600000),
        location: 'Google Meet',
        googleMeetUrl: 'https://meet.google.com/hros-daily-standup',
        organizerId: adminEmployee.id,
        invitees: allEmpsList.map(e => e.id),
      },
    ];

    for (const m of meetingSamples) {
      const [existingM] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.title, m.title));

      if (!existingM) {
        const [insertedM] = await db.insert(meetings).values({
          title: m.title,
          description: m.description,
          startTime: m.startTime,
          endTime: m.endTime,
          location: m.location,
          googleMeetUrl: m.googleMeetUrl,
          organizerId: m.organizerId,
          invitees: m.invitees,
          source: 'INTERNAL',
          status: 'SCHEDULED',
        }).returning();

        if (m.invitees && m.invitees.length > 0) {
          const rows = m.invitees.map(empId => ({
            meetingId: insertedM.id,
            employeeId: empId,
            responseStatus: 'ACCEPTED' as const,
          }));
          await db.insert(meetingAttendees).values(rows);
        }
      }
    }
    console.log('[SEED] Live Meetings seeded successfully!');

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
