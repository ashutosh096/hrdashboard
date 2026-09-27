import { db } from '../../../lib/db/src/index';
import { sql } from 'drizzle-orm';

async function main() {
  // 1. INITIATIVES
  const inits = await db.execute(sql`
    SELECT i.initiative_code, i.title, i.status, e.code as entity
    FROM initiatives i LEFT JOIN entities e ON e.id = i.entity_id
    ORDER BY i.initiative_code
  `);
  console.log('\n=== INITIATIVES (' + inits.rows.length + ') ===');
  inits.rows.forEach((r: any) => console.log(`  [${r.initiative_code}] [${r.entity}] [${r.status}] ${r.title}`));

  // 2. EPICS
  const epics = await db.execute(sql`
    SELECT ep.epic_code, ep.title, ep.status, ep.initiative_id,
           i.initiative_code as parent_init
    FROM epics ep LEFT JOIN initiatives i ON i.id = ep.initiative_id
    ORDER BY ep.epic_code
  `);
  console.log('\n=== EPICS (' + epics.rows.length + ') ===');
  epics.rows.forEach((r: any) => console.log(`  [${r.epic_code}] [${r.status}] parent:${r.parent_init || 'none'} — ${r.title}`));

  // 3. TASKS
  const tasks = await db.execute(sql`
    SELECT t.task_code, t.title, t.status, t.priority, t.task_type,
           emp.first_name || ' ' || emp.last_name as assignee,
           ep.epic_code, s.sprint_code
    FROM tasks t
    LEFT JOIN employees emp ON emp.id = t.assignee_id
    LEFT JOIN epics ep ON ep.id = t.epic_id
    LEFT JOIN sprints s ON s.id = t.sprint_id
    ORDER BY t.created_at DESC
  `);
  console.log('\n=== TASKS (' + tasks.rows.length + ') ===');
  tasks.rows.forEach((r: any) =>
    console.log(`  [${r.task_code}] [${r.task_type}] [${r.status}] [${r.priority}] assignee:${r.assignee || 'none'} epic:${r.epic_code || '-'} sprint:${r.sprint_code || '-'} — ${r.title?.substring(0,60)}`)
  );

  // 4. SPRINTS
  const sprints = await db.execute(sql`
    SELECT s.sprint_code, s.name, s.status, s.start_date, s.end_date,
           emp.first_name || ' ' || emp.last_name as employee
    FROM sprints s LEFT JOIN employees emp ON emp.id = s.employee_id
    ORDER BY s.sprint_code
  `);
  console.log('\n=== SPRINTS (' + sprints.rows.length + ') ===');
  sprints.rows.forEach((r: any) =>
    console.log(`  [${r.sprint_code}] [${r.status}] employee:${r.employee} — ${r.name}`)
  );

  // 5. EMPLOYEES / TEAM
  const emps = await db.execute(sql`
    SELECT emp.employee_code, emp.first_name, emp.last_name, emp.designation,
           emp.status, e.code as entity, d.name as department,
           u.role as user_role, u.email
    FROM employees emp
    LEFT JOIN entities e ON e.id = emp.entity_id
    LEFT JOIN departments d ON d.id = emp.department_id
    LEFT JOIN users u ON u.employee_id = emp.id
    ORDER BY emp.employee_code
  `);
  console.log('\n=== EMPLOYEES/TEAM (' + emps.rows.length + ') ===');
  emps.rows.forEach((r: any) =>
    console.log(`  [${r.employee_code}] [${r.entity}] [${r.user_role || 'no-account'}] ${r.first_name} ${r.last_name} — ${r.designation} (${r.department || 'no-dept'}) status:${r.status}`)
  );

  // 6. ANNOUNCEMENTS
  const ann = await db.execute(sql`
    SELECT title, priority, is_pinned, created_at FROM announcements ORDER BY created_at DESC
  `);
  console.log('\n=== ANNOUNCEMENTS (' + ann.rows.length + ') ===');
  ann.rows.forEach((r: any) =>
    console.log(`  [${r.priority}] pinned:${r.is_pinned} — ${r.title?.substring(0,70)}`)
  );

  // 7. MEETINGS (sample - first 15)
  const meetings = await db.execute(sql`
    SELECT title, start_time, is_google_synced FROM meetings ORDER BY start_time DESC LIMIT 15
  `);
  console.log('\n=== MEETINGS (showing 15 of total, ordered by latest) ===');
  meetings.rows.forEach((r: any) =>
    console.log(`  [${r.is_google_synced ? 'GOOGLE' : 'MANUAL'}] ${new Date(r.start_time).toISOString().split('T')[0]} — ${r.title?.substring(0,60)}`)
  );

  // 8. PROJECTS
  const projects = await db.execute(sql`
    SELECT name, status, lead FROM projects ORDER BY name
  `);
  console.log('\n=== PROJECTS (' + projects.rows.length + ') ===');
  projects.rows.forEach((r: any) =>
    console.log(`  [${r.status || 'active'}] lead:${r.lead || 'none'} — ${r.name}`)
  );

  // 9. INVITES
  const invites = await db.execute(sql`
    SELECT email, role, status, expires_at FROM invites ORDER BY created_at DESC
  `);
  console.log('\n=== INVITES (' + invites.rows.length + ') ===');
  invites.rows.forEach((r: any) =>
    console.log(`  [${r.status}] [${r.role}] ${r.email}`)
  );

  // 10. ATTENDANCE
  const att = await db.execute(sql`
    SELECT emp.first_name || ' ' || emp.last_name as name, a.date, a.status
    FROM attendance a LEFT JOIN employees emp ON emp.id = a.employee_id
    ORDER BY a.date DESC
  `);
  console.log('\n=== ATTENDANCE (' + att.rows.length + ') ===');
  att.rows.forEach((r: any) =>
    console.log(`  ${r.name} — ${r.date} [${r.status}]`)
  );

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
