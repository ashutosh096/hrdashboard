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
} from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';

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
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${day} ${month}, ${time}`;
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
  if (action === 'CHILD_ADDED') {
    return { title: newValue || 'Child item added' };
  }
  if (action === 'STATUS_CHANGED' || fieldName?.toLowerCase() === 'status') {
    return {
      title: 'Status changed',
      subtitle: `${oldValue || 'None'} → ${newValue || 'None'}`,
    };
  }
  if (action === 'ASSIGNED') {
    return {
      title: 'Assignment updated',
      subtitle: `${oldValue || 'Unassigned'} → ${newValue || 'Unassigned'}`,
    };
  }
  if (action === 'DUE_DATE_CHANGED') {
    const oldFmt = oldValue ? new Date(oldValue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'None';
    const newFmt = newValue ? new Date(newValue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'None';
    return {
      title: 'Due date changed',
      subtitle: `${oldFmt} → ${newFmt}`,
    };
  }
  if (fieldName) {
    const cleanField = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    return {
      title: `${cleanField} updated`,
      subtitle: `${oldValue || '(empty)'} → ${newValue || '(empty)'}`,
    };
  }

  return { title: 'Record updated' };
}

function getActionIcon(action: string) {
  switch (action) {
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
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
        setLoading(true);
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-gray-500" />
                <span className="text-xs font-medium">Loading timeline...</span>
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
                {history.map((item) => {
                  const { title: changeTitle, subtitle } = formatHistoryChange(item);
                  return (
                    <div key={item.id} className="relative group text-left">
                      {/* Timeline Dot with action icon */}
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center">
                        {getActionIcon(item.action)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-bold text-gray-900">{changeTitle}</span>
                          <span className="text-[11px] text-gray-400 font-medium shrink-0">
                            {formatHistoryDate(item.changedAt)}
                          </span>
                        </div>

                        {subtitle && (
                          <div className="text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 flex items-center gap-1.5">
                            <span>{subtitle}</span>
                          </div>
                        )}

                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <span>by</span>
                          <span className="font-semibold text-gray-700">{item.changedByName || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => fetchHistory(nextBefore)}
                      disabled={loadingMore}
                      className="w-full py-2 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading more...</span>
                        </>
                      ) : (
                        <span>Load more (20 items)</span>
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
