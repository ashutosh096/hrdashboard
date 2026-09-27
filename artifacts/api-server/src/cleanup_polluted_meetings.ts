import { db, meetings, employees, sql, eq } from '@workspace/db';

async function cleanupPollution() {
  console.log('--- 🧹 STARTING GOOGLE CALENDAR POLLUTION CLEANUP ---');

  // 1. Get before count
  const [beforeCountRes] = (await db.execute(sql`SELECT count(*) as count FROM meetings`)).rows as any;
  const beforeCount = parseInt(beforeCountRes.count, 10);
  console.log(`Total meetings BEFORE cleanup: ${beforeCount}`);

  // Fetch all employees and users to identify organizer emails, user IDs & employee IDs
  const allEmployees = await db.select().from(employees);
  const allUsersRes: any = await db.execute(sql`SELECT id, email, employee_id FROM users`);
  const allUsers: any[] = allUsersRes.rows || allUsersRes;

  const empToUserMap = new Map<string, any>();
  const userToEmpMap = new Map<string, any>();
  
  allUsers.forEach(u => {
    if (u.employee_id) empToUserMap.set(u.employee_id, u);
    userToEmpMap.set(u.id, u);
  });

  const empMap = new Map<string, any>();
  allEmployees.forEach(e => {
    empMap.set(e.id, e);
  });

  // 2. Fetch all GOOGLE_CALENDAR_IMPORTED meetings
  const importedMeetingsRes: any = await db.execute(sql`
    SELECT id, title, organizer_id, invitees, google_event_id, source 
    FROM meetings 
    WHERE source = 'GOOGLE_CALENDAR_IMPORTED';
  `);
  const rows: any[] = importedMeetingsRes.rows || importedMeetingsRes;
  console.log(`Total GOOGLE_CALENDAR_IMPORTED meetings found: ${rows.length}`);

  const toDeleteIds: string[] = [];
  const titleCounts: Record<string, number> = {};

  for (const m of rows) {
    const rawInvitees: any[] = Array.isArray(m.invitees) ? m.invitees : [];
    
    // Identify all aliases of the organizer:
    const organizerAliases = new Set<string>();
    if (m.organizer_id) {
      organizerAliases.add(m.organizer_id.toLowerCase().trim());
      const emp = empMap.get(m.organizer_id);
      if (emp?.email) organizerAliases.add(emp.email.toLowerCase().trim());
      const linkedUser = empToUserMap.get(m.organizer_id);
      if (linkedUser?.id) organizerAliases.add(linkedUser.id.toLowerCase().trim());
      if (linkedUser?.email) organizerAliases.add(linkedUser.email.toLowerCase().trim());
    }

    // Filter distinct other attendees
    const distinctOtherPeople = new Set<string>();
    for (const inv of rawInvitees) {
      const invStr = String(inv).toLowerCase().trim();
      if (
        !organizerAliases.has(invStr) &&
        !invStr.includes('resource.calendar.google.com') &&
        !invStr.includes('group.calendar.google.com')
      ) {
        distinctOtherPeople.add(invStr);
      }
    }

    // A real meeting requires at least 1 other attendee besides the organizer (meaning >= 2 people total).
    // If distinctOtherPeople has 0 attendees, or if it's a known personal block title, it's polluted personal data.
    if (distinctOtherPeople.size === 0) {
      toDeleteIds.push(m.id);
      titleCounts[m.title || '(No Title)'] = (titleCounts[m.title || '(No Title)'] || 0) + 1;
    }
  }

  console.log(`\nIdentified ${toDeleteIds.length} personal/polluted meetings to remove.`);
  console.log('Top polluted titles being deleted:');
  const sortedTitles = Object.entries(titleCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  sortedTitles.forEach(([t, count]) => {
    console.log(`  - "${t}": ${count} rows`);
  });

  // 3. Batch delete in chunks of 100
  if (toDeleteIds.length > 0) {
    const chunkSize = 100;
    for (let i = 0; i < toDeleteIds.length; i += chunkSize) {
      const chunk = toDeleteIds.slice(i, i + chunkSize);
      await db.execute(sql`DELETE FROM meetings WHERE id IN (${sql.join(chunk.map(id => sql`${id}`), sql`, `)})`);
    }
    console.log(`\n✅ Successfully deleted ${toDeleteIds.length} polluted meetings from database.`);
  }

  // 4. Get after count
  const [afterCountRes] = (await db.execute(sql`SELECT count(*) as count FROM meetings`)).rows as any;
  const afterCount = parseInt(afterCountRes.count, 10);
  console.log(`\nTotal meetings AFTER cleanup: ${afterCount}`);
  console.log(`Net reduction: ${beforeCount - afterCount} rows removed.`);

  process.exit(0);
}

cleanupPollution().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
