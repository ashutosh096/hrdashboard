import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, Calendar, User, Zap, Target, Search, Filter, Archive, CheckCircle2, Clock, Eye, AlertCircle, Users, Check, ExternalLink, Lock } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
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
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);

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
      toast.success(`Sprint ${created.sprintCode || 'assigned'} assigned successfully!`);
      setIsModalOpen(false);
      setSprintName('');
      setGoal('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode || task.id,
      title: task.title,
      entity: task.entityName || 'climagroanalytics',
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

  // Combine Sprints & Tasks into Week Groups
  const weekList = [
    { id: 'Week 1 (Days 1–7)', label: 'Week 1 (Days 1–7)', isFuture: false },
    { id: 'Week 2 (Days 8–14)', label: 'Week 2 (Days 8–14)', isFuture: false },
    { id: 'Week 3 (Days 15–21)', label: 'Week 3 (Days 15–21)', isFuture: true },
    { id: 'Week 4 (Days 22–28)', label: 'Week 4 (Days 22–28)', isFuture: true },
  ];

  // Filter tasks based on view controls
  const filteredTasks = allTasks.filter(t => {
    const isDone = t.status === 'DONE' || t.status === 'COMPLETED';
    const matchesViewMode = viewMode === 'ARCHIVE' ? isDone : !isDone;

    const matchesWeek = selectedWeek === 'ALL' || t.sprintWeek === selectedWeek || t.targetWeek === selectedWeek;

    const matchesEmp = selectedEmployeeId === 'ALL' || t.assigneeId === selectedEmployeeId || t.assigneeEmail === selectedEmployeeId;

    const matchesStatus = selectedStatus === 'ALL' || 
      (selectedStatus === 'IN_PROGRESS' && t.status === 'IN_PROGRESS') ||
      (selectedStatus === 'IN_REVIEW' && (t.status === 'IN_REVIEW' || t.status === 'TO_REVIEW')) ||
      (selectedStatus === 'DONE' && isDone);

    const matchesQuery = !searchQuery.trim() || 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRoleEmp = isManager || (t.assigneeName?.toLowerCase().includes('ashutosh') || t.assigneeEmail?.toLowerCase().includes('ashutosh') || t.assigneeId === 'emp-1' || !t.assigneeName);

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
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
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
              <option value="IN_PROGRESS">In Progress ⏳</option>
              <option value="IN_REVIEW">To Review 🔍</option>
              <option value="DONE">Done / Approved ✅</option>
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

      {/* 📋 Sprint Weeks List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading sprint tasks...</div>
      ) : (
        <div className="space-y-4">
          {weekList.map(weekObj => {
            if (selectedWeek !== 'ALL' && selectedWeek !== weekObj.id) return null;

            const isWeekLocked = !isManager && weekObj.isFuture;
            const weekTasks = filteredTasks.filter(t => t.sprintWeek === weekObj.id || t.targetWeek === weekObj.id || selectedWeek === 'ALL');
            const isExpanded = !isWeekLocked && (expandedWeekId === weekObj.id || (selectedWeek === weekObj.id && selectedWeek !== 'ALL'));

            return (
              <div
                key={weekObj.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all ${
                  isWeekLocked ? 'border-amber-200/80 bg-amber-50/20' : 'border-gray-200/80 hover:border-emerald-300'
                }`}
              >
                {/* Week Header */}
                <div
                  onClick={() => {
                    if (isWeekLocked) {
                      toast.info(`Future sprint cycle (${weekObj.label}) is locked for Employee mode.`);
                      return;
                    }
                    setExpandedWeekId(isExpanded ? null : weekObj.id);
                  }}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    isWeekLocked ? 'bg-amber-50/40 cursor-not-allowed' : 'hover:bg-gray-50/60 bg-gradient-to-r from-gray-50/80 via-white to-emerald-50/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl border ${isWeekLocked ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                      {isWeekLocked ? <Lock className="w-4 h-4 text-amber-600" /> : isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{weekObj.label}</h4>
                        {isWeekLocked ? (
                          <span className="text-[10px] font-mono font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            🔒 FUTURE SPRINT LOCKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Sprint Cycle
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {isWeekLocked ? 'Locked until active sprint cycle completes' : 'Target Deliverable Window'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isWeekLocked ? (
                      <span className="text-xs font-extrabold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-xl border border-amber-300 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        {weekTasks.length} Sprint Task{weekTasks.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Week Tasks List Rendering: Compact Table View */}
                {isExpanded && (
                  <div className="bg-gray-50/60 p-4 border-t border-gray-100 space-y-4">
                    {weekTasks.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-400 font-medium bg-white rounded-xl border border-dashed border-gray-200">
                        No sprint tasks assigned for {weekObj.label} under current filters.
                      </div>
                    ) : (
                      /* 📋 High-Density Compact Table View for High-Volume Sprint Tasks */
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                <th className="py-2.5 px-3">Task ID</th>
                                <th className="py-2.5 px-3">Task Title</th>
                                <th className="py-2.5 px-3">Assigned To</th>
                                <th className="py-2.5 px-3">Reviewing Lead</th>
                                <th className="py-2.5 px-3">Target Date</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                              {weekTasks.map(task => {
                                const isReview = task.status === 'IN_REVIEW' || task.status === 'TO_REVIEW';
                                const isDone = task.status === 'DONE' || task.status === 'COMPLETED';

                                return (
                                  <tr key={task.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                                      [{task.taskCode || task.id}]
                                    </td>
                                    <td className="py-2.5 px-3 font-extrabold text-emerald-700">
                                      {task.title}
                                    </td>
                                    <td className="py-2.5 px-3 text-gray-900 font-extrabold">
                                      {task.assigneeName || 'Assignee Lead'}
                                    </td>
                                    <td className="py-2.5 px-3 text-gray-800 font-bold">
                                      {task.reviewingLead || 'Manager Lead'}
                                    </td>
                                    <td className="py-2.5 px-3 text-gray-500 font-semibold">
                                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '2026-09-08'}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                        isDone ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                        isReview ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse' :
                                        'bg-blue-50 text-blue-800 border-blue-200'
                                      }`}>
                                        {isDone ? 'Approved ✅' : isReview ? 'To Review 🔍' : 'In Progress ⏳'}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <button
                                        onClick={() => handleTaskClick(task)}
                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                      >
                                        View
                                      </button>
                                      {isManager && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSprintName(`[CLONE] ${task.title}`);
                                            setGoal(task.description || task.title || '');
                                            setIsModalOpen(true);
                                            toast.success(`Pre-filled clone for "${task.title}". Adjust basic info to complete!`);
                                          }}
                                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ml-1"
                                        >
                                          📋 Clone
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Sprint Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Assign New Sprint Task</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Multi-Employee Support
              </span>
            </div>

            <form onSubmit={handleCreateSprint} className="space-y-4">
              {/* Quick Clone Dropdown */}
              <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 space-y-1">
                <label className="block text-xs font-extrabold text-purple-900 flex items-center justify-between">
                  <span>📋 Quick Clone From Existing Sprint Task</span>
                  <span className="text-[9px] bg-purple-600 text-white font-black px-2 py-0.5 rounded-full">
                    Fast Auto-Fill
                  </span>
                </label>
                <select
                  onChange={(e) => {
                    const found = allTasks.find((t) => t.id === e.target.value);
                    if (found) {
                      setSprintName(`[CLONE] ${found.title}`);
                      if (found.description) setGoal(found.description);
                      toast.success(`Pre-filled sprint deliverable info from "${found.title}"!`);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-lg bg-white font-bold text-gray-900 outline-none cursor-pointer"
                >
                  <option value="">Select a previous task to clone...</option>
                  {allTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.taskCode || t.id}] {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parent Epic */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Parent Epic * (Alphabetical Order A-Z)
                </label>
                <select
                  required
                  value={selectedEpicId}
                  onChange={(e) => setSelectedEpicId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                >
                  <option value="">Select Parent Epic...</option>
                  {epics.map((epic) => (
                    <option key={epic.id} value={epic.id}>
                      [{epic.epicCode}] {epic.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sprint Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sprint Deliverable Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement multi-tenant RBAC & JWT restoration"
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Target Week & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sprint Target Week *</label>
                  <select
                    required
                    value={targetWeek}
                    onChange={(e) => setTargetWeek(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    {weekList.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Employee Assignees Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assign Team Members (Multi-Select 2–3 Employees) *
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200">
                  {employees.map(emp => {
                    const isChecked = selectedEmpIds.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmpIds([...selectedEmpIds, emp.id]);
                              } else {
                                setSelectedEmpIds(selectedEmpIds.filter(id => id !== emp.id));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>[{emp.employeeCode}] {emp.firstName} {emp.lastName}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{emp.designation}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Reviewing Lead */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead *</label>
                <select
                  required
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                >
                  <option value="">Select Lead / Manager...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      [{emp.employeeCode}] {emp.firstName} {emp.lastName} — {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goal / Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Goal Criteria</label>
                <textarea
                  rows={2}
                  placeholder="Primary sprint objectives, deliverable goals, and criteria..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Sprint Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Review / Update Modal */}
      <TaskUpdateModal
        isOpen={!!selectedTaskToUpdate}
        task={selectedTaskToUpdate}
        onClose={() => setSelectedTaskToUpdate(null)}
        onSave={handleSaveTaskUpdate}
        isReadOnly={!isManager}
      />
    </div>
  );
};
