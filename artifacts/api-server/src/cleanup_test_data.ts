import { db } from '../../../lib/db/src/index';
import { sql } from 'drizzle-orm';

// Helper: build a safe IN list for UUIDs or strings
function inList(arr: string[]) {
  if (arr.length === 0) return sql`false`;
  const joined = arr.map(v => `'${v}'`).join(',');
  return sql.raw(`TRUE AND id IN (${joined})`);
}
function inListByCol(col: string, arr: string[]) {
  if (arr.length === 0) return `1=0`;
  return `${col} IN (${arr.map(v=>`'${v}'`).join(',')})`;
}

async function main() {
  console.log('🧹 Starting cleanup of all regression/test data...\n');

  await db.transaction(async (tx) => {

    // ═══════════════════════════════════════════════════════
    // STEP 1: Get IDs of all regression initiatives to delete
    // ═══════════════════════════════════════════════════════
    const badInitCodes = [
      'CAG-I13','CAG-I14','CAG-I15','CAG-I16','CAG-I17',
      'CAG-I18','CAG-I19','CAG-I20','CAG-I21','CAG-I22',
      'EHM-I16','EHM-I17','EHM-I18','EHM-I19','EHM-I20','EHM-I21'
    ];
    const initRows = await tx.execute(sql.raw(`
      SELECT id, initiative_code FROM initiatives
      WHERE initiative_code IN (${badInitCodes.map(c=>"'"+c+"'").join(',')})
    `));
    const initIds = initRows.rows.map((r: any) => r.id);
    console.log(`Found ${initIds.length} regression initiatives to delete:`, initRows.rows.map((r:any)=>r.initiative_code).join(', '));

    // ═══════════════════════════════════════════════════════
    // STEP 2: Get all epics linked to those initiatives
    // ═══════════════════════════════════════════════════════
    let epicIds: string[] = [];
    if (initIds.length > 0) {
      const epicRows = await tx.execute(sql.raw(`
        SELECT id, epic_code FROM epics
        WHERE initiative_id IN (${initIds.map(v=>"'"+v+"'").join(',')})
      `));
      epicIds = epicRows.rows.map((r: any) => r.id);
      console.log(`Found ${epicIds.length} regression epics:`, epicRows.rows.map((r:any)=>r.epic_code).join(', '));
    }

    // ═══════════════════════════════════════════════════════
    // STEP 3: Get all tasks linked to those epics
    // ═══════════════════════════════════════════════════════
    let epicTaskIds: string[] = [];
    if (epicIds.length > 0) {
      const taskRows = await tx.execute(sql.raw(`
        SELECT id, task_code FROM tasks WHERE epic_id IN (${epicIds.map(v=>"'"+v+"'").join(',')})
      `));
      epicTaskIds = taskRows.rows.map((r: any) => r.id);
      console.log(`Found ${epicTaskIds.length} epic tasks to delete:`, taskRows.rows.map((r:any)=>r.task_code).join(', '));
    }

    // ═══════════════════════════════════════════════════════
    // STEP 4: Get regression sprint IDs + their tasks
    // ═══════════════════════════════════════════════════════
    const badSprintCodes = [
      'COM-ADM02-W1','COM-ADM02-W1-8','COM-ADM02-W1-9',
      'COM-ADM02-W1-10','COM-ADM02-W1-11',
      'COM-E01-W1','COM-E01-W2026','COM-E01-W4'
    ];
    const sprintRows = await tx.execute(sql.raw(`
      SELECT id, sprint_code FROM sprints
      WHERE sprint_code IN (${badSprintCodes.map(c=>"'"+c+"'").join(',')})
    `));
    const sprintIds = sprintRows.rows.map((r: any) => r.id);
    console.log(`\nFound ${sprintIds.length} regression sprints:`, sprintRows.rows.map((r:any)=>r.sprint_code).join(', '));

    let sprintTaskIds: string[] = [];
    if (sprintIds.length > 0) {
      const sprintTaskRows = await tx.execute(sql.raw(`
        SELECT id, task_code FROM tasks WHERE sprint_id IN (${sprintIds.map(v=>"'"+v+"'").join(',')})
      `));
      sprintTaskIds = sprintTaskRows.rows.map((r: any) => r.id);
      console.log(`Found ${sprintTaskIds.length} sprint tasks to delete:`, sprintTaskRows.rows.map((r:any)=>r.task_code).join(', '));
    }

    // ═══════════════════════════════════════════════════════
    // STEP 5: Clone tasks to delete
    // ═══════════════════════════════════════════════════════
    const cloneTaskCodes = ['CAG-I10-EP05-T003','CAG-I10-EP05-T004','CAG-I10-EP05-T005','CAG-I10-EP05-T006'];
    const cloneTaskRows = await tx.execute(sql.raw(`
      SELECT id, task_code FROM tasks WHERE task_code IN (${cloneTaskCodes.map(c=>"'"+c+"'").join(',')})
    `));
    const cloneTaskIds = cloneTaskRows.rows.map((r: any) => r.id);
    console.log(`\nFound ${cloneTaskIds.length} clone tasks to delete:`, cloneTaskRows.rows.map((r:any)=>r.task_code).join(', '));

    // COM-E01-W1-T001 "test hiii"
    const testTaskRows = await tx.execute(sql.raw(`SELECT id, task_code FROM tasks WHERE task_code = 'COM-E01-W1-T001'`));
    const testTaskIds = testTaskRows.rows.map((r:any)=>r.id);

    // All task IDs to delete
    const allTaskIds = [...epicTaskIds, ...sprintTaskIds, ...cloneTaskIds, ...testTaskIds];
    console.log(`\nTotal tasks to delete: ${allTaskIds.length}`);

    // ═══════════════════════════════════════════════════════
    // STEP 6: Delete task children (checklists, comments, notes)
    // ═══════════════════════════════════════════════════════
    if (allTaskIds.length > 0) {
      const idListTasks = allTaskIds.map(v=>"'"+v+"'").join(',');
      const delChk = await tx.execute(sql.raw(`DELETE FROM task_checklists WHERE task_id IN (${idListTasks})`));
      const delCmt = await tx.execute(sql.raw(`DELETE FROM task_comments WHERE task_id IN (${idListTasks})`));
      const delNotes = await tx.execute(sql.raw(`DELETE FROM task_notes WHERE task_id IN (${idListTasks})`));
      console.log(`\nDeleted: ${delChk.rowCount} checklists, ${delCmt.rowCount} comments, ${delNotes.rowCount} notes`);

      // Delete tasks themselves
      const delTasks = await tx.execute(sql.raw(`DELETE FROM tasks WHERE id IN (${idListTasks})`));
      console.log(`Deleted: ${delTasks.rowCount} tasks ✅`);
    }

    // ═══════════════════════════════════════════════════════
    // STEP 7: Delete sprints
    // ═══════════════════════════════════════════════════════
    if (sprintIds.length > 0) {
      const delSprints = await tx.execute(sql.raw(`DELETE FROM sprints WHERE id IN (${sprintIds.map(v=>"'"+v+"'").join(',')})`));
      console.log(`Deleted: ${delSprints.rowCount} sprints ✅`);
    }

    // ═══════════════════════════════════════════════════════
    // STEP 8: Delete epics
    // ═══════════════════════════════════════════════════════
    if (epicIds.length > 0) {
      const delEpics = await tx.execute(sql.raw(`DELETE FROM epics WHERE id IN (${epicIds.map(v=>"'"+v+"'").join(',')})`));
      console.log(`Deleted: ${delEpics.rowCount} epics ✅`);
    }

    // ═══════════════════════════════════════════════════════
    // STEP 9: Delete regression initiatives
    // ═══════════════════════════════════════════════════════
    if (initIds.length > 0) {
      const delInits = await tx.execute(sql.raw(`DELETE FROM initiatives WHERE id IN (${initIds.map(v=>"'"+v+"'").join(',')})`));
      console.log(`Deleted: ${delInits.rowCount} initiatives ✅`);
    }

    // ═══════════════════════════════════════════════════════
    // STEP 10: Delete regression employees (Reggie Tester x4)
    // ═══════════════════════════════════════════════════════
    const reggieRows = await tx.execute(sql.raw(`
      SELECT id, employee_code FROM employees
      WHERE employee_code IN ('EHM-EMP03','EHM-EMP04','EHM-EMP05','EHM-EMP06')
    `));
    const reggieIds = reggieRows.rows.map((r:any)=>r.id);
    console.log(`\nFound ${reggieIds.length} Reggie Tester accounts:`, reggieRows.rows.map((r:any)=>r.employee_code).join(', '));

    if (reggieIds.length > 0) {
      const reggieIdList = reggieIds.map(v=>"'"+v+"'").join(',');
      // Delete notifications for their users first
      const delNotifs = await tx.execute(sql.raw(`
        DELETE FROM notifications WHERE user_id IN (
          SELECT id FROM users WHERE employee_id IN (${reggieIdList})
        )
      `));
      console.log(`Deleted: ${delNotifs.rowCount} notifications for Reggie accounts ✅`);
      // Delete their invites
      const delInvites = await tx.execute(sql.raw(`DELETE FROM invites WHERE employee_id IN (${reggieIdList})`));
      console.log(`Deleted: ${delInvites.rowCount} invites (Reggie) ✅`);
      // Delete their user accounts
      const delUsers = await tx.execute(sql.raw(`DELETE FROM users WHERE employee_id IN (${reggieIdList})`));
      console.log(`Deleted: ${delUsers.rowCount} user accounts ✅`);
      // Delete employees
      const delEmps = await tx.execute(sql.raw(`DELETE FROM employees WHERE id IN (${reggieIdList})`));
      console.log(`Deleted: ${delEmps.rowCount} employees ✅`);
    }

    // Also delete any remaining regression.qa.* invites
    const delRegInvites = await tx.execute(sql.raw(`
      DELETE FROM invites WHERE email LIKE 'regression.qa.%'
    `));
    console.log(`Deleted: ${delRegInvites.rowCount} remaining regression invites ✅`);

    // ═══════════════════════════════════════════════════════
    // STEP 11: Delete regression/test announcements
    // ═══════════════════════════════════════════════════════
    const delAnn1 = await tx.execute(sql.raw(`DELETE FROM announcements WHERE title = 'Company-Wide System Upgrade Notice'`));
    const delAnn2 = await tx.execute(sql.raw(`DELETE FROM announcements WHERE title ILIKE '%Urgent Security Advisory%'`));
    const delAnn3 = await tx.execute(sql.raw(`DELETE FROM announcements WHERE title ILIKE '%Coffee Machine Restocked%'`));
    const delAnn4 = await tx.execute(sql.raw(`DELETE FROM announcements WHERE title = 'Audit Test Announcement'`));
    const delAnn5 = await tx.execute(sql.raw(`DELETE FROM announcements WHERE title = 'testing'`));
    console.log(`\nDeleted announcements: ${Number(delAnn1.rowCount)+Number(delAnn2.rowCount)+Number(delAnn3.rowCount)+Number(delAnn4.rowCount)+Number(delAnn5.rowCount)} total ✅`);

    // ═══════════════════════════════════════════════════════
    // STEP 12: Final row counts
    // ═══════════════════════════════════════════════════════
    console.log('\n=== FINAL ROW COUNTS AFTER CLEANUP ===');
    const tables = ['initiatives','epics','tasks','task_checklists','task_comments','sprints','employees','users','announcements','notifications','invites'];
    for (const t of tables) {
      const r = await tx.execute(sql.raw(`SELECT COUNT(*) as c FROM "${t}"`));
      console.log(`  ${t}: ${(r.rows[0] as any).c}`);
    }

  });

  console.log('\n✅ CLEANUP COMPLETE — All regression/test data removed successfully!');
  process.exit(0);
}

main().catch(e => {
  console.error('❌ CLEANUP FAILED:', e.message);
  process.exit(1);
});
