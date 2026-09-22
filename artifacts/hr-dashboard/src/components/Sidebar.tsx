import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  Clock,
  FolderKanban,
  Megaphone,
  Bell,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useEntity } from '../contexts/EntityContext';

export const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { selectedEntity, setSelectedEntity } = useEntity();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hros_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [hoveredTooltip, setHoveredTooltip] = useState<{
    label: string;
    top: number;
    isActive?: boolean;
  } | null>(null);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('hros_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
    setHoveredTooltip(null);
  };

  const navSections = [
    {
      title: 'Work',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Product Backlog', path: '/tasks', icon: CheckSquare },
        { label: 'Sprints', path: '/sprints', icon: Zap },
        { label: 'Projects', path: '/projects', icon: FolderKanban },
        { label: 'Meetings', path: '/meetings', icon: Calendar },
      ],
    },
    {
      title: 'People',
      items: [
        { label: 'Attendance', path: '/attendance', icon: Clock },
        { label: 'Team', path: '/team', icon: Users },
        { label: 'Notifications', path: '/notifications', icon: Bell },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'Announcements', path: '/announcements', icon: Megaphone },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      <aside
        className={`border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0 z-30 select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className={`border-b border-gray-100 flex items-center ${isCollapsed ? 'p-3 justify-center' : 'p-4 justify-start'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="font-bold text-gray-900 tracking-tight text-lg truncate block">Workspace</span>
                <span className="text-xs block text-emerald-600 font-bold -mt-1 truncate">EHM-Climagro OS</span>
              </div>
            )}
          </div>
        </div>

        {/* Entity / Team Selector Dropdown */}
        <div className={`border-b border-gray-100 ${isCollapsed ? 'p-2.5 flex justify-center' : 'px-4 py-3'}`}>
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => {
                const next = selectedEntity === 'ALL' ? 'EHM' : selectedEntity === 'EHM' ? 'CAG' : 'ALL';
                setSelectedEntity(next);
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTooltip({
                  label: `Entity: ${selectedEntity === 'ALL' ? 'ALL (EHM & CAG)' : selectedEntity}`,
                  top: rect.top + rect.height / 2,
                });
              }}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-black text-gray-800 transition-colors shadow-2xs cursor-pointer"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  selectedEntity === 'CAG' ? 'bg-amber-500' : selectedEntity === 'EHM' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}
              />
            </button>
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedEntity === 'CAG' ? 'bg-amber-500' : selectedEntity === 'EHM' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value as 'ALL' | 'EHM' | 'CAG')}
                className="w-full pl-7 pr-8 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none cursor-pointer appearance-none transition-colors shadow-2xs"
                title="Filter Workspace by Entity"
              >
                <option value="ALL">● EHM & CLIMAGRO (ALL)</option>
                <option value="EHM">● EHM</option>
                <option value="CAG">● CLIMAGRO</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Primary Navigation Box Boundary */}
        <div
          className="flex-1 overflow-y-auto p-2.5 custom-scrollbar"
          onScroll={() => setHoveredTooltip(null)}
        >
          <div
            className={`bg-gray-50/70 border border-gray-200/80 rounded-2xl shadow-2xs transition-all ${
              isCollapsed ? 'p-1.5 space-y-3 flex flex-col items-center' : 'p-2.5 space-y-4'
            }`}
          >
            {navSections.map((section, sIdx) => (
              <div key={section.title} className={`w-full ${isCollapsed ? 'space-y-1.5' : 'space-y-1'}`}>
                {!isCollapsed ? (
                  <div className="px-2 pt-1 pb-1">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{section.title}</span>
                  </div>
                ) : sIdx > 0 ? (
                  <div className="w-6 h-[1px] bg-gray-200 mx-auto my-1.5" />
                ) : null}

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;

                  return (
                    <div key={item.path} className="w-full flex justify-center">
                      <Link
                        href={item.path}
                        onMouseEnter={(e) => {
                          if (isCollapsed) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredTooltip({
                              label: item.label,
                              top: rect.top + rect.height / 2,
                              isActive,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredTooltip(null)}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isCollapsed
                            ? `w-10 h-10 justify-center ${
                                isActive
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                                  : 'text-gray-600 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200 shadow-2xs'
                              }`
                            : `justify-between px-2.5 py-1.5 w-full ${
                                isActive
                                  ? 'bg-white text-emerald-800 border border-emerald-300 shadow-sm'
                                  : 'text-gray-600 hover:bg-white/80 hover:text-gray-900'
                              }`
                        }`}
                      >
                        {isCollapsed ? (
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        ) : (
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                                isActive
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white text-gray-500 border-gray-200'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{item.label}</span>
                          </div>
                        )}
                        {!isCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                      </Link>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Collapse / Expand Toggle Section (Marked in Red in Footer) */}
        <div className={`p-2.5 border-t border-gray-200 bg-white/80 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            type="button"
            onClick={toggleCollapsed}
            onMouseEnter={(e) => {
              if (isCollapsed) {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTooltip({
                  label: 'Expand Sidebar',
                  top: rect.top + rect.height / 2,
                });
              }
            }}
            onMouseLeave={() => setHoveredTooltip(null)}
            className={`flex items-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isCollapsed
                ? 'w-10 h-10 justify-center bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 shadow-2xs'
                : 'w-full justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200/80 shadow-2xs'
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-600 font-semibold text-[11px]">
                  <PanelLeftClose className="w-4 h-4 text-gray-500" />
                  <span>Collapse Menu</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Global Fixed Floating Tooltip (Guaranteed 100% Visibility with Zero Parent Overflow Clipping) */}
      {isCollapsed && hoveredTooltip && (
        <div
          className="fixed left-[80px] -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap pointer-events-none z-[999999] flex items-center gap-2 border border-slate-700/80"
          style={{ top: `${hoveredTooltip.top}px` }}
        >
          <span>{hoveredTooltip.label}</span>
          {hoveredTooltip.isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700/80" />
        </div>
      )}
    </>
  );
};
