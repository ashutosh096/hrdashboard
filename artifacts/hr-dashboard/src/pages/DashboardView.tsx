import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Users,
  UserX,
  Calendar,
  LayoutDashboard,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  CheckSquare,
  ChevronRight,
  Search,
  Layers,
  AlertTriangle,
  Target,
  X,
  ArrowRight,
  ExternalLink,
  User,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { ScheduleWidget } from '../components/ScheduleWidget';
import { TaskAnalyticsPanel } from '../components/TaskAnalyticsPanel';
import { TaskProgressSprintAnalytics } from '../components/TaskProgressSprintAnalytics';
import { EmployeeDashboardView } from '../components/EmployeeDashboardView';
import { PinnedAnnouncementBanner } from '../components/PinnedAnnouncementBanner';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi, getCachedApi } from '@workspace/api-client-react';
import { matchesEntityFilter } from '../utils/entityUtils';

interface EmployeeRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  entityId?: string;
  entityCode?: string;
  departmentName?: string;
  departmentId?: string;
  designation?: string;
  employeeCode?: string;
}

interface TaskRecord {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: string;
  sprintId?: string;
  entityCode?: string;
  entityId?: string;
  taskCode?: string;
  completionPercentage?: number;
}

const PRIORITY_PIPELINE_DATA = [
  { week: 'Week 1', urgent: 4, high: 12, medium: 8, low: 4 },
  { week: 'Week 2', urgent: 3, high: 15, medium: 10, low: 6 },
  { week: 'Week 3', urgent: 2, high: 18, medium: 12, low: 5 },
  { week: 'Week 4', urgent: 5, high: 20, medium: 14, low: 8 },
];

export const DashboardView: React.FC = () => {
  const { selectedEntity } = useEntity();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [timeRange, setTimeRange] = useState<'WEEK1' | 'WEEK2' | 'MONTH' | 'QUARTER'>('WEEK1');
  const [searchTerm, setSearchTerm] = useState('');

  const [employees, setEmployees] = useState<EmployeeRecord[]>(() => (getCachedApi<EmployeeRecord[]>('/api/employees') || []));
  const [tasks, setTasks] = useState<TaskRecord[]>(() => (getCachedApi<TaskRecord[]>('/api/tasks') || []));
  const [initiatives, setInitiatives] = useState<any[]>(() => (getCachedApi<any[]>('/api/initiatives') || []));
  const [sprints, setSprints] = useState<any[]>(() => (getCachedApi<any[]>('/api/sprints') || []));
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>(() => (getCachedApi<any[]>('/api/attendance') || []));
  const [loading, setLoading] = useState(() => !(getCachedApi('/api/employees') && getCachedApi('/api/tasks')));
  const [searchTeamTerm, setSearchTeamTerm] = useState('');

  // Responsive Modal Detail View State for Tiles
  const [activeModalType, setActiveModalType] = useState<'TEAM' | 'IN_PROGRESS' | 'PENDING' | 'SPRINTS' | 'INITIATIVES' | 'VELOCITY' | 'OVERDUE' | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!getCachedApi('/api/tasks') || !getCachedApi('/api/employees')) setLoading(true);
      try {
        const [empData, taskData, initData, sprintData, attData] = await Promise.all([
          fetchApi('/api/employees'),
          fetchApi('/api/tasks'),
          fetchApi('/api/initiatives'),
          fetchApi('/api/sprints'),
          fetchApi('/api/attendance').catch(() => []),
        ]);
        setEmployees(Array.isArray(empData) ? empData : []);
        setTasks(Array.isArray(taskData) ? taskData : []);
        setInitiatives(Array.isArray(initData) ? initData : []);
        setSprints(Array.isArray(sprintData) ? sprintData : []);
        setAttendanceRecords(Array.isArray(attData) ? attData : []);
      } catch (err) {
        console.error('[DASHBOARD FETCH ERROR]:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Employee Role Scoping
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboardView />;
  }

  const getAssigneeName = (assigneeId: string) => {
    const emp = employees.find((e) => e.id === assigneeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Ashutosh Mishra';
  };

  const getPriorityBadge = (priority: string) => {
    const prioUpper = (priority || '').toUpperCase();
    if (prioUpper === 'URGENT' || prioUpper === 'P1' || prioUpper === '1') {
      return { label: 'P1', color: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (prioUpper === 'HIGH' || prioUpper === 'P2' || prioUpper === '2') {
      return { label: 'P2', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (prioUpper === 'MEDIUM' || prioUpper === 'P3' || prioUpper === '3') {
      return { label: 'P3', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'P4', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  // Scope Datasets by Selected Entity (EHM / CAG / ALL)
  const scopedEmployees = employees.filter((e) => matchesEntityFilter(e, selectedEntity));
  const scopedTasks = tasks.filter((t) => matchesEntityFilter(t, selectedEntity));
  const scopedInitiatives = initiatives.filter((i) => matchesEntityFilter(i, selectedEntity));
  const scopedSprints = sprints.filter((s) => matchesEntityFilter(s, selectedEntity));
  const scopedAttendance = attendanceRecords.filter((a) => matchesEntityFilter(a, selectedEntity));

  // Initiatives & Sprints & Tasks Metrics
  const activeInitiativesList = scopedInitiatives.filter(
    (i) => i.status === 'ACTIVE' || i.status === 'IN_PROGRESS' || i.status === 'PLANNED'
  );
  const activeInitiativesCount = activeInitiativesList.length;

  const activeSprintsList = scopedSprints.filter((s) => s.status !== 'DONE' && s.status !== 'COMPLETED');
  const activeSprintsCount = activeSprintsList.length;

  const totalTasks = scopedTasks.length;
  const completedTasks = scopedTasks.filter((t) => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const inProgressTasks = scopedTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE').length;
  const pendingTasks = scopedTasks.filter((t) => t.status === 'IN_REVIEW' || t.status === 'TO_REVIEW' || t.status === 'PLANNED' || t.status === 'TODO').length;
  const completionRate = totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasksCount = scopedTasks.filter(
    (t) => t.status !== 'DONE' && t.status !== 'COMPLETED' && t.dueDate && t.dueDate < todayStr
  ).length;

  const totalEmployeesCount = scopedEmployees.length;
  const activeEmployeesCount = scopedEmployees.filter((e) => (e as any).status !== 'INACTIVE').length;
  const activeEmployeesPercent = totalEmployeesCount > 0 ? Math.round((activeEmployeesCount / totalEmployeesCount) * 100) : 0;

  const loggedInEmployee = employees.find(
    (e: any) => e.id === user?.employeeId || e.email?.toLowerCase() === user?.email?.toLowerCase()
  );
  const userDisplayName = loggedInEmployee
    ? `${loggedInEmployee.firstName} ${loggedInEmployee.lastName}`
    : user?.name || (user?.email ? user.email.split('@')[0] : 'Ashutosh Mishra');

  return (
    <div className="p-6 space-y-6 select-none">
      {/* PINNED ANNOUNCEMENT TOP CAPSULE BANNER */}
      <PinnedAnnouncementBanner />

      {/* COMPACT GREEN CAPSULE HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left Side: Name and Your Mail */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                Name
              </span>
              <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                {userDisplayName}
              </span>
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                Your Mail
              </span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-50">
                {user?.email || 'admin@example.com'}
              </span>
            </div>
          </div>

          {/* Right Side: Role */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Role:</span>
            <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black uppercase tracking-wider text-white border border-white/25 shadow-2xs">
              {user?.role === 'ADMIN' ? 'ADMIN' : user?.role === 'MANAGER' ? 'MANAGER' : 'TEAM MEMBER'}
            </span>
          </div>
        </div>
      </div>

      {/* Task Progress & Sprint Analytics Graph + Schedule & Deliverables Widget Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <TaskProgressSprintAnalytics className="h-full" viewType="ADMIN" title="Task Completion" />
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <ScheduleWidget className="h-full" />
        </div>
      </div>

      {/* Embedded Unified Task Analytics & Operations Component */}
      <TaskAnalyticsPanel />

      {/* 🚀 RESPONSIVE MINIMAL CLEAN KPI CARD DETAIL MODALS */}
      {activeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 select-text">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-xl border border-gray-200 max-h-[85vh] overflow-y-auto space-y-4">
            
            {/* 1. ACTIVE TEAM MEMBERS MODAL */}
            {activeModalType === 'TEAM' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">Active Team Members</h3>
                      <p className="text-xs text-gray-500 font-medium">{activeEmployeesCount} of {totalEmployeesCount} members present today</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
                  {scopedEmployees.length === 0 ? (
                    <div className="p-4 text-center text-xs font-semibold text-gray-400">No team members found for selected entity.</div>
                  ) : (
                    scopedEmployees.slice(0, 6).map((emp) => {
                      const attRecord = scopedAttendance.find((a) => a.employeeId === emp.id);
                      const clockInTime = attRecord?.clockIn ? new Date(attRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:00 am';
                      const workMode = attRecord?.workMode || 'OFFICE';
                      const isRemote = workMode === 'REMOTE';
                      const isHybrid = workMode === 'HYBRID';

                      return (
                        <div key={emp.id} className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {emp.firstName?.[0] || 'E'}{emp.lastName?.[0] || ''}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-900">{emp.firstName} {emp.lastName}</h4>
                              <p className="text-[11px] text-gray-500 font-medium">{emp.designation || 'Team Member'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-gray-900 block">{clockInTime}</span>
                            <span className={`text-[10px] font-bold block ${
                              isRemote ? 'text-gray-500' : isHybrid ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {isRemote ? 'Remote' : isHybrid ? 'Hybrid' : 'In office'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{Math.max(0, scopedEmployees.length - 6)} more</span>
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/team');
                    }}
                    className="flex items-center gap-1 font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <span>View directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* 2. TODAY'S TASKS (IN PROGRESS) MODAL */}
            {activeModalType === 'IN_PROGRESS' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">In progress today</h3>
                      <p className="text-xs text-gray-500 font-medium">{inProgressTasks} tasks being executed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
                  {scopedTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE').length === 0 ? (
                    <div className="p-4 text-center text-xs font-semibold text-gray-400">No in-progress tasks found.</div>
                  ) : (
                    scopedTasks
                      .filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE')
                      .slice(0, 5)
                      .map((task) => {
                        const prioBadge = getPriorityBadge(task.priority);

                        return (
                          <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold text-gray-900">{task.title}</h4>
                              <p className="text-[11px] text-gray-500 font-medium">
                                {getAssigneeName(task.assigneeId)} • {task.taskCode}
                              </p>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${prioBadge.color}`}>
                              {prioBadge.label}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{Math.max(0, inProgressTasks - 5)} more</span>
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/tasks');
                    }}
                    className="flex items-center gap-1 font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <span>View backlog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* 3. OVERDUE & CRITICAL ALERTS MODAL */}
            {activeModalType === 'OVERDUE' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">Overdue and critical</h3>
                      <p className="text-xs text-gray-500 font-medium">{overdueTasksCount} items past due date</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
                  {overdueTasksCount === 0 ? (
                    <div className="p-4 text-center text-xs font-semibold text-emerald-600">
                      🎉 No overdue tasks. All deliverables on track!
                    </div>
                  ) : (
                    scopedTasks
                      .filter((t) => t.status !== 'DONE' && t.status !== 'COMPLETED' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0])
                      .slice(0, 5)
                      .map((task) => (
                        <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-gray-900">{task.title}</h4>
                            <p className="text-[11px] text-red-600 font-medium">
                              {getAssigneeName(task.assigneeId)} • overdue since {task.dueDate ? (String(task.dueDate).includes('T') ? String(task.dueDate).split('T')[0] : String(task.dueDate).split(' ')[0]) : ''}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {(task.status || 'in progress').toLowerCase()}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{Math.max(0, overdueTasksCount - 5)} more</span>
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/tasks');
                    }}
                    className="flex items-center gap-1 font-bold text-gray-900 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <span>Update deadlines</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* 4. ACTIVE SPRINTS MODAL */}
            {activeModalType === 'SPRINTS' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">Active sprints</h3>
                      <p className="text-xs text-gray-500 font-medium">{activeSprintsCount} running four-week cycles</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
                  {scopedSprints.length === 0 ? (
                    <div className="p-4 text-center text-xs font-semibold text-gray-400">No active sprints loaded.</div>
                  ) : (
                    scopedSprints.slice(0, 5).map((sprint) => (
                      <div key={sprint.id} className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-gray-900">{sprint.name}</h4>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {sprint.employeeName || 'Team Member'} • {sprint.sprintCode} - {sprint.targetWeek || 'week 1 of 4'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {(sprint.status || 'planned').toLowerCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{Math.max(0, activeSprintsCount - 5)} more</span>
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/sprints');
                    }}
                    className="flex items-center gap-1 font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <span>View sprints</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* 5. SPRINT VELOCITY RATE MODAL */}
            {activeModalType === 'VELOCITY' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">Sprint velocity</h3>
                      <p className="text-xs text-gray-500 font-medium">Execution throughput this cycle</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/40 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] font-medium text-gray-500 block">Total</span>
                      <span className="text-xl font-extrabold text-gray-900 block mt-0.5">{totalTasks}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-gray-500 block">Completed</span>
                      <span className="text-xl font-extrabold text-gray-900 block mt-0.5">{completedTasks}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-gray-500 block">Velocity</span>
                      <span className="text-xl font-extrabold text-gray-900 block mt-0.5">{completionRate}%</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/reports');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <span>View performance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

