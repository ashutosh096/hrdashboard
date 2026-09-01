import dotenv from 'dotenv';
import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';

dotenv.config();

async function runVerification() {
  console.log('[STEP 2 VERIFICATION] Querying Supabase Transaction Pooler (port 6543)...');
  try {
    const result = await db.execute(sql`SELECT 1 as connected, current_database(), version();`);
    console.log('[STEP 2 EMPIRICAL RESULT]:');
    console.log(JSON.stringify(result.rows[0], null, 2));
  } catch (err: any) {
    console.error('[STEP 2 ERROR]:', err.message);
  }
}

runVerification().then(() => process.exit(0));
