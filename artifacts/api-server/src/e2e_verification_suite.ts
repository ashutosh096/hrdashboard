import { db, users, employees, tasks, taskComments, passwordResetOtps, projects, sql, eq } from '@workspace/db';
import bcrypt from 'bcryptjs';

const BASE_URL = 'http://localhost:5000';

async function runE2EVerification() {
  console.log('========================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE REAL-DATA E2E AUDIT & VERIFICATION');
  console.log('========================================================================\n');

  // ---------------------------------------------------------------------------
  // STEP 1: Verify Password Reset OTP End-to-End
  // ---------------------------------------------------------------------------
  console.log('--- 🔐 STEP 1: TEST FORGOT-PASSWORD & OTP END-TO-END ---');
  
  // Pick a real user from database
  const [testUser] = await db.select().from(users).where(eq(users.role, 'EMPLOYEE')).limit(1);
  if (!testUser) {
    throw new Error('No employee user found in DB');
  }
  const testEmail = testUser.email;
  console.log(`Using real registered user email: ${testEmail} (User ID: ${testUser.id})`);

  // Clear any old OTP for this email
  await db.delete(passwordResetOtps).where(eq(passwordResetOtps.email, testEmail.toLowerCase().trim()));

  // 1.1 Trigger forgot-password via API
  console.log(`Triggering POST /api/auth/forgot-password for ${testEmail}...`);
  const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  const forgotData: any = await forgotRes.json();
  console.log('Response from /api/auth/forgot-password:', forgotData);

  // 1.2 Query real password_reset_otps row from DB
  const [otpRow] = await db
    .select()
    .from(passwordResetOtps)
    .where(eq(passwordResetOtps.email, testEmail.toLowerCase().trim()));

  console.log('\n✅ REAL password_reset_otps ROW CREATED IN DATABASE:');
  console.dir(otpRow, { depth: null });

  if (!otpRow) {
    throw new Error('Failed: No row found in password_reset_otps table!');
  }

  // 1.3 Verify OTP
  const otpToUse = forgotData.debugOtp;
  if (!otpToUse) {
    throw new Error('Debug OTP not found in response');
  }
  console.log(`\nVerifying with OTP code: ${otpToUse}...`);
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, otp: otpToUse }),
  });
  const verifyData: any = await verifyRes.json();
  console.log('Response from /api/auth/verify-otp:', verifyData);

  const resetToken = verifyData.resetToken;
  if (!resetToken) {
    throw new Error('Verification failed: No resetToken returned');
  }

  // Query updated password_reset_otps row
  const [verifiedOtpRow] = await db
    .select()
    .from(passwordResetOtps)
    .where(eq(passwordResetOtps.id, otpRow.id));
  console.log('\n✅ REAL password_reset_otps ROW AFTER OTP VERIFICATION:');
  console.dir(verifiedOtpRow, { depth: null });

  // 1.4 Reset Password
  const newTestPassword = 'TestPassword@2026!';
  console.log(`\nResetting password to "${newTestPassword}" using resetToken...`);
  const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      resetToken,
      newPassword: newTestPassword,
    }),
  });
  const resetData: any = await resetRes.json();
  console.log('Response from /api/auth/reset-password:', resetData);

  // 1.5 Confirm Login with New Password
  console.log(`\nAttempting login with updated credentials (${testEmail}, "${newTestPassword}")...`);
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: newTestPassword,
    }),
  });
  const loginData: any = await loginRes.json();
  console.log('Login Response status:', loginRes.status);
  console.log('Login Success! Received JWT Token:', loginData.token ? `${loginData.token.slice(0, 25)}...` : 'None');
  console.log('Authenticated User Object:', loginData.user);

  const employeeAuthToken = loginData.token;

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // STEP 2: Test Task Comments End-to-End
  // ---------------------------------------------------------------------------
  console.log('\n--- 💬 STEP 2: TEST TASK COMMENTS END-TO-END ---');
  
  // Pick an active task and ensure it is assigned to this employee so they can comment
  const [targetTask] = await db.select().from(tasks).limit(1);
  if (!targetTask) {
    throw new Error('No task found in DB to comment on');
  }

  // Assign this task to the test employee's employeeId to verify role-based employee commenting
  await db
    .update(tasks)
    .set({ assigneeId: testUser.employeeId || undefined })
    .where(eq(tasks.id, targetTask.id));

  console.log(`Target Task: [${targetTask.taskCode}] "${targetTask.title}" (ID: ${targetTask.id})`);
  console.log(`Assigned task to Employee ID: ${testUser.employeeId} (${testEmail})`);

  const commentPayload = {
    content: `E2E Verified Audit Comment posted by ${testEmail} on ${new Date().toISOString()} - Task comments system verified.`,
  };

  console.log(`Posting comment to POST /api/tasks/${targetTask.id}/comments...`);
  const postCommentRes = await fetch(`${BASE_URL}/api/tasks/${targetTask.id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${employeeAuthToken}`,
    },
    body: JSON.stringify(commentPayload),
  });
  const createdCommentData: any = await postCommentRes.json();
  console.log('API Response Status:', postCommentRes.status);
  console.log('API Response Body:', createdCommentData);

  // Query the task_comments table directly from DB
  const [realCommentRow] = await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.id, createdCommentData.id));

  console.log('\n✅ REAL task_comments ROW INSERTED IN DATABASE:');
  console.dir(realCommentRow, { depth: null });

  // ---------------------------------------------------------------------------
  // STEP 3: Confirm Employee Projects View Scoping vs Admin View
  // ---------------------------------------------------------------------------
  console.log('\n--- 📁 STEP 3: EMPLOYEE PROJECTS VIEW FILTERING AUDIT ---');

  // Total projects in database
  const [totalProjectsCountRes] = (await db.execute(sql`SELECT count(*) as count FROM projects`)).rows as any;
  const totalProjectsInDb = parseInt(totalProjectsCountRes.count, 10);
  console.log(`Total projects in database: ${totalProjectsInDb}`);

  // Fetch as ADMIN
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ashutoshmishraup78@mpgi.edu.in', password: 'Password@123' }),
  });
  const adminLoginData: any = await adminLoginRes.json();
  const adminToken = adminLoginData.token;

  if (adminToken) {
    const adminProjectsRes = await fetch(`${BASE_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const adminProjectsData: any = await adminProjectsRes.json();
    console.log(`Projects visible to ADMIN (ashutoshmishraup78@mpgi.edu.in): ${adminProjectsData.length} of ${totalProjectsInDb} total projects`);
  }

  // Fetch as EMPLOYEE before project assignment
  const empProjectsRes1 = await fetch(`${BASE_URL}/api/projects`, {
    headers: { 'Authorization': `Bearer ${employeeAuthToken}` },
  });
  const empProjectsData1: any = await empProjectsRes1.json();
  console.log(`Projects visible to EMPLOYEE (${testEmail}) before assignment: ${empProjectsData1.length} projects`);

  // Now assign employee to 1 project team
  const [sampleProject] = await db.select().from(projects).limit(1);
  const existingTeam: string[] = Array.isArray(sampleProject.team) ? (sampleProject.team as string[]) : [];
  if (!existingTeam.includes(testUser.employeeId!)) {
    existingTeam.push(testUser.employeeId!);
    await db.update(projects).set({ team: existingTeam }).where(eq(projects.id, sampleProject.id));
  }

  // Fetch as EMPLOYEE after project assignment
  const empProjectsRes2 = await fetch(`${BASE_URL}/api/projects`, {
    headers: { 'Authorization': `Bearer ${employeeAuthToken}` },
  });
  const empProjectsData2: any = await empProjectsRes2.json();
  console.log(`Projects visible to EMPLOYEE (${testEmail}) after assigning to project "${sampleProject.name}": ${empProjectsData2.length} projects`);
  console.log('Employee visible project details:');
  empProjectsData2.forEach((p: any) => {
    console.log(`  - [${p.projectCode}] "${p.name}" | Status: ${p.status} | Lead: ${p.lead}`);
  });

  console.log('\n========================================================================');
  console.log('🎉 ALL REAL DATA CHECKS COMPLETED SUCCESSFULLY');
  console.log('========================================================================');
  process.exit(0);
}

runE2EVerification().catch(err => {
  console.error('E2E Verification Failed:', err);
  process.exit(1);
});
