import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi, clearApiCache } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { ProfileModal } from './ProfileModal';
import { SearchModal } from './SearchModal';
import { getAvatarByName } from '../utils/avatars';
import { matchesEntityFilter } from '../utils/entityUtils';
import { NotificationSlideOver, SlideOverNotificationItem } from './NotificationSlideOver';
import { NotificationToastQueue, ToastNotificationItem } from './NotificationToastQueue';

interface NavbarProps {
  onOpenAssignTask?: () => void;
  onOpenAddEmployee?: () => void;
  onOpenExportReport?: () => void;
  onOpenClockModal?: () => void;
  onOpenTaskModal?: () => void;
  onOpenAddEmployeeModal?: () => void;
  onOpenExportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAssignTask,
  onOpenAddEmployee,
  onOpenExportReport,
  onOpenTaskModal,
  onOpenAddEmployeeModal,
  onOpenExportModal,
}) => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [, setLocation] = useLocation();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dismissedToastIds, setDismissedToastIds] = useState<Set<string>>(new Set());

  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskItem | null>(null);

  const isEmployee = user?.role === 'EMPLOYEE';

  const loadNotifications = async () => {
    try {
      const data = await fetchApi<any[]>('/api/notifications');
      const notifList = Array.isArray(data) ? data : [];
      setNotifications(notifList);
    } catch (err) {
      console.error('[NOTIFICATIONS FETCH ERROR]:', err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [user]);

  // Pure entity-based filter: Server guarantees personal recipient isolation (WHERE user_id = req.user.id)
  const displayNotifications = useMemo(() => {
    return notifications.filter((n: any) => {
      const payload = n.payload || {};
      return matchesEntityFilter(n, selectedEntity) || matchesEntityFilter(payload, selectedEntity);
    });
  }, [notifications, selectedEntity]);

  const unreadNotificationsCount = useMemo(() => {
    return displayNotifications.filter((n: any) => !n.isRead).length;
  }, [displayNotifications]);

  // Unread toast queue (FIFO order, max 3 visible at once)
  const toastQueueItems: ToastNotificationItem[] = useMemo(() => {
    return displayNotifications
      .filter((n: any) => !n.isRead && !dismissedToastIds.has(n.id))
      .map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
        payload: n.payload,
        isRead: n.isRead,
      }));
  }, [displayNotifications, dismissedToastIds]);

  // While slide-over tray is open, suppress toasts for all notifications currently in queue
  useEffect(() => {
    if (isSlideOverOpen) {
      setDismissedToastIds((prev) => {
        const next = new Set(prev);
        notifications.forEach((n) => next.add(n.id));
        return next;
      });
    }
  }, [isSlideOverOpen, notifications]);

  const handleDismissToast = async (id: string) => {
    // 1. Mark as dismissed visually in local toast set and mark read in notifications list
    setDismissedToastIds((prev) => new Set(prev).add(id));
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true, readAt: new Date() } : item)));

    // 2. ALWAYS immediately persist read_at to the database via API call
    try {
      await fetchApi(`/api/notifications/${id}/read`, { method: 'POST' });
      clearApiCache('/api/notifications');
    } catch (err) {
      console.warn('[NOTIFICATIONS DISMISS PERSIST ERROR]:', err);
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

    // 1. Mark as read immediately in state & DB
    if (!n.isRead) {
      fetchApi(`/api/notifications/${n.id}/read`, { method: 'POST' }).catch(() => {});
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
      handleDismissToast(n.id);
    }

    // 2. Close slide-over tray if open
    setIsSlideOverOpen(false);

    // 3. Handle Meeting
    if (target.isMeeting) {
      setLocation('/meetings');
      return;
    }

    // 4. Handle Announcement
    if (target.isAnnouncement) {
      setLocation('/announcements');
      return;
    }

    // 5. Handle Task / Sprint Task
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
          toast.info(`Redirected to ${target.isSprint ? 'Sprints' : 'Tasks'} view.`);
        }
      } catch (err) {
        console.warn('[NOTIFICATION OPEN TASK ERROR]:', err);
        setLocation(target.isSprint ? '/sprints' : '/tasks');
      }
      return;
    }

    // Default fallback
    setLocation('/notifications');
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchApi('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('[MARK ALL READ ERROR]:', err);
      toast.error('Failed to mark notifications read');
    }
  };

  const openAssignTaskHandler = onOpenAssignTask || onOpenTaskModal;
  const openAddEmployeeHandler = onOpenAddEmployee || onOpenAddEmployeeModal;
  const openExportReportHandler = onOpenExportReport || onOpenExportModal;

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs select-none">
        {/* Left: Page Title & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <span className="text-gray-300 font-medium">/</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            {selectedEntity === 'EHM'
              ? 'EHM'
              : selectedEntity === 'CAG'
                ? 'CLIMAGRO'
                : 'EHM & CLIMAGRO'}
          </span>
        </div>

        {/* Middle: Global Search Input */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100/80 transition-colors shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium">Search tasks, team members, meetings...</span>
            <kbd className="ml-auto text-[10px] font-mono bg-white text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action Buttons & Notifications */}
        <div className="flex items-center gap-3">
          {!isEmployee && openAddEmployeeHandler && (
            <button
              onClick={openAddEmployeeHandler}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Team Member</span>
            </button>
          )}

          {!isEmployee && openAssignTaskHandler && (
            <button
              onClick={openAssignTaskHandler}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Assign Task</span>
            </button>
          )}

          {openExportReportHandler && (
            <button
              onClick={openExportReportHandler}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>Export Report</span>
            </button>
          )}

          {/* Notifications Slide-Over Trigger Button */}
          <div className="relative">
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all relative flex items-center justify-center cursor-pointer"
              title="Notifications"
              aria-label="Open notifications panel"
            >
              <Bell className="w-5.5 h-5.5 text-gray-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-2xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="pl-1 focus:outline-none cursor-pointer group"
            title="View Profile Details"
          >
            <img
              src={user?.avatarUrl || getAvatarByName(user?.name || user?.email)}
              alt="User avatar"
              className="w-9.5 h-9.5 rounded-full object-cover ring-2 ring-emerald-500/40 group-hover:ring-emerald-500 group-hover:scale-105 transition-all shadow-xs"
            />
          </button>
        </div>
      </header>

      {/* Slide-In Notifications Tray */}
      <NotificationSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        notifications={displayNotifications as SlideOverNotificationItem[]}
        unreadCount={unreadNotificationsCount}
        onMarkAllRead={handleMarkAllRead}
        onItemClick={handleNotificationAction}
        onViewAllHistory={() => setLocation('/notifications')}
        onDismissItem={handleDismissToast}
      />

      {/* Floating Toast Queue (Max 3 visible, FIFO queue behind it - suppressed while tray is open) */}
      <NotificationToastQueue
        notifications={toastQueueItems}
        onOpenItem={handleNotificationAction}
        onDismiss={handleDismissToast}
        maxVisible={3}
        isSuppressed={isSlideOverOpen}
      />

      {/* User Profile Middle Popup Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

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
          onDelete={() => {
            clearApiCache('/api/tasks');
            clearApiCache('/api/sprints');
            setSelectedTaskForModal(null);
          }}
        />
      )}
    </>
  );
};
