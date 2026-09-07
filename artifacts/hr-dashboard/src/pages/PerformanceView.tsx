import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  UserCheck,
  Zap,
  Award,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

interface EmployeePerformanceData {
  id: string;
  name: string;
  dept: string;
  role: string;
  avatar: string;
  assigned: number;
  completed: number;
  inReview: number;
  inProgress: number;
  pending: number;
  attendanceRate: string;
  avgHoursPerDay: string;
  capacityStatus: 'Available' | 'Busy' | 'Overloaded';
  velocityScore: number;
  recentTasks: { title: string; status: string; priority: string; date: string }[];
}

const EMPLOYEES_DATA: EmployeePerformanceData[] = [
  {
    id: 'emp-1',
    name: 'Ashutosh Mishra',
    dept: 'Product & Tech',
    role: 'Lead Systems Architect',
    avatar: MALE_AVATAR,
    assigned: 2,
    completed: 0,
    inReview: 1,
    inProgress: 1,
    pending: 0,
    attendanceRate: '98.5%',
    avgHoursPerDay: '8.6h',
    capacityStatus: 'Available',
    velocityScore: 94,
    recentTasks: [
      { title: 'API Gateway Telemetry Pipeline', status: 'In Review', priority: 'High', date: '2026-09-05' },
    ],
  },
  {
    id: 'emp-2',
    name: 'Priyanka Sharma',
    dept: 'Marketing',
    role: 'Senior Brand Strategist',
    avatar: FEMALE_AVATAR,
    assigned: 7,
    completed: 0,
    inReview: 3,
    inProgress: 4,
    pending: 0,
    attendanceRate: '96.0%',
    avgHoursPerDay: '8.2h',
    capacityStatus: 'Overloaded',
    velocityScore: 88,
    recentTasks: [
      { title: 'Brand Client Campaign Review', status: 'In Review', priority: 'High', date: '2026-09-04' },
    ],
  },
  {
    id: 'emp-3',
    name: 'Utkarsh Mishra',
    dept: 'Operations & Delivery',
    role: 'Operations Lead',
    avatar: MALE_AVATAR,
    assigned: 7,
    completed: 1,
    inReview: 3,
    inProgress: 3,
    pending: 0,
    attendanceRate: '94.8%',
    avgHoursPerDay: '8.4h',
    capacityStatus: 'Overloaded',
    velocityScore: 91,
    recentTasks: [
      { title: 'Vendor Logistics Audit', status: 'Completed', priority: 'High', date: '2026-09-03' },
    ],
  },
  {
    id: 'emp-4',
    name: 'Prerna Shukla',
    dept: 'Grants & Governance',
    role: 'Grants Strategist',
    avatar: FEMALE_AVATAR,
    assigned: 9,
    completed: 0,
    inReview: 4,
    inProgress: 5,
    pending: 0,
    attendanceRate: '99.0%',
    avgHoursPerDay: '8.8h',
    capacityStatus: 'Overloaded',
    velocityScore: 96,
    recentTasks: [
      { title: 'Agri-Tech Subsidy Compliance Report', status: 'In Review', priority: 'Urgent', date: '2026-09-05' },
    ],
  },
  {
    id: 'emp-5',
    name: 'Shreyansh Siladar',
    dept: 'SM Marketing',
    role: 'Social Media Lead',
    avatar: MALE_AVATAR,
    assigned: 4,
    completed: 0,
    inReview: 2,
    inProgress: 2,
    pending: 0,
    attendanceRate: '95.2%',
    avgHoursPerDay: '8.0h',
    capacityStatus: 'Busy',
    velocityScore: 89,
    recentTasks: [
      { title: 'LinkedIn Enterprise Campaign', status: 'In Review', priority: 'Medium', date: '2026-09-01' },
    ],
  },
  {
    id: 'emp-6',
    name: "Tarul Ma'am",
    dept: 'Operations & Delivery',
    role: 'Delivery Associate',
    avatar: MALE_AVATAR,
    assigned: 1,
    completed: 0,
    inReview: 0,
    inProgress: 1,
    pending: 0,
    attendanceRate: '97.4%',
    avgHoursPerDay: '8.1h',
    capacityStatus: 'Available',
    velocityScore: 92,
    recentTasks: [
      { title: 'Client Dispatch Documentation', status: 'In Progress', priority: 'Low', date: '2026-09-04' },
    ],
  },
  {
    id: 'emp-7',
    name: 'Dr. Harshit Mishra',
    dept: 'Sales',
    role: 'Managing Director / Sales Lead',
    avatar: MALE_AVATAR,
    assigned: 0,
    completed: 0,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    attendanceRate: '100%',
    avgHoursPerDay: '9.2h',
    capacityStatus: 'Available',
    velocityScore: 98,
    recentTasks: [],
  },
  {
    id: 'emp-8',
    name: 'Neha Shukla',
    dept: 'Marketing',
    role: 'Marketing Lead',
    avatar: FEMALE_AVATAR,
    assigned: 0,
    completed: 0,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    attendanceRate: '96.8%',
    avgHoursPerDay: '8.3h',
    capacityStatus: 'Available',
    velocityScore: 93,
    recentTasks: [],
  },
  {
    id: 'emp-9',
    name: 'Dr. Utsav Mishra',
    dept: 'Operations & Delivery',
    role: 'Operations VP',
    avatar: MALE_AVATAR,
    assigned: 0,
    completed: 0,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    attendanceRate: '98.0%',
    avgHoursPerDay: '8.7h',
    capacityStatus: 'Available',
    velocityScore: 95,
    recentTasks: [],
  },
  {
    id: 'emp-10',
    name: 'Jitendra Sir',
    dept: 'Product & Tech',
    role: 'Chief Technology Officer',
    avatar: MALE_AVATAR,
    assigned: 0,
    completed: 0,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    attendanceRate: '100%',
    avgHoursPerDay: '9.0h',
    capacityStatus: 'Available',
    velocityScore: 100,
    recentTasks: [],
  },
  {
    id: 'emp-11',
    name: 'Pranshu Dubey',
    dept: 'Product & System',
    role: 'DevOps Engineer',
    avatar: MALE_AVATAR,
    assigned: 0,
    completed: 0,
    inReview: 0,
    inProgress: 0,
    pending: 0,
    attendanceRate: '97.0%',
    avgHoursPerDay: '8.5h',
    capacityStatus: 'Available',
    velocityScore: 94,
    recentTasks: [],
  },
  {
    id: 'emp-12',
    name: 'Himanshu Tiwari',
    dept: 'Product & Tech',
    role: 'Frontend Engineer',
    avatar: MALE_AVATAR,
    assigned: 4,
    completed: 0,
    inReview: 2,
    inProgress: 2,
    pending: 0,
    attendanceRate: '95.5%',
    avgHoursPerDay: '8.1h',
    capacityStatus: 'Busy',
    velocityScore: 90,
    recentTasks: [
      { title: 'Attendance Heatmap Widget', status: 'In Review', priority: 'Medium', date: '2026-09-03' },
    ],
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

export const PerformanceView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<'WEEK1' | 'WEEK2' | 'MONTH' | 'QUARTER'>('WEEK1');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedEmployee = EMPLOYEES_DATA.find((e) => e.id === selectedEmployeeId);

  // Time range scaling factor
  const timeMultiplier =
    timeRange === 'WEEK1' ? 0.35 : timeRange === 'WEEK2' ? 0.5 : timeRange === 'MONTH' ? 0.8 : 1.0;

  // Aggregated KPI Stats
  const rawAssigned = selectedEmployee
    ? selectedEmployee.assigned
    : EMPLOYEES_DATA.reduce((acc, curr) => acc + curr.assigned, 0);

  const rawCompleted = selectedEmployee
    ? selectedEmployee.completed
    : EMPLOYEES_DATA.reduce((acc, curr) => acc + curr.completed, 0);

  const rawInReview = selectedEmployee
    ? selectedEmployee.inReview
    : EMPLOYEES_DATA.reduce((acc, curr) => acc + curr.inReview, 0);

  const rawPending = selectedEmployee
    ? selectedEmployee.pending
    : EMPLOYEES_DATA.reduce((acc, curr) => acc + curr.pending, 0);

  const totalAssigned = Math.round(rawAssigned * timeMultiplier);
  const totalCompleted = Math.round(rawCompleted * timeMultiplier);
  const totalInReview = Math.round(rawInReview * timeMultiplier);
  const totalPending = Math.round(rawPending * timeMultiplier);
  const totalInProgress = Math.round(selectedEmployee ? selectedEmployee.inProgress * timeMultiplier : 3 * timeMultiplier);

  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  // Pie chart breakdown data
  const pieData = [
    { name: 'Done (Completed)', value: totalCompleted, color: '#10B981' },
    { name: 'To Review', value: totalInReview, color: '#F59E0B' },
    { name: 'In Progress', value: totalInProgress, color: '#3B82F6' },
    { name: 'Pending', value: totalPending, color: '#8B5CF6' },
  ];

  // Filtered employees table
  const filteredEmployeesTable = EMPLOYEES_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Header & Main Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Team & Employee Performance
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Performance Analytics & Productivity</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Real-time task output, sprint completion velocity, attendance tracking, and capacity loading.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Employee Filter Select */}
          <div className="flex items-center gap-2 bg-white border border-gray-200/90 rounded-xl px-3 py-2 shadow-2xs">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer pr-2"
            >
              <option value="ALL">All Team Members (Overall Analytics)</option>
              {EMPLOYEES_DATA.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.dept})
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Selector */}
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

      {/* Selected Employee Alert Header (If Single Employee Selected) */}
      {selectedEmployee && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 border border-emerald-500/40 rounded-2xl p-4 shadow-lg text-white flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <img
              src={selectedEmployee.avatar}
              alt={selectedEmployee.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{selectedEmployee.name}</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  {selectedEmployee.dept}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-semibold">{selectedEmployee.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Capacity Status</span>
              <span className="font-extrabold text-emerald-400 text-sm">{selectedEmployee.capacityStatus}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] font-bold uppercase">Velocity Score</span>
              <span className="font-extrabold text-amber-400 text-sm">{selectedEmployee.velocityScore}/100</span>
            </div>
            <button
              onClick={() => setSelectedEmployeeId('ALL')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Reset to All
            </button>
          </div>
        </div>
      )}

      {/* 3 Key Performance Indicator Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400 font-extrabold uppercase tracking-wider">
            <span>TOTAL ASSIGNED TASKS</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{totalAssigned}</span>
            <span className="text-xs text-emerald-600 font-bold">100% Workload</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-extrabold uppercase tracking-wider">
            <span>COMPLETED (APPROVED)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-900">{totalCompleted}</span>
            <span className="text-xs text-emerald-700 font-extrabold">{completionRate}% Done</span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-700 font-extrabold uppercase tracking-wider">
            <span>TO REVIEW / PENDING</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-900">{totalInReview + totalPending}</span>
            <span className="text-xs text-amber-700 font-extrabold">{totalInReview} Review / {totalPending} Pending</span>
          </div>
        </div>
      </div>

      {/* Grid: Recharts Task Velocity Area Chart & Task Status Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Task Progress & Velocity Chart (Like Image 1/2) */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {selectedEmployee ? `${selectedEmployee.name}'s Output Velocity` : 'Team Task Progress & Sprint Analytics'}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Weekly deliverables breakdown of Completed, To Review, and Pending items across sprint cycles.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> To Review
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Pending
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={OVERALL_SPRINT_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradientPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="amberGradientPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${v} tasks`} />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const completed = payload[0]?.value || 0;
                      const inReview = payload[1]?.value || 0;
                      const pending = payload[2]?.value || 0;
                      const total = completed + inReview + pending;
                      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                      return (
                        <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-xl text-xs font-sans space-y-1 min-w-[180px]">
                          <p className="text-gray-400 font-bold uppercase text-[10px]">{label} Deliverables</p>
                          <p className="font-extrabold text-emerald-700">Completed: {completed} tasks</p>
                          <p className="font-bold text-amber-700">To Review: {inReview} tasks</p>
                          <p className="font-bold text-blue-700">Pending: {pending} tasks</p>
                          <p className="pt-1 border-t text-[11px] font-extrabold text-emerald-600">Completion Rate: {rate}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#emeraldGradientPerf)" />
                <Area type="monotone" dataKey="inReview" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" fill="url(#amberGradientPerf)" />
                <Area type="monotone" dataKey="pending" stroke="#3B82F6" strokeWidth={2} strokeDasharray="2 2" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution Pie / Doughnut Chart */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
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

      {/* Active Resource Capacity Tracker Table (Like Image 3) */}
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
    </div>
  );
};
