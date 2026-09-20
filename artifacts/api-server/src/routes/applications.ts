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

export default router;
