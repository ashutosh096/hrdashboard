import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Users,
  UserCheck,
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
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

interface EmployeeRecord {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  designation: string;
  departmentId: string;
  entityId: string;
}

interface TaskRecord {
  id: string;
  taskCode: string;
  title: string;
  assigneeId: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  deliverableUrl?: string;
  description?: string;
}

const PRIORITY_PIPELINE_DATA = [
  { week: 'Week 1', urgent: 4, high: 12, medium: 8, low: 4 },
  { week: 'Week 2', urgent: 3, high: 15, medium: 10, low: 6 },
  { week: 'Week 3', urgent: 2, high: 18, medium: 12, low: 5 },
  { week: 'Week 4', urgent: 5, high: 20, medium: 14, low: 8 },
];

export const DashboardView: React.FC = () => {
  const { user, setRole } = useAuth();
  const { selectedEntity } = useEntity();
  const [, setLocation] = useLocation();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<'WEEK1' | 'WEEK2' | 'MONTH' | 'QUARTER'>('WEEK1');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskOpsSearch, setTaskOpsSearch] = useState('');

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Responsive Modal Detail View State for Tiles
  const [activeModalType, setActiveModalType] = useState<'INITIATIVES' | 'IN_PROGRESS' | 'PENDING' | 'VELOCITY' | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [empData, taskData, initData] = await Promise.all([
          fetchApi('/api/employees'),
          fetchApi('/api/tasks'),
          fetchApi('/api/initiatives'),
        ]);
        setEmployees(Array.isArray(empData) ? empData : []);
        setTasks(Array.isArray(taskData) ? taskData : []);
        setInitiatives(Array.isArray(initData) ? initData : []);
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

  const filteredEmployees = employees.filter((e) => {
    const code = e.employeeCode || 'EHM';
    const entity = code.startsWith('CAG') ? 'CAG' : 'EHM';
    return selectedEntity === 'ALL' || entity === selectedEntity;
  });

  const totalEmployees = filteredEmployees.length || 12;
  const presentEmployees = Math.round(totalEmployees * 0.85);

  // Initiatives & Tasks Metrics
  const activeInitiativesList = initiatives.filter(
    (i) => i.status === 'ACTIVE' || i.status === 'IN_PROGRESS' || i.status === 'PLANNED'
  );
  const activeInitiativesCount = activeInitiativesList.length || (initiatives.length > 0 ? initiatives.length : 3);

  // Filter Tasks for Operations Table
  const liveTaskOperations = tasks.map((t) => {
    const assignee = employees.find((e) => e.id === t.assigneeId);
    const entity = (assignee?.employeeCode || '').startsWith('CAG') ? 'CAG' : 'EHM';
    const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned';
    return {
      id: t.id,
      taskCode: t.taskCode,
      title: t.title,
      module: 'Engineering & Agile',
      assignee: assigneeName,
      role: assignee?.designation || 'Team Member',
      entity,
      avatar: MALE_AVATAR,
      priority: t.priority || 'MEDIUM',
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '2026-09-08',
      status: t.status,
    };
  });

  const filteredTaskOps = liveTaskOperations.filter(
    (t) =>
      (selectedEntity === 'ALL' || t.entity === selectedEntity) &&
      ((t.title || '').toLowerCase().includes(taskOpsSearch.toLowerCase()) ||
        (t.assignee || '').toLowerCase().includes(taskOpsSearch.toLowerCase()) ||
        (t.module || '').toLowerCase().includes(taskOpsSearch.toLowerCase()))
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE').length;
  const pendingTasks = tasks.filter((t) => t.status === 'IN_REVIEW' || t.status === 'TO_REVIEW' || t.status === 'PLANNED' || t.status === 'TODO').length;
  const completionRate = totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0;

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Header & Mode Switcher Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard & Performance Operations</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Unified workspace for company attendance, meeting schedules, sprint deliverables, task execution, and team performance analytics (Live Database).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Mode Switcher Pill */}
          <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-xl border border-emerald-200/80 shadow-2xs">
            <button
              onClick={() => setRole('ADMIN')}
              className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-emerald-600 text-white shadow-2xs cursor-pointer"
            >
              ⚙️ Admin / Manager View
            </button>
            <button
              onClick={() => setRole('EMPLOYEE')}
              className="px-3 py-1.5 text-xs font-bold rounded-lg text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
            >
              👤 Employee View
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Strategic Initiatives"
          value={activeInitiativesCount}
          icon={<Target className="w-5 h-5 text-emerald-600" />}
          trend={`${activeInitiativesCount} Strategic Goals Active`}
          onClick={() => setActiveModalType('INITIATIVES')}
        />
        <StatCard
          title="Today's Tasks (In Progress)"
          value={inProgressTasks}
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          trend="Active sprint items being executed"
          onClick={() => setActiveModalType('IN_PROGRESS')}
        />
        <StatCard
          title="Pending & To Review"
          value={pendingTasks}
          icon={<AlertCircle className="w-5 h-5 text-purple-600" />}
          trend="Awaiting review or sprint assignment"
          onClick={() => setActiveModalType('PENDING')}
        />
        <StatCard
          title="Completion Velocity Rate"
          value={`${completionRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
          trend={`${completedTasks} of ${totalTasks} Tasks Completed`}
          onClick={() => setActiveModalType('VELOCITY')}
        />
      </div>

      {/* Task Progress & Sprint Analytics Graph + Schedule & Deliverables Widget Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskProgressSprintAnalytics />
        </div>
        <div className="lg:col-span-1">
          <ScheduleWidget />
        </div>
      </div>

      {/* Embedded Task Analytics Component */}
      <TaskAnalyticsPanel />

      {/* Task Operations Feed */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Task Operations & Execution Feed</h3>
            <p className="text-xs text-gray-400 font-medium">Real-time status tracking for active sprint deliverables</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task operations..."
              value={taskOpsSearch}
              onChange={(e) => setTaskOpsSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-3">Task ID</th>
                <th className="py-3 px-3">Deliverable Title</th>
                <th className="py-3 px-3">Assignee</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3 text-center">Due Date</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {filteredTaskOps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-gray-400">
                    No active task operations found for selected filter.
                  </td>
                </tr>
              ) : (
                filteredTaskOps.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">{t.taskCode}</td>
                    <td className="py-3.5 px-3 font-bold text-gray-900">{t.title}</td>
                    <td className="py-3.5 px-3 font-medium text-gray-700">{t.assignee}</td>
                    <td className="py-3.5 px-3 font-semibold text-gray-500">{t.entity === 'EHM' ? 'ehmconsultancy' : 'climagroanalytics'}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        t.priority === 'URGENT' || t.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-gray-600">{t.dueDate}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        t.status === 'DONE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 RESPONSIVE KPI CARD DETAIL MODALS */}
      {activeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 select-text">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            
            {/* 1. ACTIVE INITIATIVES MODAL */}
            {activeModalType === 'INITIATIVES' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-600">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">Active Strategic Initiatives</h3>
                      <p className="text-xs text-gray-500 font-medium">Long-term organizational goals & milestones active in database</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {initiatives.length === 0 ? (
                    <div className="p-6 text-center text-xs font-semibold text-gray-400">No initiatives loaded yet.</div>
                  ) : (
                    initiatives.map((init) => (
                      <div key={init.id} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded border border-emerald-200">
                            {init.initiativeCode}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            {init.targetMonth || 'Month 1'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">{init.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{init.description}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 font-bold">Total Strategic Initiatives: {initiatives.length}</span>
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/tasks');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>View Strategic Initiatives Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* 2. TASKS IN PROGRESS MODAL */}
            {activeModalType === 'IN_PROGRESS' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">Today's Tasks (In Progress)</h3>
                      <p className="text-xs text-gray-500 font-medium">Sprint backlog deliverables currently being executed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE').length === 0 ? (
                    <div className="p-6 text-center text-xs font-semibold text-gray-400">No in-progress tasks found.</div>
                  ) : (
                    tasks
                      .filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE')
                      .map((task) => (
                        <div key={task.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {task.taskCode}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                {task.priority || 'MEDIUM'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900">{task.title}</h4>
                          </div>
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg shrink-0">
                            In Progress ⏳
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 font-bold">In Progress Tasks: {inProgressTasks}</span>
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/tasks');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>View Product Backlog & Tasks Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* 3. PENDING & TO REVIEW MODAL */}
            {activeModalType === 'PENDING' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-600">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">Pending & To Review Deliverables</h3>
                      <p className="text-xs text-gray-500 font-medium">Tasks awaiting lead approval or backlog allocation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {tasks.filter((t) => t.status === 'IN_REVIEW' || t.status === 'TO_REVIEW' || t.status === 'PLANNED' || t.status === 'TODO').length === 0 ? (
                    <div className="p-6 text-center text-xs font-semibold text-gray-400">No pending items to review.</div>
                  ) : (
                    tasks
                      .filter((t) => t.status === 'IN_REVIEW' || t.status === 'TO_REVIEW' || t.status === 'PLANNED' || t.status === 'TODO')
                      .map((task) => (
                        <div key={task.id} className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-100 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                                {task.taskCode}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900">{task.title}</h4>
                          </div>
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg shrink-0">
                            {task.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 font-bold">Pending Review Items: {pendingTasks}</span>
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/tasks');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>View Backlog & Review Queue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* 4. COMPLETION VELOCITY RATE MODAL */}
            {activeModalType === 'VELOCITY' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">Sprint Completion Velocity Rate</h3>
                      <p className="text-xs text-gray-500 font-medium">Sprint execution performance and deliverable throughput rate</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-center">
                    <span className="text-xs font-bold text-amber-800">Total Deliverables</span>
                    <p className="text-2xl font-extrabold text-amber-900 mt-1">{totalTasks}</p>
                  </div>
                  <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-center">
                    <span className="text-xs font-bold text-emerald-800">Completed Tasks</span>
                    <p className="text-2xl font-extrabold text-emerald-900 mt-1">{completedTasks}</p>
                  </div>
                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 text-center">
                    <span className="text-xs font-bold text-blue-800">Velocity Rate</span>
                    <p className="text-2xl font-extrabold text-blue-900 mt-1">{completionRate}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Sprint Execution Progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 font-bold">Completed Deliverables: {completedTasks} / {totalTasks}</span>
                  <button
                    onClick={() => {
                      setActiveModalType(null);
                      setLocation('/performance');
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>View Performance Reports Page</span>
                    <ArrowRight className="w-4 h-4" />
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
