import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Chrome, Check, AlertCircle, Calendar, ShieldCheck, UserCheck, Sparkles, ArrowRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi, clearApiCache } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { formatDateTime } from '../utils/dateUtils';
import { ProfileModal } from './ProfileModal';
import { SearchModal } from './SearchModal';
import { getAvatarByName } from '../utils/avatars';
import { matchesEntityFilter } from '../utils/entityUtils';

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
}) => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const isEmployee = user?.role === 'EMPLOYEE';

  const loadNotifications = async () => {
    try {
      const data = await fetchApi<any[]>('/api/notifications');
      const notifList = Array.isArray(data) ? data : [];
      setNotifications(notifList);
      const unread = notifList.filter((n: any) => !n.isRead).length;
      setUnreadNotificationsCount(unread);
    } catch (err) {
      console.error('[NOTIFICATIONS FETCH ERROR]:', err);
      setNotifications([]);
      setUnreadNotificationsCount(0);
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
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };

    if (showNotificationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown]);

  const [, setLocation] = useLocation();
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskItem | null>(null);
  const [isLoadingTaskModal, setIsLoadingTaskModal] = useState(false);

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
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    }

    // 2. Close notifications dropdown
    setShowNotificationsDropdown(false);

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
      setIsLoadingTaskModal(true);
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
      } finally {
        setIsLoadingTaskModal(false);
      }
      return;
    }

    // Default fallback
    setLocation('/notifications');
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchApi('/api/notifications/read-all', { method: 'POST' });
      setUnreadNotificationsCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('[MARK ALL READ ERROR]:', err);
    }
  };

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
          {!isEmployee && onOpenAddEmployee && (
            <button
              onClick={onOpenAddEmployee}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Team Member</span>
            </button>
          )}

          {!isEmployee && onOpenAssignTask && (
            <button
              onClick={onOpenAssignTask}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Assign Task</span>
            </button>

          )}

          {onOpenExportReport && (
            <button
              onClick={onOpenExportReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>Export Report</span>
            </button>
          )}

          {/* Notifications Dropdown Container */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all relative flex items-center justify-center cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5.5 h-5.5 text-gray-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-2xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Flyout Dropdown */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(() => {
                    const displayNotifications = notifications.filter((n: any) => {
                      const payload = n.payload || {};
                      const matchesEntity = matchesEntityFilter(n, selectedEntity) || matchesEntityFilter(payload, selectedEntity);
                      if (!isEmployee) return matchesEntity;

                      const userId = user?.id;
                      const empId = user?.employeeId;
                      const userName = (user?.name || '').toLowerCase();
                      const userEmail = (user?.email || '').toLowerCase();

                      const isDirect = n.userId === userId || (empId && n.userId === empId);
                      const isTagged = Array.isArray(payload.taggedUserIds) && (
                        (userId && payload.taggedUserIds.includes(userId)) ||
                        (empId && payload.taggedUserIds.includes(empId))
                      );
                      const isAssignee =
                        (userId && payload.assigneeId === userId) ||
                        (empId && payload.assigneeId === empId) ||
                        (userEmail && payload.assigneeEmail?.toLowerCase() === userEmail) ||
                        (userName && payload.assigneeName && payload.assigneeName.toLowerCase().trim() === userName);

                      const msgLower = (n.message || '').toLowerCase();
                      const titleLower = (n.title || '').toLowerCase();
                      const isUserMatch = isDirect || isTagged || isAssignee || n.tagged || (userName && (msgLower.includes(userName) || titleLower.includes(userName)));
                      return matchesEntity && isUserMatch;
                    });

                    if (displayNotifications.length === 0) {
                      return <p className="text-xs text-gray-400 py-4 text-center">No notifications right now</p>;
                    }

                    return displayNotifications.map((n) => {
                      const target = getNotificationTarget(n);

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationAction(n)}
                          className={`p-3 rounded-2xl border text-xs space-y-1.5 transition-all cursor-pointer hover:shadow-xs group/card ${
                            n.isRead
                              ? 'bg-white border-gray-100 hover:border-gray-200 opacity-75 hover:opacity-100'
                              : 'bg-emerald-50/50 border-emerald-100/90 hover:border-emerald-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-gray-900 group-hover/card:text-emerald-700 transition-colors line-clamp-1">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold shrink-0">
                              {formatDateTime(n.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{n.message}</p>

                          {/* Arrow at bottom to redirect and open in popup mode */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationAction(n);
                            }}
                            className="mt-2 pt-1.5 border-t border-gray-100/80 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover/card:text-emerald-800 select-none transition-colors"
                            title="Click to view details in popup mode"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="truncate">Open {target.label}</span>
                              {target.taskCode && (
                                <span className="text-[9.5px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold tracking-tight shrink-0">
                                  {target.taskCode}
                                </span>
                              )}
                            </div>

                            <div className="w-5 h-5 rounded-full bg-emerald-100/90 group-hover/card:bg-emerald-200 flex items-center justify-center text-emerald-700 transition-all shrink-0 shadow-2xs group-hover/card:translate-x-0.5">
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar — Opens Profile Details Modal */}
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
          onDelete={(deletedId) => {
            clearApiCache('/api/tasks');
            clearApiCache('/api/sprints');
            setSelectedTaskForModal(null);
          }}
        />
      )}
    </>
  );
};

