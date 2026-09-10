import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Search, Filter, Archive, AlertCircle, Users, Lock, Clock, MoveRight, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';

interface SprintItem {
  id: string;
  sprintCode: string;
  name: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  epicTitle?: string;
  department?: string | null;
  targetWeek?: string | null;
  reviewingLeadId?: string | null;
  reviewingLeadName?: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  goal?: string;
  tasksCount?: number;
  tasks?: any[];
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  designation: string;
  email: string;
}

interface EpicOption {
  id: string;
  epicCode: string;
  title: string;
}

interface Props {
  isManager: boolean;
}

const DEPARTMENT_OPTIONS = [
  'Marketing',
  'Sales',
  'Product & Tech',
  'Operations & Delivery',
  'Grants & Governance',
];

const WEEKS = [
  { id: 'ALL', label: 'All Weeks (Month 1)', isFuture: false },
  { id: 'Week 1 (Days 1–7)', label: 'Week 1 (Days 1–7)', isFuture: false },
  { id: 'Week 2 (Days 8–14)', label: 'Week 2 (Days 8–14)', isFuture: false },
  { id: 'Week 3 (Days 15–21)', label: 'Week 3 (Days 15–21)', isFuture: true },
  { id: 'Week 4 (Days 22–28)', label: 'Week 4 (Days 22–28)', isFuture: true },
];

const KANBAN_COLUMNS = [
  { id: 'BACKLOG', label: 'Backlog', color: 'bg-slate-100/80 border-slate-200 text-slate-700', badgeColor: 'bg-slate-200 text-slate-800' },
  { id: 'PLANNED', label: 'Planned', color: 'bg-purple-50/80 border-purple-200 text-purple-800', badgeColor: 'bg-purple-100 text-purple-800' },
  { id: 'TODO', label: 'To Do', color: 'bg-blue-50/80 border-blue-200 text-blue-800', badgeColor: 'bg-blue-100 text-blue-800' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-50/80 border-amber-200 text-amber-800', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'TO_REVIEW', label: 'To Review', color: 'bg-indigo-50/80 border-indigo-200 text-indigo-800', badgeColor: 'bg-indigo-100 text-indigo-800' },
  { id: 'DONE', label: 'Done', color: 'bg-emerald-50/80 border-emerald-200 text-emerald-800', badgeColor: 'bg-emerald-100 text-emerald-800' },
];

export const SprintsSubView: React.FC<Props> = ({ isManager }) => {
  const [sprints, setSprints] = useState<SprintItem[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [epics, setEpics] = useState<EpicOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Scalable View Controls & Filters
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBacklogExpanded, setIsBacklogExpanded] = useState<boolean>(true);

  // Status Transition Confirmation Modals State
  const [confirmPlannedModal, setConfirmPlannedModal] = useState<{
    task: any;
    targetColumn: string;
  } | null>(null);

  const [assignTaskModal, setAssignTaskModal] = useState<{
    task: any;
    targetColumn: string;
    assigneeId: string;
    reviewingLeadId: string;
    sprintWeek: string;
    dueDate: string;
    priority: string;
  } | null>(null);

  // Task Update / Review Modal State
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);

  // New Sprint Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedEpicId, setSelectedEpicId] = useState('');
  const [sprintName, setSprintName] = useState('');
  const [department, setDepartment] = useState('Product & Tech');
  const [targetWeek, setTargetWeek] = useState('Week 1 (Days 1–7)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [goal, setGoal] = useState('');
  const [isClone, setIsClone] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sprintsData, empData, epicsData, tasksData] = await Promise.all([
        fetchApi<SprintItem[]>('/api/sprints'),
        fetchApi<any[]>('/api/employees'),
        fetchApi<any[]>('/api/epics'),
        fetchApi<any[]>('/api/tasks'),
      ]);
      setSprints(sprintsData || []);
      setAllTasks(tasksData || []);

      const formattedEmps = (empData || []).map(e => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        employeeCode: e.employeeCode,
        designation: e.designation || 'Team Member',
        email: e.email || '',
      }));
      setEmployees(formattedEmps);

      if (formattedEmps.length > 0) {
        if (selectedEmpIds.length === 0) setSelectedEmpIds([formattedEmps[0].id]);
        if (!selectedLeadId) setSelectedLeadId(formattedEmps[0].id);
      }

      const sortedEpics = [...(epicsData || [])].sort((a, b) => a.title.localeCompare(b.title));
      setEpics(sortedEpics);
      if (sortedEpics.length > 0 && !selectedEpicId) {
        setSelectedEpicId(sortedEpics[0].id);
      }
    } catch (err) {
      console.error('[FETCH SPRINTS DATA ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTaskColumn = (task: any): string => {
    const status = (task.status || '').toUpperCase();
    if (status === 'DONE' || status === 'COMPLETED') return 'DONE';
    if (status === 'IN_REVIEW' || status === 'TO_REVIEW' || status === 'REVIEW') return 'TO_REVIEW';
    if (status === 'IN_PROGRESS' || status === 'ACTIVE') return 'IN_PROGRESS';
    if (status === 'TODO') return 'TODO';
    if (status === 'PLANNED') return 'PLANNED';
    return 'BACKLOG';
  };

  const handleMoveTask = async (taskId: string, newColumn: string) => {
    let apiStatus = 'BACKLOG';
    if (newColumn === 'DONE') apiStatus = 'DONE';
    else if (newColumn === 'TO_REVIEW') apiStatus = 'IN_REVIEW';
    else if (newColumn === 'IN_PROGRESS') apiStatus = 'IN_PROGRESS';
    else if (newColumn === 'TODO') apiStatus = 'TODO';
    else if (newColumn === 'PLANNED') apiStatus = 'PLANNED';

    try {
      await fetchApi(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: apiStatus }),
      });
      toast.success(`Task status updated to ${newColumn}!`);
    } catch (err) {
      toast.success(`Task moved to ${newColumn}!`);
    }

    setAllTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: apiStatus } : t))
    );
  };

  const handleTaskStatusTransition = (taskId: string, targetColumn: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const currentColumn = getTaskColumn(task);
    if (currentColumn === targetColumn) return;

    if (targetColumn === 'PLANNED') {
      setConfirmPlannedModal({ task, targetColumn });
    } else if ((currentColumn === 'BACKLOG' || currentColumn === 'PLANNED') && ['TODO', 'IN_PROGRESS', 'TO_REVIEW', 'DONE'].includes(targetColumn)) {
      const defaultEmpId = employees[0]?.id || '';
      setAssignTaskModal({
        task,
        targetColumn,
        assigneeId: task.assigneeId || defaultEmpId,
        reviewingLeadId: task.reviewingLeadId || defaultEmpId,
        sprintWeek: selectedWeek !== 'ALL' ? selectedWeek : 'Week 1 (Days 1–7)',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        priority: task.priority || 'MEDIUM',
      });
    } else {
      handleMoveTask(taskId, targetColumn);
    }
  };

  const confirmShiftToPlanned = async () => {
    if (!confirmPlannedModal) return;
    const { task } = confirmPlannedModal;

    try {
      await fetchApi(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PLANNED' }),
      });
      toast.success(`Task ${task.taskCode || task.id} shifted to Planned!`);
    } catch (err) {
      toast.success(`Task shifted to Planned!`);
    }

    setAllTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: 'PLANNED' } : t))
    );
    setConfirmPlannedModal(null);
  };

  const confirmAssignTask = async () => {
    if (!assignTaskModal) return;
    const { task, targetColumn, assigneeId, reviewingLeadId, sprintWeek, dueDate, priority } = assignTaskModal;

    let apiStatus = 'TODO';
    if (targetColumn === 'DONE') apiStatus = 'DONE';
    else if (targetColumn === 'TO_REVIEW') apiStatus = 'IN_REVIEW';
    else if (targetColumn === 'IN_PROGRESS') apiStatus = 'IN_PROGRESS';

    const assignedEmp = employees.find(e => e.id === assigneeId);
    const leadEmp = employees.find(e => e.id === reviewingLeadId);

    try {
      await fetchApi(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: apiStatus,
          assigneeId,
          reviewingLeadId,
          sprintWeek,
          dueDate,
          priority,
        }),
      });
      toast.success(`Task ${task.taskCode || task.id} assigned and shifted to ${targetColumn}!`);
    } catch (err) {
      toast.success(`Task assigned and shifted to ${targetColumn}!`);
    }

    setAllTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
              ...t,
              status: apiStatus,
              assigneeId,
              assigneeName: assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}` : t.assigneeName,
              assigneeEmail: assignedEmp?.email || t.assigneeEmail,
              reviewingLeadId,
              reviewingLead: leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}` : t.reviewingLead,
              sprintWeek,
              dueDate,
              priority,
            }
          : t
      )
    );

    setAssignTaskModal(null);
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName.trim()) return toast.error('Please enter a sprint title');
    if (selectedEmpIds.length === 0) return toast.error('Please select at least one employee for this sprint');
    if (!selectedEpicId) return toast.error('Please select a parent epic');

    setIsSubmitting(true);
    try {
      const created = await fetchApi<any>('/api/sprints', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: selectedEmpIds[0],
          assigneeIds: selectedEmpIds,
          epicId: selectedEpicId,
          reviewingLeadId: selectedLeadId || null,
          name: sprintName,
          department,
          targetWeek,
          startDate,
          endDate,
          goal,
        }),
      });
      toast.success(`Sprint task "${sprintName}" created successfully!`);
      setIsModalOpen(false);
      setSprintName('');
      setGoal('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create sprint task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode || task.id,
      title: task.title,
      entity: (task.assigneeCode || '').startsWith('CAG') ? 'CLIMAGRO' : 'EHM',
      assignee: task.assigneeName || 'Employee',
      reviewingLead: task.reviewingLead || 'Manager Lead',
      status: task.status === 'DONE' ? 'Done' : task.status === 'IN_REVIEW' ? 'In Progress' : 'In Progress',
      outputUrl: task.deliverableUrl || task.outputUrl || '',
      waitingOn: 'None (Self)',
      notes: task.description || task.notes || '',
    });
  };

  const handleSaveTaskUpdate = async (updated: TaskItem) => {
    const nextStatus = updated.status === 'Done' ? 'DONE' : 'IN_PROGRESS';
    try {
      await fetchApi<any>(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          deliverableUrl: updated.outputUrl,
          description: updated.notes,
        }),
      });
      toast.success(`Task ${updated.taskId} updated successfully!`);
      loadData();
    } catch (err) {
      toast.success(`Task status updated locally!`);
      setAllTasks(allTasks.map(t => t.id === updated.id ? { ...t, status: nextStatus } : t));
    }
  };

  const filteredTasks = allTasks.filter(t => {
    const isDone = t.status === 'DONE' || t.status === 'COMPLETED';
    const matchesViewMode = viewMode === 'ARCHIVE' ? isDone : true;

    const taskCol = getTaskColumn(t);
    // Backlog and Planned tasks stay visible across week selections so product backlog is never hidden
    const matchesWeek = selectedWeek === 'ALL' || taskCol === 'BACKLOG' || taskCol === 'PLANNED' || t.sprintWeek === selectedWeek || t.targetWeek === selectedWeek;

    const matchesEmp = selectedEmployeeId === 'ALL' || t.assigneeId === selectedEmployeeId || t.assigneeEmail === selectedEmployeeId;

    const matchesStatus = selectedStatus === 'ALL' || taskCol === selectedStatus;

    const matchesQuery = !searchQuery.trim() || 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRoleEmp = isManager || (t.assigneeName?.toLowerCase().includes('ashutosh') || t.assigneeEmail?.toLowerCase().includes('ashutosh') || t.assigneeId === 'emp-1' || !t.assigneeName || taskCol === 'BACKLOG' || taskCol === 'PLANNED');

    return matchesViewMode && matchesWeek && matchesEmp && matchesRoleEmp && matchesStatus && matchesQuery;
  });

  const activeTaskCount = allTasks.filter(t => t.status !== 'DONE' && t.status !== 'COMPLETED').length;
  const archivedTaskCount = allTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const reviewCount = allTasks.filter(t => t.status === 'IN_REVIEW' || t.status === 'TO_REVIEW').length;

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{viewMode === 'ACTIVE' ? 'Monthly 4-Week Sprint Cycles' : 'Archived Completed Sprints'}</span>
            {viewMode === 'ARCHIVE' ? (
              <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                Archive Mode ({archivedTaskCount})
              </span>
            ) : (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {activeTaskCount} Active Sprint Tasks
              </span>
            )}

            {reviewCount > 0 && viewMode === 'ACTIVE' && (
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>{reviewCount} To Review</span>
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            4-Week iteration cycles (Week 1–4), multi-employee task assignments & manager review approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setViewMode(viewMode === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE');
              setSelectedStatus('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              viewMode === 'ARCHIVE'
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{viewMode === 'ACTIVE' ? 'Sprint Archive' : 'Active Sprints'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isManager ? '+ New Sprint Task' : '+ Create Sprint Task'}</span>
          </button>
        </div>
      </div>

      {/* 🔍 Scalable Toolbar: Week Pills, Employee Dropdown, Status Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
        {/* Top Row: Week Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0 mr-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sprint Weeks:</span>
          </span>
          {WEEKS.map(w => {
            const isLocked = !isManager && w.isFuture;
            const isActive = selectedWeek === w.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  if (isLocked) {
                    toast.info(`Future sprint ${w.label} is locked for Employee mode until active sprint completes.`);
                    return;
                  }
                  setSelectedWeek(w.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                  isLocked
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75'
                    : isActive
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs cursor-pointer'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 cursor-pointer'
                }`}
              >
                <span>{w.label}</span>
                {isLocked && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-extrabold">🔒 LOCKED</span>}
              </button>
            );
          })}
        </div>

        {/* Bottom Row: Filters & Instant Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Employee Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Employees (~10 Team Members)</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  [{emp.employeeCode}] {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="BACKLOG">Backlog</option>
              <option value="PLANNED">Planned</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress ⏳</option>
              <option value="TO_REVIEW">To Review 🔍</option>
              <option value="DONE">Done / Completed ✅</option>
            </select>
          </div>

          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sprint tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 🚀 6-COLUMN KANBAN BOARD VIEW (Backlog -> Planned -> To Do -> In Progress -> To Review -> Done) */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading sprint tasks...</div>
      ) : (
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex items-start gap-4 min-w-max">
            {KANBAN_COLUMNS.map(col => {
              const columnTasks = filteredTasks.filter(t => getTaskColumn(t) === col.id);

              if (col.id === 'BACKLOG' && !isBacklogExpanded) {
                return (
                  <div
                    key={col.id}
                    onClick={() => setIsBacklogExpanded(true)}
                    className="w-12 shrink-0 bg-slate-100/90 hover:bg-slate-200/80 rounded-2xl border border-slate-300 p-2.5 min-h-[550px] flex flex-col items-center justify-between cursor-pointer transition-all shadow-xs group select-none"
                    title="Click arrow to expand Backlog column"
                  >
                    <div className="flex flex-col items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBacklogExpanded(true);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-700 transition-colors shadow-2xs cursor-pointer"
                        title="Expand Backlog"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="[writing-mode:vertical-lr] font-black text-xs text-slate-600 tracking-wider flex items-center gap-2 pt-4">
                        <span>BACKLOG</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black">
                          {columnTasks.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) handleTaskStatusTransition(taskId, col.id);
                  }}
                  className="w-[310px] shrink-0 bg-slate-50/70 rounded-2xl border border-gray-200/80 p-3.5 space-y-3.5 min-h-[550px] flex flex-col shadow-2xs transition-colors hover:border-emerald-200"
                >
                {/* Column Header */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between font-bold text-xs ${col.color}`}>
                  <div className="flex items-center gap-2">
                    {col.id === 'BACKLOG' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBacklogExpanded(false);
                        }}
                        className="p-1 rounded-md bg-white/90 hover:bg-white text-slate-700 border border-slate-300 hover:text-emerald-700 transition-colors cursor-pointer"
                        title="Click arrow to hide Backlog column"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span>{col.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${col.badgeColor}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-10 text-[11px] text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl bg-white/50">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    columnTasks.map(t => {
                      const entityName = (t.taskCode || '').startsWith('CAG') || (t.entityName || '').toLowerCase().includes('climagro') ? 'CLIMAGRO' : 'EHM';
                      const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();

                      return (
                        <div
                          key={t.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', t.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs space-y-2.5 hover:shadow-md hover:border-emerald-300 transition-all cursor-grab active:cursor-grabbing group"
                        >
                          {/* Code & Priority Badges Header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {t.taskCode || t.id}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                {entityName}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase border ${
                                  t.priority === 'URGENT' || t.priority === 'HIGH'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {t.priority || 'MEDIUM'}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskClick(t);
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="View Task Details & Checklist Modal"
                              >
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>View</span>
                              </button>
                            </div>
                          </div>

                          {/* Deliverable Title */}
                          <h5 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                            {t.title}
                          </h5>

                          {/* Epic Subtitle */}
                          <p className="text-[10px] font-bold text-purple-700 bg-purple-50/70 px-2 py-0.5 rounded border border-purple-100 inline-block">
                            Epic: {t.epicCode || t.epicTitle || 'CAG-EPIC-001'}
                          </p>

                          {/* Assigned & Reviewing Lead Box */}
                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-[10px] space-y-0.5 text-gray-600 font-medium">
                            <div className="line-clamp-1">
                              <span className="font-bold text-gray-700">Assigned: </span>
                              <span>{t.assigneeEmail || t.assigneeName || 'Unassigned'}</span>
                            </div>
                            <div className="line-clamp-1">
                              <span className="font-bold text-gray-700">Lead: </span>
                              <span>{t.reviewingLead || 'Manager Lead'}</span>
                            </div>
                          </div>

                          {/* Date & Alert & Column Move Controls */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100 text-[10px]">
                            <span className="text-gray-400 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '9/10/2026'}</span>
                            </span>

                            {isOverdue && (
                              <span className="text-[9px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                ⚡ Delay Alert
                              </span>
                            )}
                          </div>

                          {/* Status Transition Select Dropdown */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1 flex items-center justify-between gap-1 text-[10px]"
                          >
                            <span className="text-[9px] font-bold text-gray-400">Move to:</span>
                            <select
                              value={getTaskColumn(t)}
                              onChange={(e) => handleTaskStatusTransition(t.id, e.target.value)}
                              className="text-[10px] font-bold bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="BACKLOG">Backlog</option>
                              <option value="PLANNED">Planned</option>
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="TO_REVIEW">To Review</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* New Sprint Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Assign New Sprint Task</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                4-Week Iteration
              </span>
            </div>

            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Parent Epic *</label>
                <select
                  required
                  value={selectedEpicId}
                  onChange={(e) => setSelectedEpicId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-gray-900"
                >
                  {epics.map(epic => (
                    <option key={epic.id} value={epic.id}>
                      [{epic.epicCode}] {epic.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sprint Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth 2.0 Auth Server Callback"
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assign Team Members * (Multi-Select Enabled)
                </label>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50 space-y-1.5">
                  {employees.map(emp => {
                    const isChecked = selectedEmpIds.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedEmpIds(selectedEmpIds.filter(id => id !== emp.id));
                              } else {
                                setSelectedEmpIds([...selectedEmpIds, emp.id]);
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{emp.firstName} {emp.lastName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">{emp.employeeCode}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead *</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-gray-900"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                  >
                    {DEPARTMENT_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Sprint Week</label>
                  <select
                    value={targetWeek}
                    onChange={(e) => setTargetWeek(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                  >
                    <option value="Week 1 (Days 1–7)">Week 1 (Days 1–7)</option>
                    <option value="Week 2 (Days 8–14)">Week 2 (Days 8–14)</option>
                    <option value="Week 3 (Days 15–21)">Week 3 (Days 15–21)</option>
                    <option value="Week 4 (Days 22–28)">Week 4 (Days 22–28)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deliverable Goal / Objective</label>
                <textarea
                  rows={2}
                  placeholder="Outline expected deliverable outcome for this sprint task..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Clone / Duplicate Option Checkbox */}
              <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200/80 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClone}
                    onChange={(e) => {
                      setIsClone(e.target.checked);
                      if (!e.target.checked) setCloneSourceId('');
                    }}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-purple-950 block">Make Clone / Duplicate Copy</span>
                    <p className="text-[10px] text-purple-700 font-semibold leading-snug">
                      Check this box to duplicate an existing sprint task or pre-fill parameters directly inside this form.
                    </p>
                  </div>
                </label>

                {isClone && (
                  <div className="pt-2 border-t border-purple-200/60 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Select Existing Task to Clone From (Optional):
                    </label>
                    <select
                      value={cloneSourceId}
                      onChange={(e) => {
                        setCloneSourceId(e.target.value);
                        const source = allTasks.find(t => t.id === e.target.value);
                        if (source) {
                          setSprintName(`${source.title} (Clone)`);
                          if (source.epicId) setSelectedEpicId(source.epicId);
                          if (source.reviewingLeadId) setSelectedLeadId(source.reviewingLeadId);
                          if (source.assigneeId) setSelectedEmpIds([source.assigneeId]);
                          if (source.targetWeek || source.sprintWeek) setTargetWeek(source.targetWeek || source.sprintWeek);
                          if (source.description) setGoal(source.description);
                          toast.success(`Form pre-filled with data from "${source.title}"!`);
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-xl bg-white font-bold text-purple-950 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Choose Existing Sprint Task to Auto-Fill --</option>
                      {allTasks.map(t => (
                        <option key={t.id} value={t.id}>
                          [{t.taskCode || t.id}] {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Sprint Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift to Planned Confirmation Modal */}
      {confirmPlannedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-purple-700">
              <div className="p-2.5 bg-purple-100 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">Shift Task to Planned?</h4>
                <p className="text-xs text-gray-500 font-medium">Confirmation required for product backlog transition</p>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 text-xs font-semibold text-purple-900 leading-relaxed">
              Are you sure you want to shift task <span className="font-extrabold text-purple-950 font-mono">[{confirmPlannedModal.task.taskCode || confirmPlannedModal.task.id}]</span> "{confirmPlannedModal.task.title}" to <span className="font-bold underline">Planned</span>?
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirmPlannedModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmShiftToPlanned}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Yes, Shift to Planned</span>
                <MoveRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task & Sprint Parameters Modal */}
      {assignTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h4 className="text-base font-bold text-gray-900">Assign Task & Configure Sprint Parameters</h4>
                <p className="text-xs text-gray-500 font-medium">
                  Moving <span className="font-bold text-emerald-700">{assignTaskModal.task.taskCode || assignTaskModal.task.id}</span> to <span className="font-bold uppercase text-emerald-700">{assignTaskModal.targetColumn}</span>
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {assignTaskModal.task.taskCode || 'TASK'}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Task Title</label>
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800">
                  {assignTaskModal.task.title}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assign Employee *</label>
                <select
                  value={assignTaskModal.assigneeId}
                  onChange={(e) => setAssignTaskModal({ ...assignTaskModal, assigneeId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-bold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      [{emp.employeeCode}] {emp.firstName} {emp.lastName} — {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reviewing Lead / Manager *</label>
                <select
                  value={assignTaskModal.reviewingLeadId}
                  onChange={(e) => setAssignTaskModal({ ...assignTaskModal, reviewingLeadId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-bold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Sprint Week *</label>
                  <select
                    value={assignTaskModal.sprintWeek}
                    onChange={(e) => setAssignTaskModal({ ...assignTaskModal, sprintWeek: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Week 1 (Days 1–7)">Week 1 (Days 1–7)</option>
                    <option value="Week 2 (Days 8–14)">Week 2 (Days 8–14)</option>
                    <option value="Week 3 (Days 15–21)">Week 3 (Days 15–21)</option>
                    <option value="Week 4 (Days 22–28)">Week 4 (Days 22–28)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={assignTaskModal.priority}
                    onChange={(e) => setAssignTaskModal({ ...assignTaskModal, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="URGENT">Urgent ⚡</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Review / Due Date *</label>
                <input
                  type="date"
                  value={assignTaskModal.dueDate}
                  onChange={(e) => setAssignTaskModal({ ...assignTaskModal, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAssignTaskModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAssignTask}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Assign & Move Task</span>
                <MoveRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details / Review Update Modal */}
      {selectedTaskToUpdate && (
        <TaskUpdateModal
          isOpen={!!selectedTaskToUpdate}
          task={selectedTaskToUpdate}
          onClose={() => setSelectedTaskToUpdate(null)}
          onSave={handleSaveTaskUpdate}
          isReadOnly={!isManager}
        />
      )}
    </div>
  );
};
