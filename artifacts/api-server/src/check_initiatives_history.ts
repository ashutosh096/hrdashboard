import { db, initiatives, auditLogs, sql, desc } from '@workspace/db';

async function checkInitiatives() {
  console.log('\n--- 🔍 AUDITING INITIATIVES IN DATABASE ---');

  const inits = await db.select().from(initiatives).orderBy(desc(initiatives.createdAt));
  console.log(`\nTotal Current Initiatives in Database: ${inits.length}`);
  inits.forEach((init, idx) => {
    console.log(`[#${idx + 1}] ID: ${init.id}`);
    console.log(`     Code: ${init.initiativeCode}`);
    console.log(`     Title: ${init.title}`);
    console.log(`     Status: ${init.status}`);
    console.log(`     Owner: ${init.ownerId || 'N/A'}`);
    console.log(`     Entity: ${init.entityId}`);
    console.log(`     Created At: ${init.createdAt}`);
    console.log(`     Updated At: ${(init as any).updatedAt || 'N/A'}`);
  });

  console.log('\n--- 📜 AUDIT LOGS FOR INITIATIVE ACTIONS ---');
  try {
    const logs = await db.execute(
      sql`SELECT * FROM audit_logs WHERE action ILIKE '%initiative%' OR details::text ILIKE '%initiative%' ORDER BY created_at DESC LIMIT 50`
    );
    console.log(`Total Audit Log Entries Related to Initiatives: ${logs.rows.length}`);
    logs.rows.forEach((log: any, idx: number) => {
      console.log(`[Log #${idx + 1}] Time: ${log.created_at} | Action: ${log.action} | User: ${log.user_id}`);
      console.log(`     Details:`, JSON.stringify(log.details));
    });
  } catch (err: any) {
    console.log('Error checking audit logs:', err.message);
  }

  // Check seed file to see what was originally seeded
  console.log('\n--- 🌱 INITIATIVE SEED RECORDS COMPARISON ---');
  console.log('Done.');
  process.exit(0);
}

checkInitiatives().catch((err) => {
  console.error(err);
  process.exit(1);
});
