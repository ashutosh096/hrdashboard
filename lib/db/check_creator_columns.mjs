import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../artifacts/api-server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[FATAL] DATABASE_URL not set');
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const query = `
    SELECT 
      table_name, 
      column_name, 
      data_type, 
      is_nullable
    FROM information_schema.columns
    WHERE table_name IN ('initiatives', 'epics', 'tasks', 'sprints', 'projects')
      AND (
        column_name LIKE '%create%' 
        OR column_name LIKE '%owner%' 
        OR column_name LIKE '%author%'
        OR column_name LIKE '%by%'
      )
    ORDER BY table_name, column_name;
  `;
  const res = await client.query(query);
  console.log('--- LITERAL INFORMATION_SCHEMA OUTPUT FOR CREATOR & CREATED_AT COLUMNS ---');
  console.table(res.rows);

  const allColsQuery = `
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name IN ('initiatives', 'epics', 'tasks', 'sprints', 'projects')
    ORDER BY table_name, ordinal_position;
  `;
  const allRes = await client.query(allColsQuery);
  console.log('\n--- ALL COLUMNS PER TABLE (FOR CONTEXT) ---');
  const grouped = {};
  for (const row of allRes.rows) {
    if (!grouped[row.table_name]) grouped[row.table_name] = [];
    grouped[row.table_name].push(`${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
  }
  for (const [tbl, cols] of Object.entries(grouped)) {
    console.log(`\nTable [${tbl}]:`);
    console.log(cols.join(', '));
  }
} finally {
  await client.end();
}
