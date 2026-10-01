import { Router } from 'express';
import { db, attendance, employees, eq, and, desc, recordHistory } from '@workspace/db';
import { requireAuth } from '../middleware/auth.js';
import { getCallerInfo } from '../utils/userSnapshot.js';

const router = Router();
router.use(requireAuth);

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const userRole = req.user?.role;
    let employeeId = req.user?.employeeId;

    if (!employeeId && req.user?.email) {
      const [foundEmp] = await db.select().from(employees).where(eq(employees.email, req.user.email)).limit(1);
      if (foundEmp) employeeId = foundEmp.id;
    }

    const query = db
      .select({
        id: attendance.id,
        employeeId: attendance.employeeId,
        employeeName: employees.firstName,
        lastName: employees.lastName,
        employeeEmail: employees.email,
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
    if (req.query.myOnly === 'true' && employeeId) {
      rows = await query.where(eq(attendance.employeeId, employeeId)).orderBy(desc(attendance.clockIn));
    } else {
      rows = await query.orderBy(desc(attendance.clockIn));
    }

    const formatted = rows.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employeeName ? `${r.employeeName} ${r.lastName || ''}`.trim() : 'Team Member',
      employeeEmail: r.employeeEmail || '',
      employeeCode: r.employeeCode || '',
      date: r.date ? String(r.date).split('T')[0] : '',
      clockIn: r.clockIn ? 'Marked' : null,
      clockOut: r.clockOut ? 'Clocked Out' : null,
      workMode: r.workMode,
      status: r.status,
      totalHours: r.totalHours ? String(r.totalHours) : '0.00',
      createdAt: r.createdAt,
    }));

    return res.json(formatted);
  } catch (err: any) {
    console.error('[ATTENDANCE GET ERROR]:', err);
    return res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
});

function getLocalDateString(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d); // Returns YYYY-MM-DD in IST
  } catch {
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5));
    const year = ist.getFullYear();
    const month = String(ist.getMonth() + 1).padStart(2, '0');
    const day = String(ist.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// POST /api/attendance/clock-in
router.post('/clock-in', async (req, res) => {
  try {
    let employeeId = req.body?.employeeId || req.user?.employeeId;
    if (!employeeId && req.user?.email) {
      const [foundEmp] = await db.select().from(employees).where(eq(employees.email, req.user.email)).limit(1);
      if (foundEmp) employeeId = foundEmp.id;
    }

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee profile ID missing' });
    }

    const todayStr = (req.body.date && typeof req.body.date === 'string' && req.body.date.length === 10)
      ? req.body.date
      : getLocalDateString();
    const { workMode, status, isEdit } = req.body;
    const now = new Date();

    let finalStatus: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' = 'PRESENT';
    if (status === 'HALF_DAY') finalStatus = 'HALF_DAY';
    else if (status === 'ABSENT' || status === 'LEAVE') finalStatus = 'ABSENT';
    else if (status === 'LATE') finalStatus = 'LATE';

    // Duplicate check for today
    const [existing] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, todayStr)))
      .limit(1);

    if (existing) {
      if (isEdit) {
        const [updated] = await db
          .update(attendance)
          .set({
            workMode: workMode && ['IN_OFFICE', 'REMOTE', 'HYBRID'].includes(workMode) ? workMode : existing.workMode,
            status: finalStatus,
            totalHours: finalStatus === 'HALF_DAY' ? '4.00' : finalStatus === 'ABSENT' ? '0.00' : '8.00',
          })
          .where(eq(attendance.id, existing.id))
          .returning();

        try {
          const caller = await getCallerInfo(req.user);
          await recordHistory(db, {
            tableName: 'attendance',
            recordId: existing.id,
            action: 'UPDATED',
            changedById: req.user?.id,
            changedByName: caller.callerName,
            changes: [
              { field: 'status', old: existing.status, new: finalStatus },
              { field: 'workMode', old: existing.workMode, new: workMode || existing.workMode },
            ],
          });
        } catch (auditErr) {
          console.warn('[ATTENDANCE EDIT AUDIT WARN]:', auditErr);
        }

        return res.json(updated);
      }
      return res.status(409).json({ message: 'Already clocked in for today' });
    }

    const [newRecord] = await db
      .insert(attendance)
      .values({
        employeeId,
        date: todayStr,
        clockIn: now,
        workMode: workMode && ['IN_OFFICE', 'REMOTE', 'HYBRID'].includes(workMode) ? workMode : 'IN_OFFICE',
        status: finalStatus,
        totalHours: finalStatus === 'HALF_DAY' ? '4.00' : finalStatus === 'ABSENT' ? '0.00' : '8.00',
      })
      .returning();

    try {
      const caller = await getCallerInfo(req.user);
      await recordHistory(db, {
        tableName: 'attendance',
        recordId: newRecord.id,
        action: 'CREATED',
        changedById: req.user?.id,
        changedByName: caller.callerName,
      });
    } catch (auditErr) {
      console.warn('[ATTENDANCE CREATE AUDIT WARN]:', auditErr);
    }

    return res.status(201).json(newRecord);
  } catch (err: any) {
    console.error('[CLOCK-IN ERROR]:', err);
    return res.status(500).json({ message: 'Failed to clock in' });
  }
});

// POST /api/attendance/clock-out
router.post('/clock-out', async (req, res) => {
  try {
    let employeeId = req.body?.employeeId || req.user?.employeeId;
    if (!employeeId && req.user?.email) {
      const [foundEmp] = await db.select().from(employees).where(eq(employees.email, req.user.email)).limit(1);
      if (foundEmp) employeeId = foundEmp.id;
    }
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee profile ID missing' });
    }

    const todayStr = (req.body.date && typeof req.body.date === 'string' && req.body.date.length === 10)
      ? req.body.date
      : getLocalDateString();

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
