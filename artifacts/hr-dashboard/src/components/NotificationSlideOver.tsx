import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  UserCheck,
  User,
  MessageSquare,
  AlertCircle,
  Clock,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { getNotificationSeverity } from '../utils/notificationUtils';

export interface SlideOverNotificationItem {
  id: string;
  type: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | Date | null;
  createdAt?: string | Date;
  payload?: any;
}

interface NotificationSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SlideOverNotificationItem[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onItemClick: (item: SlideOverNotificationItem) => void;
  onViewAllHistory: () => void;
}

export const NotificationSlideOver: React.FC<NotificationSlideOverProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAllRead,
  onItemClick,
  onViewAllHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredItems = activeTab === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[430px] max-w-full bg-white z-50 shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Notification tray"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-full bg-indigo-600 text-white shadow-2xs">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">Your personal action feed</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close tray"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & Tab Filters */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/40">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {activeTab === 'unread'
                  ? "You are all caught up! No unread notifications."
                  : 'When tasks are assigned, commented on, or completed, they will appear here.'}
              </p>
            </div>
          ) : (
            filteredItems.map((n) => {
              const severity = getNotificationSeverity(n.type);
              const payload = n.payload || {};
              const entityCode = payload.taskCode || payload.entityCode || payload.code || null;
              const actorName = payload.actorName || payload.authorName || payload.changedByName || null;

              const getSeverityIcon = () => {
                switch (severity.severity) {
                  case 'emerald':
                    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
                  case 'indigo':
                    return <UserCheck className="w-3.5 h-3.5 text-indigo-600" />;
                  case 'violet':
                    return <MessageSquare className="w-3.5 h-3.5 text-violet-600" />;
                  case 'amber':
                    return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
                  case 'blue':
                  default:
                    return <Clock className="w-3.5 h-3.5 text-blue-600" />;
                }
              };

              return (
                <div
                  key={n.id}
                  onClick={() => onItemClick(n)}
                  className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer group hover:shadow-md ${
                    severity.borderAccent
                  } border-l-4 ${
                    n.isRead
                      ? 'bg-white border-slate-200/70 opacity-75 hover:opacity-100'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${severity.badgeBg}`}
                      >
                        {getSeverityIcon()}
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
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>

                  <h4
                    className={`text-xs font-bold leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors ${
                      n.isRead ? 'text-slate-600' : 'text-slate-900'
                    }`}
                  >
                    {n.title}
                  </h4>

                  <p
                    className={`text-[11px] leading-relaxed line-clamp-2 mt-1 ${
                      n.isRead ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {n.message}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-between text-[11px] font-bold text-slate-600 group-hover:text-indigo-600">
                    <span className="flex items-center gap-1">
                      {n.isRead ? 'View details' : 'Mark as read & view'}
                    </span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white">
          <button
            onClick={() => {
              onClose();
              onViewAllHistory();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>View Full Notifications History</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};
