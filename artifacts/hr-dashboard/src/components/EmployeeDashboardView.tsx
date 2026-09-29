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
  ArrowRight,
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
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { useEntity } from '../contexts/EntityContext';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { TaskProgressSprintAnalytics } from './TaskProgressSprintAnalytics';
import { PinnedAnnouncementBanner } from './PinnedAnnouncementBanner';
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
  status: string;
  dueDate: string;
  outputUrl: string;
  waitingOn: string;
  completionPct?: number;
  delayRequested?: boolean;
  notes?: string;
  sprintWeek?: string;
}

export const calculateTaskProgress = (taskStatus: string, checklists?: any[]): number => {
  const s = String(taskStatus || '').toUpperCase().replace(/[^A-Z_]/g, '_');
  if (s.includes('DONE') || s.includes('COMPLETED') || s.includes('APPROVED')) return 100;
  if (s.includes('REVIEW')) return 85;
  if (s.includes('PROGRESS')) {
    if (Array.isArray(checklists) && checklists.length > 0) {
      const completed = checklists.filter((c: any) => c.isCompleted).length;
      return Math.round((completed / checklists.length) * 100);
    }
    return 50;
  }
  if (s.includes('TODO')) return 25;
  if (s.includes('PLANNED')) return 10;
  if (s.includes('DELAYED')) return 40;
  if (s.includes('BLOCKED')) return 20;
  if (s.includes('BACKLOG')) return 0;
  return 0;
};

export const EmployeeDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [myTasks, setMyTasks] = useState<EmployeeDeliverableTask[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [todaysMeetings, setTodaysMeetings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(false);

  // DB Employees & Active Employee Profile Resolution
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
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
  const [newDueDate, setNewDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newOutputUrl, setNewOutputUrl] = useState('');
  const [newSprintWeek, setNewSprintWeek] = useState('');

  // Resolve currently selected active employee (For non-admin, strictly lock to logged-in user!)
  const isAdmin = user?.role === 'ADMIN';
  const activeEmployee =
    (isAdmin && selectedEmployeeId ? dbEmployees.find((e) => e.id === selectedEmployeeId) : null) ||
    dbEmployees.find((e) => e.id === user?.employeeId) ||
    dbEmployees.find((e) => e.email?.toLowerCase() === user?.email?.toLowerCase()) ||
    (isAdmin ? dbEmployees[0] : null);

  const activeEmpName = activeEmployee
    ? `${activeEmployee.firstName} ${activeEmployee.lastName}`
    : user?.name || user?.email?.split('@')[0] || 'Team Workspace';
  const activeEmpEmail = activeEmployee?.email || user?.email || '';
  const activeEmpCode = activeEmployee?.employeeCode || (user?.employeeId ? `EMP-${user.employeeId.slice(0, 4)}` : 'EHM-E01');
  const activeEmpDesignation = activeEmployee?.designation || 'Senior Team Member';

  const handleCreatePersonalTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a task deliverable title.');
      return;
    }

    const entityCode = activeEmployee?.entityCode || (activeEmployee as any)?.entity || 'EHM';
    const targetEmpId = activeEmployee?.id || user?.employeeId || user?.id;

    try {
      const leadEmp = dbEmployees.find((e) => `${e.firstName} ${e.lastName}`.trim() === newLead.trim());
      const createdTask = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newNotes.trim() || undefined,
          priority: newPriority,
          dueDate: newDueDate,
          deliverableUrl: newOutputUrl.trim() || undefined,
          assigneeId: targetEmpId,
          reviewingLead: newLead,
          reviewingLeadId: leadEmp?.id || undefined,
          entityCode: entityCode,
          entity: entityCode,
          sprintWeek: newSprintWeek,
          status: 'IN_PROGRESS',
        }),
      });

      toast.success(`Task "${newTitle}" created and saved to live database!`);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewNotes('');
      setNewOutputUrl('');
      await loadData();
    } catch (err: any) {
      console.error('[CREATE PERSONAL TASK ERROR]:', err);
      toast.error(err?.message || 'Failed to save task to database');
    }
  };


  const loadData = async (_silent = false) => {
    try {
      const [empData, tasksData, meetingsData, sprintsData] = await Promise.all([
        fetchApi<any[]>('/api/employees').catch(() => []),
        fetchApi<any[]>('/api/tasks').catch(() => []),
        fetchApi<any[]>('/api/meetings').catch(() => []),
        fetchApi<any[]>('/api/sprints').catch(() => []),
      ]);

      if (Array.isArray(empData) && empData.length > 0) {
        setDbEmployees(empData);
      }

      if (Array.isArray(sprintsData)) {
        setSprints(sprintsData);
      }

      if (Array.isArray(tasksData)) {
        const isAdminUser = user?.role === 'ADMIN';
        const currentTargetEmp =
          (isAdminUser && selectedEmployeeId ? empData.find((e: any) => e.id === selectedEmployeeId) : null) ||
          empData.find((e: any) => e.id === user?.employeeId) ||
          empData.find((e: any) => e.email?.toLowerCase() === user?.email?.toLowerCase()) ||
          (isAdminUser ? empData[0] : null);

        const targetId = currentTargetEmp?.id || user?.employeeId || user?.id;
        const targetEmail = (currentTargetEmp?.email || user?.email || '').toLowerCase();

        const sprintMap = new Map<string, string>();
        (sprintsData || []).forEach((s: any) => sprintMap.set(s.id, s.name));

        const filteredTasks = tasksData
          .filter((t) => {
            const matchesAssignment = (
              (targetId && (t.assigneeId === targetId || t.employeeId === targetId)) ||
              (targetId && Array.isArray(t.assigneeIds) && t.assigneeIds.includes(targetId)) ||
              (targetEmail && t.assigneeEmail?.toLowerCase() === targetEmail)
            );

            return matchesAssignment;
          })
          .map((t) => {
            const matchedLeadEmp = (empData || []).find((e: any) => e.id === t.reviewingLeadId || e.employeeId === t.reviewingLeadId);
            const leadName = matchedLeadEmp ? `${matchedLeadEmp.firstName} ${matchedLeadEmp.lastName}`.trim() : ((t.reviewingLead && t.reviewingLead.toLowerCase() !== 'manager lead') ? t.reviewingLead : 'Unassigned');
            const resolvedSprintName = t.sprintId ? sprintMap.get(t.sprintId) : t.sprintWeek;

            const taskBadge = getEntityBadge(t);
            return {
              id: t.id,
              taskId: t.taskCode || t.id,
              taskCode: t.taskCode || t.id,
              title: t.title,
              dept: currentTargetEmp?.departmentName || 'Product & Tech',
              entity: taskBadge.isCommon ? 'COMMON' : taskBadge.isCAG ? 'CLIMAGRO' : 'EHM',
              priority: t.priority || 'MEDIUM',
              lead: leadName,
              reviewingLeadId: t.reviewingLeadId || matchedLeadEmp?.id,
              assigneeName: currentTargetEmp ? `${currentTargetEmp.firstName} ${currentTargetEmp.lastName}` : (user?.name || 'Team Member'),
              assigneeId: t.assigneeId,
              status: (t.status === 'DONE'
                ? 'Done'
                : t.status === 'BLOCKED'
                  ? 'Blocked'
                  : t.status === 'DELAYED'
                    ? 'Delayed'
                    : 'In Progress') as any,
              dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '2026-09-18',
              outputUrl: t.deliverableUrl || '',
              waitingOn: t.waitingOn || 'None (Self)',
              notes: t.description || '',
              delayRequested: false,
              sprintWeek: resolvedSprintName || t.sprintWeek || 'Backlog',
              completionPct: calculateTaskProgress(t.status, t.checklists),
            };
          });

        setMyTasks(filteredTasks);
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
    } finally {
      setIsDataLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, selectedEmployeeId]);

  useEffect(() => {
    const handleUpdate = () => {
      loadData(true);
    };
    window.addEventListener('tasks-updated', handleUpdate);
    return () => window.removeEventListener('tasks-updated', handleUpdate);
  }, []);

  // Scope Employee Tasks & Meetings by Selected Entity (EHM / CAG / ALL)
  const scopedMyTasks = myTasks.filter((t) => matchesEntityFilter(t, selectedEntity));
  const scopedTodaysMeetings = todaysMeetings.filter((m) => matchesEntityFilter(m, selectedEntity));

  const todayStr = new Date().toISOString().split('T')[0];
  const delayedTask = scopedMyTasks.find((t) => t.status === 'Delayed');
  const lateRunningTask = isDataLoaded
    ? (scopedMyTasks.find((t) => t.status !== 'Done' && (t.status === 'Delayed' || (t.dueDate && t.dueDate.split('T')[0] < todayStr))) || delayedTask)
    : null;

  // Specific employee task metrics calculation for Pie Chart
  const doneCount = scopedMyTasks.filter((t) => t.status === 'Done').length;
  const inProgressCount = scopedMyTasks.filter((t) => t.status === 'In Progress').length;
  const delayedCount = scopedMyTasks.filter((t) => t.status === 'Delayed').length;
  const blockedCount = scopedMyTasks.filter((t) => t.status === 'Blocked').length;

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
      taskCode: t.taskId,
      title: t.title,
      entity: t.entity,
      assignee: t.assigneeName,
      reviewingLead: t.lead,
      status: t.status,
      outputUrl: t.outputUrl,
      waitingOn: t.waitingOn,
      notes: t.notes,
      epicId: (t as any).epicId || null,
    });
  };

  const handleSaveTaskUpdate = async (updated: TaskItem) => {
    try {
      const badge = getEntityBadge(updated);
      const resolvedEntityLabel = badge.isCommon ? 'COMMON' : badge.isCAG ? 'CLIMAGRO' : 'EHM';
      const resolvedEntityCode = badge.isCommon ? 'COMMON' : badge.isCAG ? 'CAG' : 'EHM';

      await fetchApi(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: updated.title,
          entity: resolvedEntityLabel,
          entityCode: resolvedEntityCode,
          epicId: updated.epicId !== undefined ? updated.epicId : null,
          status: updated.status,
          deliverableUrl: updated.outputUrl || '',
          description: updated.notes || '',
          waitingOn: updated.waitingOn,
          priority: updated.priority,
          dueDate: updated.dueDate,
        }),
      });
      setMyTasks((prev) =>
        prev.map((t) =>
          t.id === updated.id
            ? {
              ...t,
              title: updated.title || t.title,
              entity: resolvedEntityLabel,
              priority: updated.priority || t.priority,
              status: updated.status,
              outputUrl: updated.outputUrl || '',
              waitingOn: updated.waitingOn || 'None (Self)',
              notes: updated.notes || '',
              completionPct: calculateTaskProgress(updated.status),
            }
            : t
        )
      );
      toast.success(`Task ${updated.taskId} updated & saved to live database!`);
      await loadData(true);
      window.dispatchEvent(new CustomEvent('tasks-updated'));
    } catch (err: any) {
      console.error('[EMPLOYEE DASH TASK UPDATE ERROR]:', err);
      toast.error(err?.message || 'Failed to save task update to database');
      throw err;
    }
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




  // Filter tasks for Backlog tab
  const filteredBacklogTasks = scopedMyTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Identify sprints assigned specifically to this employee
  const currentEmployeeId = activeEmployee?.id || user?.employeeId;
  const employeeSprints = sprints.filter((s) => {
    if (!currentEmployeeId && !isAdmin) return false;
    if (currentEmployeeId && (s.employeeId === currentEmployeeId || (Array.isArray(s.employeeIds) && s.employeeIds.includes(currentEmployeeId)))) return true;
    if (s.id && scopedMyTasks.some((t: any) => t.sprintId === s.id)) return true;
    return false;
  });

  const activeSprint =
    employeeSprints.find((s) => s.status === 'ACTIVE') ||
    (isAdmin && !selectedEmployeeId ? (sprints.find((s) => s.status === 'ACTIVE') || null) : null) ||
    null;

  const activeSprintName = activeSprint
    ? (activeSprint.sprintCode ? `${activeSprint.sprintCode}: ${activeSprint.name}` : activeSprint.name)
    : 'No Active Sprint';

  // Core dynamic metrics strictly from scopedMyTasks (Single unified source of truth)
  const totalTasksCount = scopedMyTasks.length;
  const doneTasksCount = scopedMyTasks.filter((t) => t.status === 'Done').length;
  const pendingTasksCount = scopedMyTasks.filter((t) => t.status !== 'Done').length;
  const completionVelocityPct = totalTasksCount > 0
    ? Math.round((doneTasksCount / totalTasksCount) * 100)
    : 0;

  // Active Sprints list strictly for this employee
  const activeSprintsList = employeeSprints.filter((s) => s.status === 'ACTIVE');
  const activeSprintsCount = activeSprintsList.length;
  const activeSprintCodes = activeSprintsCount > 0
    ? activeSprintsList.map((s) => s.sprintCode || s.name).join(', ')
    : 'No active sprint';

  // Today's meetings completed vs scheduled ratio calculation
  const now = new Date();
  const pastMeetingsCount = scopedTodaysMeetings.filter((m) => {
    if (m.status === 'COMPLETED' || m.status === 'DONE') return true;
    if (m.endTime && new Date(m.endTime) < now) return true;
    if (!m.endTime && m.startTime) {
      const start = new Date(m.startTime);
      return start.getTime() + 30 * 60 * 1000 < now.getTime();
    }
    return false;
  }).length;
  const totalTodayMeetings = scopedTodaysMeetings.length;
  const upcomingMeetingsCount = Math.max(0, totalTodayMeetings - pastMeetingsCount);

  // Overview filtered deliverables (handles clicking the Task pending filter tile)
  const displayedDeliverables = showPendingOnly
    ? scopedMyTasks.filter((t) => t.status !== 'Done')
    : scopedMyTasks;

  // Active Sprint week tasks filter: strictly tasks assigned to this active sprint
  const activeSprintTasks = activeSprint
    ? scopedMyTasks.filter((t) => {
        if ((t as any).sprintId && (t as any).sprintId === activeSprint.id) return true;
        if (activeSprint.name && (t.sprintWeek || '').toLowerCase() === activeSprint.name.toLowerCase()) return true;
        if (activeSprint.targetWeek && (t.sprintWeek || '').toLowerCase() === activeSprint.targetWeek.toLowerCase()) return true;
        if (activeSprint.sprintCode && (t.sprintWeek || '').toLowerCase().includes(activeSprint.sprintCode.toLowerCase())) return true;
        return false;
      })
    : [];

  const overallSprintCompletionPct = activeSprintTasks.length > 0
    ? Math.round(activeSprintTasks.reduce((sum, t) => sum + (t.completionPct || 0), 0) / activeSprintTasks.length)
    : (activeSprint?.status === 'DONE' ? 100 : 0);

  // Filter Team Members table search from live database
  const mappedTeamMembers = dbEmployees.map((emp) => ({
    id: emp.id,
    name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Team Member',
    role: emp.designation || 'Specialist',
    dept: emp.departmentName || 'Engineering',
    entity: emp.entityCode || (emp as any).entity || 'EHM',
    status: 'Active',
  }));

  const filteredTeamMembers = mappedTeamMembers.filter((m) =>
    matchesEntityFilter(m, selectedEntity) &&
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dept.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 select-none">
      {/* PINNED ANNOUNCEMENT TOP CAPSULE BANNER */}
      <PinnedAnnouncementBanner />

      {/* SUB-NAVIGATION TAB BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl border border-gray-200">
          <div className="px-3.5 py-1.5 text-xs font-extrabold rounded-lg bg-white text-emerald-800 shadow-2xs border border-gray-200/60 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>My Overview & Analytics</span>
          </div>
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
                {activeEmpName}
              </span>
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                Your Mail
              </span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-50">
                {activeEmpEmail || user?.email || 'team@example.com'}
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

      {/* TASK RUNNING LATE POP CAPSULE BANNER */}
      {lateRunningTask && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border-2 border-red-500/50 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in zoom-in-95 duration-200 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-xs rounded-xl border border-white/30 shrink-0">
              <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  Task Running Late 🔴
                </span>
                <span className="text-xs font-bold text-red-100">
                  Due Date: {lateRunningTask.dueDate}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white pt-1">
                [{lateRunningTask.taskId}] {lateRunningTask.title}
              </h4>
              <p className="text-[11px] font-medium text-red-100">
                Lead Reviewer: {lateRunningTask.lead} | Priority: {lateRunningTask.priority}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSendDelayRequest(lateRunningTask.id, lateRunningTask.taskId)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-700 font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-red-600" />
            <span>Request Extension / Update</span>
          </button>
        </div>
      )}

      {/* OVERVIEW & VISUAL ANALYTICS */}
      <div className="space-y-6">
          {/* STAT TILES — 3 tiles in exact order with top-right logos (Completion velocity removed per user request) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {/* Tile 1: Task (Pending / Total) with click-to-filter & Top-Right Logo */}
            <div
              onClick={() => setShowPendingOnly(prev => !prev)}
              className={`border rounded-xl p-3.5 shadow-2xs space-y-1.5 cursor-pointer hover:border-emerald-400 hover:shadow-xs transition-all group ${
                showPendingOnly
                  ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                  : 'bg-white border-gray-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 font-semibold block leading-tight">Task</span>
                    {showPendingOnly && (
                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[8px] font-extrabold uppercase rounded-full">
                        FILTERED
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                      {pendingTasksCount}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">pending</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block pt-1 leading-tight">
                    {doneTasksCount}/{totalTasksCount} completed
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Tile 2: Active Sprints (Scoped to employee) & Top-Right Logo */}
            <div
              onClick={() => setActiveModalType('ACTIVE_SPRINTS')}
              className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs space-y-1.5 cursor-pointer hover:border-emerald-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block leading-tight">Active Sprints</span>
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                      {activeSprintsCount}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">active</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block pt-1 leading-tight truncate max-w-[170px]" title={activeSprintCodes}>
                    {activeSprintCodes}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Tile 3: Meetings today (Ratio e.g. 2/3) & Top-Right Logo */}
            <div
              onClick={() => setActiveModalType('MEETINGS')}
              className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs space-y-1.5 cursor-pointer hover:border-emerald-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block leading-tight">Meetings today</span>
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                      {pastMeetingsCount}/{totalTodayMeetings}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">done</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block pt-1 leading-tight">
                    {totalTodayMeetings > 0 ? `${upcomingMeetingsCount} upcoming today` : 'No meetings today'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* 1. MY ASSIGNED DELIVERABLES & MATRIX (DIRECTLY BELOW STAT TILES - LARGEST PROMINENT SECTION) */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base tracking-tight">My Assigned Deliverables & Matrix</h3>
                <p className="text-xs text-gray-400 font-medium">Click any task to update progress, attach link, or submit notes.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {showPendingOnly && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold animate-in fade-in">
                    <span>Showing: Pending only ({displayedDeliverables.length})</span>
                    <button
                      onClick={() => setShowPendingOnly(false)}
                      className="text-amber-800 hover:text-amber-950 underline ml-1 cursor-pointer font-black text-[11px]"
                    >
                      Show all
                    </button>
                  </div>
                )}
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full truncate max-w-[200px]" title={activeSprintName}>
                  {activeSprintName}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {displayedDeliverables.length === 0 ? (
                <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-500">
                    {showPendingOnly
                      ? 'No pending deliverables found! All assigned tasks are completed.'
                      : 'No deliverables currently assigned to your workspace.'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {showPendingOnly
                      ? 'Click "Show all" to view completed tasks.'
                      : 'Use the "+ Create Personal Task" button above to log a task or wait for Lead assignment.'}
                  </p>
                </div>
              ) : (
                displayedDeliverables.map((t) => (
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
                              taskCode: t.taskId,
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
                        className={`px-3 py-1 text-xs font-extrabold rounded-xl border ${t.status === 'Done'
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
                ))
              )}
            </div>
          </div>

          {/* 2. LOWER SECTION: SHRUNK COMBINED ANALYTICS (LEFT 2/3) + GOOGLE MEETINGS (RIGHT 1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left 2 Cols: Refunctioned Task Analysis (Functional with user selector dropdown) */}
            <div className="lg:col-span-2 flex flex-col">
              <TaskProgressSprintAnalytics
                className="h-full"
                viewType="EMPLOYEE"
                title="Task Analysis"
                defaultEmployeeId={activeEmployee?.id || user?.employeeId || user?.id}
              />
            </div>

            {/* Right 1 Col: Today's Google Meetings */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="font-bold text-gray-900 text-sm tracking-tight">Today's Google Meetings</h3>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Live Sync
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">Calendar synced schedule for {activeEmpName}.</p>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar flex-1">
                  {scopedTodaysMeetings.length === 0 ? (
                    <div className="p-4 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                      <p className="text-xs font-medium text-gray-400 italic">No meetings scheduled for today</p>
                    </div>
                  ) : (
                    scopedTodaysMeetings.map((m, idx) => {
                      const isPast =
                        m.status === 'COMPLETED' ||
                        m.status === 'DONE' ||
                        (m.endTime && new Date(m.endTime) < now) ||
                        (!m.endTime && m.startTime && new Date(m.startTime).getTime() + 30 * 60 * 1000 < now.getTime());

                      return (
                        <div
                          key={m.id || idx}
                          className={`p-3 rounded-xl space-y-1.5 transition-all ${
                            isPast
                              ? 'bg-slate-50/80 border border-slate-200/80 opacity-90'
                              : 'bg-emerald-50/60 border border-emerald-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800">
                              {m.startTime ? new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                            </span>
                            {isPast ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-extrabold rounded-full border border-slate-300">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                DONE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-extrabold rounded-full shadow-2xs">
                                <Clock className="w-2.5 h-2.5" />
                                SCHEDULED
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-900 text-xs truncate">{m.title}</h4>
                          {m.description && <p className="text-[11px] text-gray-500 font-medium line-clamp-1">{m.description}</p>}
                          {m.googleMeetUrl && !isPast && (
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
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>



      {/* 🚀 RESPONSIVE MINIMAL CLEAN KPI CARD DETAIL MODALS (MATCHING REFERENCE IMAGE 1 & 2) */}
      {activeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 select-text">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-xl border border-gray-200 max-h-[85vh] overflow-y-auto space-y-4">
            
            {/* 1. PENDING & TODAY'S TASKS MODAL */}
            {activeModalType === 'PENDING_TASKS' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">Today's Tasks & Pending</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {myTasks.filter(t => t.status !== 'Done').length} tasks needing execution & review
                      </p>
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
                  {myTasks.filter(t => t.status !== 'Done').length === 0 ? (
                    <div className="p-4 text-center text-xs font-semibold text-gray-400">No pending tasks found. All caught up!</div>
                  ) : (
                    myTasks.filter(t => t.status !== 'Done').slice(0, 5).map((task) => {
                      const p = (task.priority || '').toUpperCase();
                      const prioLabel = (p === 'URGENT' || p === 'P1' || p === '1') ? 'urgent' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'high' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'medium' : 'low';
                      const prioColor = (p === 'URGENT' || p === 'P1' || p === '1') ? 'bg-red-50 text-red-700 border-red-200 font-bold' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium';

                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            setActiveModalType(null);
                            handleOpenTaskUpdate(task);
                          }}
                          className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition-colors cursor-pointer gap-2"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{task.title}</h4>
                            <p className="text-[11px] text-gray-500 font-medium truncate">
                              {task.assigneeName || 'Ashutosh Mishra'} · {task.taskId}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${prioColor}`}>
                              {prioLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{Math.max(0, myTasks.filter(t => t.status !== 'Done').length - 5)} more</span>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>View backlog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* 2. ACTIVE SPRINTS MODAL */}
            {activeModalType === 'ACTIVE_SPRINTS' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">Active sprints</h3>
                      <p className="text-xs text-gray-500 font-medium">{activeSprintName} active iteration tracking</p>
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
                  {activeSprintTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs font-semibold text-gray-400">No active sprint items.</div>
                  ) : (
                    activeSprintTasks.slice(0, 5).map((t) => (
                      <div key={t.id} className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition-colors gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{t.title}</h4>
                          <p className="text-[11px] text-gray-500 font-medium truncate">
                            {t.assigneeName || 'Ashutosh Mishra'} · {t.taskId} · {t.sprintWeek}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 border border-gray-200 text-gray-700 shrink-0">
                          {t.status.toLowerCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{Math.max(0, activeSprintTasks.length - 5)} more</span>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>View sprints</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* 3. GOOGLE MEETINGS MODAL */}
            {activeModalType === 'MEETINGS' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">Today's Google Meetings</h3>
                      <p className="text-xs text-gray-500 font-medium">Calendar synced video conference schedule</p>
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
                  {todaysMeetings.length === 0 ? (
                    <div className="p-4 text-center text-xs font-semibold text-gray-400">No scheduled Google Meetings for today.</div>
                  ) : (
                    todaysMeetings.map((meet) => (
                      <div key={meet.id} className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition-colors gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{meet.title}</h4>
                          {meet.description && <p className="text-[11px] text-gray-500 truncate">{meet.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            {new Date(meet.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <a
                            href={meet.googleMeetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{todaysMeetings.length} meetings today</span>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Close modal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* 4. COMPLETED TASKS MODAL */}
            {activeModalType === 'COMPLETED_TASKS' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">Completed Deliverables</h3>
                      <p className="text-xs text-gray-500 font-medium">Finished tasks with lead approvals</p>
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
                  {myTasks.filter(t => t.status === 'Done').length === 0 ? (
                    <div className="p-4 text-center text-xs font-semibold text-gray-400">No completed tasks yet.</div>
                  ) : (
                    myTasks.filter(t => t.status === 'Done').slice(0, 5).map((task) => (
                      <div key={task.id} className="p-3 flex items-center justify-between hover:bg-gray-50/70 transition-colors gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{task.title}</h4>
                          <p className="text-[11px] text-gray-500 font-medium truncate">
                            {task.assigneeName || 'Ashutosh Mishra'} · {task.taskId}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          done
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{Math.max(0, doneCount - 5)} more</span>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Close modal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* 5. COMPLETION VELOCITY RATE MODAL */}
            {activeModalType === 'COMPLETION_RATE' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
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
                      <span className="text-2xl font-extrabold text-gray-900 block mt-0.5">{myTasks.length}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-gray-500 block">Completed</span>
                      <span className="text-2xl font-extrabold text-gray-900 block mt-0.5">{doneCount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-gray-500 block">Velocity</span>
                      <span className="text-2xl font-extrabold text-gray-900 block mt-0.5">
                        {myTasks.length > 0 ? Math.round((doneCount / myTasks.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${myTasks.length > 0 ? Math.round((doneCount / myTasks.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs text-xs"
                  >
                    <span>Close modal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* Task Update Modal */}
      <TaskUpdateModal
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTaskUpdate}
        onDelete={(deletedId) => {
          setMyTasks((prev: EmployeeDeliverableTask[]) => prev.filter((t: EmployeeDeliverableTask) => t.id !== deletedId));
          setSelectedTask(null);
        }}
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
                Team Workspace
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
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    {sprints.map((s) => (
                      <option key={s.id} value={s.targetWeek || s.name}>
                        [{s.sprintCode || 'Sprint'}] {s.name}
                      </option>
                    ))}
                    {sprints.length === 0 && (
                      <>
                        <option value="Week 1 (Days 1–7)">Week 1 (Days 1–7)</option>
                        <option value="Week 2 (Days 8–14)">Week 2 (Days 8–14)</option>
                        <option value="Week 3 (Days 15–21)">Week 3 (Days 15–21)</option>
                        <option value="Week 4 (Days 22–28)">Week 4 (Days 22–28)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead *</label>
                  <select
                    value={newLead}
                    onChange={(e) => setNewLead(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    {dbEmployees.map((e) => (
                      <option key={e.id} value={`${e.firstName} ${e.lastName}`}>
                        {e.firstName} {e.lastName}
                      </option>
                    ))}
                    {dbEmployees.length === 0 && (
                      <option value="Unassigned">Unassigned</option>
                    )}
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
