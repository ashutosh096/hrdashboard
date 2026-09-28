import { db, sql } from './lib/db/dist/index.js';

async function main() {
  const notifs = await db.execute(sql`
    SELECT id, user_id, type, payload, created_at 
    FROM notifications 
    WHERE payload::text LIKE '%SPRT0004%' OR payload::text LIKE '%TASK0010%' OR payload::text LIKE '%STSK0002%' OR payload::text LIKE '%BLOG0010%'
    ORDER BY created_at ASC
  `);
  console.log('=== NOTIFICATIONS (' + notifs.rows.length + ') ===');
  console.log(JSON.stringify(notifs.rows, null, 2));

  const sprints = await db.execute(sql`
    SELECT id, sprint_code, name, created_at 
    FROM sprints 
    WHERE sprint_code IN ('SPRT0004') OR sprint_code LIKE 'SPRT%'
    ORDER BY created_at ASC
  `);
  console.log('=== SPRINTS (' + sprints.rows.length + ') ===');
  console.log(JSON.stringify(sprints.rows, null, 2));

  const epics = await db.execute(sql`
    SELECT id, epic_code, title, created_at 
    FROM epics 
    WHERE epic_code IN ('EPIC0008', 'EPIC0009') OR epic_code LIKE 'EPIC%'
    ORDER BY created_at ASC
  `);
  console.log('=== EPICS (' + epics.rows.length + ') ===');
  console.log(JSON.stringify(epics.rows, null, 2));

  const inits = await db.execute(sql`
    SELECT id, initiative_code, title, created_at 
    FROM initiatives 
    WHERE initiative_code IN ('INIT0008') OR initiative_code LIKE 'INIT%'
    ORDER BY created_at ASC
  `);
  console.log('=== INITIATIVES (' + inits.rows.length + ') ===');
  console.log(JSON.stringify(inits.rows, null, 2));

  const emps = await db.execute(sql`
    SELECT id, employee_code, first_name, last_name, email, created_at 
    FROM employees 
    WHERE employee_code IN ('TEAM0014', 'TEAM0015') 
       OR employee_code LIKE 'TEAM%' 
       OR email LIKE '%step2.test%'
    ORDER BY created_at ASC
  `);
  console.log('=== EMPLOYEES (' + emps.rows.length + ') ===');
  console.log(JSON.stringify(emps.rows, null, 2));

  const users = await db.execute(sql`
    SELECT id, email, role, employee_id, created_at 
    FROM users 
    WHERE email LIKE '%step2.test%'
    ORDER BY created_at ASC
  `);
  console.log('=== USERS (' + users.rows.length + ') ===');
  console.log(JSON.stringify(users.rows, null, 2));

  const invites = await db.execute(sql`
    SELECT id, email, role, employee_id, created_at 
    FROM invites 
    WHERE email LIKE '%step2.test%'
    ORDER BY created_at ASC
  `);
  console.log('=== INVITES (' + invites.rows.length + ') ===');
  console.log(JSON.stringify(invites.rows, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
