import { db, notifications, tasks, sprints, epics, initiatives, projects, employees, users, eq, and, sql } from '@workspace/db';
import { dispatchNotification } from '../artifacts/api-server/src/services/notificationDispatcher.js';

async function run() {
  console.log('=== STARTING SURNAME ISOLATION VERIFICATION ===');

  // Employee A: Priyanka Sharma
  const [empA] = await db.select().from(employees).where(eq(employees.id, 'd3a231fa-5d33-4249-a17d-102765de4e09'));
  const [userA] = await db.select().from(users).where(eq(users.id, 'e65b4540-5f3b-407c-aa1e-e6fff984d9c3'));

  // Employee B: Tarul Sharma (Same surname "Sharma", non-admin EMPLOYEE)
  const [empB] = await db.select().from(employees).where(eq(employees.id, 'e80c26a6-0696-45e5-857f-540ff91058b3'));
  const [userB] = await db.select().from(users).where(eq(users.id, '64f41606-a849-4fa0-951d-978747036553'));

  // Admin: Ashutosh Mishra (ADMIN role)
  const [adminUser] = await db.select().from(users).where(eq(users.id, 'c20f5e78-aa5b-49ea-9a01-f69f34d91fb7'));
  const [adminEmp] = await db.select().from(employees).where(eq(employees.id, adminUser!.employeeId!));
  const adminName = `${adminEmp?.firstName || ''} ${adminEmp?.lastName || ''}`.trim() || 'Ashutosh Mishra';

  // Actor: Pranshu Mohan
  const [actorUser] = await db.select().from(users).where(eq(users.id, '6a82e692-0b48-441e-b26f-09dbfd6c0ca9'));
  const [actorEmp] = await db.select().from(employees).where(eq(employees.id, actorUser!.employeeId!));
  const actorName = `${actorEmp?.firstName || ''} ${actorEmp?.lastName || ''}`.trim() || 'Pranshu Mohan';

  console.log(`Emp A: ${empA?.firstName} ${empA?.lastName} (User ID: ${userA?.id}, Emp ID: ${empA?.id})`);
  console.log(`Emp B: ${empB?.firstName} ${empB?.lastName} (User ID: ${userB?.id}, Emp ID: ${empB?.id})`);
  console.log(`Admin: ${adminName} (User ID: ${adminUser?.id})`);
  console.log(`Actor: ${actorName} (User ID: ${actorUser?.id})`);

  const createdEntities: { type: string; id: string }[] = [];
  const testNotifIds: string[] = [];
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const recordNotifs = async (entityId: string, expectedCount: number) => {
    let rows: any[] = [];
    for (let i = 0; i < 30; i++) {
      await sleep(100);
      rows = await db.select().from(notifications).where(
        sql`payload->>'entityId' = ${entityId}`
      );
      if (rows.length >= expectedCount) break;
    }
    for (const r of rows) {
      testNotifIds.push(r.id);
    }
    return rows;
  };

  const results: any[] = [];

  try {
    // 1. SPRINT
    console.log('\n--- 1. Testing SPRINT ---');
    const [testSprint] = await db.insert(sprints).values({
      sprintCode: 'SPRT_TEST_9999',
      entityId: empA!.entityId,
      name: 'Surname Isolation Test Sprint',
      employeeId: empA!.id, // Assigned to Emp A only
      reviewingLeadId: empA!.id,
      createdById: actorUser!.employeeId!,
      status: 'PLANNED',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-25'),
    }).returning();
    createdEntities.push({ type: 'sprint', id: testSprint.id });

    // Lifecycle 1: Create
    await dispatchNotification({
      entity: {
        entityType: 'SPRINT',
        entityId: testSprint.id,
        entityCode: testSprint.sprintCode,
        title: testSprint.name,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'SPRINT_ASSIGNED',
      title: testSprint.name,
      message: `${actorName} assigned you to sprint [${testSprint.sprintCode}] '${testSprint.name}'.`,
    });
    await sleep(200);

    // Lifecycle 2: Status Change
    await dispatchNotification({
      entity: {
        entityType: 'SPRINT',
        entityId: testSprint.id,
        entityCode: testSprint.sprintCode,
        title: testSprint.name,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'STATUS_CHANGED',
      title: testSprint.name,
      message: `Sprint [${testSprint.sprintCode}] status updated to ACTIVE by ${actorName}.`,
    });
    await sleep(200);

    // Lifecycle 3: Due Date Change
    await dispatchNotification({
      entity: {
        entityType: 'SPRINT',
        entityId: testSprint.id,
        entityCode: testSprint.sprintCode,
        title: testSprint.name,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'DUE_DATE_CHANGED',
      title: testSprint.name,
      message: `Sprint [${testSprint.sprintCode}] due date updated to 2026-10-30 by ${actorName}.`,
    });

    const sprintNotifs = await recordNotifs(testSprint.id, 3);
    const sprintA = sprintNotifs.filter(n => n.userId === userA!.id).length;
    const sprintB = sprintNotifs.filter(n => n.userId === userB!.id).length;
    const sprintActor = sprintNotifs.filter(n => n.userId === actorUser!.id).length;
    const sprintAdmin = sprintNotifs.filter(n => n.userId === adminUser!.id).length;
    console.log(`Sprint Notifs -> Emp A: ${sprintA}, Emp B: ${sprintB}, Actor: ${sprintActor}, Admin: ${sprintAdmin}`);
    results.push({ entity: 'SPRINT', EmpA: sprintA, EmpB: sprintB, Actor: sprintActor, Admin: sprintAdmin, pass: sprintA === 3 && sprintB === 0 && sprintActor === 0 && sprintAdmin === 0 });

    // 2. EPIC
    console.log('\n--- 2. Testing EPIC ---');
    const [testEpic] = await db.insert(epics).values({
      epicCode: 'EPC_TEST_9999',
      entityId: empA!.entityId,
      title: 'Surname Isolation Test Epic',
      ownerId: empA!.id, // Assigned to Emp A only
      createdById: actorUser!.employeeId!,
      status: 'PLANNED',
      targetDate: new Date('2026-11-01'),
    }).returning();
    createdEntities.push({ type: 'epic', id: testEpic.id });

    // Lifecycle 1: Create
    await dispatchNotification({
      entity: {
        entityType: 'EPIC',
        entityId: testEpic.id,
        entityCode: testEpic.epicCode,
        title: testEpic.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'EPIC_ASSIGNED',
      title: testEpic.title,
      message: `${actorName} assigned you as lead for epic [${testEpic.epicCode}] '${testEpic.title}'.`,
    });
    await sleep(200);

    // Lifecycle 2: Status Change
    await dispatchNotification({
      entity: {
        entityType: 'EPIC',
        entityId: testEpic.id,
        entityCode: testEpic.epicCode,
        title: testEpic.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'STATUS_CHANGED',
      title: testEpic.title,
      message: `Epic '${testEpic.title}' status changed to IN_PROGRESS.`,
    });
    await sleep(200);

    // Lifecycle 3: Due Date Change
    await dispatchNotification({
      entity: {
        entityType: 'EPIC',
        entityId: testEpic.id,
        entityCode: testEpic.epicCode,
        title: testEpic.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'DUE_DATE_CHANGED',
      title: testEpic.title,
      message: `Epic '${testEpic.title}' due date updated.`,
    });

    const epicNotifs = await recordNotifs(testEpic.id, 18);
    const epicA = epicNotifs.filter(n => n.userId === userA!.id).length;
    const epicB = epicNotifs.filter(n => n.userId === userB!.id).length;
    const epicActor = epicNotifs.filter(n => n.userId === actorUser!.id).length;
    const epicAdmin = epicNotifs.filter(n => n.userId === adminUser!.id).length;
    console.log(`Epic Notifs -> Emp A: ${epicA}, Emp B: ${epicB}, Actor: ${epicActor}, Admin: ${epicAdmin}`);
    results.push({ entity: 'EPIC', EmpA: epicA, EmpB: epicB, Actor: epicActor, Admin: epicAdmin, pass: epicA === 3 && epicB === 0 && epicActor === 0 && epicAdmin === 3 });

    // 3. INITIATIVE
    console.log('\n--- 3. Testing INITIATIVE ---');
    const [testInit] = await db.insert(initiatives).values({
      initiativeCode: 'INIT_TEST_9999',
      entityId: empA!.entityId,
      title: 'Surname Isolation Test Initiative',
      ownerId: empA!.id, // Assigned to Emp A only
      createdById: actorUser!.employeeId!,
      status: 'PLANNED',
      targetDate: new Date('2026-11-15'),
    }).returning();
    createdEntities.push({ type: 'initiative', id: testInit.id });

    // Lifecycle 1: Create
    await dispatchNotification({
      entity: {
        entityType: 'INITIATIVE',
        entityId: testInit.id,
        entityCode: testInit.initiativeCode,
        title: testInit.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'INITIATIVE_ASSIGNED',
      title: testInit.title,
      message: `${actorName} assigned you as owner for initiative [${testInit.initiativeCode}] '${testInit.title}'.`,
    });
    await sleep(200);

    // Lifecycle 2: Status Change
    await dispatchNotification({
      entity: {
        entityType: 'INITIATIVE',
        entityId: testInit.id,
        entityCode: testInit.initiativeCode,
        title: testInit.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'STATUS_CHANGED',
      title: testInit.title,
      message: `Initiative '${testInit.title}' status changed.`,
    });
    await sleep(200);

    // Lifecycle 3: Due Date Change
    await dispatchNotification({
      entity: {
        entityType: 'INITIATIVE',
        entityId: testInit.id,
        entityCode: testInit.initiativeCode,
        title: testInit.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'DUE_DATE_CHANGED',
      title: testInit.title,
      message: `Initiative '${testInit.title}' target date updated.`,
    });

    const initNotifs = await recordNotifs(testInit.id, 18);
    const initA = initNotifs.filter(n => n.userId === userA!.id).length;
    const initB = initNotifs.filter(n => n.userId === userB!.id).length;
    const initActor = initNotifs.filter(n => n.userId === actorUser!.id).length;
    const initAdmin = initNotifs.filter(n => n.userId === adminUser!.id).length;
    console.log(`Initiative Notifs -> Emp A: ${initA}, Emp B: ${initB}, Actor: ${initActor}, Admin: ${initAdmin}`);
    results.push({ entity: 'INITIATIVE', EmpA: initA, EmpB: initB, Actor: initActor, Admin: initAdmin, pass: initA === 3 && initB === 0 && initActor === 0 && initAdmin === 3 });

    // 4. PROJECT
    console.log('\n--- 4. Testing PROJECT ---');
    const [testProj] = await db.insert(projects).values({
      code: 'PRJ_TEST_9999',
      name: 'Surname Isolation Test Project',
      lead: empA!.id,
      team: [empA!.id], // Assigned to Emp A only
      createdById: actorUser!.employeeId!,
      status: 'Planning',
      targetDate: '2026-11-20',
    }).returning();
    createdEntities.push({ type: 'project', id: testProj.id });

    // Lifecycle 1: Create
    await dispatchNotification({
      entity: {
        entityType: 'PROJECT',
        entityId: testProj.id,
        entityCode: testProj.code,
        title: testProj.name,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'PROJECT_ASSIGNED',
      title: testProj.name,
      message: `${actorName} assigned you to project [${testProj.code}] '${testProj.name}'.`,
    });
    await sleep(200);

    // Lifecycle 2: Status Change
    await dispatchNotification({
      entity: {
        entityType: 'PROJECT',
        entityId: testProj.id,
        entityCode: testProj.code,
        title: testProj.name,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'STATUS_CHANGED',
      title: testProj.name,
      message: `Project '${testProj.name}' status changed.`,
    });
    await sleep(200);

    // Lifecycle 3: Due Date Change
    await dispatchNotification({
      entity: {
        entityType: 'PROJECT',
        entityId: testProj.id,
        entityCode: testProj.code,
        title: testProj.name,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: null,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'DUE_DATE_CHANGED',
      title: testProj.name,
      message: `Project '${testProj.name}' target date updated.`,
    });

    const projNotifs = await recordNotifs(testProj.id, 18);
    const projA = projNotifs.filter(n => n.userId === userA!.id).length;
    const projB = projNotifs.filter(n => n.userId === userB!.id).length;
    const projActor = projNotifs.filter(n => n.userId === actorUser!.id).length;
    const projAdmin = projNotifs.filter(n => n.userId === adminUser!.id).length;
    console.log(`Project Notifs -> Emp A: ${projA}, Emp B: ${projB}, Actor: ${projActor}, Admin: ${projAdmin}`);
    results.push({ entity: 'PROJECT', EmpA: projA, EmpB: projB, Actor: projActor, Admin: projAdmin, pass: projA === 3 && projB === 0 && projActor === 0 && projAdmin === 3 });

    // 5. TASK
    console.log('\n--- 5. Testing TASK ---');
    const [testTask] = await db.insert(tasks).values({
      taskCode: 'TSK_TEST_9999',
      entityId: empA!.entityId,
      departmentId: empA!.departmentId!,
      creatorId: actorUser!.employeeId!,
      title: 'Surname Isolation Test Task',
      assigneeId: empA!.id,
      assigneeIds: [empA!.id], // Assigned to Emp A only
      reviewingLeadId: empA!.id,
      status: 'TODO',
      dueDate: new Date('2026-10-20'),
    }).returning();
    createdEntities.push({ type: 'task', id: testTask.id });

    // Lifecycle 1: Create
    await dispatchNotification({
      entity: {
        entityType: 'TASK',
        entityId: testTask.id,
        entityCode: testTask.taskCode,
        title: testTask.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: empA!.id,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'TASK_ASSIGNED',
      title: testTask.title,
      message: `${actorName} assigned you to task [${testTask.taskCode}] '${testTask.title}'.`,
    });
    await sleep(200);

    // Lifecycle 2: Status Change
    await dispatchNotification({
      entity: {
        entityType: 'TASK',
        entityId: testTask.id,
        entityCode: testTask.taskCode,
        title: testTask.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: empA!.id,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'STATUS_CHANGED',
      title: testTask.title,
      message: `Task [${testTask.taskCode}] status changed.`,
    });
    await sleep(200);

    // Lifecycle 3: Due Date Change
    await dispatchNotification({
      entity: {
        entityType: 'TASK',
        entityId: testTask.id,
        entityCode: testTask.taskCode,
        title: testTask.title,
        assigneeEmployeeIds: [empA!.id],
        reviewingLeadEmployeeId: empA!.id,
      },
      actorUserId: actorUser!.id,
      actorName,
      eventType: 'DUE_DATE_CHANGED',
      title: testTask.title,
      message: `Task [${testTask.taskCode}] due date changed.`,
    });

    const taskNotifs = await recordNotifs(testTask.id, 3);
    const taskA = taskNotifs.filter(n => n.userId === userA!.id).length;
    const taskB = taskNotifs.filter(n => n.userId === userB!.id).length;
    const taskActor = taskNotifs.filter(n => n.userId === actorUser!.id).length;
    const taskAdmin = taskNotifs.filter(n => n.userId === adminUser!.id).length;
    console.log(`Task Notifs -> Emp A: ${taskA}, Emp B: ${taskB}, Actor: ${taskActor}, Admin: ${taskAdmin}`);
    results.push({ entity: 'TASK', EmpA: taskA, EmpB: taskB, Actor: taskActor, Admin: taskAdmin, pass: taskA === 3 && taskB === 0 && taskActor === 0 && taskAdmin === 0 });

    console.log('\n=== VERIFICATION RESULTS SUMMARY ===');
    console.table(results);
    const allPass = results.every(r => r.pass);
    console.log(`ALL ISOLATION TESTS PASSED: ${allPass}`);

  } finally {
    console.log('\n--- CLEANING UP TEST ROWS ONLY ---');
    // Delete notifications
    if (testNotifIds.length > 0) {
      await db.delete(notifications).where(sql`id IN (${sql.join(testNotifIds.map(id => sql`${id}`), sql`, `)})`);
    }

    // Delete created entities
    for (const ent of createdEntities) {
      if (ent.type === 'task') await db.delete(tasks).where(eq(tasks.id, ent.id));
      if (ent.type === 'sprint') await db.delete(sprints).where(eq(sprints.id, ent.id));
      if (ent.type === 'epic') await db.delete(epics).where(eq(epics.id, ent.id));
      if (ent.type === 'initiative') await db.delete(initiatives).where(eq(initiatives.id, ent.id));
      if (ent.type === 'project') await db.delete(projects).where(eq(projects.id, ent.id));
    }

    // Verify 0 test rows remain
    const remainingTasks = await db.select().from(tasks).where(eq(tasks.taskCode, 'TSK_TEST_9999'));
    const remainingSprints = await db.select().from(sprints).where(eq(sprints.sprintCode, 'SPRT_TEST_9999'));
    const remainingEpics = await db.select().from(epics).where(eq(epics.epicCode, 'EPC_TEST_9999'));
    const remainingInits = await db.select().from(initiatives).where(eq(initiatives.initiativeCode, 'INIT_TEST_9999'));
    const remainingProjs = await db.select().from(projects).where(eq(projects.code, 'PRJ_TEST_9999'));

    let remainingNotifsCount = 0;
    if (testNotifIds.length > 0) {
      const remainingNotifs = await db.select().from(notifications).where(
        sql`id IN (${sql.join(testNotifIds.map(id => sql`${id}`), sql`, `)})`
      );
      remainingNotifsCount = remainingNotifs.length;
    }

    console.log(`Remaining Test Entities in DB: Tasks=${remainingTasks.length}, Sprints=${remainingSprints.length}, Epics=${remainingEpics.length}, Initiatives=${remainingInits.length}, Projects=${remainingProjs.length}`);
    console.log(`Remaining Test Notifications in DB: ${remainingNotifsCount}`);
    console.log(`CLEANUP VERIFIED: ${remainingTasks.length + remainingSprints.length + remainingEpics.length + remainingInits.length + remainingProjs.length + remainingNotifsCount === 0 ? 'SUCCESS (0 rows remain)' : 'FAILED'}`);
  }

  process.exit(0);
}

run().catch(e => {
  console.error('Test execution error:', e);
  process.exit(1);
});
