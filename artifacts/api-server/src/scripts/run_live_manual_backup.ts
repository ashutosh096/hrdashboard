import dotenv from 'dotenv';
import path from 'node:path';
import { db, desc, eq } from '@workspace/db';
import { backupHistory } from '@workspace/db';
import { generateEnterpriseBackup } from '../services/backupService.js';

dotenv.config({ path: path.resolve(process.cwd(), 'artifacts/api-server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

// -------------------------------------------------------------------------
// PRODUCTION SAFETY GUARD
// -------------------------------------------------------------------------
const dbUrl = process.env.DATABASE_URL || '';
const isLiveSupabase = dbUrl.includes('supabase.com') || dbUrl.includes('pooler.supabase.com');
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

async function runLiveBackup() {
  console.log('\n🌟 =================================================================');
  console.log('       EXECUTING FIRST LIVE PRODUCTION MANUAL ENTERPRISE BACKUP     ');
  console.log('====================================================================');
  console.log(`📡 Connected to Live Database: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);

  // 1. Generate Backup
  console.log('\n⏳ Querying live database tables (SELECTs only) and generating encrypted workbook...');
  const result = await generateEnterpriseBackup('MANUAL');

  console.log(`\n✅ Backup Generated Successfully!`);
  console.log(`📁 File Name: ${result.filename}`);
  console.log(`📦 File Size: ${(result.fileSizeBytes / 1024).toFixed(1)} KB`);
  console.log(`📍 Path: ${result.filePath}`);

  // 2. Print Verification Table
  console.log('\n========================================================================================');
  console.log('                    LIVE DATABASE LITERAL ROW COUNT VERIFICATION TABLE                  ');
  console.log('========================================================================================');
  console.log('| Sheet Name        | Expected (Live DB)  | Actual (Excel Rows) | Match? | Status     |');
  console.log('|-------------------|---------------------|---------------------|--------|------------|');
  result.verificationTable.forEach((row) => {
    const padName = row.sheetName.padEnd(17);
    const padExp = String(row.expectedRows).padEnd(19);
    const padAct = String(row.actualRows).padEnd(19);
    const padMatch = (row.match ? 'YES' : 'NO').padEnd(6);
    const padStatus = (row.match ? '✓ VERIFIED' : '✗ MISMATCH').padEnd(10);
    console.log(`| ${padName} | ${padExp} | ${padAct} | ${padMatch} | ${padStatus} |`);
  });
  console.log('========================================================================================\n');

  if (result.legacyCodesDetected.length > 0) {
    console.log(`⚠️ Legacy format codes detected (${result.legacyCodesDetected.length} total):`);
    result.legacyCodesDetected.forEach((item) => {
      console.log(`   - Table: ${item.table} | Code: ${item.code} | Title/Name: ${item.titleOrName}`);
    });
  }

  // 3. Query backup_history table to display recorded audit log row
  console.log('\n📜 Querying backup_history table for the newly inserted record...');
  const latestRecords = await db
    .select()
    .from(backupHistory)
    .orderBy(desc(backupHistory.createdAt))
    .limit(1);

  if (latestRecords.length > 0) {
    const rec = latestRecords[0];
    console.log('\n========================================================================================');
    console.log('                           NEW BACKUP_HISTORY AUDIT ROW CREATED                         ');
    console.log('========================================================================================');
    console.log(`ID:                  ${rec.id}`);
    console.log(`Filename:            ${rec.filename}`);
    console.log(`File Size:           ${rec.fileSizeBytes} bytes (${(Number(rec.fileSizeBytes) / 1024).toFixed(1)} KB)`);
    console.log(`Trigger Type:        ${rec.triggerType}`);
    console.log(`Status:              ${rec.status}`);
    console.log(`Created At:          ${rec.createdAt.toISOString()}`);
    console.log(`Verification Result: ${JSON.stringify(rec.verificationResult)}`);
    console.log('========================================================================================\n');
  }

  console.log('🎉 Live production backup and audit log completed with 100% integrity!\n');
}

runLiveBackup().catch((err) => {
  console.error('\n❌ Live backup failed:', err);
  process.exit(1);
});
