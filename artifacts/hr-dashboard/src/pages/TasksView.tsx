import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Clock, Copy, Search, Filter, ArrowRight, Layers, Target, ListTodo, Lock, Eye, Edit3, X, Zap, Calendar, Users, Trash2, ChevronRight, ChevronLeft, ChevronDown, History, UserCheck } from 'lucide-react';
import { TaskAssignModal } from '../components/TaskAssignModal';
import { TaskUpdateModal, TaskItem } from '../components/TaskUpdateModal';
import { TaskCloneModal } from '../components/TaskCloneModal';
import { InitiativesSubView } from '../components/InitiativesSubView';
import { EpicsSubView } from '../components/EpicsSubView';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { RecordHistoryPanel } from '../components/RecordHistoryPanel';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi, getCachedApi } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { formatDateTime } from '../utils/dateUtils';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';

type TabType = 'INITIATIVES' | 'EPICS' | 'TASKS';

export const TasksView: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { selectedEntity } = useEntity();

  const isEmployee = user?.role === 'EMPLOYEE';
  const isManager = !isEmployee;

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (user?.role === 'EMPLOYEE') {
      return 'TASKS';
    }
    return 'INITIATIVES';
  });

  useEffect(() => {
    if (user?.role === 'EMPLOYEE') {
      setActiveTab('TASKS');
    } else if (user?.role === 'MANAGER' || user?.role === 'ADMIN') {
      setActiveTab('INITIATIVES');
    }
  }, [user?.role]);
  const [selectedEpicToViewId, setSelectedEpicToViewId] = useState<string | null>(null);
  const [selectedInitiativeToViewId, setSelectedInitiativeToViewId] = useState<string | null>(null);
  const [returnToInitiativeId, setReturnToInitiativeId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ recordId: string; title: string; code: string } | null>(null);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [viewingEpicInTasks, setViewingEpicInTasks] = useState<any | null>(null);
  const [showDeleteEpicConfirm, setShowDeleteEpicConfirm] = useState(false);
  const [isDeletingEpic, setIsDeletingEpic] = useState(false);
  const [rawEpics, setRawEpics] = useState<any[]>(() => (getCachedApi<any[]>('/api/epics') || []));
  const [initiatives, setInitiatives] = useState<any[]>(() => (getCachedApi<any[]>('/api/initiatives') || []));
  const [tasks, setTasks] = useState<any[]>(() => (getCachedApi<any[]>('/api/tasks') || []));
  const [employees, setEmployees] = useState<any[]>(() => (getCachedApi<any[]>('/api/employees') || []));
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');

  const [loading, setLoading] = useState(() => !(getCachedApi('/api/tasks') && getCachedApi('/api/epics')));

  // Scalable Server-Side Filtering & Pagination States for 1,000+ Tasks
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [groupByEpic, setGroupByEpic] = useState(false);
  const [collapsedEpics, setCollapsedEpics] = useState<Record<string, boolean>>({});
  const pageSize = 25;

  // Debounce search by ~300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const currentTab = activeTab;

  const loadTasks = async () => {
    if (!getCachedApi('/api/tasks')) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
        employeeId: employeeFilter,
        priority: priorityFilter,
        status: statusFilter,
        search: debouncedSearch,
        paginate: 'true',
      });

      const [tasksRes, epicsData, initsData, employeesData] = await Promise.all([
        fetchApi<any>(`/api/tasks?${queryParams.toString()}`).catch((err) => {
          console.error('[TASKS FETCH ERROR]:', err);
          return { tasks: [], totalCount: 0 };
        }),
        isManager ? fetchApi<any[]>('/api/epics').catch((err) => {
          console.error('[EPICS FETCH ERROR]:', err);
          return [];
        }) : Promise.resolve([]),
        isManager ? fetchApi<any[]>('/api/initiatives').catch((err) => {
          console.error('[INITIATIVES FETCH ERROR]:', err);
          return [];
        }) : Promise.resolve([]),
        fetchApi<any[]>('/api/employees').catch((err) => {
          console.error('[EMPLOYEES FETCH ERROR]:', err);
          return [];
        }),
      ]);

      const sortedEpics = [...(epicsData || [])].sort((a, b) =>
        (a.title || a.epicCode || '').localeCompare(b.title || b.epicCode || '', undefined, { sensitivity: 'base' })
      );
      setRawEpics(sortedEpics);

      const sortedInits = [...(initsData || [])].sort((a, b) =>
        (a.title || a.initiativeCode || '').localeCompare(b.title || b.initiativeCode || '', undefined, { sensitivity: 'base' })
      );
      setInitiatives(sortedInits);

      const sortedEmps = [...(employeesData || [])].sort((a, b) =>
        `${a.firstName || ''} ${a.lastName || ''}`.trim().localeCompare(
          `${b.firstName || ''} ${b.lastName || ''}`.trim(),
          undefined,
          { sensitivity: 'base' }
        )
      );
      setEmployees(sortedEmps);

      const rawTasksList = Array.isArray(tasksRes) ? tasksRes : (tasksRes?.tasks || []);
      const serverTotal = Array.isArray(tasksRes) ? tasksRes.length : (tasksRes?.totalCount ?? rawTasksList.length);
      const serverTotalPages = Array.isArray(tasksRes) ? Math.ceil(serverTotal / pageSize) : (tasksRes?.totalPages ?? Math.max(1, Math.ceil(serverTotal / pageSize)));

      setTotalTasksCount(serverTotal);
      setTotalPages(serverTotalPages);

      const formatted = rawTasksList.map((t: any) => {
        const parentEpic = (epicsData || []).find((ep: any) => ep.id === t.epicId);
        const parentInit = (initsData || []).find((init: any) => init.id === (t.initiativeId || parentEpic?.initiativeId));

        const badge = getEntityBadge(t);
        const resolvedEntityCode = badge.isCommon ? 'COMMON' : badge.isCAG ? 'CAG' : 'EHM';
        const resolvedEntityLabel = badge.isCommon ? 'COMMON' : badge.isCAG ? 'CLIMAGRO' : 'EHM';

        const taskCode = t.taskCode || t.id;

        const matchedAssignee = (employeesData || []).find((e: any) =>
          e.id === t.assigneeId ||
          e.employeeId === t.assigneeId ||
          (t.assigneeEmail && e.email?.toLowerCase() === t.assigneeEmail?.toLowerCase())
        );

        const realAssigneeName = matchedAssignee
          ? `${matchedAssignee.firstName || ''} ${matchedAssignee.lastName || ''}`.trim()
          : t.assigneeName || t.assigneeEmail || 'Assignee';

        const matchedLead = (employeesData || []).find((e: any) =>
          e.id === t.reviewingLeadId ||
          e.employeeId === t.reviewingLeadId
        );
        const realLeadName = matchedLead
          ? `${matchedLead.firstName || ''} ${matchedLead.lastName || ''}`.trim()
          : ((t.reviewingLead && t.reviewingLead.toLowerCase() !== 'manager lead') ? t.reviewingLead : 'Unassigned');

        const pRaw = (t.priority || '').toUpperCase();
        const pNormalized = (pRaw === 'URGENT' || pRaw === 'CRITICAL' || pRaw === 'P1' || pRaw === '1') ? 'P1'
          : (pRaw === 'HIGH' || pRaw === 'P2' || pRaw === '2') ? 'P2'
            : (pRaw === 'LOW' || pRaw === 'P4' || pRaw === '4') ? 'P4' : 'P3';

        return {
          id: t.id,
          taskCode,
          title: t.title,
          entity: resolvedEntityLabel,
          entityCode: resolvedEntityCode,
          entityId: t.entityId,
          entityName: t.entityName,
          epicId: t.epicId || parentEpic?.id,
          parentInitiativeCode: parentInit?.initiativeCode || null,
          parentInitiativeTitle: parentInit?.title || '',
          parentEpicCode: parentEpic?.epicCode || null,
          parentEpicTitle: parentEpic?.title || '',
          assigneeId: t.assigneeId || t.employeeId,
          assigneeEmail: t.assigneeEmail,
          assigneeIds: t.assigneeIds,
          assigneeName: realAssigneeName,
          reviewingLead: realLeadName,
          reviewingLeadId: t.reviewingLeadId || matchedLead?.id || '',
          status: t.status === 'DONE' ? 'DONE' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : t.status === 'PLANNED' ? 'PLANNED' : 'BACKLOG',
          priority: pNormalized,
          dueDate: t.dueDate ? String(t.dueDate).split('T')[0] : '',
          notesCount: 1,
          outputUrl: t.deliverableUrl || '',
          notes: t.description || '',
          waitingOn: t.waitingOn || 'None (Self)',
          createdAt: t.createdAt,
        };
      });
      const entityFiltered = formatted.filter((t: any) => matchesEntityFilter(t, selectedEntity));
      setTasks(entityFiltered);
    } catch (err) {
      console.error('[TASKS VIEW FETCH ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [currentPage, employeeFilter, priorityFilter, statusFilter, debouncedSearch, selectedEntity, user]);

  useEffect(() => {
    const handleUpdate = () => {
      loadTasks();
    };
    window.addEventListener('tasks-updated', handleUpdate);
    return () => window.removeEventListener('tasks-updated', handleUpdate);
  }, []);

  const isTaskAssignedToUser = (task: any) => {
    if (isManager) return true;
    if (!task) return false;
    const targetId = user?.employeeId || user?.id;
    const targetEmail = (user?.email || '').toLowerCase();
    const targetName = (user?.name || '').toLowerCase().trim();

    return Boolean(
      (targetId && (task.assigneeId === targetId || task.employeeId === targetId)) ||
      (targetId && Array.isArray(task.assigneeIds) && task.assigneeIds.includes(targetId)) ||
      (targetEmail && task.assigneeEmail?.toLowerCase() === targetEmail) ||
      (targetName && (
        (task.assigneeName && (
          task.assigneeName.toLowerCase().trim() === targetName ||
          task.assigneeName.split(',').map((n: string) => n.trim().toLowerCase()).includes(targetName)
        )) ||
        (task.assignee && task.assignee.toLowerCase().trim() === targetName)
      ))
    );
  };

  // Grouping by Parent Epic
  const groupedTasks = useMemo(() => {
    if (!groupByEpic) return null;
    const groups: Record<string, { epicCode: string; epicTitle: string; items: any[] }> = {};

    tasks.forEach((t) => {
      const key = t.parentEpicCode || 'NO_EPIC';
      if (!groups[key]) {
        groups[key] = {
          epicCode: t.parentEpicCode || 'No parent epic',
          epicTitle: t.parentEpicTitle || (t.parentEpicCode ? 'Epic Group' : 'Backlog items not tied to an epic'),
          items: [],
        };
      }
      groups[key].items.push(t);
    });

    return groups;
  }, [groupByEpic, tasks]);

  const toggleEpicCollapse = (key: string) => {
    setCollapsedEpics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!isManager && !isTaskAssignedToUser(task)) {
      toast.error('You can only update tasks assigned to you.');
      return;
    }
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

    const pCode = (task.priority === 'URGENT' || task.priority === 'CRITICAL' || task.priority === 'P1' || task.priority === '1') ? 'P1'
      : (task.priority === 'HIGH' || task.priority === 'P2' || task.priority === '2') ? 'P2'
        : (task.priority === 'LOW' || task.priority === 'P4' || task.priority === '4') ? 'P4' : 'P3';

    const taskBadge = getEntityBadge(task);
    const resolvedEntity = taskBadge.isCommon ? 'COMMON' : taskBadge.isCAG ? 'CLIMAGRO' : 'EHM';

    setIsModalReadOnly(readOnly);
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode || task.id,
      taskCode: task.taskCode || task.id,
      title: task.title || '',
      entity: resolvedEntity,
      entityCode: task.entityCode || (resolvedEntity === 'CLIMAGRO' ? 'CAG' : resolvedEntity === 'COMMON' ? 'COMMON' : 'EHM'),
      epicId: task.epicId || (task.parentEpicCode ? (rawEpics.find((e: any) => e.epicCode === task.parentEpicCode)?.id || null) : null),
      parentEpicCode: task.parentEpicCode || null,
      parentEpicTitle: task.parentEpicTitle || null,
      assignee: task.assigneeName || task.assignee || 'Unassigned',
      assigneeId: task.assigneeId || '',
      reviewingLead: ((task.reviewingLead && task.reviewingLead.toLowerCase() !== 'manager lead') ? task.reviewingLead : 'Unassigned'),
      reviewingLeadId: task.reviewingLeadId || '',
      status: task.status === 'DONE' || task.status === 'Done' ? 'Done' :
        task.status === 'IN_REVIEW' || task.status === 'To Review' ? 'To Review' :
          task.status === 'PLANNED' || task.status === 'Planned' ? 'Planned' :
            task.status === 'BACKLOG' || task.status === 'Backlog' ? 'Backlog' : 'In Progress',
      outputUrl: task.outputUrl || task.deliverableUrl || '',
      waitingOn: task.waitingOn || 'None (Self)',
      notes: task.notes || task.description || '',
      dueDate: task.dueDate ? (String(task.dueDate).includes('T') ? String(task.dueDate).split('T')[0] : String(task.dueDate)) : '',
      targetWeek: task.sprintWeek || task.targetWeek || 'Week 1 (Days 1–7)',
      priority: pCode,
      createdAt: task.createdAt,
    });
  };

  const handleSaveTaskUpdate = async (updated: TaskItem) => {
    try {
      await fetchApi(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: updated.title,
          entity: updated.entity,
          entityCode: updated.entityCode || (updated.entity === 'CLIMAGRO' ? 'CAG' : updated.entity === 'COMMON' ? 'COMMON' : 'EHM'),
          epicId: updated.epicId !== undefined ? updated.epicId : null,
          assigneeName: updated.assignee === 'Unassigned' ? '' : updated.assignee,
          assigneeId: updated.assigneeId || null,
          reviewingLead: updated.reviewingLead === 'Unassigned' ? '' : updated.reviewingLead,
          reviewingLeadId: updated.reviewingLeadId || null,
          status: updated.status,
          deliverableUrl: updated.outputUrl || '',
          description: updated.notes || '',
          dueDate: updated.dueDate,
          sprintWeek: updated.targetWeek,
          priority: updated.priority,
          waitingOn: updated.waitingOn,
          checklists: (updated as any).checklists,
          comments: (updated as any).comments,
        }),
      });
      toast.success(`Task ${updated.taskId} updated & saved to live database!`);
      await loadTasks();
      window.dispatchEvent(new CustomEvent('tasks-updated'));
    } catch (err: any) {
      console.error('[TASK PATCH ERROR]:', err);
      toast.error(err?.message || 'Failed to update task in database');
      throw err;
    }
  };
  const handleCloneTask = async (sourceTaskItem: TaskItem, importChecklistAndLinks: boolean) => {
    const sourceTask = tasks.find(t => t.id === sourceTaskItem.id || t.taskCode === sourceTaskItem.taskId) || sourceTaskItem;
    const sourceCode = sourceTask.taskCode || sourceTaskItem.taskId || sourceTask.id;

    const sourceBadge = getEntityBadge(sourceTask);
    const resolvedEntityCode = sourceBadge.isCommon ? 'COMMON' : sourceBadge.isCAG ? 'CAG' : 'EHM';
    const resolvedEntityLabel = sourceBadge.isCommon ? 'COMMON' : sourceBadge.isCAG ? 'CLIMAGRO' : 'EHM';

    let createdFromApi: any = null;
    try {
      createdFromApi = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: `[CLONE] ${sourceTask.title || sourceTaskItem.title}`,
          description: sourceTask.description || sourceTaskItem.notes || `Cloned from ${sourceCode}`,
          status: 'BACKLOG',
          priority: sourceTask.priority || 'P3',
          entityCode: resolvedEntityCode,
          epicId: sourceTask.epicId || null,
          deliverableUrl: importChecklistAndLinks ? (sourceTask.deliverableUrl || sourceTaskItem.outputUrl || '') : '',
        }),
      });
    } catch (err) {
      console.log('[CLONE TASK API NOTE]: Using local state fallback for cloned task');
    }

    const newId = createdFromApi?.id || `task-clone-${Date.now()}`;
    const newCode = createdFromApi?.taskCode || '-';

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
      entity: resolvedEntityLabel,
      entityCode: resolvedEntityCode,
      entityId: sourceTask.entityId,
      status: 'BACKLOG',
      parentEpicCode: sourceTask.parentEpicCode || '',
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
      taskCode: clonedTaskObj.taskCode,
      title: clonedTaskObj.title,
      entity: resolvedEntityLabel,
      entityCode: resolvedEntityCode,
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

  const renderTaskRow = (t: any) => {
    const isCAG = t.entityCode === 'CAG';
    const entityLabel = t.entityCode === 'COMMON' ? 'EHM & CLIMAGRO' : isCAG ? 'CLIMAGRO' : 'EHM';
    const postedDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Unknown';

    const p = (t.priority || '').toUpperCase();
    const priorityCode = (p === 'URGENT' || p === 'CRITICAL' || p === 'P1' || p === '1') ? 'P1'
      : (p === 'HIGH' || p === 'P2' || p === '2') ? 'P2'
        : (p === 'LOW' || p === 'P4' || p === '4') ? 'P4' : 'P3';

    const statusVal = t.status === 'DONE' ? 'DONE' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'BACKLOG';

    return (
      <tr
        key={t.id}
        className="hover:bg-gray-50/80 transition-colors border-b border-gray-100/80 group"
      >
        {/* Deliverable Column: Task ID stacked above Title */}
        <td className="py-3 px-4 max-w-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] font-semibold text-gray-400 tracking-wider">
                {t.taskCode || t.id}
              </span>
              {(t.createdByName || t.creatorName) && (
                <span className="text-[10px] text-gray-500 font-medium">
                  • By <strong className="text-gray-700 font-semibold">{t.createdByName || t.creatorName}</strong>
                </span>
              )}
            </div>
            <span
              onClick={() => handleTaskClick(t, false)}
              className="font-bold text-xs text-gray-900 hover:text-emerald-700 cursor-pointer transition-colors block truncate"
              title={t.title}
            >
              {t.title}
            </span>
          </div>
        </td>

        {/* Entity Tag */}
        <td className="py-3 px-3 whitespace-nowrap">
          {(() => {
            const badge = getEntityBadge(t);
            return (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wide shrink-0 ${badge.className}`}>
                {badge.label}
              </span>
            );
          })()}
        </td>

        {/* Parent Epic Column */}
        <td className="py-3 px-3 whitespace-nowrap">
          {t.parentEpicCode ? (
            <span
              onClick={() => {
                const epic = rawEpics.find((e: any) => e.epicCode === t.parentEpicCode || e.id === t.epicId);
                if (epic) {
                  setViewingEpicInTasks(epic);
                } else {
                  setActiveTab('EPICS');
                }
              }}
              className="font-mono text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:underline cursor-pointer transition-colors"
            >
              {t.parentEpicCode}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-medium">
              No parent epic
            </span>
          )}
        </td>

        {/* Posted Date */}
        <td className="py-3 px-3 whitespace-nowrap text-xs text-gray-600 font-medium">
          {postedDate}
        </td>

        {/* Priority Badge */}
        <td className="py-3 px-3 text-center whitespace-nowrap">
          <span
            className={`inline-flex items-center justify-center font-extrabold text-[11px] px-2 py-0.5 rounded ${priorityCode === 'P1'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : priorityCode === 'P2'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : priorityCode === 'P3'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
          >
            {priorityCode}
          </span>
        </td>

        {/* Status Dropdown / Badge */}
        <td className="py-3 px-3 whitespace-nowrap">
          <select
            value={statusVal}
            onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
            className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition-all ${statusVal === 'DONE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : statusVal === 'IN_PROGRESS'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
          >
            <option value="BACKLOG">Backlog</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </td>

        {/* Action Icons: Eye (View) & Edit3 (Edit) */}
        <td className="py-3 px-4 text-right whitespace-nowrap">
          <div className="inline-flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => handleTaskClick(t, true)}
              className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="View Task Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleTaskClick(t, false)}
              className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setHistoryTarget({
                recordId: t.id,
                title: t.title,
                code: t.taskCode || t.taskId,
              })}
              className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="View Task Audit History"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
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
            { id: 'INITIATIVES', label: '1. Initiatives', icon: isEmployee ? Lock : Target, isLocked: isEmployee },
            { id: 'EPICS', label: '2. Epics', icon: isEmployee ? Lock : Layers, isLocked: isEmployee },
            { id: 'TASKS', label: '3. Tasks', icon: ListTodo, isLocked: false },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const isLocked = tab.isLocked;

            return (
              <button
                key={tab.id}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) {
                    setActiveTab(tab.id as TabType);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${isLocked
                    ? 'text-gray-400 opacity-60 cursor-not-allowed border border-transparent select-none'
                    : isActive
                      ? 'bg-white text-emerald-700 shadow-xs border border-gray-200/60 cursor-pointer'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 cursor-pointer'
                  }`}
                title={isLocked ? "Manager & Admin access only" : undefined}
              >
                <Icon className={`w-3.5 h-3.5 ${isLocked
                    ? 'text-gray-400'
                    : isActive
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`} />
                <span>{tab.label}</span>
                {isLocked && (
                  <span className="text-[10px] bg-gray-200 text-gray-500 font-extrabold px-1.5 py-0.2 rounded">
                    Locked
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Sub-View Rendering */}
      {isManager && (
        <>
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
        </>
      )}

      <div className={currentTab === 'TASKS' ? 'block' : 'hidden'}>
        <div className="space-y-4">
          {/* Subview Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Product backlog tasks</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {totalTasksCount.toLocaleString()} tasks
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Create & manage backlog deliverables with high-performance server pagination.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Group by parent epic toggle */}
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs hover:bg-gray-50 transition-all select-none">
                <input
                  type="checkbox"
                  checked={groupByEpic}
                  onChange={(e) => setGroupByEpic(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Group by epic</span>
              </label>

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isEmployee ? '+ Create My Task' : '+ New task'}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Debounced Search */}
              <div className="relative sm:col-span-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, ID, or epic..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />
              </div>

              {/* Employee Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={employeeFilter}
                  onChange={(e) => {
                    setEmployeeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All team members</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All priorities</option>
                  <option value="P1">P1 - Critical / Urgent 🔥</option>
                  <option value="P2">P2 - High Priority ⚡</option>
                  <option value="P3">P3 - Medium Priority 📌</option>
                  <option value="P4">P4 - Low Priority 📝</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All statuses</option>
                  <option value="BACKLOG">Backlog</option>
                  <option value="PLANNED">Planned</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* High-Performance Paginated Table View */}
          {loading ? (
            <div className="py-16 text-center text-xs font-semibold text-gray-400 bg-white rounded-2xl border border-gray-200/80">
              Loading tasks page {currentPage} from live database...
            </div>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Deliverable</th>
                      <th className="py-3 px-3">Entity</th>
                      <th className="py-3 px-3">Parent epic</th>
                      <th className="py-3 px-3">Posted</th>
                      <th className="py-3 px-3 text-center">Priority</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs text-gray-400 font-medium">
                          No backlog tasks found matching criteria. Click "+ New task" to create one.
                        </td>
                      </tr>
                    ) : groupByEpic && groupedTasks ? (
                      /* Grouped by Parent Epic Rows */
                      Object.entries(groupedTasks).map(([groupKey, group]) => {
                        const isCollapsed = collapsedEpics[groupKey];
                        return (
                          <React.Fragment key={groupKey}>
                            {/* Epic Section Header */}
                            <tr
                              onClick={() => toggleEpicCollapse(groupKey)}
                              className="bg-gray-50/90 hover:bg-gray-100/80 transition-colors cursor-pointer border-y border-gray-200"
                            >
                              <td colSpan={7} className="py-2.5 px-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {isCollapsed ? (
                                      <ChevronRight className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                    <span className="font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                      {group.epicCode}
                                    </span>
                                    <span className="font-bold text-gray-800 text-xs">
                                      {group.epicTitle}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                    {group.items.length} {group.items.length === 1 ? 'task' : 'tasks'}
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Epic Grouped Task Rows */}
                            {!isCollapsed &&
                              group.items.map((t) => renderTaskRow(t))}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      /* Flat View Task Rows */
                      tasks.map((t) => renderTaskRow(t))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Server-Side Pagination Controls */}
              <div className="p-3.5 bg-gray-50/90 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600">
                <div>
                  Showing {totalTasksCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, totalTasksCount)} of {totalTasksCount.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-bold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
        onDelete={(deletedId) => {
          setTasks(prev => prev.filter(t => t.id !== deletedId));
          setSelectedTaskToUpdate(null);
        }}
        isReadOnly={isModalReadOnly}
      />

      {/* Feature Epic Details Pop-up Modal (Exact Image 1 Unified Design) */}
      {viewingEpicInTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 text-left select-none">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 shrink-0 bg-white">
              <span className="text-sm font-bold text-gray-700">Epic</span>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteEpicConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-all cursor-pointer"
                    title="Delete Epic (Admin Only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                {isManager && (
                  <button
                    type="button"
                    onClick={() => {
                      const epicId = viewingEpicInTasks.id;
                      setViewingEpicInTasks(null);
                      setActiveTab('EPICS');
                      setSelectedEpicToViewId(epicId);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingEpicInTasks(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
              {/* Breadcrumb & Badges */}
              {(() => {
                const parentInit = (initiatives || []).find((i: any) => i.id === viewingEpicInTasks.initiativeId || i.initiativeCode === viewingEpicInTasks.initiativeId);
                const parentTitle = parentInit?.title || 'Initiative';
                const isCAG = viewingEpicInTasks.entityCode === 'CAG';
                const rawStatus = viewingEpicInTasks.status || 'PLANNED';
                const statusLabel = rawStatus === 'COMPLETED' || rawStatus === 'DONE' ? 'Done' : rawStatus === 'IN_PROGRESS' || rawStatus === 'ACTIVE' ? 'In progress' : 'Planned';

                return (
                  <div className="space-y-3">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      {parentInit ? (
                        <span
                          onClick={() => {
                            setViewingEpicInTasks(null);
                            setActiveTab('INITIATIVES');
                            setSelectedInitiativeToViewId(parentInit.id);
                          }}
                          className="text-blue-600 hover:underline cursor-pointer font-semibold"
                        >
                          {parentTitle}
                        </span>
                      ) : (
                        <span className="text-blue-600 font-semibold">{parentTitle}</span>
                      )}
                      <span>&gt;</span>
                      <span className="text-gray-400">this epic</span>
                    </div>

                    {/* Badges line */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {viewingEpicInTasks.epicCode}
                      </span>
                      {(() => {
                        const badge = getEntityBadge(viewingEpicInTasks);
                        return (
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wide ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Epic Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  {viewingEpicInTasks.title}
                </h2>
                {viewingEpicInTasks.description && (
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {viewingEpicInTasks.description}
                  </p>
                )}
              </div>

              {/* Success Metric Box (Dark Theme Banner - Only shown if filled) */}
              {viewingEpicInTasks.targetDeliverableMetric ? (
                <div className="p-4 rounded-2xl bg-gray-900 text-white space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Success metric</span>
                  </div>
                  <p className="text-sm font-bold text-white pl-6">
                    {viewingEpicInTasks.targetDeliverableMetric}
                  </p>
                </div>
              ) : null}

              {/* 4-Column Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Target week</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingEpicInTasks.targetWeek || viewingEpicInTasks.targetDate || 'Week 1 • days 1–7'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Department</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {(() => {
                      const parentInit = (initiatives || []).find((i: any) => i.id === viewingEpicInTasks.initiativeId || i.initiativeCode === viewingEpicInTasks.initiativeId);
                      const dept = viewingEpicInTasks.department || parentInit?.departmentName;
                      if (!dept || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dept)) {
                        return 'Product and tech';
                      }
                      return dept;
                    })()}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Created At</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingEpicInTasks.createdAt ? new Date(viewingEpicInTasks.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '21 Sept 2026'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Created By</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {(viewingEpicInTasks as any).createdByName || 'Dr. Harshit Mishra'}
                  </span>
                </div>
              </div>

              {/* Linked Tasks Section with Progress Bar */}
              {(() => {
                const isEpicCAG = viewingEpicInTasks.entityCode === 'CAG';
                const linkedTasks = tasks.filter((t: any) => t.epicId === viewingEpicInTasks.id || t.parentEpicCode === viewingEpicInTasks.epicCode);
                const targetTasksCount = Math.max(linkedTasks.length, 3);
                const doneCount = linkedTasks.filter((t: any) => t.status === 'DONE' || t.status === 'Done' || t.status === 'COMPLETED').length;

                return (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    {/* Header line & Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">Linked tasks</h4>
                        <span className="text-xs font-medium text-gray-500">
                          {doneCount} of {linkedTasks.length} done
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((doneCount / Math.max(1, linkedTasks.length)) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks List */}
                    <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                      {linkedTasks.map((taskItem: any, idx: number) => {
                        const displayTaskCode = taskItem.taskCode || 'TSK-001';

                        const assigneeStr = taskItem.assigneeName || taskItem.assignee || 'unassigned';
                        const dateStr = taskItem.createdAt ? new Date(taskItem.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '21 Sept';

                        const isTaskDone = taskItem.status === 'DONE' || taskItem.status === 'Done' || taskItem.status === 'COMPLETED';
                        const isTaskInProgress = taskItem.status === 'IN_PROGRESS' || taskItem.status === 'In Progress' || taskItem.status === 'ACTIVE';
                        const p = (taskItem.priority || '').toUpperCase();
                        const taskStatusLabel = isTaskDone ? 'Done' : isTaskInProgress ? 'In progress' : (p === 'URGENT' || p === 'HIGH' || p === 'P1' || p === '1') ? 'P1' : 'Planned';

                        return (
                          <div
                            key={taskItem.id || idx}
                            onClick={() => handleTaskClick(taskItem, false)}
                            className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors">
                                {taskItem.title}
                              </h5>
                              <p className="text-[11px] text-gray-400 font-medium">
                                {displayTaskCode} • {assigneeStr} • {dateStr}
                                {(taskItem.createdByName || taskItem.creatorName) ? ` • Created by: ${taskItem.createdByName || taskItem.creatorName}` : ''}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${isTaskDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  isTaskInProgress ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    taskStatusLabel === 'P1' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                      'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                {taskStatusLabel}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        );
                      })}

                      {/* Uncreated Task Slots */}
                      {Array.from({ length: Math.max(0, targetTasksCount - linkedTasks.length) }).map((_, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs text-gray-400 font-medium">
                          <span>Task slot {linkedTasks.length + idx + 1} — not created yet</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAssignModalOpen(true);
                            }}
                            className="px-3 py-1 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ CONFIRMATION POPUP MODAL FOR EPIC DELETION IN TASKS (ADMIN ONLY) */}
      {showDeleteEpicConfirm && viewingEpicInTasks && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-4">
              <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Feature Epic</h3>
                <p className="text-xs text-gray-400 font-medium">Admin Privilege Action</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed font-medium mb-6">
              Are you sure you want to permanently delete epic{' '}
              <span className="font-bold font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                {viewingEpicInTasks.epicCode}
              </span>{' '}
              "{viewingEpicInTasks.title}"? This will permanently delete all associated sprints and tasks.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteEpicConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingEpic}
                onClick={async () => {
                  try {
                    setIsDeletingEpic(true);
                    await fetchApi(`/api/epics/${viewingEpicInTasks.id}`, { method: 'DELETE' });
                    toast.success(`Epic ${viewingEpicInTasks.epicCode} deleted successfully!`);
                    setShowDeleteEpicConfirm(false);
                    const deletedId = viewingEpicInTasks.id;
                    setViewingEpicInTasks(null);
                    setRawEpics(prev => prev.filter(e => e.id !== deletedId));
                    setTasks(prev => prev.filter(t => t.epicId !== deletedId));
                  } catch (err: any) {
                    toast.error(err?.message || 'Failed to delete epic');
                  } finally {
                    setIsDeletingEpic(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingEpic ? 'Deleting...' : 'Delete Epic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record History Slide-Over Drawer */}
      {historyTarget && (
        <RecordHistoryPanel
          isOpen={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          tableName="tasks"
          recordId={historyTarget.recordId}
          title={historyTarget.title}
          code={historyTarget.code}
        />
      )}
    </div>
  );
};

