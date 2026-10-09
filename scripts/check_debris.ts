import { db, sql } from '@workspace/db';

async function main() {
  const targetIds = [
    '07febdd3-a9f0-406a-a526-fe05b901246b',
    '1eb883bf-db70-413f-9bb6-c60db173719f',
    '24056a4a-7d1e-4bf6-ba18-ca7ecf005239',
  ];

  console.log('=== CHECKING DEBRIS FOR THE 3 E2E TEST TASK IDS ===');
  console.log('Target Task IDs:\n', targetIds.join('\n '));

  const idList = targetIds.map(id => `'${id}'`).join(',');

  // 1. Check record_history
  const histRes: any = await db.execute(sql.raw(`
    SELECT id, table_name, record_id, action, changed_by_name, changed_at 
    FROM record_history 
    WHERE record_id IN (${idList});
  `));
  console.log(`\n1. record_history matching target IDs: ${histRes.rows.length}`);
  for (const r of histRes.rows) console.log('  ', JSON.stringify(r));

  // 2. Check task_comments
  const commentRes: any = await db.execute(sql.raw(`
    SELECT id, task_id, author_name, content, created_at 
    FROM task_comments 
    WHERE task_id IN (${idList});
  `));
  console.log(`\n2. task_comments matching target IDs: ${commentRes.rows.length}`);
  for (const r of commentRes.rows) console.log('  ', JSON.stringify(r));

  // 3. Check task_checklists
  const checklistRes: any = await db.execute(sql.raw(`
    SELECT id, task_id, item_text, is_completed, created_at 
    FROM task_checklists 
    WHERE task_id IN (${idList});
  `));
  console.log(`\n3. task_checklists matching target IDs: ${checklistRes.rows.length}`);
  for (const r of checklistRes.rows) console.log('  ', JSON.stringify(r));

  // Delete only rows pointing at these 3 IDs
  console.log('\n=== DELETING ROWS POINTING AT THE 3 TARGET IDS ===');
  const delHist: any = await db.execute(sql.raw(`DELETE FROM record_history WHERE record_id IN (${idList}) RETURNING id;`));
  const delComments: any = await db.execute(sql.raw(`DELETE FROM task_comments WHERE task_id IN (${idList}) RETURNING id;`));
  const delChecklists: any = await db.execute(sql.raw(`DELETE FROM task_checklists WHERE task_id IN (${idList}) RETURNING id;`));

  console.log(`Deleted record_history rows:   ${delHist.rows.length}`);
  console.log(`Deleted task_comments rows:    ${delComments.rows.length}`);
  console.log(`Deleted task_checklists rows:  ${delChecklists.rows.length}`);

  // Post-delete verification
  console.log('\n=== POST-DELETE CONFIRMATION (REMAINING ROWS) ===');
  const postHist: any = await db.execute(sql.raw(`SELECT count(*) as count FROM record_history WHERE record_id IN (${idList});`));
  const postComments: any = await db.execute(sql.raw(`SELECT count(*) as count FROM task_comments WHERE task_id IN (${idList});`));
  const postChecklists: any = await db.execute(sql.raw(`SELECT count(*) as count FROM task_checklists WHERE task_id IN (${idList});`));

  console.log('Remaining record_history:   ', postHist.rows[0]?.count);
  console.log('Remaining task_comments:    ', postComments.rows[0]?.count);
  console.log('Remaining task_checklists:  ', postChecklists.rows[0]?.count);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
