import { db, sql } from '@workspace/db';

async function diagnose() {
  // Query users for Ashutosh Mishra and Harshit Mishra
  const users = await db.execute(sql`
    SELECT u.id as user_id, u.email, u.role, u.employee_id, e.first_name, e.last_name 
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE e.last_name ILIKE '%Mishra%' OR u.email ILIKE '%mishra%';
  `);
  // console.log('=== USERS ===');
  // console.log(JSON.stringify(users.rows, null, 2));

  // Check invalid/orphan notifications across the database
  const invalidNotifsQuery = await db.execute(sql`
    WITH notif_entities AS (
      SELECT 
        n.id as notification_id,
        n.user_id,
        n.type,
        n.created_at,
        n.payload->>'entityType' as entity_type,
        n.payload->>'entityId' as entity_id,
        u.role as user_role,
        u.employee_id as user_emp_id
      FROM notifications n
      JOIN users u ON n.user_id = u.id
    )
    SELECT 
      ne.*,
      t.assignee_id as task_assignee_id,
      t.assignee_ids as task_assignee_ids,
      t.reviewing_lead_id as task_lead_id,
      t.reviewing_lead_ids as task_lead_ids,
      s.employee_id as sprint_assignee_id,
      s.reviewing_lead_id as sprint_lead_id,
      e.owner_id as epic_owner_id,
      i.owner_id as init_owner_id,
      p.lead as proj_lead,
      p.team as proj_team
    FROM notif_entities ne
    LEFT JOIN tasks t ON ne.entity_type = 'TASK' AND ne.entity_id = t.id::text
    LEFT JOIN sprints s ON ne.entity_type = 'SPRINT' AND ne.entity_id = s.id::text
    LEFT JOIN epics e ON ne.entity_type = 'EPIC' AND ne.entity_id = e.id::text
    LEFT JOIN initiatives i ON ne.entity_type = 'INITIATIVE' AND ne.entity_id = i.id::text
    LEFT JOIN projects p ON ne.entity_type = 'PROJECT' AND ne.entity_id = p.id::text;
  `);

  const invalidRows: any[] = [];
  for (const row of invalidNotifsQuery.rows as any[]) {
    const { entity_type, user_role, user_emp_id } = row;
    if (!entity_type) continue; // announcements or system

    if (['INITIATIVE', 'EPIC', 'PROJECT'].includes(entity_type)) {
      if (user_role === 'ADMIN') continue; // Admins are allowed for high-level
    }

    let isAssigneeOrReviewer = false;
    if (entity_type === 'TASK') {
      const assignees = [row.task_assignee_id, ...(row.task_assignee_ids || [])].filter(Boolean);
      const leads = [row.task_lead_id, ...(row.task_lead_ids || [])].filter(Boolean);
      if (assignees.includes(user_emp_id) || leads.includes(user_emp_id)) {
        isAssigneeOrReviewer = true;
      }
    } else if (entity_type === 'SPRINT') {
      const assignees = [row.sprint_assignee_id].filter(Boolean);
      const leads = [row.sprint_lead_id].filter(Boolean);
      if (assignees.includes(user_emp_id) || leads.includes(user_emp_id)) {
        isAssigneeOrReviewer = true;
      }
    } else if (entity_type === 'EPIC') {
      if (row.epic_owner_id === user_emp_id) isAssigneeOrReviewer = true;
    } else if (entity_type === 'INITIATIVE') {
      if (row.init_owner_id === user_emp_id) isAssigneeOrReviewer = true;
    } else if (entity_type === 'PROJECT') {
      const team = Array.isArray(row.proj_team) ? row.proj_team : [];
      if (row.proj_lead === user_emp_id || team.includes(user_emp_id)) isAssigneeOrReviewer = true;
    }

    if (!isAssigneeOrReviewer) {
      invalidRows.push(row);
    }
  }

  console.log('=== INVALID / ORPHAN NOTIFICATIONS COUNT ===', invalidRows.length);
  console.log('=== INVALID NOTIFICATION IDS ===', invalidRows.map(r => ({ id: r.notification_id, type: r.type, user_id: r.user_id, created_at: r.created_at })));

  // Check if any user points to a non-existent or wrong employee
  const wrongEmp = await db.execute(sql`
    SELECT u.id as user_id, u.email, u.employee_id, e.id as matched_emp_id, e.first_name, e.last_name, e.email as emp_email
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.employee_id IS NOT NULL AND (e.id IS NULL OR LOWER(u.email) != LOWER(e.email));
  `);
  console.log('=== USERS POINTING TO WRONG/MISMATCHED EMPLOYEES ===');
  console.log(JSON.stringify(wrongEmp.rows, null, 2));

  // 1b. Sprint row for SPRT0047
  const sprint = await db.execute(sql`
    SELECT id, sprint_code, name, employee_id, reviewing_lead_id, created_by_id, created_at, status
    FROM sprints
    WHERE sprint_code = 'SPRT0047' OR name ILIKE '%Katyayani%';
  `);
  console.log('=== SPRINT SPRT0047 ===');
  console.log(JSON.stringify(sprint.rows, null, 2));

  // 1b. Task row for STSK0031
  const task = await db.execute(sql`
    SELECT id, task_code, title, assignee_id, assignee_ids, reviewing_lead_id, reviewing_lead_ids, sprint_id, created_by_id, created_at, status
    FROM tasks
    WHERE task_code = 'STSK0031' OR title ILIKE '%Katyayani%';
  `);
  // Test resolve and getRecipients
  const { resolveUserIdsFromEmployeeIds, resolveUserIdFromEmployeeId } = await import('../artifacts/api-server/src/utils/userResolver.js');
  const { getRecipients } = await import('../artifacts/api-server/src/services/recipientService.js');
  const a = await resolveUserIdsFromEmployeeIds(['1e32f27a-d641-40ff-923c-05fef4836c10']);
  console.log('Simulation resolved assigneeUserIds:', a);
  const r = getRecipients(
    {
      entityType: 'SPRINT',
      entityId: 'f6955a88-e96e-430f-8184-36535d3edf5a',
      assigneeUserIds: a,
      reviewingLeadUserId: null,
      creatorUserId: a[0],
      taggedUserIds: [],
      previousAssigneeUserIds: [],
      adminUserIds: ['c20f5e78-aa5b-49ea-9a01-f69f34d91fb7'],
    },
    'fa0289e6-0109-4228-9f3d-f54b7164773c',
    'SPRINT_ASSIGNED'
  );
  console.log('Simulation getRecipients for SPRINT_ASSIGNED:', r);

  // Check all notifications where Ashutosh Mishra was recipient
  const ashutoshNotifs = await db.execute(sql`
    SELECT id, type, created_at, payload
    FROM notifications
    WHERE user_id = 'c20f5e78-aa5b-49ea-9a01-f69f34d91fb7'
    ORDER BY created_at DESC
    LIMIT 10;
  `);
  console.log('=== RECENT NOTIFICATIONS FOR ASHUTOSH MISHRA ===');
  console.log(JSON.stringify(ashutoshNotifs.rows, null, 2));
  // Timezone check
  const tz = await db.execute(sql`
    SELECT NOW(), NOW() at time zone 'UTC' as utc, NOW() at time zone 'Asia/Kolkata' as ist;
  `);
  console.log('=== TIMEZONE ===');
  console.log(JSON.stringify(tz.rows, null, 2));

  // Check how many users exist and who has which employeeId
  const allUsersWithEmp = await db.execute(sql`
    SELECT u.id as user_id, u.email, u.role, u.status, u.employee_id, e.first_name, e.last_name
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    ORDER BY u.created_at DESC;
  `);
  // console.log('=== ALL USERS WITH EMP ===');
  // console.log(JSON.stringify(allUsersWithEmp.rows, null, 2));
}

diagnose()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

