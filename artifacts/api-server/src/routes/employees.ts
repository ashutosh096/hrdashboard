import { Router } from 'express';
import crypto from 'node:crypto';
import { db, employees, entities, entityCounters, departments, invites, tasks, taskChecklists, taskComments, taskNotes, attendance, users, notifications, googleTokens, applications, meetings, meetingAttendees, eq, or, inArray, sql } from '@workspace/db';
import { supabaseAdmin } from '../services/supabase-admin.js';
import { sendInviteEmail } from '../services/email.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Apply requireAuth to all employee endpoints
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const allEmployees = await db.select().from(employees);
    res.json(allEmployees);
  } catch (err) {
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

  try {
    const inviteToken = crypto.randomBytes(32).toString('hex');

    const result = await db.transaction(async (tx) => {
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
      const employeeCode = `${entityCode}-E${String(seq).padStart(2, '0')}`;

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

      return { newEmployee, entityCode };
    });

    const appUrl = process.env.APP_URL && !process.env.APP_URL.includes('localhost')
      ? process.env.APP_URL
      : 'https://hrdashboard-3s1m.onrender.com';
    const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

    // 1. Send via Resend Email Service & Log to server console
    await sendInviteEmail(targetEmail, inviteToken, firstName || 'Employee');

    // 2. Attempt Supabase Auth admin invite
    try {
      const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(targetEmail, {
        redirectTo: inviteLink,
      });
      if (error) {
        console.warn('[SUPABASE AUTH INVITE NOTICE]:', error.message);
      }
    } catch (e: any) {
      console.warn('[SUPABASE AUTH INVITE WARNING]:', e?.message || e);
    }

    res.status(201).json({ employee: result.newEmployee, inviteToken, inviteLink });
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

      // 3. Delete applications where employee is applicant or reviewer
      await tx.delete(applications).where(
        or(eq(applications.employeeId, id), eq(applications.reviewedBy, id))
      );

      // 4. Delete meeting attendees & meetings organized by employee
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

      // 5. Delete attendance records
      await tx.delete(attendance).where(eq(attendance.employeeId, id));

      // 6. Delete invites
      if (emp.email) {
        await tx.delete(invites).where(or(eq(invites.employeeId, id), eq(invites.email, emp.email)));
      } else {
        await tx.delete(invites).where(eq(invites.employeeId, id));
      }

      // 7. Delete employee record
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

export default router;
