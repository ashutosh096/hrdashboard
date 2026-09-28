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

const singleQuery = `
  SELECT 
    table_name,
    (xpath('/row/cnt/text()', xml_count))[1]::text::int AS row_count
  FROM (
    SELECT 
      table_name,
      query_to_xml(format('SELECT count(*) AS cnt FROM %I', table_name), false, true, '') AS xml_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
      AND table_name NOT LIKE '__drizzle%'
  ) sub
  ORDER BY table_name;
`;

const res = await client.query(singleQuery);
console.log('REAL ROW COUNTS FOR ALL 25 TABLES (SINGLE SQL QUERY):');
console.table(res.rows);
console.log('Table count:', res.rows.length);

await client.end();
