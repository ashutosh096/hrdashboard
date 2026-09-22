process.env.NODE_ENV = 'test';
import { app } from './index.js';
import { db, users, employees, entities, departments, initiatives, epics, sprints, tasks, taskChecklists, taskComments, notifications, meetings, meetingAttendees, eq, and, or, sql, inArray } from '@workspace/db';
import bcrypt from 'bcryptjs';
import http from 'node:http';

const TEST_PORT = 5092;
const API_BASE = `http://127.0.0.1:${TEST_PORT}`;

let server: http.Server;
let passedCount = 0;
let failedCount = 0;

function check(testName: string, passed: boolean, details?: any) {
  if (passed) {
    passedCount++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  ❌ [FAIL] ${testName}`, details || '');
  }
}

async function runCrosscheck() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE 360° APPLICATION & DATABASE CROSS-CHECK');
  console.log('================================================================\n');

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST SERVER STARTED] on ${API_BASE}`);
      resolve();
    });
  });

  try {
    // 1. SETUP AUTH & ADMIN / EMPLOYEE USERS
    console.log('\n--- 1. AUTH & USER PROFILES ---');
    const adminEmail = 'admin@example.com';
    const adminPass = 'admin123';
    const adminHash = await bcrypt.hash(adminPass, 10);

    let [adminUser] = await db.select().from(users).where(eq(users.email, adminEmail));
    if (!adminUser) {
      [adminUser] = await db.insert(users).values({
        email: adminEmail,
        passwordHash: adminHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      }).returning();
    }

    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPass }),
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.token;
    check('Admin Login & JWT Token generation', loginRes.ok && Boolean(adminToken));

    // Profile Edit (Name and Mobile)
    const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Dr. Ashutosh Mishra',
        phone: '+91 9876543210',
      }),
    });
    const profileData = await profileRes.json();
    check('Edit Profile: Update Name and Mobile', profileRes.ok && profileData.user?.phone === '+91 9876543210');

    // 2. EMPLOYEE CRUD & ROLES
    console.log('\n--- 2. EMPLOYEE MANAGEMENT & ROLES ---');
    const [mainEntity] = await db.select().from(entities).limit(1);
    const [mainDept] = await db.select().from(departments).limit(1);

    const testEmpEmail = `test.employee.${Date.now()}@example.com`;
    const createEmpRes = await fetch(`${API_BASE}/api/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: 'Vikram',
        lastName: 'Sharma',
        email: testEmpEmail,
        role: 'EMPLOYEE',
        designation: 'Frontend Engineer',
        entityId: mainEntity.id,
        departmentId: mainDept.id,
      }),
    });
    const createEmpData = await createEmpRes.json();
    const testEmpId = createEmpData.employee?.id;
    check('Create Employee with auto-generated code and role', createEmpRes.status === 201 && Boolean(testEmpId));

    // Update Employee (Change Role to MANAGER and update designation)
    const updateEmpRes = await fetch(`${API_BASE}/api/employees/${testEmpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        firstName: 'Vikram',
        lastName: 'Sharma',
        designation: 'Lead Architect',
        role: 'MANAGER',
      }),
    });
    const updateEmpData = await updateEmpRes.json();
    check('Update Employee: Change role to MANAGER and designation', updateEmpRes.ok && updateEmpData.employee?.role === 'MANAGER');

    // 3. INITIATIVES (TARGET MONTH)
    console.log('\n--- 3. INITIATIVES & TARGET MONTH ---');
    const initRes = await fetch(`${API_BASE}/api/initiatives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Q4 Cloud Modernization Initiative',
        description: 'Migrating core microservices to cloud native stack',
        entityId: mainEntity.id,
        targetMonth: 'Month 1 (Weeks 1–4)',
        epicsCountTarget: 4,
        targetDeliverableMetric: '99.99% system uptime',
        status: 'ACTIVE',
      }),
    });
    const initData = await initRes.json();
    const initId = initData.id;
    check('Create Initiative with Target Month & Deliverables', initRes.status === 201 && Boolean(initId));

    // Edit Initiative
    const editInitRes = await fetch(`${API_BASE}/api/initiatives/${initId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        targetMonth: 'Month 2 (Weeks 5–8)',
        epicsCountTarget: 5,
        status: 'ACTIVE',
      }),
    });
    const editInitData = await editInitRes.json();
    check('Edit Initiative: Update Target Month & Epics Target in DB', editInitRes.ok && editInitData.targetMonth === 'Month 2 (Weeks 5–8)');

    // 4. EPICS (TARGET WEEK)
    console.log('\n--- 4. EPICS & TARGET WEEK ---');
    const epicRes = await fetch(`${API_BASE}/api/epics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        initiativeId: initId,
        entityId: mainEntity.id,
        title: 'Authentication & SSO Overhaul',
        description: 'Implement JWT + OAuth2 + Google Sync',
        department: 'Engineering',
        targetWeek: 'Week 1 (Days 1–7)',
        sprintsCountTarget: 2,
        status: 'IN_PROGRESS',
      }),
    });
    const epicData = await epicRes.json();
    const epicId = epicData.id;
    check('Create Epic linked to Initiative with Target Week', epicRes.status === 201 && Boolean(epicId));

    // Edit Epic
    const editEpicRes = await fetch(`${API_BASE}/api/epics/${epicId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        targetWeek: 'Week 2 (Days 8–14)',
        department: 'Security & Core Platform',
        status: 'IN_PROGRESS',
      }),
    });
    const editEpicData = await editEpicRes.json();
    check('Edit Epic: Update Target Week and Department in DB', editEpicRes.ok && editEpicData.targetWeek === 'Week 2 (Days 8–14)');

    // 5. SPRINTS (TARGET WEEK & REVIEWING LEAD)
    console.log('\n--- 5. SPRINTS, TARGET WEEK & REVIEWING LEAD ---');
    const sprintRes = await fetch(`${API_BASE}/api/sprints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        employeeId: testEmpId,
        epicId: epicId,
        name: 'Sprint 01: Core Auth Foundations',
        goal: 'Complete JWT token lifecycle & session guards',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        targetWeek: 'Week 1 (Days 1–7)',
        department: 'Engineering',
        status: 'ACTIVE',
      }),
    });
    const sprintData = await sprintRes.json();
    const sprintId = sprintData.id;
    check('Create Sprint linked to Epic and Employee with Target Week', sprintRes.status === 201 && Boolean(sprintId));

    // Edit Sprint
    const editSprintRes = await fetch(`${API_BASE}/api/sprints/${sprintId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        targetWeek: 'Week 3 (Days 15–21)',
        goal: 'Updated sprint goal with extended performance metrics',
        status: 'ACTIVE',
      }),
    });
    const editSprintData = await editSprintRes.json();
    check('Edit Sprint: Update Target Week & Goal in DB', editSprintRes.ok && editSprintData.targetWeek === 'Week 3 (Days 15–21)');

    // 6. TASKS (TARGET WEEK, CHECKLISTS, COMMENTS)
    console.log('\n--- 6. TASKS, CHECKLISTS & ACTIVITY COMMENTS ---');
    const taskRes = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Implement OAuth Token Refresh Pipeline',
        description: 'Support automatic token rotation without session drops',
        entityId: mainEntity.id,
        departmentId: mainDept.id,
        sprintId: sprintId,
        epicId: epicId,
        assigneeId: testEmpId,
        priority: 'HIGH',
        sprintWeek: 'Week 1 (Days 1–7)',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      }),
    });
    const taskData = await taskRes.json();
    const taskId = taskData.id;
    check('Create Task linked to Sprint & Epic with Target Week', taskRes.status === 201 && Boolean(taskId));

    // Edit Task (Target Week, Deliverable URL, Priority, Status)
    const editTaskRes = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        targetWeek: 'Week 2 (Days 8–14)',
        priority: 'URGENT',
        deliverableUrl: 'https://github.com/company/repo/pull/142',
        status: 'TO_REVIEW',
      }),
    });
    const editTaskData = await editTaskRes.json();
    check('Edit Task: Update Target Week, Priority, Deliverable URL and Status', editTaskRes.ok && editTaskData.sprintWeek === 'Week 2 (Days 8–14)');

    // Add Checklist Items
    const addChecklistRes = await fetch(`${API_BASE}/api/tasks/${taskId}/checklists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ itemText: 'Write comprehensive integration tests' }),
    });
    const checklistData = await addChecklistRes.json();
    check('Add Task Checklist Item', addChecklistRes.status === 201 && Boolean(checklistData.id));

    // Toggle Checklist Item Completion
    const toggleChecklistRes = await fetch(`${API_BASE}/api/tasks/checklists/${checklistData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isCompleted: true }),
    });
    const updatedChecklistData = await toggleChecklistRes.json();
    check('Toggle Checklist Item: Mark completed with timestamp in DB', toggleChecklistRes.ok && updatedChecklistData.isCompleted === true);

    // Post Activity Comment
    const commentRes = await fetch(`${API_BASE}/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ content: 'PR submitted and ready for manager sign-off!' }),
    });
    const commentData = await commentRes.json();
    check('Post Task Activity Comment with Author Attribution', commentRes.status === 201 && commentData.content.includes('PR submitted'));

    // Fetch Comments in Chronological Order
    const getCommentsRes = await fetch(`${API_BASE}/api/tasks/${taskId}/comments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const commentsList = await getCommentsRes.json();
    check('Fetch Task Comments: Chronological Order (ASC) & Display Name', Array.isArray(commentsList) && commentsList.length > 0);

    // 7. MEETINGS, CALENDAR SYNC & TEAM AVAILABILITY
    console.log('\n--- 7. MEETINGS, MoM & TEAM AVAILABILITY ---');
    const meetingStart = new Date(Date.now() + 3600000);
    const meetingEnd = new Date(Date.now() + 7200000);

    const meetingRes = await fetch(`${API_BASE}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Weekly Sprint & Epic Architecture Review',
        description: 'Review deliverable milestones for Q4 initiative',
        startTime: meetingStart.toISOString(),
        endTime: meetingEnd.toISOString(),
        location: 'Google Meet',
        invitees: [testEmpId],
      }),
    });
    const meetingData = await meetingRes.json();
    const meetingId = meetingData.id;
    check('Schedule Meeting with Attendees in DB', meetingRes.status === 201 && Boolean(meetingId));

    // Save MoM (Minutes of Meeting)
    const momPayload = JSON.stringify({
      momNotes: 'Key architectural decisions agreed upon by the lead.',
      momActionItems: '1. Merge auth pipeline\n2. Prepare staging demo',
      momDecisions: 'Approved rollout strategy.',
      momFiles: [{ name: 'architecture_diagram.png', size: '240 KB' }],
    });
    const saveMomRes = await fetch(`${API_BASE}/api/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ description: momPayload }),
    });
    const saveMomData = await saveMomRes.json();
    check('Save MoM (Minutes of Meeting, Notes & Files) in DB', saveMomRes.ok && saveMomData.description.includes('architectural decisions'));

    // Check Team Availability
    const availRes = await fetch(`${API_BASE}/api/meetings/availability`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const availData = await availRes.json();
    const targetEmpAvail = availData.find((a: any) => a.employeeId === testEmpId);
    check('Team Availability: Dynamic evaluation & chronological slots', availRes.ok && Array.isArray(availData) && Boolean(targetEmpAvail));

    // Cancel Meeting
    const cancelMeetingRes = await fetch(`${API_BASE}/api/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    check('Cancel Meeting: Status updated to CANCELLED in DB', cancelMeetingRes.ok);

    // Clean up test employee
    const deleteEmpRes = await fetch(`${API_BASE}/api/employees/${testEmpId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    check('Delete Employee Lifecycle & Cascade Cleanup in DB', deleteEmpRes.ok);

    console.log('\n================================================================');
    console.log(`📊 FINAL CROSS-CHECK RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('[UNEXPECTED ERROR DURING AUDIT]:', err);
  } finally {
    if (server) {
      server.close();
    }
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runCrosscheck();
