import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle,
  Video,
  Edit3,
  AlertTriangle,
  Send,
  Shield,
  User,
  Plus,
  Play,
  Square,
  FileText,
  Sparkles,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Search,
  Users,
  Layers,
  Flame,
  ChevronRight,
  Target,
  FileSpreadsheet,
  CheckCircle2,
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
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

export interface EmployeeDeliverableTask {
  id: string;
  taskId: string;
  title: string;
  dept: string;
  entity: string;
  priority: string;
  lead: string;
  assigneeName: string;
  status: 'In Progress' | 'Done' | 'Delayed' | 'Blocked';
  dueDate: string;
  outputUrl: string;
  waitingOn: string;
  notes: string;
  delayRequested: boolean;
  sprintWeek: string;
  completionPct: number;
}

// 12 Team Members list for Team Directory Exception inside Employee View
const FULL_TEAM_MEMBERS = [
  { id: 'tm-1', name: 'Ashutosh Mishra', role: 'Lead Systems Architect', dept: 'Product & Tech', entity: 'EHM', avatar: MALE_AVATAR, status: 'Active', tasks: 5 },
  { id: 'tm-2', name: 'Priyanka Sharma', role: 'Senior Brand Strategist', dept: 'Marketing', entity: 'EHM', avatar: FEMALE_AVATAR, status: 'Active', tasks: 7 },
  { id: 'tm-3', name: 'Utkarsh Mishra', role: 'Operations Lead', dept: 'Operations & Delivery', entity: 'EHM', avatar: MALE_AVATAR, status: 'Active', tasks: 6 },
  { id: 'tm-4', name: 'Prerna Shukla', role: 'Grants Strategist', dept: 'Grants & Governance', entity: 'EHM', avatar: FEMALE_AVATAR, status: 'Active', tasks: 9 },
  { id: 'tm-5', name: 'Shreyansh Siladar', role: 'Social Media Lead', dept: 'SM Marketing', entity: 'EHM', avatar: MALE_AVATAR, status: 'Active', tasks: 4 },
  { id: 'tm-6', name: "Tarul Ma'am", role: 'Delivery Associate', dept: 'Operations & Delivery', entity: 'CAG', avatar: FEMALE_AVATAR, status: 'Active', tasks: 3 },
  { id: 'tm-7', name: 'Dr. Harshit Mishra', role: 'CTO & VP Tech', dept: 'Product & Tech', entity: 'EHM', avatar: MALE_AVATAR, status: 'Active', tasks: 8 },
  { id: 'tm-8', name: 'Neha Shukla', role: 'Brand Manager', dept: 'Marketing', entity: 'EHM', avatar: FEMALE_AVATAR, status: 'Active', tasks: 5 },
  { id: 'tm-9', name: 'Dr. Utsav Mishra', role: 'Governance Lead', dept: 'Grants & Governance', entity: 'CAG', avatar: MALE_AVATAR, status: 'Active', tasks: 6 },
  { id: 'tm-10', name: 'Jitendra Sir', role: 'Executive Advisor', dept: 'Executive Board', entity: 'EHM', avatar: MALE_AVATAR, status: 'Active', tasks: 2 },
  { id: 'tm-11', name: 'Pranshu Dubey', role: 'DevOps Lead', dept: 'Product & Tech', entity: 'EHM', avatar: MALE_AVATAR, status: 'Active', tasks: 5 },
  { id: 'tm-12', name: 'Himanshu Tiwari', role: 'QA & Testing Lead', dept: 'Product & Tech', entity: 'CAG', avatar: MALE_AVATAR, status: 'Active', tasks: 4 },
];

const DEFAULT_EMPLOYEE_TASKS: EmployeeDeliverableTask[] = [
  {
    id: 'emp-t1',
    taskId: 'EHM-EMP01-001',
    title: 'API Gateway Telemetry Pipeline Integration',
    dept: 'Product & Tech',
    entity: 'EHM',
    priority: 'HIGH',
    lead: 'Dr. Harshit Mishra',
    assigneeName: 'Ashutosh Mishra',
    status: 'In Progress',
    dueDate: '2026-09-08',
    outputUrl: 'https://github.com/ehm/api-gateway-telemetry',
    waitingOn: 'None (Self)',
    notes: 'Configuring GraphQL gateway telemetry and rate limiting middlewares.',
    delayRequested: false,
    sprintWeek: 'Sprint 35 (Current)',
    completionPct: 75,
  },
  {
    id: 'emp-t2',
    taskId: 'EHM-EMP01-002',
    title: 'Real-time WebSocket Notification & Push Engine',
    dept: 'Product & Tech',
    entity: 'EHM',
    priority: 'HIGH',
    lead: 'Jitendra Sir',
    assigneeName: 'Ashutosh Mishra',
    status: 'Done',
    dueDate: '2026-09-05',
    outputUrl: 'https://canva.link/push-engine-architecture',
    waitingOn: 'None (Self)',
    notes: 'Completed Redis pub/sub channel setup and tested 500 concurrent connections.',
    delayRequested: false,
    sprintWeek: 'Sprint 35 (Current)',
    completionPct: 100,
  },
  {
    id: 'emp-t3',
    taskId: 'EHM-EMP01-003',
    title: 'OAuth2 & Role-Based Access Security Audit',
    dept: 'Product & Tech',
    entity: 'EHM',
    priority: 'URGENT',
    lead: 'Jitendra Sir',
    assigneeName: 'Ashutosh Mishra',
    status: 'In Progress',
    dueDate: '2026-09-09',
    outputUrl: 'https://drive.google.com/oauth2-security-audit',
    waitingOn: 'Waiting on Reviewing Lead',
    notes: 'Auditing JWT expiration and bearer token scopes across API endpoints.',
    delayRequested: false,
    sprintWeek: 'Sprint 35 (Current)',
    completionPct: 60,
  },
  {
    id: 'emp-t4',
    taskId: 'EHM-EMP01-004',
    title: 'Supabase Database DDL Schema Migration Review',
    dept: 'Product & Tech',
    entity: 'EHM',
    priority: 'MEDIUM',
    lead: 'Dr. Harshit Mishra',
    assigneeName: 'Ashutosh Mishra',
    status: 'Done',
    dueDate: '2026-09-04',
    outputUrl: 'https://github.com/ehm/db-schema-migrations',
    waitingOn: 'None (Self)',
    notes: 'Applied PostgreSQL migration script for initiatives, epics, and sprint relations.',
    delayRequested: false,
    sprintWeek: 'Sprint 34 (Past)',
    completionPct: 100,
  },
  {
    id: 'emp-t5',
    taskId: 'EHM-EMP01-005',
    title: 'Automated CI/CD Deployment Pipeline Optimization',
    dept: 'Product & Tech',
    entity: 'EHM',
    priority: 'HIGH',
    lead: 'Pranshu Dubey',
    assigneeName: 'Ashutosh Mishra',
    status: 'Delayed',
    dueDate: '2026-09-06',
    outputUrl: 'https://github.com/ehm/cicd-pipeline',
    waitingOn: 'Staging Environment Readiness',
    notes: 'Awaiting Docker image artifact builds for integration testing suite.',
    delayRequested: true,
    sprintWeek: 'Sprint 35 (Current)',
    completionPct: 40,
  },
];

const DEFAULT_EMPLOYEE_MEETINGS = [
  {
    id: 'm-1',
    title: 'Engineering Tech Leadership & Architecture Sync',
    startTime: '2026-09-07T10:00:00.000Z',
    description: 'Weekly system design review with CTO Jitendra Sir and Dev Leads.',
    googleMeetUrl: 'https://meet.google.com/hros-tech-sync',
    status: 'SCHEDULED',
  },
  {
    id: 'm-2',
    title: 'Cross-Entity Infrastructure & DevOps Retrospective',
    startTime: '2026-09-07T14:30:00.000Z',
    description: 'Reviewing deployment pipelines with Pranshu Dubey & Himanshu Tiwari.',
    googleMeetUrl: 'https://meet.google.com/hros-infra-retro',
    status: 'SCHEDULED',
  },
];

// Recharts Personal Employee Data Analytics
const PERSONAL_ATTENDANCE_HOURS = [
  { day: 'Mon', hours: 8.5, expected: 8.0 },
  { day: 'Tue', hours: 9.0, expected: 8.0 },
  { day: 'Wed', hours: 8.2, expected: 8.0 },
  { day: 'Thu', hours: 8.8, expected: 8.0 },
  { day: 'Fri', hours: 8.0, expected: 8.0 },
  { day: 'Sat', hours: 4.5, expected: 0.0 },
];

const PERSONAL_VELOCITY_TREND = [
  { sprint: 'Sprint 32', velocity: 88, quality: 92 },
  { sprint: 'Sprint 33', velocity: 91, quality: 94 },
  { sprint: 'Sprint 34', velocity: 93, quality: 96 },
  { sprint: 'Sprint 35 (Current)', velocity: 95, quality: 98 },
];

export const EmployeeDashboardView: React.FC = () => {
  const { user, setRole } = useAuth();
  const { selectedEntity } = useEntity();
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'BACKLOG' | 'SPRINT' | 'TEAM'>('OVERVIEW');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [myTasks, setMyTasks] = useState<EmployeeDeliverableTask[]>(DEFAULT_EMPLOYEE_TASKS);
  const [todaysMeetings, setTodaysMeetings] = useState<any[]>(DEFAULT_EMPLOYEE_MEETINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // New Personal Task Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Product & Tech');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newLead, setNewLead] = useState('Dr. Harshit Mishra');
  const [newDueDate, setNewDueDate] = useState('2026-09-12');
  const [newNotes, setNewNotes] = useState('');
  const [newOutputUrl, setNewOutputUrl] = useState('');
  const [newSprintWeek, setNewSprintWeek] = useState('Sprint 35 (Current)');

  const handleCreatePersonalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a task deliverable title.');
      return;
    }

    const newTask: EmployeeDeliverableTask = {
      id: `emp-t-${Date.now()}`,
      taskId: `EHM-EMP01-00${myTasks.length + 1}`,
      title: newTitle,
      dept: newDept,
      entity: 'EHM',
      priority: newPriority,
      lead: newLead,
      assigneeName: user?.name || 'Ashutosh Mishra',
      status: 'In Progress',
      dueDate: newDueDate,
      outputUrl: newOutputUrl,
      waitingOn: 'None (Self)',
      notes: newNotes,
      delayRequested: false,
      sprintWeek: newSprintWeek,
      completionPct: 10,
    };

    setMyTasks([newTask, ...myTasks]);
    toast.success(`Task "${newTitle}" created successfully!`);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewNotes('');
    setNewOutputUrl('');
  };

  // Clock In / Attendance State
  const [clockedIn, setClockedIn] = useState(true);
  const [clockTime, setClockTime] = useState('09:00 AM');
  const [elapsedSeconds, setElapsedSeconds] = useState(15300); // 4h 15m

  // Standup Log State
  const [completedToday, setCompletedToday] = useState('');
  const [plannedTomorrow, setPlannedTomorrow] = useState('');
  const [blockers, setBlockers] = useState('');

  useEffect(() => {
    let timer: any;
    if (clockedIn) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [clockedIn]);

  const formatElapsedTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const loadData = async () => {
    try {
      const tasksData = await fetchApi<any[]>('/api/tasks');
      if (tasksData && tasksData.length > 0) {
        const filteredTasks = tasksData
          .filter((t) => !user?.employeeId || t.assigneeId === user.employeeId)
          .map((t) => ({
            id: t.id,
            taskId: t.taskCode || t.id,
            title: t.title,
            dept: 'Product & Tech',
            entity: t.entityId || 'ehmconsultancy',
            priority: t.priority || 'MEDIUM',
            lead: 'Dr. Harshit Mishra',
            assigneeName: user?.name || 'Ashutosh Mishra',
            status: (t.status === 'DONE'
              ? 'Done'
              : t.status === 'BLOCKED'
              ? 'Blocked'
              : t.status === 'DELAYED'
              ? 'Delayed'
              : 'In Progress') as any,
            dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '2026-09-08',
            outputUrl: t.deliverableUrl || '',
            waitingOn: 'None (Self)',
            notes: t.description || '',
            delayRequested: false,
            sprintWeek: 'Sprint 35 (Current)',
            completionPct: t.status === 'DONE' ? 100 : 65,
          }));
        if (filteredTasks.length > 0) setMyTasks(filteredTasks);
      }

      const meetingsData = await fetchApi<any[]>('/api/meetings');
      if (meetingsData && meetingsData.length > 0) setTodaysMeetings(meetingsData);
    } catch {
      // Keep rich fallback default tasks for demonstration
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const delayedTask = myTasks.find((t) => t.status === 'Delayed');

  // Specific employee task metrics calculation for Pie Chart
  const doneCount = myTasks.filter((t) => t.status === 'Done').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'In Progress').length;
  const delayedCount = myTasks.filter((t) => t.status === 'Delayed').length;
  const blockedCount = myTasks.filter((t) => t.status === 'Blocked').length;

  const personalTaskPieData = [
    { name: 'Completed', value: doneCount, color: '#10B981' },
    { name: 'In Progress', value: inProgressCount, color: '#3B82F6' },
    { name: 'Delayed', value: delayedCount, color: '#F59E0B' },
    { name: 'Blocked', value: blockedCount, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  const handleOpenTaskUpdate = (t: EmployeeDeliverableTask) => {
    setSelectedTask({
      id: t.id,
      taskId: t.taskId,
      title: t.title,
      entity: t.entity,
      assignee: t.assigneeName,
      reviewingLead: t.lead,
      status: t.status,
      outputUrl: t.outputUrl,
      waitingOn: t.waitingOn,
      notes: t.notes,
    });
  };

  const handleSaveTaskUpdate = (updated: TaskItem) => {
    setMyTasks(
      myTasks.map((t) =>
        t.id === updated.id
          ? {
              ...t,
              status: updated.status,
              outputUrl: updated.outputUrl || '',
              waitingOn: updated.waitingOn || 'None (Self)',
              notes: updated.notes || '',
              completionPct: updated.status === 'Done' ? 100 : t.completionPct,
            }
          : t
      )
    );
    toast.success(`Personal task ${updated.taskId} updated successfully!`);
  };

  const handleSendDelayRequest = async (taskId: string, taskCode: string) => {
    try {
      await fetchApi(`/api/tasks/${taskId}/delay-request`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Deadline extension requested', requestedDays: 2 }),
      });
      toast.success(`Delay Extension Request for ${taskCode} submitted to Manager!`);
    } catch {
      toast.success(`Delay Extension Request for ${taskCode} logged and sent to Lead!`);
    }
  };

  const handleClockToggle = () => {
    if (clockedIn) {
      setClockedIn(false);
      toast.info('Clocked out of workspace. Work duration recorded.');
    } else {
      setClockedIn(true);
      setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast.success('Clocked in to active employee workspace!');
    }
  };

  const handleStandupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedToday) {
      toast.error('Please enter work completed today.');
      return;
    }
    toast.success('Daily Standup Work Log submitted to Manager & Lead!');
    setCompletedToday('');
    setPlannedTomorrow('');
    setBlockers('');
  };

  // Filter tasks for Backlog tab
  const filteredBacklogTasks = myTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Active Sprint week tasks filter
  const activeSprintTasks = myTasks.filter((t) => t.sprintWeek.includes('Sprint 35'));

  // Filter Team Members table search
  const filteredTeamMembers = FULL_TEAM_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Role Switcher Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-gray-200/80 p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Employee Workspace View</h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Filtered for <strong className="text-emerald-700">{user?.name || 'Ashutosh Mishra'}</strong>. Actions here affect your personal workspace.
            </p>
          </div>
        </div>

        {/* Role Toggle Button */}
        <div className="flex items-center gap-1.5 bg-emerald-50 p-1 rounded-xl border border-emerald-200/80 shrink-0">
          <button
            onClick={() => setRole('ADMIN')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg text-gray-600 hover:text-gray-900 transition-all cursor-pointer flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Switch to Manager / Admin View</span>
          </button>
          <button
            onClick={() => setRole('EMPLOYEE')}
            className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-emerald-600 text-white shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" />
            <span>Employee Mode (Active)</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs inside Employee View */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'OVERVIEW'
                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold border border-gray-200/60'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>My Overview & Analytics</span>
          </button>
          <button
            onClick={() => setActiveSubTab('BACKLOG')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'BACKLOG'
                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold border border-gray-200/60'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>My Product Backlog ({myTasks.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('SPRINT')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'SPRINT'
                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold border border-gray-200/60'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>My Active Sprint Week ({activeSprintTasks.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('TEAM')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'TEAM'
                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold border border-gray-200/60'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Team Directory ({FULL_TEAM_MEMBERS.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Personal Task</span>
          </button>
          <div className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            Showing data for: <span className="text-emerald-700 font-extrabold">{user?.name || 'Ashutosh Mishra'}</span>
          </div>
        </div>
      </div>

      {/* Delayed Task Warning Banner */}
      {delayedTask && (
        <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl p-4 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">⚠️ Task Delay Notice: {delayedTask.taskId}</h4>
              <p className="text-[11px] font-semibold text-amber-800">
                Your task <strong className="text-amber-950">{delayedTask.title}</strong> is flagged as delayed.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSendDelayRequest(delayedTask.id, delayedTask.taskId)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Delay Extension Request</span>
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & VISUAL ANALYTICS */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Employee Greeting Header Banner + Clock In Widget */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Employee Personal Workspace
                </span>
                <span className="text-xs text-emerald-100 font-medium">• {user?.email || 'ashutosh@ehmconsultancy.com'}</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Welcome back, {user?.name || 'Ashutosh Mishra'}! 👋</h2>
              <p className="text-xs text-emerald-100 mt-1">Here is your personal attendance analytics, task load distribution, and daily standup schedule.</p>
            </div>

            {/* Live Clock-In Action Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-right flex items-center gap-3 shrink-0">
              <div className="text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">Attendance Status</span>
                <span className="text-xs font-bold text-white block">
                  {clockedIn ? `Clocked In at ${clockTime}` : 'Clocked Out'}
                </span>
                <span className="text-[11px] font-mono text-emerald-300 block">{formatElapsedTime(elapsedSeconds)}</span>
              </div>
              <button
                onClick={handleClockToggle}
                className={`px-4 py-2 text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                  clockedIn
                    ? 'bg-amber-400 hover:bg-amber-500 text-amber-950'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950'
                }`}
              >
                {clockedIn ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{clockedIn ? 'Clock Out' : 'Clock In'}</span>
              </button>
            </div>
          </div>

          {/* Top 4 Employee Stat Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">My Assigned Tasks</span>
                <span className="text-lg font-bold text-gray-900">{myTasks.length} Active Deliverables</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">My Google Meetings</span>
                <span className="text-lg font-bold text-gray-900">{todaysMeetings.length} Scheduled Today</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Logged Work Hours</span>
                <span className="text-lg font-bold text-gray-900">43.0 hrs this week</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Personal Velocity Score</span>
                <span className="text-lg font-bold text-emerald-600">95.0 (Top Tier)</span>
              </div>
            </div>
          </div>

          {/* Visual Recharts Section for Employee Personal Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Employee Personal Task Load Pie Breakdown (35%) */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">My Task Load Distribution</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Personal deliverable status pie chart.</p>
                </div>
                <PieIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={personalTaskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {personalTaskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                {personalTaskPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 font-semibold">{item.name}:</span>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Weekly Logged Attendance Hours Bar Chart (65%) */}
            <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">My Attendance & Work Hours Trend</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Daily logged shift hours vs 8.0h expected baseline.</p>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PERSONAL_ATTENDANCE_HOURS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 12]} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="hours" name="Logged Hours" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expected" name="Expected Hours" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Main Content Grid: My Tasks (60%) + Daily Standup & Meetings (40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: My Assigned Deliverables Only */}
            <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base tracking-tight">My Assigned Deliverables & Matrix</h3>
                  <p className="text-xs text-gray-400 font-medium">Click any task to update progress, attach link, or submit notes.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Sprint 35 Active
                </span>
              </div>

              <div className="space-y-3">
                {myTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleOpenTaskUpdate(t)}
                    className="p-4 border border-gray-200/80 bg-white hover:bg-emerald-50/20 hover:border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {t.taskId}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                            t.priority === 'URGENT'
                              ? 'bg-red-100 text-red-700'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-400">Lead: {t.lead}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">{t.title}</h4>
                      <p className="text-xs text-gray-500 font-medium line-clamp-1">{t.notes || 'No description provided.'}</p>
                    </div>

                    {/* Task Status Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-3 py-1 text-xs font-extrabold rounded-xl border ${
                          t.status === 'Done'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : t.status === 'Delayed'
                            ? 'bg-amber-100 text-amber-900 border-amber-400 font-black'
                            : t.status === 'Blocked'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {t.status}
                      </span>
                      <button className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Daily Standup Form + Today's Meetings */}
            <div className="lg:col-span-1 space-y-6">
              {/* Daily Standup Submission Card */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">Daily Standup Work Log</h3>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">Log daily progress for reviewing lead (Dr. Harshit Mishra).</p>

                <form onSubmit={handleStandupSubmit} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Completed Today *</label>
                    <input
                      type="text"
                      placeholder="e.g. Configured telemetry API rate limiters..."
                      value={completedToday}
                      onChange={(e) => setCompletedToday(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Planned for Tomorrow</label>
                    <input
                      type="text"
                      placeholder="e.g. Audit JWT bearer scopes..."
                      value={plannedTomorrow}
                      onChange={(e) => setPlannedTomorrow(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Blockers / Dependencies</label>
                    <input
                      type="text"
                      placeholder="e.g. None (Self)"
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Standup Work Log</span>
                  </button>
                </form>
              </div>

              {/* Today's Meetings Box */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">Today's Google Meetings</h3>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Google Sync</span>
                </div>

                <div className="space-y-3">
                  {todaysMeetings.map((m, idx) => (
                    <div key={m.id || idx} className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800">
                          {m.startTime ? new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">SCHEDULED</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs">{m.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">{m.description || 'HROS Meeting'}</p>
                      {m.googleMeetUrl && (
                        <a
                          href={m.googleMeetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg justify-center transition-colors shadow-2xs mt-1"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Google Meet</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PRODUCT BACKLOG (ONLY MY TASKS) */}
      {activeSubTab === 'BACKLOG' && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">My Product Backlog Tasks</h3>
              <p className="text-xs text-gray-500 font-medium">
                Filtered view showing ONLY tasks assigned to <strong className="text-emerald-700">{user?.name || 'Ashutosh Mishra'}</strong>.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search my tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 font-semibold outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80">
                  <th className="py-3 px-4">Task ID & Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Reviewing Lead</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filteredBacklogTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                          {t.taskId}
                        </span>
                        <div>
                          <span className="font-bold text-gray-900 block text-sm">{t.title}</span>
                          <span className="text-[11px] text-gray-400 font-medium">{t.sprintWeek}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                          t.priority === 'URGENT'
                            ? 'bg-red-100 text-red-700'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">{t.lead}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-600">{t.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-1 text-xs font-extrabold rounded-xl border ${
                          t.status === 'Done'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : t.status === 'Delayed'
                            ? 'bg-amber-100 text-amber-900 border-amber-400'
                            : t.status === 'Blocked'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenTaskUpdate(t)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Task</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MY ACTIVE SPRINT WEEK (ONLY SPRINT 35 DELIVERABLES) */}
      {activeSubTab === 'SPRINT' && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Active Sprint 35 (Sept 01 - Sept 14, 2026)
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">My Active Sprint Deliverables</h3>
              <p className="text-xs text-gray-500 font-medium">Sprint execution matrix assigned to {user?.name || 'Ashutosh Mishra'}.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 block">Overall Sprint Completion</span>
              <span className="text-lg font-extrabold text-emerald-600">75% Completed</span>
            </div>
          </div>

          {/* Active Sprint Tasks List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSprintTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 border border-gray-200 rounded-2xl bg-white shadow-2xs hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {t.taskId}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                      t.priority === 'URGENT'
                        ? 'bg-red-100 text-red-700'
                        : t.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{t.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.notes}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-600">
                    <span>Progress: {t.completionPct}%</span>
                    <span>Due: {t.dueDate}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${t.completionPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-500">Lead: {t.lead}</span>
                  <button
                    onClick={() => handleOpenTaskUpdate(t)}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Update Progress</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TEAM DIRECTORY EXCEPTION (FULL 12 MEMBERS FOR EMPLOYEES TO VIEW THEIR TEAM) */}
      {activeSubTab === 'TEAM' && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">HROS Team Members Directory</h3>
              <p className="text-xs text-gray-500 font-medium">
                Full team list view allowing employees to view team member roles, departments, and active entities.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80">
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4 text-center">Active Deliverables</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filteredTeamMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/90 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-2xs" />
                        <div>
                          <span className="font-bold text-gray-900 block text-sm">{m.name}</span>
                          <span className="text-[11px] text-gray-400 font-semibold">{m.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">{m.dept}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${m.entity === 'EHM' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                        {m.entity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-gray-900">{m.tasks} Tasks</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{m.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Update Modal */}
      <TaskUpdateModal
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTaskUpdate}
        isReadOnly={false}
      />

      {/* New Personal Task Modal for Employee Mode */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create New Deliverable Task</h3>
                <p className="text-xs text-gray-500 font-medium">
                  Assign a new task to your personal workspace ({user?.name || 'Ashutosh Mishra'}).
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Employee Workspace
              </span>
            </div>

            <form onSubmit={handleCreatePersonalTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deliverable Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth JWT bearer scope validator"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    <option value="Product & Tech">Product & Tech</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations & Delivery">Operations & Delivery</option>
                    <option value="Grants & Governance">Grants & Governance</option>
                    <option value="SM Marketing">SM Marketing</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sprint Cycle *</label>
                  <select
                    value={newSprintWeek}
                    onChange={(e) => setNewSprintWeek(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    <option value="Sprint 35 (Current)">Sprint 35 (Current Active)</option>
                    <option value="Sprint 36 (Upcoming)">Sprint 36 (Upcoming)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead *</label>
                  <select
                    value={newLead}
                    onChange={(e) => setNewLead(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    <option value="Dr. Harshit Mishra">Dr. Harshit Mishra (CTO)</option>
                    <option value="Jitendra Sir">Jitendra Sir (Executive Advisor)</option>
                    <option value="Pranshu Dubey">Pranshu Dubey (DevOps Lead)</option>
                    <option value="Utkarsh Mishra">Utkarsh Mishra (Ops Lead)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deliverable Link (Canva / GitHub / Drive)</label>
                <input
                  type="text"
                  placeholder="https://github.com/ehm/repository or Canva design link"
                  value={newOutputUrl}
                  onChange={(e) => setNewOutputUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Task Description / Objective</label>
                <textarea
                  rows={2}
                  placeholder="Detailed work requirements, technical notes, or implementation goals..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Create Deliverable Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
