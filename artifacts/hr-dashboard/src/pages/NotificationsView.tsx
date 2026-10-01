import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Clock, CheckSquare, Calendar, Bell, AtSign, User, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, CheckCheck, FileText, ArrowRight, ArrowUpRight, Trash2 } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { fetchApi, clearApiCache } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { TaskUpdateModal, TaskItem } from '../components/TaskUpdateModal';
import { matchesEntityFilter } from '../utils/entityUtils';

export const NotificationsView: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskItem | null>(null);
  const pageSize = 20;
  const MAX_NOTIFICATIONS = 100;

  const isEmployee = user?.role === 'EMPLOYEE';

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

  const filteredNotifications = notifications.filter((n) => {
    const payload = n.payload || {};
    const matchesEntity = matchesEntityFilter(n, selectedEntity) || matchesEntityFilter(payload, selectedEntity);

    if (!isEmployee) return matchesEntity;
    const userId = user?.id;
    const empId = user?.employeeId;
    const userEmail = (user?.email || '').toLowerCase();
    const userName = (user?.name || '').toLowerCase().trim();

    const isDirectUser = n.userId === userId || (empId && n.userId === empId);
    const isTaggedUser = Array.isArray(payload.taggedUserIds) && (
      (userId && payload.taggedUserIds.includes(userId)) ||
      (empId && payload.taggedUserIds.includes(empId))
    );
    const isAssignee =
      (userId && payload.assigneeId === userId) ||
      (empId && payload.assigneeId === empId) ||
      (userEmail && payload.assigneeEmail?.toLowerCase() === userEmail) ||
      (userName && payload.assigneeName && payload.assigneeName.toLowerCase().trim() === userName);

    return matchesEntity && (isDirectUser || isTaggedUser || isAssignee);
  });

  // Pagination Logic (Max 100 notifications, 20 notifications per page)
  const cappedNotifications = filteredNotifications.slice(0, MAX_NOTIFICATIONS);
  const totalPages = Math.ceil(cappedNotifications.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = cappedNotifications.slice(startIndex, startIndex + pageSize);

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
    try {
      await fetchApi('/api/notifications/clear-all', { method: 'POST' });
      setNotifications([]);
      toast.success('All notifications cleared and emptied');
    } catch {
      toast.error('Failed to clear notifications');
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

  const renderNotifItem = (notif: any) => {
    const type = notif.type;
    const payload = notif.payload || {};

    if (type === 'TAGGED_MENTION') {
      return {
        icon: AtSign,
        iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
        title: payload.title || 'Tagged Mention Alert',
        desc: payload.message || 'You were mentioned in team discussion.',
      };
    }

    if (type === 'TASK_OVERDUE') {
      return {
        icon: AlertTriangle,
        iconBg: 'bg-red-50 text-red-600 border-red-200',
        title: `Task Due / Overdue Warning: [${payload.taskCode || 'TASK'}] ${payload.taskTitle || payload.title || ''}`,
        desc: `Deliverable task due date has arrived. Please submit output or request extension.`,
      };
    }

    if (type === 'TASK_COMPLETED') {
      return {
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        title: notif.title || `Task Completed & Signed Off: [${payload.taskCode || 'TASK'}] ${payload.title || ''}`,
        desc: notif.message || payload.message || `Deliverable task successfully completed and marked Done.`,
      };
    }

    if (type === 'TASK_REVIEW_SUBMITTED' || type === 'REVIEW_ASSIGNED') {
      return {
        icon: FileText,
        iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        title: notif.title || `Review Pending: [${payload.taskCode || 'TASK'}] ${payload.taskTitle || payload.title || ''}`,
        desc: notif.message || payload.message || `Task submitted for manager lead review & sign-off.`,
      };
    }

    if (type === 'TASK_COMMENT') {
      return {
        icon: MessageSquare,
        iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
        title: notif.title || `Task Discussion: [${payload.taskCode || 'TASK'}]`,
        desc: notif.message || payload.message || `New comment posted on task discussion thread.`,
      };
    }

    if (type === 'TASK_CHECKLIST_COMPLETE') {
      return {
        icon: CheckCheck,
        iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
        title: notif.title || `Checklist Completed: [${payload.taskCode || 'TASK'}]`,
        desc: notif.message || payload.message || `All checklist items have been checked off.`,
      };
    }

    if (type === 'CALENDAR_RECONNECT') {
      return {
        icon: RefreshCw,
        iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
        title: 'Action Required: Reconnect Google Calendar',
        desc: payload.message || 'OAuth token expiring soon. Please reconnect in Settings.',
      };
    }

    if (type === 'DELAY_REQUEST') {
      return {
        icon: Clock,
        iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
        title: `Delay Extension Submitted: [${payload.taskCode || 'TASK'}]`,
        desc: notif.message || `Your extension request for ${payload.title || 'Task'} is pending Lead approval.`,
      };
    }

    if (type === 'TASK_ASSIGNED') {
      const code = payload.taskCode || payload.sprintCode || 'TASK';
      const name = payload.taskTitle || payload.title || '';
      const displayTitle = (notif.title && (notif.title.includes('Assigned') || notif.title.includes('[')))
        ? notif.title
        : (payload.title && (payload.title.includes('Assigned') || payload.title.includes('[')))
        ? payload.title
        : `New Sprint Task Assigned: [${code}] ${name ? `"${name}"` : ''}`.trim();

      const displayDesc = (notif.message && notif.message !== name && notif.message !== notif.title)
        ? notif.message
        : (payload.message && payload.message !== name)
        ? payload.message
        : `You have been assigned to sprint task [${code}] ${name ? `"${name}"` : ''}.`.trim();

      return {
        icon: CheckSquare,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        title: displayTitle,
        desc: displayDesc,
      };
    }

    const rawTitle = notif.title || payload.title || 'System Notification';
    const rawDesc = notif.message || payload.message || 'Notification alert received';
    const finalDesc = (rawTitle === rawDesc && (payload.taskCode || payload.sprintCode))
      ? `Activity update on task [${payload.taskCode || payload.sprintCode}]`
      : rawDesc;

    return {
      icon: Bell,
      iconBg: 'bg-gray-50 text-gray-600 border-gray-200',
      title: rawTitle,
      desc: finalDesc,
    };
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notifications & Activity Feed</h2>
          <p className="text-xs text-gray-500 font-medium">
            {isEmployee
              ? `Realtime alerts & tagged mentions for ${user?.name || 'Ashutosh Mishra'}. Capped at 100 latest, 20 per page.`
              : 'Realtime manager alerts & task updates. Capped at 100 latest, 20 per page.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cappedNotifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          {cappedNotifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          {isEmployee && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tagged Alerts</span>
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-semibold text-gray-400">Loading notifications...</div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedNotifications.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-gray-400 bg-white border border-gray-200/80 rounded-2xl">
                No notifications found matching criteria.
              </div>
            ) : (
              paginatedNotifications.map((n) => {
                const item = renderNotifItem(n);
                const Icon = item.icon;
                const target = getNotificationTarget(n);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationAction(n)}
                    className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all hover:border-emerald-300 hover:shadow-sm cursor-pointer group/card"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold shadow-2xs shrink-0 ${item.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-gray-900 group-hover/card:text-emerald-700 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded">
                            @{n.payload?.assigneeName || user?.name || 'Assigned'}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {formatDateTime(n.createdAt)}
                      </span>

                      {/* Arrow Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationAction(n);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer group-hover/card:bg-emerald-600 group-hover/card:text-white"
                        title="Open in popup mode & redirect"
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

          {/* 📄 Pagination Bar (20 notifications per page, max 100) */}
          {totalPages > 1 && (
            <div className="p-3 bg-white border border-gray-200/80 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-600 shadow-2xs">
              <div>
                Showing {cappedNotifications.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, cappedNotifications.length)} of {cappedNotifications.length} notifications (Page {currentPage} of {totalPages})
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="px-2 font-mono text-emerald-800 bg-emerald-50 py-1 rounded-lg border border-emerald-200">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Task Details Popup Modal from Notification Click */}
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
              clearApiCache('/api/tasks');
              clearApiCache('/api/sprints');
              setSelectedTaskForModal(null);
            } catch (err: any) {
              toast.error(err?.message || 'Failed to update task');
            }
          }}
          onDelete={(deletedId) => {
            clearApiCache('/api/tasks');
            clearApiCache('/api/sprints');
            setSelectedTaskForModal(null);
          }}
        />
      )}
    </div>
  );
};

