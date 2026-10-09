import { db, sql } from '@workspace/db';

async function main() {
  const users: any = await db.execute(sql`
    SELECT u.id as user_id, u.email, u.role, u.employee_id, e.id as emp_table_id, e.employee_code, e.first_name, e.last_name 
    FROM users u 
    LEFT JOIN employees e ON u.employee_id = e.id 
    WHERE u.email = 'ashutoshmishraup78@mpgi.edu.in' OR u.role = 'ADMIN';
  `);
  for (const u of users.rows) {
    console.log(JSON.stringify(u));
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
