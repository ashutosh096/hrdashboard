import { recordHistoryTable, InsertRecordHistory } from './schema/record_history.js';

export type HistoryAction =
  | 'CREATED'
  | 'UPDATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'DUE_DATE_CHANGED'
  | 'CLONED'
  | 'CHILD_ADDED'
  | 'DELETED';

export interface FieldChange {
  field?: string;
  old?: any;
  new?: any;
  action?: HistoryAction;
}

export interface RecordHistoryParams {
  tableName: 'initiatives' | 'epics' | 'tasks' | 'sprints' | 'projects' | string;
  recordId: string;
  action: HistoryAction;
  changes?: FieldChange | FieldChange[] | Record<string, { old?: any; new?: any }> | null;
  changedById?: string | null;
  changedByName: string;
}

const SENSITIVE_FIELDS = new Set(['password', 'passwordhash', 'token', 'refreshtoken', 'googletoken', 'otp', 'salary']);

function formatValue(val: any): string | null {
  if (val === undefined || val === null) return null;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

export async function recordHistory(
  executor: any,
  params: RecordHistoryParams
) {
  const { tableName, recordId, action, changes, changedById, changedByName } = params;
  const snapshotName = changedByName || 'Unknown';

  const rowsToInsert: InsertRecordHistory[] = [];

  if (!changes || (Array.isArray(changes) && changes.length === 0)) {
    // Single general entry (e.g. CREATED, DELETED, CLONED, CHILD_ADDED)
    rowsToInsert.push({
      tableName,
      recordId,
      action,
      fieldName: null,
      oldValue: null,
      newValue: null,
      changedById: changedById || null,
      changedByName: snapshotName,
    });
  } else if (Array.isArray(changes)) {
    for (const c of changes) {
      const fName = (c.field || '').trim();
      if (fName && SENSITIVE_FIELDS.has(fName.toLowerCase())) continue;

      const oldStr = formatValue(c.old);
      const newStr = formatValue(c.new);

      // Only record if values actually changed or if non-update action
      if (action === 'UPDATED' && oldStr === newStr) {
        continue;
      }

      rowsToInsert.push({
        tableName,
        recordId,
        action: c.action || action,
        fieldName: fName || null,
        oldValue: oldStr,
        newValue: newStr,
        changedById: changedById || null,
        changedByName: snapshotName,
      });
    }
  } else if (typeof changes === 'object') {
    if ('field' in changes || 'old' in changes || 'new' in changes) {
      const c = changes as FieldChange;
      const fName = (c.field || '').trim();
      if (!fName || !SENSITIVE_FIELDS.has(fName.toLowerCase())) {
        const oldStr = formatValue(c.old);
        const newStr = formatValue(c.new);
        if (action !== 'UPDATED' || oldStr !== newStr) {
          rowsToInsert.push({
            tableName,
            recordId,
            action: c.action || action,
            fieldName: fName || null,
            oldValue: oldStr,
            newValue: newStr,
            changedById: changedById || null,
            changedByName: snapshotName,
          });
        }
      }
    } else {
      // Record<string, { old, new }>
      for (const [fName, diff] of Object.entries(changes)) {
        if (SENSITIVE_FIELDS.has(fName.toLowerCase())) continue;
        const oldStr = formatValue((diff as any)?.old);
        const newStr = formatValue((diff as any)?.new);
        if (oldStr === newStr) continue;

        let derivedAction = action;
        const lower = fName.toLowerCase();
        if (lower === 'status') derivedAction = 'STATUS_CHANGED';
        else if (lower.includes('assignee') || lower === 'ownerid' || lower === 'employeeid') derivedAction = 'ASSIGNED';
        else if (lower.includes('due') || lower.includes('targetdate')) derivedAction = 'DUE_DATE_CHANGED';

        rowsToInsert.push({
          tableName,
          recordId,
          action: derivedAction,
          fieldName: fName,
          oldValue: oldStr,
          newValue: newStr,
          changedById: changedById || null,
          changedByName: snapshotName,
        });
      }
    }
  }

  if (rowsToInsert.length > 0) {
    await executor.insert(recordHistoryTable).values(rowsToInsert);
  }
}
