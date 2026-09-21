import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import {
  db,
  employees,
  entities,
  entityCounters,
  departments,
  invites,
  tasks,
  taskChecklists,
  taskComments,
  taskNotes,
  taskTemplates,
  sprints,
  epics,
  initiatives,
  users,
  notifications,
  googleTokens,
  applications,
  meetings,
  meetingAttendees,
  auditLogs,
  eq,
  or,
  inArray,
  sql,
} from '@workspace/db';
import bcrypt from 'bcryptjs';
import { sendInviteEmail } from '../services/email.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

async function logAudit(userId: string | null | undefined, action: string, details: any) {
  try {
    await db.insert(auditLogs).values({
      userId: userId || null,
      action,
      details,
    });
  } catch (err) {
    console.error('[AUDIT LOG ERROR]:', err);
  }
}

// GET /api/employees - Exclude sensitive salary information
router.get('/', async (req: Request, res: Response) => {
  try {
    const empList = await db.select().from(employees);

    const [userList, inviteList, deptList] = await Promise.all([
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

      // Explicitly omit salary field
      const { salary: _omitSalary, ...safeEmp } = emp;

      return {
        ...safeEmp,
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

// POST /api/employees - Enforce ADMIN / MANAGER RBAC
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  const { firstName, lastName, email, personalEmail, entityId, departmentId, designation, joiningDate, role } = req.body;
  const targetEmail = (email || personalEmail || '').toLowerCase().trim();

  if (!targetEmail) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  const requestedRole = (role as string || 'EMPLOYEE').toUpperCase();
  const callerRole = ((req as any).user?.role || '').toUpperCase();
  const callerId = (req as any).user?.id;

  if (requestedRole === 'ADMIN' && callerRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Only Admins can assign the Admin role.' });
  }

  if (callerRole === 'MANAGER' && requestedRole !== 'EMPLOYEE') {
    return res.status(403).json({ message: 'Managers can only create employee accounts.' });
  }

  const [existingEmp] = await db
    .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName })
    .from(employees)
    .where(eq(employees.email, targetEmail));

  if (existingEmp) {
    return res.status(400).json({
      message: `An employee with email "${targetEmail}" already exists (${existingEmp.firstName} ${existingEmp.lastName}).`,
    });
  }

  try {
    const inviteToken = crypto.randomBytes(32).toString('hex');

    const result = await db.transaction(async (tx) => {
      await tx.delete(invites).where(eq(invites.email, targetEmail));

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

      const entityCode = entity.code;
      const isMgr = requestedRole === 'MANAGER';
      const prefix = `${entityCode}-${isMgr ? 'MGR' : 'EMP'}`;

      const allExisting = await tx
        .select({ employeeCode: employees.employeeCode })
        .from(employees)
        .where(eq(employees.entityId, targetEntityId));

      let maxNum = 0;
      for (const e of allExisting) {
        if (e.employeeCode && e.employeeCode.startsWith(prefix)) {
          const numPart = parseInt(e.employeeCode.slice(prefix.length), 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        }
      }

      const seq = maxNum + 1;
      const employeeCode = `${prefix}${String(seq).padStart(2, '0')}`;

      await tx
        .insert(entityCounters)
        .values({ entityId: targetEntityId, nextEmployeeSeq: seq + 1 })
        .onConflictDoUpdate({
          target: entityCounters.entityId,
          set: { nextEmployeeSeq: seq + 1 },
        });

      let targetDeptId = departmentId;
      if (!targetDeptId) {
        const [firstDept] = await tx.select({ id: departments.id }).from(departments).limit(1);
        targetDeptId = firstDept?.id;
      }

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
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        })
        .returning();

      const expiresAt = new Date(Date.now() + 7 * 86400000);
      await tx
        .insert(invites)
        .values({
          email: targetEmail,
          token: inviteToken,
          role: (requestedRole as 'ADMIN' | 'MANAGER' | 'EMPLOYEE') || 'EMPLOYEE',
          employeeId: newEmployee.id,
          status: 'PENDING',
          expiresAt,
        });

      const [existingUser] = await tx
        .select()
        .from(users)
        .where(eq(users.email, targetEmail));

      if (!existingUser) {
        const randomSecret = crypto.randomBytes(32).toString('hex');
        const passwordHash = await bcrypt.hash(randomSecret, 10);
        await tx.insert(users).values({
          email: targetEmail,
          passwordHash,
          role: (requestedRole as 'ADMIN' | 'MANAGER' | 'EMPLOYEE') || 'EMPLOYEE',
          status: 'PENDING',
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

    await logAudit(callerId, 'EMPLOYEE_CREATED', {
      employeeId: result.newEmployee.id,
      email: targetEmail,
      role: requestedRole,
    });

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

    let inviteEmailSuccess = false;
    let inviteEmailError: string | null = null;

    try {
      const emailResult: any = await sendInviteEmail(targetEmail, inviteToken, `${firstName} ${lastName}`);
      inviteEmailSuccess = emailResult?.sent || false;
      if (!emailResult?.sent) {
        inviteEmailError = emailResult?.error || 'Email delivery failed';
      }
    } catch (e: any) {
      inviteEmailError = e?.message || String(e);
    }

    const { salary: _omit, ...safeCreatedEmp } = result.newEmployee;

    res.status(201).json({
      employee: safeCreatedEmp,
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

// DELETE /api/employees/:id - Strict ADMIN ONLY
router.delete('/:id', requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const callerUser = (req as any).user;

  try {
    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Protect against self-deletion
    if (callerUser?.employeeId === id || callerUser?.email?.toLowerCase() === emp.email?.toLowerCase()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    // Check if target is an Admin
    const [targetUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(or(eq(users.employeeId, id), eq(users.email, emp.email)));

    if (targetUser?.role === 'ADMIN' && callerUser?.email !== 'admin@example.com') {
      return res.status(403).json({ message: 'Only the primary administrator can delete admin accounts.' });
    }

    await db.transaction(async (tx) => {
      const userRecords = await tx
        .select({ id: users.id })
        .from(users)
        .where(emp.email ? or(eq(users.employeeId, id), eq(users.email, emp.email)) : eq(users.employeeId, id));

      const userIds = userRecords.map((u) => u.id);
      if (userIds.length > 0) {
        await tx.delete(notifications).where(inArray(notifications.userId, userIds));
        await tx.delete(googleTokens).where(inArray(googleTokens.userId, userIds));
      }

      if (emp.email) {
        await tx.delete(users).where(or(eq(users.employeeId, id), eq(users.email, emp.email)));
      } else {
        await tx.delete(users).where(eq(users.employeeId, id));
      }

      // Reassign or clean up tasks
      const empTasks = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .where(or(eq(tasks.assigneeId, id), eq(tasks.creatorId, id), eq(tasks.reviewingLeadId, id)));

      const taskIds = empTasks.map((t) => t.id);

      if (taskIds.length > 0) {
        await tx.delete(taskChecklists).where(inArray(taskChecklists.taskId, taskIds));
        await tx.delete(taskComments).where(inArray(taskComments.taskId, taskIds));
        await tx.delete(taskNotes).where(inArray(taskNotes.taskId, taskIds));
        await tx.delete(tasks).where(inArray(tasks.id, taskIds));
      }

      await tx.delete(taskTemplates).where(eq(taskTemplates.createdBy, id));
      await tx.delete(applications).where(or(eq(applications.employeeId, id), eq(applications.reviewedBy, id)));
      await tx.delete(meetingAttendees).where(eq(meetingAttendees.employeeId, id));
      await tx.delete(meetings).where(eq(meetings.organizerId, id));

      if (emp.email) {
        await tx.delete(invites).where(or(eq(invites.employeeId, id), eq(invites.email, emp.email)));
      } else {
        await tx.delete(invites).where(eq(invites.employeeId, id));
      }

      await tx.delete(employees).where(eq(employees.id, id));
    });

    await logAudit(callerUser?.id, 'EMPLOYEE_DELETED', {
      employeeId: id,
      deletedEmail: emp.email,
      name: `${emp.firstName} ${emp.lastName}`,
    });

    res.json({ message: `Employee ${emp.firstName} ${emp.lastName} deleted successfully.` });
  } catch (err: any) {
    console.error('[EMPLOYEE DELETE ERROR]:', err);
    res.status(500).json({ message: err.message || 'Failed to delete employee' });
  }
});

// PUT /api/employees/:id - Update Employee Details (Strict Role Check)
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const { firstName, lastName, email, designation, role, entityId, departmentId } = req.body;
  const callerUser = (req as any).user;
  const callerRole = (callerUser?.role || '').toUpperCase();

  try {
    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Role Escalation Protection: Only ADMIN can change roles
    if (role && callerRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Only administrators can update employee roles.' });
    }

    // Managers cannot edit Admin profiles
    const [targetUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(or(eq(users.employeeId, id), eq(users.email, emp.email)));

    if (targetUser?.role === 'ADMIN' && callerRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Managers cannot modify administrator accounts.' });
    }

    const targetEmail = email ? email.toLowerCase().trim() : emp.email;

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (email !== undefined) updateData.email = targetEmail;
    if (designation !== undefined) updateData.designation = designation.trim();
    if (entityId) updateData.entityId = entityId;
    if (departmentId) updateData.departmentId = departmentId;

    const [updatedEmp] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
      .returning();

    if (role || email) {
      const userUpdate: any = {};
      if (role && callerRole === 'ADMIN') userUpdate.role = role;
      if (email) userUpdate.email = targetEmail;
      await db.update(users).set(userUpdate).where(or(eq(users.employeeId, id), eq(users.email, emp.email)));
    }

    if (role || email) {
      const inviteUpdate: any = {};
      if (role && callerRole === 'ADMIN') inviteUpdate.role = role;
      if (email) inviteUpdate.email = targetEmail;
      await db.update(invites).set(inviteUpdate).where(or(eq(invites.employeeId, id), eq(invites.email, emp.email)));
    }

    await logAudit(callerUser?.id, 'EMPLOYEE_UPDATED', {
      employeeId: id,
      updatedFields: Object.keys(updateData),
      newRole: role || undefined,
    });

    const { salary: _omit, ...safeUpdatedEmp } = updatedEmp;
    return res.json({ message: 'Employee updated successfully', employee: safeUpdatedEmp });
  } catch (err: any) {
    console.error('[EMPLOYEE UPDATE ERROR]:', err);
    return res.status(500).json({ message: err.message || 'Failed to update employee' });
  }
});

// POST /api/employees/:id/reinvite - Branded reinvite
router.post('/:id/reinvite', requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

  try {
    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const targetEmail = emp.email.toLowerCase().trim();
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 86400000);

    const [userRow] = await db.select().from(users).where(or(eq(users.employeeId, id), eq(users.email, targetEmail)));
    const [inviteRow] = await db.select().from(invites).where(or(eq(invites.employeeId, id), eq(invites.email, targetEmail)));
    const empRole = userRow?.role || inviteRow?.role || 'EMPLOYEE';

    await db.delete(invites).where(or(eq(invites.employeeId, id), eq(invites.email, targetEmail)));

    await db.insert(invites).values({
      email: targetEmail,
      token: inviteToken,
      role: empRole,
      employeeId: emp.id,
      status: 'PENDING',
      expiresAt,
    });

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

    let emailSent = false;
    let emailError: string | null = null;

    try {
      const emailResult: any = await sendInviteEmail(targetEmail, inviteToken, `${emp.firstName} ${emp.lastName}`);
      emailSent = emailResult?.sent || false;
      if (!emailResult?.sent) {
        emailError = emailResult?.error || 'Email send failed';
      }
    } catch (e: any) {
      emailError = e?.message || String(e);
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
