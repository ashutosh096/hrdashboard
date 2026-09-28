import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../artifacts/api-server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[FATAL] DATABASE_URL not set');
  process.exit(1);
}

const isApply = process.argv.includes('--apply');
const isDryRun = process.argv.includes('--dry-run') || !isApply;

console.log('========================================================================');
console.log(`🚀 STEP 3 SCHEMA MIGRATION: CREATED_BY & RECORD_HISTORY`);
console.log(`MODE: ${isDryRun ? '[DRY RUN - TRANSACTION WILL ROLL BACK]' : '[LIVE APPLY - WILL COMMIT]'}`);
console.log('========================================================================\n');

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  await client.query('BEGIN');
  console.log('1. Transaction started (BEGIN).');

  // a. Add created_by_id and created_by_name where missing on the 5 tables
  console.log('2. Ensuring created_by_id and created_by_name on initiatives, epics, tasks, sprints, projects...');
  const targetTables = ['initiatives', 'epics', 'tasks', 'sprints', 'projects'];
  for (const table of targetTables) {
    await client.query(`
      ALTER TABLE ${table} 
      ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES employees(id) ON DELETE SET NULL;
    `);
    await client.query(`
      ALTER TABLE ${table} 
      ADD COLUMN IF NOT EXISTS created_by_name text;
    `);
    console.log(`   ✓ Columns ensured on table: ${table}`);
  }

  // b. Create record_history table and index
  console.log('\n3. Ensuring table record_history and index...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS record_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      table_name varchar(50) NOT NULL,
      record_id uuid NOT NULL,
      action varchar(50) NOT NULL,
      field_name varchar(100),
      old_value text,
      new_value text,
      changed_by_id uuid REFERENCES employees(id) ON DELETE SET NULL,
      changed_by_name text NOT NULL,
      changed_at timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log('   ✓ Table record_history ensured.');

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_record_history_tbl_rec_time 
    ON record_history(table_name, record_id, changed_at DESC);
  `);
  console.log('   ✓ Index idx_record_history_tbl_rec_time ensured.');

  // c. Show existing rows count and how many have NULL creator
  console.log('\n4. Existing rows creator audit (NULL creators display as "Unknown"):');
  const auditRes = await client.query(`
    SELECT 'initiatives' AS table_name, count(*)::int AS total_rows, count(*) FILTER (WHERE created_by_id IS NULL)::int AS null_creators FROM initiatives
    UNION ALL
    SELECT 'epics', count(*)::int, count(*) FILTER (WHERE created_by_id IS NULL)::int FROM epics
    UNION ALL
    SELECT 'tasks', count(*)::int, count(*) FILTER (WHERE created_by_id IS NULL)::int FROM tasks
    UNION ALL
    SELECT 'sprints', count(*)::int, count(*) FILTER (WHERE created_by_id IS NULL)::int FROM sprints
    UNION ALL
    SELECT 'projects', count(*)::int, count(*) FILTER (WHERE created_by_id IS NULL)::int FROM projects
    ORDER BY table_name ASC;
  `);
  console.table(auditRes.rows);

  if (isDryRun) {
    await client.query('ROLLBACK');
    console.log('\n✅ [DRY RUN COMPLETE] Transaction rolled back cleanly. No changes committed to database.');
  } else {
    await client.query('COMMIT');
    console.log('\n✅ [APPLY COMPLETE] Transaction committed successfully. Schema updated.');
  }
} catch (err) {
  await client.query('ROLLBACK');
  console.error('\n❌ [ERROR OCCURRED - TRANSACTION ROLLED BACK]:', err);
  process.exit(1);
} finally {
  await client.end();
}
