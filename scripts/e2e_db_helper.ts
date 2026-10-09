import { db, sql } from '@workspace/db';

async function main() {
  const action = process.argv[2];

  if (action === 'check') {
    const taskId = process.argv[3];
    const userId = process.argv[4];

    const taskRes: any = await db.execute(sql`
      SELECT id, title, task_code, assignee_id, priority, status, created_at 
      FROM tasks 
      WHERE id = ${taskId}::uuid;
    `);

    const notifRes: any = await db.execute(sql`
      SELECT id, user_id, type, payload, read_at, created_at 
      FROM notifications 
      WHERE user_id = ${userId}::uuid 
        AND payload->>'taskId' = ${taskId}
      ORDER BY created_at DESC;
    `);

    console.log('--- TASK ROW ---');
    console.log(JSON.stringify(taskRes.rows[0] || null, null, 2));

    console.log('--- NOTIFICATION ROW FOR USER X ---');
    console.log(JSON.stringify(notifRes.rows[0] || null, null, 2));

    if (!notifRes.rows[0]) {
      console.error(`ERROR: No notification found for User X (${userId}) tied to Task (${taskId})!`);
      process.exit(2);
    }

    process.exit(0);
  }

  if (action === 'cleanup') {
    const rawIds = process.argv[3] || '';
    const taskIds = rawIds.split(',').filter(Boolean);

    console.log(`Cleaning up ${taskIds.length} E2E test tasks...`);

    if (taskIds.length > 0) {
      // 1. Delete notifications tied specifically to these test tasks
      const notifsDeleted: any = await db.execute(sql`
        DELETE FROM notifications 
        WHERE payload->>'taskId' IN (${sql.raw(taskIds.map(id => `'${id}'`).join(','))})
        RETURNING id, user_id, payload->>'title' as title;
      `);
      console.log(`Deleted test notifications: ${notifsDeleted.rows.length}`);
      for (const r of notifsDeleted.rows) {
        console.log(`  - Deleted notif: ${r.id} (${r.title})`);
      }

      // 2. Delete history, comments, and checklists for these test tasks
      await db.execute(sql`
        DELETE FROM record_history WHERE record_id IN (${sql.raw(taskIds.map(id => `'${id}'`).join(','))});
      `);
      await db.execute(sql`
        DELETE FROM task_comments WHERE task_id IN (${sql.raw(taskIds.map(id => `'${id}'`).join(','))});
      `);
      await db.execute(sql`
        DELETE FROM task_checklists WHERE task_id IN (${sql.raw(taskIds.map(id => `'${id}'`).join(','))});
      `);

      // 3. Delete the tasks themselves (strictly requiring title LIKE 'E2E-TEST-%')
      const tasksDeleted: any = await db.execute(sql`
        DELETE FROM tasks 
        WHERE id IN (${sql.raw(taskIds.map(id => `'${id}'`).join(','))})
          AND title LIKE 'E2E-TEST-%'
        RETURNING id, title;
      `);
      console.log(`Deleted test tasks: ${tasksDeleted.rows.length}`);
      for (const r of tasksDeleted.rows) {
        console.log(`  - Deleted task: ${r.id} (${r.title})`);
      }
    }

    // Safety check: confirm no rows with E2E-TEST- remain
    const remainingTasks: any = await db.execute(sql`
      SELECT id, title FROM tasks WHERE title LIKE 'E2E-TEST-%';
    `);
    const remainingNotifs: any = await db.execute(sql`
      SELECT id, payload->>'title' as title FROM notifications WHERE payload->>'title' LIKE 'E2E-TEST-%';
    `);

    console.log(`Remaining E2E-TEST tasks in DB: ${remainingTasks.rows.length}`);
    console.log(`Remaining E2E-TEST notifications in DB: ${remainingNotifs.rows.length}`);

    process.exit(0);
  }

  console.error(`Unknown action: ${action}`);
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
