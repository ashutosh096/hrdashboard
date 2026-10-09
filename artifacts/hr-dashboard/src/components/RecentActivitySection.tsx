import React, { useState, useEffect } from 'react';
import { Clock, History, ChevronRight, Loader2 } from 'lucide-react';
import { fetchApi, getCachedApi } from '@workspace/api-client-react';
import { HistoryItem, formatHistoryDate } from './RecordHistoryPanel';

interface RecentActivitySectionProps {
  tableName: 'initiatives' | 'epics' | 'tasks' | 'sprints' | 'projects';
  recordId: string;
  onOpenHistory: () => void;
  refreshTrigger?: any;
}

export function formatSingleLineHistory(entry: HistoryItem): string {
  const author = entry.changedByName || 'Unknown';
  const time = formatHistoryDate(entry.changedAt);
  let actionText = '';

  if (entry.action === 'CREATED') {
    actionText = 'Created';
  } else if (entry.action === 'DELETED') {
    actionText = 'Deleted';
  } else if (entry.action === 'CLONED') {
    actionText = 'Cloned';
  } else if (entry.action === 'CHILD_ADDED') {
    actionText = entry.newValue || 'Child item added';
  } else if (entry.action === 'STATUS_CHANGED' || entry.fieldName?.toLowerCase() === 'status') {
    actionText = `Status: ${entry.oldValue || 'None'} → ${entry.newValue || 'None'}`;
  } else if (entry.action === 'ASSIGNED') {
    actionText = `Assigned: ${entry.oldValue || 'Unassigned'} → ${entry.newValue || 'Unassigned'}`;
  } else if (entry.action === 'DUE_DATE_CHANGED') {
    const oldFmt = entry.oldValue ? new Date(entry.oldValue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'None';
    const newFmt = entry.newValue ? new Date(entry.newValue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'None';
    actionText = `Due date: ${oldFmt} → ${newFmt}`;
  } else if (entry.fieldName) {
    const cleanField = entry.fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    actionText = `${cleanField}: ${entry.oldValue || '(empty)'} → ${entry.newValue || '(empty)'}`;
  } else {
    actionText = 'Updated';
  }

  return `${actionText} · ${author} · ${time}`;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  tableName,
  recordId,
  onOpenHistory,
  refreshTrigger,
}) => {
  const cacheKey = `/api/history/${tableName}/${recordId}?limit=3`;
  const [recentItems, setRecentItems] = useState<HistoryItem[]>(() => {
    return getCachedApi<{ history: HistoryItem[] }>(cacheKey)?.history || [];
  });
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!recordId) return;
    let isCancelled = false;

    const fetchRecent = async () => {
      if (!getCachedApi(cacheKey) && recentItems.length === 0) {
        setLoading(true);
      }
      try {
        const data = await fetchApi<{
          history: HistoryItem[];
          hasMore: boolean;
        }>(`/api/history/${tableName}/${recordId}?limit=3`);

        if (!isCancelled) {
          setRecentItems((data.history || []).slice(0, 3));
          setTotalCount(data.history ? data.history.length : 0);
        }
      } catch (err) {
        console.error('[RECENT ACTIVITY FETCH ERROR]:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchRecent();

    return () => {
      isCancelled = true;
    };
  }, [tableName, recordId, refreshTrigger]);

  return (
    <div className="pt-4 border-t border-gray-100 space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <h4 className="text-sm font-bold text-gray-900">Recent activity</h4>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <span>View all history</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading && recentItems.length === 0 ? (
        <div className="space-y-1.5 animate-pulse">
          <div className="h-7 bg-gray-100 rounded-xl" />
          <div className="h-7 bg-gray-100 rounded-xl" />
        </div>
      ) : recentItems.length === 0 ? (
        <p className="text-xs text-gray-400 py-1">No activity recorded yet.</p>
      ) : (
        <div className="space-y-1.5">
          {recentItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="text-xs text-gray-600 bg-gray-50/70 hover:bg-gray-100/70 transition-colors px-3 py-2 rounded-xl border border-gray-100 flex items-center justify-between gap-3"
            >
              <span className="truncate font-medium">{formatSingleLineHistory(item)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivitySection;
