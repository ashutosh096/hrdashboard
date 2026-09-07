import React, { useState } from 'react';
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
import { EmployeeDashboardView } from '../components/EmployeeDashboardView';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

interface EmployeePerformanceData {
  id: string;
  name: string;
  dept: string;
  role: string;
  entity: 'EHM' | 'CAG';
  avatar: string;
  assigned: number;
  completed: number;
  inReview: number;
  inProgress: number;
  pending: number;
  velocityScore: number;
  recentTasks: { title: string; status: string; priority: string; date: string }[];
}

const EMPLOYEES_DATA: EmployeePerformanceData[] = [
  {
    id: 'emp-1',
    name: 'Ashutosh Mishra',
    dept: 'Product & Tech',
    role: 'Lead Systems Architect',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    assigned: 2,
    completed: 3,
    inReview: 1,
    inProgress: 1,
    pending: 0,
    velocityScore: 94,
    recentTasks: [{ title: 'API Gateway Telemetry Pipeline', status: 'In Review', priority: 'High', date: '2026-09-05' }],
  },
  {
    id: 'emp-2',
    name: 'Priyanka Sharma',
    dept: 'Marketing',
    role: 'Senior Brand Strategist',
    entity: 'EHM',
    avatar: FEMALE_AVATAR,
    assigned: 7,
    completed: 5,
    inReview: 3,
    inProgress: 4,
    pending: 0,
    velocityScore: 88,
    recentTasks: [{ title: 'Brand Client Campaign Review', status: 'In Review', priority: 'High', date: '2026-09-04' }],
  },
  {
    id: 'emp-3',
    name: 'Utkarsh Mishra',
    dept: 'Operations & Delivery',
    role: 'Operations Lead',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    assigned: 7,
    completed: 6,
    inReview: 3,
    inProgress: 3,
    pending: 0,
    velocityScore: 91,
    recentTasks: [{ title: 'Vendor Logistics Audit', status: 'Completed', priority: 'High', date: '2026-09-03' }],
  },
  {
    id: 'emp-4',
    name: 'Prerna Shukla',
    dept: 'Grants & Governance',
    role: 'Grants Strategist',
    entity: 'EHM',
    avatar: FEMALE_AVATAR,
    assigned: 9,
    completed: 7,
    inReview: 4,
    inProgress: 5,
    pending: 0,
    velocityScore: 96,
    recentTasks: [{ title: 'Agri-Tech Subsidy Compliance Report', status: 'In Review', priority: 'Urgent', date: '2026-09-05' }],
  },
  {
    id: 'emp-5',
    name: 'Shreyansh Siladar',
    dept: 'SM Marketing',
    role: 'Social Media Lead',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    assigned: 4,
    completed: 3,
    inReview: 2,
    inProgress: 2,
    pending: 0,
    velocityScore: 89,
    recentTasks: [{ title: 'LinkedIn Enterprise Campaign', status: 'In Review', priority: 'Medium', date: '2026-09-01' }],
  },
  {
    id: 'emp-6',
    name: "Tarul Ma'am",
    dept: 'Operations & Delivery',
    role: 'Delivery Associate',
    entity: 'CAG',
    avatar: MALE_AVATAR,
    assigned: 1,
    completed: 2,
    inReview: 0,
    inProgress: 1,
    pending: 0,
    velocityScore: 92,
    recentTasks: [{ title: 'Client Dispatch Documentation', status: 'In Progress', priority: 'Low', date: '2026-09-04' }],
  },
  {
    id: 'emp-7',
    name: 'Dr. Harshit Mishra',
    dept: 'Sales',
    role: 'Managing Director / Sales Lead',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    assigned: 0,
    completed: 5,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    velocityScore: 98,
    recentTasks: [],
  },
  {
    id: 'emp-8',
    name: 'Neha Shukla',
    dept: 'Marketing',
    role: 'Marketing Lead',
    entity: 'EHM',
    avatar: FEMALE_AVATAR,
    assigned: 0,
    completed: 4,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    velocityScore: 93,
    recentTasks: [],
  },
  {
    id: 'emp-9',
    name: 'Dr. Utsav Mishra',
    dept: 'Operations & Delivery',
    role: 'Operations VP',
    entity: 'CAG',
    avatar: MALE_AVATAR,
    assigned: 0,
    completed: 3,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    velocityScore: 95,
    recentTasks: [],
  },
  {
    id: 'emp-10',
    name: 'Jitendra Sir',
    dept: 'Product & Tech',
    role: 'Chief Technology Officer',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    assigned: 0,
    completed: 4,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    velocityScore: 100,
    recentTasks: [],
  },
  {
    id: 'emp-11',
    name: 'Pranshu Dubey',
    dept: 'Product & System',
    role: 'DevOps Engineer',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    assigned: 0,
    completed: 3,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    velocityScore: 94,
    recentTasks: [],
  },
  {
    id: 'emp-12',
    name: 'Himanshu Tiwari',
    dept: 'Product & Tech',
    role: 'Frontend Engineer',
    entity: 'CAG',
    avatar: MALE_AVATAR,
    assigned: 4,
    completed: 3,
    inReview: 2,
    inProgress: 2,
    pending: 0,
    velocityScore: 90,
    recentTasks: [{ title: 'Attendance Heatmap Widget', status: 'In Review', priority: 'Medium', date: '2026-09-03' }],
  },
];

const OVERALL_SPRINT_TREND = [
  { name: 'Week 1', completed: 24, inReview: 8, pending: 12 },
  { name: 'Week 2', completed: 32, inReview: 10, pending: 15 },
  { name: 'Week 3', completed: 41, inReview: 14, pending: 10 },
  { name: 'Week 4', completed: 50, inReview: 12, pending: 8 },
  { name: 'Week 5', completed: 58, inReview: 9, pending: 7 },
  { name: 'Week 6', completed: 65, inReview: 11, pending: 6 },
  { name: 'Week 7', completed: 72, inReview: 10, pending: 5 },
  { name: 'Week 8', completed: 82, inReview: 7, pending: 4 },
];

const MOCK_TASK_OPERATIONS = [
  { id: 't1', title: 'API Gateway Telemetry Pipeline', module: 'Backend / Tech', assignee: 'Ashutosh Mishra', role: 'Lead Architect', entity: 'EHM', avatar: MALE_AVATAR, priority: 'High', dueDate: '2026-09-07 (Today)', status: 'In Review' },
  { id: 't2', title: 'Brand Client Campaign Strategy', module: 'Marketing', assignee: 'Priyanka Sharma', role: 'Brand Strategist', entity: 'EHM', avatar: FEMALE_AVATAR, priority: 'Urgent', dueDate: '2026-09-07 (Today)', status: 'In Review' },
  { id: 't3', title: 'Vendor Logistics Audit Report', module: 'Operations', assignee: 'Utkarsh Mishra', role: 'Operations Lead', entity: 'EHM', avatar: MALE_AVATAR, priority: 'High', dueDate: '2026-09-08', status: 'Done' },
  { id: 't4', title: 'Agri-Tech Subsidy Compliance Audit', module: 'Governance', assignee: 'Prerna Shukla', role: 'Grants Strategist', entity: 'EHM', avatar: FEMALE_AVATAR, priority: 'Urgent', dueDate: '2026-09-07 (Today)', status: 'In Review' },
  { id: 't5', title: 'LinkedIn Enterprise Campaign Assets', module: 'SM Marketing', assignee: 'Shreyansh Siladar', role: 'Social Lead', entity: 'EHM', avatar: MALE_AVATAR, priority: 'Medium', dueDate: '2026-09-09', status: 'In Progress' },
  { id: 't6', title: 'Attendance Heatmap Widget UI', module: 'Frontend Tech', assignee: 'Himanshu Tiwari', role: 'Frontend Engineer', entity: 'CAG', avatar: MALE_AVATAR, priority: 'Medium', dueDate: '2026-09-10', status: 'In Progress' },
  { id: 't7', title: 'Client Dispatch Documentation Sync', module: 'Delivery', assignee: "Tarul Ma'am", role: 'Delivery Associate', entity: 'CAG', avatar: MALE_AVATAR, priority: 'Low', dueDate: '2026-09-11', status: 'Pending' },
  { id: 't8', title: 'Real-time WebSocket Push Engine', module: 'Backend Tech', assignee: 'Pranshu Dubey', role: 'DevOps Engineer', entity: 'EHM', avatar: MALE_AVATAR, priority: 'High', dueDate: '2026-09-08', status: 'In Progress' },
];

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

  // Employee Role Scoping
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboardView />;
  }

  // Filter Employees by Selected Entity
  const entityEmployees = EMPLOYEES_DATA.filter(
    (e) => selectedEntity === 'ALL' || e.entity === selectedEntity
  );

  // Dashboard Overview Stats
  const totalEmployees = entityEmployees.length;
  const presentEmployees = Math.round(totalEmployees * 0.85);
  const absentEmployees = totalEmployees - presentEmployees;
  const activeMeetings = selectedEntity === 'CAG' ? 2 : selectedEntity === 'EHM' ? 3 : 4;

  // Performance Analytics Data Calculation
  const selectedEmployee = entityEmployees.find((e) => e.id === selectedEmployeeId);

  const timeMultiplier =
    timeRange === 'WEEK1' ? 0.35 : timeRange === 'WEEK2' ? 0.5 : timeRange === 'MONTH' ? 0.8 : 1.0;

  const rawAssigned = selectedEmployee
    ? selectedEmployee.assigned
    : entityEmployees.reduce((acc, curr) => acc + curr.assigned, 0);

  const rawCompleted = selectedEmployee
    ? selectedEmployee.completed
    : entityEmployees.reduce((acc, curr) => acc + curr.completed, 0);

  const rawInReview = selectedEmployee
    ? selectedEmployee.inReview
    : entityEmployees.reduce((acc, curr) => acc + curr.inReview, 0);

  const rawPending = selectedEmployee
    ? selectedEmployee.pending
    : entityEmployees.reduce((acc, curr) => acc + curr.pending, 0);

  const totalAssigned = Math.round(rawAssigned * timeMultiplier);
  const totalCompleted = Math.round(rawCompleted * timeMultiplier);
  const totalInReview = Math.round(rawInReview * timeMultiplier);
  const totalPending = Math.round(rawPending * timeMultiplier);
  const totalInProgress = Math.round(selectedEmployee ? selectedEmployee.inProgress * timeMultiplier : 3 * timeMultiplier);

  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  const pieData = [
    { name: 'Done (Completed)', value: totalCompleted, color: '#10B981' },
    { name: 'To Review', value: totalInReview, color: '#F59E0B' },
    { name: 'In Progress', value: totalInProgress, color: '#3B82F6' },
    { name: 'Pending', value: totalPending, color: '#8B5CF6' },
  ];

  const filteredEmployeesTable = entityEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTaskOps = MOCK_TASK_OPERATIONS.filter(
    (t) =>
      (selectedEntity === 'ALL' || t.entity === selectedEntity) &&
      (t.title.toLowerCase().includes(taskOpsSearch.toLowerCase()) ||
        t.assignee.toLowerCase().includes(taskOpsSearch.toLowerCase()) ||
        t.module.toLowerCase().includes(taskOpsSearch.toLowerCase()))
  );

  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboardView />;
  }

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Header & Mode Switcher Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard & Performance Operations</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Unified workspace for company attendance, meeting schedules, sprint deliverables, task execution, and team performance analytics.
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

        {/* Time Filter Pills */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-2xs">
          <button
            onClick={() => setTimeRange('WEEK1')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'WEEK1' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            1st Week
          </button>
          <button
            onClick={() => setTimeRange('WEEK2')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'WEEK2' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            2nd Week
          </button>
          <button
            onClick={() => setTimeRange('MONTH')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'MONTH' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            1 Month
          </button>
          <button
            onClick={() => setTimeRange('QUARTER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'QUARTER' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Quarter
          </button>
        </div>
        </div>
      </div>

      {/* SECTION 1: TOP OPERATIONAL & TASK KPI CARDS (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Employees" value={totalEmployees} label="Total Staff" icon={Users} />
        <StatCard title="Present Employees" value={presentEmployees} label="Present Today" icon={UserCheck} />
        <StatCard title="Active Deliverables" value={28} label="Sprint Tasks" icon={Layers} />
        <StatCard title="Tasks Due Today" value={5} label="Urgent Execution" icon={Clock} />
        <StatCard title="Active Meetings" value={activeMeetings} label="Meetings Today" icon={Calendar} />
      </div>

      {/* SECTION 2: ATTENDANCE TRENDS (65%) & DAILY SCHEDULE (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <ScheduleWidget />
        </div>
      </div>

      {/* SECTION 3: TASK PIPELINE CHART (65%) & TASK LIFECYCLE DISTRIBUTION (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Priority Delivery Pipeline Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Task Delivery Pipeline & Priority Distribution</h3>
              <p className="text-xs text-gray-500 font-medium">Sprint task load across Urgent, High, Medium, and Low priorities.</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Urgent</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> High</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Medium</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Low</span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PRIORITY_PIPELINE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-lg text-xs font-sans space-y-1">
                          <p className="font-bold text-gray-900">{label}</p>
                          {payload.map((entry: any) => (
                            <p key={entry.name} className="font-semibold" style={{ color: entry.color }}>
                              {entry.name}: {entry.value} tasks
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="urgent" name="Urgent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high" name="High" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium" name="Medium" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low" name="Low" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Lifecycle Distribution Pie/Doughnut Chart */}
        <div className="lg:col-span-1 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">Task Lifecycle Distribution</h3>
            <p className="text-xs text-gray-500 font-medium">Breakdown of done, review, in progress, and pending tasks.</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData.filter((d) => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4}>
                  {pieData.filter((d) => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      return (
                        <div className="bg-white border border-gray-200 p-2.5 rounded-xl shadow-lg text-xs font-bold">
                          <span style={{ color: item.payload.color }}>{item.name}:</span> {item.value} tasks
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: LIVE TASK OPERATIONS MATRIX (65%) & TODAY'S PRIORITY QUEUE (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table: Live Task Operations */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Active Task Operations & Execution Matrix</h3>
                <p className="text-xs text-gray-500 font-medium">Real-time status, priorities, assignees, and due dates across active sprint deliverables.</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-xs w-full relative">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-500 transition-all">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search task or assignee..."
                  value={taskOpsSearch}
                  onChange={(e) => setTaskOpsSearch(e.target.value)}
                  className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/60">
                  <th className="py-3 px-4">Task Title & Module</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {MOCK_TASK_OPERATIONS.filter(
                  (t) =>
                    t.title.toLowerCase().includes(taskOpsSearch.toLowerCase()) ||
                    t.assignee.toLowerCase().includes(taskOpsSearch.toLowerCase()) ||
                    t.module.toLowerCase().includes(taskOpsSearch.toLowerCase())
                ).map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/90 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-gray-900 block text-sm">{task.title}</span>
                        <span className="text-[11px] text-gray-400 font-semibold">{task.module}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={task.avatar} alt={task.assignee} className="w-7 h-7 rounded-full object-cover border border-gray-200 shadow-2xs" />
                        <div>
                          <span className="font-bold text-gray-900 block text-xs">{task.assignee}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{task.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        task.priority === 'Urgent'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : task.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : task.priority === 'Medium'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-800">{task.dueDate}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        task.status === 'Done' || task.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : task.status === 'In Review'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : task.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          task.status === 'Done' || task.status === 'Completed'
                            ? 'bg-emerald-500'
                            : task.status === 'In Review'
                            ? 'bg-amber-500'
                            : task.status === 'In Progress'
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                        }`}></span>
                        <span>{task.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-200">
                        Mark Done
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Queue & Action Panel */}
        <div className="lg:col-span-1 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Today's Priority Queue</h3>
              <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[11px] font-extrabold rounded-full border border-red-200">
                5 Due Today
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Deliverables requiring immediate action or review.</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
            {MOCK_TASK_OPERATIONS.slice(0, 4).map((task) => (
              <div key={task.id} className="p-3 bg-gray-50/80 hover:bg-gray-100/80 rounded-xl border border-gray-200/70 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                    task.priority === 'Urgent'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : task.priority === 'High'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{task.module}</span>
                </div>

                <h4 className="text-xs font-bold text-gray-900 leading-tight">{task.title}</h4>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                  <div className="flex items-center gap-1.5">
                    <img src={task.avatar} alt={task.assignee} className="w-5 h-5 rounded-full object-cover border" />
                    <span className="text-[11px] font-semibold text-gray-700">{task.assignee}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${task.status === 'In Review' ? 'text-amber-600' : 'text-blue-600'}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: ACTIVE RESOURCE CAPACITY & PERFORMANCE TRACKER TABLE */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Active Resource Capacity & Performance Tracker</h3>
              <p className="text-xs text-gray-500 font-medium">Real-time team assigned tasks, completion rates, and workload capacity loading.</p>
            </div>
          </div>

          {/* Table Search Input */}
          <div className="max-w-xs w-full relative">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-500 transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search team member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/60">
                <th className="py-3 px-4">Team Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Assigned Tasks</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-center">Capacity Loading</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {filteredEmployeesTable.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`hover:bg-gray-50/90 transition-colors cursor-pointer ${
                    selectedEmployeeId === emp.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-2xs" />
                      <div>
                        <span className="font-bold text-gray-900 block text-sm">{emp.name}</span>
                        <span className="text-[11px] text-gray-400 font-semibold">{emp.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{emp.dept}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-gray-900">{emp.assigned}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-emerald-700">{emp.completed}</td>
                  <td className="py-3.5 px-4 text-center">
                    {(() => {
                      const status =
                        emp.assigned > 4 ? 'Overloaded' : emp.assigned === 4 ? 'Busy' : 'Available';
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                            status === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : status === 'Busy'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              status === 'Available'
                                ? 'bg-emerald-500'
                                : status === 'Busy'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                          ></span>
                          <span>{status}</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployeeId(emp.id);
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Filter Analytics</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: TASK ANALYTICS & EMPLOYEE PERFORMANCE PANEL */}
      <TaskAnalyticsPanel />
    </div>
  );
};
