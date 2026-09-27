import { db } from '../../../lib/db/src/index';
import { sql } from 'drizzle-orm';

async function main() {
  // Table list from information_schema
  const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`);
  const tableNames = tables.rows.map((r: any) => r.table_name as string);
  
  console.log('=== TABLE LIST (' + tableNames.length + ' tables) ===');
  console.log(JSON.stringify(tableNames, null, 2));

  // Row counts for each table
  const counts: Record<string, number> = {};
  for (const t of tableNames) {
    const res = await db.execute(sql.raw(`SELECT COUNT(*) as c FROM "${t}"`));
    counts[t] = parseInt((res.rows[0] as any).c);
  }
  console.log('\n=== ROW COUNTS ===');
  console.log(JSON.stringify(counts, null, 2));

  // User role breakdown
  const roles = await db.execute(sql`SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role`);
  console.log('\n=== USER ROLES ===');
  console.log(JSON.stringify(roles.rows, null, 2));

  // Entity list
  const entities = await db.execute(sql`SELECT id, name, code FROM entities ORDER BY name`);
  console.log('\n=== ENTITIES ===');
  console.log(JSON.stringify(entities.rows, null, 2));

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
