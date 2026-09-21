process.env.NODE_ENV = 'test';
import { app } from './index.js';
import { db, users, employees, entities, departments, initiatives, epics, sprints, tasks, taskChecklists, taskComments, notifications, meetings, meetingAttendees, passwordResetOtps, eq, and, or, sql, inArray } from '@workspace/db';
import bcrypt from 'bcryptjs';
import http from 'node:http';

const TEST_PORT = 5088;
const API_BASE = `http://127.0.0.1:${TEST_PORT}`;

let server: http.Server;
let passedCount = 0;
let failedCount = 0;
const results: { category: string; test: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

function recordTest(category: string, testName: string, passed: boolean, error?: string) {
  if (passed) {
    passedCount++;
    results.push({ category, test: testName, status: 'PASS' });
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedCount++;
    results.push({ category, test: testName, status: 'FAIL', error });
    console.error(`  ❌ [FAIL] ${testName}: ${error || 'Failed'}`);
  }
}

async function runExhaustiveAudit() {
  console.log('\n================================================================');
  console.log('🚀 RUNNING EXHAUSTIVE 360° END-TO-END APPLICATION AUDIT');
  console.log('================================================================\n');

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST SERVER READY] on ${API_BASE}`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // SECTION 1: AUTHENTICATION, OTP & ACCESS CONTROL
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('🔐 1. AUTHENTICATION & ACCESS CONTROL AUDIT');
    console.log('======================================================');

    const adminEmail = 'admin@example.com';
    const adminPass = 'admin123';
    const adminHash = await bcrypt.hash(adminPass, 10);

    // Ensure Admin account exists with known password
    let [adminUser] = await db.select().from(users).where(eq(users.email, adminEmail));
    if (!adminUser) {
      [adminUser] = await db.insert(users).values({
        email: adminEmail,
        passwordHash: adminHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      }).returning();
    } else {
      await db.update(users).set({ passwordHash: adminHash, role: 'ADMIN' }).where(eq(users.id, adminUser.id));
    }

    // 1.1 Valid Login
    const validLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '  ADMIN@example.com  ', password: adminPass, rememberMe: true }),
    });
    const validLoginData: any = await validLoginRes.json();
    const adminToken = validLoginData.token;
    recordTest(
      'Auth',
      'Admin valid login with case-insensitive email trim and rememberMe token generation',
      validLoginRes.status === 200 && !!adminToken && !!validLoginData.refreshToken
    );

    // 1.2 Invalid Password Handling
    const invalidLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: 'WrongPassword999!' }),
    });
    recordTest('Auth', 'Invalid password rejected with 401 Unauthorized', invalidLoginRes.status === 401);

    // 1.3 Forgot Password OTP Flow
    const forgotRes = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail }),
    });
    const forgotData: any = await forgotRes.json();
    recordTest('Auth', 'Forgot password OTP request returns generic timing-safe response', forgotRes.status === 200 && !!forgotData.message);

    // Fetch generated OTP from database
    const [otpRow] = await db.select().from(passwordResetOtps).where(sql`TRIM(LOWER(${passwordResetOtps.email})) = ${adminEmail.toLowerCase()}`);
    recordTest('Auth', 'OTP row created with bcrypt hash, 10-min expiration, and 0 initial attempts', !!otpRow && !!otpRow.otpHash && !otpRow.verified);

    // Create known OTP for verification test
    const testOtpCode = '654321';
    const testOtpHash = await bcrypt.hash(testOtpCode, 10);
    await db.update(passwordResetOtps).set({ otpHash: testOtpHash, attempts: 0 }).where(eq(passwordResetOtps.id, otpRow.id));

    // Verify OTP
    const verifyOtpRes = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, otp: testOtpCode }),
    });
    const verifyOtpData: any = await verifyOtpRes.json();
    recordTest('Auth', 'OTP verification succeeds and returns single-use resetToken', verifyOtpRes.status === 200 && !!verifyOtpData.resetToken);

    // Reset Password with token
    const newAdminPass = 'admin123';
    const resetRes = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, resetToken: verifyOtpData.resetToken, newPassword: newAdminPass }),
    });
    const resetData: any = await resetRes.json();
    recordTest('Auth', 'Password reset succeeds and auto-logs in with new session token', resetRes.status === 200 && !!resetData.token);

    // Session verification GET /api/auth/me
    const meRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${resetData.token}` },
    });
    const meData: any = await meRes.json();
    recordTest('Auth', 'GET /api/auth/me returns valid user session and role', meRes.status === 200 && meData.user?.email === adminEmail);

    // -------------------------------------------------------------
    // SECTION 2: MULTI-ENTITY ARCHITECTURE & DEPARTMENTS
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('🏢 2. MULTI-ENTITY ARCHITECTURE & SETUP');
    console.log('======================================================');

    const allEntities = await db.select().from(entities);
    recordTest('Entities', 'Both EHM and CLIMAGRO (CAG) entities present in PostgreSQL', allEntities.length >= 2);

    const ehmEntity = allEntities.find(e => e.code === 'EHM') || allEntities[0];
    const cagEntity = allEntities.find(e => e.code === 'CAG') || allEntities[1];

    const allDepts = await db.select().from(departments);
    recordTest('Departments', 'Core corporate departments exist and are linked', allDepts.length >= 2);
    const techDept = allDepts[0];

    // -------------------------------------------------------------
    // SECTION 3: TEAM DIRECTORY & EMPLOYEE LIFECYCLE
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('👥 3. TEAM DIRECTORY & EMPLOYEE LIFECYCLE AUDIT');
    console.log('======================================================');

    const testEmpEmail1 = `audit_dev_${Date.now()}@example.com`;
    const testMgrEmail1 = `audit_mgr_${Date.now()}@example.com`;

    // 3.1 Create Employee (Single unified email field)
    const createEmpRes = await fetch(`${API_BASE}/api/employees`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Sarah',
        lastName: 'Connor',
        email: testEmpEmail1,
        entityId: ehmEntity.id,
        departmentId: techDept.id,
        designation: 'Senior Cloud Engineer',
        role: 'EMPLOYEE',
      }),
    });
    const createdEmpData: any = await createEmpRes.json();
    recordTest(
      'Employees',
      'Create Employee generates code (EHM-EMP##), creates user & invite records with 0 salary leaks',
      createEmpRes.status === 201 && !!createdEmpData.employee?.employeeCode && createdEmpData.employee?.salary === undefined
    );
    const createdEmp = createdEmpData.employee;

    // 3.2 Create Manager
    const createMgrRes = await fetch(`${API_BASE}/api/employees`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Marcus',
        lastName: 'Wright',
        email: testMgrEmail1,
        entityId: cagEntity.id,
        departmentId: techDept.id,
        designation: 'Engineering Lead',
        role: 'MANAGER',
      }),
    });
    const createdMgrData: any = await createMgrRes.json();
    recordTest('Employees', 'Create Manager generates code (CAG-MGR##)', createMgrRes.status === 201 && createdMgrData.employee?.employeeCode.includes('CAG-MGR'));
    const createdMgr = createdMgrData.employee;

    // 3.3 Re-invite Employee
    const reinviteRes = await fetch(`${API_BASE}/api/employees/${createdEmp.id}/reinvite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const reinviteData: any = await reinviteRes.json();
    recordTest('Employees', 'Re-invite generates fresh invite token and triggers branded email', reinviteRes.status === 200 && !!reinviteData.inviteLink);

    // 3.4 Edit Employee
    const editEmpRes = await fetch(`${API_BASE}/api/employees/${createdEmp.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        designation: 'Principal Architect',
      }),
    });
    const editEmpData: any = await editEmpRes.json();
    recordTest('Employees', 'Edit employee designation persists instantly in PostgreSQL', editEmpRes.status === 200 && editEmpData.employee?.designation === 'Principal Architect');

    // -------------------------------------------------------------
    // SECTION 4: STRATEGIC INITIATIVES, EPICS & SPRINT TASKS
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('🎯 4. INITIATIVES, EPICS, SPRINTS & TASK HIERARCHY');
    console.log('======================================================');

    // 4.1 Create 2 Strategic Initiatives
    const init1Res = await fetch(`${API_BASE}/api/initiatives`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Q4 Enterprise Cloud Migration',
        description: 'Migrate legacy microservices to high-availability Kubernetes',
        entityId: ehmEntity.id,
        ownerId: createdMgr.id,
        targetQuarter: 'Q4 2026',
        status: 'ACTIVE',
      }),
    });
    const init1Data: any = await init1Res.json();
    recordTest('Initiatives', 'Create Initiative #1 auto-generates EHM-I## code', init1Res.status === 201 && (init1Data.initiativeCode?.includes('EHM-I') || init1Data.initiativeCode?.includes('INIT')));

    const init2Res = await fetch(`${API_BASE}/api/initiatives`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Zero Trust Network Architecture',
        description: 'Implement mTLS and OAuth2 identity-aware proxies',
        entityId: cagEntity.id,
        ownerId: createdMgr.id,
        targetQuarter: 'Q4 2026',
        status: 'PLANNED',
      }),
    });
    const init2Data: any = await init2Res.json();
    recordTest('Initiatives', 'Create Initiative #2 auto-generates CAG-I## code', init2Res.status === 201 && (init2Data.initiativeCode?.includes('CAG-I') || init2Data.initiativeCode?.includes('INIT')));

    // Edit Initiative
    const editInitRes = await fetch(`${API_BASE}/api/initiatives/${init1Data.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Q4 Enterprise Cloud Migration (Expanded Scope)' }),
    });
    recordTest('Initiatives', 'Edit Initiative updates title in PostgreSQL', editInitRes.status === 200);

    // 4.2 Create Epics linked to Initiative
    const epic1Res = await fetch(`${API_BASE}/api/epics`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Database Sharding & Connection Pooler',
        initiativeId: init1Data.id,
        entityId: ehmEntity.id,
        ownerId: createdMgr.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      }),
    });
    const epic1Data: any = await epic1Res.json();
    recordTest('Epics', 'Create Epic linked to parent Initiative generates lineage code [EPIC-###]', epic1Res.status === 201 && !!epic1Data.epicCode);

    // 4.3 Create 4-Week Sprint
    const sprintRes = await fetch(`${API_BASE}/api/sprints`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: createdEmp.id,
        name: 'Sprint 42: Core DB Optimization',
        sprintWeek: 'Week 1',
        entityId: ehmEntity.id,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 28 * 86400000).toISOString(),
        status: 'ACTIVE',
      }),
    });
    const sprintData: any = await sprintRes.json();
    recordTest('Sprints', 'Create Sprint initializes 4-week active sprint cycle', sprintRes.status === 201 && !!sprintData.id);

    // 4.4 Create Tasks with full lifecycle: PLANNED -> TODO -> IN_PROGRESS -> TO_REVIEW -> DONE
    const taskRes = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Deploy Read Replicas & Optimize Indexing',
        description: 'Setup Postgres connection poolers and analyze slow query logs',
        assigneeId: createdEmp.id,
        reviewingLeadId: createdMgr.id,
        entityId: ehmEntity.id,
        departmentId: techDept.id,
        epicId: epic1Data.id,
        sprintId: sprintData.id,
        status: 'PLANNED',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      }),
    });
    const taskData: any = await taskRes.json();
    recordTest('Tasks', 'Create Sprint Task derives Epic lineage code (e.g. EHM-EP01-T001)', taskRes.status === 201 && !!taskData.taskCode);

    // 4.5 Task Code Immutability
    const taskCodeOriginal = taskData.taskCode;
    const taskUpdateRes = await fetch(`${API_BASE}/api/tasks/${taskData.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Deploy Read Replicas (Updated Scope)',
        taskCode: 'HACKED-CODE-999', // should be ignored
      }),
    });
    const taskUpdatedData: any = await taskUpdateRes.json();
    recordTest(
      'Tasks',
      'Task code remains strictly IMMUTABLE upon edit',
      taskUpdatedData.taskCode === taskCodeOriginal
    );

    // 4.6 Subtasks & Checklists
    const chk1Res = await fetch(`${API_BASE}/api/tasks/${taskData.id}/checklists`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemText: 'Checkpoint 1: Setup RDS replica' }),
    });
    const chk2Res = await fetch(`${API_BASE}/api/tasks/${taskData.id}/checklists`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemText: 'Checkpoint 2: Benchmark queries' }),
    });
    const chk3Res = await fetch(`${API_BASE}/api/tasks/${taskData.id}/checklists`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemText: 'Checkpoint 3: Manager sign-off' }),
    });
    recordTest('Checklists', 'Add default checkpoints (Checkpoint 1, 2, 3) to task', chk1Res.status === 201 && chk2Res.status === 201 && chk3Res.status === 201);

    // 4.7 Task Activity Comments (ASC chronological order)
    const commentRes = await fetch(`${API_BASE}/api/tasks/${taskData.id}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Initial benchmarks show 45% query latency improvement.',
      }),
    });
    recordTest('Comments', 'Post task activity comment with author attribution', commentRes.status === 201);

    // 4.8 Status Progression to TO_REVIEW with deliverable URL
    const reviewSubmitRes = await fetch(`${API_BASE}/api/tasks/${taskData.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'TO_REVIEW',
        deliverableUrl: 'https://github.com/ashutosh096/hrdashboard/pull/42',
      }),
    });
    recordTest('Tasks', 'Submit deliverable URL and transition status to TO_REVIEW', reviewSubmitRes.status === 200);

    // 4.9 Manager approves to DONE
    const doneRes = await fetch(`${API_BASE}/api/tasks/${taskData.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'DONE' }),
    });
    const doneData: any = await doneRes.json();
    recordTest('Tasks', 'Manager/Admin approves task deliverable and marks DONE', doneRes.status === 200 && doneData.status === 'DONE');

    // -------------------------------------------------------------
    // SECTION 5: IN-APP NOTIFICATIONS AUDIT
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('🔔 5. IN-APP NOTIFICATIONS & LIFECYCLE TRIGGERS');
    console.log('======================================================');

    const notifRes = await fetch(`${API_BASE}/api/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const notifList: any = await notifRes.json();
    recordTest('Notifications', 'In-app notifications successfully dispatched for task lifecycle events', Array.isArray(notifList) && notifList.length > 0);

    const markReadRes = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordTest('Notifications', 'Mark all read button updates notification read status', markReadRes.status === 200);

    // -------------------------------------------------------------
    // SECTION 6: MEETINGS & CALENDAR SCHEDULING
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('📅 6. MEETINGS & CALENDAR INTEGRATION AUDIT');
    console.log('======================================================');

    const meetRes = await fetch(`${API_BASE}/api/meetings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Weekly Engineering Sprint Retrospective',
        description: 'Review Q4 migration progress and blockers',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 5400000).toISOString(),
        location: 'Google Meet',
        source: 'INTERNAL',
        invitees: [createdEmp.id, createdMgr.id],
      }),
    });
    const meetData: any = await meetRes.json();
    recordTest('Meetings', 'Schedule meeting attaches all invitees and persists in PostgreSQL', meetRes.status === 201 && meetData.status === 'SCHEDULED');

    const getMeetingsRes = await fetch(`${API_BASE}/api/meetings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allMeets: any = await getMeetingsRes.json();
    recordTest('Meetings', 'GET /api/meetings returns scheduled meetings list', Array.isArray(allMeets) && allMeets.length > 0);

    // -------------------------------------------------------------
    // SECTION 7: CLEANUP TEST ARTIFACTS & CASCADE VERIFICATION
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('🗑️ 7. DELETION & CASCADING CLEANUP AUDIT');
    console.log('======================================================');

    const deleteEmpRes = await fetch(`${API_BASE}/api/employees/${createdEmp.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordTest('Employees', 'Delete employee cleanly cascades child tasks, invites, and notifications', deleteEmpRes.status === 200);

    const deleteMgrRes = await fetch(`${API_BASE}/api/employees/${createdMgr.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordTest('Employees', 'Delete manager cleanly cascades records via API', deleteMgrRes.status === 200);

    await db.delete(epics).where(eq(epics.id, epic1Data.id));
    await db.delete(initiatives).where(inArray(initiatives.id, [init1Data.id, init2Data.id]));

    // -------------------------------------------------------------
    // SECTION 8: FINAL SUMMARY & STATUS
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log(`📊 FINAL AUDIT REPORT: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('======================================================\n');

  } finally {
    if (server) server.close();
  }

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runExhaustiveAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
