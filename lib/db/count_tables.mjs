import { db, sql } from './dist/index.js';

async function main() {
  const tablesRes = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND NOT table_name LIKE '__drizzle%'
    ORDER BY table_name;
  `);
  const counts = {};
  for (const row of tablesRes.rows) {
    const cnt = await db.execute(sql.raw(`SELECT COUNT(*) AS count FROM "${row.table_name}"`));
    counts[row.table_name] = parseInt(cnt.rows[0].count, 10);
  }
  console.log(JSON.stringify(counts, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
