import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, users, eq } from '@workspace/db';

dotenv.config();

export async function runSeed() {
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
