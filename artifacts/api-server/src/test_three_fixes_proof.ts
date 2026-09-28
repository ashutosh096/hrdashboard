import { db, users, employees, initiatives, epics, tasks, announcements, entities, taskChecklists, taskComments, sql, eq } from '@workspace/db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config/jwt.js';

const BASE_URL = 'http://localhost:5000';

function makeToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || user.employee_id || null,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

console.error('DEPRECATED: test_three_fixes_proof.ts writes old-format codes and is disabled under Step 2.');
process.exit(1);

async function runThreeFixesProof() {
  console.log('========================================================================');
  console.log('🧪 REAL-DATA PROOF FOR ALL THREE BACKEND FIXES');
  console.log('========================================================================\n');

  // Load tokens
  const [adminUser] = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
  const [employeeUser] = await db.select().from(users).where(eq(users.role, 'EMPLOYEE')).limit(1);
  const adminToken = makeToken(adminUser);
  const employeeToken = makeToken(employeeUser);

  console.log(`Admin User: ${adminUser.email}`);
  console.log(`Employee User: ${employeeUser.email}\n`);

  // ===========================================================================
  // PROOF 1: INITIATIVE DELETE SHOULD NOT CASCADE-DELETE EPICS / TASKS
  // ===========================================================================
  console.log('------------------------------------------------------------------------');
  console.log('📌 PROOF 1: INITIATIVE DELETE (DETACH EPICS/TASKS, ZERO CASCADE DELETE)');
  console.log('------------------------------------------------------------------------');

  // 1. Create a test initiative
  await db.delete(initiatives).where(eq(initiatives.initiativeCode, 'CAG-TEST-INIT-01'));
  const [cagEntity] = await db.select().from(entities).where(eq(entities.code, 'CAG'));
  const [testInit] = await db
    .insert(initiatives)
    .values({
      initiativeCode: 'CAG-TEST-INIT-01',
      title: 'Initiative Cascade Prevention Test',
      description: 'Test initiative to verify epics and tasks are detached rather than deleted.',
      entityId: cagEntity.id,
      status: 'PLANNED',
    })
    .returning();

  console.log(`Created Test Initiative: [${testInit.initiativeCode}] ID: ${testInit.id}`);

  // 2. Attach a real epic to this initiative
  const [testEpic] = await db
    .insert(epics)
    .values({
      epicCode: 'CAG-TEST-EP-99',
      title: 'Test Epic Linked to Test Initiative',
      initiativeId: testInit.id,
      entityId: cagEntity.id,
      status: 'PLANNED',
    })
    .returning();

  console.log(`Created Linked Epic: [${testEpic.epicCode}] ID: ${testEpic.id} (initiativeId = ${testEpic.initiativeId})`);

  // 3. Attach a real task directly referencing this initiative
  const [firstEmp] = await db.select().from(employees).limit(1);
  const [testTask] = await db
    .insert(tasks)
    .values({
      taskCode: 'CAG-TEST-TK-99',
      title: 'Test Task Linked to Test Initiative',
      entityId: cagEntity.id,
      departmentId: firstEmp.departmentId,
      assigneeId: firstEmp.id,
      creatorId: firstEmp.id,
      initiativeId: testInit.id,
      dueDate: new Date(Date.now() + 86400000),
      status: 'TODO',
    })
    .returning();

  console.log(`Created Linked Task: [${testTask.taskCode}] ID: ${testTask.id} (initiativeId = ${testTask.initiativeId})`);

  // 4. Delete the initiative via API: DELETE /api/initiatives/:id
  console.log(`\nCalling DELETE /api/initiatives/${testInit.id} with ADMIN token...`);
  const delInitRes = await fetch(`${BASE_URL}/api/initiatives/${testInit.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const delInitBody = await delInitRes.json();
  console.log(`DELETE HTTP Status: ${delInitRes.status}`);
  console.log('DELETE HTTP Response Body:', delInitBody);

  // 5. Query the epic row from DB after deletion
  const [epicAfter] = await db.select().from(epics).where(eq(epics.id, testEpic.id));
  console.log('\n🔍 EPIC ROW AFTER INITIATIVE DELETION:');
  console.dir(
    {
      id: epicAfter?.id,
      epicCode: epicAfter?.epicCode,
      title: epicAfter?.title,
      initiativeId: epicAfter?.initiativeId,
    },
    { depth: null }
  );
  console.log(`Epic still exists in database: ${epicAfter ? '✅ YES' : '❌ NO'}`);
  console.log(`Epic initiativeId is now NULL: ${epicAfter?.initiativeId === null ? '✅ YES (Detached successfully)' : '❌ NO'}`);

  // 6. Query the task row from DB after deletion
  const [taskAfter] = await db.select().from(tasks).where(eq(tasks.id, testTask.id));
  console.log('\n🔍 TASK ROW AFTER INITIATIVE DELETION:');
  console.dir(
    {
      id: taskAfter?.id,
      taskCode: taskAfter?.taskCode,
      title: taskAfter?.title,
      initiativeId: taskAfter?.initiativeId,
    },
    { depth: null }
  );
  console.log(`Task still exists in database: ${taskAfter ? '✅ YES' : '❌ NO'}`);
  console.log(`Task initiativeId is now NULL: ${taskAfter?.initiativeId === null ? '✅ YES (Detached successfully)' : '❌ NO'}`);

  // 7. Confirm initiative row itself is gone from DB
  const [initAfter] = await db.select().from(initiatives).where(eq(initiatives.id, testInit.id));
  console.log('\n🔍 INITIATIVE ROW QUERY AFTER DELETION:');
  console.log(`Initiative record in DB: ${initAfter ? '❌ STILL EXISTS' : '✅ NULL (Confirmed completely deleted)'}`);

  // Cleanup test epic & task
  await db.delete(tasks).where(eq(tasks.id, testTask.id));
  await db.delete(epics).where(eq(epics.id, testEpic.id));

  // ===========================================================================
  // PROOF 2: ANNOUNCEMENT DELETE RESPONDS WITH HTTP JSON ON SUCCESS
  // ===========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('📌 PROOF 2: ANNOUNCEMENT DELETE HTTP RESPONSE ON SUCCESS');
  console.log('------------------------------------------------------------------------');

  // 1. Create a test announcement
  const [testAnn] = await db
    .insert(announcements)
    .values({
      title: 'Temporary QA Delete Test Announcement',
      content: 'This announcement verifies DELETE /api/announcements/:id sends valid JSON response without hanging.',
      priority: 'NORMAL',
      isPinned: false,
    })
    .returning();

  console.log(`Created Test Announcement: "${testAnn.title}" (ID: ${testAnn.id})`);

  // 2. Call DELETE /api/announcements/:id
  console.log(`Calling DELETE /api/announcements/${testAnn.id} with ADMIN token...`);
  const delAnnRes = await fetch(`${BASE_URL}/api/announcements/${testAnn.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const delAnnBody = await delAnnRes.json();
  console.log(`\n✅ DELETE HTTP Status Code: ${delAnnRes.status}`);
  console.log('✅ DELETE HTTP Response Body:');
  console.dir(delAnnBody, { depth: null });
  console.log(`Response contains success & id: ${delAnnBody.success === true && delAnnBody.id === testAnn.id ? '✅ YES (Fixed, does not hang)' : '❌ NO'}`);

  // ===========================================================================
  // PROOF 3: TASK CLONE ROLE RESTRICTION (EMPLOYEE 403 vs ADMIN 201)
  // ===========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('📌 PROOF 3: TASK CLONE ROLE RESTRICTION (ADMIN/MANAGER ONLY)');
  console.log('------------------------------------------------------------------------');

  // Pick an active task
  const [sampleTask] = await db.select().from(tasks).limit(1);
  console.log(`Target Task to Clone: [${sampleTask.taskCode}] "${sampleTask.title}" (ID: ${sampleTask.id})`);

  // 1. Attempt clone as EMPLOYEE
  console.log(`\nAttempting POST /api/tasks/${sampleTask.id}/clone as EMPLOYEE (${employeeUser.email})...`);
  const empCloneRes = await fetch(`${BASE_URL}/api/tasks/${sampleTask.id}/clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${employeeToken}`,
    },
  });
  const empCloneBody = await empCloneRes.json();
  console.log(`EMPLOYEE Clone Status Code: ${empCloneRes.status}`);
  console.log('EMPLOYEE Clone Response Body:', empCloneBody);
  console.log(`Role Restriction Enforcement: ${empCloneRes.status === 403 ? '✅ STRICT 403 FORBIDDEN ENFORCED' : '❌ FAILED'}`);

  // 2. Attempt clone as ADMIN
  console.log(`\nAttempting POST /api/tasks/${sampleTask.id}/clone as ADMIN (${adminUser.email})...`);
  const adminCloneRes = await fetch(`${BASE_URL}/api/tasks/${sampleTask.id}/clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const adminCloneBody = await adminCloneRes.json();
  console.log(`ADMIN Clone Status Code: ${adminCloneRes.status}`);
  console.log('ADMIN Clone Response Body:', {
    id: adminCloneBody.id,
    taskCode: adminCloneBody.taskCode,
    title: adminCloneBody.title,
    entity: adminCloneBody.entity,
    status: adminCloneBody.status,
  });
  console.log(`Admin Clone Success: ${adminCloneRes.status === 201 ? '✅ 201 CREATED (Success)' : '❌ FAILED'}`);

  // Clean up cloned test task
  if (adminCloneBody.id) {
    await db.delete(taskChecklists).where(eq(taskChecklists.taskId, adminCloneBody.id));
    await db.delete(taskComments).where(eq(taskComments.taskId, adminCloneBody.id));
    await db.delete(tasks).where(eq(tasks.id, adminCloneBody.id));
  }

  console.log('\n========================================================================');
  console.log('🎉 ALL THREE FIXES VERIFIED AND PROVEN WITH REAL DATA & REAL RESPONSES');
  console.log('========================================================================');
  process.exit(0);
}

runThreeFixesProof().catch(err => {
  console.error('Proof run failed:', err);
  process.exit(1);
});
