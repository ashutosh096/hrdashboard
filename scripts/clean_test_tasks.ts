import { db, sql } from '@workspace/db';

async function main() {
  const r: any = await db.execute(sql`
    DELETE FROM tasks 
    WHERE title LIKE 'TEST %' OR title LIKE 'E2E-TEST-%'
    RETURNING id, title;
  `);
  console.log('Cleaned up previous test tasks count:', r.rows.length);
  for (const row of r.rows) {
    console.log(JSON.stringify(row));
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
