import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  History,
  Clock,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  UserCheck,
  Calendar,
  GitBranch,
  Copy,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';
import { fetchApi, getCachedApi } from '@workspace/api-client-react';

export interface HistoryItem {
  id: string;
  action: string;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  changedByName?: string | null;
  changedAt: string;
}

interface RecordHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: 'initiatives' | 'epics' | 'tasks' | 'sprints' | 'projects';
  recordId: string;
  title?: string;
  code?: string;
}

export function formatHistoryDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const datePart = d.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }); // e.g. "1 Oct 2026"

  const timePart = d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }); // e.g. "1:45 PM"

  return `${datePart}, ${timePart}`;
}

export function formatHistoryChange(item: HistoryItem): { title: string; subtitle?: string } {
  const { action, fieldName, oldValue, newValue } = item;

  if (action === 'CREATED') {
    return { title: 'Record created' };
  }
  if (action === 'DELETED') {
    return { title: 'Record deleted' };
  }
  if (action === 'CLONED') {
    return { title: 'Record cloned' };
  }

  // Subtask Checklist items
  if (fieldName?.toLowerCase().includes('checklist')) {
    return {
      title: 'Subtask Checklist updated',
      subtitle: newValue || 'Subtask item updated',
    };
  }

  if (action === 'CHILD_ADDED') {
    return { title: newValue || 'Child item added' };
  }

  if (action === 'STATUS_CHANGED' || fieldName?.toLowerCase() === 'status') {
    return {
      title: 'Status changed',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  const fLower = (fieldName || '').toLowerCase().replace(/_/g, '');
  if (fLower === 'reviewinglead' || fLower === 'reviewingleadid') {
    return {
      title: 'Reviewing Lead updated',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  if (fLower === 'assignee' || fLower === 'assigneeid') {
    return {
      title: 'Assignee updated',
      subtitle: `${oldValue || 'Unassigned'} → ${newValue || 'Unassigned'}`,
    };
  }

  if (fLower === 'entity' || fLower === 'entityid') {
    return {
      title: 'Entity updated',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  if (fLower === 'department' || fLower === 'departmentid') {
    return {
      title: 'Department updated',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  if (fLower === 'project' || fLower === 'projectid') {
    return {
      title: 'Project updated',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  if (fLower === 'epic' || fLower === 'epicid') {
    return {
      title: 'Epic updated',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  if (fLower === 'initiative' || fLower === 'initiativeid') {
    return {
      title: 'Initiative updated',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  if (fLower === 'sprint' || fLower === 'sprintid') {
    return {
      title: 'Sprint updated',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  if (action === 'ASSIGNED') {
    return {
      title: 'Assignment updated',
      subtitle: `${oldValue || 'Unassigned'} → ${newValue || 'Unassigned'}`,
    };
  }
  if (action === 'DUE_DATE_CHANGED' || fLower.includes('duedate')) {
    return {
      title: 'Due date changed',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }

  // Clean comment formatting: Never display JSON array/object code
  if (fieldName?.toLowerCase() === 'comments') {
    let commentSnippet = '';
    const extractText = (val: string | null | undefined): string => {
      if (!val) return '';
      const trimmed = val.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const last = parsed[parsed.length - 1];
            return last?.content || last?.text || '';
          }
          if (parsed && typeof parsed === 'object') {
            return parsed.content || parsed.text || '';
          }
        } catch {}
      }
      return trimmed;
    };

    commentSnippet = extractText(newValue) || extractText(oldValue);
    return {
      title: 'Comment added',
      subtitle: commentSnippet ? `"${commentSnippet}"` : 'New team comment added',
    };
  }

  if (fieldName?.toLowerCase() === 'budget') {
    const formatBudget = (v: string | null | undefined) => {
      if (!v || v === 'empty' || v === '(empty)') return '(empty)';
      if (v.startsWith('$')) return v;
      const num = Number(v.replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? v : `$${num.toLocaleString()}`;
    };
    return {
      title: 'Budget updated',
      subtitle: `${formatBudget(oldValue)} → ${formatBudget(newValue)}`,
    };
  }

  if (fieldName) {
    const cleanField = fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/\s+Id$/i, '')
      .replace(/\s+_id$/i, '');
    
    // Clean raw JSON strings
    let cleanOld = (oldValue || '').trim();
    let cleanNew = (newValue || '').trim();

    if (cleanOld.startsWith('[') || cleanOld.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanOld);
        cleanOld = Array.isArray(parsed) ? `${parsed.length} items` : 'Updated object';
      } catch {
        cleanOld = '(details)';
      }
    }
    if (cleanNew.startsWith('[') || cleanNew.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanNew);
        cleanNew = Array.isArray(parsed) ? `${parsed.length} items` : 'Updated object';
      } catch {
        cleanNew = '(details)';
      }
    }

    return {
      title: `${cleanField} updated`,
      subtitle: `${cleanOld || '(empty)'} → ${cleanNew || '(empty)'}`,
    };
  }

  return { title: 'Record updated' };
}

function getActionIcon(item: HistoryItem) {
  if (item.fieldName?.toLowerCase().includes('checklist')) {
    return <CheckSquare className="w-4 h-4 text-emerald-600" />;
  }
  switch (item.action) {
    case 'CREATED':
      return <PlusCircle className="w-4 h-4 text-emerald-600" />;
    case 'STATUS_CHANGED':
      return <RefreshCw className="w-4 h-4 text-blue-600" />;
    case 'ASSIGNED':
      return <UserCheck className="w-4 h-4 text-purple-600" />;
    case 'DUE_DATE_CHANGED':
      return <Calendar className="w-4 h-4 text-amber-600" />;
    case 'CHILD_ADDED':
      return <GitBranch className="w-4 h-4 text-indigo-600" />;
    case 'CLONED':
      return <Copy className="w-4 h-4 text-teal-600" />;
    case 'DELETED':
      return <Trash2 className="w-4 h-4 text-rose-600" />;
    default:
      return <Edit3 className="w-4 h-4 text-gray-600" />;
  }
}

export const RecordHistoryPanel: React.FC<RecordHistoryPanelProps> = ({
  isOpen,
  onClose,
  tableName,
  recordId,
  title,
  code,
}) => {
  const cacheUrl = `/api/history/${tableName}/${recordId}?limit=20`;
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    return getCachedApi<{ history: HistoryItem[] }>(cacheUrl)?.history || [];
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (beforeTimestamp?: string | null) => {
      if (!recordId) return;
      const isInitial = !beforeTimestamp;
      if (isInitial) {
        if (!getCachedApi(cacheUrl) && history.length === 0) {
          setLoading(true);
        }
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        let url = `/api/history/${tableName}/${recordId}?limit=20`;
        if (beforeTimestamp) {
          url += `&before=${encodeURIComponent(beforeTimestamp)}`;
        }

        const data = await fetchApi<{
          history: HistoryItem[];
          hasMore: boolean;
          nextBefore: string | null;
        }>(url);

        if (isInitial) {
          setHistory(data.history || []);
        } else {
          setHistory((prev) => [...prev, ...(data.history || [])]);
        }
        setHasMore(Boolean(data.hasMore));
        setNextBefore(data.nextBefore);
      } catch (err: any) {
        console.error('[FETCH HISTORY ERROR]:', err);
        setError(err?.message || 'Failed to load history');
      } finally {
        if (isInitial) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [tableName, recordId]
  );

  useEffect(() => {
    if (isOpen && recordId) {
      fetchHistory();
    } else {
      setHistory([]);
      setHasMore(false);
      setNextBefore(null);
      setError(null);
    }
  }, [isOpen, recordId, fetchHistory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-hidden text-left select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-in panel from right */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-gray-200">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
                <History className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">History & Timeline</h3>
                  {code && (
                    <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold bg-gray-100 text-gray-600">
                      {code}
                    </span>
                  )}
                </div>
                {title && (
                  <p className="text-xs text-gray-500 truncate max-w-xs" title={title}>
                    {title}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading && history.length === 0 ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 text-gray-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-gray-300 stroke-[1.5]" />
                <p className="text-sm font-semibold text-gray-600">No activity recorded yet</p>
                <p className="text-xs text-gray-400">Future changes will be recorded here automatically.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {history
                  .filter((item) => {
                    const f = (item.fieldName || '').toLowerCase();
                    if (f.includes('updated_at') || f.includes('updatedat') || f.includes('created_at') || f.includes('createdat')) return false;
                    if (item.action === 'UPDATED' && (item.oldValue || '').trim().toLowerCase() === (item.newValue || '').trim().toLowerCase()) return false;
                    return true;
                  })
                  .map((item) => {
                  const { title: changeTitle, subtitle } = formatHistoryChange(item);
                  return (
                    <div key={item.id} className="relative group text-left">
                      {/* Timeline Dot with action icon */}
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center">
                        {getActionIcon(item)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-bold text-gray-900">{changeTitle}</span>
                          <span className="text-[11px] text-gray-400 font-medium shrink-0">
                            {formatHistoryDate(item.changedAt)}
                          </span>
                        </div>

                        {subtitle && (
                          <div className="text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 flex items-center gap-1.5 break-words">
                            <span>{subtitle}</span>
                          </div>
                        )}

                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <span>by</span>
                          <span className="font-semibold text-gray-700">{item.changedByName || 'Team Member'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Button for Long Timelines */}
                {hasMore && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      disabled={loadingMore}
                      onClick={() => fetchHistory(nextBefore)}
                      className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 mx-auto disabled:opacity-50 shadow-2xs"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading more...</span>
                        </>
                      ) : (
                        <span>Load older history</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordHistoryPanel;
