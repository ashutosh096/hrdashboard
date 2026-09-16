import { db, sql } from '@workspace/db';

async function fixConstraint() {
  console.log('--- Checking & Updating Database Constraint ---');
  try {
    // 1. Drop the restrictive constraint if it exists
    await db.execute(sql`ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_task_type_lineage;`);
    console.log('[DB] Dropped old restrictive chk_task_type_lineage constraint!');

    // 2. Add flexible constraint allowing epic_id AND sprint_id together for SPRINT_TASK
    await db.execute(sql`
      ALTER TABLE tasks ADD CONSTRAINT chk_task_type_lineage CHECK (
        (task_type = 'EPIC_TASK' AND epic_id IS NOT NULL) OR
        (task_type = 'SPRINT_TASK' AND sprint_id IS NOT NULL) OR
        (task_type = 'BACKLOG')
      );
    `);
    console.log('[DB] Added updated flexible chk_task_type_lineage constraint!');
  } catch (err) {
    console.error('[DB CONSTRAINT ERROR]:', err);
  }
}

fixConstraint().then(() => process.exit(0));
