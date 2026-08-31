import React from 'react';
import { useLocation, Link } from 'wouter';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  Building2,
  Clock,
  Briefcase,
  Megaphone,
  Bell,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useEntity } from '../contexts/EntityContext';

export const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { selectedEntity, setSelectedEntity } = useEntity();

  const navSections = [
    {
      title: 'Work',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare },
        { label: 'Team Tasks', path: '/team-tasks', icon: Users },
        { label: 'Meetings', path: '/meetings', icon: Calendar },
        { label: 'Office Today', path: '/office-today', icon: Building2 },
      ],
    },
    {
      title: 'People',
      items: [
        { label: 'Attendance', path: '/attendance', icon: Clock },
        { label: 'Team', path: '/team', icon: Users },
        { label: 'Applications', path: '/applications', icon: Briefcase },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'Announcements', path: '/announcements', icon: Megaphone },
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <span className="font-bold text-gray-900 tracking-tight text-lg">Workspace</span>
          <span className="text-xs block text-emerald-600 font-bold -mt-1">EHM-Climagro OS</span>
        </div>
      </div>

      {/* Entity / Team Selector Dropdown */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <button
            onClick={() => {
              const next = selectedEntity === 'ALL' ? 'EHM' : selectedEntity === 'EHM' ? 'CAG' : 'ALL';
              setSelectedEntity(next);
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="truncate">
                {selectedEntity === 'ALL'
                  ? 'EHM Consultancy & Climagro Analytics'
                  : selectedEntity === 'EHM'
                  ? 'ehmconsultancy'
                  : 'climagroanalytics'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Primary Navigation Box Boundary */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-2.5 space-y-4 shadow-2xs">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 pt-1 pb-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{section.title}</span>
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-emerald-800 border border-emerald-300 shadow-sm'
                        : 'text-gray-600 hover:bg-white/80 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                          isActive
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-gray-500 border-gray-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
