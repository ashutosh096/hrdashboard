import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Clock, CheckSquare, Calendar, Bell, AtSign, User, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, CheckCheck, FileText } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { fetchApi } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { matchesEntityFilter } from '../utils/entityUtils';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  // Pagination Logic (10 notifications per page)
  const totalPages = Math.ceil(filteredNotifications.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + pageSize);

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
      return {
        icon: CheckSquare,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        title: notif.title || `Task Assigned: [${payload.taskCode || 'TASK'}] ${payload.title || ''}`,
        desc: notif.message || payload.message || `Assigned deliverable in Sprint cycle.`,
      };
    }

    return {
      icon: Bell,
      iconBg: 'bg-gray-50 text-gray-600 border-gray-200',
      title: notif.title || payload.title || 'System Notification',
      desc: notif.message || payload.message || 'Notification alert received',
    };
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notifications & Activity Feed</h2>
          <p className="text-xs text-gray-500 font-medium">
            {isEmployee
              ? `Realtime alerts & tagged mentions for ${user?.name || 'Ashutosh Mishra'}.`
              : 'Realtime manager alerts, task overdue warnings & system status updates.'}
          </p>
        </div>

        {isEmployee && (
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tagged Employee Alerts</span>
          </span>
        )}
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
                return (
                  <div key={n.id} className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-xs flex items-center justify-between transition-all hover:border-gray-300">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold shadow-2xs shrink-0 ${item.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                          <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded">
                            @{n.payload?.assigneeName || user?.name || 'Assigned'}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-3 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* 📄 Pagination Bar (10 notifications per page) */}
          {totalPages > 1 && (
            <div className="p-3 bg-white border border-gray-200/80 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-600 shadow-2xs">
              <div>
                Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredNotifications.length)} of {filteredNotifications.length} notifications
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
    </div>
  );
};
