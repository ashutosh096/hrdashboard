import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../artifacts/api-server/.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.qlnghemivzcyazvtndhv:Hrdash%40123%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const client = new pg.Client({ connectionString });
await client.connect();

try {
  console.log('--- AUDITING EPICS & INITIATIVE LINEAGE ---');
  
  const initsRes = await client.query(`SELECT id, initiative_code, title FROM initiatives`);
  console.log(`Found ${initsRes.rows.length} initiatives in database:`);
  initsRes.rows.forEach(i => console.log(` - Initiative: id=${i.id}, code=${i.initiative_code}, title="${i.title}"`));

  const epicsRes = await client.query(`SELECT id, epic_code, title, initiative_id FROM epics`);
  console.log(`\nFound ${epicsRes.rows.length} epics in database:`);

  const validInitIds = new Set(initsRes.rows.map(i => i.id));
  let orphanCount = 0;
  const orphanEpics = [];
  
  epicsRes.rows.forEach(e => {
    const isValid = e.initiative_id && validInitIds.has(e.initiative_id);
    if (!isValid) {
      orphanCount++;
      orphanEpics.push(e);
    }
    console.log(` - Epic: id=${e.id}, code=${e.epic_code}, title="${e.title}", initiative_id=${e.initiative_id} -> ${isValid ? 'VALID' : 'INVALID / UNMATCHED'}`);
  });

  console.log(`\nAUDIT SUMMARY: ${orphanCount} of ${epicsRes.rows.length} Epics have null, invalid, or unmatched initiative_id values.`);
  if (orphanEpics.length > 0) {
    console.log('Orphan Epics:', JSON.stringify(orphanEpics, null, 2));
  }
} catch (err) {
  console.error('Audit failed:', err);
} finally {
  await client.end();
}
