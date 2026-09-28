/**
 * Step 2 migration: create global_counters table and seed it.
 *
 * Seeding logic:
 *   - next_team_seq        = count(employees) + 1
 *   - next_init_seq        = count(initiatives) + 1
 *   - next_epic_seq        = count(epics) + 1
 *   - next_epic_task_seq   = count(EPIC_TASK tasks) + 1
 *   - next_sprint_task_seq = count(SPRINT_TASK tasks) + 1
 *   - next_blog_task_seq   = count(BACKLOG tasks) + 1
 *   - next_sprint_seq      = count(sprints) + 1
 *   - next_project_seq     = count(projects) + 1
 *
 * This ensures future codes never collide with existing ones.
 * Note: Do not re-run this script directly.
 */

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

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log('[CONNECTED] Running Step 2 migration...');

try {
  // 1. Create table
  await client.query(`
    CREATE TABLE IF NOT EXISTS global_counters (
      id               INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      next_team_seq    INTEGER NOT NULL DEFAULT 1,
      next_init_seq    INTEGER NOT NULL DEFAULT 1,
      next_epic_seq    INTEGER NOT NULL DEFAULT 1,
      next_epic_task_seq   INTEGER NOT NULL DEFAULT 1,
      next_sprint_task_seq INTEGER NOT NULL DEFAULT 1,
      next_blog_task_seq   INTEGER NOT NULL DEFAULT 1,
      next_sprint_seq  INTEGER NOT NULL DEFAULT 1,
      next_project_seq INTEGER NOT NULL DEFAULT 1
    );
  `);
  console.log('[OK] global_counters table created (or already exists)');

  // 2. Compute seeds from existing data
  const teamRes   = await client.query(`SELECT COUNT(*) AS cnt FROM employees`);
  const initRes   = await client.query(`SELECT COUNT(*) AS cnt FROM initiatives`);
  const epicRes   = await client.query(`SELECT COUNT(*) AS cnt FROM epics`);
  const etRes     = await client.query(`SELECT COUNT(*) AS cnt FROM tasks WHERE task_type = 'EPIC_TASK'`);
  const stRes     = await client.query(`SELECT COUNT(*) AS cnt FROM tasks WHERE task_type = 'SPRINT_TASK'`);
  const blRes     = await client.query(`SELECT COUNT(*) AS cnt FROM tasks WHERE task_type = 'BACKLOG'`);
  const sprintRes = await client.query(`SELECT COUNT(*) AS cnt FROM sprints`);
  const projRes   = await client.query(`SELECT COUNT(*) AS cnt FROM projects`);

  const seed = (n) => n + 1;

  const nextTeam    = seed(parseInt(teamRes.rows[0].cnt, 10));
  const nextInit    = seed(parseInt(initRes.rows[0].cnt, 10));
  const nextEpic    = seed(parseInt(epicRes.rows[0].cnt, 10));
  const nextEpicTask = seed(parseInt(etRes.rows[0].cnt, 10));
  const nextSprintTask = seed(parseInt(stRes.rows[0].cnt, 10));
  const nextBlogTask  = seed(parseInt(blRes.rows[0].cnt, 10));
  const nextSprint   = seed(parseInt(sprintRes.rows[0].cnt, 10));
  const nextProject  = seed(parseInt(projRes.rows[0].cnt, 10));

  console.log(`[SEED] team=${nextTeam} init=${nextInit} epic=${nextEpic} epicTask=${nextEpicTask} sprintTask=${nextSprintTask} blogTask=${nextBlogTask} sprint=${nextSprint} project=${nextProject}`);

  // 3. Upsert single row (id=1)
  await client.query(`
    INSERT INTO global_counters
      (id, next_team_seq, next_init_seq, next_epic_seq, next_epic_task_seq,
       next_sprint_task_seq, next_blog_task_seq, next_sprint_seq, next_project_seq)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      next_team_seq        = EXCLUDED.next_team_seq,
      next_init_seq        = EXCLUDED.next_init_seq,
      next_epic_seq        = EXCLUDED.next_epic_seq,
      next_epic_task_seq   = EXCLUDED.next_epic_task_seq,
      next_sprint_task_seq = EXCLUDED.next_sprint_task_seq,
      next_blog_task_seq   = EXCLUDED.next_blog_task_seq,
      next_sprint_seq      = EXCLUDED.next_sprint_seq,
      next_project_seq     = EXCLUDED.next_project_seq
    WHERE
      global_counters.next_team_seq < EXCLUDED.next_team_seq
      OR global_counters.next_init_seq < EXCLUDED.next_init_seq
      OR global_counters.next_epic_seq < EXCLUDED.next_epic_seq
      OR global_counters.next_epic_task_seq < EXCLUDED.next_epic_task_seq
      OR global_counters.next_sprint_task_seq < EXCLUDED.next_sprint_task_seq
      OR global_counters.next_blog_task_seq < EXCLUDED.next_blog_task_seq
      OR global_counters.next_sprint_seq < EXCLUDED.next_sprint_seq
      OR global_counters.next_project_seq < EXCLUDED.next_project_seq;
  `, [1, nextTeam, nextInit, nextEpic, nextEpicTask, nextSprintTask, nextBlogTask, nextSprint, nextProject]);

  console.log('[OK] global_counters row seeded');

  // 4. Verify
  const check = await client.query('SELECT * FROM global_counters WHERE id = 1');
  console.log('[VERIFY]', JSON.stringify(check.rows[0], null, 2));

  console.log('\n✅ Step 2 migration complete.');
} catch (err) {
  console.error('❌ Migration failed:', err);
  process.exit(1);
} finally {
  await client.end();
}
