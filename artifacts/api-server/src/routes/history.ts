import { Router, Request, Response } from 'express';
import {
  db,
  recordHistoryTable,
  initiatives,
  epics,
  tasks,
  sprints,
  projects,
  employees,
  eq,
  and,
  lt,
  desc,
} from '@workspace/db';
import { requireAuth } from '../middleware/auth.js';
import { getCallerInfo } from '../utils/userSnapshot.js';

const router = Router();
router.use(requireAuth);

const VALID_TABLES = ['initiatives', 'epics', 'tasks', 'sprints', 'projects'] as const;
type ValidTable = typeof VALID_TABLES[number];

// GET /api/history/:table/:id?limit=10&before=<timestamp>
router.get('/:table/:id', async (req: Request, res: Response) => {
  const table = req.params.table as ValidTable;
  const recordId = req.params.id as string;
  const limitParam = parseInt(String(req.query.limit || 10), 10);
  const limitNum = isNaN(limitParam) ? 10 : Math.max(1, Math.min(limitParam, 50));
  const beforeParam = req.query.before as string | undefined;

  if (!VALID_TABLES.includes(table)) {
    return res.status(400).json({ message: `Invalid table: ${table}. Must be one of: ${VALID_TABLES.join(', ')}` });
  }

  try {
    const userRole = req.user?.role;
    const { employeeId: callerEmpId, callerName } = await getCallerInfo(req.user);

    // 1. Check item existence & RBAC authorization
    let isAuthorized = userRole === 'ADMIN' || userRole === 'MANAGER';
    let itemFound = false;

    if (table === 'initiatives') {
      const [init] = await db.select().from(initiatives).where(eq(initiatives.id, recordId));
      if (!init) return res.status(404).json({ message: 'Initiative not found' });
      itemFound = true;
      if (!isAuthorized && callerEmpId) {
        if (init.ownerId === callerEmpId || init.createdById === callerEmpId) {
          isAuthorized = true;
        }
      }
    } else if (table === 'epics') {
      const [epic] = await db.select().from(epics).where(eq(epics.id, recordId));
      if (!epic) return res.status(404).json({ message: 'Epic not found' });
      itemFound = true;
      if (!isAuthorized && callerEmpId) {
        if (epic.ownerId === callerEmpId || epic.createdById === callerEmpId) {
          isAuthorized = true;
        }
      }
    } else if (table === 'tasks') {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, recordId));
      if (!task) return res.status(404).json({ message: 'Task not found' });
      itemFound = true;
      if (!isAuthorized && callerEmpId) {
        if (
          task.assigneeId === callerEmpId ||
          task.creatorId === callerEmpId ||
          task.createdById === callerEmpId
        ) {
          isAuthorized = true;
        }
      }
    } else if (table === 'sprints') {
      const [sprint] = await db.select().from(sprints).where(eq(sprints.id, recordId));
      if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
      itemFound = true;
      if (!isAuthorized && callerEmpId) {
        if (
          sprint.employeeId === callerEmpId ||
          sprint.createdById === callerEmpId ||
          sprint.reviewingLeadId === callerEmpId
        ) {
          isAuthorized = true;
        }
      }
    } else if (table === 'projects') {
      const [proj] = await db.select().from(projects).where(eq(projects.id, recordId));
      if (!proj) return res.status(404).json({ message: 'Project not found' });
      itemFound = true;
      if (!isAuthorized) {
        if (
          (callerEmpId && proj.createdById === callerEmpId) ||
          (callerName && proj.lead.toLowerCase() === callerName.toLowerCase()) ||
          (Array.isArray(proj.team) && callerName && proj.team.map((t: string) => t.toLowerCase()).includes(callerName.toLowerCase()))
        ) {
          isAuthorized = true;
        }
      }
    }

    if (!itemFound) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied: You can only view history for items created by or assigned to you' });
    }

    // 2. Query history rows (newest first, paginated, returning names not ids)
    const conditions: any[] = [
      eq(recordHistoryTable.tableName, table),
      eq(recordHistoryTable.recordId, recordId),
    ];

    if (beforeParam) {
      const beforeDate = new Date(beforeParam);
      if (!isNaN(beforeDate.getTime())) {
        conditions.push(lt(recordHistoryTable.changedAt, beforeDate));
      }
    }

    const rows = await db
      .select({
        id: recordHistoryTable.id,
        action: recordHistoryTable.action,
        fieldName: recordHistoryTable.fieldName,
        oldValue: recordHistoryTable.oldValue,
        newValue: recordHistoryTable.newValue,
        changedByName: recordHistoryTable.changedByName,
        changedAt: recordHistoryTable.changedAt,
      })
      .from(recordHistoryTable)
      .where(and(...conditions))
      .orderBy(desc(recordHistoryTable.changedAt))
      .limit(limitNum + 1);

    const hasMore = rows.length > limitNum;
    const historyList = hasMore ? rows.slice(0, limitNum) : rows;

    res.json({
      history: historyList,
      hasMore,
      nextBefore: historyList.length > 0 ? historyList[historyList.length - 1].changedAt : null,
    });
  } catch (err: any) {
    console.error('[GET RECORD HISTORY ERROR]:', err);
    res.status(500).json({ message: 'Failed to fetch history', error: err?.message });
  }
});

export default router;
