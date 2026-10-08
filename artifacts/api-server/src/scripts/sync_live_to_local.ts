import dotenv from 'dotenv';
import path from 'node:path';
import pg from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), 'artifacts/api-server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

// -------------------------------------------------------------------------
// PRODUCTION SAFETY GUARD
// -------------------------------------------------------------------------
const liveDbUrl = process.env.DATABASE_URL || '';
const isLiveSupabase = liveDbUrl.includes('supabase.com') || liveDbUrl.includes('pooler.supabase.com');
const hasLiveFlag = process.argv.includes('--live');
const confirmArg = process.argv.find((arg) => arg.startsWith('--confirm-production='));
const confirmValue = confirmArg ? confirmArg.split('=')[1] : null;

if (isLiveSupabase) {
  if (!hasLiveFlag || confirmValue !== 'yes-i-am-sure') {
    console.error('\n🛑 ======================================================== 🛑');
    console.error('   CRITICAL SAFETY GUARD: LIVE PRODUCTION ACCESS BLOCKED!   ');
    console.error('   DATABASE_URL points to live Supabase production.          ');
    console.error('   Operation halted before any live query was executed.      ');
    console.error('   To run on live production, you MUST explicitly pass BOTH:');
    console.error('     1. --live');
    console.error('     2. --confirm-production="yes-i-am-sure" (exact match)');
    console.error('🛑 ======================================================== 🛑\n');
    process.exit(1);
  }
}

const localDbUrl = 'postgresql://postgres@localhost:5432/hrdashboard_local_test';

async function refreshLocalFromLive() {
  console.log('🔄 Connecting to Live Database (Read-Only SELECTs only)...');
  const livePool = new pg.Pool({
    connectionString: liveDbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log('🔄 Connecting to Local Test Database (127.0.0.1:5432)...');
  const localPool = new pg.Pool({
    connectionString: localDbUrl,
  });

  const tablesToSync = [
    'entities',
    'departments',
    'employees',
    'users',
    'initiatives',
    'projects',
    'epics',
    'sprints',
    'tasks',
    'task_checklists',
    'attendance',
  ];

  try {
    // Read each table from live DB
    for (const table of tablesToSync) {
      console.log(`📥 Reading [${table}] from live DB (SELECT *)...`);
      const res = await livePool.query(`SELECT * FROM ${table}`);
      console.log(`   Fetched ${res.rows.length} rows.`);

      // Clean local table
      await localPool.query(`TRUNCATE TABLE ${table} CASCADE`);

      if (res.rows.length > 0) {
        const columns = Object.keys(res.rows[0]);
        const colNames = columns.map((c) => `"${c}"`).join(', ');

        for (const row of res.rows) {
          const values = columns.map((col) => {
            const val = row[col];
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
              return JSON.stringify(val);
            }
            return val;
          });
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          const insertQuery = `INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          await localPool.query(insertQuery, values);
        }
        console.log(`   ✅ Synced ${res.rows.length} rows into local [${table}].`);
      }
    }

    console.log('\n🎉 Local test database refresh complete! All tables populated with live records.');
  } finally {
    await livePool.end();
    await localPool.end();
  }
}

refreshLocalFromLive().catch((err) => {
  console.error('❌ Failed to refresh local DB:', err);
  process.exit(1);
});
