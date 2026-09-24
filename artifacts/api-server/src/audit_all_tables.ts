import { db, sql } from '@workspace/db';

async function auditDatabase() {
  console.log('=== 🛡️ FULL DATABASE SCHEMA & TABLE AUDIT ===\n');

  // List of all known tables
  const expectedTables = [
    'users',
    'employees',
    'entities',
    'departments',
    'entity_counters',
    'invites',
    'google_tokens',
    'tasks',
    'task_notes',
    'task_checklists',
    'task_comments',
    'task_templates',
    'meetings',
    'meeting_attendees',
    'attendance',
    'announcements',
    'applications',
    'audit_logs',
    'notifications',
    'initiatives',
    'epics',
    'sprints',
    'password_reset_otps',
    'projects',
  ];

  const results: { table: string; status: string; count: number; error?: string }[] = [];

  for (const tableName of expectedTables) {
    try {
      const queryResult = await db.execute(sql.raw(`SELECT count(*) as count FROM "${tableName}"`));
      const count = Number((queryResult.rows[0] as any)?.count || 0);
      results.push({ table: tableName, status: 'EXISTS & ACTIVE', count });
      console.log(`✅ Table "${tableName}": EXISTS with ${count} records.`);
    } catch (err: any) {
      results.push({ table: tableName, status: 'MISSING OR ERROR', count: 0, error: err?.message });
      console.error(`❌ Table "${tableName}": FAILED - ${err?.message}`);
    }
  }

  const missing = results.filter(r => r.status !== 'EXISTS & ACTIVE');
  console.log('\n----------------------------------------');
  if (missing.length === 0) {
    console.log(`🎉 ALL ${expectedTables.length} TABLES VERIFIED & 100% OPERATIONAL IN POSTGRESQL!`);
  } else {
    console.log(`⚠️ Warning: ${missing.length} tables need attention:`, missing);
  }
  console.log('----------------------------------------\n');

  process.exit(missing.length === 0 ? 0 : 1);
}

auditDatabase().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
