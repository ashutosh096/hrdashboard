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
  entities,
  departments,
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function resolveDisplayValue(val: string | null | undefined, lookup: Map<string, string>): string | null {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  if (!trimmed || trimmed === '(empty)' || trimmed === 'empty') return null;

  if (UUID_REGEX.test(trimmed)) {
    return lookup.get(trimmed) || trimmed;
  }

  // Format ISO timestamps as clean date: "6 Oct 2026"
  if (ISO_DATE_REGEX.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d.toLocaleDateString('en-GB', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
  }

  // JSON Array of UUIDs or items (e.g. team member IDs)
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            if (typeof item === 'string' && UUID_REGEX.test(item.trim())) {
              return lookup.get(item.trim()) || item;
            }
            if (item && typeof item === 'object') {
              return item.content || item.name || item.title || JSON.stringify(item);
            }
            return String(item);
          })
          .join(', ');
      }
    } catch {}
  }

  return trimmed;
}

function normalizeFieldName(fieldName: string | null | undefined): string | null {
  if (!fieldName) return null;
  const f = fieldName.toLowerCase().replace(/_/g, '');
  if (f === 'reviewingleadid' || f === 'reviewinglead') return 'Reviewing Lead';
  if (f === 'assigneeid' || f === 'assignee') return 'Assignee';
  if (f === 'entityid' || f === 'entity') return 'Entity';
  if (f === 'departmentid' || f === 'department') return 'Department';
  if (f === 'projectid' || f === 'project') return 'Project';
  if (f === 'epicid' || f === 'epic') return 'Epic';
  if (f === 'initiativeid' || f === 'initiative') return 'Initiative';
  if (f === 'sprintid' || f === 'sprint') return 'Sprint';
  if (f === 'ownerid' || f === 'owner') return 'Owner';
  if (f === 'creatorid' || f === 'createdbyid' || f === 'creator') return 'Creator';
  if (f === 'duedate' || f === 'due_date') return 'Due Date';
  if (f === 'startdate' || f === 'start_date') return 'Start Date';
  if (f === 'targetdate' || f === 'target_date') return 'Target Date';
  if (f === 'targetweek' || f === 'sprintweek') return 'Sprint Week';
  if (f === 'checklist') return 'Subtask Checklist';
  return fieldName;
}

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
          (callerName && proj.lead && proj.lead.toLowerCase() === callerName.toLowerCase()) ||
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

    // 2. Query history rows (newest first, paginated)
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
        changedById: recordHistoryTable.changedById,
        changedByName: recordHistoryTable.changedByName,
        changedAt: recordHistoryTable.changedAt,
      })
      .from(recordHistoryTable)
      .where(and(...conditions))
      .orderBy(desc(recordHistoryTable.changedAt))
      .limit(limitNum * 3);

    // 3. Build resolution maps for human readable labels
    const [allEmployees, allEntities, allDepts, allProjs, allEpics, allInits, allSprints] = await Promise.all([
      db.select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName, code: employees.employeeCode }).from(employees),
      db.select({ id: entities.id, name: entities.name, code: entities.code }).from(entities),
      db.select({ id: departments.id, name: departments.name }).from(departments),
      db.select({ id: projects.id, name: projects.name, code: projects.code }).from(projects),
      db.select({ id: epics.id, title: epics.title, code: epics.epicCode }).from(epics),
      db.select({ id: initiatives.id, title: initiatives.title, code: initiatives.initiativeCode }).from(initiatives),
      db.select({ id: sprints.id, name: sprints.name }).from(sprints),
    ]);

    const lookup = new Map<string, string>();

    for (const e of allEmployees) {
      const name = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Employee';
      lookup.set(e.id, e.code ? `${name} (${e.code})` : name);
    }
    for (const ent of allEntities) {
      lookup.set(ent.id, ent.code ? `${ent.code} (${ent.name})` : ent.name);
    }
    for (const d of allDepts) {
      lookup.set(d.id, d.name);
    }
    for (const p of allProjs) {
      lookup.set(p.id, p.code ? `${p.code} ${p.name}` : p.name);
    }
    for (const ep of allEpics) {
      lookup.set(ep.id, ep.code ? `${ep.code} ${ep.title}` : ep.title);
    }
    for (const init of allInits) {
      lookup.set(init.id, init.code ? `${init.code} ${init.title}` : init.title);
    }
    for (const s of allSprints) {
      lookup.set(s.id, s.name);
    }

    // 4. Transform and filter rows
    const transformedHistory = rows
      .filter((row) => {
        const f = (row.fieldName || '').toLowerCase();
        if (f.includes('updatedat') || f.includes('updated_at') || f.includes('createdat') || f.includes('created_at')) {
          return false;
        }

        const resolvedOld = resolveDisplayValue(row.oldValue, lookup);
        const resolvedNew = resolveDisplayValue(row.newValue, lookup);

        // Filter out fake changes where resolved value didn't change
        if (row.action === 'UPDATED' && (resolvedOld || '').trim().toLowerCase() === (resolvedNew || '').trim().toLowerCase()) {
          return false;
        }
        return true;
      })
      .map((row) => {
        let changedBy = row.changedByName;
        if (row.changedById && lookup.has(row.changedById)) {
          changedBy = lookup.get(row.changedById)!;
        } else if (!changedBy || changedBy.trim().toLowerCase() === 'admin' || changedBy.trim().toLowerCase() === 'unknown') {
          changedBy = 'Ashutosh Mishra (ADMN0001)';
        }

        return {
          id: row.id,
          action: row.action,
          fieldName: normalizeFieldName(row.fieldName),
          oldValue: resolveDisplayValue(row.oldValue, lookup),
          newValue: resolveDisplayValue(row.newValue, lookup),
          changedByName: changedBy,
          changedAt: row.changedAt,
        };
      });

    const hasMore = transformedHistory.length > limitNum;
    const historyList = hasMore ? transformedHistory.slice(0, limitNum) : transformedHistory;

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
