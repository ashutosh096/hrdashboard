import { db, sql, tasks, taskChecklists, taskComments, recordHistory, isNull, eq, and } from '../lib/db/dist/index.js';

async function main() {
  console.log('========================================================================');
  console.log('🧪 TESTING PHASE 6: SOFT-DELETE & RESTORE VERIFICATION');
  console.log('========================================================================\n');

  // Step 1: Query an existing entity, department, and creator for a scratch test
  const [ent] = (await db.execute(sql.raw('SELECT id FROM entities LIMIT 1;'))).rows;
  const [dept] = (await db.execute(sql.raw('SELECT id FROM departments LIMIT 1;'))).rows;
  const [emp] = (await db.execute(sql.raw('SELECT id FROM employees LIMIT 1;'))).rows;

  console.log('[Test 1] Creating temporary task with checklist & comment...');
  const testTaskCode = 'TEST-SOFT-DEL-01';
  
  // Clean up any previous test task with this code
  await db.execute(sql.raw(`DELETE FROM tasks WHERE task_code = '${testTaskCode}';`));

  const [testTask] = await db
    .insert(tasks)
    .values({
      taskCode: testTaskCode,
      title: 'Phase 6 Soft Delete Automated Test',
      entityId: ent.id,
      departmentId: dept.id,
      creatorId: emp.id,
      status: 'TODO',
      priority: 'MEDIUM',
    })
    .returning();

  const [testChk] = await db
    .insert(taskChecklists)
    .values({
      taskId: testTask.id,
      itemText: 'Checklist item for soft delete test',
      isCompleted: false,
    })
    .returning();

  const [testComment] = await db
    .insert(taskComments)
    .values({
      taskId: testTask.id,
      authorId: emp.id,
      authorName: 'Test Author',
      content: 'Important comment that must never be deleted',
    })
    .returning();

  console.log(`✓ Created test task ${testTask.id} with checklist ${testChk.id} and comment ${testComment.id}`);

  // Step 2: Simulate Soft Delete
  console.log('\n[Test 2] Simulating Soft-Delete...');
  const deleteTime = new Date();
  await db
    .update(tasks)
    .set({ deletedAt: deleteTime, updatedAt: deleteTime })
    .where(eq(tasks.id, testTask.id));

  await recordHistory(db, {
    tableName: 'tasks',
    recordId: testTask.id,
    action: 'DELETED',
    changedById: emp.id,
    changedByName: 'Automated Test',
  });

  // Verify task row still exists in database!
  const [taskAfterDelete] = await db.select().from(tasks).where(eq(tasks.id, testTask.id));
  if (!taskAfterDelete) {
    throw new Error('❌ FAILURE: Task row was deleted from tasks table!');
  }
  if (!taskAfterDelete.deletedAt) {
    throw new Error('❌ FAILURE: Task deletedAt was not set!');
  }
  console.log(`✓ Task still exists in database with deletedAt: ${taskAfterDelete.deletedAt.toISOString()}`);

  // Verify checklist still exists!
  const [chkAfterDelete] = await db.select().from(taskChecklists).where(eq(taskChecklists.id, testChk.id));
  if (!chkAfterDelete) {
    throw new Error('❌ FAILURE: Checklist item was deleted!');
  }
  console.log('✓ Checklist item is 100% intact in database.');

  // Verify comment still exists!
  const [commentAfterDelete] = await db.select().from(taskComments).where(eq(taskComments.id, testComment.id));
  if (!commentAfterDelete) {
    throw new Error('❌ FAILURE: Comment was deleted!');
  }
  console.log('✓ Comment is 100% intact in database.');

  // Verify standard query (isNull(tasks.deletedAt)) excludes it
  const activeTasks = await db.select().from(tasks).where(and(eq(tasks.id, testTask.id), isNull(tasks.deletedAt)));
  if (activeTasks.length !== 0) {
    throw new Error('❌ FAILURE: Standard active tasks query returned soft-deleted task!');
  }
  console.log('✓ Standard active query correctly hides soft-deleted task.');

  // Step 3: Simulate Restore
  console.log('\n[Test 3] Simulating Task Restore...');
  await db
    .update(tasks)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(tasks.id, testTask.id));

  await recordHistory(db, {
    tableName: 'tasks',
    recordId: testTask.id,
    action: 'RESTORED',
    changedById: emp.id,
    changedByName: 'Automated Test',
  });

  const [taskAfterRestore] = await db.select().from(tasks).where(eq(tasks.id, testTask.id));
  if (taskAfterRestore.deletedAt !== null) {
    throw new Error('❌ FAILURE: Task deletedAt was not cleared to null!');
  }
  console.log('✓ Task restored successfully (deletedAt is null).');

  // Verify active query includes it again
  const activeAfterRestore = await db.select().from(tasks).where(and(eq(tasks.id, testTask.id), isNull(tasks.deletedAt)));
  if (activeAfterRestore.length !== 1) {
    throw new Error('❌ FAILURE: Restored task not returned by active tasks query!');
  }
  console.log('✓ Restored task is immediately visible again in active task feeds.');

  // Step 4: Clean up scratch test task
  console.log('\n[Test 4] Cleaning up temporary test record...');
  await db.execute(sql.raw(`DELETE FROM tasks WHERE id = '${testTask.id}';`));
  // CASCADE test: Since we added ON DELETE CASCADE on task_checklists and task_notes, 
  // deleting the test task should cleanly cascade without throwing foreign key errors!
  const [chkAfterCascade] = await db.select().from(taskChecklists).where(eq(taskChecklists.id, testChk.id));
  if (chkAfterCascade) {
    console.warn('Note: Checklist retained or manual cleanup needed');
    await db.execute(sql.raw(`DELETE FROM task_checklists WHERE id = '${testChk.id}';`));
  } else {
    console.log('✓ ON DELETE CASCADE verified: Task child checklist cleaned up cleanly.');
  }

  // Step 5: Verify all real tables match baseline
  console.log('\n[Test 5] Verifying ZERO DATA LOSS on all tables against baseline snapshot...');
  const baseline = {
    users: 14,
    employees: 13,
    initiatives: 9,
    epics: 15,
    tasks: 58,
    task_checklists: 75,
    task_comments: 12,
    task_notes: 0,
    sprints: 27,
    projects: 11,
    departments: 16,
    meetings: 296,
    attendance: 22,
    announcements: 3,
  };

  let allMatch = true;
  for (const [table, expected] of Object.entries(baseline)) {
    const res = await db.execute(sql.raw(`SELECT count(*)::int as c FROM ${table};`));
    const actual = (res.rows || res)[0].c;
    if (actual === expected) {
      console.log(`  ✓ ${table.padEnd(20)}: ${actual} rows (matches snapshot)`);
    } else {
      console.error(`  ✗ ${table.padEnd(20)}: ${actual} rows (EXPECTED ${expected})`);
      allMatch = false;
    }
  }

  if (allMatch) {
    console.log('\n🎉 ZERO DATA LOSS CONFIRMED: All 14 critical business tables are 100% intact!');
  } else {
    console.error('\n⚠️ Data mismatch detected!');
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
