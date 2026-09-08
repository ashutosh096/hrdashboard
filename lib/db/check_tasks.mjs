import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../artifacts/api-server/.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  console.log('Inspecting tasks rows...');
  const res = await client.query(`SELECT id, task_code, epic_id, sprint_id, task_type FROM tasks`);
  console.log('Tasks rows:', res.rows);
  
  for (const t of res.rows) {
    if (t.epic_id && t.sprint_id) {
      console.log(`Task ${t.id} (${t.task_code}) has BOTH epic_id (${t.epic_id}) and sprint_id (${t.sprint_id})!`);
    }
  }
} catch (err) {
  console.error('Error inspecting tasks:', err);
} finally {
  await client.end();
}
