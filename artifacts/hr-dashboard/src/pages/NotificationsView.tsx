import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckSquare,
  Calendar,
  Bell,
  AtSign,
  User,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCheck,
  FileText,
  ArrowRight,
  UserCheck,
  Trash2,
  Filter,
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { fetchApi } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { TaskUpdateModal, TaskItem } from '../components/TaskUpdateModal';
import { matchesEntityFilter } from '../utils/entityUtils';
import { getNotificationSeverity } from '../utils/notificationUtils';

export const NotificationsView: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'completed' | 'assigned' | 'status' | 'comments' | 'action'>('all');
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskItem | null>(null);
  const pageSize = 20;
  const MAX_NOTIFICATIONS = 100;

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any[]>('/api/notifications').catch(() => []);
      const notifList = Array.isArray(data) ? data : [];
      setNotifications(notifList);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  // Strictly filter by entity only — zero name-string comparison or role bypass
  const entityFiltered = useMemo(() => {
    return notifications.filter((n) => {
      const payload = n.payload || {};
      return matchesEntityFilter(n, selectedEntity) || matchesEntityFilter(payload, selectedEntity);
    });
  }, [notifications, selectedEntity]);

  // Apply tab filter
  const filteredNotifications = useMemo(() => {
    return entityFiltered.filter((n) => {
      if (activeFilter === 'unread') return !n.isRead;
      const sev = getNotificationSeverity(n.type);
      if (activeFilter === 'completed') return sev.severity === 'emerald';
      if (activeFilter === 'assigned') return sev.severity === 'indigo';
      if (activeFilter === 'status') return sev.severity === 'blue';
      if (activeFilter === 'comments') return sev.severity === 'violet';
      if (activeFilter === 'action') return sev.severity === 'amber';
      return true;
    });
  }, [entityFiltered, activeFilter]);

  // Pagination Logic (Max 100 notifications, 20 notifications per page)
  const cappedNotifications = filteredNotifications.slice(0, MAX_NOTIFICATIONS);
  const totalPages = Math.ceil(cappedNotifications.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = cappedNotifications.slice(startIndex, startIndex + pageSize);

  const unreadCount = entityFiltered.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await fetchApi('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications read');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all notification history? This cannot be undone.')) {
      return;
    }
    try {
      await fetchApi('/api/notifications/clear-all', { method: 'POST' });
      setNotifications([]);
      toast.success('Notification history deleted');
    } catch {
      toast.error('Failed to delete notifications');
    }
  };

  const getNotificationTarget = (n: any) => {
    const payload = n.payload || {};
    const type = n.type || '';
    const taskCode = payload.taskCode || null;
    const taskId = payload.taskId || null;
    const isSprint = Boolean(payload.sprintId || type.includes('SPRINT'));
    const isMeeting = Boolean(payload.meetingId || type.includes('MEETING'));
    const isAnnouncement = Boolean(payload.announcementId || type.includes('ANNOUNCEMENT'));

    let label = 'Details';
    if (isSprint) label = 'Sprint Task';
    else if (taskId || taskCode || type.includes('TASK') || type.includes('DELAY')) label = 'Task';
    else if (isMeeting) label = 'Meeting';
    else if (isAnnouncement) label = 'Announcement';

    return {
      taskId,
      taskCode,
      isSprint,
      isMeeting,
      isAnnouncement,
      isTask: Boolean(taskId || taskCode || type.includes('TASK') || type.includes('DELAY')),
      label,
    };
  };

  const handleNotificationAction = async (n: any) => {
    const target = getNotificationTarget(n);

    if (!n.isRead) {
      fetchApi(`/api/notifications/${n.id}/read`, { method: 'POST' }).catch(() => {});
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
    }

    if (target.isMeeting) {
      setLocation('/meetings');
      return;
    }

    if (target.isAnnouncement) {
      setLocation('/announcements');
      return;
    }

    if (target.isTask && (target.taskId || target.taskCode)) {
      const identifier = target.taskId || target.taskCode;
      try {
        let taskData: any = null;
        try {
          taskData = await fetchApi<any>(`/api/tasks/${identifier}`);
        } catch {}

        if (!taskData || !taskData.id) {
          const allTasks = await fetchApi<any[]>('/api/tasks').catch(() => []);
          taskData = allTasks.find(
            (t) =>
              t.id === target.taskId ||
              (target.taskCode && t.taskCode?.toLowerCase() === target.taskCode.toLowerCase())
          );
        }

        if (taskData && taskData.id) {
          const resolvedCode = taskData.taskCode || taskData.taskId || target.taskCode || target.taskId || '';
          const resolvedEntity = taskData.entityCode || taskData.entity || taskData.entityName || 'EHM';

          setSelectedTaskForModal({
            ...taskData,
            taskId: resolvedCode,
            taskCode: resolvedCode,
            entity: resolvedEntity,
          });
        } else {
          setLocation(target.isSprint ? '/sprints' : '/tasks');
        }
      } catch (err) {
        setLocation(target.isSprint ? '/sprints' : '/tasks');
      }
      return;
    }

    setLocation('/tasks');
  };

  const getSeverityIcon = (severityType: string) => {
    switch (severityType) {
      case 'emerald':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'indigo':
        return <UserCheck className="w-5 h-5 text-indigo-600" />;
      case 'violet':
        return <MessageSquare className="w-5 h-5 text-violet-600" />;
      case 'amber':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'blue':
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notifications & Activity Feed</h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-2xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Personal notifications for {user?.name || user?.email}. Showing up to 100 items (20 per page).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          {entityFiltered.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Permanently delete all notification history (requires confirmation)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({entityFiltered.length})
        </button>

        <button
          onClick={() => { setActiveFilter('unread'); setCurrentPage(1); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'unread'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeFilter === 'unread' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveFilter('completed'); setCurrentPage(1); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          Completed
        </button>

        <button
          onClick={() => { setActiveFilter('assigned'); setCurrentPage(1); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeFilter === 'assigned'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
          }`}
        >
          Assigned
        </button>

        <button
          onClick={() => { setActiveFilter('status'); setCurrentPage(1); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeFilter === 'status'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
          }`}
        >
          Status Updates
        </button>

        <button
          onClick={() => { setActiveFilter('comments'); setCurrentPage(1); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeFilter === 'comments'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-violet-50 text-violet-800 hover:bg-violet-100'
          }`}
        >
          Comments
        </button>

        <button
          onClick={() => { setActiveFilter('action'); setCurrentPage(1); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeFilter === 'action'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          Action Required
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-400">Loading notifications...</div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedNotifications.length === 0 ? (
              <div className="py-16 text-center text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded-2xl">
                No notifications found matching filter.
              </div>
            ) : (
              paginatedNotifications.map((n) => {
                const severity = getNotificationSeverity(n.type);
                const target = getNotificationTarget(n);
                const payload = n.payload || {};
                const entityCode = payload.taskCode || payload.entityCode || payload.code || null;
                const actorName = payload.actorName || payload.authorName || payload.changedByName || null;

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationAction(n)}
                    className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer group/card ${
                      severity.borderAccent
                    } border-l-4 ${
                      n.isRead
                        ? 'bg-slate-50/70 border-slate-200/80 opacity-70 hover:opacity-100 hover:bg-white'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold shadow-2xs shrink-0 ${severity.iconBg} ${severity.badgeBg}`}>
                        {getSeverityIcon(severity.severity)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${severity.badgeBg}`}
                          >
                            {severity.label}
                          </span>

                          {entityCode && (
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              {entityCode}
                            </span>
                          )}

                          {actorName && (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-200">
                              <User className="w-2.5 h-2.5 text-slate-500" />
                              <span>by <strong className="font-semibold text-slate-900">{actorName}</strong></span>
                            </span>
                          )}

                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" title="Unread" />
                          )}
                        </div>

                        <h4
                          className={`text-xs font-bold transition-colors line-clamp-1 ${
                            n.isRead
                              ? 'text-slate-600 group-hover/card:text-slate-900'
                              : 'text-slate-900 group-hover/card:text-indigo-600'
                          }`}
                        >
                          {n.title}
                        </h4>

                        <p
                          className={`text-[11px] font-medium leading-relaxed mt-0.5 line-clamp-2 ${
                            n.isRead ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {n.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDateTime(n.createdAt)}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationAction(n);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          n.isRead
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200'
                        }`}
                        title="Open details"
                      >
                        <span>Open {target.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/card:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Showing {startIndex + 1}–{Math.min(startIndex + pageSize, cappedNotifications.length)} of {cappedNotifications.length}
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Update Modal */}
      {selectedTaskForModal && (
        <TaskUpdateModal
          isOpen={!!selectedTaskForModal}
          task={selectedTaskForModal}
          onClose={() => setSelectedTaskForModal(null)}
          onSave={async (updatedTask) => {
            try {
              await fetchApi(`/api/tasks/${updatedTask.id}`, {
                method: 'PATCH',
                body: JSON.stringify(updatedTask),
              });
              toast.success(`Task ${updatedTask.taskCode || ''} updated successfully!`);
              setSelectedTaskForModal(null);
            } catch (err: any) {
              toast.error(err?.message || 'Failed to update task');
            }
          }}
          onDelete={() => {
            setSelectedTaskForModal(null);
          }}
        />
      )}
    </div>
  );
};
