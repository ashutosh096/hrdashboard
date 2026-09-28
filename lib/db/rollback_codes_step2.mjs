import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../artifacts/api-server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[FATAL] DATABASE_URL not set');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '../..');
const jsonPath = path.resolve(rootDir, 'migration_mapping_step2.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`[FATAL] Mapping file not found at ${jsonPath}. Refusing to run.`);
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const EXPECTED_MAPPING_COUNT = 62; // 13 employees + 7 initiatives + 7 epics + 19 tasks + 3 sprints + 13 projects = 62

if (!Array.isArray(mapping) || mapping.length !== EXPECTED_MAPPING_COUNT) {
  console.error(`[FATAL] Mapping file row count mismatch: found ${mapping?.length}, expected exactly ${EXPECTED_MAPPING_COUNT}. Refusing to run.`);
  process.exit(1);
}

console.log(`Loaded and verified ${mapping.length} mappings from ${jsonPath}`);

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply');

console.log('========================================================================');
console.log(`🔄 STEP 2 CODE ROLLBACK ${isDryRun ? '[DRY RUN - WILL ROLLBACK]' : '[LIVE EXECUTION]'}`);
console.log('========================================================================\n');

console.log('------------------------------------------------------------------------');
console.log('ℹ️ SCOPE NOTICE:');
console.log('This script restores all 62 entity codes (employees, initiatives, epics,');
console.log('tasks, sprints, projects) and restores all global counters (ADMN, MANA,');
console.log('TEAM, INIT, EPIC, TASK, STSK, BLOG, SPRT, PROJ).');
console.log('');
console.log('WHAT IT DOES NOT UNDO:');
console.log('- It does NOT drop the new columns (next_admn_seq, next_mana_seq) on global_counters.');
console.log('- It does NOT drop the empty employee_code_history table.');
console.log('------------------------------------------------------------------------\n');

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  await client.query('BEGIN');
  console.log('Transaction started (BEGIN)...\n');

  // Step 1: Assign temporary values <= 15 chars to all rows to avoid unique constraint collisions
  for (let i = 0; i < mapping.length; i++) {
    const item = mapping[i];
    let col = 'code';
    if (item.table === 'employees') col = 'employee_code';
    else if (item.table === 'initiatives') col = 'initiative_code';
    else if (item.table === 'epics') col = 'epic_code';
    else if (item.table === 'tasks') col = 'task_code';
    else if (item.table === 'sprints') col = 'sprint_code';
    else if (item.table === 'projects') col = 'code';

    const tempCode = `TMPRB${String(i + 1).padStart(4, '0')}`;
    await client.query(`UPDATE ${item.table} SET ${col} = $1 WHERE id = $2`, [tempCode, item.id]);
  }

  // Step 2: Restore old codes
  for (const item of mapping) {
    let col = 'code';
    if (item.table === 'employees') col = 'employee_code';
    else if (item.table === 'initiatives') col = 'initiative_code';
    else if (item.table === 'epics') col = 'epic_code';
    else if (item.table === 'tasks') col = 'task_code';
    else if (item.table === 'sprints') col = 'sprint_code';
    else if (item.table === 'projects') col = 'code';

    await client.query(`UPDATE ${item.table} SET ${col} = $1 WHERE id = $2`, [item.old_code, item.id]);
  }

  // Step 3: Restore global counters to pre-migration numbers
  // Pre-migration values: ADMN 1, MANA 1, TEAM 22, INIT 15, EPIC 16, TASK 18, STSK 5, BLOG 13, SPRT 9, PROJ 20
  await client.query(`
    UPDATE global_counters
    SET
      next_admn_seq        = 1,
      next_mana_seq        = 1,
      next_team_seq        = 22,
      next_init_seq        = 15,
      next_epic_seq        = 16,
      next_epic_task_seq   = 18,
      next_sprint_task_seq = 5,
      next_blog_task_seq   = 13,
      next_sprint_seq      = 9,
      next_project_seq     = 20
    WHERE id = 1
  `);

  console.log('✅ Restored all 62 codes to old values and restored global_counters (ADMN/MANA/TEAM included) to original state.');

  if (isDryRun) {
    console.log('\n🔄 DRY RUN: Rolling back transaction (ROLLBACK)...');
    await client.query('ROLLBACK');
    console.log('✅ ROLLBACK complete. DB unchanged.');
  } else {
    console.log('\n💾 LIVE RUN: Committing transaction (COMMIT)...');
    await client.query('COMMIT');
    console.log('✅ COMMIT complete. Rollback applied.');
  }

} catch (err) {
  console.error('❌ ROLLBACK SCRIPT ERROR:', err);
  await client.query('ROLLBACK');
  process.exit(1);
} finally {
  await client.end();
}
