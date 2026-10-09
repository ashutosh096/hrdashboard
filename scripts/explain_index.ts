import { db, sql } from '@workspace/db';

async function runExplainIndex() {
  await db.execute(sql`SET enable_seqscan = off;`);

  const query = sql`EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  count(*)::int AS "unreadCount",
  (array_agg(id order by created_at desc))[1] AS "latestUnreadId",
  (array_agg(created_at order by created_at desc))[1] AS "latestUnreadCreatedAt"
FROM notifications
WHERE user_id = 'fa0289e6-0109-4228-9f3d-f54b7164773c' AND read_at IS NULL;`;

  const result: any = await db.execute(query);
  const lines = result.rows.map((r: any) => Object.values(r)[0]).join('\n');
  console.log('=== EXPLAIN (ANALYZE, BUFFERS) WITH enable_seqscan=off ===');
  console.log(lines);

  await db.execute(sql`SET enable_seqscan = on;`);
  process.exit(0);
}

runExplainIndex().catch(err => {
  console.error(err);
  process.exit(1);
});
