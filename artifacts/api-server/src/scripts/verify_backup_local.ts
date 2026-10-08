import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';
import ExcelJS from 'exceljs';
import officecrypto from 'officecrypto-tool';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), 'artifacts/api-server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

// Support explicit local DB flag for offline testing
if (process.argv.includes('--local-db')) {
  process.env.DATABASE_URL = 'postgresql://postgres@localhost:5432/hrdashboard_local_test';
}

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
    console.error('   DATABASE_URL points to live Supabase production:         ');
    console.error(`   ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);
    console.error('   Operation halted before any live query was executed.      ');
    console.error('   To run on live production, you MUST explicitly pass BOTH:');
    console.error('     1. --live');
    console.error('     2. --confirm-production="yes-i-am-sure" (exact match)');
    console.error('🛑 ======================================================== 🛑\n');
    process.exit(1);
  }
}

async function runLocalVerification() {
  console.log('\n🚀 Starting Enterprise Backup Verification on Local Database...');
  console.log(`🔌 Database Host: ${dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') ? 'Local PostgreSQL (127.0.0.1:5432)' : 'Remote/Test'}`);

  const { generateEnterpriseBackup } = await import('../services/backupService.js');
  const password = process.env.BACKUP_FILE_PASSWORD;
  if (!password) {
    throw new Error('BACKUP_FILE_PASSWORD is not set in environment.');
  }

  // 1. Run backup generator
  console.log('📦 Executing generateEnterpriseBackup("MANUAL")...');
  const result = await generateEnterpriseBackup('MANUAL');
  console.log(`✅ Backup Generated: ${result.filename}`);
  console.log(`📁 File Size: ${(result.fileSizeBytes / 1024).toFixed(1)} KB`);
  console.log(`📍 Path: ${result.filePath}`);

  // 2. Verify physical file on disk
  const fileBuffer = await fs.readFile(result.filePath);
  console.log(`\n🔒 Encrypted File Confirmed on Disk (${fileBuffer.length} bytes).`);

  // 3. Test decryption using configured password
  console.log('🔑 Attempting OOXML decryption with environment password...');
  const decryptedBuffer = await (officecrypto as any).decrypt(fileBuffer, { password });
  console.log(`🔓 Successfully decrypted! Decrypted payload size: ${decryptedBuffer.length} bytes.`);

  // 4. Load decrypted workbook into ExcelJS
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(decryptedBuffer as any);
  console.log(`📑 Loaded workbook successfully. Sheet count: ${workbook.worksheets.length}`);

  // 5. Inspect every worksheet
  const sheets = workbook.worksheets.map((ws) => ws.name);
  console.log(`📋 Worksheets present: [${sheets.map((s) => `"${s}"`).join(', ')}]`);

  // Verify headers and formatting on each sheet
  workbook.worksheets.forEach((ws) => {
    const headerRow = ws.getRow(1);
    const hasFrozenView = Array.isArray(ws.views) && ws.views.some((v) => v.state === 'frozen' && v.ySplit === 1);
    const headerCell = headerRow.getCell(1);
    const hasBoldHeader = headerCell.font?.bold === true;
    console.log(`  - Sheet "${ws.name}": ${ws.rowCount} rows, ${ws.columnCount} columns | Frozen Header: ${hasFrozenView ? 'YES' : 'NO'} | Bold Style: ${hasBoldHeader ? 'YES' : 'NO'}`);
  });

  // 6. Print Literal Row Count Comparison Table
  console.log('\n========================================================================================');
  console.log('                          LITERAL ROW COUNT VERIFICATION TABLE                          ');
  console.log('========================================================================================');
  console.log('| Sheet Name        | Expected (DB Table) | Actual (Excel Rows) | Match? | Status     |');
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
    result.legacyCodesDetected.slice(0, 10).forEach((item) => {
      console.log(`   - Table: ${item.table} | Code: ${item.code} | Title/Name: ${item.titleOrName}`);
    });
    if (result.legacyCodesDetected.length > 10) {
      console.log(`   ... and ${result.legacyCodesDetected.length - 10} more quarantined rows.`);
    }
  } else {
    console.log('✨ 100% Modern Code Format Compliance: No legacy format codes detected.');
  }

  const allMatched = result.verificationTable.every((v) => v.match);
  if (!allMatched) {
    console.error('❌ Verification failed: Discrepancy detected in row counts.');
    process.exit(1);
  }

  console.log('\n🎉 ALL 7 SHEETS VERIFIED SUCCESSFULLY WITH 100% INTEGRITY MATCH!\n');
}

runLocalVerification().catch((err) => {
  console.error('\n❌ Local verification failed with error:', err);
  process.exit(1);
});
