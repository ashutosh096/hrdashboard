process.env.NODE_ENV = 'test';
import { app } from './index.js';
import { db, users, employees, employeeCodeHistory, entities, departments, initiatives, epics, sprints, tasks, projects, globalCounters, eq, sql } from '@workspace/db';
import jwt from 'jsonwebtoken';
import http from 'node:http';
import { JWT_SECRET } from './config/jwt.js';

const TEST_PORT = 5099;
const API_BASE = `http://127.0.0.1:${TEST_PORT}`;

async function runStep2Verification() {
  console.log('========================================================================');
  console.log('🚀 STEP 2: NEW CODE FORMATS VERIFICATION');
  console.log('========================================================================\n');

  const runId = Date.now();
  const testTag = `[STEP2_TEST_${runId}]`;

  // Tracking arrays for guaranteed cleanup
  const createdProjectIds: string[] = [];
  const createdTaskIds: string[] = [];
  const createdSprintIds: string[] = [];
  const createdEpicIds: string[] = [];
  const createdInitiativeIds: string[] = [];
  const createdEmployeeIds: string[] = [];
  const createdEmails: string[] = [];
  const createdCodes: string[] = [];

  const server: http.Server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => {
      console.log(`[TEST SERVER READY] on ${API_BASE}`);
      resolve(s);
    });
  });

  try {
    // Find Admin for auth
    const [adminUser] = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
    if (!adminUser) throw new Error('Admin user required for Step 2 testing');

    const token = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
        role: 'ADMIN',
        employeeId: adminUser.employeeId,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const authHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const [ehmEntity] = await db.select().from(entities).where(eq(entities.code, 'EHM'));
    const [cagEntity] = await db.select().from(entities).where(eq(entities.code, 'CAG'));
    const [firstDept] = await db.select().from(departments).limit(1);

    // 1. TEAM MEMBER (TEAM####)
    console.log('--- 1. Testing Team Member (TEAM####) Generation & Immutability ---');
    const empEmail = `step2.test.${runId}@example.com`;
    createdEmails.push(empEmail);

    const empRes = await fetch(`${API_BASE}/api/employees`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        firstName: 'StepTwo',
        lastName: `Tester_${runId}`,
        email: empEmail,
        designation: 'Staff Engineer',
        role: 'EMPLOYEE',
        entityId: ehmEntity.id,
        departmentId: firstDept.id,
      }),
    });
    const empData: any = await empRes.json();
    console.log('Create Employee status:', empRes.status);
    console.log('Created Employee Code:', empData.employee?.employeeCode);
    const teamCode = empData.employee?.employeeCode;
    if (empData.employee?.id) {
      createdEmployeeIds.push(empData.employee.id);
    }
    if (teamCode) createdCodes.push(teamCode);

    if (!/^TEAM\d{4}$/.test(teamCode)) {
      throw new Error(`Expected TEAM#### format, got: ${teamCode}`);
    }
    console.log('✅ PASS: Team member code format is TEAM####:', teamCode);

    // Test employee entity change (role unchanged): code must NOT change
    const updateEntityRes = await fetch(`${API_BASE}/api/employees/${empData.employee.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        firstName: 'StepTwo',
        lastName: `Tester_${runId}`,
        email: empEmail,
        designation: 'Director of Engineering',
        role: 'EMPLOYEE',
        entityId: cagEntity.id,
        departmentId: firstDept.id,
      }),
    });
    const updateEntityData: any = await updateEntityRes.json();
    console.log('Updated Employee Code after entity change:', updateEntityData.employee?.employeeCode);
    if (updateEntityData.employee?.employeeCode !== teamCode) {
      throw new Error(`Expected employee code to remain ${teamCode} on entity change, got: ${updateEntityData.employee?.employeeCode}`);
    }
    console.log('✅ PASS: Employee code is unchanged across entity updates!');

    // Test employee role change: EMPLOYEE -> MANAGER:
    // Code prefix changes to MANA, number comes from next_mana_seq, row added to employee_code_history
    const [counterBeforeRole] = await db.select().from(globalCounters).where(eq(globalCounters.id, 1));
    const expectedManaSeq = counterBeforeRole.nextManaSeq;
    const expectedManaCode = `MANA${String(expectedManaSeq).padStart(4, '0')}`;

    const updateRoleRes = await fetch(`${API_BASE}/api/employees/${empData.employee.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        role: 'MANAGER',
      }),
    });
    const updateRoleData: any = await updateRoleRes.json();
    const newManaCode = updateRoleData.employee?.employeeCode;
    console.log('Updated Employee Code after role change to MANAGER:', newManaCode);
    if (newManaCode !== expectedManaCode) {
      throw new Error(`Expected employee code to be ${expectedManaCode}, got: ${newManaCode}`);
    }
    if (!/^MANA\d{4}$/.test(newManaCode)) {
      throw new Error(`Expected employee code to match ^MANA\\d{4}$, got: ${newManaCode}`);
    }

    // Verify employee_code_history row exists
    const [histRow] = await db
      .select()
      .from(employeeCodeHistory)
      .where(eq(employeeCodeHistory.employeeId, empData.employee.id));
    if (!histRow) {
      throw new Error(`Expected row in employee_code_history for employee ${empData.employee.id}, but none found!`);
    }
    if (histRow.oldCode !== teamCode || histRow.newCode !== newManaCode || histRow.oldRole !== 'EMPLOYEE' || histRow.newRole !== 'MANAGER') {
      throw new Error(`History row values unexpected: ${JSON.stringify(histRow)}`);
    }
    console.log('✅ PASS: Role change updated code prefix to MANA from counter and recorded employee_code_history!');

    // Test manual code edit: access and permissions unchanged
    await db.update(employees).set({ employeeCode: 'MANA8888' }).where(eq(employees.id, empData.employee.id));
    const [createdUser] = await db.select().from(users).where(eq(users.email, empEmail));
    if (createdUser) {
      const manualUserToken = jwt.sign(
        { id: createdUser.id, email: createdUser.email, role: createdUser.role, employeeId: empData.employee.id },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const permRes = await fetch(`${API_BASE}/api/employees`, {
        headers: { Authorization: `Bearer ${manualUserToken}` }
      });
      if (permRes.status !== 200) {
        throw new Error(`Expected access 200 after manual code edit, got: ${permRes.status}`);
      }
      console.log('✅ PASS: Access is unchanged after manual code edit (permissions come from users.role)!');
    }

    // 2. INITIATIVE (INIT####)
    console.log('\n--- 2. Testing Initiative (INIT####) Generation ---');
    const initRes = await fetch(`${API_BASE}/api/initiatives`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: `${testTag} Initiative`,
        description: 'Verifying INIT format',
        entityId: ehmEntity.id,
        status: 'PLANNED',
      }),
    });
    const initData: any = await initRes.json();
    console.log('Create Initiative status:', initRes.status);
    console.log('Created Initiative Code:', initData.initiativeCode);
    if (initData.id) createdInitiativeIds.push(initData.id);
    if (initData.initiativeCode) createdCodes.push(initData.initiativeCode);

    if (!/^INIT\d{4}$/.test(initData.initiativeCode)) {
      throw new Error(`Expected INIT#### format, got: ${initData.initiativeCode}`);
    }
    console.log('✅ PASS: Initiative code format is INIT####:', initData.initiativeCode);

    // 3. EPIC (EPIC####) - linked and standalone
    console.log('\n--- 3. Testing Epic (EPIC####) Generation ---');
    const epicLinkedRes = await fetch(`${API_BASE}/api/epics`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: `${testTag} Linked Epic`,
        description: 'Verifying EPIC format with initiative',
        initiativeId: initData.id,
        entityId: ehmEntity.id,
      }),
    });
    const epicLinkedData: any = await epicLinkedRes.json();
    console.log('Created Linked Epic Code:', epicLinkedData.epicCode);
    if (epicLinkedData.id) createdEpicIds.push(epicLinkedData.id);
    if (epicLinkedData.epicCode) createdCodes.push(epicLinkedData.epicCode);

    if (!/^EPIC\d{4}$/.test(epicLinkedData.epicCode)) {
      throw new Error(`Expected EPIC#### format, got: ${epicLinkedData.epicCode}`);
    }
    console.log('✅ PASS: Linked Epic code format is EPIC####:', epicLinkedData.epicCode);

    const epicStandaloneRes = await fetch(`${API_BASE}/api/epics`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: `${testTag} Standalone Epic`,
        description: 'Verifying EPIC format without initiative',
        entityId: cagEntity.id,
      }),
    });
    const epicStandaloneData: any = await epicStandaloneRes.json();
    console.log('Created Standalone Epic Code:', epicStandaloneData.epicCode);
    if (epicStandaloneData.id) createdEpicIds.push(epicStandaloneData.id);
    if (epicStandaloneData.epicCode) createdCodes.push(epicStandaloneData.epicCode);

    if (!/^EPIC\d{4}$/.test(epicStandaloneData.epicCode)) {
      throw new Error(`Expected EPIC#### format, got: ${epicStandaloneData.epicCode}`);
    }
    console.log('✅ PASS: Standalone Epic code format is EPIC####:', epicStandaloneData.epicCode);

    // 4. SPRINT (SPRT####)
    console.log('\n--- 4. Testing Sprint (SPRT####) Generation ---');
    const sprintRes = await fetch(`${API_BASE}/api/sprints`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        employeeId: empData.employee.id,
        name: `${testTag} Sprint`,
        targetWeek: 'Week 2',
        status: 'ACTIVE',
      }),
    });
    const sprintData: any = await sprintRes.json();
    console.log('Create Sprint status:', sprintRes.status);
    console.log('Created Sprint Code:', sprintData.sprintCode);
    if (sprintData.id) createdSprintIds.push(sprintData.id);
    if (sprintData.sprintCode) createdCodes.push(sprintData.sprintCode);

    if (!/^SPRT\d{4}$/.test(sprintData.sprintCode)) {
      throw new Error(`Expected SPRT#### format, got: ${sprintData.sprintCode}`);
    }
    console.log('✅ PASS: Sprint code format is SPRT####:', sprintData.sprintCode);

    // 5. TASKS: EPIC TASK (TASK####), SPRINT TASK (STSK####), BACKLOG TASK (BLOG####)
    console.log('\n--- 5. Testing Tasks: Epic Task (TASK####), Sprint Task (STSK####), Backlog (BLOG####) ---');
    
    // 5a. Epic Task
    const epicTaskRes = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: `${testTag} Epic Task`,
        assigneeId: empData.employee.id,
        entityId: ehmEntity.id,
        departmentId: firstDept.id,
        epicId: epicLinkedData.id,
        status: 'TODO',
      }),
    });
    const epicTaskData: any = await epicTaskRes.json();
    console.log('Created Epic Task Code:', epicTaskData.taskCode);
    if (epicTaskData.id) createdTaskIds.push(epicTaskData.id);
    if (epicTaskData.taskCode) createdCodes.push(epicTaskData.taskCode);

    if (!/^TASK\d{4}$/.test(epicTaskData.taskCode)) {
      throw new Error(`Expected TASK#### format, got: ${epicTaskData.taskCode}`);
    }
    console.log('✅ PASS: Epic task code format is TASK####:', epicTaskData.taskCode);

    // 5b. Sprint Task
    const sprintTaskRes = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: `${testTag} Sprint Task`,
        assigneeId: empData.employee.id,
        entityId: ehmEntity.id,
        departmentId: firstDept.id,
        sprintId: sprintData.id,
        status: 'TODO',
      }),
    });
    const sprintTaskData: any = await sprintTaskRes.json();
    console.log('Created Sprint Task Code:', sprintTaskData.taskCode);
    if (sprintTaskData.id) createdTaskIds.push(sprintTaskData.id);
    if (sprintTaskData.taskCode) createdCodes.push(sprintTaskData.taskCode);

    if (!/^STSK\d{4}$/.test(sprintTaskData.taskCode)) {
      throw new Error(`Expected STSK#### format, got: ${sprintTaskData.taskCode}`);
    }
    console.log('✅ PASS: Sprint task code format is STSK####:', sprintTaskData.taskCode);

    // 5c. Standalone Backlog Task
    const backlogTaskRes = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: `${testTag} Backlog Task`,
        assigneeId: empData.employee.id,
        entityId: ehmEntity.id,
        departmentId: firstDept.id,
        status: 'BACKLOG',
      }),
    });
    const backlogTaskData: any = await backlogTaskRes.json();
    console.log('Created Backlog Task Code:', backlogTaskData.taskCode);
    if (backlogTaskData.id) createdTaskIds.push(backlogTaskData.id);
    if (backlogTaskData.taskCode) createdCodes.push(backlogTaskData.taskCode);

    if (!/^BLOG\d{4}$/.test(backlogTaskData.taskCode)) {
      throw new Error(`Expected BLOG#### format, got: ${backlogTaskData.taskCode}`);
    }
    console.log('✅ PASS: Backlog task code format is BLOG####:', backlogTaskData.taskCode);

    // 5d. Task Clone Endpoint
    console.log('\n--- 6. Testing Task Clone Endpoint ---');
    const cloneRes = await fetch(`${API_BASE}/api/tasks/${epicTaskData.id}/clone`, {
      method: 'POST',
      headers: authHeaders,
    });
    const cloneData: any = await cloneRes.json();
    console.log('Cloned Task Code (from Epic Task):', cloneData.taskCode);
    if (cloneData.id) createdTaskIds.push(cloneData.id);
    if (cloneData.taskCode) createdCodes.push(cloneData.taskCode);

    if (!/^TASK\d{4}$/.test(cloneData.taskCode)) {
      throw new Error(`Expected cloned Epic Task to have TASK#### format, got: ${cloneData.taskCode}`);
    }
    console.log('✅ PASS: Cloned Epic Task gets next TASK#### code:', cloneData.taskCode);

    // 6. PROJECT (PROJ####)
    console.log('\n--- 7. Testing Project (PROJ####) Generation ---');
    const projRes = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `${testTag} Project`,
        entity: 'EHM',
        category: 'General',
      }),
    });
    const projData: any = await projRes.json();
    console.log('Create Project status:', projRes.status);
    console.log('Created Project Code:', projData.code);
    if (projData.id) createdProjectIds.push(projData.id);
    if (projData.code) createdCodes.push(projData.code);

    if (!/^PROJ\d{4}$/.test(projData.code)) {
      throw new Error(`Expected PROJ#### format, got: ${projData.code}`);
    }
    console.log('✅ PASS: Project code format is PROJ####:', projData.code);

    // 7. DELETION & GAP PRESERVATION (NEVER REUSE DELETED NUMBERS)
    console.log('\n--- 8. Testing Gap Preservation on Deletion ---');
    // Delete the project just created
    await db.delete(projects).where(eq(projects.id, projData.id));
    const deletedProjIdx = createdProjectIds.indexOf(projData.id);
    if (deletedProjIdx >= 0) createdProjectIds.splice(deletedProjIdx, 1);

    // Create another project - should have higher sequence, never re-use the deleted one!
    const proj2Res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `${testTag} Project Subsequent`,
        entity: 'EHM',
        category: 'General',
      }),
    });
    const proj2Data: any = await proj2Res.json();
    if (proj2Data.id) createdProjectIds.push(proj2Data.id);
    if (proj2Data.code) createdCodes.push(proj2Data.code);

    const prevNum = parseInt(projData.code.replace('PROJ', ''), 10);
    const nextNum = parseInt(proj2Data.code.replace('PROJ', ''), 10);
    console.log(`Deleted project was: ${projData.code} (#${prevNum}), next project is: ${proj2Data.code} (#${nextNum})`);
    if (nextNum <= prevNum) {
      throw new Error(`Expected nextNum (${nextNum}) > prevNum (${prevNum}) - deleted number was reused!`);
    }
    console.log('✅ PASS: Counter never reuses deleted numbers (gap preserved)!');

    console.log('\n========================================================================');
    console.log('🎉 ALL STEP 2 CODE FORMAT VERIFICATIONS PASSED PERFECTLY!');
    console.log('========================================================================');
  } finally {
    console.log('\n--- 🧹 Guaranteed Finally Cleanup: Purging all test records ---');
    try {
      // 1. Delete notifications referencing test codes or tagged items
      if (createdCodes.length > 0) {
        for (const code of createdCodes) {
          await db.execute(sql`DELETE FROM notifications WHERE title LIKE ${'%' + code + '%'} OR message LIKE ${'%' + code + '%'}`);
        }
      }

      // 2. Delete task comments & checklists for test tasks
      if (createdTaskIds.length > 0) {
        for (const tid of createdTaskIds) {
          await db.execute(sql`DELETE FROM task_comments WHERE task_id = ${tid}`);
          await db.execute(sql`DELETE FROM task_checklists WHERE task_id = ${tid}`);
        }
        for (const tid of createdTaskIds) {
          await db.delete(tasks).where(eq(tasks.id, tid));
        }
      }

      // 3. Delete sprints
      for (const sid of createdSprintIds) {
        await db.delete(sprints).where(eq(sprints.id, sid));
      }

      // 4. Delete epics
      for (const eid of createdEpicIds) {
        await db.delete(epics).where(eq(epics.id, eid));
      }

      // 5. Delete initiatives
      for (const iid of createdInitiativeIds) {
        await db.delete(initiatives).where(eq(initiatives.id, iid));
      }

      // 6. Delete projects
      for (const pid of createdProjectIds) {
        await db.delete(projects).where(eq(projects.id, pid));
      }

      // 7. Delete users and invites for created emails
      for (const email of createdEmails) {
        await db.execute(sql`DELETE FROM invites WHERE email = ${email}`);
        await db.execute(sql`DELETE FROM users WHERE email = ${email}`);
      }

      // 8. Delete employees & history
      for (const empId of createdEmployeeIds) {
        await db.delete(employeeCodeHistory).where(eq(employeeCodeHistory.employeeId, empId));
        await db.delete(employees).where(eq(employees.id, empId));
      }
      console.log('✅ Finally cleanup completed cleanly.');
    } catch (cleanupErr) {
      console.error('⚠️ Cleanup in finally block encountered error:', cleanupErr);
    }

    server.close();
  }
}

runStep2Verification().catch((err) => {
  console.error('\n❌ Step 2 Verification Failed:', err);
  process.exit(1);
});
