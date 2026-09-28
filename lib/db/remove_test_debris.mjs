import { db, sql } from './dist/index.js';

async function runCleanup() {
  console.log('========================================================================');
  console.log('🧹 PART 1: REMOVING TEST DEBRIS FROM LIVE DATABASE');
  console.log('========================================================================\n');

  // --- Step 1: Before row counts ---
  const tablesRes = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND NOT table_name LIKE '__drizzle%'
    ORDER BY table_name;
  `);
  const beforeCounts = {};
  for (const row of tablesRes.rows) {
    const cnt = await db.execute(sql.raw(`SELECT COUNT(*) AS count FROM "${row.table_name}"`));
    beforeCounts[row.table_name] = parseInt(cnt.rows[0].count, 10);
  }

  // --- Step 2: Query and display every target row before deletion ---
  console.log('--- 1. SELECT Target Rows for Deletion ---');

  const taskCommentsRes = await db.execute(sql`
    SELECT id, task_id, content AS title, created_at 
    FROM task_comments 
    WHERE id = '88ee803c-c153-495e-827b-4a9f7fb2f444'
  `);
  console.log('\n[TARGET task_comments]');
  console.table(taskCommentsRes.rows);

  const notificationsRes = await db.execute(sql`
    SELECT id, payload->>'taskCode' AS code, payload->>'title' AS title, created_at 
    FROM notifications 
    WHERE id IN (
      '6ed4b385-88c7-477a-9e4b-200b910653a6',
      'ef77638d-6b2c-454d-a707-b4486dd769b9',
      '2c3e5ad9-173c-4ce2-9d0e-673c3319c359',
      '470fa050-577e-4fd9-823f-d3aeb647104d'
    )
    ORDER BY created_at ASC
  `);
  console.log('\n[TARGET notifications (4 exact IDs)]');
  console.table(notificationsRes.rows);

  const tasksRes = await db.execute(sql`
    SELECT id, task_code AS code, title, created_at 
    FROM tasks 
    WHERE task_code IN ('TASK0010', 'TASK0011', 'STSK0002', 'BLOG0010')
    ORDER BY created_at ASC
  `);
  console.log('\n[TARGET tasks (4 tasks)]');
  console.table(tasksRes.rows);

  const sprintsRes = await db.execute(sql`
    SELECT id, sprint_code AS code, name AS title, created_at 
    FROM sprints 
    WHERE sprint_code = 'SPRT0004'
  `);
  console.log('\n[TARGET sprints]');
  console.table(sprintsRes.rows);

  const epicsRes = await db.execute(sql`
    SELECT id, epic_code AS code, title, created_at 
    FROM epics 
    WHERE epic_code IN ('EPIC0008', 'EPIC0009')
    ORDER BY created_at ASC
  `);
  console.log('\n[TARGET epics (2 epics)]');
  console.table(epicsRes.rows);

  const initsRes = await db.execute(sql`
    SELECT id, initiative_code AS code, title, created_at 
    FROM initiatives 
    WHERE initiative_code = 'INIT0008'
  `);
  console.log('\n[TARGET initiatives]');
  console.table(initsRes.rows);

  const invitesRes = await db.execute(sql`
    SELECT id, role AS code, email AS title, created_at 
    FROM invites 
    WHERE email IN ('step2.test.1790588338546@example.com', 'step2.test.1790588381871@example.com')
    ORDER BY created_at ASC
  `);
  console.log('\n[TARGET invites]');
  console.table(invitesRes.rows);

  const usersRes = await db.execute(sql`
    SELECT id, role AS code, email AS title, created_at 
    FROM users 
    WHERE email IN ('step2.test.1790588338546@example.com', 'step2.test.1790588381871@example.com')
    ORDER BY created_at ASC
  `);
  console.log('\n[TARGET users (one EMPLOYEE, one MANAGER)]');
  console.table(usersRes.rows);

  const empsRes = await db.execute(sql`
    SELECT id, employee_code AS code, first_name || ' ' || last_name AS title, email, created_at 
    FROM employees 
    WHERE employee_code IN ('TEAM0014', 'TEAM0015')
    ORDER BY created_at ASC
  `);
  console.log('\n[TARGET employees (TEAM0014, TEAM0015)]');
  console.table(empsRes.rows);

  // --- Step 3: Delete ONLY these rows in one transaction (children first) ---
  console.log('\n--- 2. Executing Deletion in a Single Atomic Transaction ---');

  await db.transaction(async (tx) => {
    // 1. Delete task_comments
    const delComments = await tx.execute(sql`
      DELETE FROM task_comments 
      WHERE id = '88ee803c-c153-495e-827b-4a9f7fb2f444'
    `);
    console.log(`Deleted ${delComments.rowCount} task_comments row.`);

    // 2. Delete notifications
    const delNotifs = await tx.execute(sql`
      DELETE FROM notifications 
      WHERE id IN (
        '6ed4b385-88c7-477a-9e4b-200b910653a6',
        'ef77638d-6b2c-454d-a707-b4486dd769b9',
        '2c3e5ad9-173c-4ce2-9d0e-673c3319c359',
        '470fa050-577e-4fd9-823f-d3aeb647104d'
      )
    `);
    console.log(`Deleted ${delNotifs.rowCount} notifications rows.`);

    // 3. Delete tasks
    const delTasks = await tx.execute(sql`
      DELETE FROM tasks 
      WHERE task_code IN ('TASK0010', 'TASK0011', 'STSK0002', 'BLOG0010')
    `);
    console.log(`Deleted ${delTasks.rowCount} tasks rows.`);

    // 4. Delete sprints
    const delSprints = await tx.execute(sql`
      DELETE FROM sprints 
      WHERE sprint_code = 'SPRT0004'
    `);
    console.log(`Deleted ${delSprints.rowCount} sprints row.`);

    // 5. Delete epics
    const delEpics = await tx.execute(sql`
      DELETE FROM epics 
      WHERE epic_code IN ('EPIC0008', 'EPIC0009')
    `);
    console.log(`Deleted ${delEpics.rowCount} epics rows.`);

    // 6. Delete initiatives
    const delInits = await tx.execute(sql`
      DELETE FROM initiatives 
      WHERE initiative_code = 'INIT0008'
    `);
    console.log(`Deleted ${delInits.rowCount} initiatives row.`);

    // 7. Delete invites
    const delInvites = await tx.execute(sql`
      DELETE FROM invites 
      WHERE email IN ('step2.test.1790588338546@example.com', 'step2.test.1790588381871@example.com')
    `);
    console.log(`Deleted ${delInvites.rowCount} invites rows.`);

    // 8. Delete users
    const delUsers = await tx.execute(sql`
      DELETE FROM users 
      WHERE email IN ('step2.test.1790588338546@example.com', 'step2.test.1790588381871@example.com')
    `);
    console.log(`Deleted ${delUsers.rowCount} users rows.`);

    // 9. Delete employees
    const delEmps = await tx.execute(sql`
      DELETE FROM employees 
      WHERE employee_code IN ('TEAM0014', 'TEAM0015')
    `);
    console.log(`Deleted ${delEmps.rowCount} employees rows.`);
  });

  console.log('\n✅ Transaction committed successfully!');

  // --- Step 4: After row counts ---
  const afterCounts = {};
  for (const row of tablesRes.rows) {
    const cnt = await db.execute(sql.raw(`SELECT COUNT(*) AS count FROM "${row.table_name}"`));
    afterCounts[row.table_name] = parseInt(cnt.rows[0].count, 10);
  }

  console.log('\n--- 3. Before/After Row Count for All 25 Tables ---');
  const comparison = [];
  const expectedCounts = {
    employees: 13,
    users: 14,
    invites: 11,
    initiatives: 7,
    epics: 7,
    sprints: 3,
    tasks: 19,
    notifications: 172,
    task_comments: 2,
    announcements: 1,
    applications: 0,
    attendance: 7,
    audit_logs: 125,
    departments: 16,
    entities: 3,
    entity_counters: 3,
    global_counters: 1,
    google_tokens: 5,
    meeting_attendees: 0,
    password_reset_otps: 0,
    projects: 13,
    task_checklists: 4,
    task_notes: 0,
    task_templates: 0,
  };

  let diffMismatch = false;
  for (const tableName of Object.keys(beforeCounts)) {
    const before = beforeCounts[tableName];
    const after = afterCounts[tableName];
    const diff = after - before;
    const expected = expectedCounts[tableName];
    let match = true;
    if (expected !== undefined && after !== expected) {
      match = false;
      diffMismatch = true;
    }
    comparison.push({
      table: tableName,
      before,
      after,
      diff: diff === 0 ? '0' : String(diff),
      expected: expected !== undefined ? expected : '(varies)',
      status: match ? '✅ OK' : '❌ MISMATCH',
    });
  }

  console.table(comparison);

  if (diffMismatch) {
    console.error('\n❌ STOP: Table row counts differ from expected counts!');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 25 TABLE COUNTS MATCH EXPECTED COUNTS EXACTLY!');
    process.exit(0);
  }
}

runCleanup().catch(err => {
  console.error('\n❌ Fatal error during Part 1 cleanup:', err);
  process.exit(1);
});
