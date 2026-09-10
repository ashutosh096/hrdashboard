import React, { useState, useEffect } from 'react';
import { Search, Bell, Chrome, Check, AlertCircle, Calendar, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';
import { ProfileModal } from './ProfileModal';
import { SearchModal } from './SearchModal';
import { getAvatarByName } from '../utils/avatars';

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
  }, []);

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
            <span className="font-medium">Search tasks, employees, meetings...</span>
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
              <span>Add Employee</span>
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
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
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
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No notifications right now</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 transition-colors ${
                          n.isRead ? 'bg-white border-gray-100 opacity-60' : 'bg-emerald-50/50 border-emerald-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{n.title}</span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar — Opens Profile Details Modal */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="pl-1 focus:outline-none"
            title="View Profile Details"
          >
            <img
              src={user?.avatarUrl || getAvatarByName(user?.name || user?.email)}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 hover:ring-emerald-500 transition-all shadow-2xs cursor-pointer"
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
    </>
  );
};
