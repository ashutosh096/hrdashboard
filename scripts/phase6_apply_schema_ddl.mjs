import { db, sql } from '../lib/db/dist/index.js';

async function main() {
  console.log('========================================================================');
  console.log('🛡️ PHASE 6: APPLYING SOFT-DELETE COLUMNS & FOREIGN KEY CASCADES');
  console.log('========================================================================\n');

  // 1. Add deleted_at columns & indexes
  const tables = ['tasks', 'epics', 'sprints', 'initiatives', 'projects'];
  for (const table of tables) {
    console.log(`Adding deleted_at column and index to "${table}"...`);
    await db.execute(sql.raw(`
      ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
      CREATE INDEX IF NOT EXISTS idx_${table}_deleted_at ON ${table}(deleted_at);
    `));
  }

  // 2. Update task child tables foreign key constraints to ON DELETE CASCADE (BUG-020 & D-09)
  console.log('Updating task_checklists foreign key to ON DELETE CASCADE...');
  await db.execute(sql.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_checklists_task_id_tasks_id_fk') THEN
        ALTER TABLE task_checklists DROP CONSTRAINT task_checklists_task_id_tasks_id_fk;
      END IF;
      ALTER TABLE task_checklists ADD CONSTRAINT task_checklists_task_id_tasks_id_fk 
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
    END $$;
  `));

  console.log('Updating task_notes foreign key to ON DELETE CASCADE...');
  await db.execute(sql.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_notes_task_id_tasks_id_fk') THEN
        ALTER TABLE task_notes DROP CONSTRAINT task_notes_task_id_tasks_id_fk;
      END IF;
      ALTER TABLE task_notes ADD CONSTRAINT task_notes_task_id_tasks_id_fk 
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
    END $$;
  `));

  console.log('\nVerifying columns in database:');
  for (const table of tables) {
    const res = await db.execute(sql.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${table}' AND column_name = 'deleted_at';
    `));
    console.log(`  ✓ ${table}: ${(res.rows || res)[0]?.column_name || 'NOT FOUND'} (${(res.rows || res)[0]?.data_type || ''})`);
  }

  console.log('\n✅ Phase 6 Schema DDL applied successfully!');
}

main().then(() => process.exit(0)).catch(err => {
  console.error('MIGRATION FAILED:', err);
  process.exit(1);
});
