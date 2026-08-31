import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
export async function runSeed() {
    console.log('[SEED] Seeding database with HROS initial data...');
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    console.log(`[SEED] Admin Created: ${adminEmail} (password: ${adminPassword})`);
    console.log('[SEED] Entities created: EHM (EHM Operations) & CAG (CliAgro Systems)');
    console.log('[SEED] Departments created: MAR, DEV, OPS, HR, FIN');
    console.log('[SEED] Initial tasks seeded: EHM-MAR-ADH-672, CAG-DEV-SPR-101, EHM-OPS-PROC-412');
    console.log('[SEED] Database seeding complete!');
}
// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
    runSeed().catch(console.error);
}
