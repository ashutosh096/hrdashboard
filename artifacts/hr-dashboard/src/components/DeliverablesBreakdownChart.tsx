import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PieChart as PieIcon,
  Filter,
  Layers,
  Target,
  FolderGit2,
  CheckCircle2,
  Sparkles,
  User,
  TrendingUp,
  Info,
  Clock,
  ArrowUpRight,
  Search,
  X,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { fetchApi, getCachedApi } from '@workspace/api-client-react';
import { useEntity } from '../contexts/EntityContext';
import { matchesEntityFilter } from '../utils/entityUtils';

interface DeliverablesBreakdownChartProps {
  className?: string;
  defaultEmployeeId?: string;
  readOnlyUser?: boolean;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode?: string;
  designation?: string;
  email?: string;
}

interface BreakdownItem {
  id: string;
  title: string;
  code?: string;
  type: 'INITIATIVE' | 'EPIC' | 'PROJECT' | 'TASK';
  status?: string;
  createdAt?: string;
}

const CATEGORY_COLORS = {
  Initiatives: {
    fill: '#059669', // Emerald
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
  },
  Epics: {
    fill: '#8B5CF6', // Violet
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-500',
  },
  Projects: {
    fill: '#3B82F6', // Blue
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
  },
  Tasks: {
    fill: '#F59E0B', // Amber
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
};

export const DeliverablesBreakdownChart: React.FC<DeliverablesBreakdownChartProps> = ({
  className = '',
  defaultEmployeeId,
  readOnlyUser = false,
}) => {
  const { selectedEntity } = useEntity();

  const [employees, setEmployees] = useState<EmployeeOption[]>(() => getCachedApi('/api/employees') || []);
  const [initiatives, setInitiatives] = useState<any[]>(() => getCachedApi('/api/initiatives') || []);
  const [epics, setEpics] = useState<any[]>(() => getCachedApi('/api/epics') || []);
  const [projects, setProjects] = useState<any[]>(() => getCachedApi('/api/projects') || []);
  const [tasks, setTasks] = useState<any[]>(() => getCachedApi('/api/tasks') || []);
  const [loading, setLoading] = useState(() => !(getCachedApi('/api/tasks') && getCachedApi('/api/employees')));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    defaultEmployeeId || 'ALL'
  );
  const [filterMode, setFilterMode] = useState<'CREATED' | 'ASSIGNED'>('CREATED');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Live Database Fetcher (silent=true avoids full-screen flash on background syncs)
  const loadData = useCallback(async (silent = false, isManual = false) => {
    if (!silent && !getCachedApi('/api/tasks') && tasks.length === 0) setLoading(true);
    if (isManual) setIsRefreshing(true);
    try {
      const [empData, initData, epicData, projData, taskData] = await Promise.all([
        fetchApi<any[]>('/api/employees').catch(() => []),
        fetchApi<any[]>('/api/initiatives').catch(() => []),
        fetchApi<any[]>('/api/epics').catch(() => []),
        fetchApi<any[]>('/api/projects').catch(() => []),
        fetchApi<any[]>('/api/tasks').catch(() => []),
      ]);

      setEmployees(
        Array.isArray(empData)
          ? empData.map((e: any) => ({
              id: e.id,
              firstName: e.firstName || '',
              lastName: e.lastName || '',
              employeeCode: e.employeeCode || '',
              designation: e.designation || 'Team Member',
              email: e.email || '',
            }))
          : []
      );

      setInitiatives(Array.isArray(initData) ? initData : []);
      setEpics(Array.isArray(epicData) ? epicData : []);
      setProjects(
        Array.isArray(projData)
          ? projData
          : Array.isArray((projData as any)?.projects)
          ? (projData as any).projects
          : []
      );
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (err) {
      console.error('[DELIVERABLES PIE LIVE REFRESH ERROR]:', err);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  }, [tasks.length]);

  // Real-Time Live Sync: Periodic Polling (every 3.5s) + Window Event Triggers (tasks, epics, initiatives, projects)
  useEffect(() => {
    loadData(false);

    // 1. Silent periodic polling every 3.5 seconds to capture actions made by ANY employee in any session
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 3500);

    // 2. Real-time event triggers for immediate local additions, updates, or deletions
    const handleLiveEvent = () => {
      loadData(true);
    };

    window.addEventListener('tasks-updated', handleLiveEvent);
    window.addEventListener('epics-updated', handleLiveEvent);
    window.addEventListener('initiatives-updated', handleLiveEvent);
    window.addEventListener('projects-updated', handleLiveEvent);
    window.addEventListener('entity-changed', handleLiveEvent);
    window.addEventListener('focus', handleLiveEvent);
    document.addEventListener('visibilitychange', handleLiveEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tasks-updated', handleLiveEvent);
      window.removeEventListener('epics-updated', handleLiveEvent);
      window.removeEventListener('initiatives-updated', handleLiveEvent);
      window.removeEventListener('projects-updated', handleLiveEvent);
      window.removeEventListener('entity-changed', handleLiveEvent);
      window.removeEventListener('focus', handleLiveEvent);
      document.removeEventListener('visibilitychange', handleLiveEvent);
    };
  }, [loadData, selectedEntity]);

  // Update selected employee if defaultEmployeeId changes
  useEffect(() => {
    if (defaultEmployeeId && defaultEmployeeId !== 'ALL') {
      setSelectedEmployeeId(defaultEmployeeId);
    }
  }, [defaultEmployeeId]);

  // Selected Employee object
  const currentEmployee = useMemo(() => {
    if (selectedEmployeeId === 'ALL') return null;
    return employees.find((e) => e.id === selectedEmployeeId) || null;
  }, [employees, selectedEmployeeId]);

  const currentEmpFullName = useMemo(() => {
    if (!currentEmployee) return '';
    return `${currentEmployee.firstName} ${currentEmployee.lastName}`.trim().toLowerCase();
  }, [currentEmployee]);

  // Filtered dataset according to Entity Scope (EHM / CAG / ALL)
  const scopedInitiatives = useMemo(
    () => initiatives.filter((i) => matchesEntityFilter(i, selectedEntity)),
    [initiatives, selectedEntity]
  );
  const scopedEpics = useMemo(
    () => epics.filter((e) => matchesEntityFilter(e, selectedEntity)),
    [epics, selectedEntity]
  );
  const scopedProjects = useMemo(
    () => projects.filter((p) => matchesEntityFilter(p, selectedEntity)),
    [projects, selectedEntity]
  );
  const scopedTasks = useMemo(
    () => tasks.filter((t) => matchesEntityFilter(t, selectedEntity)),
    [tasks, selectedEntity]
  );

  // Filter items matching the selected user & filterMode
  const {
    matchedInitiatives,
    matchedEpics,
    matchedProjects,
    matchedTasks,
    recentItems,
  } = useMemo(() => {
    let inits: any[] = [];
    let eps: any[] = [];
    let projs: any[] = [];
    let tsks: any[] = [];

    if (selectedEmployeeId === 'ALL') {
      inits = scopedInitiatives;
      eps = scopedEpics;
      projs = scopedProjects;
      tsks = scopedTasks;
    } else if (currentEmployee) {
      const empId = currentEmployee.id;
      const empCode = (currentEmployee.employeeCode || '').toLowerCase();
      const empEmail = (currentEmployee.email || '').toLowerCase();

      // INITIATIVES
      inits = scopedInitiatives.filter((item) => {
        if (filterMode === 'CREATED') {
          return (
            item.createdById === empId ||
            (item.createdByName && item.createdByName.toLowerCase().includes(currentEmpFullName)) ||
            (!item.createdById && item.ownerId === empId)
          );
        } else {
          return (
            item.ownerId === empId ||
            item.createdById === empId ||
            (item.createdByName && item.createdByName.toLowerCase().includes(currentEmpFullName))
          );
        }
      });

      // EPICS
      eps = scopedEpics.filter((item) => {
        if (filterMode === 'CREATED') {
          return (
            item.createdById === empId ||
            (item.createdByName && item.createdByName.toLowerCase().includes(currentEmpFullName)) ||
            (!item.createdById && item.ownerId === empId)
          );
        } else {
          return (
            item.ownerId === empId ||
            item.createdById === empId ||
            (item.createdByName && item.createdByName.toLowerCase().includes(currentEmpFullName))
          );
        }
      });

      // PROJECTS
      projs = scopedProjects.filter((item) => {
        const leadStr = String(item.lead || '').toLowerCase();
        const matchesLead =
          leadStr.includes(currentEmpFullName) ||
          (empCode && leadStr.includes(empCode)) ||
          item.lead === empId;

        if (filterMode === 'CREATED') {
          return item.createdById === empId || matchesLead;
        } else {
          const teamArr = Array.isArray(item.team) ? item.team : [];
          const isInTeam =
            teamArr.some((m: any) =>
              typeof m === 'string'
                ? m === empId || m.toLowerCase().includes(currentEmpFullName)
                : m?.id === empId
            );
          return matchesLead || isInTeam || item.createdById === empId;
        }
      });

      // TASKS
      tsks = scopedTasks.filter((item) => {
        if (filterMode === 'CREATED') {
          return item.creatorId === empId;
        } else {
          const assigneeArr = Array.isArray(item.assigneeIds) ? item.assigneeIds : [];
          return (
            item.assigneeId === empId ||
            assigneeArr.includes(empId) ||
            item.reviewingLeadId === empId
          );
        }
      });
    }

    // Collect recent items for the live preview
    const collected: BreakdownItem[] = [
      ...inits.slice(0, 3).map((i) => ({
        id: i.id,
        title: i.title,
        code: i.initiativeCode,
        type: 'INITIATIVE' as const,
        status: i.status,
        createdAt: i.createdAt,
      })),
      ...eps.slice(0, 3).map((e) => ({
        id: e.id,
        title: e.title,
        code: e.epicCode,
        type: 'EPIC' as const,
        status: e.status,
        createdAt: e.createdAt,
      })),
      ...projs.slice(0, 3).map((p) => ({
        id: p.id,
        title: p.name || p.title,
        code: p.code,
        type: 'PROJECT' as const,
        status: p.status,
        createdAt: p.createdAt,
      })),
      ...tsks.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        code: t.taskCode,
        type: 'TASK' as const,
        status: t.status,
        createdAt: t.createdAt,
      })),
    ].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return {
      matchedInitiatives: inits,
      matchedEpics: eps,
      matchedProjects: projs,
      matchedTasks: tsks,
      recentItems: collected.slice(0, 4),
    };
  }, [
    selectedEmployeeId,
    currentEmployee,
    currentEmpFullName,
    filterMode,
    scopedInitiatives,
    scopedEpics,
    scopedProjects,
    scopedTasks,
  ]);

  const initCount = matchedInitiatives.length;
  const epicCount = matchedEpics.length;
  const projCount = matchedProjects.length;
  const taskCount = matchedTasks.length;
  const totalCount = initCount + epicCount + projCount + taskCount;

  // Pie chart datasets
  const pieData = useMemo(() => {
    const raw = [
      { name: 'Initiatives', value: initCount, color: CATEGORY_COLORS.Initiatives.fill },
      { name: 'Epics', value: epicCount, color: CATEGORY_COLORS.Epics.fill },
      { name: 'Projects', value: projCount, color: CATEGORY_COLORS.Projects.fill },
      { name: 'Tasks', value: taskCount, color: CATEGORY_COLORS.Tasks.fill },
    ];
    return raw.filter((item) => item.value > 0);
  }, [initCount, epicCount, projCount, taskCount]);

  // Fallback placeholder dataset when 0 items
  const emptyPlaceholderData = [{ name: 'No Items', value: 1, color: '#E2E8F0' }];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalCount > 0 ? Math.round((data.value / totalCount) * 100) : 0;
      return (
        <div className="bg-gray-900/95 backdrop-blur-md text-white text-xs rounded-xl py-2 px-3 shadow-xl border border-white/10 z-50">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold">{data.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-gray-300">
            <span>Count: <strong className="text-white font-extrabold">{data.value}</strong></span>
            <span className="text-emerald-400 font-bold">({pct}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Filtered employees for dropdown search
  const filteredEmployeesList = useMemo(() => {
    if (!employeeSearchTerm.trim()) return employees;
    const term = employeeSearchTerm.toLowerCase();
    return employees.filter(
      (e) =>
        e.firstName.toLowerCase().includes(term) ||
        e.lastName.toLowerCase().includes(term) ||
        (e.employeeCode && e.employeeCode.toLowerCase().includes(term)) ||
        (e.designation && e.designation.toLowerCase().includes(term))
    );
  }, [employees, employeeSearchTerm]);

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 transition-all ${className}`}
    >
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/80">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                  Work Distribution & Contributions
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE DB
                  </span>
                  <button
                    type="button"
                    onClick={() => loadData(true, true)}
                    title="Click to sync latest database changes"
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Proportion of Initiatives, Epics, Projects, and Tasks created
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS: USER SELECTOR */}
        <div className="flex items-center gap-2.5">
          {!readOnlyUser && (
            <div className="relative min-w-[220px]">
              <div className="relative flex items-center">
                <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors appearance-none"
                  title="Filter by Team Member"
                >
                  <option value="ALL">👥 All Team Members ({employees.length})</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} {emp.employeeCode ? `(${emp.employeeCode})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-gray-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BODY CONTENT: PIE CHART + STATS CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
        {/* LEFT / CENTER: DONUT PIE CHART */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="h-60 sm:h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totalCount > 0 ? pieData : emptyPlaceholderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={totalCount > 0 ? 4 : 0}
                  dataKey="value"
                  animationDuration={800}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {totalCount > 0
                    ? pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={activeIndex === index ? 3 : 2}
                          className="transition-all duration-200 cursor-pointer hover:opacity-90"
                        />
                      ))
                    : emptyPlaceholderData.map((entry, index) => (
                        <Cell key={`empty-${index}`} fill={entry.color} />
                      ))}
                </Pie>
                {totalCount > 0 && <Tooltip content={<CustomTooltip />} />}
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Badge - Fades out on hover to completely prevent any tooltip overlap */}
            <div
              className={`absolute text-center pointer-events-none transition-opacity duration-200 ${
                activeIndex !== null ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Created
              </span>
              <span className="text-3xl font-black text-gray-900 tracking-tight leading-none block my-0.5">
                {totalCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block">
                {selectedEmployeeId === 'ALL'
                  ? 'All Entities'
                  : currentEmployee
                  ? `${currentEmployee.firstName}'s Work`
                  : 'Selected User'}
              </span>
            </div>
          </div>

          {/* Subtext info pill */}
          <div className="text-center mt-1">
            <span className="text-[11px] text-gray-500 font-medium">
              {currentEmployee
                ? `Showing deliverables created by ${currentEmployee.firstName} ${currentEmployee.lastName}`
                : 'Showing total deliverables created across organization'}
            </span>
          </div>
        </div>

        {/* RIGHT: CLEAN COLOR DISTRIBUTION BREAKDOWN */}
        <div className="lg:col-span-7">
          <div className="border border-gray-100 rounded-2xl p-5 sm:p-6 bg-gray-50/70 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 text-xs font-bold text-gray-800">
              <span className="uppercase tracking-wider text-[11px] text-gray-500 font-extrabold">
                Proportional Breakdown
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-gray-700 font-extrabold text-[11px] border border-gray-200 shadow-2xs">
                {totalCount} Total Items
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                { name: 'Initiatives', count: initCount, color: CATEGORY_COLORS.Initiatives.fill, dot: 'bg-emerald-500', index: 0 },
                { name: 'Epics', count: epicCount, color: CATEGORY_COLORS.Epics.fill, dot: 'bg-purple-500', index: 1 },
                { name: 'Projects', count: projCount, color: CATEGORY_COLORS.Projects.fill, dot: 'bg-blue-500', index: 2 },
                { name: 'Tasks', count: taskCount, color: CATEGORY_COLORS.Tasks.fill, dot: 'bg-amber-500', index: 3 },
              ].map((cat) => {
                const pct = totalCount > 0 ? Math.round((cat.count / totalCount) * 100) : 0;
                const isHovered = activeIndex === cat.index;
                return (
                  <div
                    key={cat.name}
                    onMouseEnter={() => setActiveIndex(cat.index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? 'bg-white shadow-xs border border-gray-200 ring-1 ring-emerald-500/20'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${cat.dot} shrink-0 shadow-2xs`} />
                        <span className="font-bold text-gray-800 text-xs">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-gray-900 text-sm">{cat.count}</span>
                        <span className="text-gray-500 font-bold text-xs bg-gray-100 px-2 py-0.5 rounded-md min-w-[42px] text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
