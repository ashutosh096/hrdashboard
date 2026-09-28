import { Router } from 'express';
import { db, applications, employees, eq, desc } from '@workspace/db';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET / - Return applications (all for ADMIN/MANAGER, own for EMPLOYEE)
router.get('/', async (req, res) => {
  try {
    const isManagerOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'MANAGER';

    let rows;
    if (isManagerOrAdmin) {
      rows = await db
        .select({
          id: applications.id,
          employeeId: applications.employeeId,
          type: applications.type,
          reason: applications.reason,
          status: applications.status,
          reviewedBy: applications.reviewedBy,
          createdAt: applications.createdAt,
          updatedAt: applications.updatedAt,
          employeeFirstName: employees.firstName,
          employeeLastName: employees.lastName,
          employeeCode: employees.employeeCode,
          employeeEmail: employees.email,
        })
        .from(applications)
        .leftJoin(employees, eq(employees.id, applications.employeeId))
        .orderBy(desc(applications.createdAt));
    } else {
      if (!req.user?.employeeId) {
        return res.json([]);
      }
      rows = await db
        .select({
          id: applications.id,
          employeeId: applications.employeeId,
          type: applications.type,
          reason: applications.reason,
          status: applications.status,
          reviewedBy: applications.reviewedBy,
          createdAt: applications.createdAt,
          updatedAt: applications.updatedAt,
          employeeFirstName: employees.firstName,
          employeeLastName: employees.lastName,
          employeeCode: employees.employeeCode,
          employeeEmail: employees.email,
        })
        .from(applications)
        .leftJoin(employees, eq(employees.id, applications.employeeId))
        .where(eq(applications.employeeId, req.user.employeeId))
        .orderBy(desc(applications.createdAt));
    }

    const formatted = rows.map((app) => ({
      id: app.id,
      employeeId: app.employeeId,
      employeeName: `${app.employeeFirstName || ''} ${app.employeeLastName || ''}`.trim() || 'Employee',
      employeeCode: app.employeeCode,
      type: app.type,
      reason: app.reason,
      status: app.status,
      reviewedBy: app.reviewedBy,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[GET APPLICATIONS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// POST / - Create application derived strictly from req.user.employeeId
router.post('/', async (req, res) => {
  const employeeId = req.user?.employeeId;
  if (!employeeId) {
    return res.status(400).json({ message: 'Submitting user does not have a linked employee ID' });
  }

  const { type, reason } = req.body;

  if (!['REMOTE_WORK', 'REIMBURSEMENT', 'EQUIPMENT'].includes(type)) {
    return res.status(400).json({ message: 'Invalid application type. Allowed: REMOTE_WORK, REIMBURSEMENT, EQUIPMENT' });
  }

  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ message: 'Reason is required' });
  }

  try {
    const [newApp] = await db
      .insert(applications)
      .values({
        employeeId,
        type,
        reason: reason.trim(),
        status: 'PENDING',
      })
      .returning();

    res.status(201).json(newApp);
  } catch (err) {
    console.error('[POST APPLICATION ERROR]:', err);
    res.status(500).json({ message: 'Failed to create application' });
  }
});

// PATCH /:id - Update application status (ADMIN/MANAGER) or reason (EMPLOYEE own pending)
router.patch('/:id', async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, reason } = req.body;
  const callerRole = (req.user?.role || '').toUpperCase();
  const isManagerOrAdmin = callerRole === 'ADMIN' || callerRole === 'MANAGER';

  try {
    const [existing] = await db.select().from(applications).where(eq(applications.id, id!));
    if (!existing) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updateData: any = { updatedAt: new Date() };

    if (status !== undefined) {
      if (!isManagerOrAdmin) {
        return res.status(403).json({ message: 'Only Admins and Managers can approve or reject applications' });
      }
      const normStatus = String(status).toUpperCase();
      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(normStatus)) {
        return res.status(400).json({ message: 'Invalid status. Allowed: PENDING, APPROVED, REJECTED' });
      }
      updateData.status = normStatus;
      if (req.user?.employeeId) {
        updateData.reviewedBy = req.user.employeeId;
      }
    }

    if (reason !== undefined) {
      if (!isManagerOrAdmin && existing.employeeId !== req.user?.employeeId) {
        return res.status(403).json({ message: 'You can only edit your own applications' });
      }
      if (typeof reason === 'string' && reason.trim()) {
        updateData.reason = reason.trim();
      }
    }

    const [updated] = await db
      .update(applications)
      .set(updateData)
      .where(eq(applications.id, id!))
      .returning();

    res.json(updated);
  } catch (err: any) {
    console.error('[PATCH APPLICATION ERROR]:', err);
    res.status(500).json({ message: err?.message || 'Failed to update application' });
  }
});

export default router;
