import { Router } from 'express';
import crypto from 'node:crypto';
import { db, employees, entities, entityCounters, departments, invites, tasks, taskChecklists, taskComments, taskNotes, taskTemplates, sprints, epics, initiatives, attendance, users, notifications, googleTokens, applications, meetings, meetingAttendees, eq, or, inArray, sql } from '@workspace/db';
import bcrypt from 'bcryptjs';
import { sendInviteEmail } from '../services/email.js';
import { supabaseAdmin } from '../services/supabase-admin.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Apply requireAuth to all employee endpoints
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [empList, userList, inviteList, deptList] = await Promise.all([
      db.select().from(employees),
      db.select({ email: users.email, role: users.role, employeeId: users.employeeId }).from(users),
      db.select({ email: invites.email, role: invites.role, employeeId: invites.employeeId }).from(invites),
      db.select().from(departments),
    ]);

    const userMapByEmpId = new Map<string, string>();
    const userMapByEmail = new Map<string, string>();
    userList.forEach((u) => {
      if (u.employeeId) userMapByEmpId.set(u.employeeId, u.role);
      if (u.email) userMapByEmail.set(u.email.toLowerCase().trim(), u.role);
    });

    const inviteMapByEmpId = new Map<string, string>();
    const inviteMapByEmail = new Map<string, string>();
    inviteList.forEach((inv) => {
      if (inv.employeeId) inviteMapByEmpId.set(inv.employeeId, inv.role);
      if (inv.email) inviteMapByEmail.set(inv.email.toLowerCase().trim(), inv.role);
    });

    const deptMap = new Map<string, string>();
    deptList.forEach((d) => {
      deptMap.set(d.id, d.name);
    });

    const result = empList.map((emp) => {
      const emailLower = (emp.email || '').toLowerCase().trim();
      const userRole = userMapByEmpId.get(emp.id) || userMapByEmail.get(emailLower);
      const inviteRole = inviteMapByEmpId.get(emp.id) || inviteMapByEmail.get(emailLower);

      let resolvedRole = userRole || inviteRole;
      if (!resolvedRole) {
        if (emailLower === 'admin@example.com' || emailLower.startsWith('admin@')) {
          resolvedRole = 'ADMIN';
        } else if (emp.employeeCode && (emp.employeeCode.includes('-MGR') || emp.employeeCode.includes('MGR'))) {
          resolvedRole = 'MANAGER';
        } else {
          resolvedRole = 'EMPLOYEE';
        }
      }

      return {
        ...emp,
        role: resolvedRole,
        departmentName: deptMap.get(emp.departmentId) || 'Engineering',
      };
    });

    res.json(result);
  } catch (err) {
    console.error('[GET EMPLOYEES ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

// Enforce ADMIN and MANAGER role for creating employees
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { firstName, lastName, email, personalEmail, entityId, departmentId, designation, salary, joiningDate, role } = req.body;
  const targetEmail = (email || personalEmail || '').toLowerCase().trim();

  if (!targetEmail) {
    return res.status(400).json({ message: 'At least one email (Work or Personal) is required.' });
  }

  // Pre-validate if employee with targetEmail already exists in database
  const [existingEmp] = await db
    .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName })
    .from(employees)
    .where(eq(employees.email, targetEmail));

  if (existingEmp) {
    return res.status(400).json({
      message: `An employee with email "${targetEmail}" already exists (${existingEmp.firstName} ${existingEmp.lastName}). Please use a unique email or delete the existing record first.`,
    });
  }

  try {
    const inviteToken = crypto.randomBytes(32).toString('hex');

    const result = await db.transaction(async (tx) => {
      // Delete any stale invites for this target email
      await tx.delete(invites).where(eq(invites.email, targetEmail));
      // 1. Fetch entityCode dynamically from entities table by entityId
      let targetEntityId = entityId;
      if (!targetEntityId) {
        const [firstEntity] = await tx.select({ id: entities.id }).from(entities).limit(1);
        targetEntityId = firstEntity?.id;
      }

      const [entity] = await tx
        .select({ code: entities.code })
        .from(entities)
        .where(eq(entities.id, targetEntityId));

      if (!entity) {
        throw new Error(`Entity not found for ID: ${targetEntityId}`);
      }

      const entityCode = entity.code; // "EHM" or "CAG"

      // 2. Atomic sequence increment for employeeCode (e.g. EHM-EMP01)
      const [updatedCounter] = await tx
        .insert(entityCounters)
        .values({ entityId: targetEntityId, nextEmployeeSeq: 2 })
        .onConflictDoUpdate({
          target: entityCounters.entityId,
          set: { nextEmployeeSeq: sql`${entityCounters.nextEmployeeSeq} + 1` },
        })
        .returning();

      const seq = updatedCounter.nextEmployeeSeq - 1;
      const isMgr = role === 'MANAGER';
      const employeeCode = `${entityCode}-${isMgr ? 'MGR' : 'EMP'}${String(seq).padStart(2, '0')}`;

      // 3. Resolve department ID
      let targetDeptId = departmentId;
      if (!targetDeptId) {
        const [firstDept] = await tx.select({ id: departments.id }).from(departments).limit(1);
        targetDeptId = firstDept?.id;
      }

      // 4. Insert Employee
      const [newEmployee] = await tx
        .insert(employees)
        .values({
          employeeCode,
          firstName,
          lastName,
          email: targetEmail,
          entityId: targetEntityId,
          departmentId: targetDeptId,
          designation: designation || 'Specialist',
          salary: String(salary || 85000),
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        })
        .returning();

      // 5. Insert Invite record inside the same transaction
      const expiresAt = new Date(Date.now() + 7 * 86400000); // 7 days from now
      await tx
        .insert(invites)
        .values({
          email: targetEmail,
          token: inviteToken,
          role: (role as 'ADMIN' | 'MANAGER' | 'EMPLOYEE') || 'EMPLOYEE',
          employeeId: newEmployee.id,
          status: 'PENDING',
          expiresAt,
        });

      // 6. Ensure user record exists in users table linked to new employee
      const [existingUser] = await tx
        .select()
        .from(users)
        .where(eq(users.email, targetEmail));

      if (!existingUser) {
        const passwordHash = await bcrypt.hash('Employee@123', 10);
        await tx.insert(users).values({
          email: targetEmail,
          passwordHash,
          role: (role as 'ADMIN' | 'MANAGER' | 'EMPLOYEE') || 'EMPLOYEE',
          status: 'ACTIVE',
          employeeId: newEmployee.id,
        });
      } else {
        await tx
          .update(users)
          .set({ employeeId: newEmployee.id })
          .where(eq(users.email, targetEmail));
      }

      return { newEmployee, entityCode };
    });

    const appUrl = process.env.APP_URL && !process.env.APP_URL.includes('localhost')
      ? process.env.APP_URL
      : 'https://hrdashboard-3s1m.onrender.com';
    const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

    // Send invitation email via our own branded SMTP/Resend service
    let inviteEmailSuccess = false;
    let inviteEmailError: string | null = null;

    try {
      const emailResult: any = await sendInviteEmail(targetEmail, inviteToken, `${firstName} ${lastName}`);
      inviteEmailSuccess = emailResult.sent;
      if (!emailResult.sent) {
        console.warn('[INVITE EMAIL NOT SENT]:', emailResult.error);
        inviteEmailError = emailResult.error || 'Unknown error';
      } else {
        console.log(`[INVITE EMAIL SENT via ${emailResult.provider}] to`, targetEmail);
      }
    } catch (e: any) {
      console.error('[INVITE EMAIL EXCEPTION]:', e?.message || e);
      inviteEmailError = e?.message || String(e);
    }

    res.status(201).json({
      employee: result.newEmployee,
      inviteToken,
      inviteLink,
      inviteEmailResult: {
        sent: inviteEmailSuccess,
        error: inviteEmailError,
      },
    });
  } catch (err: any) {
    console.error('[EMPLOYEE CREATION ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to create employee' });
  }
});

// Enforce ADMIN and MANAGER role for deleting employees and cascading associated data
router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  try {
    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await db.transaction(async (tx) => {
      // 1. Delete associated users and user child records (notifications, googleTokens)
      const userRecords = await tx
        .select({ id: users.id })
        .from(users)
        .where(emp.email ? or(eq(users.employeeId, id), eq(users.email, emp.email)) : eq(users.employeeId, id));
      
      const userIds = userRecords.map(u => u.id);
      if (userIds.length > 0) {
        await tx.delete(notifications).where(inArray(notifications.userId, userIds));
        await tx.delete(googleTokens).where(inArray(googleTokens.userId, userIds));
      }

      if (emp.email) {
        await tx.delete(users).where(or(eq(users.employeeId, id), eq(users.email, emp.email)));
      } else {
        await tx.delete(users).where(eq(users.employeeId, id));
      }

      // 2. Find all tasks assigned to, created by, or reviewed by this employee
      const empTasks = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .where(
          or(
            eq(tasks.assigneeId, id),
            eq(tasks.creatorId, id),
            eq(tasks.reviewingLeadId, id)
          )
        );
      
      const taskIds = empTasks.map(t => t.id);

      // Clean up checklists, comments, notes referencing these tasks or this employee
      await tx.delete(taskChecklists).where(
        taskIds.length > 0
          ? or(eq(taskChecklists.completedBy, id), inArray(taskChecklists.taskId, taskIds))
          : eq(taskChecklists.completedBy, id)
      );

      await tx.delete(taskComments).where(
        taskIds.length > 0
          ? or(eq(taskComments.authorId, id), inArray(taskComments.taskId, taskIds))
          : eq(taskComments.authorId, id)
      );

      await tx.delete(taskNotes).where(
        taskIds.length > 0
          ? or(eq(taskNotes.authorId, id), inArray(taskNotes.taskId, taskIds))
          : eq(taskNotes.authorId, id)
      );

      // Delete tasks
      if (taskIds.length > 0) {
        await tx.delete(tasks).where(inArray(tasks.id, taskIds));
      }

      // 3. Find and delete sprints owned by or reviewed by this employee
      const empSprints = await tx
        .select({ id: sprints.id })
        .from(sprints)
        .where(or(eq(sprints.employeeId, id), eq(sprints.reviewingLeadId, id)));
      
      const sprintIds = empSprints.map(s => s.id);
      if (sprintIds.length > 0) {
        // Delete tasks in these sprints
        const sprintTasks = await tx
          .select({ id: tasks.id })
          .from(tasks)
          .where(inArray(tasks.sprintId, sprintIds));
        const sprintTaskIds = sprintTasks.map(t => t.id);
        if (sprintTaskIds.length > 0) {
          await tx.delete(taskChecklists).where(inArray(taskChecklists.taskId, sprintTaskIds));
          await tx.delete(taskComments).where(inArray(taskComments.taskId, sprintTaskIds));
          await tx.delete(taskNotes).where(inArray(taskNotes.taskId, sprintTaskIds));
          await tx.delete(tasks).where(inArray(tasks.id, sprintTaskIds));
        }
        await tx.delete(sprints).where(inArray(sprints.id, sprintIds));
      }

      // 4. Unset ownerId for epics and initiatives owned by this employee
      await tx.update(epics).set({ ownerId: null }).where(eq(epics.ownerId, id));
      await tx.update(initiatives).set({ ownerId: null }).where(eq(initiatives.ownerId, id));

      // 5. Delete task templates created by this employee
      await tx.delete(taskTemplates).where(eq(taskTemplates.createdBy, id));

      // 6. Delete applications where employee is applicant or reviewer
      await tx.delete(applications).where(
        or(eq(applications.employeeId, id), eq(applications.reviewedBy, id))
      );

      // 7. Delete meeting attendees & meetings organized by employee
      await tx.delete(meetingAttendees).where(eq(meetingAttendees.employeeId, id));
      
      const empMeetings = await tx
        .select({ id: meetings.id })
        .from(meetings)
        .where(eq(meetings.organizerId, id));
      
      const meetingIds = empMeetings.map(m => m.id);
      if (meetingIds.length > 0) {
        await tx.delete(meetingAttendees).where(inArray(meetingAttendees.meetingId, meetingIds));
        await tx.delete(meetings).where(inArray(meetings.id, meetingIds));
      }

      // 8. Delete attendance records
      await tx.delete(attendance).where(eq(attendance.employeeId, id));

      // 9. Delete invites
      if (emp.email) {
        await tx.delete(invites).where(or(eq(invites.employeeId, id), eq(invites.email, emp.email)));
      } else {
        await tx.delete(invites).where(eq(invites.employeeId, id));
      }

      // 10. Delete employee record
      await tx.delete(employees).where(eq(employees.id, id));
    });

    // Try deleting from Supabase Auth admin user list if exists
    if (emp.email) {
      try {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = data?.users?.find(u => u.email?.toLowerCase() === emp.email.toLowerCase());
        if (authUser) {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        }
      } catch (e) {
        console.warn('[SUPABASE AUTH DELETE NOTICE]:', e);
      }
    }

    res.json({ message: `Employee ${emp.firstName} ${emp.lastName} deleted successfully.` });
  } catch (err: any) {
    console.error('[EMPLOYEE DELETE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete employee' });
  }
});

// Update Employee Details Route
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const { firstName, lastName, email, designation, salary, role, entityId, departmentId } = req.body;

  try {
    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const targetEmail = email ? email.toLowerCase().trim() : emp.email;

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (email !== undefined) updateData.email = targetEmail;
    if (designation !== undefined) updateData.designation = designation.trim();
    if (salary !== undefined) updateData.salary = String(salary);
    if (entityId) updateData.entityId = entityId;
    if (departmentId) updateData.departmentId = departmentId;

    const [updatedEmp] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
      .returning();

    // Update role/email in users table if exists
    if (role || email) {
      const userUpdate: any = {};
      if (role) userUpdate.role = role;
      if (email) userUpdate.email = targetEmail;
      await db.update(users).set(userUpdate).where(or(eq(users.employeeId, id), eq(users.email, emp.email)));
    }

    // Update role/email in invites table if exists
    if (role || email) {
      const inviteUpdate: any = {};
      if (role) inviteUpdate.role = role;
      if (email) inviteUpdate.email = targetEmail;
      await db.update(invites).set(inviteUpdate).where(or(eq(invites.employeeId, id), eq(invites.email, emp.email)));
    }

    return res.json({ message: 'Employee updated successfully', employee: updatedEmp });
  } catch (err: any) {
    console.error('[EMPLOYEE UPDATE ERROR]:', err);
    return res.status(500).json({ message: err.message || 'Failed to update employee' });
  }
});

// Re-invite Employee Route (Resends invitation email using exact same flow as creation)
router.post('/:id/reinvite', requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

  try {
    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const targetEmail = emp.email.toLowerCase().trim();
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 86400000); // 7 days

    // Look up existing user role or invite role
    const [userRow] = await db.select().from(users).where(or(eq(users.employeeId, id), eq(users.email, targetEmail)));
    const [inviteRow] = await db.select().from(invites).where(or(eq(invites.employeeId, id), eq(invites.email, targetEmail)));
    const empRole = userRow?.role || inviteRow?.role || 'EMPLOYEE';

    // Delete existing invite rows for this email/employee
    await db.delete(invites).where(or(eq(invites.employeeId, id), eq(invites.email, targetEmail)));

    // Insert new invite record
    await db.insert(invites).values({
      email: targetEmail,
      token: inviteToken,
      role: empRole,
      employeeId: emp.id,
      status: 'PENDING',
      expiresAt,
    });

    const appUrl = process.env.APP_URL && !process.env.APP_URL.includes('localhost')
      ? process.env.APP_URL
      : 'https://hrdashboard-3s1m.onrender.com';
    const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

    // Send invitation email via branded email service (same flow as creation)
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const emailResult: any = await sendInviteEmail(targetEmail, inviteToken, `${emp.firstName} ${emp.lastName}`);
      emailSent = emailResult.sent;
      if (!emailResult.sent) {
        emailError = emailResult.error || 'Email send failed';
      }
    } catch (e: any) {
      emailError = e?.message || String(e);
    }

    // Also attempt Supabase Auth admin invitation if configured
    try {
      const redirectUrl = `${appUrl}/accept-invite?token=${inviteToken}`;
      await supabaseAdmin.auth.admin.inviteUserByEmail(targetEmail, {
        redirectTo: redirectUrl,
        data: { role: empRole, employeeId: emp.id, inviteToken },
      });
    } catch (sbErr) {
      console.warn('[SUPABASE RE-INVITE NOTICE]:', sbErr);
    }

    return res.json({
      message: `Invitation email resent successfully to ${targetEmail}!`,
      sent: emailSent,
      error: emailError,
      inviteLink,
    });
  } catch (err: any) {
    console.error('[EMPLOYEE RE-INVITE ERROR]:', err);
    return res.status(500).json({ message: err.message || 'Failed to resend invitation' });
  }
});

export default router;
