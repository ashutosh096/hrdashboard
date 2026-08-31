import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Bell, Plus, Download, UserPlus, CheckCircle, Calendar, Megaphone, X, Send, Eye, FileCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { ProfileModal } from './ProfileModal';
import { TaskUpdateModal } from './TaskUpdateModal';

interface NavbarProps {
  onOpenClockModal?: () => void;
  onOpenTaskModal?: () => void;
  onOpenAddEmployeeModal?: () => void;
  onOpenExportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTaskModal,
  onOpenAddEmployeeModal,
  onOpenExportModal,
}) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [selectedTaskToReview, setSelectedTaskToReview] = useState<any>(null);

  const isEmployee = user?.role === 'EMPLOYEE';

  const entityLabel =
    selectedEntity === 'ALL'
      ? 'ehmconsultancy & climagroanalytics'
      : selectedEntity === 'EHM'
      ? 'ehmconsultancy'
      : 'climagroanalytics';

  // Manager Notifications vs Employee Notifications
  const managerNotifications = [
    {
      id: 'm-1',
      title: 'Employee Submission: Priya Sharma submitted task EHM-MAR-ADH-672',
      time: '5 mins ago',
      icon: FileCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      taskData: {
        id: 't-1',
        taskId: 'EHM-MAR-ADH-672',
        title: 'Brand Refresh Assets & Social Kit',
        entity: 'ehmconsultancy',
        assignee: 'Priya Sharma',
        reviewingLead: 'Dr. Harshit Mishra',
        status: 'Done' as const,
        outputUrl: 'https://canva.link/ehm-brand-social-kit',
        notes: 'Finalized logo variants and social media export files.',
      },
    },
    {
      id: 'm-2',
      title: 'Task Delay Notice: Rahul Verma requested delay extension on CAG-DEV-SPR-101',
      time: '20 mins ago',
      icon: Send,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      taskData: {
        id: 't-2',
        taskId: 'CAG-DEV-SPR-101',
        title: 'IoT Sensor API Gateway v2',
        entity: 'climagroanalytics',
        assignee: 'Rahul Verma',
        reviewingLead: 'Neha Shukla',
        status: 'Delayed' as const,
        outputUrl: 'https://github.com/climagro/api-gateway',
        notes: 'Waiting on sensor telemetry hardware specs.',
      },
    },
    {
      id: 'm-3',
      title: 'Attendance Alert: Anita Desai marked Present (In Office)',
      time: '1 hour ago',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ];

  const employeeNotifications = [
    { id: 'e-1', title: 'New Task Assigned: EHM-MAR-ADH-672', time: '10 mins ago', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'e-2', title: 'Upcoming Meeting: Team Standup at 09:00 AM', time: '45 mins ago', icon: Calendar, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'e-3', title: 'Pinned Announcement: Q3 All-Hands Review', time: '2 hours ago', icon: Megaphone, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  const activeNotifications = isEmployee ? employeeNotifications : managerNotifications;

  const handleNotificationClick = (n: any) => {
    setShowNotificationsDropdown(false);
    if (!isEmployee && n.taskData) {
      setSelectedTaskToReview(n.taskData);
    } else {
      setLocation('/notifications');
    }
  };

  return (
    <div className="sticky top-3 z-30 px-6 py-1 select-none">
      {/* Capsule Header Container */}
      <header className="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-full px-5 py-2.5 shadow-md shadow-gray-200/40 flex items-center justify-between gap-4 transition-all duration-300">
        
        {/* Left: Title, Entity Badge & Employee Name/Role Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight leading-tight">Dashboard</h1>
            <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
              {isEmployee ? 'My daily deliverables and meetings' : 'Check your tasks and progress here.'}
            </p>
          </div>

          {/* Capsule Entity Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50/90 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-800 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate max-w-[220px] lg:max-w-none">{entityLabel}</span>
          </div>

          {/* Employee Role & Name Capsule Badge */}
          {isEmployee && (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-800 shrink-0 animate-in fade-in duration-200">
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                Employee
              </span>
              <span className="font-bold text-gray-900 truncate max-w-[150px]">
                {user?.name || 'Priya Sharma'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls & Utilities */}
        <div className="flex items-center gap-2.5 shrink-0 relative">
          {/* Manager / Admin-only Action Buttons */}
          {!isEmployee && (
            <>
              {onOpenAddEmployeeModal && (
                <button
                  onClick={onOpenAddEmployeeModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-full shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Employee</span>
                </button>
              )}

              {onOpenTaskModal && (
                <button
                  onClick={onOpenTaskModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-full shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Task</span>
                </button>
              )}

              {onOpenExportModal && (
                <button
                  onClick={onOpenExportModal}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-full border border-gray-200/80 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Export Report</span>
                </button>
              )}
            </>
          )}

          <div className="h-5 w-px bg-gray-200 my-auto mx-0.5 hidden sm:block"></div>

          {/* Notification Bell with Red Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-gray-700" />
              {/* Red Notification Count Badge */}
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-xs animate-pulse">
                {activeNotifications.length}
              </span>
            </button>

            {/* Notifications Dropdown Popup */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {isEmployee ? 'Realtime task & meeting alerts.' : 'Employee task submissions & delay alerts.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNotificationsDropdown(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeNotifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className="p-2.5 border border-gray-100 hover:border-emerald-200 bg-gray-50/60 hover:bg-emerald-50/40 rounded-xl flex items-start justify-between gap-2.5 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-1.5 rounded-lg border shrink-0 ${n.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 leading-tight">{n.title}</p>
                            <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-gray-100 text-center mt-3">
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      setLocation('/notifications');
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    View All Notifications →
                  </button>
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
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
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

      {/* Submission Review Modal for Manager when notification is clicked */}
      <TaskUpdateModal
        isOpen={!!selectedTaskToReview}
        task={selectedTaskToReview}
        onClose={() => setSelectedTaskToReview(null)}
        onSave={() => {
          setSelectedTaskToReview(null);
        }}
      />
    </div>
  );
};
