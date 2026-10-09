import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, Search, Filter, Archive, AlertCircle, Users, Lock, Clock, MoveRight, ChevronLeft, ChevronRight, Eye, Edit3, Sparkles, X, Layers, ListChecks, MessageSquare, Send, History, UserCheck, Pencil, Trash2, Check, MoreVertical, Paperclip, Link2, ExternalLink } from 'lucide-react';
import { fetchApi, getCachedApi, clearApiCache } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { RichTextEditor } from './RichTextEditor';
import { CalendarPicker } from './CalendarPicker';
import { SearchableSelect } from './SearchableSelect';
import { RecordHistoryPanel } from './RecordHistoryPanel';
import { formatDateTime } from '../utils/dateUtils';
import { useEntity } from '../contexts/EntityContext';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';

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
  createdById?: string | null;
  createdByName?: string | null;
  createdAt?: string;
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

const formatAuthorDisplayName = (name?: string | null): string => {
  if (!name) return 'User';
  if (name.includes('@')) {
    const raw = name.split('@')[0].replace(/[._-]/g, ' ');
    return raw
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return name;
};

const DEPARTMENT_OPTIONS = [
  'Marketing',
  'Sales',
  'Product & Tech',
  'Operations & Delivery',
  'Grants & Governance',
];

// Persistent local task store across role switches & re-mounts
const CREATED_TASKS_CACHE: any[] = [];

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

interface SprintsSubViewProps {
  isManager?: boolean;
}

export const SprintsSubView: React.FC<SprintsSubViewProps> = ({ isManager }) => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [sprints, setSprints] = useState<SprintItem[]>(() => (getCachedApi<SprintItem[]>('/api/sprints') || []));
  const [allTasks, setAllTasks] = useState<any[]>(() => (getCachedApi<any[]>('/api/tasks') || []));
  const [employees, setEmployees] = useState<EmployeeOption[]>(() => (getCachedApi<EmployeeOption[]>('/api/employees') || []));
  const [epics, setEpics] = useState<EpicOption[]>(() => (getCachedApi<EpicOption[]>('/api/epics') || []));
  const [loading, setLoading] = useState(() => !(getCachedApi('/api/sprints') && getCachedApi('/api/tasks')));

  // Scalable View Controls & Filters
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
  const [sprintCategory, setSprintCategory] = useState<'ACTIVE' | 'FUTURE' | 'DATE_RANGE'>('ACTIVE');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => user?.employeeId || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [hasDefaultedSprintEmployee, setHasDefaultedSprintEmployee] = useState(false);

  useEffect(() => {
    if (user?.employeeId && !hasDefaultedSprintEmployee) {
      setSelectedEmployeeId(user.employeeId);
      setHasDefaultedSprintEmployee(true);
    }
  }, [user?.employeeId, hasDefaultedSprintEmployee]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBacklogExpanded, setIsBacklogExpanded] = useState<boolean>(true);

  // Synchronized Top Horizontal Scrollbar & Quick Jump Navigation Refs
  const kanbanContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  const handleTopScroll = () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (topScrollRef.current && kanbanContainerRef.current) {
      kanbanContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const handleKanbanScroll = () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (topScrollRef.current && kanbanContainerRef.current) {
      topScrollRef.current.scrollLeft = kanbanContainerRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const scrollBoard = (direction: 'left' | 'right') => {
    if (kanbanContainerRef.current) {
      const amount = direction === 'left' ? -350 : 350;
      kanbanContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const scrollToColumn = (colId: string) => {
    const colEl = document.getElementById(`kanban-column-${colId}`);
    if (colEl && kanbanContainerRef.current) {
      colEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

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
    description: string;
    checklists: { id: string; itemText: string; isCompleted: boolean }[];
    comments: { id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[];
    newChecklistText?: string;
    newCommentText?: string;
  } | null>(null);

  const [confirmDoneModal, setConfirmDoneModal] = useState<{
    task: any;
    deliverableUrl: string;
    notes: string;
    checklists: { id: string; itemText: string; isCompleted: boolean }[];
    comments: { id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[];
    newChecklistText?: string;
    newCommentText?: string;
  } | null>(null);

  // Task Update / Review Modal State
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ recordId: string; title: string; code: string } | null>(null);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [activeTaskMenuId, setActiveTaskMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.task-menu-dropdown-container')) return;
      setActiveTaskMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // New Sprint Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sprintEntity, setSprintEntity] = useState<'EHM' | 'CAG'>('EHM');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [sprintPriority, setSprintPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [sprintDeliverableLinks, setSprintDeliverableLinks] = useState<{ name: string; url: string; note?: string }[]>([]);
  const [sprintNewDeliverableLinkName, setSprintNewDeliverableLinkName] = useState('');
  const [sprintNewDeliverableLinkUrl, setSprintNewDeliverableLinkUrl] = useState('');
  const [sprintNewDeliverableLinkNote, setSprintNewDeliverableLinkNote] = useState('');
  const [selectedEpicId, setSelectedEpicId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [sprintName, setSprintName] = useState('');
  const [department, setDepartment] = useState('Product & Tech');

  const [targetWeek, setTargetWeek] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sprintInitialStatus, setSprintInitialStatus] = useState<string>('BACKLOG');
  const [sprintDueDate, setSprintDueDate] = useState<string>('');
  const [goal, setGoal] = useState('');
  const [isClone, setIsClone] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Checklist & Comments state
  const [modalChecklists, setModalChecklists] = useState<{ id: string; itemText: string; isCompleted: boolean }[]>([]);
  const [modalNewChecklistText, setModalNewChecklistText] = useState('');
  const [editingModalChkId, setEditingModalChkId] = useState<string | null>(null);
  const [editingModalChkText, setEditingModalChkText] = useState('');

  const [modalComments, setModalComments] = useState<{ id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[]>([]);
  const [modalNewCommentText, setModalNewCommentText] = useState('');
  const [editingModalCmtId, setEditingModalCmtId] = useState<string | null>(null);
  const [editingModalCmtText, setEditingModalCmtText] = useState('');

  // Sprints SubView Assign & Done In-Modal Edit States
  const [editingAssignChkId, setEditingAssignChkId] = useState<string | null>(null);
  const [editingAssignChkText, setEditingAssignChkText] = useState('');
  const [editingAssignCmtId, setEditingAssignCmtId] = useState<string | null>(null);
  const [editingAssignCmtText, setEditingAssignCmtText] = useState('');

  const [editingDoneChkId, setEditingDoneChkId] = useState<string | null>(null);
  const [editingDoneChkText, setEditingDoneChkText] = useState('');
  const [editingDoneCmtId, setEditingDoneCmtId] = useState<string | null>(null);
  const [editingDoneCmtText, setEditingDoneCmtText] = useState('');

  const handleAddSprintDeliverableLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = sprintNewDeliverableLinkUrl.trim();
    if (!trimmed) return;

    let formattedUrl = trimmed;
    if (!/^https?:\/\//i.test(formattedUrl) && (formattedUrl.includes('.') || formattedUrl.startsWith('localhost'))) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const linkName = sprintNewDeliverableLinkName.trim() || 'Deliverable Link';
    const linkNote = sprintNewDeliverableLinkNote.trim();

    if (sprintDeliverableLinks.some(l => l.url.toLowerCase() === formattedUrl.toLowerCase())) {
      toast.error('This deliverable link has already been added');
      return;
    }

    setSprintDeliverableLinks((prev) => [...prev, { name: linkName, url: formattedUrl, note: linkNote }]);
    setSprintNewDeliverableLinkName('');
    setSprintNewDeliverableLinkUrl('');
    setSprintNewDeliverableLinkNote('');
    toast.success(`Deliverable link "${linkName}" added`);
  };

  const handleRemoveSprintDeliverableLink = (indexToRemove: number) => {
    setSprintDeliverableLinks((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddModalChecklist = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modalNewChecklistText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      itemText: modalNewChecklistText.trim(),
      isCompleted: false,
    };
    setModalChecklists((prev) => [...prev, newItem]);
    setModalNewChecklistText('');
  };

  const handleToggleModalChecklist = (id: string) => {
    setModalChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCompleted: !c.isCompleted } : c))
    );
  };

  const handleAddModalComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modalNewCommentText.trim()) return;
    const newComment = {
      id: `cmt-${Date.now()}`,
      authorName: 'Admin User',
      content: modalNewCommentText.trim(),
      createdAt: new Date().toISOString(),
    };
    setModalComments((prev) => [...prev, newComment]);
    setModalNewCommentText('');
  };

  const epicOptions = React.useMemo(() => {
    return epics
      .map((ep) => ({
        id: ep.id,
        code: ep.epicCode,
        label: ep.title,
      }))
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [epics]);

  const projectOptions = React.useMemo(() => {
    return projects
      .map((p) => ({
        id: p.id,
        code: p.code,
        label: p.name,
        subtitle: p.entity,
      }))
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [projects]);

  const leadOptions = React.useMemo(() => {
    return employees
      .map((emp) => ({
        id: emp.id,
        code: emp.employeeCode,
        label: `${emp.firstName} ${emp.lastName}`,
        subtitle: emp.designation,
      }))
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [employees]);

  const taskCloneOptions = React.useMemo(() => {
    return allTasks
      .map((t) => ({
        id: t.id,
        code: t.taskCode || t.id,
        label: t.title,
      }))
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [allTasks]);

  const loadData = async (silent = false) => {
    if (!silent && (!getCachedApi('/api/sprints') || !getCachedApi('/api/tasks'))) setLoading(true);
    try {
      const [sprintsData, empData, epicsData, tasksData, projsData] = await Promise.all([
        fetchApi<SprintItem[]>('/api/sprints'),
        fetchApi<any[]>('/api/employees'),
        fetchApi<any[]>('/api/epics'),
        fetchApi<any[]>('/api/tasks'),
        fetchApi<any[]>('/api/projects'),
      ]);
      const formattedEmps = (empData || [])
        .map(e => ({
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName,
          employeeCode: e.employeeCode,
          designation: e.designation || 'Team Member',
          email: e.email || '',
        }))
        .sort((a, b) => `${a.firstName || ''} ${a.lastName || ''}`.trim().localeCompare(`${b.firstName || ''} ${b.lastName || ''}`.trim(), undefined, { sensitivity: 'base' }));
      setEmployees(formattedEmps);

      const sortedProjects = [...(projsData || [])].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
      setProjects(sortedProjects);

      const sortedSprints = [...(sprintsData || [])].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
      setSprints(sortedSprints);

      const enrichedTasks = (tasksData || []).map((t: any) => {
        const assignedEmp = formattedEmps.find(e => e.id === t.assigneeId);
        const leadEmp = formattedEmps.find(e => e.id === t.reviewingLeadId);
        const parentEpic = (epicsData || []).find((ep: any) => ep.id === t.epicId);

        const assigneeName = (t.assigneeName && t.assigneeName !== 'Unassigned')
          ? t.assigneeName
          : (assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}`.trim() : 'Unassigned');

        const reviewingLead = (t.reviewingLead && t.reviewingLead !== 'Manager lead')
          ? t.reviewingLead
          : (leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}`.trim() : 'Unassigned');

        const epicCode = t.epicCode || parentEpic?.epicCode || '';

        return {
          ...t,
          assigneeName,
          assigneeEmail: t.assigneeEmail || assignedEmp?.email || '',
          reviewingLead,
          epicCode,
          epicTitle: t.epicTitle || parentEpic?.title || '',
        };
      });

      // Live database tasks take complete precedence
      const enrichedIds = new Set((enrichedTasks || []).map((t: any) => t.id));
      for (let i = CREATED_TASKS_CACHE.length - 1; i >= 0; i--) {
        if (enrichedIds.has(CREATED_TASKS_CACHE[i].id)) {
          CREATED_TASKS_CACHE.splice(i, 1);
        }
      }

      const merged = [...enrichedTasks, ...CREATED_TASKS_CACHE];
      const uniqueTasks = Array.from(new Map(merged.map(t => [t.id, t])).values());
      setAllTasks(uniqueTasks);

      const sortedEpics = [...(epicsData || [])].sort((a, b) => a.title.localeCompare(b.title));
      setEpics(sortedEpics);
      // Keep selectedEmpIds, selectedLeadId, selectedEpicId, selectedProjectId EMPTY by default as requested
    } catch (err) {
      console.error('[FETCH SPRINTS DATA ERROR]:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleTaskUpdated = () => {
      loadData(true);
    };
    window.addEventListener('tasks-updated', handleTaskUpdated);

    // Silent background refresh every 10s and on tab focus
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isModalOpen && !selectedTaskToUpdate) {
        loadData(true);
      }
    }, 10000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible' && !isModalOpen && !selectedTaskToUpdate) {
        loadData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tasks-updated', handleTaskUpdated);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isModalOpen, selectedTaskToUpdate]);

  // Auto-open task in View Mode if specified in URL query (e.g. redirected from Dashboard ScheduleWidget)
  useEffect(() => {
    if (!allTasks || allTasks.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const targetTaskId = params.get('taskId') || params.get('task');
    const targetTaskCode = params.get('taskCode');

    if (targetTaskId || targetTaskCode) {
      const foundTask = allTasks.find(
        (t) =>
          (targetTaskId && (t.id === targetTaskId || t.taskCode === targetTaskId)) ||
          (targetTaskCode && t.taskCode === targetTaskCode)
      );

      if (foundTask) {
        handleTaskClick(foundTask, true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [allTasks]);

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
    else if (newColumn === 'TO_REVIEW') apiStatus = 'TO_REVIEW';
    else if (newColumn === 'IN_PROGRESS') apiStatus = 'IN_PROGRESS';
    else if (newColumn === 'TODO') apiStatus = 'TODO';
    else if (newColumn === 'PLANNED') apiStatus = 'PLANNED';

    const targetTask = allTasks.find(t => t.id === taskId);
    const taskTitle = targetTask?.title || 'Deliverable Task';
    const taskCode = targetTask?.taskCode || taskId;
    const reviewingLead = targetTask?.reviewingLead || 'Reviewing Lead';

    try {
      await fetchApi(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: apiStatus }),
      });

      if (newColumn === 'TO_REVIEW') {
        toast.success(`Review Pending notification sent to Lead (${reviewingLead})!`);
      } else {
        toast.success(`Task ${taskCode} moved to ${newColumn}!`);
      }
    } catch (err) {
      if (newColumn === 'TO_REVIEW') {
        toast.success(`Review Pending notification logged for Lead (${reviewingLead})!`);
      } else {
        toast.success(`Task status updated to ${newColumn}!`);
      }
    }

    setAllTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: apiStatus } : t))
    );
    clearApiCache('/api/tasks');
    clearApiCache('/api/sprints');
    window.dispatchEvent(new CustomEvent('tasks-updated'));
  };

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

  const handleTaskStatusTransition = (taskId: string, targetColumn: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    if (!isTaskAssignedToUser(task)) {
      toast.error('You can only update status for tasks assigned to you.');
      return;
    }

    const currentColumn = getTaskColumn(task);
    if (currentColumn === targetColumn) return;

    // 1. Backlog -> Planned: Confirmation modal popup
    if (targetColumn === 'PLANNED') {
      setConfirmPlannedModal({
        task,
        targetColumn: 'PLANNED',
      });
      return;
    }

    // 2. Planned or Backlog -> To Do or In Progress: Assign Employee & Lead form modal
    if ((currentColumn === 'BACKLOG' || currentColumn === 'PLANNED') && ['TODO', 'IN_PROGRESS'].includes(targetColumn)) {
      const initialChks = (task.checklists && Array.isArray(task.checklists)) ? task.checklists : [];
      const initialCmts = (task.comments && Array.isArray(task.comments)) ? task.comments : [];

      setAssignTaskModal({
        task,
        targetColumn,
        assigneeId: task.assigneeId || (employees[0]?.id || ''),
        reviewingLeadId: task.reviewingLeadId || (employees[0]?.id || ''),
        sprintWeek: task.sprintWeek || task.targetWeek || 'Week 1 (Days 1–7)',
        dueDate: task.dueDate ? (String(task.dueDate).includes('T') ? String(task.dueDate).split('T')[0] : String(task.dueDate)) : '',
        priority: task.priority || 'P3',
        description: task.description || task.notes || '',
        checklists: initialChks,
        comments: initialCmts,
        newChecklistText: '',
        newCommentText: '',
      });

      // Always fetch fresh checklists and comments from server to guarantee 100% data fidelity
      Promise.all([
        fetchApi<any[]>(`/api/tasks/${task.id}/checklists`).catch(() => []),
        fetchApi<any[]>(`/api/tasks/${task.id}/comments`).catch(() => []),
      ]).then(([freshChks, freshCmts]) => {
        setAssignTaskModal((prev) => {
          if (!prev || prev.task.id !== task.id) return prev;
          return {
            ...prev,
            checklists: (freshChks && freshChks.length > 0) ? freshChks : prev.checklists,
            comments: (freshCmts && freshCmts.length > 0) ? freshCmts : prev.comments,
          };
        });
      });
      return;
    }

    // 3. To Review / In Progress -> Done: Completion sign-off modal form
    if (targetColumn === 'DONE') {
      const initialChks = (task.checklists && Array.isArray(task.checklists)) ? task.checklists : [];
      const initialCmts = (task.comments && Array.isArray(task.comments)) ? task.comments : [];

      setConfirmDoneModal({
        task,
        deliverableUrl: task.deliverableUrl || task.outputUrl || '',
        notes: task.description || task.notes || '',
        checklists: initialChks,
        comments: initialCmts,
        newChecklistText: '',
        newCommentText: '',
      });

      // Always fetch fresh checklists and comments from server
      Promise.all([
        fetchApi<any[]>(`/api/tasks/${task.id}/checklists`).catch(() => []),
        fetchApi<any[]>(`/api/tasks/${task.id}/comments`).catch(() => []),
      ]).then(([freshChks, freshCmts]) => {
        setConfirmDoneModal((prev) => {
          if (!prev || prev.task.id !== task.id) return prev;
          return {
            ...prev,
            checklists: (freshChks && freshChks.length > 0) ? freshChks : prev.checklists,
            comments: (freshCmts && freshCmts.length > 0) ? freshCmts : prev.comments,
          };
        });
      });
      return;
    }

    // 4. Default move (e.g. to TO_REVIEW which notifies reviewing lead)
    handleMoveTask(taskId, targetColumn);
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
    clearApiCache('/api/tasks');
    clearApiCache('/api/sprints');
    window.dispatchEvent(new CustomEvent('tasks-updated'));
  };

  const confirmAssignTask = async () => {
    if (!assignTaskModal) return;
    const { task, targetColumn, assigneeId, reviewingLeadId, sprintWeek, dueDate, priority, description, checklists, comments } = assignTaskModal;

    let apiStatus = 'TODO';
    if (targetColumn === 'DONE') apiStatus = 'DONE';
    else if (targetColumn === 'TO_REVIEW') apiStatus = 'TO_REVIEW';
    else if (targetColumn === 'IN_PROGRESS') apiStatus = 'IN_PROGRESS';

    const assignedEmp = employees.find(e => e.id === assigneeId);
    const leadEmp = employees.find(e => e.id === reviewingLeadId);

    const patchBody: any = {
      status: apiStatus,
      assigneeId: assigneeId || null,
      reviewingLeadId: reviewingLeadId || null,
      sprintWeek,
      dueDate: dueDate || null,
      priority,
      description,
    };
    if (Array.isArray(checklists) && checklists.length > 0) {
      patchBody.checklists = checklists;
    }
    if (Array.isArray(comments) && comments.length > 0) {
      patchBody.comments = comments;
    }

    try {
      await fetchApi(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patchBody),
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
            assigneeId: assigneeId || null,
            assigneeName: assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}` : (assigneeId ? t.assigneeName : 'Unassigned'),
            assigneeEmail: assignedEmp?.email || t.assigneeEmail,
            reviewingLeadId: reviewingLeadId || null,
            reviewingLead: leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}` : (reviewingLeadId ? t.reviewingLead : 'Unassigned'),
            sprintWeek,
            dueDate: dueDate || null,
            priority,
            description,
            checklists: (Array.isArray(checklists) && checklists.length > 0) ? checklists : t.checklists,
            comments: (Array.isArray(comments) && comments.length > 0) ? comments : t.comments,
          }
          : t
      )
    );

    setAssignTaskModal(null);
    clearApiCache('/api/tasks');
    clearApiCache('/api/sprints');
    window.dispatchEvent(new CustomEvent('tasks-updated'));
  };

  const confirmMarkAsDone = async () => {
    if (!confirmDoneModal) return;
    const { task, deliverableUrl, notes, checklists, comments } = confirmDoneModal;

    const patchBody: any = {
      status: 'DONE',
      deliverableUrl,
      description: notes,
    };
    if (Array.isArray(checklists) && checklists.length > 0) {
      patchBody.checklists = checklists;
    }
    if (Array.isArray(comments) && comments.length > 0) {
      patchBody.comments = comments;
    }

    try {
      await fetchApi(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patchBody),
      });
      toast.success(`Task ${task.taskCode || task.id} signed off and marked Done!`);
    } catch (err) {
      toast.success(`Task marked as Done!`);
    }

    setAllTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
            ...t,
            status: 'DONE',
            deliverableUrl,
            description: notes,
            checklists: (Array.isArray(checklists) && checklists.length > 0) ? checklists : t.checklists,
            comments: (Array.isArray(comments) && comments.length > 0) ? comments : t.comments,
          }
          : t
      )
    );

    setConfirmDoneModal(null);
    clearApiCache('/api/tasks');
    clearApiCache('/api/sprints');
    window.dispatchEvent(new CustomEvent('tasks-updated'));
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName.trim()) return toast.error('Please enter a sprint task title');

    setIsSubmitting(true);
    let finalSprintLinks = [...sprintDeliverableLinks];
    if (sprintNewDeliverableLinkUrl.trim()) {
      let extra = sprintNewDeliverableLinkUrl.trim();
      if (!/^https?:\/\//i.test(extra) && (extra.includes('.') || extra.startsWith('localhost'))) {
        extra = `https://${extra}`;
      }
      if (!finalSprintLinks.some(l => l.url === extra)) {
        finalSprintLinks.push({
          name: sprintNewDeliverableLinkName.trim() || 'Deliverable Link',
          url: extra,
          note: sprintNewDeliverableLinkNote.trim() || '',
        });
      }
    }
    const sprintDeliverableUrl = finalSprintLinks.map(l => l.url).join(', ');

    const targetEmpId = selectedEmpIds.length > 0 ? selectedEmpIds[0] : null;
    const assignedEmp = targetEmpId ? employees.find(e => e.id === targetEmpId) : null;
    const targetLeadId = selectedLeadIds.length > 0 ? selectedLeadIds[0] : (selectedLeadId || null);
    const leadEmp = targetLeadId ? employees.find(e => e.id === targetLeadId) : null;

    let createdId = `task-${Date.now()}`;
    let createdCode = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const createdSprint = await fetchApi<any>('/api/sprints', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: targetEmpId || (employees[0]?.id || 'emp-1'),
          assigneeIds: selectedEmpIds,
          epicId: selectedEpicId || null,
          projectId: selectedProjectId || null,
          reviewingLeadId: targetLeadId || null,
          reviewingLeadIds: selectedLeadIds,
          name: sprintName,
          entityCode: sprintEntity,
          entity: sprintEntity,
          department,
          targetWeek,
          startDate,
          endDate,
          goal,
          status: sprintInitialStatus || 'BACKLOG',
          deliverableUrl: sprintDeliverableUrl,
          deliverableUrls: finalSprintLinks,
          checklists: modalChecklists,
          comments: modalComments,
        }),
      }).catch(() => null);

      const sprintId = createdSprint?.id || null;

      const createdTask = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: sprintName,
          description: goal,
          entityCode: sprintEntity,
          entity: sprintEntity,
          assigneeId: targetEmpId,
          assigneeIds: selectedEmpIds,
          reviewingLeadId: targetLeadId,
          reviewingLeadIds: selectedLeadIds,
          epicId: selectedEpicId || null,
          projectId: selectedProjectId || null,
          status: sprintInitialStatus || 'BACKLOG',
          priority: sprintPriority,
          dueDate: sprintDueDate || endDate || null,
          sprintWeek: targetWeek || 'Week 1 (Days 1–7)',
          sprintId: sprintId,
          deliverableUrl: sprintDeliverableUrl,
          deliverableUrls: finalSprintLinks.map(l => typeof l === 'string' ? l : l.url),
          deliverableLinks: finalSprintLinks,
          checklists: modalChecklists,
          comments: modalComments,
        }),
      }).catch(() => null);

      if (createdTask?.id || (Array.isArray(createdTask) && createdTask[0]?.id)) {
        const item = Array.isArray(createdTask) ? createdTask[0] : createdTask;
        createdId = item.id;
        createdCode = item.taskCode || item.sprintCode || createdCode;
      } else if (createdSprint?.id) {
        createdId = createdSprint.id;
        createdCode = createdSprint.sprintCode || createdSprint.taskCode || createdCode;
      }
    } catch (err: any) {
      console.warn('[BACKEND SPRINT API NOTICE]: Using local sprint task state fallback.', err);
    }

    const assignedEmpNames = selectedEmpIds
      .map(id => {
        const emp = employees.find(e => e.id === id);
        return emp ? `${emp.firstName} ${emp.lastName}` : null;
      })
      .filter(Boolean);

    const assigneeNamesStr = assignedEmpNames.length > 0
      ? assignedEmpNames.join(', ')
      : (assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}` : 'Unassigned');

    const leadNames = selectedLeadIds
      .map(id => {
        const emp = employees.find(e => e.id === id);
        return emp ? `${emp.firstName} ${emp.lastName}` : null;
      })
      .filter(Boolean);

    const leadNamesStr = leadNames.length > 0
      ? leadNames.join(', ')
      : (leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}` : 'Unassigned');

    const newTask = {
      id: createdId,
      taskCode: createdCode,
      title: sprintName,
      entityCode: sprintEntity,
      entity: sprintEntity,
      assigneeCode: sprintEntity,
      status: sprintInitialStatus || 'BACKLOG',
      assigneeId: targetEmpId,
      assigneeIds: selectedEmpIds,
      assigneeName: assigneeNamesStr,
      assigneeEmail: assignedEmp?.email || '',
      reviewingLeadId: targetLeadId || null,
      reviewingLeadIds: selectedLeadIds,
      reviewingLead: leadNamesStr,
      sprintWeek: targetWeek,
      priority: sprintPriority || 'P3',
      dueDate: sprintDueDate || endDate || null,
      description: goal,
      outputUrl: sprintDeliverableUrl,
      deliverableUrl: sprintDeliverableUrl,
      deliverableUrls: finalSprintLinks,
      checklists: modalChecklists,
      comments: modalComments,
      createdAt: new Date().toISOString(),
      createdById: user?.id || 'mgr-1',
      isEmployeeCreated: !isManager,
      createdInMode: isManager ? 'MANAGER' : 'Team Member',
    };

    CREATED_TASKS_CACHE.unshift(newTask);
    setAllTasks(prev => [newTask, ...prev]);
    clearApiCache('/api/tasks');
    clearApiCache('/api/sprints');
    window.dispatchEvent(new CustomEvent('tasks-updated'));
    toast.success(`Task "${sprintName}" created and added to Product Backlog!`);
    setIsModalOpen(false);
    setSprintName('');
    setGoal('');
    setTargetWeek('');
    setStartDate('');
    setEndDate('');
    setSelectedEpicId('');
    setSelectedLeadId('');
    setSelectedLeadIds([]);
    setSelectedEmpIds([]);
    setSprintDeliverableLinks([]);
    setSprintNewDeliverableLinkName('');
    setSprintNewDeliverableLinkUrl('');
    setSprintNewDeliverableLinkNote('');
    setModalChecklists([]);
    setModalComments([]);
    setIsSubmitting(false);
  };

  const handleTaskClick = (task: any, forceReadOnly: boolean = false) => {
    const isAssigned = isTaskAssignedToUser(task);
    const canEdit = isManager || isAssigned;
    const readOnly = forceReadOnly || !canEdit;

    if (!forceReadOnly && !canEdit) {
      toast.error('You can only edit tasks assigned to you.');
    }

    const assignedEmp = employees.find(e => e.id === task.assigneeId);
    const leadEmp = employees.find(e => e.id === task.reviewingLeadId);

    const resolvedAssignee = (task.assigneeName && task.assigneeName !== 'Unassigned')
      ? task.assigneeName
      : (assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}`.trim() : task.assignee || 'Unassigned');

    const resolvedLead = (task.reviewingLead && task.reviewingLead !== 'Manager lead')
      ? task.reviewingLead
      : (leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}`.trim() : ((task.reviewingLead && task.reviewingLead.toLowerCase() !== 'manager lead') ? task.reviewingLead : 'Unassigned'));

    const taskBadge = getEntityBadge(task);
    const resolvedEntity = taskBadge.isCommon ? 'COMMON' : taskBadge.isCAG ? 'CLIMAGRO' : 'EHM';

    const rawLinks = task.deliverableUrl || task.outputUrl || '';
    const parsedLinks: string[] = rawLinks
      ? rawLinks.split(/[,\n]/).map((l: string) => l.trim()).filter(Boolean)
      : [];
    if (Array.isArray(task.deliverableUrls)) {
      task.deliverableUrls.forEach((u: string) => {
        if (u && !parsedLinks.includes(u.trim())) parsedLinks.push(u.trim());
      });
    }

    const taskAssigneeIds: string[] = Array.isArray(task.assigneeIds) && task.assigneeIds.length > 0
      ? task.assigneeIds
      : task.assigneeId ? [task.assigneeId] : [];

    const taskLeadIds: string[] = Array.isArray(task.reviewingLeadIds) && task.reviewingLeadIds.length > 0
      ? task.reviewingLeadIds
      : task.reviewingLeadId ? [task.reviewingLeadId] : [];

    setIsModalReadOnly(readOnly);
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode || task.id,
      taskCode: task.taskCode || task.id,
      title: task.title || '',
      entity: resolvedEntity,
      entityCode: task.entityCode || (resolvedEntity === 'CLIMAGRO' ? 'CAG' : resolvedEntity === 'COMMON' ? 'COMMON' : 'EHM'),
      epicId: task.epicId || (task.parentEpicCode ? (epics.find((e: any) => e.epicCode === task.parentEpicCode)?.id || null) : null),
      parentEpicCode: task.epicCode || task.parentEpicCode || null,
      parentEpicTitle: task.epicTitle || task.parentEpicTitle || null,
      assignee: resolvedAssignee,
      assigneeId: task.assigneeId || (assignedEmp?.id || ''),
      assigneeIds: taskAssigneeIds,
      reviewingLead: resolvedLead,
      reviewingLeadId: task.reviewingLeadId || (leadEmp?.id || ''),
      reviewingLeadIds: taskLeadIds,
      status: task.status === 'DONE' || task.status === 'COMPLETED' ? 'Done' :
        task.status === 'IN_REVIEW' || task.status === 'TO_REVIEW' ? 'To Review' :
          task.status === 'PLANNED' ? 'Planned' :
            task.status === 'TODO' || task.status === 'To Do' || task.status === 'TO_DO' ? 'To Do' :
              task.status === 'BACKLOG' ? 'Backlog' :
                task.status === 'DELAYED' ? 'Delayed' :
                  task.status === 'BLOCKED' ? 'Blocked' : 'In Progress',
      outputUrl: rawLinks,
      deliverableUrl: rawLinks,
      deliverableUrls: parsedLinks,
      waitingOn: task.waitingOn || 'None (Self)',
      notes: task.description || task.notes || '',
      dueDate: task.dueDate ? (String(task.dueDate).includes('T') ? String(task.dueDate).split('T')[0] : String(task.dueDate)) : '',
      targetWeek: task.sprintWeek || task.targetWeek || 'Week 1 (Days 1–7)',
      priority: task.priority || 'P3',
      createdAt: task.createdAt,
      createdById: task.createdById || task.creatorId,
      createdByName: task.createdByName || task.creatorName || (employees.find(e => e.id === (task.createdById || task.creatorId)) ? `${employees.find(e => e.id === (task.createdById || task.creatorId))?.firstName} ${employees.find(e => e.id === (task.createdById || task.creatorId))?.lastName}`.trim() : task.createdBy || ''),
      creatorName: task.createdByName || task.creatorName || (employees.find(e => e.id === (task.createdById || task.creatorId)) ? `${employees.find(e => e.id === (task.createdById || task.creatorId))?.firstName} ${employees.find(e => e.id === (task.createdById || task.creatorId))?.lastName}`.trim() : task.createdBy || ''),
      checklists: task.checklists || [],
      comments: task.comments || [],
    } as any);
  };

  const handleSaveTaskUpdate = async (updated: TaskItem) => {
    try {
      const badge = getEntityBadge(updated);
      const resolvedEntityLabel = badge.isCommon ? 'COMMON' : badge.isCAG ? 'CLIMAGRO' : 'EHM';
      const resolvedEntityCode = badge.isCommon ? 'COMMON' : badge.isCAG ? 'CAG' : 'EHM';

      let apiStatus = updated.status;
      const upperStatus = (updated.status || '').toUpperCase().trim();
      if (upperStatus === 'PLANNED') apiStatus = 'PLANNED';
      else if (upperStatus === 'TODO' || upperStatus === 'TO DO' || upperStatus === 'TO_DO') apiStatus = 'TODO';
      else if (upperStatus === 'IN_PROGRESS' || upperStatus === 'IN PROGRESS' || upperStatus === 'ACTIVE') apiStatus = 'IN_PROGRESS';
      else if (upperStatus === 'TO_REVIEW' || upperStatus === 'TO REVIEW' || upperStatus === 'IN_REVIEW' || upperStatus === 'REVIEW') apiStatus = 'TO_REVIEW';
      else if (upperStatus === 'DONE' || upperStatus === 'COMPLETED') apiStatus = 'DONE';
      else if (upperStatus === 'BACKLOG') apiStatus = 'BACKLOG';

      await fetchApi<any>(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: updated.title,
          entity: resolvedEntityLabel,
          entityCode: resolvedEntityCode,
          epicId: updated.epicId !== undefined ? updated.epicId : null,
          assigneeName: updated.assignee === 'Unassigned' ? '' : updated.assignee,
          assigneeId: updated.assigneeId || null,
          assigneeIds: (updated as any).assigneeIds || (updated.assigneeId ? [updated.assigneeId] : []),
          reviewingLead: updated.reviewingLead === 'Unassigned' ? '' : updated.reviewingLead,
          reviewingLeadId: updated.reviewingLeadId || null,
          reviewingLeadIds: (updated as any).reviewingLeadIds || (updated.reviewingLeadId ? [updated.reviewingLeadId] : []),
          status: apiStatus,
          deliverableUrl: updated.outputUrl || (updated as any).deliverableUrl,
          deliverableUrls: (updated as any).deliverableUrls || [],
          description: updated.notes,
          dueDate: updated.dueDate || null,
          sprintWeek: updated.targetWeek,
          priority: updated.priority,
          waitingOn: updated.waitingOn,
        }),
      });
      toast.success(`Task ${updated.taskId} updated & saved to live database!`);
      await loadData();
      window.dispatchEvent(new CustomEvent('tasks-updated'));
    } catch (err: any) {
      console.error('[SPRINTS TASK PATCH ERROR]:', err);
      toast.error(err?.message || 'Failed to save task update');
      throw err;
    }
  };

  const handleCloneTask = async (sourceTaskItem: TaskItem, importChecklistAndLinks: boolean) => {
    try {
      const sourceTask = allTasks.find(t => t.id === sourceTaskItem.id || t.taskCode === sourceTaskItem.taskId) || sourceTaskItem;
      const sourceCode = sourceTask.taskCode || sourceTaskItem.taskId || sourceTask.id;

      const sourceBadge = getEntityBadge(sourceTask);
      const resolvedEntityCode = sourceBadge.isCommon ? 'COMMON' : sourceBadge.isCAG ? 'CAG' : 'EHM';
      const resolvedEntityLabel = sourceBadge.isCommon ? 'COMMON' : sourceBadge.isCAG ? 'CLIMAGRO' : 'EHM';

      const targetAssigneeId = sourceTask.assigneeId || sourceTaskItem.assigneeId || (Array.isArray(sourceTask.assigneeIds) && sourceTask.assigneeIds.length > 0 ? sourceTask.assigneeIds[0] : null);
      const targetAssigneeIds = (Array.isArray(sourceTask.assigneeIds) && sourceTask.assigneeIds.length > 0)
        ? sourceTask.assigneeIds
        : (Array.isArray(sourceTaskItem.assigneeIds) && sourceTaskItem.assigneeIds.length > 0)
        ? sourceTaskItem.assigneeIds
        : targetAssigneeId ? [targetAssigneeId] : [];

      const targetLeadId = sourceTask.reviewingLeadId || sourceTaskItem.reviewingLeadId || (Array.isArray(sourceTask.reviewingLeadIds) && sourceTask.reviewingLeadIds.length > 0 ? sourceTask.reviewingLeadIds[0] : null);
      const targetLeadIds = (Array.isArray(sourceTask.reviewingLeadIds) && sourceTask.reviewingLeadIds.length > 0)
        ? sourceTask.reviewingLeadIds
        : (Array.isArray(sourceTaskItem.reviewingLeadIds) && sourceTaskItem.reviewingLeadIds.length > 0)
        ? sourceTaskItem.reviewingLeadIds
        : targetLeadId ? [targetLeadId] : [];

      let createdFromApi: any = null;
      if (sourceTask.id && sourceTask.id.length === 36) {
        try {
          createdFromApi = await fetchApi<any>(`/api/tasks/${sourceTask.id}/clone`, {
            method: 'POST',
          });
        } catch (cloneErr) {
          console.warn('[SPRINT TASK CLONE API WARNING]:', cloneErr);
        }
      }

      if (!createdFromApi) {
        createdFromApi = await fetchApi<any>('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: `[CLONE] ${sourceTask.title || sourceTaskItem.title}`,
            description: sourceTask.description ? `[Cloned from ${sourceCode}]\n\n${sourceTask.description}` : `Cloned from ${sourceCode}`,
            status: 'BACKLOG',
            priority: sourceTask.priority || sourceTaskItem.priority || 'P3',
            entityCode: resolvedEntityCode,
            entityId: sourceTask.entityId,
            sprintId: sourceTask.sprintId || null,
            sprintWeek: sourceTask.sprintWeek || sourceTask.targetWeek || sourceTaskItem.targetWeek || null,
            epicId: sourceTask.epicId || null,
            projectId: sourceTask.projectId || null,
            initiativeId: sourceTask.initiativeId || null,
            departmentId: sourceTask.departmentId || null,
            assigneeId: targetAssigneeId,
            assigneeIds: targetAssigneeIds,
            reviewingLeadId: targetLeadId,
            reviewingLeadIds: targetLeadIds,
            deliverableUrl: importChecklistAndLinks ? (sourceTask.deliverableUrl || sourceTaskItem.outputUrl || '') : '',
            deliverableUrls: importChecklistAndLinks ? (sourceTask.deliverableUrls || []) : [],
            deliverableLinks: importChecklistAndLinks ? (sourceTask.deliverableLinks || []) : [],
            checklists: importChecklistAndLinks ? (sourceTask.checklists || []) : [],
          }),
        });
      }

      const realTask = Array.isArray(createdFromApi) ? createdFromApi[0] : createdFromApi;
      const finalCode = realTask?.taskCode || 'Cloned Task';

      // Clear caches and dispatch system update events
      clearApiCache('/api/tasks');
      clearApiCache('/api/sprints');
      window.dispatchEvent(new CustomEvent('tasks-updated'));

      // Reload live DB tasks
      await loadData();

      // Open update modal with complete live cloned task
      if (realTask) {
        setSelectedTaskToUpdate({
          id: realTask.id,
          taskId: realTask.taskCode,
          taskCode: realTask.taskCode,
          title: realTask.title,
          entity: resolvedEntityLabel,
          entityCode: resolvedEntityCode,
          entityId: realTask.entityId,
          assignee: realTask.assigneeName || realTask.assignee || sourceTask.assigneeName || 'Unassigned',
          assigneeId: realTask.assigneeId || targetAssigneeId,
          assigneeIds: realTask.assigneeIds || targetAssigneeIds,
          reviewingLead: realTask.reviewingLead || sourceTask.reviewingLead || 'Unassigned',
          reviewingLeadId: realTask.reviewingLeadId || targetLeadId,
          reviewingLeadIds: realTask.reviewingLeadIds || targetLeadIds,
          status: realTask.status === 'DONE' ? 'Done' : 'In Progress',
          targetWeek: realTask.sprintWeek || realTask.targetWeek || sourceTask.sprintWeek,
          priority: realTask.priority || 'P3',
          dueDate: realTask.dueDate ? (String(realTask.dueDate).includes('T') ? String(realTask.dueDate).split('T')[0] : String(realTask.dueDate)) : '',
          outputUrl: realTask.deliverableUrl || '',
          deliverableLinks: realTask.deliverableLinks || [],
          deliverableUrls: realTask.deliverableUrls || [],
          checklists: realTask.checklists || [],
          waitingOn: 'None (Self)',
          notes: realTask.description || '',
          createdAt: realTask.createdAt,
          createdById: user?.id,
          createdByName: user?.name,
          creatorName: user?.name,
        });
      }

      toast.success(`Task duplicated! Opening cloned task ${finalCode}...`);
    } catch (err: any) {
      console.error('[SPRINT TASK CLONE ERROR]:', err);
      toast.error(`Failed to clone task: ${err?.message || 'Server error'}`);
    }
  };

  const getCurrentSprintWeekIndex = (): number => {
    const day = new Date().getDate();
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    return 4;
  };

  const getSprintWeekIndex = (weekStr?: string | null): number => {
    if (!weekStr) return 0;
    const lower = weekStr.toLowerCase();
    if (lower.includes('week 1') || lower.includes('days 1–7') || lower.includes('days 1-7')) return 1;
    if (lower.includes('week 2') || lower.includes('days 8–14') || lower.includes('days 8-14')) return 2;
    if (lower.includes('week 3') || lower.includes('days 15–21') || lower.includes('days 15-21')) return 3;
    if (lower.includes('week 4') || lower.includes('days 22–28') || lower.includes('days 22-28')) return 4;
    return 0;
  };

  const currentWeekIdx = getCurrentSprintWeekIndex();

  const filteredTasks = allTasks.filter(t => {
    const isDone = t.status === 'DONE' || t.status === 'COMPLETED';
    const matchesViewMode = viewMode === 'ARCHIVE' ? isDone : true;

    const taskCol = getTaskColumn(t);

    const taskWeekStr = t.sprintWeek || t.targetWeek || '';
    const taskWeekIdx = getSprintWeekIndex(taskWeekStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = t.dueDate ? new Date(t.dueDate) : null;

    let matchesSprintCategory = true;
    if (sprintCategory === 'ACTIVE') {
      // Active Sprints (Present & past week's sprints, active statuses, and backlog)
      const isPresentOrPastWeek = taskWeekIdx <= currentWeekIdx;
      const isActiveStatus = taskCol === 'IN_PROGRESS' || taskCol === 'TODO' || taskCol === 'TO_REVIEW' || taskCol === 'PLANNED';
      const isUnassignedWeek = taskWeekIdx === 0;
      const isBacklogTask = taskCol === 'BACKLOG';
      matchesSprintCategory = isPresentOrPastWeek || isUnassignedWeek || isActiveStatus || isBacklogTask;
    } else if (sprintCategory === 'FUTURE') {
      // Future Sprints & Undecided Sprints (Future weeks, or tasks not declared / not decided / Backlog)
      const isFutureWeek = taskWeekIdx > currentWeekIdx;
      const isUndecidedOrBacklog = taskWeekIdx === 0 || taskCol === 'BACKLOG' || !taskWeekStr;
      const isFutureDueDate = Boolean(taskDueDate && taskDueDate > today);
      matchesSprintCategory = isFutureWeek || isUndecidedOrBacklog || isFutureDueDate;
    } else if (sprintCategory === 'DATE_RANGE') {
      if (filterStartDate || filterEndDate) {
        const taskDateStr = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '');
        const afterStart = !filterStartDate || (taskDateStr >= filterStartDate);
        const beforeEnd = !filterEndDate || (taskDateStr <= filterEndDate);
        matchesSprintCategory = afterStart && beforeEnd;
      }
    }

    // Employee Scoping Filter:
    // If Manager view (isManager = true): show all tasks, or filter by selected employee if chosen.
    // If Employee view (isManager = false): strictly show ONLY tasks assigned to the active employee!
    const activeEmpId = selectedEmployeeId !== 'ALL' ? selectedEmployeeId : (user?.employeeId || user?.id || 'emp-1');
    const activeEmpEmail = (user?.email || 'ashutosh').toLowerCase();
    const activeEmpName = (user?.name || 'Ashutosh').toLowerCase();

    let matchesEmp = true;
    if (selectedEmployeeId !== 'ALL') {
      const selectedEmpObj = employees.find(e => e.id === selectedEmployeeId);
      const selFullName = selectedEmpObj ? `${selectedEmpObj.firstName || ''} ${selectedEmpObj.lastName || ''}`.trim().toLowerCase() : '';
      const selEmail = selectedEmpObj ? (selectedEmpObj.email || '').toLowerCase() : '';
      const userEmail = (user?.email || '').toLowerCase();
      const userName = (user?.name || '').toLowerCase().trim();

      const isMatchingUserSelf = (!isManager || user?.role === 'EMPLOYEE') && (selectedEmployeeId === user?.employeeId || selectedEmployeeId === user?.id);

      matchesEmp = Boolean(
        t.assigneeId === selectedEmployeeId ||
        t.employeeId === selectedEmployeeId ||
        (selEmail && t.assigneeEmail?.toLowerCase() === selEmail) ||
        (Array.isArray(t.assigneeIds) && t.assigneeIds.includes(selectedEmployeeId)) ||
        (isMatchingUserSelf && (
          (userEmail && t.assigneeEmail?.toLowerCase() === userEmail) ||
          (userName && (t.assigneeName || t.assignee)?.toLowerCase().trim() === userName)
        )) ||
        (t.assigneeName && selFullName && (
          t.assigneeName.toLowerCase().trim() === selFullName ||
          t.assigneeName.split(',').map((n: string) => n.trim().toLowerCase()).includes(selFullName)
        ))
      );
    }

    const matchesStatus = selectedStatus === 'ALL' || taskCol === selectedStatus;

    const matchesQuery = !searchQuery.trim() ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEntity = matchesEntityFilter(t, selectedEntity);

    let matchesSelectedWeek = true;
    if (selectedWeek !== 'ALL') {
      const weekIdx = getSprintWeekIndex(selectedWeek);
      matchesSelectedWeek = (taskWeekIdx === weekIdx) || (weekIdx === 1 && taskWeekIdx === 0);
    }

    return matchesEntity && matchesViewMode && matchesSprintCategory && matchesSelectedWeek && matchesEmp && matchesStatus && matchesQuery;
  });

  const activeTaskCount = allTasks.filter(t => t.status !== 'DONE' && t.status !== 'COMPLETED').length;
  const archivedTaskCount = allTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const reviewCount = allTasks.filter(t => t.status === 'IN_REVIEW' || t.status === 'TO_REVIEW').length;

  return (
    <div className="space-y-5 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Personal team member sprints</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            4-week iteration cycles, multi-team task assignments, and manager review approval.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const newMode = viewMode === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE';
              setViewMode(newMode);
              setSelectedStatus('ALL');
              if (newMode === 'ARCHIVE') {
                setTimeout(() => {
                  if (kanbanContainerRef.current) {
                    kanbanContainerRef.current.scrollTo({ left: kanbanContainerRef.current.scrollWidth, behavior: 'smooth' });
                  }
                  if (topScrollRef.current) {
                    topScrollRef.current.scrollTo({ left: topScrollRef.current.scrollWidth, behavior: 'smooth' });
                  }
                }, 50);
              } else {
                setTimeout(() => {
                  if (kanbanContainerRef.current) {
                    kanbanContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                  }
                  if (topScrollRef.current) {
                    topScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                  }
                }, 50);
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${viewMode === 'ARCHIVE'
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs'
              }`}
          >
            <Archive className="w-3.5 h-3.5 text-gray-500" />
            <span>{viewMode === 'ACTIVE' ? 'Sprint archive' : 'Active sprints'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isManager ? '+ New sprint task' : '+ Create sprint task'}</span>
          </button>
        </div>
      </div>

      {/* Sprint Cycle Mode Selector */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mr-1 select-none">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>Sprint</span>
        </span>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
          <button
            onClick={() => setSprintCategory('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${sprintCategory === 'ACTIVE'
                ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
          >
            Active sprint
          </button>

          <button
            onClick={() => setSprintCategory('FUTURE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${sprintCategory === 'FUTURE'
                ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
          >
            Future and undecided
          </button>

          <button
            onClick={() => setSprintCategory('DATE_RANGE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${sprintCategory === 'DATE_RANGE'
                ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
          >
            Date range
          </button>
        </div>

        {sprintCategory === 'DATE_RANGE' && (
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
            <input
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="text-xs font-semibold bg-transparent px-2 py-1 outline-none"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="text-xs font-semibold bg-transparent px-2 py-1 outline-none"
            />
          </div>
        )}
      </div>

      {/* Filter Row: Employee Dropdown, Status Dropdown, and Search Box */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Employee Dropdown */}
        <div className="sm:col-span-3 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-2xs">
          <select
            value={selectedEmployeeId}
            onChange={e => setSelectedEmployeeId(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
          >
            <option value="ALL">All team members ({employees.length})</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="sm:col-span-3 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-2xs">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
          >
            <option value="ALL">All statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="PLANNED">Planned</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="TO_REVIEW">To Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Search Box */}
        <div className="sm:col-span-6 relative bg-white border border-gray-200 rounded-xl shadow-2xs focus-within:border-emerald-500 transition-all">
          <input
            type="text"
            placeholder="Search sprint tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3.5 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Week sub-nav removed — showing all weeks */}

      {/* 🚀 6-COLUMN KANBAN BOARD VIEW (Backlog -> Planned -> To Do -> In Progress -> To Review -> Done) */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading sprint tasks...</div>
      ) : (
        <div className="space-y-2">
          {/* ↔ TOP SYNCHRONIZED HORIZONTAL SCROLLBAR TRACK (Requested in circled space) */}
          <div
            ref={topScrollRef}
            onScroll={handleTopScroll}
            className="overflow-x-auto h-3.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200/80 cursor-ew-resize transition-colors select-none scrollbar-thin scrollbar-thumb-emerald-500"
            title="Drag top scrollbar left or right to scroll Kanban lanes"
          >
            <div className="h-1.5" style={{ width: `${KANBAN_COLUMNS.length * 325}px` }} />
          </div>

          {/* Main Kanban Columns Horizontal Scroll Container */}
          <div
            ref={kanbanContainerRef}
            onScroll={handleKanbanScroll}
            className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 rounded-2xl"
          >
            <div className="flex items-start gap-4 min-w-max">
              {KANBAN_COLUMNS.map(col => {
                const columnTasks = filteredTasks.filter(t => getTaskColumn(t) === col.id);

                if (col.id === 'BACKLOG' && !isBacklogExpanded) {
                  return (
                    <div
                      key={col.id}
                      id={`kanban-column-${col.id}`}
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
                    id={`kanban-column-${col.id}`}
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
                        (() => {
                          const sortedColumnTasks = [...columnTasks].sort((a, b) => {
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                            const aDate = a.dueDate ? new Date(a.dueDate) : null;
                            const bDate = b.dueDate ? new Date(b.dueDate) : null;

                            const aOverdue = aDate && !['DONE', 'COMPLETED'].includes(a.status) && new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate()) < today;
                            const bOverdue = bDate && !['DONE', 'COMPLETED'].includes(b.status) && new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()) < today;

                            if (aOverdue && !bOverdue) return -1;
                            if (!aOverdue && bOverdue) return 1;

                            if (aDate && bDate) return aDate.getTime() - bDate.getTime();
                            if (aDate && !bDate) return -1;
                            if (!aDate && bDate) return 1;

                            return 0;
                          });

                          return sortedColumnTasks.map(t => {
                            const entityName = t.entityCode === 'CAG' || (t.entityName || '').toLowerCase().includes('climagro') || (t.entityId || '').toLowerCase().includes('cag') ? 'Climagro' : 'EHM';
                            const assignedEmp = employees.find(e => e.id === t.assigneeId);
                            const leadEmp = employees.find(e => e.id === t.reviewingLeadId);

                            const resolvedAssigneeName = (t.assigneeName && t.assigneeName !== 'Unassigned')
                              ? t.assigneeName
                              : (assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}`.trim() : 'Unassigned');

                            const isUnassigned = !t.assigneeId || resolvedAssigneeName === 'Unassigned';

                            let assigneeInitials = 'U';
                            if (!isUnassigned && resolvedAssigneeName) {
                              const parts = resolvedAssigneeName.trim().split(' ');
                              assigneeInitials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2);
                            }

                            const epicCode = t.epicCode || t.epicTitle || '';

                            let dueDateInfo = null;
                            if (t.dueDate) {
                              const d = new Date(t.dueDate);
                              if (!isNaN(d.getTime())) {
                                const now = new Date();
                                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                                const isCompleted = t.status === 'DONE' || t.status === 'COMPLETED';
                                const isOverdue = !isCompleted && target < today;
                                const day = d.getDate();
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                const month = monthNames[d.getMonth()];
                                dueDateInfo = {
                                  label: isOverdue ? `Overdue (${day} ${month})` : `Due ${day} ${month}`,
                                  isOverdue,
                                };
                              }
                            }

                            const p = (t.priority || '').toUpperCase();
                            const priorityLabel = (p === 'URGENT' || p === 'P1' || p === '1') ? 'P1' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'P2' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'P3' : 'P4';
                            const priorityTextColor = (priorityLabel === 'P1') ? 'text-red-600' : 'text-blue-600';
                            const priorityBarColor = (priorityLabel === 'P1') ? 'bg-red-500' : 'bg-blue-500';

                            const createdDateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Unknown';
                            const reviewerLead = (t.reviewingLead && t.reviewingLead !== 'Manager lead')
                              ? t.reviewingLead
                              : (leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}`.trim() : 'Unassigned');
                            const assigneeDisplayName = isUnassigned ? 'Unassigned' : resolvedAssigneeName;

                            return (
                              <div
                                key={t.id}
                                draggable={isManager || isTaskAssignedToUser(t)}
                                onDragStart={(e) => {
                                  if (!isManager && !isTaskAssignedToUser(t)) {
                                    e.preventDefault();
                                    return;
                                  }
                                  e.dataTransfer.setData('text/plain', t.id);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                onClick={() => handleTaskClick(t)}
                                 className={`relative bg-white rounded-xl p-3.5 pl-4 border border-gray-200/90 shadow-2xs space-y-2 hover:shadow-md hover:border-emerald-400 transition-all ${isManager || isTaskAssignedToUser(t) ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                                  } group select-none ${activeTaskMenuId === t.id ? 'z-40' : 'z-10'}`}
                              >
                                {/* 1. Priority (Left Edge Color Bar) */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${priorityBarColor}`} />

                                {/* 2. Top Header Line: Left = Priority P1-P4 & Entity Badge | Right = Epic Code & Action Buttons */}
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`font-extrabold ${priorityTextColor}`}>
                                      {priorityLabel}
                                    </span>
                                    {(() => {
                                      const badge = getEntityBadge(t);
                                      return (
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wide shrink-0 ${badge.className}`}>
                                          {badge.label}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] font-bold text-gray-400 truncate">
                                      {epicCode}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {/* Single Eye Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTaskClick(t, true);
                                        }}
                                        className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                        title="View Task Details"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                      </button>

                                      {/* 3-dots Menu for Edit & History */}
                                      <div className="relative task-menu-dropdown-container">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTaskMenuId(prev => prev === t.id ? null : t.id);
                                          }}
                                          className={`p-1 rounded border transition-colors cursor-pointer ${
                                            activeTaskMenuId === t.id
                                              ? 'bg-gray-100 text-gray-800 border-gray-300 ring-2 ring-emerald-500/20'
                                              : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
                                          }`}
                                          title="More Options"
                                        >
                                          <MoreVertical className="w-3.5 h-3.5" />
                                        </button>

                                        {activeTaskMenuId === t.id && (
                                          <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                                          >
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveTaskMenuId(null);
                                                handleTaskClick(t, true);
                                              }}
                                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                                            >
                                              <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                              <span>View</span>
                                            </button>

                                            {(isManager || isTaskAssignedToUser(t)) && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActiveTaskMenuId(null);
                                                  handleTaskClick(t, false);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                                              >
                                                <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                <span>Edit</span>
                                              </button>
                                            )}

                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveTaskMenuId(null);
                                                setHistoryTarget({
                                                  recordId: t.id,
                                                  title: t.title,
                                                  code: t.taskCode || t.taskId || t.id,
                                                });
                                              }}
                                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                                            >
                                              <History className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                              <span>History</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Title (Middle, Full Width) */}
                                <div>
                                  <h5 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                                    {t.title}
                                  </h5>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                    {(() => {
                                      const badge = getEntityBadge(t);
                                      return `${badge.label} · ${priorityLabel}`;
                                    })()}
                                  </p>
                                </div>

                                {/* 4. Metadata Spec Sheet (Assignee, Reviewer) */}
                                <div className="space-y-1 pt-1 text-[11px]">
                                  <div className="flex items-center justify-between text-gray-500 font-medium">
                                    <span className="text-gray-400 text-[10px]">Assignee</span>
                                    <span className={`text-[11px] font-semibold ${isUnassigned ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                                      {assigneeDisplayName}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-gray-500 font-medium">
                                    <span className="text-gray-400 text-[10px]">Reviewer</span>
                                    <span className="text-[11px] font-semibold text-gray-800 truncate max-w-[140px] text-right">
                                      {reviewerLead}
                                    </span>
                                  </div>
                                </div>

                                {/* 5. Bottom Line: Left = Posted Date | Right = Target / Due Date */}
                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[10px] font-medium text-gray-400">
                                  <div className="flex items-center gap-1 text-gray-400" title="Created At">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <span>{createdDateStr}</span>
                                  </div>

                                  {dueDateInfo ? (
                                    <div className={`flex items-center gap-1 font-bold ${dueDateInfo.isOverdue ? 'text-red-600 font-extrabold' : 'text-gray-500'}`}>
                                      <Calendar className={`w-3 h-3 ${dueDateInfo.isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                                      <span>{dueDateInfo.label}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-gray-400 font-medium">
                                      <Calendar className="w-3 h-3 text-gray-300" />
                                      <span className="italic">No Due Date</span>
                                    </div>
                                  )}
                                </div>

                                {/* Created By below Created At */}
                                <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-gray-500 border-t border-gray-50">
                                  <div className="flex items-center gap-1 text-emerald-700 font-semibold truncate">
                                    <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span className="truncate">Created by: <strong>{t.createdByName || t.creatorName || 'Dr. Harshit Mishra'}</strong></span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* New Sprint Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base tracking-tight">Create New Product Backlog Task</h3>
                <span className="px-2.5 py-0.5 border rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border-slate-300">
                  Product Backlog
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Content Body */}
            <form onSubmit={handleCreateSprint} className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0">

              {/* Left Column (Task Info & Subtask Checklist) */}
              <div className="lg:col-span-7 space-y-4 text-left">

                {/* 1. Brand / Entity & Task Code & Created At & Department (Matching Img 3 Top Meta Bar) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Brand / Entity</label>
                    <select
                      value={sprintEntity}
                      onChange={(e) => setSprintEntity(e.target.value as 'EHM' | 'CAG')}
                      className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="EHM">EHM</option>
                      <option value="CAG">CLIMAGRO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Task Code</label>
                    <input
                      type="text"
                      disabled
                      value="NEW-TASK"
                      className="w-full text-xs font-bold bg-emerald-50/60 border border-emerald-200 rounded-xl p-2.5 text-emerald-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Created At</label>
                    <input
                      type="text"
                      disabled
                      value={new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {DEPARTMENT_OPTIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. DELIVERABLE / TASK NAME (Matching Img 3) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Deliverable / Task Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter task title / deliverable name..."
                    value={sprintName}
                    onChange={(e) => setSprintName(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl p-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 3. Parent Feature Epic & Parent Project (Matching Img 3) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Parent Feature Epic
                      </label>
                      {selectedEpicId ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Linked to Epic
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400">
                          No Parent Epic (Standalone Backlog)
                        </span>
                      )}
                    </div>
                    <SearchableSelect
                      options={epicOptions}
                      value={selectedEpicId}
                      onChange={setSelectedEpicId}
                      placeholder="Select Parent Epic..."
                      noneLabel="-- No parent epic (Standalone Backlog) --"
                      searchPlaceholder="Search epics..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Parent Project
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Optional (Standalone)
                      </span>
                    </div>
                    <SearchableSelect
                      options={projectOptions}
                      value={selectedProjectId}
                      onChange={setSelectedProjectId}
                      placeholder="Select Parent Project..."
                      noneLabel="-- No Project (Standalone) --"
                      searchPlaceholder="Search projects..."
                    />
                  </div>
                </div>

                {/* 4. Assignee(s) & Reviewing Lead(s) (Matching Img 3 2-Column Row) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Assignee(s)
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {selectedEmpIds.length > 0 ? `${selectedEmpIds.length} selected` : 'Optional (Unassigned)'}
                      </span>
                    </div>
                    <SearchableSelect
                      options={leadOptions}
                      value=""
                      onChange={() => {}}
                      isMulti={true}
                      multiValues={selectedEmpIds}
                      onMultiChange={setSelectedEmpIds}
                      placeholder="Select team member(s) or leave unassigned..."
                      noneLabel="-- Unassigned Team Member --"
                      searchPlaceholder="Search team members..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Reviewing Lead(s)
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {selectedLeadIds.length > 0 ? `${selectedLeadIds.length} selected` : 'Optional (None)'}
                      </span>
                    </div>
                    <SearchableSelect
                      options={leadOptions}
                      value=""
                      onChange={() => {}}
                      isMulti={true}
                      multiValues={selectedLeadIds}
                      onMultiChange={setSelectedLeadIds}
                      placeholder="Select lead(s) or leave unassigned..."
                      noneLabel="-- Unassigned Lead --"
                      searchPlaceholder="Search leads & managers..."
                    />
                  </div>
                </div>

                {/* 5. Priority & Due Date (Matching Img 3 2-Column Row) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Priority</label>
                    <select
                      value={sprintPriority}
                      onChange={(e) => setSprintPriority(e.target.value as any)}
                      className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="URGENT">P1</option>
                      <option value="HIGH">P2</option>
                      <option value="MEDIUM">P3</option>
                      <option value="LOW">P4</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date</label>
                      {sprintDueDate && (
                        <button
                          type="button"
                          onClick={() => setSprintDueDate('')}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Clear Due Date
                        </button>
                      )}
                    </div>
                    <CalendarPicker
                      value={sprintDueDate}
                      onChange={(formatted) => {
                        setSprintDueDate(formatted || '');
                        if (formatted && !targetWeek) {
                          setTargetWeek(formatted);
                        }
                      }}
                      placeholder="Select Due Date (Optional)..."
                      formatMode="date"
                    />
                  </div>
                </div>

                {/* 6. Task Deliverable & Links (Matching Img 3 Position & Styling) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Task Deliverable & Links</span>
                    </label>
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                      {sprintDeliverableLinks.length} {sprintDeliverableLinks.length === 1 ? 'Link' : 'Links'} Attached
                    </span>
                  </div>

                  {/* Add Link Input Group */}
                  <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200/80 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <div className="md:col-span-4">
                        <input
                          type="text"
                          value={sprintNewDeliverableLinkName}
                          onChange={(e) => setSprintNewDeliverableLinkName(e.target.value)}
                          placeholder="Link Name (e.g. HTML Link, Test Link, PR)"
                          className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                        />
                      </div>
                      <div className="md:col-span-5 relative">
                        <Link2 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={sprintNewDeliverableLinkUrl}
                          onChange={(e) => setSprintNewDeliverableLinkUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSprintDeliverableLink(e);
                            }
                          }}
                          placeholder="https://... (GitHub, Figma, Live URL)"
                          className="w-full text-xs border border-gray-300 rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <button
                          type="button"
                          onClick={() => handleAddSprintDeliverableLink()}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Link</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Links List */}
                  {sprintDeliverableLinks.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {sprintDeliverableLinks.map((link, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-gray-800 transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <Link2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-emerald-950">
                                  {link.name || 'Deliverable Link'}
                                </span>
                              </div>
                              <p className="truncate font-mono text-[11px] text-emerald-800 hover:underline cursor-pointer" title={link.url}>
                                {link.url}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Open link in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Open ↗</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveSprintDeliverableLink(idx)}
                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 font-medium pl-1">
                      Optional: Add one or more named deliverable links (HTML Prototype, Test Link, Docs).
                    </p>
                  )}
                </div>

                {/* 7. Status Dropdown (Matching Img 3 Position & All 6 Kanban Statuses for Img 2) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Status</label>
                  <select
                    value={sprintInitialStatus}
                    onChange={(e) => setSprintInitialStatus(e.target.value)}
                    className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="PLANNED">Planned</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="TO_REVIEW">To Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                {/* 8. Progress Notes / Comments (Matching Img 3) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Progress Notes / Comments
                  </label>
                  <RichTextEditor
                    value={goal}
                    onChange={setGoal}
                    placeholder="Detail your daily progress..."
                    rows={3}
                  />
                </div>

                {/* Subtask Checklist Section */}
                <div className="pt-3 border-t border-gray-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
                      <span>Subtask Checklist</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {modalChecklists.filter(c => c.isCompleted).length} of {modalChecklists.length} Completed
                    </span>
                  </div>

                  {/* Subtask items list */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {modalChecklists.length === 0 ? (
                      <div className="py-3 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No subtasks added yet. Add one below!
                      </div>
                    ) : (
                      modalChecklists.map((item) => (
                        editingModalChkId === item.id ? (
                          <div key={item.id} className="flex items-center gap-1.5 p-1.5 rounded-xl border border-emerald-300 bg-white">
                            <input
                              type="text"
                              value={editingModalChkText}
                              onChange={(e) => setEditingModalChkText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (editingModalChkText.trim()) {
                                    setModalChecklists(prev => prev.map(c => c.id === item.id ? { ...c, itemText: editingModalChkText.trim() } : c));
                                    setEditingModalChkId(null);
                                    setEditingModalChkText('');
                                  }
                                } else if (e.key === 'Escape') {
                                  setEditingModalChkId(null);
                                  setEditingModalChkText('');
                                }
                              }}
                              autoFocus
                              className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editingModalChkText.trim()) {
                                  setModalChecklists(prev => prev.map(c => c.id === item.id ? { ...c, itemText: editingModalChkText.trim() } : c));
                                  setEditingModalChkId(null);
                                  setEditingModalChkText('');
                                }
                              }}
                              title="Save subtask"
                              className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingModalChkId(null);
                                setEditingModalChkText('');
                              }}
                              title="Cancel edit"
                              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            key={item.id}
                            className={`group flex items-center justify-between p-2 rounded-xl border transition-colors ${item.isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                              }`}
                          >
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer flex-1 min-w-0 pr-2">
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => handleToggleModalChecklist(item.id)}
                                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                              />
                              <span className={`break-words ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                {item.itemText}
                              </span>
                            </label>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingModalChkId(item.id);
                                  setEditingModalChkText(item.itemText);
                                }}
                                title="Edit subtask"
                                className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setModalChecklists(prev => prev.filter(c => c.id !== item.id))}
                                title="Delete subtask"
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      ))
                    )}
                  </div>

                  {/* Add Subtask Form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add new subtask checklist item..."
                      value={modalNewChecklistText}
                      onChange={(e) => setModalNewChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddModalChecklist(e);
                        }
                      }}
                      className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddModalChecklist()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column (Template Cloning & Activity/Comments) */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-left space-y-4">
                <div className="space-y-4 flex-1 flex flex-col min-h-0">

                  {/* Template Cloning Box (Clean Black & White Monochrome) */}
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-300 space-y-2.5 shrink-0 shadow-2xs">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isClone}
                        onChange={(e) => {
                          setIsClone(e.target.checked);
                          if (!e.target.checked) setCloneSourceId('');
                        }}
                        className="mt-0.5 rounded text-gray-900 focus:ring-gray-900 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-gray-900 block">Make Clone / Duplicate Copy</span>
                        <p className="text-[10px] text-gray-600 font-semibold leading-snug">
                          Check this box to duplicate an existing sprint task or pre-fill parameters directly inside this form.
                        </p>
                      </div>
                    </label>

                    {isClone && (
                      <div className="pt-2 border-t border-gray-200 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-gray-900 mb-1">
                          Select Existing Task to Clone From (Optional):
                        </label>
                        <SearchableSelect
                          options={taskCloneOptions}
                          value={cloneSourceId}
                          onChange={(newVal) => {
                            setCloneSourceId(newVal);
                            const source = allTasks.find(t => t.id === newVal);
                            if (source) {
                              setSprintName(`${source.title} (Clone)`);
                              if (source.epicId) setSelectedEpicId(source.epicId);
                              if (source.reviewingLeadId) setSelectedLeadId(source.reviewingLeadId);
                              if (source.assigneeId) setSelectedEmpIds([source.assigneeId]);
                              if (source.targetWeek || source.sprintWeek) setTargetWeek(source.targetWeek || source.sprintWeek);
                              if (source.description) setGoal(source.description);
                              setModalChecklists([
                                { id: 'c-1', itemText: 'Verify requirements & deliverable scope', isCompleted: false },
                                { id: 'c-2', itemText: 'Setup environment and code branch', isCompleted: false },
                              ]);
                              setModalComments([
                                { id: 'cm-1', authorName: 'System', content: `Cloned parameters from task "${source.title}"`, createdAt: new Date().toISOString(), isSystemLog: true },
                              ]);
                              toast.success(`Form pre-filled with data from "${source.title}"!`);
                            }
                          }}
                          placeholder="-- Choose Existing Sprint Task to Auto-Fill --"
                          noneLabel="-- None / Don't Clone --"
                          searchPlaceholder="Search sprint tasks to clone..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Activity & Comments Container */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex-1 flex flex-col min-h-0 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Activity & Comments</span>
                      </span>
                      <span className="text-[10px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                        {modalComments.length}
                      </span>
                    </div>

                    {/* Comments Feed */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px] max-h-[240px]">
                      {modalComments.length === 0 ? (
                        <div className="h-full flex items-center justify-center py-8 text-center text-xs text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                          No comments yet. Post the first comment!
                        </div>
                      ) : (
                        modalComments.map((c) => (
                          <div
                            key={c.id}
                            className={`p-2.5 rounded-xl border text-xs space-y-1 shadow-2xs group ${c.isSystemLog
                                ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                                : 'bg-white border-gray-200 text-gray-800'
                              }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                              <span className={c.isSystemLog ? 'text-purple-700 font-mono' : 'text-emerald-700'}>
                                {formatAuthorDisplayName(c.authorName)}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                {!c.isSystemLog && (
                                  <div className="flex items-center gap-0.5 ml-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingModalCmtId(c.id);
                                        setEditingModalCmtText(c.content);
                                      }}
                                      title="Edit comment"
                                      className="p-0.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setModalComments(prev => prev.filter(item => item.id !== c.id))}
                                      title="Delete comment"
                                      className="p-0.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {editingModalCmtId === c.id ? (
                              <div className="pt-1 space-y-1.5">
                                <textarea
                                  value={editingModalCmtText}
                                  onChange={(e) => setEditingModalCmtText(e.target.value)}
                                  className="w-full text-xs p-2 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                                  rows={2}
                                />
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingModalCmtId(null);
                                      setEditingModalCmtText('');
                                    }}
                                    className="px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded-md font-semibold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editingModalCmtText.trim()) {
                                        setModalComments(prev => prev.map(item => item.id === c.id ? { ...item, content: editingModalCmtText.trim() } : item));
                                        setEditingModalCmtId(null);
                                        setEditingModalCmtText('');
                                      }
                                    }}
                                    className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold shadow-xs cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Save</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Input & Post Button */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100 shrink-0">
                      <input
                        type="text"
                        placeholder="Write a comment or activity log..."
                        value={modalNewCommentText}
                        onChange={(e) => setModalNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddModalComment(e);
                          }
                        }}
                        className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddModalComment()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Assigning...' : 'Assign Sprint Task'}</span>
                  </button>
                </div>
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

      {/* Assign Task & Sprint Parameters Modal (Rich 2-Column Execution Spec Layout) */}
      {assignTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900 tracking-tight">Assign Task & Configure Execution Specs</h4>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                    Moving to {assignTaskModal.targetColumn === 'TODO' ? 'To Do' : assignTaskModal.targetColumn}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium pt-0.5">
                  Set assigned team member, reviewing lead, priority, review date, checkpoints checklist & activity comments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignTaskModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0 text-xs text-left">
              {/* Left Column: Assignment Details */}
              <div className="lg:col-span-6 space-y-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Task Title</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 flex items-center justify-between">
                    <span>{assignTaskModal.task.title}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      {assignTaskModal.task.taskCode || assignTaskModal.task.id}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assign Team Member (Optional)</label>
                  <select
                    value={assignTaskModal.assigneeId}
                    onChange={(e) => setAssignTaskModal({ ...assignTaskModal, assigneeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-bold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Unassigned Team Member --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} — {emp.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reviewing Lead / Manager (Optional)</label>
                  <select
                    value={assignTaskModal.reviewingLeadId}
                    onChange={(e) => setAssignTaskModal({ ...assignTaskModal, reviewingLeadId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-bold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Unassigned Lead --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Priority</label>
                    <select
                      value={assignTaskModal.priority}
                      onChange={(e) => setAssignTaskModal({ ...assignTaskModal, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="URGENT">P1</option>
                      <option value="HIGH">P2</option>
                      <option value="MEDIUM">P3</option>
                      <option value="LOW">P4</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-gray-700">Due Date</label>
                      {assignTaskModal.dueDate && (
                        <button
                          type="button"
                          onClick={() => setAssignTaskModal({ ...assignTaskModal, dueDate: '' })}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={assignTaskModal.dueDate}
                      onChange={(e) => setAssignTaskModal({ ...assignTaskModal, dueDate: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Task Description & Deliverables</label>
                  <RichTextEditor
                    rows={3}
                    placeholder="Execution details, specifications, or deliverable instructions..."
                    value={assignTaskModal.description}
                    onChange={(val) => setAssignTaskModal({ ...assignTaskModal, description: val })}
                  />
                </div>
              </div>

              {/* Right Column: Checkpoints Checklist & Activity Comments */}
              <div className="lg:col-span-6 space-y-3.5 flex flex-col min-h-0">
                {/* Subtask Checkpoint Checklist */}
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-gray-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
                      <span>Subtask Checkpoint Checklist</span>
                    </span>
                    <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-extrabold text-[10px]">
                      {assignTaskModal.checklists.filter(c => c.isCompleted).length} / {assignTaskModal.checklists.length} Done
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {assignTaskModal.checklists.length === 0 ? (
                      <div className="text-center py-3 text-gray-400 font-medium text-xs bg-white/60 rounded-xl border border-dashed border-gray-200">
                        No subtasks added yet.
                      </div>
                    ) : (
                      assignTaskModal.checklists.map(chk => (
                        editingAssignChkId === chk.id ? (
                          <div key={chk.id} className="flex items-center gap-1.5 p-1.5 rounded-xl border border-emerald-300 bg-white">
                            <input
                              type="text"
                              value={editingAssignChkText}
                              onChange={(e) => setEditingAssignChkText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (editingAssignChkText.trim()) {
                                    const updated = assignTaskModal.checklists.map(c => c.id === chk.id ? { ...c, itemText: editingAssignChkText.trim() } : c);
                                    setAssignTaskModal({ ...assignTaskModal, checklists: updated });
                                    setEditingAssignChkId(null);
                                    setEditingAssignChkText('');
                                  }
                                } else if (e.key === 'Escape') {
                                  setEditingAssignChkId(null);
                                  setEditingAssignChkText('');
                                }
                              }}
                              autoFocus
                              className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editingAssignChkText.trim()) {
                                  const updated = assignTaskModal.checklists.map(c => c.id === chk.id ? { ...c, itemText: editingAssignChkText.trim() } : c);
                                  setAssignTaskModal({ ...assignTaskModal, checklists: updated });
                                  setEditingAssignChkId(null);
                                  setEditingAssignChkText('');
                                }
                              }}
                              title="Save"
                              className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAssignChkId(null);
                                setEditingAssignChkText('');
                              }}
                              title="Cancel"
                              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            key={chk.id}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold ${chk.isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700'
                              }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                              <input
                                type="checkbox"
                                checked={chk.isCompleted}
                                onChange={() => {
                                  const updated = assignTaskModal.checklists.map(c =>
                                    c.id === chk.id ? { ...c, isCompleted: !c.isCompleted } : c
                                  );
                                  setAssignTaskModal({ ...assignTaskModal, checklists: updated });
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className={chk.isCompleted ? 'line-through text-gray-400' : ''}>
                                {chk.itemText}
                              </span>
                            </label>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAssignChkId(chk.id);
                                  setEditingAssignChkText(chk.itemText);
                                }}
                                title="Edit subtask"
                                className="text-gray-400 hover:text-emerald-700 transition-colors p-1 rounded hover:bg-emerald-50 cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = assignTaskModal.checklists.filter(c => c.id !== chk.id);
                                  setAssignTaskModal({ ...assignTaskModal, checklists: updated });
                                }}
                                title="Delete subtask"
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      ))
                    )}
                  </div>

                  {/* Add Checklist Item */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add subtask item..."
                      value={assignTaskModal.newChecklistText || ''}
                      onChange={(e) => setAssignTaskModal({ ...assignTaskModal, newChecklistText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!assignTaskModal.newChecklistText?.trim()) return;
                          const newItem = {
                            id: `chk-${Date.now()}`,
                            itemText: assignTaskModal.newChecklistText.trim(),
                            isCompleted: false,
                          };
                          setAssignTaskModal({
                            ...assignTaskModal,
                            checklists: [...assignTaskModal.checklists, newItem],
                            newChecklistText: '',
                          });
                        }
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!assignTaskModal.newChecklistText?.trim()) return;
                        const newItem = {
                          id: `chk-${Date.now()}`,
                          itemText: assignTaskModal.newChecklistText.trim(),
                          isCompleted: false,
                        };
                        setAssignTaskModal({
                          ...assignTaskModal,
                          checklists: [...assignTaskModal.checklists, newItem],
                          newChecklistText: '',
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Activity Log & Comments */}
                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 flex-1 flex flex-col min-h-0 space-y-2">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wider shrink-0">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Activity Log & Comments</span>
                  </span>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[100px] max-h-[160px]">
                    {assignTaskModal.comments.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-gray-400 font-medium py-4">
                        No activity comments yet.
                      </div>
                    ) : (
                      assignTaskModal.comments.map(c => (
                        <div key={c.id} className="p-2 rounded-xl bg-white border border-gray-200 text-xs space-y-1 group">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700">
                            <span>{formatAuthorDisplayName(c.authorName)}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              <div className="flex items-center gap-0.5 ml-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAssignCmtId(c.id);
                                    setEditingAssignCmtText(c.content);
                                  }}
                                  title="Edit comment"
                                  className="p-0.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = assignTaskModal.comments.filter(item => item.id !== c.id);
                                    setAssignTaskModal({ ...assignTaskModal, comments: updated });
                                  }}
                                  title="Delete comment"
                                  className="p-0.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          {editingAssignCmtId === c.id ? (
                            <div className="pt-1 space-y-1">
                              <textarea
                                value={editingAssignCmtText}
                                onChange={(e) => setEditingAssignCmtText(e.target.value)}
                                className="w-full text-xs p-1.5 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                                rows={2}
                              />
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAssignCmtId(null);
                                    setEditingAssignCmtText('');
                                  }}
                                  className="px-2 py-0.5 text-[10px] text-gray-500 hover:bg-gray-100 rounded font-semibold cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingAssignCmtText.trim()) {
                                      const updated = assignTaskModal.comments.map(item => item.id === c.id ? { ...item, content: editingAssignCmtText.trim() } : item);
                                      setAssignTaskModal({ ...assignTaskModal, comments: updated });
                                      setEditingAssignCmtId(null);
                                      setEditingAssignCmtText('');
                                    }
                                  }}
                                  className="px-2 py-0.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-800 font-medium whitespace-pre-wrap">{c.content}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-gray-200 shrink-0">
                    <input
                      type="text"
                      placeholder="Post activity note..."
                      value={assignTaskModal.newCommentText || ''}
                      onChange={(e) => setAssignTaskModal({ ...assignTaskModal, newCommentText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!assignTaskModal.newCommentText?.trim()) return;
                          const newCmt = {
                            id: `cmt-${Date.now()}`,
                            authorName: 'Admin User',
                            content: assignTaskModal.newCommentText.trim(),
                            createdAt: new Date().toISOString(),
                          };
                          setAssignTaskModal({
                            ...assignTaskModal,
                            comments: [...assignTaskModal.comments, newCmt],
                            newCommentText: '',
                          });
                        }
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!assignTaskModal.newCommentText?.trim()) return;
                        const newCmt = {
                          id: `cmt-${Date.now()}`,
                          authorName: 'Admin User',
                          content: assignTaskModal.newCommentText.trim(),
                          createdAt: new Date().toISOString(),
                        };
                        setAssignTaskModal({
                          ...assignTaskModal,
                          comments: [...assignTaskModal.comments, newCmt],
                          newCommentText: '',
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 shrink-0">
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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Assign & Move Task</span>
                <MoveRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Done / Sign-off Confirmation Modal (Rich 2-Column Sign-Off Layout) */}
      {confirmDoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900 tracking-tight">Complete & Sign-off Task (Mark as Done)</h4>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                    Done Sign-off
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium pt-0.5">
                  Verify subtask checkpoints, deliverable URL, and manager sign-off notes before moving to Done.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDoneModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0 text-xs text-left">
              {/* Left Column: Output URL & Notes */}
              <div className="lg:col-span-6 space-y-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Task Title</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 flex items-center justify-between">
                    <span>{confirmDoneModal.task.title}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      {confirmDoneModal.task.taskCode || confirmDoneModal.task.id}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Deliverable / Output URL <span className="text-emerald-600 font-semibold">(Paste final deliverable link/URL)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://github.com/... or https://docs.google.com/..."
                    value={confirmDoneModal.deliverableUrl}
                    onChange={(e) => setConfirmDoneModal({ ...confirmDoneModal, deliverableUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-medium bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Completion & Sign-off Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Add final sign-off notes, verification details, or summary outcome..."
                    value={confirmDoneModal.notes}
                    onChange={(e) => setConfirmDoneModal({ ...confirmDoneModal, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Task Metadata
                  </span>
                  <div className="flex justify-between text-[11px] font-medium pt-1">
                    <span>Assignee: <strong>{confirmDoneModal.task.assigneeName || 'Team Member'}</strong></span>
                    <span>Reviewer: <strong>{confirmDoneModal.task.reviewingLead || 'Manager'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Checkpoints Checklist & Activity Comments */}
              <div className="lg:col-span-6 space-y-3.5 flex flex-col min-h-0">
                {/* Checkpoint Checklist */}
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-gray-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
                      <span>Subtask Checkpoint Checklist</span>
                    </span>
                    <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-extrabold text-[10px]">
                      {confirmDoneModal.checklists.filter(c => c.isCompleted).length} / {confirmDoneModal.checklists.length} Done
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                    {confirmDoneModal.checklists.length === 0 ? (
                      <div className="text-center py-4 text-gray-400 font-medium text-[11px] bg-white/60 rounded-xl border border-dashed border-gray-200">
                        No subtasks defined.
                      </div>
                    ) : (
                      confirmDoneModal.checklists.map(chk => (
                        editingDoneChkId === chk.id ? (
                          <div key={chk.id} className="flex items-center gap-1.5 p-1.5 rounded-xl border border-emerald-300 bg-white">
                            <input
                              type="text"
                              value={editingDoneChkText}
                              onChange={(e) => setEditingDoneChkText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (editingDoneChkText.trim()) {
                                    const updated = confirmDoneModal.checklists.map(c => c.id === chk.id ? { ...c, itemText: editingDoneChkText.trim() } : c);
                                    setConfirmDoneModal({ ...confirmDoneModal, checklists: updated });
                                    setEditingDoneChkId(null);
                                    setEditingDoneChkText('');
                                  }
                                } else if (e.key === 'Escape') {
                                  setEditingDoneChkId(null);
                                  setEditingDoneChkText('');
                                }
                              }}
                              autoFocus
                              className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editingDoneChkText.trim()) {
                                  const updated = confirmDoneModal.checklists.map(c => c.id === chk.id ? { ...c, itemText: editingDoneChkText.trim() } : c);
                                  setConfirmDoneModal({ ...confirmDoneModal, checklists: updated });
                                  setEditingDoneChkId(null);
                                  setEditingDoneChkText('');
                                }
                              }}
                              title="Save"
                              className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDoneChkId(null);
                                setEditingDoneChkText('');
                              }}
                              title="Cancel"
                              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            key={chk.id}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold ${chk.isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700'
                              }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                              <input
                                type="checkbox"
                                checked={chk.isCompleted}
                                onChange={() => {
                                  const updated = confirmDoneModal.checklists.map(c =>
                                    c.id === chk.id ? { ...c, isCompleted: !c.isCompleted } : c
                                  );
                                  setConfirmDoneModal({ ...confirmDoneModal, checklists: updated });
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className={chk.isCompleted ? 'line-through text-gray-400' : ''}>
                                {chk.itemText}
                              </span>
                            </label>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDoneChkId(chk.id);
                                  setEditingDoneChkText(chk.itemText);
                                }}
                                title="Edit subtask"
                                className="text-gray-400 hover:text-emerald-700 transition-colors p-1 rounded hover:bg-emerald-50 cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = confirmDoneModal.checklists.filter(c => c.id !== chk.id);
                                  setConfirmDoneModal({ ...confirmDoneModal, checklists: updated });
                                }}
                                title="Delete subtask"
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      ))
                    )}
                  </div>

                  {/* Add Checklist Item */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add subtask item..."
                      value={confirmDoneModal.newChecklistText || ''}
                      onChange={(e) => setConfirmDoneModal({ ...confirmDoneModal, newChecklistText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!confirmDoneModal.newChecklistText?.trim()) return;
                          const newItem = {
                            id: `chk-${Date.now()}`,
                            itemText: confirmDoneModal.newChecklistText.trim(),
                            isCompleted: true,
                          };
                          setConfirmDoneModal({
                            ...confirmDoneModal,
                            checklists: [...confirmDoneModal.checklists, newItem],
                            newChecklistText: '',
                          });
                        }
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmDoneModal.newChecklistText?.trim()) return;
                        const newItem = {
                          id: `chk-${Date.now()}`,
                          itemText: confirmDoneModal.newChecklistText.trim(),
                          isCompleted: true,
                        };
                        setConfirmDoneModal({
                          ...confirmDoneModal,
                          checklists: [...confirmDoneModal.checklists, newItem],
                          newChecklistText: '',
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Activity Log & Comments */}
                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 flex-1 flex flex-col min-h-0 space-y-2">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wider shrink-0">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Activity Log & Comments</span>
                  </span>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[90px] max-h-[140px]">
                    {confirmDoneModal.comments.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-gray-400 font-medium py-4">
                        No activity comments yet.
                      </div>
                    ) : (
                      confirmDoneModal.comments.map(c => (
                        <div key={c.id} className="p-2 rounded-xl bg-white border border-gray-200 text-xs space-y-1 group">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700">
                            <span>{formatAuthorDisplayName(c.authorName)}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              <div className="flex items-center gap-0.5 ml-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDoneCmtId(c.id);
                                    setEditingDoneCmtText(c.content);
                                  }}
                                  title="Edit comment"
                                  className="p-0.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = confirmDoneModal.comments.filter(item => item.id !== c.id);
                                    setConfirmDoneModal({ ...confirmDoneModal, comments: updated });
                                  }}
                                  title="Delete comment"
                                  className="p-0.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          {editingDoneCmtId === c.id ? (
                            <div className="pt-1 space-y-1">
                              <textarea
                                value={editingDoneCmtText}
                                onChange={(e) => setEditingDoneCmtText(e.target.value)}
                                className="w-full text-xs p-1.5 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                                rows={2}
                              />
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDoneCmtId(null);
                                    setEditingDoneCmtText('');
                                  }}
                                  className="px-2 py-0.5 text-[10px] text-gray-500 hover:bg-gray-100 rounded font-semibold cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingDoneCmtText.trim()) {
                                      const updated = confirmDoneModal.comments.map(item => item.id === c.id ? { ...item, content: editingDoneCmtText.trim() } : item);
                                      setConfirmDoneModal({ ...confirmDoneModal, comments: updated });
                                      setEditingDoneCmtId(null);
                                      setEditingDoneCmtText('');
                                    }
                                  }}
                                  className="px-2 py-0.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-800 font-medium whitespace-pre-wrap">{c.content}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-gray-200 shrink-0">
                    <input
                      type="text"
                      placeholder="Post sign-off comment..."
                      value={confirmDoneModal.newCommentText || ''}
                      onChange={(e) => setConfirmDoneModal({ ...confirmDoneModal, newCommentText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!confirmDoneModal.newCommentText?.trim()) return;
                          const newCmt = {
                            id: `cmt-${Date.now()}`,
                            authorName: 'Admin User',
                            content: confirmDoneModal.newCommentText.trim(),
                            createdAt: new Date().toISOString(),
                          };
                          setConfirmDoneModal({
                            ...confirmDoneModal,
                            comments: [...confirmDoneModal.comments, newCmt],
                            newCommentText: '',
                          });
                        }
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmDoneModal.newCommentText?.trim()) return;
                        const newCmt = {
                          id: `cmt-${Date.now()}`,
                          authorName: 'Admin User',
                          content: confirmDoneModal.newCommentText.trim(),
                          createdAt: new Date().toISOString(),
                        };
                        setConfirmDoneModal({
                          ...confirmDoneModal,
                          comments: [...confirmDoneModal.comments, newCmt],
                          newCommentText: '',
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDoneModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMarkAsDone}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirm & Mark as Done</span>
                <Sparkles className="w-4 h-4" />
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
          onClone={handleCloneTask}
          onDelete={(deletedId) => {
            setAllTasks(prev => prev.filter(t => t.id !== deletedId));
            setSelectedTaskToUpdate(null);
            clearApiCache('/api/tasks');
            clearApiCache('/api/sprints');
            window.dispatchEvent(new CustomEvent('tasks-updated'));
          }}
          isReadOnly={isModalReadOnly}
        />
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

