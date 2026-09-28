process.env.NODE_ENV = 'test';
import { app } from './index.js';
import { db, users, employees, tasks, eq, sql } from '@workspace/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config/jwt.js';
import http from 'node:http';

const TEST_PORT = 5099;
const API_BASE = `http://127.0.0.1:${TEST_PORT}`;

let server: http.Server;

let testPassCount = 0;
let testFailCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    testPassCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${detail || 'Assertion failed'}`);
    testFailCount++;
  }
}

console.error('DEPRECATED: test-security.ts writes old-format codes and is disabled under Step 2.');
process.exit(1);

async function runSecurityAudit() {
  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST SERVER] Listening on http://127.0.0.1:${TEST_PORT}`);
      resolve();
    });
  });

  console.log('\n======================================================');
  console.log('🛡️ RUNNING AUTOMATED SECURITY & RBAC REGRESSION SUITE');
  console.log('======================================================\n');

  // 1. Setup Test Users
  console.log('🔹 1. Setting up Test Admin and Test Employee accounts...');
  const testAdminEmail = 'admin@example.com';
  const testEmployeeEmail = 'audit_test_emp@example.com';
  const testPassword = 'TestPassword123!';
  const passwordHash = await bcrypt.hash(testPassword, 10);

  // Ensure Admin user
  let [adminUser] = await db.select().from(users).where(eq(users.email, testAdminEmail));
  if (!adminUser) {
    [adminUser] = await db.insert(users).values({
      email: testAdminEmail,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    }).returning();
  } else {
    await db.update(users).set({ passwordHash, role: 'ADMIN' }).where(eq(users.id, adminUser.id));
  }

  // Ensure Employee profile and user
  let [empProfile] = await db.select().from(employees).where(eq(employees.email, testEmployeeEmail));
  if (!empProfile) {
    const [firstEntity] = await db.select().from(employees).limit(1);
    [empProfile] = await db.insert(employees).values({
      employeeCode: 'TEST-EMP-99',
      firstName: 'Audit',
      lastName: 'Employee',
      email: testEmployeeEmail,
      entityId: firstEntity?.entityId || adminUser.id,
      departmentId: firstEntity?.departmentId || adminUser.id,
      designation: 'Security Tester',
      joiningDate: new Date(),
      salary: '999999', // should never be exposed
    }).returning();
  }

  let [empUser] = await db.select().from(users).where(eq(users.email, testEmployeeEmail));
  if (!empUser) {
    [empUser] = await db.insert(users).values({
      email: testEmployeeEmail,
      passwordHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employeeId: empProfile.id,
    }).returning();
  } else {
    await db.update(users).set({ passwordHash, role: 'EMPLOYEE', employeeId: empProfile.id }).where(eq(users.id, empUser.id));
  }

  // 2. Test Login & Token Generation
  console.log('\n🔹 2. Testing Authentication & Token Generation...');
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmployeeEmail, password: testPassword, rememberMe: true }),
  });
  const loginData: any = await loginRes.json();
  assert(loginRes.status === 200 && !!loginData.token, 'Employee login succeeds and returns access token');
  assert(!!loginData.refreshToken, 'Login with rememberMe returns refresh token');

  const empToken = loginData.token;

  const adminLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testAdminEmail, password: testPassword }),
  });
  const adminLoginData: any = await adminLoginRes.json();
  const adminToken = adminLoginData.token;
  assert(adminLoginRes.status === 200 && !!adminToken, 'Admin login succeeds and returns admin token');

  // 3. Test Refresh Token Endpoint
  console.log('\n🔹 3. Testing Silent Refresh Token Rotation...');
  const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: loginData.refreshToken }),
  });
  const refreshData: any = await refreshRes.json();
  assert(refreshRes.status === 200 && !!refreshData.token, 'Refresh token endpoint returns a fresh access token');

  // 4. Test Insecure Set-Password Backdoor Removal
  console.log('\n🔹 4. Testing Insecure Set-Password Removal & Invite Protection...');
  const unauthSetRes = await fetch(`${API_BASE}/api/auth/set-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testAdminEmail, password: 'hackedPassword!' }),
  });
  assert(unauthSetRes.status === 404 || unauthSetRes.status === 400, 'Unauthenticated /set-password route is removed or blocked');

  // 5. Test Salary Masking on GET /api/employees
  console.log('\n🔹 5. Testing Sensitive Data Masking (Salary Stripping)...');
  const getEmployeesRes = await fetch(`${API_BASE}/api/employees`, {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  const employeesData: any = await getEmployeesRes.json();
  assert(Array.isArray(employeesData) && employeesData.length > 0, 'GET /api/employees returns employee list');
  const anySalaryExposed = employeesData.some((e: any) => e.salary !== undefined && e.salary !== null && e.salary !== '');
  assert(!anySalaryExposed, 'Zero employee records leak salary data in GET /api/employees payload');

  // 6. Test Privilege Escalation Prevention (Role modification by non-admin)
  console.log('\n🔹 6. Testing RBAC Privilege Escalation Prevention...');
  const roleEscalateRes = await fetch(`${API_BASE}/api/employees/${empProfile.id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${empToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'ADMIN' }),
  });
  assert(
    roleEscalateRes.status === 403,
    'Non-admin attempting to escalate role to ADMIN is blocked with 403 Forbidden',
    `Received status ${roleEscalateRes.status}`
  );

  // 7. Test Admin Account Deletion Protection
  console.log('\n🔹 7. Testing Admin Account Deletion Protection...');
  const deleteAdminRes = await fetch(`${API_BASE}/api/employees/${empProfile.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert(
    deleteAdminRes.status === 403,
    'Non-admin attempting to delete employee is blocked with 403 Forbidden',
    `Received status ${deleteAdminRes.status}`
  );

  // 8. Test Task Status Integrity (PLANNED, TO_REVIEW, Reviewer Guard)
  console.log('\n🔹 8. Testing Task Status Integrity & Reviewer Approval Workflow...');
  const [firstEntity] = await db.select().from(employees).limit(1);

  const createTaskRes = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Security Audit Test Task',
      assigneeId: empProfile.id,
      entityId: firstEntity.entityId,
      departmentId: firstEntity.departmentId,
      status: 'PLANNED',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    }),
  });
  const createdTask: any = await createTaskRes.json();
  assert(createTaskRes.status === 201 && createdTask.status === 'PLANNED', 'Task successfully created with PLANNED status in database');

  // Employee attempts to mark task DONE directly
  const empDoneRes = await fetch(`${API_BASE}/api/tasks/${createdTask.id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${empToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'DONE' }),
  });
  const updatedTaskStatus: any = await empDoneRes.json();
  assert(
    updatedTaskStatus.status === 'TO_REVIEW',
    'Employee marking task DONE is safely routed to TO_REVIEW for manager sign-off',
    `Received status: ${updatedTaskStatus.status}`
  );

  // 9. Test Meeting Organizer Spoofing Protection
  console.log('\n🔹 9. Testing Meeting Organizer Identity Enforcement...');
  const spoofMeetingRes = await fetch(`${API_BASE}/api/meetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${empToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Spoofed Meeting Test',
      organizerId: adminUser.id, // Trying to spoof admin as organizer
      source: 'MANUAL',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 1800000).toISOString(),
    }),
  });
  const createdMeeting: any = await spoofMeetingRes.json();
  assert(
    spoofMeetingRes.status === 201 && createdMeeting.organizerId === empProfile.id,
    'Non-admin organizer ID is locked to authenticated employee ID (spoofing prevented)'
  );

  // Clean up created test task and meeting
  if (createdTask?.id) {
    await db.delete(tasks).where(eq(tasks.id, createdTask.id));
  }

  console.log('\n======================================================');
  console.log(`📊 AUDIT SUMMARY: ${testPassCount} PASSED, ${testFailCount} FAILED`);
  console.log('======================================================\n');

  if (server) {
    server.close();
  }

  if (testFailCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityAudit().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
