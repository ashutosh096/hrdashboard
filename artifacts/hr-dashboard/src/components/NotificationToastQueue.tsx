import React, { useEffect, useState, useRef } from 'react';
import { X, ArrowRight, CheckCircle2, UserCheck, User, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { getNotificationSeverity } from '../utils/notificationUtils';

export interface ToastNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt?: string | Date;
  payload?: any;
  isRead?: boolean;
}

interface NotificationToastQueueProps {
  notifications: ToastNotificationItem[];
  onOpenItem: (item: ToastNotificationItem) => void;
  onDismiss: (id: string) => void;
  maxVisible?: number;
}

export const NotificationToastQueue: React.FC<NotificationToastQueueProps> = ({
  notifications,
  onOpenItem,
  onDismiss,
  maxVisible = 3,
}) => {
  // Visible slice (max 3 items at a time, FIFO order)
  const visibleToasts = notifications.slice(0, maxVisible);

  // Auto-dismiss each toast after 6 seconds
  useEffect(() => {
    if (visibleToasts.length === 0) return;

    const timer = setTimeout(() => {
      // Dismiss the oldest visible toast (FIFO)
      const oldest = visibleToasts[0];
      if (oldest) {
        onDismiss(oldest.id);
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [visibleToasts, onDismiss]);

  if (visibleToasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {visibleToasts.map((toast, index) => {
        const severity = getNotificationSeverity(toast.type);

        const getIcon = () => {
          switch (severity.severity) {
            case 'emerald':
              return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
            case 'indigo':
              return <UserCheck className="w-4 h-4 text-indigo-600" />;
            case 'violet':
              return <MessageSquare className="w-4 h-4 text-violet-600" />;
            case 'amber':
              return <AlertCircle className="w-4 h-4 text-amber-600" />;
            case 'blue':
            default:
              return <Clock className="w-4 h-4 text-blue-600" />;
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white border border-slate-200/90 shadow-xl rounded-2xl p-3.5 flex items-start gap-3 transition-all duration-200 hover:shadow-2xl animate-in slide-in-from-right-4 fade-in ${severity.borderAccent} border-l-4`}
            style={{
              transform: `translateY(${index * 2}px)`,
            }}
          >
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${severity.iconBg}`}>
              {getIcon()}
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onOpenItem(toast)}
            >
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${severity.badgeBg}`}
                >
                  {severity.label}
                </span>
                {(toast.payload?.taskCode || toast.payload?.entityCode || toast.payload?.code) && (
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    {toast.payload.taskCode || toast.payload.entityCode || toast.payload.code}
                  </span>
                )}
                {(toast.payload?.actorName || toast.payload?.authorName || toast.payload?.changedByName) && (
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-200">
                    <User className="w-2.5 h-2.5 text-slate-500" />
                    <span>by <strong className="font-semibold text-slate-900">{toast.payload.actorName || toast.payload.authorName || toast.payload.changedByName}</strong></span>
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1 hover:text-indigo-600 transition-colors">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 mt-0.5">
                {toast.message}
              </p>

              <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-slate-500 hover:text-slate-900">
                <span>View item</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}

      {notifications.length > maxVisible && (
        <div className="text-right pr-2">
          <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded-full shadow-xs">
            +{notifications.length - maxVisible} more in queue
          </span>
        </div>
      )}
    </div>
  );
};
