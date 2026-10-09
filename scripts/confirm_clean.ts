import { db, sql } from '@workspace/db';

async function main() {
  const tasks: any = await db.execute(sql`
    SELECT id, title, task_code, assignee_id, created_at 
    FROM tasks 
    WHERE title LIKE '%E2E-TEST%' OR title LIKE '%TEST%';
  `);

  const notifs: any = await db.execute(sql`
    SELECT id, user_id, type, payload->>'title' as title, created_at 
    FROM notifications 
    WHERE payload->>'title' LIKE '%E2E-TEST%' OR payload->>'title' LIKE '%TEST%';
  `);

  console.log('--- CONFIRMATION QUERY RESULT ---');
  console.log('Remaining E2E-TEST / TEST tasks in DB:         ', tasks.rows.length);
  console.log('Remaining E2E-TEST / TEST notifications in DB: ', notifs.rows.length);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
