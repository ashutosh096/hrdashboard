import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import {
  db,
  employees,
  entities,
  entityCounters,
  generateNextGlobalCode,
  generateEmployeeCode,
  employeeCodeHistory,
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
  attendance,
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

// GET /api/employees - Exclude sensitive salary information & support code history search
router.get('/', async (req: Request, res: Response) => {
  try {
    const empList = await db.select().from(employees);

    const [userList, inviteList, deptList, entityList, historyList] = await Promise.all([
      db.select({ email: users.email, role: users.role, employeeId: users.employeeId }).from(users),
      db.select({ email: invites.email, role: invites.role, employeeId: invites.employeeId }).from(invites),
      db.select().from(departments),
      db.select().from(entities),
      db.select().from(employeeCodeHistory),
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

    const entityMap = new Map<string, { code: string; name: string }>();
    entityList.forEach((e) => {
      entityMap.set(e.id, { code: e.code, name: e.name });
    });

    const historyMap = new Map<string, string[]>();
    historyList.forEach((h) => {
      const arr = historyMap.get(h.employeeId) || [];
      if (h.oldCode && !arr.includes(h.oldCode)) {
        arr.push(h.oldCode);
      }
      historyMap.set(h.employeeId, arr);
    });

    let result = empList.map((emp) => {
      const emailLower = (emp.email || '').toLowerCase().trim();
      const userRole = userMapByEmpId.get(emp.id) || userMapByEmail.get(emailLower);
      const inviteRole = inviteMapByEmpId.get(emp.id) || inviteMapByEmail.get(emailLower);

      const resolvedRole = userRole || inviteRole || 'EMPLOYEE';

      // Explicitly omit salary field
      const { salary: _omitSalary, ...safeEmp } = emp;

      const ent = entityMap.get(emp.entityId);
      const entityCode = ent?.code || 'EHM';
      const previousCodes = historyMap.get(emp.id) || [];

      return {
        ...safeEmp,
        role: resolvedRole,
        entityCode,
        entityName: ent?.name,
        departmentName: deptMap.get(emp.departmentId) || 'Product & Tech',
        previousCodes,
      };
    });

    const searchQuery = ((req.query.search || req.query.q) as string || '').toLowerCase().trim();
    if (searchQuery) {
      result = result.filter((e) => {
        const fullName = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
        const code = (e.employeeCode || '').toLowerCase();
        const email = (e.email || '').toLowerCase();
        const matchedOldCode = e.previousCodes.some((oldC) => oldC.toLowerCase().includes(searchQuery));
        return (
          fullName.includes(searchQuery) ||
          code.includes(searchQuery) ||
          email.includes(searchQuery) ||
          matchedOldCode
        );
      });
    }

    result.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });

    res.json(result);
  } catch (err) {
    console.error('[GET EMPLOYEES ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

// POST /api/employees - Enforce ADMIN / MANAGER RBAC
router.post('/', requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  const { firstName, lastName, email, personalEmail, entityId, entityCode, departmentId, departmentName, designation, joiningDate, role } = req.body;
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
      if (!targetEntityId && entityCode) {
        const allEnts = await tx.select().from(entities);
        const cleanCode = entityCode.toUpperCase().trim();
        let matchedEnt = allEnts.find(e =>
          e.code.toUpperCase() === cleanCode ||
          (cleanCode === 'COMMON' && (e.code.toUpperCase() === 'COM' || e.code.toUpperCase() === 'COMMON')) ||
          (cleanCode === 'CAG' && (e.code.toUpperCase() === 'CAG' || e.code.toUpperCase() === 'CLIMAGRO')) ||
          e.name.toLowerCase().includes(entityCode.toLowerCase())
        );
        if (!matchedEnt && (cleanCode === 'COMMON' || cleanCode === 'COM')) {
          const [newEnt] = await tx.insert(entities).values({
            code: 'COMMON',
            name: 'EHM & CLIMAGRO (COMMON)',
          }).returning();
          matchedEnt = newEnt;
        }
        targetEntityId = matchedEnt?.id;
      }
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

      const employeeCode = await generateEmployeeCode(requestedRole, tx);

      let targetDeptId = departmentId;
      if (!targetDeptId && departmentName) {
        const allDepts = await tx.select().from(departments);
        const cleanName = departmentName.toLowerCase().trim();
        const matched = allDepts.find(d =>
          d.name.toLowerCase().trim() === cleanName ||
          (cleanName.includes('market') && d.name.toLowerCase().includes('market')) ||
          (cleanName.includes('product') && d.name.toLowerCase().includes('product')) ||
          (cleanName.includes('tech') && d.name.toLowerCase().includes('tech')) ||
          (cleanName.includes('eng') && d.name.toLowerCase().includes('eng')) ||
          (cleanName.includes('operat') && d.name.toLowerCase().includes('operat')) ||
          (cleanName.includes('sale') && d.name.toLowerCase().includes('sale')) ||
          (cleanName.includes('hr') && d.name.toLowerCase().includes('human')) ||
          (cleanName.includes('finan') && d.name.toLowerCase().includes('finan'))
        );
        if (matched) {
          targetDeptId = matched.id;
        } else {
          const deptCode = (departmentName.trim().slice(0, 3) || 'GEN').toUpperCase();
          const [newDept] = await tx.insert(departments).values({
            name: departmentName.trim(),
            code: deptCode,
            entityId: targetEntityId,
          }).returning();
          targetDeptId = newDept.id;
        }
      } else if (!targetDeptId) {
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

    if (targetUser?.role === 'ADMIN' && callerUser?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only an administrator can delete admin accounts.' });
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

      // 3. Clean up sprints owned or reviewed by this employee
      const empSprints = await tx
        .select({ id: sprints.id })
        .from(sprints)
        .where(or(eq(sprints.employeeId, id), eq(sprints.reviewingLeadId, id)));
      const sprintIds = empSprints.map((s) => s.id);
      if (sprintIds.length > 0) {
        const sprintTasks = await tx.select({ id: tasks.id }).from(tasks).where(inArray(tasks.sprintId, sprintIds));
        const sprintTaskIds = sprintTasks.map((t) => t.id);
        if (sprintTaskIds.length > 0) {
          await tx.delete(taskChecklists).where(inArray(taskChecklists.taskId, sprintTaskIds));
          await tx.delete(taskComments).where(inArray(taskComments.taskId, sprintTaskIds));
          await tx.delete(taskNotes).where(inArray(taskNotes.taskId, sprintTaskIds));
          await tx.delete(tasks).where(inArray(tasks.id, sprintTaskIds));
        }
        await tx.delete(sprints).where(inArray(sprints.id, sprintIds));
      }

      // 4. Unset ownership in epics and initiatives
      await tx.update(epics).set({ ownerId: null }).where(eq(epics.ownerId, id));
      await tx.update(initiatives).set({ ownerId: null }).where(eq(initiatives.ownerId, id));

      await tx.delete(taskTemplates).where(eq(taskTemplates.createdBy, id));
      await tx.delete(attendance).where(eq(attendance.employeeId, id));
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
  const { firstName, lastName, email, designation, role, entityId, entityCode, departmentId, departmentName } = req.body;
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

    let targetEntityId = entityId;
    if (!targetEntityId && entityCode) {
      const allEnts = await db.select().from(entities);
      const cleanCode = entityCode.toUpperCase().trim();
      let matchedEnt = allEnts.find(e =>
        e.code.toUpperCase() === cleanCode ||
        (cleanCode === 'COMMON' && (e.code.toUpperCase() === 'COM' || e.code.toUpperCase() === 'COMMON')) ||
        (cleanCode === 'CAG' && (e.code.toUpperCase() === 'CAG' || e.code.toUpperCase() === 'CLIMAGRO')) ||
        e.name.toLowerCase().includes(entityCode.toLowerCase())
      );
      if (!matchedEnt && (cleanCode === 'COMMON' || cleanCode === 'COM')) {
        const [newEnt] = await db.insert(entities).values({
          code: 'COMMON',
          name: 'EHM & CLIMAGRO (COMMON)',
        }).returning();
        matchedEnt = newEnt;
      }
      if (matchedEnt) targetEntityId = matchedEnt.id;
    }
    if (targetEntityId) updateData.entityId = targetEntityId;

    const finalEntityId = targetEntityId || emp.entityId;
    const [finalEntity] = await db.select().from(entities).where(eq(entities.id, finalEntityId));
    const finalEntityCode = finalEntity?.code || (entityCode?.toUpperCase() === 'CAG' ? 'CAG' : entityCode?.toUpperCase() === 'COMMON' ? 'COMMON' : 'EHM');

    let targetDeptId = departmentId;
    if (!targetDeptId && departmentName) {
      const allDepts = await db.select().from(departments);
      const cleanName = departmentName.toLowerCase().trim();
      const matched = allDepts.find(d =>
        d.name.toLowerCase().trim() === cleanName ||
        (cleanName.includes('market') && d.name.toLowerCase().includes('market')) ||
        (cleanName.includes('sale') && d.name.toLowerCase().includes('sale')) ||
        (cleanName.includes('tech') && d.name.toLowerCase().includes('tech')) ||
        (cleanName.includes('product') && d.name.toLowerCase().includes('product')) ||
        (cleanName.includes('operat') && d.name.toLowerCase().includes('operat')) ||
        (cleanName.includes('grant') && d.name.toLowerCase().includes('grant')) ||
        (cleanName.includes('govern') && d.name.toLowerCase().includes('govern'))
      );
      if (matched) {
        targetDeptId = matched.id;
      } else {
        const deptCode = (departmentName.trim().slice(0, 3) || 'GEN').toUpperCase();
        const [newDept] = await db.insert(departments).values({
          name: departmentName.trim(),
          code: deptCode,
          entityId: finalEntityId,
        }).returning();
        targetDeptId = newDept.id;
      }
    }
    if (targetDeptId) updateData.departmentId = targetDeptId;

    // Execute role change, code generation, code history and employee update in ONE atomic transaction
    const txResult = await db.transaction(async (tx) => {
      // Determine current stored role strictly from users.role (then invites.role, then EMPLOYEE)
      const [userRow] = await tx
        .select({ role: users.role })
        .from(users)
        .where(or(eq(users.employeeId, id), eq(users.email, emp.email)));

      const [inviteRow] = await tx
        .select({ role: invites.role })
        .from(invites)
        .where(or(eq(invites.employeeId, id), eq(invites.email, emp.email)));

      const currentRole = ((userRow?.role || inviteRow?.role || 'EMPLOYEE') as string).toUpperCase().trim();
      const requestedNewRole = role ? (role as string).toUpperCase().trim() : null;

      // Role change occurs ONLY if an admin requests a new role different from currentRole
      const isRoleChange = Boolean(requestedNewRole && requestedNewRole !== currentRole && callerRole === 'ADMIN');
      const effectiveRole = requestedNewRole && callerRole === 'ADMIN' ? requestedNewRole : currentRole;

      let newGeneratedCode: string | undefined = undefined;

      if (isRoleChange && requestedNewRole) {
        // Generate new code from the appropriate role counter (ADMN, MANA, TEAM)
        newGeneratedCode = await generateEmployeeCode(requestedNewRole, tx);
        updateData.employeeCode = newGeneratedCode;

        // Update users.role
        await tx.update(users).set({ role: requestedNewRole as any }).where(or(eq(users.employeeId, id), eq(users.email, emp.email)));
        // Update invites.role
        await tx.update(invites).set({ role: requestedNewRole as any }).where(or(eq(invites.employeeId, id), eq(invites.email, emp.email)));

        // Insert row in employee_code_history
        await tx.insert(employeeCodeHistory).values({
          employeeId: id,
          oldCode: emp.employeeCode,
          newCode: newGeneratedCode,
          oldRole: currentRole,
          newRole: requestedNewRole,
          changedBy: callerUser?.id || null,
          changedAt: new Date(),
        });

        // Write audit_logs entry
        await tx.insert(auditLogs).values({
          userId: callerUser?.id || null,
          action: 'EMPLOYEE_ROLE_CHANGED',
          details: {
            employeeId: id,
            oldRole: currentRole,
            newRole: requestedNewRole,
            oldCode: emp.employeeCode,
            newCode: newGeneratedCode,
          },
        });
      } else if (!emp.employeeCode) {
        // If employee has no code yet, generate from their current role counter
        newGeneratedCode = await generateEmployeeCode(currentRole, tx);
        updateData.employeeCode = newGeneratedCode;
      }
      // If role is unchanged (or same value), or entity/department/designation changed:
      // employeeCode is NOT modified. Counters never go backwards; old codes are never reused.

      if (email && email.toLowerCase().trim() !== emp.email?.toLowerCase().trim()) {
        await tx.update(users).set({ email: targetEmail }).where(or(eq(users.employeeId, id), eq(users.email, emp.email)));
        await tx.update(invites).set({ email: targetEmail }).where(or(eq(invites.employeeId, id), eq(invites.email, emp.email)));
      }

      const [updatedEmp] = await tx
        .update(employees)
        .set(updateData)
        .where(eq(employees.id, id))
        .returning();

      await tx.insert(auditLogs).values({
        userId: callerUser?.id || null,
        action: 'EMPLOYEE_UPDATED',
        details: {
          employeeId: id,
          updatedFields: Object.keys(updateData),
          newRole: isRoleChange ? requestedNewRole : undefined,
          newCode: newGeneratedCode || undefined,
        },
      });

      return {
        updatedEmp,
        effectiveRole,
      };
    });

    const { salary: _omit, ...safeUpdatedEmp } = txResult.updatedEmp;
    return res.json({
      message: 'Employee updated successfully',
      employee: {
        ...safeUpdatedEmp,
        role: txResult.effectiveRole,
        entityCode: finalEntityCode,
        departmentName: departmentName || undefined,
      },
    });
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
