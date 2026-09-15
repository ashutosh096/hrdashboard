import { Router } from 'express';
import { db, attendance, employees, eq, and, desc } from '@workspace/db';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const userRole = req.user?.role;
    const employeeId = req.user?.employeeId;

    if (!employeeId && userRole === 'EMPLOYEE') {
      return res.status(400).json({ message: 'Employee profile ID missing' });
    }

    const query = db
      .select({
        id: attendance.id,
        employeeId: attendance.employeeId,
        employeeName: employees.firstName,
        lastName: employees.lastName,
        employeeCode: employees.employeeCode,
        date: attendance.date,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        workMode: attendance.workMode,
        status: attendance.status,
        totalHours: attendance.totalHours,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .leftJoin(employees, eq(attendance.employeeId, employees.id));

    let rows;
    if (userRole === 'EMPLOYEE' && employeeId) {
      rows = await query.where(eq(attendance.employeeId, employeeId)).orderBy(desc(attendance.clockIn));
    } else {
      rows = await query.orderBy(desc(attendance.clockIn));
    }

    const formatted = rows.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employeeName ? `${r.employeeName} ${r.lastName || ''}`.trim() : 'Team Member',
      employeeCode: r.employeeCode || '',
      date: r.date,
      clockIn: r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      clockOut: r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      workMode: r.workMode,
      status: r.status,
      totalHours: r.totalHours ? String(r.totalHours) : '0.00',
    }));

    return res.json(formatted);
  } catch (err: any) {
    console.error('[ATTENDANCE GET ERROR]:', err);
    return res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
});

// POST /api/attendance/clock-in
router.post('/clock-in', async (req, res) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee profile ID missing' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Duplicate check for today
    const [existing] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, todayStr)))
      .limit(1);

    if (existing) {
      return res.status(409).json({ message: 'Already clocked in for today' });
    }

    const { workMode } = req.body;
    const now = new Date();

    const [newRecord] = await db
      .insert(attendance)
      .values({
        employeeId,
        date: todayStr,
        clockIn: now,
        workMode: workMode && ['IN_OFFICE', 'REMOTE', 'HYBRID'].includes(workMode) ? workMode : 'IN_OFFICE',
        status: 'PRESENT',
        totalHours: '0.00',
      })
      .returning();

    return res.status(201).json(newRecord);
  } catch (err: any) {
    console.error('[CLOCK-IN ERROR]:', err);
    return res.status(500).json({ message: 'Failed to clock in' });
  }
});

// POST /api/attendance/clock-out
router.post('/clock-out', async (req, res) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee profile ID missing' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const [existing] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, todayStr)))
      .limit(1);

    if (!existing) {
      return res.status(400).json({ message: 'No active clock-in found for today' });
    }

    if (existing.clockOut) {
      return res.status(409).json({ message: 'Already clocked out for today' });
    }

    const now = new Date();
    const durationMs = now.getTime() - new Date(existing.clockIn).getTime();
    const hours = (durationMs / (1000 * 60 * 60)).toFixed(2);

    const [updated] = await db
      .update(attendance)
      .set({
        clockOut: now,
        totalHours: hours,
      })
      .where(eq(attendance.id, existing.id))
      .returning();

    return res.json(updated);
  } catch (err: any) {
    console.error('[CLOCK-OUT ERROR]:', err);
    return res.status(500).json({ message: 'Failed to clock out' });
  }
});

export default router;
