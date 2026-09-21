import {
  db,
  users,
  employees,
  entities,
  departments,
  initiatives,
  epics,
  sprints,
  tasks,
  taskChecklists,
  taskComments,
  taskNotes,
  taskTemplates,
  notifications,
  meetings,
  meetingAttendees,
  invites,
  passwordResetOtps,
  auditLogs,
  googleTokens,
  applications,
  eq,
  or,
  inArray,
  sql
} from '@workspace/db';
import bcrypt from 'bcryptjs';

async function setupCleanProductionData() {
  console.log('\n======================================================');
  console.log('🧹 DATABASE CLEANUP & PRODUCTION SEED INITIALIZATION');
  console.log('======================================================\n');

  // 1. Inspect existing entities and departments
  const allEntities = await db.select().from(entities);
  const ehmEntity = allEntities.find(e => e.code === 'EHM') || allEntities[0];
  const cagEntity = allEntities.find(e => e.code === 'CAG') || allEntities[1];

  const allDepts = await db.select().from(departments);
  const techDept = allDepts.find(d => d.name.toLowerCase().includes('tech') || d.name.toLowerCase().includes('eng')) || allDepts[0];

  console.log('Entities available:', allEntities.map(e => `${e.code} (${e.id})`));
  console.log('Primary Dept:', techDept?.name);

  // 2. Clear all dummy notifications, applications, and logs
  console.log('Cleaning test notifications, applications, and audit logs...');
  await db.delete(notifications);
  await db.delete(passwordResetOtps);
  await db.delete(applications);
  await db.delete(taskTemplates);

  // 3. Clear existing tasks, sprints, epics, initiatives, meetings
  console.log('Clearing old tasks, sprints, epics, initiatives...');
  await db.delete(taskChecklists);
  await db.delete(taskComments);
  await db.delete(taskNotes);
  await db.delete(tasks);
  await db.delete(sprints);
  await db.delete(epics);
  await db.delete(initiatives);
  await db.delete(meetingAttendees);
  await db.delete(meetings);

  // 4. Clean and retain only the 4 specified team members: Ashutosh, Pranshu, Harshit, Eustace
  console.log('Synchronizing clean team members...');

  const targetMembers = [
    {
      code: 'EHM-ADM01',
      firstName: 'Ashutosh',
      lastName: 'Mishra',
      email: 'ashutosh@ehmconsultancy.com',
      role: 'ADMIN' as const,
      designation: 'System Administrator & VP Tech',
      entityId: ehmEntity.id,
      departmentId: techDept.id,
      password: 'password123',
    },
    {
      code: 'EHM-MGR01',
      firstName: 'Pranshu',
      lastName: 'Dubey',
      email: 'dubey.pranshu@gmail.com',
      role: 'MANAGER' as const,
      designation: 'Product & Operations Lead',
      entityId: ehmEntity.id,
      departmentId: techDept.id,
      password: 'password123',
    },
    {
      code: 'EHM-MGR08',
      firstName: 'Harshit',
      lastName: 'Mishra',
      email: 'harshit@ehmconsultancy.com',
      role: 'MANAGER' as const,
      designation: 'Lead Engineer',
      entityId: ehmEntity.id,
      departmentId: techDept.id,
      password: 'password123',
    },
    {
      code: 'EHM-MGR06',
      firstName: 'Utsav',
      lastName: 'Mishra',
      email: 'utsav@ehmconsultancy.co.in',
      role: 'MANAGER' as const,
      designation: 'Operations Specialist',
      entityId: ehmEntity.id,
      departmentId: techDept.id,
      password: 'password123',
    },
    {
      code: 'CAG-EMP01',
      firstName: 'Eustace',
      lastName: '',
      email: 'eustace@climagro.com',
      role: 'EMPLOYEE' as const,
      designation: 'Frontend & UI Specialist',
      entityId: cagEntity.id,
      departmentId: techDept.id,
      password: 'password123',
    },
  ];

  // Map to hold saved employee records
  const memberMap: Record<string, any> = {};

  for (const m of targetMembers) {
    let [emp] = await db
      .select()
      .from(employees)
      .where(sql`TRIM(LOWER(${employees.email})) = ${m.email.toLowerCase()}`);

    if (!emp) {
      // Check by firstName if email was different previously
      const [empByName] = await db
        .select()
        .from(employees)
        .where(sql`TRIM(LOWER(${employees.firstName})) = ${m.firstName.toLowerCase()}`);
      if (empByName) {
        [emp] = await db
          .update(employees)
          .set({
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            employeeCode: m.code,
            designation: m.designation,
            entityId: m.entityId,
            departmentId: m.departmentId,
            joiningDate: new Date('2026-01-01'),
          })
          .where(eq(employees.id, empByName.id))
          .returning();
      } else {
        [emp] = await db
          .insert(employees)
          .values({
            employeeCode: m.code,
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            entityId: m.entityId,
            departmentId: m.departmentId,
            designation: m.designation,
            joiningDate: new Date('2026-01-01'),
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          })
          .returning();
      }
    } else {
      [emp] = await db
        .update(employees)
        .set({
          firstName: m.firstName,
          lastName: m.lastName,
          employeeCode: m.code,
          designation: m.designation,
          entityId: m.entityId,
          departmentId: m.departmentId,
        })
        .where(eq(employees.id, emp.id))
        .returning();
    }

    memberMap[m.firstName] = emp;

    // Ensure User account
    const hash = await bcrypt.hash(m.password, 10);
    const [existingUser] = await db
      .select()
      .from(users)
      .where(sql`TRIM(LOWER(${users.email})) = ${m.email.toLowerCase()}`);

    if (!existingUser) {
      await db.insert(users).values({
        email: m.email,
        passwordHash: hash,
        role: m.role,
        status: 'ACTIVE',
        employeeId: emp.id,
      });
    } else {
      await db.update(users).set({
        passwordHash: hash,
        role: m.role,
        status: 'ACTIVE',
        employeeId: emp.id,
      }).where(eq(users.id, existingUser.id));
    }
  }

  // Delete any other dummy employees not in our 4-person list
  const allowedEmails = targetMembers.map(m => m.email.toLowerCase());
  const allCurrentEmps = await db.select().from(employees);
  for (const emp of allCurrentEmps) {
    if (emp.email && !allowedEmails.includes(emp.email.toLowerCase())) {
      console.log(`Removing dummy employee: ${emp.firstName} ${emp.lastName} (${emp.email})`);
      await db.delete(invites).where(or(eq(invites.employeeId, emp.id), eq(invites.email, emp.email)));
      await db.delete(users).where(or(eq(users.employeeId, emp.id), eq(users.email, emp.email)));
      await db.delete(employees).where(eq(employees.id, emp.id));
    }
  }

  // 5. Create 1 Clean Initiative
  console.log('Creating 1 clean Strategic Initiative...');
  const [cleanInit] = await db
    .insert(initiatives)
    .values({
      initiativeCode: 'EHM-I01',
      entityId: ehmEntity.id,
      departmentId: techDept.id,
      subDepartment: 'Platform Engineering',
      title: 'Platform Modernization & Core Infrastructure',
      description: 'Enterprise HR & project management foundation with multi-tenant architecture',
      targetMonth: 'Month 1 (Weeks 1–4)',
      epicsCountTarget: 1,
      targetDeliverableMetric: '100% Core System Uptime',
      status: 'ACTIVE',
      ownerId: memberMap['Pranshu']?.id || memberMap['Ashutosh']?.id,
      targetDate: new Date(Date.now() + 30 * 86400000),
    })
    .returning();

  // 6. Create 1 Clean Epic
  console.log('Creating 1 clean Epic linked to Initiative...');
  const [cleanEpic] = await db
    .insert(epics)
    .values({
      epicCode: 'EHM-I01-EP01',
      title: 'Enterprise RBAC & Security Hardening',
      description: 'Implement role boundaries, session management, and task approval workflows',
      initiativeId: cleanInit.id,
      entityId: ehmEntity.id,
      department: 'Technology',
      ownerId: memberMap['Pranshu']?.id,
      status: 'IN_PROGRESS',
      targetDate: new Date(Date.now() + 14 * 86400000),
    })
    .returning();

  // 7. Create 1 Clean Sprint
  console.log('Creating 1 clean 4-Week Sprint...');
  const [cleanSprint] = await db
    .insert(sprints)
    .values({
      sprintCode: 'EHM-S01',
      name: 'Sprint 1: Core Foundation & Delivery',
      entityId: ehmEntity.id,
      employeeId: memberMap['Harshit']?.id || memberMap['Ashutosh']?.id,
      reviewingLeadId: memberMap['Pranshu']?.id || memberMap['Ashutosh']?.id,
      epicId: cleanEpic.id,
      goal: 'Deliver initial verified modules and workflows',
      targetWeek: 'Week 1 (Days 1–7)',
      startDate: new Date(),
      endDate: new Date(Date.now() + 28 * 86400000),
      status: 'ACTIVE',
    })
    .returning();

  // 8. Create 1 Clean Task
  console.log('Creating 1 clean Sprint Task with checkpoints...');
  const [cleanTask] = await db
    .insert(tasks)
    .values({
      taskCode: 'EHM-I01-EP01-T001',
      title: 'Configure Production Environment & Verify RBAC Workflows',
      description: 'Deploy verified backend services, configure SSL pools, and validate user permissions.',
      entityId: ehmEntity.id,
      departmentId: techDept.id,
      taskType: 'SPRINT_TASK',
      sprintWeek: 'Week 1 (Days 1–7)',
      sprintId: cleanSprint.id,
      initiativeId: cleanInit.id,
      epicId: cleanEpic.id,
      assigneeId: memberMap['Harshit']?.id || memberMap['Ashutosh']?.id,
      creatorId: memberMap['Ashutosh']?.id,
      reviewingLeadId: memberMap['Pranshu']?.id || memberMap['Ashutosh']?.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 7 * 86400000),
      storyPoints: 5,
    })
    .returning();

  // Add 3 default checkpoints
  await db.insert(taskChecklists).values([
    { taskId: cleanTask.id, itemText: 'Checkpoint 1: Setup Environment Secrets & TLS', isCompleted: true, sortOrder: 0, completedAt: new Date() },
    { taskId: cleanTask.id, itemText: 'Checkpoint 2: Test Multi-Role Access Barriers', isCompleted: false, sortOrder: 1 },
    { taskId: cleanTask.id, itemText: 'Checkpoint 3: Lead Sign-off & Verification', isCompleted: false, sortOrder: 2 },
  ]);

  // Add 1 initial activity comment
  await db.insert(taskComments).values({
    taskId: cleanTask.id,
    authorId: memberMap['Ashutosh']?.id,
    authorName: 'Ashutosh',
    content: 'All security checks and RBAC barriers have been verified with 100% pass rate.',
    isSystemLog: false,
  });

  console.log('\n======================================================');
  console.log('✨ DATABASE CLEANUP & INITIALIZATION COMPLETE');
  console.log('======================================================');
  console.log('Team Members in Database:');
  const finalEmps = await db.select().from(employees);
  for (const e of finalEmps) {
    const [u] = await db.select().from(users).where(eq(users.employeeId, e.id));
    console.log(`  👤 ${e.firstName} ${e.lastName} [${e.employeeCode}] - ${e.email} | Role: ${u?.role || 'EMPLOYEE'} | ${e.designation}`);
  }
  console.log('\nInitiative:', cleanInit.initiativeCode, cleanInit.title);
  console.log('Epic:      ', cleanEpic.epicCode, cleanEpic.title);
  console.log('Sprint:    ', cleanSprint.sprintCode, cleanSprint.name);
  console.log('Task:      ', cleanTask.taskCode, cleanTask.title);
  console.log('======================================================\n');
}

setupCleanProductionData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
