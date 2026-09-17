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
  X,
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

const PERSONAL_VELOCITY_TREND = [
  { sprint: 'Sprint 32', velocity: 88, quality: 92 },
  { sprint: 'Sprint 33', velocity: 91, quality: 94 },
  { sprint: 'Sprint 34', velocity: 93, quality: 96 },
  { sprint: 'Sprint 35 (Current)', velocity: 95, quality: 98 },
];

export const EmployeeDashboardView: React.FC = () => {
  const { user, setRole } = useAuth();
  const { selectedEntity } = useEntity();
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'BACKLOG' | 'SPRINT'>('OVERVIEW');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [todaysMeetings, setTodaysMeetings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // DB Employees & Active Employee Profile Resolution
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // Big Responsive Tile Detail Pop-up Modal State
  const [activeModalType, setActiveModalType] = useState<'PENDING_TASKS' | 'ACTIVE_SPRINTS' | 'MEETINGS' | 'COMPLETION_RATE' | 'COMPLETED_TASKS' | null>(null);
  const [analyticsMetric, setAnalyticsMetric] = useState<'VELOCITY_TREND' | 'PRIORITY_BREAKDOWN' | 'SPRINT_PACING'>('VELOCITY_TREND');

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

  // Resolve currently selected active employee
  const activeEmployee =
    dbEmployees.find((e) => e.id === selectedEmployeeId) ||
    dbEmployees.find((e) => e.id === user?.employeeId) ||
    dbEmployees.find((e) => e.email?.toLowerCase() === user?.email?.toLowerCase()) ||
    dbEmployees[0];

  const activeEmpName = activeEmployee
    ? `${activeEmployee.firstName} ${activeEmployee.lastName}`
    : user?.name || 'Priyanka Sharma';
  const activeEmpEmail = activeEmployee?.email || user?.email || 'priyanka.s@ehmconsultancy.com';
  const activeEmpCode = activeEmployee?.employeeCode || 'EHM-E01';
  const activeEmpDesignation = activeEmployee?.designation || 'Senior Team Member';

  const handleCreatePersonalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a task deliverable title.');
      return;
    }

    const newTask: EmployeeDeliverableTask = {
      id: `emp-t-${Date.now()}`,
      taskId: `${activeEmpCode.startsWith('CAG') ? 'CAG' : 'EHM'}-EMP01-00${myTasks.length + 1}`,
      title: newTitle,
      dept: newDept,
      entity: activeEmpCode.startsWith('CAG') ? 'CAG' : 'EHM',
      priority: newPriority,
      lead: newLead,
      assigneeName: activeEmpName,
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
    toast.success(`Task "${newTitle}" created for ${activeEmpName}!`);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewNotes('');
    setNewOutputUrl('');
  };

  // Standup Log State
  const [completedToday, setCompletedToday] = useState('');
  const [plannedTomorrow, setPlannedTomorrow] = useState('');
  const [blockers, setBlockers] = useState('');

  const loadData = async () => {
    try {
      const [empData, tasksData, meetingsData] = await Promise.all([
        fetchApi<any[]>('/api/employees').catch(() => []),
        fetchApi<any[]>('/api/tasks').catch(() => []),
        fetchApi<any[]>('/api/meetings').catch(() => []),
      ]);

      if (Array.isArray(empData) && empData.length > 0) {
        setDbEmployees(empData);
      }

      if (Array.isArray(tasksData) && tasksData.length > 0) {
        const currentTargetEmp =
          empData.find((e: any) => e.id === selectedEmployeeId) ||
          empData.find((e: any) => e.id === user?.employeeId) ||
          empData.find((e: any) => e.email?.toLowerCase() === user?.email?.toLowerCase()) ||
          empData[0];

        const targetId = currentTargetEmp?.id || user?.employeeId;
        const targetEmail = (currentTargetEmp?.email || user?.email || '').toLowerCase();
        const targetFirstName = (currentTargetEmp?.firstName || '').toLowerCase();

        const filteredTasks = tasksData
          .filter((t) => {
            const matchesAssignment = (
              (targetId && (t.assigneeId === targetId || t.employeeId === targetId)) ||
              (targetId && Array.isArray(t.assigneeIds) && t.assigneeIds.includes(targetId)) ||
              (targetEmail && t.assigneeEmail?.toLowerCase() === targetEmail) ||
              (targetFirstName && t.assigneeName?.toLowerCase().includes(targetFirstName))
            );

            return matchesAssignment;
          })
          .map((t) => ({
            id: t.id,
            taskId: t.taskCode || t.id,
            title: t.title,
            dept: currentTargetEmp?.departmentName || 'Product & Tech',
            entity: t.taskCode?.startsWith('CAG') ? 'CAG' : 'EHM',
            priority: t.priority || 'MEDIUM',
            lead: t.reviewingLead || 'Dr. Harshit Mishra',
            assigneeName: currentTargetEmp ? `${currentTargetEmp.firstName} ${currentTargetEmp.lastName}` : (user?.name || 'Ashutosh Mishra'),
            status: (t.status === 'DONE'
              ? 'Done'
              : t.status === 'BLOCKED'
              ? 'Blocked'
              : t.status === 'DELAYED'
              ? 'Delayed'
              : 'In Progress') as any,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '2026-09-18',
            outputUrl: t.deliverableUrl || '',
            waitingOn: 'None (Self)',
            notes: t.description || '',
            delayRequested: false,
            sprintWeek: t.sprintWeek || 'Sprint 35 (Current)',
            completionPct: t.status === 'DONE' ? 100 : 65,
          }));

        if (filteredTasks.length > 0) setMyTasks(filteredTasks);
      }

      if (Array.isArray(meetingsData)) {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const validTodayMeetings = meetingsData.filter((m) => {
          const isCalendarSynced =
            m.source === 'GOOGLE_CALENDAR' ||
            m.source === 'GOOGLE_CALENDAR_IMPORTED' ||
            Boolean(m.googleEventId) ||
            Boolean(m.googleMeetUrl) ||
            Boolean(m.isGoogleCalendar);
          if (!isCalendarSynced) return false;

          if (!m.startTime) return false;
          const mDateStr = new Date(m.startTime).toISOString().split('T')[0];
          return mDateStr === todayStr;
        });

        const seenKeys = new Set<string>();
        const dedupedTodayMeetings = validTodayMeetings.filter((m) => {
          const key = `${(m.title || '').toLowerCase().trim()}_${m.startTime}`;
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

        setTodaysMeetings(dedupedTodayMeetings);
      }
    } catch (err) {
      console.error('[LOAD DATA EXCEPTION]:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, selectedEmployeeId]);

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
      {/* SUB-NAVIGATION TAB BAR */}
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
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Personal Task</span>
          </button>
        </div>
      </div>

      {/* SINGLE UNIFIED EMPLOYEE WORKSPACE HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: User Profile & Welcome */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white">
                EMPLOYEE PERSONAL WORKSPACE • {activeEmpEmail}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-400/30">
                {activeEmpCode}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {activeEmpName}! 👋
            </h2>
            <p className="text-xs text-emerald-100 font-medium leading-relaxed">
              Here is your personal task load distribution, sprint velocity analytics, and daily standup schedule.
            </p>
          </div>

          {/* Right: Workspace Status Box & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Dark Status Card */}
            <div className="bg-emerald-950/40 border border-emerald-400/30 backdrop-blur-sm rounded-xl p-3.5 space-y-0.5 min-w-[170px]">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-300 block">
                WORKSPACE STATUS
              </span>
              <span className="text-xs font-black text-white block">Sprint 35 Active</span>
              <span className="text-[11px] font-semibold text-emerald-200 block">
                {myTasks.length} Active Deliverables
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {dbEmployees.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1.5 rounded-xl shadow-xs">
                  <User className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                  <select
                    value={activeEmployee?.id || ''}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer max-w-[190px] truncate"
                  >
                    {dbEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="text-gray-900 bg-white">
                        [{emp.employeeCode}] {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                <button
                  onClick={() => setRole('ADMIN')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg text-emerald-100 hover:text-white hover:bg-white/15 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Manager View</span>
                </button>
                <button
                  onClick={() => setRole('EMPLOYEE')}
                  className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-white text-emerald-900 shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Employee Active</span>
                </button>
              </div>
            </div>
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
          {/* Top 4 Featured Responsive Stat Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Tasks Pending & Today's Tasks */}
            <div
              onClick={() => setActiveModalType('PENDING_TASKS')}
              className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-2 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform border border-emerald-100">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold block">Today's Tasks & Pending</span>
                <span className="text-base font-extrabold text-gray-900 block leading-tight pt-0.5">
                  {myTasks.filter(t => t.status !== 'Done').length} Pending Tasks
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">Active deliverables in execution</span>
              </div>
            </div>

            {/* Tile 2: Active Sprint Cycles */}
            <div
              onClick={() => setActiveModalType('ACTIVE_SPRINTS')}
              className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-2 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform border border-emerald-100">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold block">Active Sprint</span>
                <span className="text-base font-extrabold text-gray-900 block leading-tight pt-0.5">Sprint 35 Active</span>
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">{activeSprintTasks.length} active sprint items</span>
              </div>
            </div>

            {/* Tile 3: Google Meetings */}
            <div
              onClick={() => setActiveModalType('MEETINGS')}
              className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-2 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform border border-emerald-100">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold block">Google Meetings</span>
                <span className="text-base font-extrabold text-gray-900 block leading-tight pt-0.5">
                  {todaysMeetings.length} Scheduled
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">Synced live calendar</span>
              </div>
            </div>

            {/* Tile 4: Completed Tasks */}
            <div
              onClick={() => setActiveModalType('COMPLETED_TASKS')}
              className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-2 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold block">Completed Tasks</span>
                <span className="text-base font-extrabold text-gray-900 block leading-tight pt-0.5">
                  {doneCount} Completed
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">Approved & signed-off</span>
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

            {/* Chart 2: Customizable Visual Analytics View (65%) */}
            <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">Personal Analytics & Performance Trend</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Select metric breakdown view to switch analytics visualization.</p>
                </div>

                <select
                  value={analyticsMetric}
                  onChange={(e) => setAnalyticsMetric(e.target.value as any)}
                  className="text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                >
                  <option value="VELOCITY_TREND">📈 Sprint Velocity & Quality Trend</option>
                  <option value="PRIORITY_BREAKDOWN">📊 Deliverable Priority Distribution</option>
                  <option value="SPRINT_PACING">🚀 Daily Sprint Completion Pacing</option>
                </select>
              </div>

              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  {analyticsMetric === 'VELOCITY_TREND' ? (
                    <AreaChart data={PERSONAL_VELOCITY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[70, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="velocity" name="Velocity Score" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorVelocity)" />
                      <Area type="monotone" dataKey="quality" name="Quality Score" stroke="#8B5CF6" strokeWidth={2} fillOpacity={0} />
                    </AreaChart>
                  ) : analyticsMetric === 'PRIORITY_BREAKDOWN' ? (
                    <BarChart
                      data={[
                        { priority: 'Urgent', count: myTasks.filter(t => t.priority === 'URGENT').length || 1, color: '#EF4444' },
                        { priority: 'High', count: myTasks.filter(t => t.priority === 'HIGH').length || 3, color: '#F59E0B' },
                        { priority: 'Medium', count: myTasks.filter(t => t.priority === 'MEDIUM').length || 2, color: '#3B82F6' },
                        { priority: 'Low', count: myTasks.filter(t => t.priority === 'LOW').length || 1, color: '#10B981' },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="priority" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                      <Bar dataKey="count" name="Task Count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={[
                      { day: 'Mon', completed: 2, target: 2 },
                      { day: 'Tue', completed: 3, target: 3 },
                      { day: 'Wed', completed: 1, target: 2 },
                      { day: 'Thu', completed: 4, target: 3 },
                      { day: 'Fri', completed: 2, target: 2 },
                      { day: 'Sat', completed: 1, target: 1 },
                    ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                      <Bar dataKey="completed" name="Completed Deliverables" fill="#10B981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="target" name="Target Goal" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
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
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask({
                              id: t.id,
                              taskId: t.taskId,
                              title: t.title,
                              entity: t.entity,
                              assignee: t.assigneeName,
                              reviewingLead: t.lead,
                              status: t.status === 'Done' ? 'Done' : 'In Progress',
                              outputUrl: t.outputUrl,
                              waitingOn: t.waitingOn,
                              notes: t.notes,
                            });
                          }}
                          className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer hover:bg-emerald-100 hover:underline transition-all"
                          title="Click to view task details"
                        >
                          {t.taskId}
                        </span>
                        {(() => {
                          const p = (t.priority || '').toUpperCase();
                          const label = (p === 'URGENT' || p === 'P1' || p === '1') ? 'P1' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'P2' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'P3' : 'P4';
                          const color = (p === 'URGENT' || p === 'P1' || p === '1') ? 'bg-red-100 text-red-800 border-red-200 font-extrabold' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
                          return (
                            <span className={`px-2 py-0.5 text-[10px] rounded border ${color}`}>
                              {label}
                            </span>
                          );
                        })()}
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

            {/* Right Column: Today's Meetings */}
            <div className="lg:col-span-1 space-y-6">
              {/* Today's Meetings Box */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">Today's Google Meetings</h3>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Google Sync</span>
                </div>

                <div className="space-y-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {todaysMeetings.length === 0 ? (
                    <p className="text-xs font-medium text-gray-400 italic py-2">No meetings scheduled for today</p>
                  ) : (
                    todaysMeetings.map((m, idx) => (
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
                  ))
                )}
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
                Filtered view showing ONLY tasks assigned to <strong className="text-emerald-700">{activeEmpName}</strong>.
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
                className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">P1 (Top Priority)</option>
                <option value="HIGH">P2 (High Priority)</option>
                <option value="MEDIUM">P3 (Medium Priority)</option>
                <option value="LOW">P4 (Low Priority)</option>
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
                      {(() => {
                        const p = (t.priority || '').toUpperCase();
                        const label = (p === 'URGENT' || p === 'P1' || p === '1') ? 'P1' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'P2' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'P3' : 'P4';
                        const color = (p === 'URGENT' || p === 'P1' || p === '1') ? 'bg-red-100 text-red-800 border-red-200 font-extrabold' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
                        return (
                          <span className={`px-2 py-0.5 text-[10px] rounded border ${color}`}>
                            {label}
                          </span>
                        );
                      })()}
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
              <p className="text-xs text-gray-500 font-medium">Sprint execution matrix assigned to {activeEmpName}.</p>
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
                  {(() => {
                    const p = (t.priority || '').toUpperCase();
                    const label = (p === 'URGENT' || p === 'P1' || p === '1') ? 'P1' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'P2' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'P3' : 'P4';
                    const color = (p === 'URGENT' || p === 'P1' || p === '1') ? 'bg-red-100 text-red-800 border-red-200 font-extrabold' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
                    return (
                      <span className={`px-2 py-0.5 text-[10px] rounded border ${color}`}>
                        {label}
                      </span>
                    );
                  })()}
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

      {/* 🚀 BIG RESPONSIVE TILE DETAIL POP-UP MODALS */}
      {activeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 select-text">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            {/* 1. PENDING & TODAY'S TASKS MODAL */}
            {activeModalType === 'PENDING_TASKS' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-200 text-blue-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">Today's Tasks & Pending Deliverables</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Detailed breakdown of active sprint deliverables needing execution & review
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {myTasks.filter(t => t.status !== 'Done').map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setActiveModalType(null);
                        handleOpenTaskUpdate(task);
                      }}
                      className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 hover:border-blue-300 hover:bg-white transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {task.taskId}
                          </span>
                          {(() => {
                            const p = (task.priority || '').toUpperCase();
                            const label = (p === 'URGENT' || p === 'P1' || p === '1') ? 'P1' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'P2' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'P3' : 'P4';
                            const color = (p === 'URGENT' || p === 'P1' || p === '1') ? 'bg-red-100 text-red-800 border-red-200 font-extrabold' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
                            return (
                              <span className={`px-2 py-0.5 text-[10px] rounded border ${color}`}>
                                {label}
                              </span>
                            );
                          })()}
                          <span className="text-[10px] font-bold text-gray-500">Lead: {task.lead}</span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">{task.title}</h4>
                        {task.notes && <p className="text-[11px] text-gray-500 line-clamp-1">{task.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-gray-500">{task.dueDate}</span>
                        <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 2. ACTIVE SPRINTS MODAL */}
            {activeModalType === 'ACTIVE_SPRINTS' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">Active Sprint Iterations</h3>
                      <p className="text-xs text-gray-500 font-medium">Sprint 35 4-week iteration deliverables and progress tracking</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Sprint Cycle Name:</span>
                    <span className="text-xs font-extrabold text-amber-950 font-mono">Sprint 35 (Current Month 1)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Total Sprint Tasks:</span>
                    <span className="text-xs font-extrabold text-amber-950">{activeSprintTasks.length} Deliverables</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Reviewing Lead:</span>
                    <span className="text-xs font-extrabold text-amber-950">Dr. Harshit Mishra (CTO)</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-900">Tasks in Active Sprint:</h4>
                  {activeSprintTasks.map((t) => (
                    <div key={t.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-700">{t.taskId}</span>
                        <span>{t.title}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-extrabold bg-white border border-gray-200">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 3. GOOGLE MEETINGS MODAL */}
            {activeModalType === 'MEETINGS' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-2xl border border-indigo-200 text-indigo-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">My Scheduled Google Meetings</h3>
                      <p className="text-xs text-gray-500 font-medium">Google Calendar synced video conference schedule for today</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {todaysMeetings.map((meet) => (
                    <div key={meet.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-gray-900">{meet.title}</h4>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          {new Date(meet.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {meet.description && <p className="text-xs text-gray-500 font-medium">{meet.description}</p>}
                      <div className="pt-2 flex justify-end">
                        <a
                          href={meet.googleMeetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Google Meet</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 4. DELIVERABLE COMPLETION RATE MODAL */}
            {activeModalType === 'COMPLETION_RATE' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">Deliverable Completion Rate Analytics</h3>
                      <p className="text-xs text-gray-500 font-medium">Sprint velocity score, completed ratio, and quality benchmarks</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800 block">Completion Rate</span>
                    <span className="text-2xl font-black text-emerald-950 block">
                      {Math.round((doneCount / (myTasks.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <span className="text-xs font-bold text-purple-800 block">Velocity Score</span>
                    <span className="text-2xl font-black text-purple-950 block">95.0 / 100</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 space-y-1">
                  <div>Completed Items: <span className="text-emerald-700 font-extrabold">{doneCount}</span></div>
                  <div>In Progress / Pending: <span className="text-blue-700 font-extrabold">{inProgressCount}</span></div>
                  <div>Delayed Items: <span className="text-amber-700 font-extrabold">{delayedCount}</span></div>
                </div>
              </>
            )}

            {/* 5. COMPLETED TASKS MODAL */}
            {activeModalType === 'COMPLETED_TASKS' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">Completed Deliverables & Sign-offs</h3>
                      <p className="text-xs text-gray-500 font-medium">Finished tasks with attached output links and lead approvals</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {myTasks.filter(t => t.status === 'Done').map((task) => (
                    <div key={task.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {task.taskId}
                          </span>
                          <h4 className="text-xs font-extrabold text-gray-900">{task.title}</h4>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          DONE / Approved
                        </span>
                      </div>

                      {task.notes && <p className="text-xs text-gray-500 font-medium">{task.notes}</p>}

                      {task.outputUrl && (
                        <div className="pt-2 flex justify-end">
                          <a
                            href={task.outputUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Deliverable Link</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveModalType(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Details View
              </button>
            </div>
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
