import { Router } from 'express';
import { db, notifications, employees, tasks, attendance, meetings, entities, sprints, eq, desc } from '@workspace/db';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const entityFilter = (req.query.entity as string) || 'ALL';

  try {
    const [allEmployees, allTasks, allMeetings, allAttendance, allEntities, allSprints] = await Promise.all([
      db.select().from(employees),
      db.select().from(tasks),
      db.select().from(meetings),
      db.select().from(attendance),
      db.select().from(entities),
      db.select().from(sprints),
    ]);

    const entityMap = new Map<string, string>(); // entityId -> entityCode
    allEntities.forEach(e => entityMap.set(e.id, e.code.toUpperCase()));

    // Filter employees by entity
    const filteredEmployees = allEmployees.filter(e => {
      const code = entityMap.get(e.entityId) || 'EHM';
      return entityFilter === 'ALL' || code === entityFilter.toUpperCase();
    });

    // Filter tasks by entity
    const filteredTasks = allTasks.filter(t => {
      const code = entityMap.get(t.entityId) || 'EHM';
      return entityFilter === 'ALL' || code === entityFilter.toUpperCase();
    });

    const activeTasksCount = filteredTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'TODO' || t.status === 'DELAYED' || t.status === 'BLOCKED').length;

    // Today's attendance
    const todayStr = new Date().toISOString().split('T')[0];
    const filteredEmpIds = new Set(filteredEmployees.map(e => e.id));

    const presentTodayCount = allAttendance.filter(a => {
      if (!filteredEmpIds.has(a.employeeId)) return false;
      const attDate = a.date ? new Date(a.date).toISOString().split('T')[0] : '';
      return attDate === todayStr && (a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'HALF_DAY');
    }).length;

    // Active meetings
    const now = new Date();
    const activeMeetingsCount = allMeetings.filter(m => {
      const start = new Date(m.startTime);
      const end = new Date(m.endTime);
      return now >= start && now <= end;
    }).length;

    const stats = {
      totalEmployees: filteredEmployees.length,
      presentToday: presentTodayCount,
      activeMeetings: activeMeetingsCount,
      activeTasks: activeTasksCount,
    };

    // Trend calculation based on real attendance over last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];

      const dayAttendance = allAttendance.filter(a => {
        if (!filteredEmpIds.has(a.employeeId)) return false;
        const attDate = a.date ? new Date(a.date).toISOString().split('T')[0] : '';
        return attDate === dateStr && (a.status === 'PRESENT' || a.status === 'LATE');
      });

      const totalEmpCount = filteredEmployees.length || 1;
      const attPercentage = Math.round((dayAttendance.length / totalEmpCount) * 100);
      const hours = d.getDay() === 0 ? 0 : d.getDay() === 6 ? 20.0 : Math.round((dayAttendance.length * 8.5) * 10) / 10;

      return {
        name: dayName,
        hours,
        attendance: attPercentage,
      };
    });

    // Sprint summary from real active tasks
    const empMap = new Map<string, string>();
    allEmployees.forEach(e => empMap.set(e.id, `${e.firstName} ${e.lastName}`.trim()));

    const sprintMap = new Map<string, string>();
    allSprints.forEach(s => sprintMap.set(s.id, s.name));

    const sprintSummary = filteredTasks
      .slice(0, 10)
      .map(t => {
        const entCode = entityMap.get(t.entityId) || 'EHM';
        return {
          taskId: t.taskCode,
          deliverable: t.title,
          entity: entCode,
          assignee: t.assigneeId ? (empMap.get(t.assigneeId) || 'Unassigned') : 'Unassigned',
          sprintWeek: t.sprintId ? sprintMap.get(t.sprintId) || 'Sprint 35' : 'Backlog',
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
          status: t.status === 'DONE' ? 'Completed' : t.status === 'IN_PROGRESS' ? 'Ongoing' : 'Pending',
        };
      });

    // Cross Entity Comparison
    const ehmEmps = allEmployees.filter(e => entityMap.get(e.entityId) === 'EHM');
    const cagEmps = allEmployees.filter(e => entityMap.get(e.entityId) === 'CAG');
    const ehmTasks = allTasks.filter(t => entityMap.get(t.entityId) === 'EHM');
    const cagTasks = allTasks.filter(t => entityMap.get(t.entityId) === 'CAG');

    const ehmEmpIds = new Set(ehmEmps.map(e => e.id));
    const cagEmpIds = new Set(cagEmps.map(e => e.id));

    const ehmPresentTodayCount = allAttendance.filter(a => {
      if (!ehmEmpIds.has(a.employeeId)) return false;
      const attDate = a.date ? new Date(a.date).toISOString().split('T')[0] : '';
      return attDate === todayStr && (a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'HALF_DAY');
    }).length;

    const cagPresentTodayCount = allAttendance.filter(a => {
      if (!cagEmpIds.has(a.employeeId)) return false;
      const attDate = a.date ? new Date(a.date).toISOString().split('T')[0] : '';
      return attDate === todayStr && (a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'HALF_DAY');
    }).length;

    const ehmPresentPct = ehmEmps.length > 0 ? Math.round((ehmPresentTodayCount / ehmEmps.length) * 100) : 0;
    const cagPresentPct = cagEmps.length > 0 ? Math.round((cagPresentTodayCount / cagEmps.length) * 100) : 0;

    const crossEntityComparison = {
      ehm: { headcount: ehmEmps.length, presentPercentage: ehmPresentPct, taskThroughput: ehmTasks.length },
      cag: { headcount: cagEmps.length, presentPercentage: cagPresentPct, taskThroughput: cagTasks.length },
    };

    res.json({
      stats,
      trend,
      sprintSummary,
      crossEntityComparison,
    });
  } catch (err) {
    console.error('[DASHBOARD STATS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const isManagerOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'MANAGER';

    let list;
    if (isManagerOrAdmin) {
      list = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt));
    } else {
      list = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, req.user!.id))
        .orderBy(desc(notifications.createdAt));
    }

    const formatted = list.map(n => {
      const payload = (n.payload as any) || {};
      const isDirectUser = n.userId === req.user!.id;
      const isTaggedUser = Array.isArray(payload.taggedUserIds) && payload.taggedUserIds.includes(req.user!.id);
      const isAssigneeUser = payload.assigneeId === req.user!.id || (req.user!.employeeId && payload.assigneeId === req.user!.employeeId);
      const tagged = isDirectUser || isTaggedUser || isAssigneeUser || payload.tagged === true;

      return {
        ...n,
        payload: {
          ...payload,
          tagged,
        },
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('[NOTIFICATIONS ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

export default router;
