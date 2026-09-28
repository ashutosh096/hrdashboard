import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../artifacts/api-server/.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[FATAL] DATABASE_URL is not set.');
  process.exit(1);
}
const client = new pg.Client({ connectionString });
await client.connect();

try {
  console.log('--- APPLYING MIGRATION 0005: TASK CHECKLISTS & COMMENTS ---');
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'drizzle/0005_task_checklists_and_comments.sql'), 'utf-8');
  await client.query(sql);
  console.log('✅ Migration 0005 applied successfully to Postgres database!');
} catch (err) {
  console.error('Migration failure:', err);
} finally {
  await client.end();
}
