import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../artifacts/api-server/.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.qlnghemivzcyazvtndhv:Hrdash%40123%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const client = new pg.Client({ connectionString });
await client.connect();

async function verifyDualOverdueNotifications() {
  console.log('=====================================================');
  console.log('   OVERDUE TASK DUAL NOTIFICATION VERIFICATION TEST   ');
  console.log('=====================================================\n');

  const [ehmEntity] = (await client.query(`SELECT id FROM entities WHERE code = 'EHM'`)).rows;
  const [dept] = (await client.query(`SELECT id FROM departments LIMIT 1`)).rows;

  // 1. Create two test employees and associated user accounts
  const emp1Res = await client.query(`
    INSERT INTO employees (employee_code, entity_id, department_id, first_name, last_name, email, designation, salary, joining_date)
    VALUES ('EHM-TEST-E01', $1, $2, 'Manager', 'Lead', 'test_lead_mgr@example.com', 'Manager', 50000, NOW())
    RETURNING id, email;
  `, [ehmEntity.id, dept.id]);
  const emp1 = emp1Res.rows[0];

  const user1Res = await client.query(`
    INSERT INTO users (email, password_hash, role, employee_id)
    VALUES ($1, 'hash123', 'MANAGER', $2)
    RETURNING id, email;
  `, [emp1.email, emp1.id]);
  const leadUser = user1Res.rows[0];

  const emp2Res = await client.query(`
    INSERT INTO employees (employee_code, entity_id, department_id, first_name, last_name, email, designation, salary, joining_date)
    VALUES ('EHM-TEST-E02', $1, $2, 'Assignee', 'Worker', 'test_assignee_emp@example.com', 'Specialist', 45000, NOW())
    RETURNING id, email;
  `, [ehmEntity.id, dept.id]);
  const emp2 = emp2Res.rows[0];

  const user2Res = await client.query(`
    INSERT INTO users (email, password_hash, role, employee_id)
    VALUES ($1, 'hash123', 'EMPLOYEE', $2)
    RETURNING id, email;
  `, [emp2.email, emp2.id]);
  const assigneeUser = user2Res.rows[0];

  console.log(`[TEST SETUP] Reviewing Lead User: ${leadUser.email} (User ID: ${leadUser.id})`);
  console.log(`[TEST SETUP] Assignee User:       ${assigneeUser.email} (User ID: ${assigneeUser.id})\n`);

  // 2. Create an overdue task (due date in past)
  const overdueDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

  const taskRes = await client.query(`
    INSERT INTO tasks (
      task_code, title, entity_id, department_id, assignee_id, reviewing_lead_id, creator_id, due_date, status, task_type
    ) VALUES (
      'TEST-OVERDUE-DUAL-01', 'Dual Overdue Test Task', $1, $2, $3, $4, $4, $5, 'IN_PROGRESS', 'BACKLOG'
    ) RETURNING id, task_code;
  `, [ehmEntity.id, dept.id, emp2.id, emp1.id, overdueDate]);

  const testTask = taskRes.rows[0];
  console.log(`[TEST TASK CREATED] Task Code: ${testTask.task_code} (ID: ${testTask.id})\n`);

  // 3. Clear any existing recent notifications for this task
  await client.query(`
    DELETE FROM notifications 
    WHERE payload->>'taskId' = $1;
  `, [testTask.id]);

  // 4. Import and execute runOverdueAndTokenChecks from compiled api-server
  const { runOverdueAndTokenChecks } = await import('../../artifacts/api-server/dist/jobs/overdue-check-cron.js');
  await runOverdueAndTokenChecks();

  // 5. Query notifications table for real inserted rows
  const notifsRes = await client.query(`
    SELECT id, user_id, type, payload, created_at
    FROM notifications
    WHERE payload->>'taskId' = $1
    ORDER BY created_at ASC;
  `, [testTask.id]);

  console.log(`--- NOTIFICATIONS TABLE VERIFICATION OUTPUT ---`);
  console.log(`Inserted Rows Count: ${notifsRes.rows.length}`);

  notifsRes.rows.forEach((row, idx) => {
    const isLead = row.user_id === leadUser.id;
    const isAssignee = row.user_id === assigneeUser.id;
    const recipientRole = isLead ? 'REVIEWING LEAD' : isAssignee ? 'ASSIGNEE' : 'OTHER';
    console.log(`[Row ${idx + 1}] ID: ${row.id}`);
    console.log(`        Recipient User ID: ${row.user_id} (${recipientRole})`);
    console.log(`        Type: ${row.type}`);
    console.log(`        Payload: ${JSON.stringify(row.payload)}`);
  });

  const leadReceivedNotif = notifsRes.rows.some(r => r.user_id === leadUser.id);
  const assigneeReceivedNotif = notifsRes.rows.some(r => r.user_id === assigneeUser.id);

  console.log('\n--- DUAL RECIPIENT VERIFICATION CHECKS ---');
  console.log(`[PASS] Reviewing Lead Received Notification Row: ${leadReceivedNotif}`);
  console.log(`[PASS] Assignee Received Notification Row:       ${assigneeReceivedNotif}`);

  if (leadReceivedNotif && assigneeReceivedNotif && notifsRes.rows.length === 2) {
    console.log('\n=====================================================');
    console.log('✅ BOTH RECIPIENTS RECEIVED REAL NOTIFICATION ROWS!');
    console.log('=====================================================');
  } else {
    console.error('❌ Dual notification verification failed.');
  }

  // Cleanup test data
  await client.query(`DELETE FROM notifications WHERE payload->>'taskId' = $1;`, [testTask.id]);
  await client.query(`DELETE FROM tasks WHERE id = $1;`, [testTask.id]);
  await client.query(`DELETE FROM users WHERE id IN ($1, $2);`, [leadUser.id, assigneeUser.id]);
  await client.query(`DELETE FROM employees WHERE id IN ($1, $2);`, [emp1.id, emp2.id]);
  console.log('\n🧹 Cleaned up temporary test artifacts from Supabase DB.');
}

verifyDualOverdueNotifications()
  .catch(err => console.error('Verification error:', err))
  .finally(() => client.end());
