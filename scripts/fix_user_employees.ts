import { db, sql } from '@workspace/db';

async function fixUserEmployees() {
  console.log('--- Cleaning up duplicate employee_id on inactive user ---');
  await db.execute(sql`
    UPDATE users 
    SET employee_id = NULL 
    WHERE id = 'fbabfd51-893e-47da-8653-0f5cfdc3d1f3' AND status = 'INACTIVE';
  `);

  console.log('--- Checking for duplicate employee_id in users ---');
  const dupes = await db.execute(sql`
    SELECT employee_id, COUNT(*) as count, array_agg(id) as user_ids, array_agg(email) as emails
    FROM users 
    WHERE employee_id IS NOT NULL 
    GROUP BY employee_id 
    HAVING COUNT(*) > 1;
  `);
  console.log('Duplicate employee_id count:', dupes.rows.length);
  console.log(JSON.stringify(dupes.rows, null, 2));

  console.log('--- Checking for users pointing to non-existent or mismatched employees ---');
  const invalid = await db.execute(sql`
    SELECT u.id as user_id, u.email as user_email, u.status as user_status, u.employee_id, e.id as emp_id, e.email as emp_email
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.employee_id IS NOT NULL AND e.id IS NULL;
  `);
  console.log('Users pointing to non-existent employees:', invalid.rows.length);
  console.log(JSON.stringify(invalid.rows, null, 2));

  console.log('--- Checking active users 1-to-1 mapping with employees ---');
  const activeUserMap = await db.execute(sql`
    SELECT u.id as user_id, u.email as user_email, u.employee_id, e.first_name, e.last_name, e.employee_code
    FROM users u
    JOIN employees e ON u.employee_id = e.id
    WHERE u.status = 'ACTIVE'
    ORDER BY u.created_at ASC;
  `);
  console.log('Active user mapping count:', activeUserMap.rows.length);
  console.log(JSON.stringify(activeUserMap.rows, null, 2));
}

fixUserEmployees()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
