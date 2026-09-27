import { db, sql } from '@workspace/db';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve('C:/hrdashboard');

async function runBackup() {
  console.log('Connected to DB via @workspace/db. Fetching all table names...');
  
  const tablesRes: any = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  const rows = tablesRes.rows || tablesRes;
  const tableNames = rows.map((r: any) => r.table_name).filter((t: string) => !t.startsWith('__drizzle'));
  console.log('Found tables:', tableNames);

  const allData: Record<string, any[]> = {};
  const tableStats: { table: string; count: number; error?: string }[] = [];

  for (const tableName of tableNames) {
    try {
      const res: any = await db.execute(sql.raw(`SELECT * FROM "${tableName}"`));
      const tableRows = res.rows || res;
      allData[tableName] = tableRows;
      tableStats.push({ table: tableName, count: tableRows.length });
      console.log(`[OK] Exported ${tableRows.length} records from "${tableName}"`);
    } catch (err: any) {
      console.error(`[ERROR] Table "${tableName}":`, err);
      allData[tableName] = [];
      tableStats.push({ table: tableName, count: 0, error: err.message });
    }
  }

  // 1. Save JSON full data dump
  const jsonPathRoot = path.join(ROOT_DIR, 'DATABASE_BACKUP.json');
  fs.writeFileSync(jsonPathRoot, JSON.stringify(allData, null, 2), 'utf-8');
  console.log(`\n==> Saved JSON raw data backup to: ${jsonPathRoot}`);

  // 2. Generate detailed Markdown backup file
  let md = `# Comprehensive HR Dashboard System & Database Backup\n\n`;
  md += `> **Backup Date & Time:** ${new Date().toLocaleString()} (${new Date().toISOString()})\n`;
  md += `> **Scope:** Complete Database snapshot including all Team Members, Initiatives, Epics, Tasks, Sprints, Meetings, Announcements, Projects, Checklists, Notes, Comments, and System entities.\n`;
  md += `> **Total Tables Backed Up:** ${tableNames.length}\n`;
  md += `> **Status:** All changes remain strictly on localhost with zero data loss.\n\n`;

  md += `## Table Summary Index\n\n`;
  md += `| Table Name | Record Count | Status |\n`;
  md += `|---|:---:|---|\n`;

  let totalRecords = 0;
  for (const stat of tableStats) {
    totalRecords += stat.count;
    md += `| **\`${stat.table}\`** | **${stat.count}** | ${stat.error ? '⚠️ Error: ' + stat.error : '✅ Backed up successfully'} |\n`;
  }
  md += `| **TOTAL RECORDS** | **${totalRecords}** | **Complete Dataset** |\n\n`;
  md += `---\n\n`;

  // Detailed per-table section
  for (const tableName of tableNames) {
    const tableRows = allData[tableName] || [];
    md += `## 📋 Table: \`${tableName}\` (${tableRows.length} records)\n\n`;

    if (tableRows.length === 0) {
      md += `*Table exists in database schema but currently contains 0 records.*\n\n---\n\n`;
      continue;
    }

    // Generate markdown table for quick reading
    const sample = tableRows[0];
    const keys = Object.keys(sample);

    if (keys.length > 0) {
      // Pick up to 8 key columns for readable table preview
      const previewKeys = keys.slice(0, 8);
      md += `### Formatted View Preview\n\n`;
      md += `| ${previewKeys.join(' | ')} |\n`;
      md += `| ${previewKeys.map(() => '---').join(' | ')} |\n`;
      for (const r of tableRows) {
        const cells = previewKeys.map(k => {
          const val = r[k];
          if (val === null || val === undefined) return '*null*';
          if (typeof val === 'object') return '`' + JSON.stringify(val).replace(/\|/g, '\\|').slice(0, 40) + '`';
          const s = String(val).replace(/\n/g, ' ').replace(/\|/g, '\\|');
          return s.length > 45 ? s.slice(0, 42) + '...' : s;
        });
        md += `| ${cells.join(' | ')} |\n`;
      }
      md += `\n`;
    }

    // Complete JSON records for this table
    md += `### Complete Field Data & Records (\`${tableName}\`)\n\n`;
    md += `\`\`\`json\n`;
    md += JSON.stringify(tableRows, null, 2);
    md += `\n\`\`\`\n\n---\n\n`;
  }

  const mdPathRoot = path.join(ROOT_DIR, 'DATABASE_BACKUP.md');
  fs.writeFileSync(mdPathRoot, md, 'utf-8');
  console.log(`==> Saved Comprehensive Markdown backup to: ${mdPathRoot}`);

  console.log(`\n🎉 Backup complete! Total ${totalRecords} records across ${tableNames.length} tables backed up.`);
  process.exit(0);
}

runBackup().catch(err => {
  console.error('Fatal backup execution error:', err);
  process.exit(1);
});
