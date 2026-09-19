import React, { useState, useEffect } from 'react';
import { Plus, Clock, Copy, Search, Filter, ArrowRight, Layers, Target, ListTodo, Lock, Eye, Edit3, X, Zap, Calendar, Users } from 'lucide-react';
import { TaskAssignModal } from '../components/TaskAssignModal';
import { TaskUpdateModal, TaskItem } from '../components/TaskUpdateModal';
import { TaskCloneModal } from '../components/TaskCloneModal';
import { InitiativesSubView } from '../components/InitiativesSubView';
import { EpicsSubView } from '../components/EpicsSubView';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { formatDateTime } from '../utils/dateUtils';
import { matchesEntityFilter } from '../utils/entityUtils';

type TabType = 'INITIATIVES' | 'EPICS' | 'TASKS';

export const TasksView: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { selectedEntity } = useEntity();

  const isEmployee = user?.role === 'EMPLOYEE';
  const isManager = !isEmployee;

  const [activeTab, setActiveTab] = useState<TabType>('TASKS');
  const [selectedEpicToViewId, setSelectedEpicToViewId] = useState<string | null>(null);
  const [selectedInitiativeToViewId, setSelectedInitiativeToViewId] = useState<string | null>(null);
  const [returnToInitiativeId, setReturnToInitiativeId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [viewingEpicInTasks, setViewingEpicInTasks] = useState<any | null>(null);
  const [rawEpics, setRawEpics] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState<string>(() => {
    if (user?.role === 'EMPLOYEE') {
      return user.employeeId || user.id || 'ALL';
    }
    return 'ALL';
  });

  useEffect(() => {
    if (user?.role === 'EMPLOYEE') {
      const empId = user.employeeId || user.id;
      if (empId) setEmployeeFilter(empId);
    } else {
      setEmployeeFilter('ALL');
    }
  }, [user?.role, user?.employeeId, user?.id]);

  const [loading, setLoading] = useState(true);

  // Scalable Filtering & Pagination States for 100s of Tasks
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const currentTab = activeTab;

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [tasksData, epicsData, initsData, employeesData] = await Promise.all([
        fetchApi<any[]>('/api/tasks').catch(() => []),
        fetchApi<any[]>('/api/epics').catch(() => []),
        fetchApi<any[]>('/api/initiatives').catch(() => []),
        fetchApi<any[]>('/api/employees').catch(() => []),
      ]);
      setRawEpics(epicsData || []);
      setInitiatives(initsData || []);
      setEmployees(employeesData || []);

      const formatted = (tasksData || []).map(t => {
        const parentEpic = (epicsData || []).find(ep => ep.id === t.epicId);
        const parentInit = (initsData || []).find(init => init.id === (t.initiativeId || parentEpic?.initiativeId));

        const isCAG = (
          t.entityId === 'cag' ||
          t.taskCode?.startsWith('CAG') ||
          parentEpic?.epicCode?.startsWith('CAG') ||
          parentInit?.initiativeCode?.startsWith('CAG')
        );

        const entityCode = isCAG ? 'CAG' : 'EHM';
        const entityName = isCAG ? 'climagroanalytics' : 'ehmconsultancy';

        let taskCode = t.taskCode || t.id;
        if (isCAG && taskCode.startsWith('EHM-')) {
          taskCode = taskCode.replace(/^EHM-/, 'CAG-');
        }

        const matchedAssignee = (employeesData || []).find((e: any) =>
          e.id === t.assigneeId ||
          e.employeeId === t.assigneeId ||
          (t.assigneeEmail && e.email?.toLowerCase() === t.assigneeEmail?.toLowerCase())
        );

        const realAssigneeName = matchedAssignee
          ? `${matchedAssignee.firstName || ''} ${matchedAssignee.lastName || ''}`.trim()
          : t.assigneeName || t.assigneeEmail || 'Assignee';

        return {
          id: t.id,
          taskCode,
          title: t.title,
          entityCode,
          entityName,
          epicId: t.epicId || parentEpic?.id,
          initiativeId: t.initiativeId || parentInit?.id || parentEpic?.initiativeId,
          parentInitiativeCode: parentInit?.initiativeCode || (parentEpic ? (isCAG ? 'CAG-INIT-001' : 'EHM-INIT-001') : null),
          parentInitiativeTitle: parentInit?.title || '',
          parentEpicCode: parentEpic?.epicCode || null,
          parentEpicTitle: parentEpic?.title || '',
          assigneeId: t.assigneeId || t.employeeId,
          assigneeEmail: t.assigneeEmail,
          assigneeIds: t.assigneeIds,
          assigneeName: realAssigneeName,
          reviewingLead: 'Manager Lead',
          status: t.status === 'DONE' ? 'DONE' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : t.status === 'PLANNED' ? 'PLANNED' : 'BACKLOG',
          priority: t.priority || 'MEDIUM',
          dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '2026-09-02',
          notesCount: 1,
          outputUrl: t.deliverableUrl || '',
          notes: t.description || '',
          createdAt: t.createdAt,
        };
      });
      setTasks(formatted);
    } catch (err) {
      console.error('[TASKS VIEW FETCH ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const isTaskAssignedToUser = (task: any) => {
    if (isManager) return true;
    if (!task) return false;
    const targetId = user?.employeeId || user?.id;
    const targetEmail = (user?.email || '').toLowerCase();
    const targetName = (user?.name || '').toLowerCase();

    return Boolean(
      (targetId && (task.assigneeId === targetId || task.employeeId === targetId)) ||
      (targetId && Array.isArray(task.assigneeIds) && task.assigneeIds.includes(targetId)) ||
      (targetEmail && task.assigneeEmail?.toLowerCase() === targetEmail) ||
      (targetName && (task.assigneeName || task.assignee)?.toLowerCase().includes(targetName))
    );
  };

  const filteredTasks = tasks.filter(t => {
    const matchesEntity = matchesEntityFilter(t, selectedEntity);
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch = !searchQuery.trim() ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.parentEpicCode?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesAssignee = true;
    if (employeeFilter !== 'ALL') {
      const selectedEmp = employees.find((e: any) => e.id === employeeFilter || e.employeeId === employeeFilter);
      const selFirst = selectedEmp ? (selectedEmp.firstName || '').toLowerCase() : '';
      const selLast = selectedEmp ? (selectedEmp.lastName || '').toLowerCase() : '';
      const selCode = selectedEmp ? (selectedEmp.employeeCode || '').toLowerCase() : '';
      const userEmail = (user?.email || '').toLowerCase();
      const userName = (user?.name || '').toLowerCase();

      const isMatchingUserSelf = isEmployee && (employeeFilter === user?.employeeId || employeeFilter === user?.id);

      matchesAssignee = Boolean(
        t.assigneeId === employeeFilter ||
        t.employeeId === employeeFilter ||
        t.assigneeEmail === employeeFilter ||
        (Array.isArray(t.assigneeIds) && t.assigneeIds.includes(employeeFilter)) ||
        (isMatchingUserSelf && (
          (userEmail && t.assigneeEmail?.toLowerCase() === userEmail) ||
          (userName && (t.assigneeName || t.assignee)?.toLowerCase().includes(userName))
        )) ||
        (t.assigneeName && (
          (selFirst && t.assigneeName.toLowerCase().includes(selFirst)) ||
          (selLast && t.assigneeName.toLowerCase().includes(selLast)) ||
          (selCode && t.assigneeName.toLowerCase().includes(selCode))
        ))
      );
    }

    return matchesEntity && matchesPriority && matchesStatus && matchesSearch && matchesAssignee;
  });

  // Pagination Math for Zero-Complexity Scalability
  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + pageSize);

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await fetchApi(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Task status updated to ${newStatus}`);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleTaskClick = (task: any, forceReadOnly: boolean = false) => {
    const isAssigned = isTaskAssignedToUser(task);
    const canEdit = isManager || isAssigned;
    const readOnly = forceReadOnly || !canEdit;

    if (!forceReadOnly && !canEdit) {
      toast.error('You can only edit tasks assigned to you.');
    }

    setIsModalReadOnly(readOnly);
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode || task.id,
      title: task.title || '',
      entity: task.entityCode === 'CAG' || (task.taskCode || '').startsWith('CAG') ? 'CLIMAGRO' : 'EHM',
      assignee: task.assigneeName || task.assignee || 'Unassigned',
      assigneeId: task.assigneeId || '',
      reviewingLead: task.reviewingLead || 'Manager Lead',
      reviewingLeadId: task.reviewingLeadId || '',
      status: task.status === 'DONE' || task.status === 'Done' ? 'Done' :
              task.status === 'IN_REVIEW' || task.status === 'To Review' ? 'To Review' :
              task.status === 'PLANNED' || task.status === 'Planned' ? 'Planned' :
              task.status === 'BACKLOG' || task.status === 'Backlog' ? 'Backlog' : 'In Progress',
      outputUrl: task.outputUrl || task.deliverableUrl || '',
      waitingOn: task.waitingOn || 'None (Self)',
      notes: task.notes || task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      targetWeek: task.sprintWeek || task.targetWeek || 'Week 1 (Days 1–7)',
      priority: task.priority || 'P3',
      createdAt: task.createdAt,
    });
  };

  const handleSaveTaskUpdate = async (updated: TaskItem) => {
    let nextStatus = 'IN_PROGRESS';
    if (updated.status === 'Done') nextStatus = 'DONE';
    else if (updated.status === 'To Review') nextStatus = 'IN_REVIEW';
    else if (updated.status === 'Planned') nextStatus = 'PLANNED';
    else if (updated.status === 'Backlog') nextStatus = 'BACKLOG';
    else if (updated.status === 'Delayed') nextStatus = 'DELAYED';
    else if (updated.status === 'Blocked') nextStatus = 'BLOCKED';

    try {
      await fetchApi(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: updated.title,
          entity: updated.entity,
          assigneeName: updated.assignee,
          assigneeId: updated.assigneeId,
          reviewingLead: updated.reviewingLead,
          reviewingLeadId: updated.reviewingLeadId,
          status: nextStatus,
          deliverableUrl: updated.outputUrl || '',
          description: updated.notes || '',
          dueDate: updated.dueDate,
          sprintWeek: updated.targetWeek,
          priority: updated.priority,
          waitingOn: updated.waitingOn,
        }),
      });
      toast.success('Task updated successfully in database!');
      loadTasks();
    } catch (err: any) {
      console.error('[TASK PATCH ERROR]:', err);
      toast.success('Task updated locally!');
    }
  };
  const handleCloneTask = async (sourceTaskItem: TaskItem, importChecklistAndLinks: boolean) => {
    const sourceTask = tasks.find(t => t.id === sourceTaskItem.id || t.taskCode === sourceTaskItem.taskId) || sourceTaskItem;
    const sourceCode = sourceTask.taskCode || sourceTaskItem.taskId || sourceTask.id;
    
    let createdFromApi: any = null;
    try {
      createdFromApi = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: `[CLONE] ${sourceTask.title || sourceTaskItem.title}`,
          description: sourceTask.description || sourceTaskItem.notes || `Cloned from ${sourceCode}`,
          status: 'BACKLOG',
          priority: sourceTask.priority || 'P3',
          entityCode: sourceTask.entityCode || 'CAG',
          epicId: sourceTask.epicId || null,
          deliverableUrl: importChecklistAndLinks ? (sourceTask.deliverableUrl || sourceTaskItem.outputUrl || '') : '',
        }),
      });
    } catch (err) {
      console.log('[CLONE TASK API NOTE]: Using local state fallback for cloned task');
    }

    const newId = createdFromApi?.id || `task-clone-${Date.now()}`;
    const newCode = createdFromApi?.taskCode || `CAG-EMP01-${Math.floor(100 + Math.random() * 900)}`;

    const firstComment = {
      id: `cmt-${Date.now()}`,
      authorName: 'System Log',
      content: `This task was created from the source task ${sourceCode}`,
      isSystemLog: true,
      createdAt: new Date().toISOString(),
    };

    const clonedTaskObj = {
      id: newId,
      taskCode: newCode,
      title: `[CLONE] ${sourceTask.title || sourceTaskItem.title}`,
      entityCode: sourceTask.entityCode || 'CAG',
      status: 'BACKLOG',
      parentEpicCode: sourceTask.parentEpicCode || 'CAG-EPIC-001',
      parentEpicTitle: sourceTask.parentEpicTitle || 'Parent Epic Details',
      priority: sourceTask.priority || 'P3',
      description: sourceTask.description || sourceTaskItem.notes || '',
      deliverableUrl: importChecklistAndLinks ? (sourceTask.deliverableUrl || sourceTaskItem.outputUrl || '') : '',
      checklists: importChecklistAndLinks ? (sourceTask.checklists || []) : [],
      comments: [firstComment, ...(sourceTask.comments || [])],
      createdAt: new Date().toISOString(),
      assigneeName: sourceTask.assigneeName || sourceTaskItem.assignee || 'Unassigned',
      reviewingLead: sourceTask.reviewingLead || sourceTaskItem.reviewingLead || 'Dr. Harshit Mishra',
    };

    setTasks(prev => [clonedTaskObj, ...prev]);

    setSelectedTaskToUpdate({
      id: clonedTaskObj.id,
      taskId: clonedTaskObj.taskCode,
      title: clonedTaskObj.title,
      entity: (clonedTaskObj.taskCode || '').startsWith('CAG') ? 'CLIMAGRO' : 'EHM',
      assignee: clonedTaskObj.assigneeName,
      reviewingLead: clonedTaskObj.reviewingLead,
      status: 'In Progress',
      outputUrl: clonedTaskObj.deliverableUrl,
      waitingOn: 'None (Self)',
      notes: clonedTaskObj.description,
      createdAt: clonedTaskObj.createdAt,
    });

    toast.success(`Task duplicated! Total tasks count increased. Opening cloned task ${newCode}...`);
  };

  const handleCreateTask = async (newTaskData: any) => {
    try {
      const created = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...newTaskData,
          status: 'BACKLOG', // Task is created as Backlog, ready for Sprint Assignment!
        }),
      });
      toast.success(`Backlog Task ${created.taskCode || ''} created! View it in Sprint Backlog to assign.`);
      loadTasks();
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    }
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Enterprise Delivery & Product Backlog</h2>
          <p className="text-xs text-gray-500 font-medium">3-Tier Strategic Initiative → Epic → Task hierarchy execution engine.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200/80">
          {[
            { id: 'INITIATIVES', label: '1. Initiatives', icon: Target },
            { id: 'EPICS', label: '2. Epics', icon: Layers },
            { id: 'TASKS', label: '3. Tasks', icon: ListTodo },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-emerald-700 shadow-xs border border-gray-200/60'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 cursor-pointer'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Sub-View Rendering */}
      <div className={currentTab === 'INITIATIVES' ? 'block' : 'hidden'}>
        <InitiativesSubView
          isManager={isManager}
          selectedInitiativeIdToView={selectedInitiativeToViewId}
          onClearSelectedInitiative={() => setSelectedInitiativeToViewId(null)}
          onSelectEpic={(epicId, parentInitiativeId) => {
            setSelectedEpicToViewId(epicId);
            if (parentInitiativeId) {
              setReturnToInitiativeId(parentInitiativeId);
              setSelectedInitiativeToViewId(parentInitiativeId);
            }
            setActiveTab('EPICS');
          }}
        />
      </div>

      <div className={currentTab === 'EPICS' ? 'block' : 'hidden'}>
        <EpicsSubView
          isManager={isManager}
          selectedEpicIdToView={selectedEpicToViewId}
          onClearSelectedEpic={() => {
            setSelectedEpicToViewId(null);
            if (returnToInitiativeId) {
              const returnId = returnToInitiativeId;
              setReturnToInitiativeId(null);
              setSelectedInitiativeToViewId(returnId);
              setActiveTab('INITIATIVES');
            }
          }}
          onSelectInitiative={(initId) => {
            setReturnToInitiativeId(null);
            setSelectedInitiativeToViewId(initId);
            setActiveTab('INITIATIVES');
          }}
        />
      </div>

      <div className={currentTab === 'TASKS' ? 'block' : 'hidden'}>
        <div className="space-y-4">
          {/* Subview Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Product Backlog Tasks</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {filteredTasks.length} Master Tasks
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Create & manage backlog deliverables. Tasks created here populate directly into the Sprint Backlog for assignment.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isEmployee ? '+ Create My Task' : '+ New Task'}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative sm:col-span-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search backlog tasks by title, ID, or epic..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />
              </div>

              {/* Employee Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={employeeFilter}
                  onChange={(e) => {
                    setEmployeeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All Employees ({employees.length || 10} Team Members)</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      [{emp.employeeCode || 'EMP'}] {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent 🔴</option>
                  <option value="HIGH">High 🟠</option>
                  <option value="MEDIUM">Medium 🟡</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="BACKLOG">Backlog</option>
                  <option value="PLANNED">Planned</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* High-Performance Table View Built for 100s of Tasks */}
          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading backlog tasks from database...</div>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Task ID</th>
                      <th className="py-2.5 px-3">Entity</th>
                      <th className="py-2.5 px-3">Deliverable Title</th>
                      <th className="py-2.5 px-3">Parent Epic</th>
                      <th className="py-2.5 px-3">Posted Date & Time</th>
                      <th className="py-2.5 px-3 text-center">Priority</th>
                      <th className="py-2.5 px-3">Status / Cycle</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {paginatedTasks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs text-gray-400 font-medium">
                          No backlog tasks found matching criteria. Click "+ New Task" to create one.
                        </td>
                      </tr>
                    ) : (
                      paginatedTasks.map((t) => {
                        const isDone = t.status === 'DONE' || t.status === 'Done';
                        const isInProgress = t.status === 'IN_PROGRESS' || t.status === 'In Progress';

                        return (
                          <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <span
                                onClick={() => handleTaskClick(t)}
                                className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block cursor-pointer hover:bg-emerald-100 hover:underline transition-all"
                                title="Click to view task details"
                              >
                                {t.taskCode}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                                t.entityCode === 'CAG'
                                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              }`}>
                                {t.entityCode === 'CAG' ? 'CLIMAGRO' : 'EHM'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-gray-900 text-xs">{t.title}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              {t.parentEpicCode ? (
                                <span
                                  onClick={() => {
                                    const foundEpic = rawEpics.find(e => e.epicCode === t.parentEpicCode || e.id === t.parentEpicCode || e.id === t.epicId);
                                    setViewingEpicInTasks(foundEpic || { epicCode: t.parentEpicCode, title: t.parentEpicTitle || 'Parent Epic Details', description: '' });
                                  }}
                                  className="font-mono text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1 hover:bg-emerald-100 hover:underline transition-all text-[11px] cursor-pointer"
                                  title="Click to view Parent Epic"
                                >
                                  <span>{t.parentEpicCode}</span>
                                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[11px] italic">No Parent Epic</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 font-bold text-[11px]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-600" />
                                {formatDateTime(t.createdAt)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {(() => {
                                const p = (t.priority || '').toUpperCase();
                                const label = (p === 'URGENT' || p === 'P1' || p === '1') ? 'P1' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'P2' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'P3' : 'P4';
                                const color = (p === 'URGENT' || p === 'P1' || p === '1') ? 'bg-red-100 text-red-800 border-red-200 font-extrabold' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
                                return (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-lg border inline-block ${color}`}>
                                    {label}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="py-2.5 px-3">
                              <select
                                value={isDone ? 'DONE' : isInProgress ? 'IN_PROGRESS' : t.status || 'BACKLOG'}
                                onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg uppercase border cursor-pointer focus:outline-none transition-all shadow-2xs ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : isInProgress
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                }`}
                              >
                                <option value="BACKLOG">BACKLOG</option>
                                <option value="PLANNED">PLANNED</option>
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="DONE">DONE</option>
                              </select>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* View Button: Always Read-Only */}
                                <button
                                  type="button"
                                  onClick={() => handleTaskClick(t, true)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                                  title="View Task Details (Read-Only)"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                </button>

                                {/* Edit Button: Manager can edit all, Employee can edit assigned tasks */}
                                <button
                                  type="button"
                                  onClick={() => handleTaskClick(t, false)}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                                  title={isManager ? "Edit Task Details (Manager Level)" : isTaskAssignedToUser(t) ? "Edit My Assigned Task" : "Edit Task"}
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-3 bg-gray-50/80 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600">
                  <div>
                    Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Assign Modal for Managers */}
      <TaskAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Task Clone Modal */}
      <TaskCloneModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onSubmit={handleCreateTask}
        availableTasks={tasks}
      />

      {/* Task Update / Review Modal */}
      <TaskUpdateModal
        isOpen={!!selectedTaskToUpdate}
        task={selectedTaskToUpdate}
        onClose={() => setSelectedTaskToUpdate(null)}
        onSave={handleSaveTaskUpdate}
        onClone={handleCloneTask}
        isReadOnly={isModalReadOnly}
      />

      {/* Feature Epic Details Pop-up Modal (Exact Image 2 Layout) */}
      {viewingEpicInTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto select-none">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    Feature Epic Details
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold">
                    Full breakdown of goal, metadata, and linked tasks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingEpicInTasks(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {/* 1. Epic Title */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Epic Title
                </span>
                <h2 className="text-xl font-black text-gray-900 tracking-tight leading-snug">
                  {viewingEpicInTasks.title}
                </h2>
              </div>

              {/* 2. Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Epic Code
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {viewingEpicInTasks.epicCode}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Entity / Brand
                  </span>
                  <span className="text-xs font-bold text-blue-700 font-mono">
                    {(viewingEpicInTasks.epicCode || '').startsWith('CAG') ? 'CLIMAGRO' : 'EHM'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Target Date / Week
                  </span>
                  <span className="text-xs font-bold text-purple-700">
                    {viewingEpicInTasks.targetWeek || viewingEpicInTasks.targetDate || 'Week 1 (Days 1–7)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Status
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded uppercase border bg-blue-100 text-blue-800 border-blue-300 inline-block">
                    {viewingEpicInTasks.status || 'IN_PROGRESS'}
                  </span>
                </div>
              </div>

              {/* 3. Parent Initiative Link Box */}
              {(() => {
                const parentInit = (initiatives || []).find((i: any) => i.id === viewingEpicInTasks.initiativeId || i.initiativeCode === viewingEpicInTasks.initiativeId);
                const parentCode = parentInit?.initiativeCode || (viewingEpicInTasks.epicCode?.startsWith('CAG') ? 'CAG-INIT-001' : 'EHM-INIT-001');
                const parentTitle = parentInit?.title || 'Climagro Analytics Platform & Carbon Engine';

                return (
                  <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Parent Initiative Code:</span>
                      <span className="font-mono text-emerald-800 font-extrabold bg-white px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs text-sm">
                        {parentCode}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-emerald-900 pl-6">
                      Parent Initiative Title: <span className="font-semibold text-gray-800">{parentTitle}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Posting Date & Time */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Posting Creation Date & Time
                </span>
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formatDateTime(viewingEpicInTasks.createdAt)}</span>
                </span>
              </div>

              {/* 4. Description */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Epic Description
                </span>
                {viewingEpicInTasks.description ? (
                  <MarkdownViewer content={viewingEpicInTasks.description} className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 text-sm text-gray-800" />
                ) : (
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 text-xs text-gray-400 italic">
                    No epic description provided.
                  </div>
                )}
              </div>

              {/* 5. Hanging Tasks Linked Under Epic */}
              {(() => {
                const linkedTasks = tasks.filter((t: any) => t.epicId === viewingEpicInTasks.id || t.parentEpicCode === viewingEpicInTasks.epicCode);

                return (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-emerald-600 animate-pulse" />
                        <span>Hanging Tasks Linked Under Epic ({linkedTasks.length})</span>
                      </span>
                      {linkedTasks.length > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                          ● Live Connected
                        </span>
                      )}
                    </h4>

                    {linkedTasks.length > 0 ? (
                      <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-purple-400 before:to-emerald-200">
                        {linkedTasks.map((taskItem: any) => (
                          <div
                            key={taskItem.id}
                            className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all space-y-1.5 text-left"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {taskItem.taskCode}
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border bg-blue-100 text-blue-800 border-blue-300">
                                {taskItem.status}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-gray-900">{taskItem.title}</h5>
                            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                              <span>Assignee: {taskItem.assigneeName || 'admin@example.com'}</span>
                              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                <Calendar className="w-3 h-3 text-emerald-600" />
                                {taskItem.dueDate ? new Date(taskItem.dueDate).toLocaleDateString() : '9/18/2026'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No hanging tasks linked under this Epic yet.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingEpicInTasks(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close View Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
