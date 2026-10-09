import { db, sql } from '@workspace/db';

async function main() {
  const userXNotifs: any = await db.execute(sql`
    SELECT id, user_id, type, payload->>'title' as title, payload->>'taskId' as task_id, read_at, created_at 
    FROM notifications 
    WHERE user_id = '6df0b051-0183-414d-96df-b32a19a24cf2'
    ORDER BY created_at DESC;
  `);
  console.log('User X notifications count:', userXNotifs.rows.length);
  for (const row of userXNotifs.rows) {
    console.log('USER_X_NOTIF:', JSON.stringify(row));
  }

  const testNotifs: any = await db.execute(sql`
    SELECT id, user_id, type, payload->>'title' as title, payload->>'taskId' as task_id, read_at, created_at 
    FROM notifications 
    WHERE payload->>'title' LIKE '%TEST%' OR payload->>'title' LIKE '%E2E%'
    ORDER BY created_at DESC;
  `);
  console.log('Test notifications count:', testNotifs.rows.length);
  for (const row of testNotifs.rows) {
    console.log('TEST_NOTIF:', JSON.stringify(row));
  }

  const testTasks: any = await db.execute(sql`
    SELECT id, title, task_code, assignee_id, created_at 
    FROM tasks 
    WHERE title LIKE '%TEST%' OR title LIKE '%E2E%'
    ORDER BY created_at DESC;
  `);
  console.log('Test tasks count:', testTasks.rows.length);
  for (const row of testTasks.rows) {
    console.log('TEST_TASK:', JSON.stringify(row));
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
