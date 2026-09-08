import React, { useEffect, useState } from 'react';
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

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<'WEEK1' | 'WEEK2' | 'MONTH' | 'QUARTER'>('WEEK1');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskOpsSearch, setTaskOpsSearch] = useState('');

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [empData, taskData] = await Promise.all([
          fetchApi('/api/employees'),
          fetchApi('/api/tasks'),
        ]);
        setEmployees(Array.isArray(empData) ? empData : []);
        setTasks(Array.isArray(taskData) ? taskData : []);
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
  const absentEmployees = totalEmployees - presentEmployees;

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
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
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
        <StatCard title="Total Team Members" value={totalEmployees} icon={<Users className="w-5 h-5 text-blue-600" />} trend="+2 this month" />
        <StatCard title="Active Today (Clocked In)" value={presentEmployees} icon={<UserCheck className="w-5 h-5 text-emerald-600" />} trend="85% Attendance Rate" />
        <StatCard title="Total Live Deliverables" value={totalTasks} icon={<Layers className="w-5 h-5 text-purple-600" />} trend={`${completedTasks} Tasks Completed`} />
        <StatCard title="Completion Velocity Rate" value={`${completionRate}%`} icon={<TrendingUp className="w-5 h-5 text-amber-600" />} trend="Capped <= 100%" />
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
    </div>
  );
};
