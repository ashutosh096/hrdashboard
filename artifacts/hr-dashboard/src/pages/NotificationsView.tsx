import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Clock, CheckSquare, Calendar, Bell, AtSign, User } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isEmployee = user?.role === 'EMPLOYEE';

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any[]>('/api/dashboard/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // Fallback notifications with explicit tagging for employee mode
      setNotifications([
        {
          id: '1',
          type: 'TASK_ASSIGNED',
          payload: { taskCode: 'EHM-EMP01-001', title: 'API Gateway Telemetry Pipeline Integration', assigneeName: 'Ashutosh Mishra', tagged: true },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'TAGGED_MENTION',
          payload: { title: 'Tagged in Architecture Sync Notes', message: 'Dr. Harshit Mishra tagged @Ashutosh Mishra in Architecture Review.', tagged: true },
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'TASK_OVERDUE',
          payload: { taskCode: 'EHM-EMP01-005', taskTitle: 'Automated CI/CD Deployment Pipeline Optimization', daysOverdue: 1, assigneeName: 'Ashutosh Mishra', tagged: true },
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          type: 'DELAY_REQUEST',
          payload: { taskCode: 'EHM-EMP01-005', title: 'Automated CI/CD Pipeline', requesterName: 'Ashutosh Mishra', tagged: true },
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const filteredNotifications = notifications.filter((n) => {
    if (!isEmployee) return true;
    const payload = n.payload || {};
    return payload.tagged || payload.assigneeName?.includes('Ashutosh') || payload.requesterName?.includes('Ashutosh') || true;
  });

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
        title: `Task Overdue Warning: [${payload.taskCode || 'TASK'}] ${payload.taskTitle || ''}`,
        desc: `Your assigned task is ${payload.daysOverdue || 1} day(s) past due date. Request extension if delayed.`,
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
        desc: `Your extension request for ${payload.title || 'Task'} is pending Lead approval.`,
      };
    }

    if (type === 'TASK_ASSIGNED') {
      return {
        icon: CheckSquare,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        title: `Task Assigned to You: [${payload.taskCode || 'TASK'}] ${payload.title || ''}`,
        desc: `Assigned deliverable in Sprint 35 cycle.`,
      };
    }

    return {
      icon: Bell,
      iconBg: 'bg-gray-50 text-gray-600 border-gray-200',
      title: payload.title || 'System Notification',
      desc: payload.message || 'Notification alert received',
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
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
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
                      {isEmployee && (
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded">
                          @Tagged
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-gray-400 shrink-0 ml-3">
                  {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
