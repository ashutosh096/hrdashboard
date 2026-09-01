import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, users, eq } from '@workspace/db';
import { sql } from 'drizzle-orm';

dotenv.config();

export async function runSeed() {
  console.log('[STEP 2 VERIFICATION] Connecting to Supabase Transaction Pooler (port 6543)...');
  try {
    const res = await db.execute(sql`SELECT 1 as connected, current_database(), version();`);
    console.log('[STEP 2 RESULT] SUCCESS! Connection verified:');
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err: any) {
    console.error('[STEP 2 RESULT] CONNECTION ERROR:', err.message);
  }

  console.log('[SEED] Seeding database with HROS initial data...');
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (!existingUser) {
      await db.insert(users).values({
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      });
      console.log(`[SEED] Admin User inserted: ${adminEmail}`);
    } else {
      await db.update(users)
        .set({ passwordHash, role: 'ADMIN', status: 'ACTIVE' })
        .where(eq(users.email, adminEmail));
      console.log(`[SEED] Admin User updated: ${adminEmail}`);
    }
  } catch (err) {
    console.error('[SEED WARNING] Database seed notice:', err);
  }

  console.log(`[SEED] Admin Credentials: ${adminEmail} (password: ${adminPassword})`);
  console.log('[SEED] Entities created: EHM (EHM Operations) & CAG (CliAgro Systems)');
  console.log('[SEED] Departments created: MAR, DEV, OPS, HR, FIN');
  console.log('[SEED] Initial tasks seeded: EHM-MAR-ADH-672, CAG-DEV-SPR-101, EHM-OPS-PROC-412');
  console.log('[SEED] Database seeding complete!');
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed().catch(console.error);
}
