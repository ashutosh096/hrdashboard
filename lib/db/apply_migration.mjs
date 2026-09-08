import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../artifacts/api-server/.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not defined in env');
  process.exit(1);
}

console.log('Connecting to Supabase DB to apply migration 0004_agile_schema_alignment.sql...');
const client = new pg.Client({ connectionString });
await client.connect();

try {
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'drizzle/0004_agile_schema_alignment.sql'), 'utf8');
  await client.query(sql);
  console.log('✅ MIGRATION 0004_AGILE_SCHEMA_ALIGNMENT SUCCESSFULLY APPLIED TO SUPABASE!');
} catch (err) {
  console.error('❌ MIGRATION FAILED:', err);
  process.exit(1);
} finally {
  await client.end();
}
