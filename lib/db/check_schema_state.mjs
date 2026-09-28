import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../artifacts/api-server/.env') });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await client.connect();

const cols = await client.query(`
  SELECT column_name FROM information_schema.columns WHERE table_name = 'global_counters'
`);
console.log('global_counters columns:', cols.rows.map(r => r.column_name));

const tables = await client.query(`
  SELECT table_name FROM information_schema.tables WHERE table_name = 'employee_code_history'
`);
console.log('employee_code_history exists:', tables.rows.length > 0);

await client.end();
