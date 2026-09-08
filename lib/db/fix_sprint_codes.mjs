import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../artifacts/api-server/.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  console.log('Fixing duplicate sprint codes...');
  const res = await client.query(`
    SELECT s.id, s.target_week, e.employee_code 
    FROM sprints s 
    JOIN employees e ON s.employee_id = e.id 
    ORDER BY s.created_at ASC
  `);

  const seen = {};
  for (const row of res.rows) {
    let weekNum = '1';
    if (row.target_week) {
      const match = row.target_week.match(/\d+/);
      if (match) weekNum = match[0];
    }
    const empCode = (row.employee_code || 'EHM-E01').replace('-EMP', '-E');
    const baseCode = `${empCode}-W${weekNum}`;
    
    seen[baseCode] = (seen[baseCode] || 0) + 1;
    const finalCode = seen[baseCode] === 1 ? baseCode : `${baseCode}-S${seen[baseCode]}`;

    await client.query(`UPDATE sprints SET sprint_code = $1 WHERE id = $2`, [finalCode, row.id]);
    console.log(`Updated Sprint ${row.id} -> ${finalCode}`);
  }
  console.log('✅ Sprint codes deduplicated successfully!');
} catch (err) {
  console.error('Error fixing sprint codes:', err);
} finally {
  await client.end();
}
