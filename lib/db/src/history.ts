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

const SENSITIVE_FIELDS = new Set(['password', 'passwordhash', 'token', 'refreshtoken', 'googletoken', 'otp', 'salary', 'updatedat', 'updated_at', 'createdat', 'created_at']);

function formatValue(val: any): string | null {
  if (val === undefined || val === null) return null;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function isMeaningfulChange(fieldName: string, oldVal: any, newVal: any, oldStr: string | null, newStr: string | null): boolean {
  if (oldStr === newStr) return false;
  if ((oldStr ?? '').trim() === (newStr ?? '').trim()) return false;
  
  // Date check: ignore ISO millisecond/time drift if calendar date is the same
  if (fieldName.toLowerCase().includes('date') || oldVal instanceof Date || newVal instanceof Date) {
    const d1 = oldStr ? oldStr.split('T')[0] : '';
    const d2 = newStr ? newStr.split('T')[0] : '';
    if (d1 === d2) return false;
  }
  return true;
}

export async function recordHistory(
  executor: any,
  params: RecordHistoryParams
) {
  const { tableName, recordId, action, changes, changedById, changedByName } = params;
  const snapshotName = changedByName || 'Unknown';

  const rowsToInsert: InsertRecordHistory[] = [];

  const now = new Date();

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
      changedAt: now,
    });
  } else if (Array.isArray(changes)) {
    for (const c of changes) {
      const fName = (c.field || '').trim();
      if (fName && SENSITIVE_FIELDS.has(fName.toLowerCase())) continue;

      const oldStr = formatValue(c.old);
      const newStr = formatValue(c.new);

      // Only record if values actually changed or if non-update action
      if (action === 'UPDATED' && !isMeaningfulChange(fName, c.old, c.new, oldStr, newStr)) {
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
        changedAt: now,
      });
    }
  } else if (typeof changes === 'object') {
    if ('field' in changes || 'old' in changes || 'new' in changes) {
      const c = changes as FieldChange;
      const fName = (c.field || '').trim();
      if (!fName || !SENSITIVE_FIELDS.has(fName.toLowerCase())) {
        const oldStr = formatValue(c.old);
        const newStr = formatValue(c.new);
        if (action !== 'UPDATED' || isMeaningfulChange(fName, c.old, c.new, oldStr, newStr)) {
          rowsToInsert.push({
            tableName,
            recordId,
            action: c.action || action,
            fieldName: fName || null,
            oldValue: oldStr,
            newValue: newStr,
            changedById: changedById || null,
            changedByName: snapshotName,
            changedAt: now,
          });
        }
      }
    } else {
      // Record<string, { old, new }>
      for (const [fName, diff] of Object.entries(changes)) {
        if (SENSITIVE_FIELDS.has(fName.toLowerCase())) continue;
        const oldStr = formatValue((diff as any)?.old);
        const newStr = formatValue((diff as any)?.new);
        if (!isMeaningfulChange(fName, (diff as any)?.old, (diff as any)?.new, oldStr, newStr)) continue;

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
          changedAt: now,
        });
      }
    }
  }

  if (rowsToInsert.length > 0) {
    await executor.insert(recordHistoryTable).values(rowsToInsert);
  }
}
