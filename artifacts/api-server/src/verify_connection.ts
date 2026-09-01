import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('[STEP 2 VERIFICATION] Testing connection to Supabase Transaction Pooler (port 6543)...');

async function verify() {
  try {
    const res = await db.execute(sql`SELECT 1 as connected, current_database(), version();`);
    console.log('[STEP 2 RESULT] SUCCESS! Empirical Connection Output:');
    console.log(JSON.stringify(res.rows[0], null, 2));
    process.exit(0);
  } catch (err: any) {
    console.error('[STEP 2 RESULT] CONNECTION ERROR:', err.message);
    process.exit(1);
  }
}

verify();
