import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../artifacts/api-server/.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not defined in env');
  process.exit(1);
}

console.log('Connecting to Supabase DB for pre-migration backfill...');
const client = new pg.Client({ connectionString });
await client.connect();

try {
  console.log('--- PHASE 1: ENUM CREATION ---');
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "public"."task_type" AS ENUM('SPRINT_TASK', 'EPIC_TASK', 'BACKLOG');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log('--- PHASE 2: COLUMN ADDITIONS FOR BACKFILL ---');
  await client.query(`ALTER TABLE "initiatives" ADD COLUMN IF NOT EXISTS "initiative_code" VARCHAR(50);`);
  await client.query(`ALTER TABLE "epics" ADD COLUMN IF NOT EXISTS "epic_code" VARCHAR(50);`);
  await client.query(`ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "sprint_code" VARCHAR(50);`);
  await client.query(`ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "employee_id" UUID REFERENCES "employees"("id");`);
  await client.query(`ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "task_type" "public"."task_type" DEFAULT 'BACKLOG';`);
  await client.query(`ALTER TABLE "epics" ADD COLUMN IF NOT EXISTS "next_task_seq" INT DEFAULT 1 NOT NULL;`);
  await client.query(`ALTER TABLE "sprints" ADD COLUMN IF NOT EXISTS "next_task_seq" INT DEFAULT 1 NOT NULL;`);
  await client.query(`ALTER TABLE "entity_counters" ADD COLUMN IF NOT EXISTS "next_backlog_task_seq" INT DEFAULT 1 NOT NULL;`);

  console.log('--- PHASE 3: BACKFILLING INITIATIVE CODES ---');
  const initsRes = await client.query(`
    SELECT i.id, i.initiative_code, e.code as entity_code 
    FROM initiatives i 
    JOIN entities e ON i.entity_id = e.id 
    ORDER BY i.created_at ASC
  `);
  let initSeq = 1;
  for (const row of initsRes.rows) {
    const code = `${row.entity_code || 'EHM'}-I${String(initSeq).padStart(2, '0')}`;
    await client.query(`UPDATE initiatives SET initiative_code = $1 WHERE id = $2`, [code, row.id]);
    console.log(`Updated Initiative ${row.id} -> ${code}`);
    initSeq++;
  }

  console.log('--- PHASE 4: BACKFILLING EPIC CODES ---');
  const epicsRes = await client.query(`
    SELECT ep.id, ep.epic_code, i.initiative_code 
    FROM epics ep 
    JOIN initiatives i ON ep.initiative_id = i.id 
    ORDER BY ep.created_at ASC
  `);
  const epicSeqMap = {};
  for (const row of epicsRes.rows) {
    const initCode = row.initiative_code || 'EHM-I01';
    epicSeqMap[initCode] = (epicSeqMap[initCode] || 0) + 1;
    const code = `${initCode}-EP${String(epicSeqMap[initCode]).padStart(2, '0')}`;
    await client.query(`UPDATE epics SET epic_code = $1 WHERE id = $2`, [code, row.id]);
    console.log(`Updated Epic ${row.id} -> ${code}`);
  }

  console.log('--- PHASE 5: BACKFILLING SPRINT CODES & EMPLOYEE_ID ---');
  const empRes = await client.query(`SELECT id, employee_code FROM employees LIMIT 1`);
  const defaultEmpId = empRes.rows[0]?.id;
  if (!defaultEmpId) throw new Error('No employees found in DB to assign sprint owner!');

  await client.query(`UPDATE sprints SET employee_id = $1 WHERE employee_id IS NULL`, [defaultEmpId]);

  const sprintsRes = await client.query(`
    SELECT s.id, s.target_week, e.employee_code 
    FROM sprints s 
    JOIN employees e ON s.employee_id = e.id 
    ORDER BY s.created_at ASC
  `);
  const seenSprintCodes = {};
  for (const row of sprintsRes.rows) {
    let weekNum = '1';
    if (row.target_week) {
      const match = row.target_week.match(/\d+/);
      if (match) weekNum = match[0];
    }
    const empCode = (row.employee_code || 'EHM-E01').replace('-EMP', '-E');
    const baseCode = `${empCode}-W${weekNum}`;
    seenSprintCodes[baseCode] = (seenSprintCodes[baseCode] || 0) + 1;
    const code = seenSprintCodes[baseCode] === 1 ? baseCode : `${baseCode}-S${seenSprintCodes[baseCode]}`;

    await client.query(`UPDATE sprints SET sprint_code = $1 WHERE id = $2`, [code, row.id]);
    console.log(`Updated Sprint ${row.id} -> ${code}`);
  }

  console.log('--- PHASE 6: BACKFILLING TASK TYPES & CLEANING CONFLICTING LINEAGE ---');
  // EPIC_TASK takes precedence when epic_id is set -> clear sprint_id to obey lineage constraint
  await client.query(`UPDATE tasks SET task_type = 'EPIC_TASK', sprint_id = NULL WHERE epic_id IS NOT NULL;`);
  await client.query(`UPDATE tasks SET task_type = 'SPRINT_TASK' WHERE sprint_id IS NOT NULL AND epic_id IS NULL;`);
  await client.query(`UPDATE tasks SET task_type = 'BACKLOG' WHERE epic_id IS NULL AND sprint_id IS NULL;`);

  console.log('--- PHASE 7: ROW-COUNT SEQUENCE COUNTER INITIALIZATION ---');
  await client.query(`UPDATE epics e SET next_task_seq = (SELECT COUNT(*) + 1 FROM tasks WHERE epic_id = e.id);`);
  await client.query(`UPDATE sprints s SET next_task_seq = (SELECT COUNT(*) + 1 FROM tasks WHERE sprint_id = s.id);`);
  await client.query(`
    UPDATE entity_counters ec SET next_backlog_task_seq = (
      SELECT COUNT(*) + 1 FROM tasks WHERE entity_id = ec.entity_id AND epic_id IS NULL AND sprint_id IS NULL
    );
  `);

  console.log('✅ PRE-MIGRATION BACKFILL COMPLETED SUCCESSFULLY!');
} catch (err) {
  console.error('❌ BACKFILL FAILED:', err);
  process.exit(1);
} finally {
  await client.end();
}
