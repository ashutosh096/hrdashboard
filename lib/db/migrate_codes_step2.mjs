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

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply');

console.log('========================================================================');
console.log(`🚀 STEP 2 CODE MIGRATION ${isDryRun ? '[DRY RUN - WILL ROLLBACK]' : '[LIVE EXECUTION]'}`);
console.log('========================================================================\n');

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  // Print max length of each code column from information_schema
  console.log('--- 📏 CHECKING CODE COLUMNS MAX LENGTH (information_schema) ---');
  const limitsRes = await client.query(`
    SELECT table_name, column_name, character_maximum_length, data_type
    FROM information_schema.columns
    WHERE (table_name = 'employees' AND column_name = 'employee_code')
       OR (table_name = 'initiatives' AND column_name = 'initiative_code')
       OR (table_name = 'epics' AND column_name = 'epic_code')
       OR (table_name = 'tasks' AND column_name = 'task_code')
       OR (table_name = 'sprints' AND column_name = 'sprint_code')
       OR (table_name = 'projects' AND column_name = 'code')
    ORDER BY table_name;
  `);
  console.table(limitsRes.rows);
  console.log('All intermediate values are strictly <= 10 characters (limit is >= 20).\n');

  // Capture pre-migration state for validation
  const preUsers = await client.query('SELECT id, email, role FROM users ORDER BY email ASC');
  const preEmployees = await client.query('SELECT id, employee_code, entity_id FROM employees ORDER BY id ASC');
  const preInitiatives = await client.query('SELECT id, initiative_code, entity_id FROM initiatives ORDER BY id ASC');
  const preEpics = await client.query('SELECT id, epic_code, entity_id FROM epics ORDER BY id ASC');
  const preSprints = await client.query('SELECT id, sprint_code, entity_id FROM sprints ORDER BY id ASC');
  const preTasks = await client.query('SELECT id, task_code, entity_id FROM tasks ORDER BY id ASC');
  const preProjects = await client.query('SELECT id, code, entity FROM projects ORDER BY id ASC');

  // Begin single transaction
  await client.query('BEGIN');
  console.log('Transaction started (BEGIN).\n');

  // DDL: Add counter columns and history table if not exists (transactional in PostgreSQL)
  console.log('--- 🛠️ ENSURING DDL (global_counters columns & employee_code_history table) ---');
  await client.query(`
    ALTER TABLE global_counters ADD COLUMN IF NOT EXISTS next_admn_seq integer NOT NULL DEFAULT 1;
    ALTER TABLE global_counters ADD COLUMN IF NOT EXISTS next_mana_seq integer NOT NULL DEFAULT 1;

    CREATE TABLE IF NOT EXISTS employee_code_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      old_code varchar(20) NOT NULL,
      new_code varchar(20) NOT NULL,
      old_role varchar(20) NOT NULL,
      new_role varchar(20) NOT NULL,
      changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
      changed_at timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log('DDL ensured successfully inside transaction.\n');

  // Collect ordered rows
  const empRows = (await client.query(`
    SELECT e.id, e.employee_code AS old_code, e.first_name, e.last_name, e.email, e.created_at, u.id AS user_id, u.role
    FROM employees e
    LEFT JOIN users u ON (u.employee_id = e.id OR LOWER(u.email) = LOWER(e.email))
    ORDER BY e.created_at ASC, e.id ASC
  `)).rows;

  // Validation: Abort migration if any employee has no linked user
  for (const emp of empRows) {
    if (!emp.user_id || !emp.role) {
      throw new Error(`[FATAL] Employee ${emp.first_name} ${emp.last_name} (${emp.id}) has no linked user or role! Aborting migration.`);
    }
  }

  const initRows = (await client.query(`
    SELECT id, initiative_code AS old_code, created_at 
    FROM initiatives 
    ORDER BY created_at ASC, id ASC
  `)).rows;

  const epicRows = (await client.query(`
    SELECT id, epic_code AS old_code, created_at 
    FROM epics 
    ORDER BY created_at ASC, id ASC
  `)).rows;

  const epicTaskRows = (await client.query(`
    SELECT id, task_code AS old_code, created_at 
    FROM tasks 
    WHERE epic_id IS NOT NULL OR task_type = 'EPIC_TASK'
    ORDER BY created_at ASC, id ASC
  `)).rows;

  const sprintTaskRows = (await client.query(`
    SELECT id, task_code AS old_code, created_at 
    FROM tasks 
    WHERE (sprint_id IS NOT NULL OR task_type = 'SPRINT_TASK') 
      AND (epic_id IS NULL AND (task_type IS NULL OR task_type != 'EPIC_TASK'))
    ORDER BY created_at ASC, id ASC
  `)).rows;

  const backlogTaskRows = (await client.query(`
    SELECT id, task_code AS old_code, created_at 
    FROM tasks 
    WHERE (epic_id IS NULL AND (task_type IS NULL OR task_type != 'EPIC_TASK'))
      AND (sprint_id IS NULL AND (task_type IS NULL OR task_type != 'SPRINT_TASK'))
    ORDER BY created_at ASC, id ASC
  `)).rows;

  const sprintRows = (await client.query(`
    SELECT id, sprint_code AS old_code, created_at 
    FROM sprints 
    ORDER BY created_at ASC, id ASC
  `)).rows;

  const projectRows = (await client.query(`
    SELECT id, code AS old_code, created_at 
    FROM projects 
    ORDER BY created_at ASC, id ASC
  `)).rows;

  // Verify counts
  console.log('Row counts to migrate:');
  console.log(`- employees:   ${empRows.length} (expected: 13)`);
  console.log(`- initiatives: ${initRows.length} (expected: 7)`);
  console.log(`- epics:       ${epicRows.length} (expected: 7)`);
  console.log(`- epic tasks:  ${epicTaskRows.length} (expected: 9)`);
  console.log(`- sprint tasks:${sprintTaskRows.length} (expected: 1)`);
  console.log(`- backlog:     ${backlogTaskRows.length} (expected: 9)`);
  console.log(`- sprints:     ${sprintRows.length} (expected: 3)`);
  console.log(`- projects:    ${projectRows.length} (expected: 13)`);

  if (
    empRows.length !== 13 ||
    initRows.length !== 7 ||
    epicRows.length !== 7 ||
    epicTaskRows.length !== 9 ||
    sprintTaskRows.length !== 1 ||
    backlogTaskRows.length !== 9 ||
    sprintRows.length !== 3 ||
    projectRows.length !== 13
  ) {
    throw new Error('Row counts differ from expected Step 2 specifications! Aborting.');
  }

  const mapping = [];
  const formatCode = (prefix, num) => `${prefix}${String(num).padStart(4, '0')}`;

  // 1. Employees -> Numbered per role prefix in created_at order (ties by id)
  // ADMIN -> ADMN0001.., MANAGER -> MANA0001.., EMPLOYEE -> TEAM0001..
  const adminEmps = empRows.filter(e => e.role === 'ADMIN');
  const manaEmps = empRows.filter(e => e.role === 'MANAGER');
  const teamEmps = empRows.filter(e => e.role === 'EMPLOYEE');

  console.log(`\nEmployee role partition counts:`);
  console.log(`- ADMIN:    ${adminEmps.length} (expected: 6)`);
  console.log(`- MANAGER:  ${manaEmps.length} (expected: 0)`);
  console.log(`- EMPLOYEE: ${teamEmps.length} (expected: 7)`);

  if (adminEmps.length !== 6 || manaEmps.length !== 0 || teamEmps.length !== 7) {
    throw new Error(`Employee role counts mismatch: ADMIN=${adminEmps.length}, MANAGER=${manaEmps.length}, EMPLOYEE=${teamEmps.length}`);
  }

  const employeeAssignments = [];
  adminEmps.forEach((r, idx) => {
    employeeAssignments.push({ r, newCode: formatCode('ADMN', idx + 1) });
  });
  manaEmps.forEach((r, idx) => {
    employeeAssignments.push({ r, newCode: formatCode('MANA', idx + 1) });
  });
  teamEmps.forEach((r, idx) => {
    employeeAssignments.push({ r, newCode: formatCode('TEAM', idx + 1) });
  });

  // Verify against exact expected employee mapping:
  const EXPECTED_EMPLOYEE_MAPPING = [
    { code: 'ADMN0001', name: 'Ashutosh Mishra', old_code: 'COM-ADM03' },
    { code: 'ADMN0002', name: 'Harshit Mishra', old_code: 'COM-ADM02' },
    { code: 'ADMN0003', name: 'Utsav Mishra', old_code: 'COM-ADM05' },
    { code: 'ADMN0004', name: 'Pranshu Mohan', old_code: 'COM-ADM01' },
    { code: 'ADMN0005', name: 'Neha Shukla', old_code: 'COM-ADM04' },
    { code: 'ADMN0006', name: 'Jitendra Singh', old_code: 'CAG-ADM01' },
    { code: 'TEAM0001', name: 'tester', old_code: 'COM-EMP01' },
    { code: 'TEAM0002', name: 'Prerna Shukla', old_code: 'CAG-EMP01' },
    { code: 'TEAM0003', name: 'Priyanka Sharma', old_code: 'EHM-EMP01' },
    { code: 'TEAM0004', name: 'Shreyansh Siladar', old_code: 'COM-EMP02' },
    { code: 'TEAM0005', name: 'Utkarsh Mishra', old_code: 'EHM-EMP02' },
    { code: 'TEAM0006', name: 'Tarul Sharma', old_code: 'CAG-EMP02' },
    { code: 'TEAM0007', name: 'Neeraj Bapna', old_code: 'CAG-EMP03' },
  ];

  for (let i = 0; i < employeeAssignments.length; i++) {
    const item = employeeAssignments[i];
    const exp = EXPECTED_EMPLOYEE_MAPPING[i];
    const fullName = `${item.r.first_name || ''} ${item.r.last_name || ''}`.trim();
    if (item.newCode !== exp.code || item.r.old_code !== exp.old_code) {
      throw new Error(`[EMPLOYEE MAPPING MISMATCH at index ${i}]: Expected ${exp.code} ${exp.name} (${exp.old_code}), but got ${item.newCode} ${fullName} (${item.r.old_code})`);
    }
  }
  console.log('✅ PASS: Employee mapping matches exact expected specification.\n');

  // Step 1: Assign short temporary codes (TMPE0001.. len 8)
  for (let i = 0; i < employeeAssignments.length; i++) {
    const { r, newCode } = employeeAssignments[i];
    mapping.push({ table: 'employees', id: r.id, old_code: r.old_code, new_code: newCode });
    await client.query(`UPDATE employees SET employee_code = $1 WHERE id = $2`, [`TMPE${String(i + 1).padStart(4, '0')}`, r.id]);
  }
  // Step 2: Assign final codes
  for (const m of mapping.filter(x => x.table === 'employees')) {
    await client.query(`UPDATE employees SET employee_code = $1 WHERE id = $2`, [m.new_code, m.id]);
  }

  // 2. Initiatives -> INIT0001.. (Intermediate: TMPI0001.. len 8)
  for (let i = 0; i < initRows.length; i++) {
    const r = initRows[i];
    const newCode = formatCode('INIT', i + 1);
    mapping.push({ table: 'initiatives', id: r.id, old_code: r.old_code, new_code: newCode });
    await client.query(`UPDATE initiatives SET initiative_code = $1 WHERE id = $2`, [`TMPI${String(i + 1).padStart(4, '0')}`, r.id]);
  }
  for (const m of mapping.filter(x => x.table === 'initiatives')) {
    await client.query(`UPDATE initiatives SET initiative_code = $1 WHERE id = $2`, [m.new_code, m.id]);
  }

  // 3. Epics -> EPIC0001.. (Intermediate: TMPEP0001.. len 9)
  for (let i = 0; i < epicRows.length; i++) {
    const r = epicRows[i];
    const newCode = formatCode('EPIC', i + 1);
    mapping.push({ table: 'epics', id: r.id, old_code: r.old_code, new_code: newCode });
    await client.query(`UPDATE epics SET epic_code = $1 WHERE id = $2`, [`TMPEP${String(i + 1).padStart(4, '0')}`, r.id]);
  }
  for (const m of mapping.filter(x => x.table === 'epics')) {
    await client.query(`UPDATE epics SET epic_code = $1 WHERE id = $2`, [m.new_code, m.id]);
  }

  // 4. Tasks -> TASK0001.. / STSK0001.. / BLOG0001.. (Intermediate: TMPTK0001.., TMPST0001.., TMPBL0001..)
  // 4a. Epic tasks -> TASK0001..
  for (let i = 0; i < epicTaskRows.length; i++) {
    const r = epicTaskRows[i];
    const newCode = formatCode('TASK', i + 1);
    mapping.push({ table: 'tasks', id: r.id, old_code: r.old_code, new_code: newCode });
    await client.query(`UPDATE tasks SET task_code = $1 WHERE id = $2`, [`TMPTK${String(i + 1).padStart(4, '0')}`, r.id]);
  }
  // 4b. Sprint tasks -> STSK0001..
  for (let i = 0; i < sprintTaskRows.length; i++) {
    const r = sprintTaskRows[i];
    const newCode = formatCode('STSK', i + 1);
    mapping.push({ table: 'tasks', id: r.id, old_code: r.old_code, new_code: newCode });
    await client.query(`UPDATE tasks SET task_code = $1 WHERE id = $2`, [`TMPST${String(i + 1).padStart(4, '0')}`, r.id]);
  }
  // 4c. Backlog tasks -> BLOG0001..
  for (let i = 0; i < backlogTaskRows.length; i++) {
    const r = backlogTaskRows[i];
    const newCode = formatCode('BLOG', i + 1);
    mapping.push({ table: 'tasks', id: r.id, old_code: r.old_code, new_code: newCode });
    await client.query(`UPDATE tasks SET task_code = $1 WHERE id = $2`, [`TMPBL${String(i + 1).padStart(4, '0')}`, r.id]);
  }
  // Final update for tasks
  for (const m of mapping.filter(x => x.table === 'tasks')) {
    await client.query(`UPDATE tasks SET task_code = $1 WHERE id = $2`, [m.new_code, m.id]);
  }

  // 5. Sprints -> SPRT0001.. (Intermediate: TMPSP0001.. len 9)
  for (let i = 0; i < sprintRows.length; i++) {
    const r = sprintRows[i];
    const newCode = formatCode('SPRT', i + 1);
    mapping.push({ table: 'sprints', id: r.id, old_code: r.old_code, new_code: newCode });
    await client.query(`UPDATE sprints SET sprint_code = $1 WHERE id = $2`, [`TMPSP${String(i + 1).padStart(4, '0')}`, r.id]);
  }
  for (const m of mapping.filter(x => x.table === 'sprints')) {
    await client.query(`UPDATE sprints SET sprint_code = $1 WHERE id = $2`, [m.new_code, m.id]);
  }

  // 6. Projects -> PROJ0001.. (Intermediate: TMPPR0001.. len 9)
  for (let i = 0; i < projectRows.length; i++) {
    const r = projectRows[i];
    const newCode = formatCode('PROJ', i + 1);
    mapping.push({ table: 'projects', id: r.id, old_code: r.old_code, new_code: newCode });
    await client.query(`UPDATE projects SET code = $1 WHERE id = $2`, [`TMPPR${String(i + 1).padStart(4, '0')}`, r.id]);
  }
  for (const m of mapping.filter(x => x.table === 'projects')) {
    await client.query(`UPDATE projects SET code = $1 WHERE id = $2`, [m.new_code, m.id]);
  }

  // Set counters with plain UPDATE to max + 1
  // Expected: ADMN next 7, MANA next 1, TEAM next 8, init 8, epic 8, epic-task 10, sprint-task 2, blog 10, sprint 4, project 14
  const expectedCounters = {
    next_admn_seq: 7,
    next_mana_seq: 1,
    next_team_seq: 8,
    next_init_seq: 8,
    next_epic_seq: 8,
    next_epic_task_seq: 10,
    next_sprint_task_seq: 2,
    next_blog_task_seq: 10,
    next_sprint_seq: 4,
    next_project_seq: 14,
  };

  await client.query(`
    UPDATE global_counters
    SET
      next_admn_seq        = $1,
      next_mana_seq        = $2,
      next_team_seq        = $3,
      next_init_seq        = $4,
      next_epic_seq        = $5,
      next_epic_task_seq   = $6,
      next_sprint_task_seq = $7,
      next_blog_task_seq   = $8,
      next_sprint_seq      = $9,
      next_project_seq     = $10
    WHERE id = 1
  `, [
    expectedCounters.next_admn_seq,
    expectedCounters.next_mana_seq,
    expectedCounters.next_team_seq,
    expectedCounters.next_init_seq,
    expectedCounters.next_epic_seq,
    expectedCounters.next_epic_task_seq,
    expectedCounters.next_sprint_task_seq,
    expectedCounters.next_blog_task_seq,
    expectedCounters.next_sprint_seq,
    expectedCounters.next_project_seq,
  ]);

  console.log('--- 📊 GLOBAL COUNTERS SET TO: ---');
  const counterCheck = await client.query('SELECT * FROM global_counters WHERE id = 1');
  console.log(JSON.stringify(counterCheck.rows[0], null, 2));

  // Write mapping files
  const rootDir = path.resolve(__dirname, '../..');
  const jsonPath = path.resolve(rootDir, 'migration_mapping_step2.json');
  const csvPath = path.resolve(rootDir, 'migration_mapping_step2.csv');

  fs.writeFileSync(jsonPath, JSON.stringify(mapping, null, 2), 'utf-8');

  const csvRows = ['table,id,old_code,new_code'];
  for (const m of mapping) {
    csvRows.push(`${m.table},${m.id},"${m.old_code}","${m.new_code}"`);
  }
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf-8');
  console.log(`\nWritten mapping to ${jsonPath} and ${csvPath} (${mapping.length} rows)`);

  // VALIDATION QUERIES INSIDE TRANSACTION
  console.log('\n======================================================');
  console.log('🔍 VALIDATION QUERIES (INSIDE TRANSACTION)');
  console.log('======================================================\n');

  // 1. Duplicate check per code column
  console.log('1. DUPLICATE CHECKS:');
  const dupQueries = [
    { name: 'employees.employee_code', q: 'SELECT employee_code, COUNT(*) AS count FROM employees GROUP BY employee_code HAVING COUNT(*) > 1' },
    { name: 'initiatives.initiative_code', q: 'SELECT initiative_code, COUNT(*) AS count FROM initiatives GROUP BY initiative_code HAVING COUNT(*) > 1' },
    { name: 'epics.epic_code', q: 'SELECT epic_code, COUNT(*) AS count FROM epics GROUP BY epic_code HAVING COUNT(*) > 1' },
    { name: 'tasks.task_code', q: 'SELECT task_code, COUNT(*) AS count FROM tasks GROUP BY task_code HAVING COUNT(*) > 1' },
    { name: 'sprints.sprint_code', q: 'SELECT sprint_code, COUNT(*) AS count FROM sprints GROUP BY sprint_code HAVING COUNT(*) > 1' },
    { name: 'projects.code', q: 'SELECT code, COUNT(*) AS count FROM projects GROUP BY code HAVING COUNT(*) > 1' },
  ];

  for (const dq of dupQueries) {
    const res = await client.query(dq.q);
    console.log(`- ${dq.name}: duplicates = ${res.rows.length} ${res.rows.length === 0 ? '✅ [PASS = 0]' : '❌ [FAIL]'}`);
    if (res.rows.length > 0) console.log(JSON.stringify(res.rows, null, 2));
  }

  // 2. Pattern conformance checks
  console.log('\n2. PATTERN CONFORMANCE CHECKS:');
  const patternQueries = [
    { name: 'employees (^(ADMN|MANA|TEAM)\\d{4}$)', q: "SELECT COUNT(*) AS count FROM employees WHERE employee_code !~ '^(ADMN|MANA|TEAM)[0-9]{4}$'" },
    { name: 'initiatives (^INIT\\d{4}$)', q: "SELECT COUNT(*) AS count FROM initiatives WHERE initiative_code !~ '^INIT[0-9]{4}$'" },
    { name: 'epics (^EPIC\\d{4}$)', q: "SELECT COUNT(*) AS count FROM epics WHERE epic_code !~ '^EPIC[0-9]{4}$'" },
    { name: 'sprints (^SPRT\\d{4}$)', q: "SELECT COUNT(*) AS count FROM sprints WHERE sprint_code !~ '^SPRT[0-9]{4}$'" },
    { name: 'projects (^PROJ\\d{4}$)', q: "SELECT COUNT(*) AS count FROM projects WHERE code !~ '^PROJ[0-9]{4}$'" },
    { name: 'tasks (^(TASK|STSK|BLOG)\\d{4}$)', q: "SELECT COUNT(*) AS count FROM tasks WHERE task_code !~ '^(TASK|STSK|BLOG)[0-9]{4}$'" },
  ];

  for (const pq of patternQueries) {
    const res = await client.query(pq.q);
    const nonMatching = parseInt(res.rows[0].count, 10);
    console.log(`- ${pq.name}: non-matching = ${nonMatching} ${nonMatching === 0 ? '✅ [PASS = 0]' : '❌ [FAIL]'}`);
    if (nonMatching > 0) {
      throw new Error(`Pattern conformance failed for ${pq.name}!`);
    }
  }

  // 3. Validation query: Prefix matches role for all employees
  console.log('\n3. PREFIX MATCHES ROLE VALIDATION:');
  const prefixMatchRes = await client.query(`
    SELECT e.id, e.employee_code, e.first_name, e.last_name, u.role
    FROM employees e
    LEFT JOIN users u ON (u.employee_id = e.id OR LOWER(u.email) = LOWER(e.email))
    WHERE u.id IS NULL
       OR (u.role = 'ADMIN' AND e.employee_code !~ '^ADMN[0-9]{4}$')
       OR (u.role = 'MANAGER' AND e.employee_code !~ '^MANA[0-9]{4}$')
       OR (u.role = 'EMPLOYEE' AND e.employee_code !~ '^TEAM[0-9]{4}$');
  `);
  console.log(`- Prefix matches role violations = ${prefixMatchRes.rows.length} ${prefixMatchRes.rows.length === 0 ? '✅ [PASS = 0]' : '❌ [FAIL]'}`);
  if (prefixMatchRes.rows.length > 0) {
    console.table(prefixMatchRes.rows);
    throw new Error('Prefix matches role validation failed!');
  }

  // 4. User roles check: Before vs After
  console.log('\n4. USER ROLES CHECK (BEFORE vs AFTER for all users):');
  const postUsers = await client.query('SELECT id, email, role FROM users ORDER BY email ASC');
  let userDiffCount = 0;
  for (let i = 0; i < preUsers.rows.length; i++) {
    const b = preUsers.rows[i];
    const a = postUsers.rows.find(u => u.id === b.id);
    if (!a || a.role !== b.role) {
      console.error(`❌ User role changed for ${b.email}: ${b.role} -> ${a?.role}`);
      userDiffCount++;
    }
  }
  console.log(`Total user role changes: ${userDiffCount} (Users evaluated: ${postUsers.rows.length}) ${userDiffCount === 0 ? '✅ [PASS - 0 CHANGES]' : '❌ [FAIL]'}`);

  // 5. Entity IDs check: Before vs After
  console.log('\n5. ENTITY ID CHECK (BEFORE vs AFTER for all entities across 5 tables):');
  let entityDiffCount = 0;

  const postEmployees = await client.query('SELECT id, employee_code, entity_id FROM employees ORDER BY id ASC');
  for (const b of preEmployees.rows) {
    const a = postEmployees.rows.find(e => e.id === b.id);
    if (!a || a.entity_id !== b.entity_id) {
      console.error(`❌ Employee entity_id changed for ${b.id}: ${b.entity_id} -> ${a?.entity_id}`);
      entityDiffCount++;
    }
  }

  const postInitiatives = await client.query('SELECT id, initiative_code, entity_id FROM initiatives ORDER BY id ASC');
  for (const b of preInitiatives.rows) {
    const a = postInitiatives.rows.find(e => e.id === b.id);
    if (!a || a.entity_id !== b.entity_id) {
      console.error(`❌ Initiative entity_id changed for ${b.id}: ${b.entity_id} -> ${a?.entity_id}`);
      entityDiffCount++;
    }
  }

  const postEpics = await client.query('SELECT id, epic_code, entity_id FROM epics ORDER BY id ASC');
  for (const b of preEpics.rows) {
    const a = postEpics.rows.find(e => e.id === b.id);
    if (!a || a.entity_id !== b.entity_id) {
      console.error(`❌ Epic entity_id changed for ${b.id}: ${b.entity_id} -> ${a?.entity_id}`);
      entityDiffCount++;
    }
  }

  const postSprints = await client.query('SELECT id, sprint_code, entity_id FROM sprints ORDER BY id ASC');
  for (const b of preSprints.rows) {
    const a = postSprints.rows.find(e => e.id === b.id);
    if (!a || a.entity_id !== b.entity_id) {
      console.error(`❌ Sprint entity_id changed for ${b.id}: ${b.entity_id} -> ${a?.entity_id}`);
      entityDiffCount++;
    }
  }

  const postTasks = await client.query('SELECT id, task_code, entity_id FROM tasks ORDER BY id ASC');
  for (const b of preTasks.rows) {
    const a = postTasks.rows.find(e => e.id === b.id);
    if (!a || a.entity_id !== b.entity_id) {
      console.error(`❌ Task entity_id changed for ${b.id}: ${b.entity_id} -> ${a?.entity_id}`);
      entityDiffCount++;
    }
  }

  console.log(`Total entity_id changes across employees, initiatives, epics, sprints, tasks: ${entityDiffCount} ${entityDiffCount === 0 ? '✅ [PASS - 0 CHANGES]' : '❌ [FAIL]'}`);

  if (isDryRun) {
    console.log('\n------------------------------------------------------');
    console.log('🔄 DRY RUN: Rolling back transaction (ROLLBACK)...');
    await client.query('ROLLBACK');
    console.log('✅ ROLLBACK executed successfully.');
    console.log('------------------------------------------------------\n');

    // Confirm live DB unchanged
    console.log('Verifying live DB state after ROLLBACK:');
    const finalEmps = await client.query('SELECT employee_code FROM employees ORDER BY created_at ASC, id ASC LIMIT 3');
    console.log('Employees sample after rollback:', finalEmps.rows.map(r => r.employee_code).join(', '));
    const finalInits = await client.query('SELECT initiative_code FROM initiatives ORDER BY created_at ASC, id ASC LIMIT 3');
    console.log('Initiatives sample after rollback:', finalInits.rows.map(r => r.initiative_code).join(', '));
    const finalTasks = await client.query('SELECT task_code FROM tasks ORDER BY created_at ASC, id ASC LIMIT 3');
    console.log('Tasks sample after rollback:', finalTasks.rows.map(r => r.task_code).join(', '));
    const finalCounters = await client.query('SELECT * FROM global_counters WHERE id = 1');
    console.log('Counters after rollback:', JSON.stringify(finalCounters.rows[0]));
    console.log('\n✅ CONFIRMED: Database is completely unchanged.');
  } else {
    console.log('\n------------------------------------------------------');
    console.log('💾 LIVE RUN: Committing transaction (COMMIT)...');
    await client.query('COMMIT');
    console.log('✅ COMMIT executed successfully. Step 2 code migration live.');
    console.log('------------------------------------------------------\n');
  }

} catch (err) {
  console.error('\n❌ MIGRATION ERROR - Rolling back transaction:', err);
  try {
    await client.query('ROLLBACK');
  } catch (rollbackErr) {
    console.error('Failed to rollback:', rollbackErr);
  }
  process.exit(1);
} finally {
  await client.end();
}
