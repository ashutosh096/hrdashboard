import React, { useState, useEffect, useRef } from 'react';
import { Plus, Layers, Calendar, ArrowRight, ListTodo, Tag, Zap, Eye, Edit3, X, CheckCircle2, User, Search, Filter, Table, Building2, Archive, RotateCcw, Pencil, Clock, Target, BarChart3, ChevronRight, ChevronDown, Trash2, History, UserCheck, MoreVertical } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { getAvatarByName } from '../utils/avatars';
import { toast } from 'sonner';
import { MarkdownViewer } from './MarkdownViewer';
import { RichTextEditor } from './RichTextEditor';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { TaskAssignModal } from './TaskAssignModal';
import { CalendarPicker } from './CalendarPicker';
import { SearchableSelect } from './SearchableSelect';
import { RecordHistoryPanel } from './RecordHistoryPanel';
import { RecentActivitySection } from './RecentActivitySection';
import { formatDateTime } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';

interface EpicItem {
  id: string;
  epicCode: string;
  title: string;
  description: string;
  status: string;
  entityId?: string | null;
  entity?: string | null;
  entityCode?: string | null;
  entityName?: string | null;
  initiativeId?: string | null;
  projectId?: string | null;
  department?: string | null;
  targetWeek?: string | null;
  sprintsCountTarget?: number;
  targetDate: string | null;
  createdById?: string | null;
  createdByName?: string | null;
  assignedTo?: string[] | null;
  createdAt?: string;
  sprintsCount: number;
  tasksCount: number;
  sprints: any[];
  tasks: any[];
}

interface InitiativeOption {
  id: string;
  initiativeCode: string;
  title: string;
  entityCode?: string;
  entity?: string;
}

interface ProjectOption {
  id: string;
  code: string;
  name: string;
  entity: string;
}

interface Props {
  isManager: boolean;
  onSelectSprint?: (sprintId: string) => void;
  onSelectInitiative?: (initiativeId: string) => void;
  selectedEpicIdToView?: string | null;
  onClearSelectedEpic?: () => void;
}

const DEPARTMENT_OPTIONS = [
  'Marketing',
  'Sales',
  'Product & Tech',
  'Operations & Delivery',
  'Grants & Governance',
];

const TARGET_WEEK_OPTIONS = [
  'Week 1 (Days 1–7)',
  'Week 2 (Days 8–14)',
  'Week 3 (Days 15–21)',
  'Week 4 (Days 22–28)',
];

export const EpicsSubView: React.FC<Props> = ({ isManager, onSelectSprint, onSelectInitiative, selectedEpicIdToView, onClearSelectedEpic }) => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const isAdmin = user?.role === 'ADMIN';
  const [epics, setEpics] = useState<EpicItem[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteInitiativeConfirm, setShowDeleteInitiativeConfirm] = useState(false);
  const [isDeletingInitiative, setIsDeletingInitiative] = useState(false);
  const [initiatives, setInitiatives] = useState<InitiativeOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: Active vs Archive Mode
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');

  // Scalable Filter & Search Toolbar State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [collapsedEpicIds, setCollapsedEpicIds] = useState<Record<string, boolean>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close 3-dots dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenuId && !(e.target as HTMLElement).closest('.epic-action-menu')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  // New Epic Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createEntity, setCreateEntity] = useState<'EHM' | 'CAG' | 'COMMON'>('EHM');
  const [selectedInitiativeId, setSelectedInitiativeId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Product & Tech');
  const [targetWeek, setTargetWeek] = useState('');
  const [sprintsCountTarget, setSprintsCountTarget] = useState<number>(0);
  const [createStatus, setCreateStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'DONE'>('PLANNED');
  const [isClone, setIsClone] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View & Edit Modal States (Middle Pop Card)
  const [viewingEpic, setViewingEpic] = useState<EpicItem | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ recordId: string; title: string; code: string } | null>(null);
  const [viewingInitiativeInEpics, setViewingInitiativeInEpics] = useState<any | null>(null);
  const [editingEpic, setEditingEpic] = useState<EpicItem | null>(null);
  const [editEntity, setEditEntity] = useState<'EHM' | 'CAG' | 'COMMON'>('EHM');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInitiativeId, setEditInitiativeId] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editTargetWeek, setEditTargetWeek] = useState('');
  const [editSprintsCountTarget, setEditSprintsCountTarget] = useState<number>(0);
  const [editStatus, setEditStatus] = useState('PLANNED');
  const [selectedTaskToView, setSelectedTaskToView] = useState<TaskItem | null>(null);

  // Task Creation Modal & Quick Inline Task Creation State
  const [adminManagerList, setAdminManagerList] = useState<{ id: string; name: string }[]>([]);
  const [createAssignedTo, setCreateAssignedTo] = useState<string[]>([]);
  const [editAssignedTo, setEditAssignedTo] = useState<string[]>([]);
  const [createAssignedDropOpen, setCreateAssignedDropOpen] = useState(false);
  const [editAssignedDropOpen, setEditAssignedDropOpen] = useState(false);
  const createAssignedRef = useRef<HTMLDivElement>(null);
  const editAssignedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (createAssignedRef.current && !createAssignedRef.current.contains(target)) {
        setCreateAssignedDropOpen(false);
      }
      if (editAssignedRef.current && !editAssignedRef.current.contains(target)) {
        setEditAssignedDropOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [, setLocation] = useLocation();
  const [isTaskAssignModalOpen, setIsTaskAssignModalOpen] = useState(false);
  const [taskAssignEpic, setTaskAssignEpic] = useState<EpicItem | null>(null);
  const [quickSlotIdx, setQuickSlotIdx] = useState<number | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isSubmittingQuickTask, setIsSubmittingQuickTask] = useState(false);

  const initiativeOptions = React.useMemo(() => {
    return initiatives
      .map((init) => ({
        id: init.id,
        code: init.initiativeCode,
        label: init.title,
      }))
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [initiatives]);

  const projectOptions = React.useMemo(() => {
    return projects
      .map((proj) => ({
        id: proj.id,
        code: proj.code,
        label: proj.name,
        subtitle: proj.entity,
      }))
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [projects]);

  const epicCloneOptions = React.useMemo(() => {
    return epics
      .map((ep) => ({
        id: ep.id,
        code: ep.epicCode,
        label: ep.title,
      }))
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [epics]);

  const handleOpenTaskModal = (taskItem: any) => {
    const code = taskItem.taskCode || taskItem.taskId || '-';
    const badge = getEntityBadge(taskItem);
    const resolvedEntity = badge.isCommon ? 'COMMON' : badge.isCAG ? 'CLIMAGRO' : 'EHM';
    const resolvedEntityCode = badge.isCommon ? 'COMMON' : badge.isCAG ? 'CAG' : 'EHM';
    setSelectedTaskToView({
      id: taskItem.id || 'tsk-1',
      taskId: code,
      taskCode: code,
      title: taskItem.title || 'Task Deliverable',
      entity: resolvedEntity,
      entityCode: resolvedEntityCode,
      assignee: taskItem.assigneeName || taskItem.assignee || 'Unassigned',
      assigneeId: taskItem.assigneeId,
      reviewingLead: taskItem.reviewingLead || 'Dr. Harshit Mishra',
      reviewingLeadId: taskItem.reviewingLeadId,
      status: taskItem.status === 'DONE' ? 'Done' : 'In Progress',
      outputUrl: taskItem.deliverableUrl || taskItem.outputUrl || '',
      waitingOn: 'None (Self)',
      notes: taskItem.description || taskItem.notes || '',
      dueDate: taskItem.dueDate ? taskItem.dueDate.split('T')[0] : '',
      priority: taskItem.priority || 'P3',
      createdAt: taskItem.createdAt,
      createdById: taskItem.createdById || taskItem.creatorId,
      createdByName: taskItem.createdByName || taskItem.creatorName || taskItem.createdBy || '',
      creatorName: taskItem.createdByName || taskItem.creatorName || taskItem.createdBy || '',
    });
  };

  const handleAdjustTasksCount = async (newTarget: number) => {
    if (!viewingEpic) return;
    const target = Math.max(0, newTarget);
    try {
      await fetchApi(`/api/epics/${viewingEpic.id}`, {
        method: 'PUT',
        body: JSON.stringify({ sprintsCountTarget: target }),
      });
      setViewingEpic(prev => prev ? { ...prev, sprintsCountTarget: target } : null);
      setEditSprintsCountTarget(target);
      toast.success(`Target tasks count updated to ${target === 0 ? 'Flexible' : target}`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update target tasks count');
    }
  };

  const handleOpenCreateTaskForEpic = (epic: EpicItem) => {
    setTaskAssignEpic(epic);
    setIsTaskAssignModalOpen(true);
  };

  const handleCreateTaskForEpic = async (newTaskData: any) => {
    const targetEpic = taskAssignEpic || viewingEpic;
    if (!targetEpic) return;
    try {
      const isEpicCAG = (targetEpic.entityCode || targetEpic.entity) === 'CAG';
      const created = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...newTaskData,
          epicId: targetEpic.id,
          initiativeId: targetEpic.initiativeId || newTaskData.initiativeId,
          entityCode: isEpicCAG ? 'CAG' : (newTaskData.entityCode || 'EHM'),
          status: 'BACKLOG',
        }),
      });
      toast.success(`Task ${created.taskCode || ''} created and linked to ${targetEpic.epicCode}! Redirecting to Sprint task view...`);
      setIsTaskAssignModalOpen(false);
      setTaskAssignEpic(null);

      // Immediately append to local state so slot updates instantly
      setAllTasks(prev => [created, ...prev]);
      if (viewingEpic && (viewingEpic.id === targetEpic.id || viewingEpic.epicCode === targetEpic.epicCode)) {
        setViewingEpic(prev => prev ? {
          ...prev,
          tasks: [...(prev.tasks || []), created],
        } : null);
      }
      loadData(true);
      window.dispatchEvent(new CustomEvent('tasks-updated'));
      setLocation('/sprints');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    }
  };

  const handleQuickCreateTaskSlot = async (slotIdx: number) => {
    if (!viewingEpic || !quickTaskTitle.trim()) return;
    try {
      setIsSubmittingQuickTask(true);
      const isEpicCAG = (viewingEpic.entityCode || viewingEpic.entity) === 'CAG';
      const created = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: quickTaskTitle.trim(),
          epicId: viewingEpic.id,
          initiativeId: viewingEpic.initiativeId,
          entityCode: isEpicCAG ? 'CAG' : 'EHM',
          department: viewingEpic.department || 'Operations & Delivery',
          status: 'BACKLOG',
          priority: 'P3',
        }),
      });
      toast.success(`Task ${created.taskCode || ''} created and linked to ${viewingEpic.epicCode}!`);
      setQuickSlotIdx(null);
      setQuickTaskTitle('');

      // Immediately append to local state
      setAllTasks(prev => [created, ...prev]);
      setViewingEpic(prev => prev ? {
        ...prev,
        tasks: [...(prev.tasks || []), created],
      } : null);
      loadData(true);
      window.dispatchEvent(new CustomEvent('tasks-updated'));
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setIsSubmittingQuickTask(false);
    }
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [epicsData, initsData, tasksData, projsData, employeesData] = await Promise.all([
        fetchApi<EpicItem[]>('/api/epics'),
        fetchApi<InitiativeOption[]>('/api/initiatives'),
        fetchApi<any[]>('/api/tasks'),
        fetchApi<ProjectOption[]>('/api/projects'),
        fetchApi<any[]>('/api/employees'),
      ]);
      // Keep only ADMIN/MANAGER employees for "Assigned To" dropdown
      const adminsAndManagers = (employeesData || [])
        .filter((e: any) => e.role === 'ADMIN' || e.role === 'MANAGER')
        .map((e: any) => ({ id: e.id, name: `${e.firstName || ''} ${e.lastName || ''}`.trim() }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setAdminManagerList(adminsAndManagers);
      const sortedEpics = [...(epicsData || [])].map(ep => ({
        ...ep,
        assignedTo: ep.assignedTo
          ? (Array.isArray(ep.assignedTo) ? ep.assignedTo : (() => { try { return JSON.parse(ep.assignedTo); } catch { return []; } })())
          : [],
      })).sort((a, b) =>
        (a.title || a.epicCode || '').localeCompare(b.title || b.epicCode || '', undefined, { sensitivity: 'base' })
      );
      setEpics(sortedEpics);
      setAllTasks(tasksData || []);
      const sortedProjects = [...(projsData || [])].sort((a, b) =>
        (a.name || a.code || '').localeCompare(b.name || b.code || '', undefined, { sensitivity: 'base' })
      );
      setProjects(sortedProjects);

      if (initsData && initsData.length > 0) {
        const sortedInits = [...initsData].sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
        setInitiatives(sortedInits);
      }
    } catch {
      if (!silent) setEpics([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Silent background refresh every 10s and on tab focus
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isModalOpen && !editingEpic) {
        loadData(true);
      }
    }, 10000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible' && !isModalOpen && !editingEpic) {
        loadData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const handleInitsUpdate = () => {
      fetchApi<InitiativeOption[]>('/api/initiatives').then((initsData) => {
        if (initsData && initsData.length > 0) {
          const sortedInits = [...initsData].sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
          setInitiatives(sortedInits);
        }
      }).catch(() => {});
      fetchApi<ProjectOption[]>('/api/projects').then((projsData) => {
        if (projsData) {
          const sortedProjects = [...projsData].sort((a, b) =>
            (a.name || a.code || '').localeCompare(b.name || b.code || '', undefined, { sensitivity: 'base' })
          );
          setProjects(sortedProjects);
        }
      }).catch(() => {});
    };
    window.addEventListener('initiatives-updated', handleInitsUpdate);
    window.addEventListener('epics-updated', () => loadData(true));

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('initiatives-updated', handleInitsUpdate);
      window.removeEventListener('epics-updated', () => loadData(true));
    };
  }, [isModalOpen, editingEpic]);

  // When Create or Edit modal opens, always fetch freshest initiatives & projects list
  useEffect(() => {
    if (isModalOpen || editingEpic) {
      fetchApi<InitiativeOption[]>('/api/initiatives').then((initsData) => {
        if (initsData && initsData.length > 0) {
          const sortedInits = [...initsData].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          setInitiatives(sortedInits);
        }
      }).catch(() => {});
      fetchApi<ProjectOption[]>('/api/projects').then((projsData) => {
        if (projsData) setProjects(projsData);
      }).catch(() => {});
    }
  }, [isModalOpen, editingEpic]);

  // Auto-open epic view modal when navigated via selectedEpicIdToView
  useEffect(() => {
    if (selectedEpicIdToView && epics.length > 0) {
      const found = epics.find(e => e.id === selectedEpicIdToView || e.epicCode === selectedEpicIdToView);
      if (found) {
        setViewingEpic(found);
      }
    }
  }, [selectedEpicIdToView, epics]);

  // Auto-suggest entity based on selected parent or active entity filter
  useEffect(() => {
    if (selectedEntity === 'CAG') setCreateEntity('CAG');
    else if (selectedEntity === 'COMMON') setCreateEntity('COMMON');
    else setCreateEntity('EHM');
  }, [selectedEntity, isModalOpen]);

  useEffect(() => {
    if (selectedInitiativeId) {
      const init = initiatives.find(i => i.id === selectedInitiativeId);
      if (init) {
        const initBadge = getEntityBadge(init);
        setCreateEntity(initBadge.isCommon ? 'COMMON' : initBadge.isCAG ? 'CAG' : 'EHM');
      }
    }
  }, [selectedInitiativeId, initiatives]);

  useEffect(() => {
    if (selectedProjectId && !selectedInitiativeId) {
      const proj = projects.find(p => p.id === selectedProjectId);
      if (proj) {
        const projBadge = getEntityBadge(proj);
        setCreateEntity(projBadge.isCommon ? 'COMMON' : projBadge.isCAG ? 'CAG' : 'EHM');
      }
    }
  }, [selectedProjectId, selectedInitiativeId, projects]);

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter an epic title');

    const apiStatus = createStatus === 'DONE' ? 'COMPLETED' : createStatus;

    setIsSubmitting(true);
    try {
      const created = await fetchApi<any>('/api/epics', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          entity: createEntity,
          entityCode: createEntity,
          initiativeId: selectedInitiativeId || undefined,
          projectId: selectedProjectId || undefined,
          department,
          targetWeek,
          sprintsCountTarget: sprintsCountTarget > 0 ? sprintsCountTarget : undefined,
          status: apiStatus,
          assignedTo: createAssignedTo.length > 0 ? createAssignedTo : undefined,
        }),
      });
      toast.success(`Epic ${created.epicCode} created successfully!`);
      setTitle('');
      setDescription('');
      setSelectedInitiativeId('');
      setSelectedProjectId('');
      setTargetWeek('');
      setSprintsCountTarget(0);
      setCreateStatus('PLANNED');
      setCreateAssignedTo([]);
      setIsModalOpen(false);
      window.dispatchEvent(new CustomEvent('epics-updated'));
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create epic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (epic: EpicItem) => {
    setEditingEpic(epic);
    setEditTitle(epic.title);
    setEditDescription(epic.description || '');
    setEditInitiativeId(epic.initiativeId || '');
    setEditProjectId(epic.projectId || '');
    setEditDepartment(epic.department || 'Product & Tech');
    setEditTargetWeek(epic.targetWeek || '');
    setEditSprintsCountTarget(epic.sprintsCountTarget || 0);
    setEditStatus(epic.status === 'COMPLETED' ? 'DONE' : (epic.status || 'PLANNED'));
    setEditAssignedTo(Array.isArray(epic.assignedTo) ? epic.assignedTo : []);
    const badge = getEntityBadge(epic);
    const resolvedEnt = epic.entity === 'CLIMAGRO' || epic.entityCode === 'CAG' || badge.isCAG ? 'CAG'
      : epic.entity === 'COMMON' || epic.entityCode === 'COMMON' || badge.isCommon ? 'COMMON'
      : 'EHM';
    setEditEntity(resolvedEnt);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpic) return;

    const apiStatus = editStatus === 'DONE' ? 'COMPLETED' : editStatus;

    setIsSubmitting(true);
    try {
      await fetchApi<any>(`/api/epics/${editingEpic.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          entity: editEntity,
          entityCode: editEntity,
          initiativeId: editInitiativeId || null,
          projectId: editProjectId || null,
          department: editDepartment,
          targetWeek: editTargetWeek || null,
          sprintsCountTarget: editSprintsCountTarget > 0 ? editSprintsCountTarget : 0,
          status: apiStatus,
          assignedTo: editAssignedTo,
        }),
      });
      toast.success(`Epic ${editingEpic.epicCode} updated successfully!`);
      setEditingEpic(null);
      setViewingEpic(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update epic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (epicId: string, newStatus: string) => {
    const targetEpic = epics.find(e => e.id === epicId);
    const apiStatus = newStatus === 'DONE' ? 'COMPLETED' : newStatus;

    try {
      await fetchApi<any>(`/api/epics/${epicId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: apiStatus }),
      });

      const isArchivedTarget = apiStatus === 'COMPLETED' || apiStatus === 'ARCHIVED';
      if (isArchivedTarget) {
        toast.success(`Epic ${targetEpic?.epicCode || ''} marked as DONE & moved to Archive!`);
      } else {
        toast.success(`Epic ${targetEpic?.epicCode || ''} status updated to ${newStatus} & restored to Active!`);
      }

      setEpics((prev) =>
        prev.map((e) => (e.id === epicId ? { ...e, status: apiStatus } : e))
      );
      if (viewingEpic && viewingEpic.id === epicId) {
        setViewingEpic((prev) => (prev ? { ...prev, status: apiStatus } : null));
      }
      window.dispatchEvent(new CustomEvent('epics-updated'));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleInitiativeStatusChangeInEpics = async (initId: string, newStatus: string) => {
    const mappedStatus = newStatus === 'DONE' ? 'DONE' : newStatus === 'ACTIVE' ? 'ACTIVE' : 'PLANNED';
    if (viewingInitiativeInEpics && viewingInitiativeInEpics.id === initId) {
      setViewingInitiativeInEpics((prev: any) => prev ? { ...prev, status: mappedStatus } : null);
    }
    try {
      await fetchApi(`/api/initiatives/${initId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: mappedStatus }),
      });
      if (mappedStatus === 'DONE') {
        toast.success(`Initiative marked as DONE & moved to Archive!`);
      } else {
        toast.success(`Initiative status updated to ${mappedStatus === 'ACTIVE' ? 'ACTIVE (IN PROGRESS)' : mappedStatus}`);
      }
      window.dispatchEvent(new CustomEvent('initiatives-updated'));
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update initiative status');
    }
  };

  // Active vs Archived pools scoped by Entity filter
  const scopedEpics = epics.filter(e => matchesEntityFilter(e, selectedEntity));
  const activeEpics = scopedEpics.filter(e => e.status !== 'DONE' && e.status !== 'COMPLETED' && e.status !== 'ARCHIVED');
  const archivedEpics = scopedEpics.filter(e => e.status === 'DONE' || e.status === 'COMPLETED' || e.status === 'ARCHIVED');
  const baseEpicsPool = viewMode === 'ACTIVE' ? activeEpics : archivedEpics;

  // Filtered Epics calculation
  const filteredEpics = baseEpicsPool.filter(epic => {
    const rawStatus = epic.status || 'PLANNED';
    const epicStatus = rawStatus === 'COMPLETED' ? 'DONE' : rawStatus;
    const isDone = epicStatus === 'DONE' || epicStatus === 'COMPLETED' || epicStatus === 'ARCHIVED';
    const isInProgress = epicStatus === 'IN_PROGRESS' || epicStatus === 'ACTIVE';

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PLANNED' && epicStatus === 'PLANNED') ||
      (statusFilter === 'IN_PROGRESS' && isInProgress) ||
      (statusFilter === 'DONE' && isDone);

    const q = searchQuery.toLowerCase().trim();
    const parentInit = initiatives.find((i) => i.id === epic.initiativeId);

    const matchesQuery =
      !q ||
      epic.epicCode.toLowerCase().includes(q) ||
      epic.title.toLowerCase().includes(q) ||
      (epic.department || '').toLowerCase().includes(q) ||
      (epic.description || '').toLowerCase().includes(q) ||
      (parentInit?.title || '').toLowerCase().includes(q) ||
      (parentInit?.initiativeCode || '').toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });


  const plannedCount = activeEpics.filter(e => (e.status || 'PLANNED') === 'PLANNED').length;
  const inProgressCount = activeEpics.filter(e => e.status === 'IN_PROGRESS' || e.status === 'ACTIVE').length;
  const doneCount = archivedEpics.length;

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{viewMode === 'ACTIVE' ? 'Feature Epics' : 'Archived Feature Epics'}</span>
            {viewMode === 'ARCHIVE' ? (
              <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                Archive Mode ({archivedEpics.length})
              </span>
            ) : (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {filteredEpics.length} of {activeEpics.length} Active Epics
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            {viewMode === 'ACTIVE'
              ? 'Feature epics breakdowns & task backlog items.'
              : 'Completed & archived feature epics.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setViewMode(viewMode === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
              viewMode === 'ARCHIVE'
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{viewMode === 'ACTIVE' ? 'Archive' : 'Active Epics'}</span>
          </button>

          {isManager && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Epic</span>
            </button>
          )}
        </div>
      </div>

      {/* 🔍 Scalable Toolbar: Instant Search & Status Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Instant Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search epics by code, title, department, or initiative..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Pills & Archive Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => { setViewMode('ACTIVE'); setStatusFilter('ALL'); }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'ACTIVE' && statusFilter === 'ALL'
                  ? 'bg-white text-emerald-700 shadow-2xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({activeEpics.length})
            </button>

            <button
              onClick={() => { setViewMode('ACTIVE'); setStatusFilter('PLANNED'); }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'ACTIVE' && statusFilter === 'PLANNED'
                  ? 'bg-white text-purple-700 shadow-2xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Planned ({plannedCount})
            </button>

            <button
              onClick={() => { setViewMode('ACTIVE'); setStatusFilter('IN_PROGRESS'); }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'ACTIVE' && statusFilter === 'IN_PROGRESS'
                  ? 'bg-white text-blue-700 shadow-2xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              In Progress ({inProgressCount})
            </button>

            <button
              onClick={() => { setViewMode('ARCHIVE'); setStatusFilter('ALL'); }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'ARCHIVE'
                  ? 'bg-purple-600 text-white shadow-2xs border border-purple-700'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive ({archivedEpics.length})</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading epics from database...</div>
      ) : filteredEpics.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
          <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-600">No Epics match your filter criteria</p>
          <p className="text-xs text-gray-400 mt-1">Try clearing search query or switching active/archive filters above.</p>
        </div>
      ) : (
        /* 📋 Feature Epics List with Collapsible Linked Tasks */
        <div className="space-y-4">
          {filteredEpics.map((epic) => {
            const rawStatus = epic.status || 'PLANNED';
            const epicStatus = rawStatus === 'COMPLETED' ? 'DONE' : rawStatus;
            const isDone = epicStatus === 'DONE' || epicStatus === 'COMPLETED' || epicStatus === 'ARCHIVED';
            const isInProgress = epicStatus === 'IN_PROGRESS' || epicStatus === 'ACTIVE';

            const epicTasks = (epic.tasks && epic.tasks.length > 0)
              ? epic.tasks
              : allTasks.filter(t => t.epicId === epic.id || (epic.sprints && epic.sprints.some((s: any) => s.id === t.sprintId)));

            const totalTasks = epicTasks.length;
            const doneTasks = epicTasks.filter((t: any) => t.status === 'DONE' || t.status === 'COMPLETED').length;
            const tasksSummary = totalTasks === 0
              ? 'no tasks yet'
              : doneTasks > 0
              ? `${totalTasks} task${totalTasks > 1 ? 's' : ''}, ${doneTasks} done`
              : `${totalTasks} task${totalTasks > 1 ? 's' : ''}`;

            const parentInit = initiatives.find((i) => i.id === epic.initiativeId || i.initiativeCode === epic.initiativeId);
            const parentProj = projects.find((p) => p.id === epic.projectId || p.code === epic.projectId);
            const isCollapsed = collapsedEpicIds[epic.id] !== false;

            return (
              <div
                key={epic.id}
                className={`bg-white rounded-2xl border shadow-2xs transition-all hover:border-emerald-300 ${
                  activeMenuId === epic.id ? 'relative z-40' : 'relative z-0'
                } ${
                  isCollapsed ? 'border-gray-200' : 'border-emerald-200'
                }`}
              >
                {/* Epic Header Bar */}
                <div 
                  className={`bg-gray-50/90 px-5 py-3.5 flex items-center justify-between gap-4 transition-colors select-none ${
                    isCollapsed ? 'rounded-2xl' : 'rounded-t-2xl border-b border-gray-200'
                  }`}
                >
                  <div 
                    onClick={() => setViewingEpic(epic)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                  >
                    <Layers className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-gray-500 shrink-0">
                          {epic.epicCode}
                        </span>
                        {(() => {
                          const badge = getEntityBadge(epic);
                          return (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wide shrink-0 ${badge.className}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                        <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 text-sm truncate transition-colors">
                          {epic.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                        {parentInit?.title ? `Init: ${parentInit.title} • ` : ''}{parentProj?.name ? `Project: ${parentProj.name} • ` : ''}{epic.department || 'Product & Tech'} • {tasksSummary}
                        {` • Created by: ${epic.createdByName || 'Admin'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {(isManager || isAdmin) ? (
                      <div className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={isDone ? 'DONE' : isInProgress ? 'IN_PROGRESS' : 'PLANNED'}
                          onChange={(e) => handleStatusChange(epic.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 pr-6 rounded-lg border cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs ${
                            isDone 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                              : isInProgress 
                              ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100' 
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                          title="Click to change epic status live"
                        >
                          <option value="PLANNED">Planned</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 pointer-events-none" />
                      </div>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all ${
                        isDone 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : isInProgress 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {isDone ? 'Done' : isInProgress ? 'In Progress' : 'Planned'}
                      </span>
                    )}

                    {/* Single Eye View Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingEpic(epic);
                      }}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                      title="View Epic Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Three Dots Menu Button (View, Edit, History) */}
                    <div className="relative epic-action-menu">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === epic.id ? null : epic.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                          activeMenuId === epic.id
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 border-transparent hover:border-gray-200'
                        }`}
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === epic.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200/90 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-50"
                        >
                          <div className="py-0.5">
                            {/* View Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setViewingEpic(epic);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors cursor-pointer text-left"
                            >
                              <Eye className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                              <span>View</span>
                            </button>

                            {/* Edit Option */}
                            {(isManager || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleStartEdit(epic);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-blue-800 hover:bg-blue-50/80 transition-colors cursor-pointer text-left"
                              >
                                <Pencil className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span>Edit</span>
                              </button>
                            )}

                            {/* History Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setHistoryTarget({
                                  recordId: epic.id,
                                  title: epic.title,
                                  code: epic.epicCode,
                                });
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-purple-800 hover:bg-purple-50/80 transition-colors cursor-pointer text-left"
                            >
                              <History className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span>History</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expand / Collapse Button: Arrow facing down, on hover shows Expand */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCollapsedEpicIds(prev => ({ ...prev, [epic.id]: !isCollapsed }));
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center cursor-pointer border border-gray-200 bg-white hover:border-gray-300"
                      title={isCollapsed ? 'Expand' : 'Collapse'}
                      aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                      <ChevronDown className={`w-4 h-4 text-emerald-600 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Child Tasks List */}
                {!isCollapsed && (
                  <div className="bg-slate-50/50 rounded-b-2xl overflow-hidden">
                    {epicTasks.length === 0 ? (
                      <div className="px-6 py-4 text-xs font-medium text-gray-400 italic flex items-center justify-between">
                        <span>No tasks linked to this epic yet.</span>
                        {isManager && (
                          <button
                            onClick={() => setViewingEpic(epic)}
                            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                          >
                            View Epic Details
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 border-t border-gray-100">
                        {epicTasks.map((task: any) => {
                          const isTaskDone = task.status === 'DONE' || task.status === 'COMPLETED';
                          const isTaskInProgress = task.status === 'IN_PROGRESS' || task.status === 'ACTIVE';

                          return (
                            <div
                              key={task.id || task.taskCode}
                              onClick={() => handleOpenTaskModal(task)}
                              className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-emerald-50/30 transition-colors cursor-pointer group bg-white/70"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <ListTodo className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                                <div className="space-y-0.5 min-w-0">
                                  <h5 className="font-bold text-gray-800 group-hover:text-emerald-700 text-xs truncate transition-colors">
                                    {task.title}
                                  </h5>
                                  <p className="text-[11px] text-gray-400 font-medium truncate">
                                    <span className="font-mono font-bold text-gray-500">{task.taskCode || task.id}</span>
                                    {' • '}
                                    <span>{task.assigneeName || task.assignee || 'Unassigned'}</span>
                                    {task.priority ? ` • ${task.priority} Priority` : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                                  isTaskDone
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isTaskInProgress
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                  {isTaskDone ? 'Done' : isTaskInProgress ? 'In Progress' : 'Planned'}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 👁️ POP CARD DETAILS MODAL FOR FEATURE EPIC */}
      {viewingEpic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 text-left select-none">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 shrink-0 bg-white">
              <span className="text-sm font-bold text-gray-700">Epic</span>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
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
                      const epicToEdit = viewingEpic;
                      setViewingEpic(null);
                      handleStartEdit(epicToEdit);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setViewingEpic(null);
                    if (onClearSelectedEpic) onClearSelectedEpic();
                  }}
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
                const parentInit = initiatives.find((i) => i.id === viewingEpic.initiativeId || i.initiativeCode === viewingEpic.initiativeId);
                const parentProj = projects.find((p) => p.id === viewingEpic.projectId || p.code === viewingEpic.projectId);
                const isCAG = (viewingEpic.entityCode || viewingEpic.entity) === 'CAG' || (parentInit?.entityCode || parentInit?.entity) === 'CAG' || (parentProj?.entity === 'CAG');
                const rawStatus = viewingEpic.status || 'PLANNED';
                const statusLabel = rawStatus === 'COMPLETED' || rawStatus === 'DONE' ? 'Done' : rawStatus === 'IN_PROGRESS' || rawStatus === 'ACTIVE' ? 'In progress' : 'Planned';

                return (
                  <div className="space-y-3">
                    {/* Breadcrumb with Linkable Parent Initiative and Parent Project */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                      {parentInit && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-medium">Initiative:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setViewingInitiativeInEpics(parentInit);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 transition-all cursor-pointer shadow-2xs group"
                            title="Open Initiative in Pop-up Modal"
                          >
                            <Target className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="font-mono">{parentInit.initiativeCode}</span>
                            <span className="text-gray-600 font-semibold truncate max-w-[200px] sm:max-w-xs">
                              • {parentInit.title}
                            </span>
                          </button>
                        </div>
                      )}

                      {parentProj && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-medium">Project:</span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-lg border border-purple-200 shadow-2xs">
                            <Layers className="w-3.5 h-3.5 text-purple-600" />
                            <span className="font-mono">{parentProj.code}</span>
                            <span className="text-gray-700 font-semibold truncate max-w-[200px] sm:max-w-xs">
                              • {parentProj.name}
                            </span>
                          </span>
                        </div>
                      )}

                      {!parentInit && !parentProj && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-medium">Hierarchy:</span>
                          <span className="font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            Standalone Epic
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Badges line */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200">
                        {viewingEpic.epicCode}
                      </span>
                      {(() => {
                        const badge = getEntityBadge(viewingEpic);
                        return (
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wide ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                      {(isManager || isAdmin) ? (
                        <div className="relative inline-flex items-center">
                          <select
                            value={viewingEpic.status === 'COMPLETED' || viewingEpic.status === 'DONE' ? 'DONE' : viewingEpic.status === 'IN_PROGRESS' || viewingEpic.status === 'ACTIVE' ? 'IN_PROGRESS' : 'PLANNED'}
                            onChange={(e) => handleStatusChange(viewingEpic.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1 pr-6 rounded-lg border cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs ${
                              viewingEpic.status === 'COMPLETED' || viewingEpic.status === 'DONE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : viewingEpic.status === 'IN_PROGRESS' || viewingEpic.status === 'ACTIVE'
                                ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                            title="Click to change epic status live"
                          >
                            <option value="PLANNED">Planned</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="DONE">Done</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 pointer-events-none" />
                        </div>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                          {statusLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Epic Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  {viewingEpic.title}
                </h2>
                {viewingEpic.description && (
                  <div className="pt-1">
                    <MarkdownViewer content={viewingEpic.description} />
                  </div>
                )}
              </div>

              {/* Success Metric Box (Dark Theme Banner - Only shown if filled) */}
              {(viewingEpic as any).targetDeliverableMetric ? (
                <div className="p-4 rounded-2xl bg-gray-900 text-white space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Success metric</span>
                  </div>
                  <p className="text-sm font-bold text-white pl-6">
                    {(viewingEpic as any).targetDeliverableMetric}
                  </p>
                </div>
              ) : null}

              {/* 4-Column Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Target week</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingEpic.targetWeek || 'Week 1 • days 1–7'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Department</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {(() => {
                      const dept = viewingEpic.department;
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
                    {viewingEpic.createdAt ? new Date(viewingEpic.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Created By</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingEpic.createdByName || 'Admin'}
                  </span>
                </div>
              </div>

              {/* Linked Tasks Section with Progress Bar */}
              {(() => {
                const isEpicCAG = (viewingEpic.entityCode || viewingEpic.entity) === 'CAG';
                const combined = [
                  ...(viewingEpic.tasks || []),
                  ...allTasks.filter((t: any) => t.epicId === viewingEpic.id || t.parentEpicCode === viewingEpic.epicCode)
                ];
                const linkedTasks = Array.from(new Map(combined.map((t: any) => [t.id || t.taskCode, t])).values());
                const configuredTarget = (viewingEpic.sprintsCountTarget && viewingEpic.sprintsCountTarget > 0)
                  ? viewingEpic.sprintsCountTarget
                  : 0;
                const doneCount = linkedTasks.filter((t: any) => t.status === 'DONE' || t.status === 'COMPLETED').length;

                return (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    {/* Header line & Progress Bar & Quick Adjust Stepper */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">Linked tasks</h4>
                          {(isAdmin || isManager) && (
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                              <button
                                type="button"
                                onClick={() => handleAdjustTasksCount(Math.max(0, (viewingEpic.sprintsCountTarget || linkedTasks.length) - 1))}
                                className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors cursor-pointer"
                                title="Decrease Target Tasks Count"
                              >
                                -
                              </button>
                              <span className="text-[11px] font-bold text-gray-700 px-1 font-mono">
                                {configuredTarget > 0 ? `${configuredTarget} planned` : 'Flexible'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAdjustTasksCount((viewingEpic.sprintsCountTarget || linkedTasks.length) + 1)}
                                className="w-5 h-5 flex items-center justify-center text-xs font-bold text-emerald-700 hover:bg-emerald-100/70 rounded transition-colors cursor-pointer"
                                title="Increase Target Tasks Count"
                              >
                                +
                              </button>
                            </div>
                          )}
                          {(isAdmin || isManager) && (
                            <button
                              type="button"
                              onClick={() => handleOpenCreateTaskForEpic(viewingEpic)}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Add new task directly to this epic"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Task</span>
                            </button>
                          )}
                        </div>

                        <span className="text-xs font-medium text-gray-500">
                          {configuredTarget > 0 ? `${doneCount} of ${linkedTasks.length} done (Target: ${configuredTarget})` : `${doneCount} of ${linkedTasks.length} done`}
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
                        const dateStr = taskItem.createdAt ? new Date(taskItem.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Unknown';

                        const isTaskDone = taskItem.status === 'DONE' || taskItem.status === 'COMPLETED';
                        const isTaskToReview = taskItem.status === 'TO_REVIEW';
                        const isTaskInProgress = taskItem.status === 'IN_PROGRESS' || taskItem.status === 'ACTIVE';
                        const taskStatusLabel = isTaskDone ? 'Done' : isTaskToReview ? 'To Review' : isTaskInProgress ? 'In progress' : 'Backlog';

                        return (
                          <div
                            key={taskItem.id || idx}
                            onClick={() => handleOpenTaskModal(taskItem)}
                            className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors">
                                {taskItem.title}
                              </h5>
                              <p className="text-[11px] text-gray-400 font-medium">
                                {displayTaskCode} • {assigneeStr} • {dateStr}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                                isTaskDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                isTaskToReview ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                isTaskInProgress ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {taskStatusLabel}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        );
                      })}

                      {/* Uncreated Task Slots if configured target > linked tasks */}
                      {configuredTarget > linkedTasks.length && Array.from({ length: configuredTarget - linkedTasks.length }).map((_, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs text-gray-500 font-medium">
                          {quickSlotIdx === idx ? (
                            <div className="flex items-center gap-2 flex-1 max-w-lg animate-in fade-in duration-150">
                              <input
                                type="text"
                                autoFocus
                                placeholder={`Task slot ${linkedTasks.length + idx + 1} deliverable title...`}
                                value={quickTaskTitle}
                                onChange={(e) => setQuickTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleQuickCreateTaskSlot(idx);
                                  if (e.key === 'Escape') setQuickSlotIdx(null);
                                }}
                                className="flex-1 px-3 py-1.5 text-xs border border-emerald-400 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-gray-900"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuickCreateTaskSlot(idx)}
                                disabled={isSubmittingQuickTask || !quickTaskTitle.trim()}
                                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isSubmittingQuickTask ? 'Adding...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenCreateTaskForEpic(viewingEpic);
                                  setQuickSlotIdx(null);
                                }}
                                className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                                title="Open full assignment form with assignees and dates"
                              >
                                Full Form
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuickSlotIdx(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-gray-400">Task slot {linkedTasks.length + idx + 1} — not created yet</span>
                              {isManager && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickSlotIdx(idx);
                                      setQuickTaskTitle('');
                                    }}
                                    className="px-3 py-1 text-xs font-bold rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                                    title="Quick add task deliverable title"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCreateTaskForEpic(viewingEpic)}
                                    className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200"
                                    title="Open full task assignment modal"
                                  >
                                    Full Form
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Audit History Action */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setHistoryTarget({
                    recordId: viewingEpic.id,
                    title: viewingEpic.title,
                    code: viewingEpic.epicCode,
                  })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View Full Audit History</span>
                </button>
              </div>

              {/* Recent Activity Section */}
              <RecentActivitySection
                tableName="epics"
                recordId={viewingEpic.id}
                onOpenHistory={() => setHistoryTarget({
                  recordId: viewingEpic.id,
                  title: viewingEpic.title,
                  code: viewingEpic.epicCode,
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ CONFIRMATION POPUP MODAL FOR EPIC DELETION (ADMIN ONLY) */}
      {showDeleteConfirm && viewingEpic && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 select-none">
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
                {viewingEpic.epicCode}
              </span>{' '}
              "{viewingEpic.title}"? This will permanently delete all associated sprints and tasks.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await fetchApi(`/api/epics/${viewingEpic.id}`, { method: 'DELETE' });
                    toast.success(`Epic ${viewingEpic.epicCode} deleted successfully!`);
                    setShowDeleteConfirm(false);
                    setViewingEpic(null);
                    if (onClearSelectedEpic) onClearSelectedEpic();
                    loadData();
                  } catch (err: any) {
                    toast.error(err?.message || 'Failed to delete epic');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Epic'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGER EDIT EPIC MODAL (IDENTICAL STRUCTURE TO CREATE EPIC) */}
      {editingEpic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">Edit Feature Epic</h3>
                <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {editingEpic.epicCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Level 2 Breakdown
                </span>
                <button
                  type="button"
                  onClick={() => setEditingEpic(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Close edit form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Parent Initiative & Parent Project (Side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Parent Initiative</label>
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                  </div>
                  <SearchableSelect
                    options={initiativeOptions}
                    value={editInitiativeId}
                    onChange={setEditInitiativeId}
                    placeholder="Select Parent Initiative..."
                    noneLabel="-- No Initiative (Standalone) --"
                    searchPlaceholder="Search initiatives..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Parent Project</label>
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                  </div>
                  <SearchableSelect
                    options={projectOptions}
                    value={editProjectId}
                    onChange={setEditProjectId}
                    placeholder="Select Parent Project..."
                    noneLabel="-- No Project (Standalone) --"
                    searchPlaceholder="Search projects..."
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Epic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auth & Multi-tenant RBAC Security Module"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <RichTextEditor
                  value={editDescription}
                  onChange={setEditDescription}
                  placeholder="Technical scope, sprint goals, and acceptance criteria..."
                  rows={3}
                />
              </div>

              {/* Brand / Entity & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand / Entity *</label>
                  <select
                    value={editEntity}
                    onChange={(e) => setEditEntity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    <option value="EHM">EHM</option>
                    <option value="CAG">CLIMAGRO</option>
                    <option value="COMMON">EHM & CLIMAGRO (COMMON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Week / Date & Planned Tasks Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Week / Date</label>
                  <CalendarPicker
                    value={editTargetWeek}
                    onChange={(formatted) => setEditTargetWeek(formatted)}
                    placeholder="e.g. 28 Sep 2026 or Week 1"
                    formatMode="date"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Planned Tasks Target</label>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Optional</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditSprintsCountTarget(prev => Math.max(0, (prev || 0) - 1))}
                      className="px-2.5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-200 cursor-pointer transition-colors"
                      title="Decrease Tasks Count"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Flexible"
                      value={editSprintsCountTarget > 0 ? editSprintsCountTarget : ''}
                      onChange={(e) => setEditSprintsCountTarget(e.target.value ? Number(e.target.value) : 0)}
                      className="w-full text-center px-2 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setEditSprintsCountTarget(prev => (prev || 0) + 1)}
                      className="px-2.5 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 cursor-pointer transition-colors"
                      title="Increase Tasks Count"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    {editSprintsCountTarget > 0 ? `Target set to ${editSprintsCountTarget} tasks.` : 'Flexible task count.'}
                  </p>
                </div>
              </div>

              {/* Assigned To & Status (Side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative" ref={editAssignedRef}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned To</label>
                  <button
                    type="button"
                    onClick={() => setEditAssignedDropOpen(prev => !prev)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer font-medium text-gray-700"
                  >
                    <span className="truncate">
                      {editAssignedTo.length === 0
                        ? 'Select assignees...'
                        : editAssignedTo.join(', ')}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${editAssignedDropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editAssignedDropOpen && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto">
                      {adminManagerList.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400 font-medium">No admins/managers found</div>
                      ) : adminManagerList.map((emp) => (
                        <label key={emp.id} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={editAssignedTo.includes(emp.name)}
                            onChange={(e) => {
                              if (e.target.checked) setEditAssignedTo(prev => [...prev, emp.name]);
                              else setEditAssignedTo(prev => prev.filter(n => n !== emp.name));
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-gray-800">{emp.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {editAssignedTo.length > 0 && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 truncate">
                      {editAssignedTo.length} assigned: {editAssignedTo.join(', ')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingEpic(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW EPIC CREATION MODAL (IDENTICAL STRUCTURE TO EDIT EPIC) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Feature Epic</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Level 2 Breakdown
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Close create form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateEpic} className="space-y-4">
              {/* Parent Initiative & Parent Project (Side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Parent Initiative</label>
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                  </div>
                  <SearchableSelect
                    options={initiativeOptions}
                    value={selectedInitiativeId}
                    onChange={setSelectedInitiativeId}
                    placeholder="Select Parent Initiative..."
                    noneLabel="-- No Initiative (Standalone) --"
                    searchPlaceholder="Search initiatives..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Parent Project</label>
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
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

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Epic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auth & Multi-tenant RBAC Security Module"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Technical scope, sprint goals, and acceptance criteria..."
                  rows={3}
                />
              </div>

              {/* Brand / Entity & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand / Entity *</label>
                  <select
                    value={createEntity}
                    onChange={(e) => setCreateEntity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    <option value="EHM">EHM</option>
                    <option value="CAG">CLIMAGRO</option>
                    <option value="COMMON">EHM & CLIMAGRO (COMMON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Week / Date & Planned Tasks Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Week / Date</label>
                  <CalendarPicker
                    value={targetWeek}
                    onChange={(formatted) => setTargetWeek(formatted)}
                    placeholder="e.g. 28 Sep 2026 or Week 1"
                    formatMode="date"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Planned Tasks Target</label>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Optional</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSprintsCountTarget(prev => Math.max(0, (prev || 0) - 1))}
                      className="px-2.5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-200 cursor-pointer transition-colors"
                      title="Decrease Tasks Count"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Flexible / No limit"
                      value={sprintsCountTarget > 0 ? sprintsCountTarget : ''}
                      onChange={(e) => setSprintsCountTarget(e.target.value ? Number(e.target.value) : 0)}
                      className="w-full text-center px-2 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setSprintsCountTarget(prev => (prev || 0) + 1)}
                      className="px-2.5 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 cursor-pointer transition-colors"
                      title="Increase Tasks Count"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    {sprintsCountTarget > 0 ? `Target set to ${sprintsCountTarget} tasks.` : 'Leave blank/0 for dynamic flexible task count.'}
                  </p>
                </div>
              </div>

              {/* Assigned To & Status (Side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative" ref={createAssignedRef}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned To</label>
                  <button
                    type="button"
                    onClick={() => setCreateAssignedDropOpen(prev => !prev)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer font-medium text-gray-700"
                  >
                    <span className="truncate">
                      {createAssignedTo.length === 0
                        ? 'Select assignees...'
                        : createAssignedTo.join(', ')}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${createAssignedDropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {createAssignedDropOpen && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto">
                      {adminManagerList.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400 font-medium">No admins/managers found</div>
                      ) : adminManagerList.map((emp) => (
                        <label key={emp.id} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={createAssignedTo.includes(emp.name)}
                            onChange={(e) => {
                              if (e.target.checked) setCreateAssignedTo(prev => [...prev, emp.name]);
                              else setCreateAssignedTo(prev => prev.filter(n => n !== emp.name));
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-gray-800">{emp.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {createAssignedTo.length > 0 && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 truncate">
                      {createAssignedTo.length} assigned: {createAssignedTo.join(', ')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status *</label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>

              {/* Clone / Duplicate Option Checkbox (Clean Black & White Monochrome) */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-300 space-y-2.5 shadow-2xs">
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
                      Check this box to duplicate an existing Feature Epic configuration into a new sequence code.
                    </p>
                  </div>
                </label>

                {isClone && (
                  <div className="pt-2 border-t border-gray-200 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-gray-900 mb-1">
                      Select Existing Feature Epic to Clone From (Optional):
                    </label>
                    <SearchableSelect
                      options={epicCloneOptions}
                      value={cloneSourceId}
                      onChange={(newVal) => {
                        setCloneSourceId(newVal);
                        const source = epics.find(ep => ep.id === newVal);
                        if (source) {
                          setTitle(`${source.title} (Clone)`);
                          setDescription(source.description || '');
                          if (source.initiativeId) setSelectedInitiativeId(source.initiativeId);
                          if (source.projectId) setSelectedProjectId(source.projectId);
                          if (source.department) setDepartment(source.department);
                          if (source.targetWeek) setTargetWeek(source.targetWeek);
                          if (source.sprintsCountTarget) setSprintsCountTarget(source.sprintsCountTarget);
                          if (Array.isArray(source.assignedTo)) setCreateAssignedTo(source.assignedTo);
                          const sourceBadge = getEntityBadge(source);
                          setCreateEntity(sourceBadge.isCommon ? 'COMMON' : sourceBadge.isCAG ? 'CAG' : 'EHM');
                          toast.success(`Form pre-filled with data from "${source.title}"!`);
                        }
                      }}
                      placeholder="-- Choose Existing Epic to Auto-Fill --"
                      noneLabel="-- None / Don't Clone --"
                      searchPlaceholder="Search epics to clone..."
                    />
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Epic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Task Details Pop-up Modal (In Front) */}
      <TaskUpdateModal
        isOpen={!!selectedTaskToView}
        task={selectedTaskToView}
        onClose={() => setSelectedTaskToView(null)}
        onDelete={(deletedId) => {
          setAllTasks(prev => prev.filter(t => t.id !== deletedId));
          setSelectedTaskToView(null);
        }}
        isReadOnly={true}
      />

      {/* 🚀 BIG VIEW MODE MODAL FOR STRATEGIC INITIATIVE (POPS UP IN FRONT OVER EPIC MODAL) */}
      {viewingInitiativeInEpics && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 text-left select-none">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 shrink-0 bg-white">
              <span className="text-sm font-bold text-gray-700">Initiative</span>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteInitiativeConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-all cursor-pointer"
                    title="Delete Initiative (Admin Only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                {isManager && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectInitiative) {
                        onSelectInitiative(viewingInitiativeInEpics.id);
                        setViewingInitiativeInEpics(null);
                      } else {
                        toast.info(`Editing initiative ${viewingInitiativeInEpics.initiativeCode}`);
                      }
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setViewingInitiativeInEpics(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
              {/* Badges line */}
              {(() => {
                const isCAG = (viewingInitiativeInEpics.entityName || viewingInitiativeInEpics.initiativeCode || '').toLowerCase().includes('cag') || (viewingInitiativeInEpics.entityName || '').toLowerCase().includes('climagro');
                const isDone = viewingInitiativeInEpics.status === 'DONE' || viewingInitiativeInEpics.status === 'COMPLETED';
                const isInProgress = viewingInitiativeInEpics.status === 'ACTIVE' || viewingInitiativeInEpics.status === 'IN_PROGRESS';
                const statusLabel = isDone ? 'Done' : isInProgress ? 'In progress' : 'Planned';

                return (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {viewingInitiativeInEpics.initiativeCode || viewingInitiativeInEpics.code || 'INIT'}
                    </span>
                    <span className="text-gray-300 font-bold">•</span>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase tracking-wide">
                      {isCAG ? 'Climagro' : 'EHM'}
                    </span>
                    {(isManager || isAdmin) ? (
                      <div className="relative inline-flex items-center">
                        <select
                          value={isDone ? 'DONE' : isInProgress ? 'ACTIVE' : 'PLANNED'}
                          onChange={(e) => handleInitiativeStatusChangeInEpics(viewingInitiativeInEpics.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1 pr-6 rounded-lg border cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : isInProgress
                              ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                          title="Click to change initiative status live"
                        >
                          <option value="PLANNED">Planned</option>
                          <option value="ACTIVE">In progress (Active)</option>
                          <option value="DONE">Done (Archive)</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 pointer-events-none" />
                      </div>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                        {statusLabel}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  {viewingInitiativeInEpics.title}
                </h2>
                {viewingInitiativeInEpics.description && (
                  <div className="pt-1">
                    <MarkdownViewer content={viewingInitiativeInEpics.description} />
                  </div>
                )}
              </div>

              {/* Success Metric Box (Only shown if filled) */}
              {viewingInitiativeInEpics.targetDeliverableMetric ? (
                <div>
                  <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>Success metric</span>
                    </div>
                    <p className="text-sm font-bold text-white pl-6">
                      {viewingInitiativeInEpics.targetDeliverableMetric}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* 4-Column Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Timeline</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingInitiativeInEpics.targetMonth || 'Month 1 (Weeks 1-4)'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Department</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {(() => {
                      const dept = viewingInitiativeInEpics.departmentName || viewingInitiativeInEpics.subDepartment || viewingInitiativeInEpics.department || viewingInitiativeInEpics.departmentId;
                      if (!dept) return 'Product & Tech';
                      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dept)) {
                        return 'Product & Tech';
                      }
                      return dept;
                    })()}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Created At</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingInitiativeInEpics.createdAt ? new Date(viewingInitiativeInEpics.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Created By</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingInitiativeInEpics.createdByName || 'Admin'}
                  </span>
                </div>
              </div>

              {/* Linked Epics Section */}
              {(() => {
                const childEpics = (viewingInitiativeInEpics.epics && viewingInitiativeInEpics.epics.length > 0)
                  ? viewingInitiativeInEpics.epics
                  : epics.filter(e => e.initiativeId === viewingInitiativeInEpics.id);
                const targetEpicsCount = viewingInitiativeInEpics.epicsCountTarget || 3;
                const createdCount = childEpics.length;

                return (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    {/* Header line & Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">Linked epics</h4>
                        <span className="text-xs font-medium text-gray-500">
                          {createdCount} of {targetEpicsCount} created
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((createdCount / targetEpicsCount) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Epics List */}
                    <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                      {childEpics.map((epic: any) => {
                        const epicStatus = epic.status || 'PLANNED';
                        const isEpicDone = epicStatus === 'DONE' || epicStatus === 'COMPLETED';
                        const isEpicInProgress = epicStatus === 'IN_PROGRESS' || epicStatus === 'ACTIVE';
                        const epicStatusLabel = isEpicDone ? 'Done' : isEpicInProgress ? 'Active' : 'Planned';

                        return (
                          <div
                            key={epic.id}
                            onClick={() => {
                              const foundEpic = epics.find(e => e.id === epic.id || e.epicCode === epic.epicCode);
                              setViewingInitiativeInEpics(null);
                              setViewingEpic(foundEpic || epic);
                            }}
                            className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors">
                                {epic.title}
                              </h5>
                              <p className="text-[11px] text-gray-400 font-medium">
                                {epic.epicCode} • {(epic as any).tasksCount || 0} tasks
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                                isEpicDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                isEpicInProgress ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                              }`}>
                                {epicStatusLabel}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        );
                      })}

                      {/* Uncreated Epic Slots */}
                      {Array.from({ length: Math.max(0, targetEpicsCount - createdCount) }).map((_, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs text-gray-400 font-medium">
                          <span>Epic slot {createdCount + idx + 1} — not created yet</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInitiativeId(viewingInitiativeInEpics.id);
                              setViewingInitiativeInEpics(null);
                              setIsModalOpen(true);
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

      {/* ⚠️ CONFIRMATION POPUP MODAL FOR INITIATIVE DELETION (ADMIN ONLY) */}
      {showDeleteInitiativeConfirm && viewingInitiativeInEpics && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-4">
              <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Strategic Initiative</h3>
                <p className="text-xs text-gray-400 font-medium">Admin Privilege Action</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed font-medium mb-6">
              Are you sure you want to permanently delete initiative{' '}
              <span className="font-bold font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                {viewingInitiativeInEpics.initiativeCode}
              </span>{' '}
              "{viewingInitiativeInEpics.title}"? This will permanently delete all associated epics, sprints, and tasks.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteInitiativeConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingInitiative}
                onClick={async () => {
                  try {
                    setIsDeletingInitiative(true);
                    await fetchApi(`/api/initiatives/${viewingInitiativeInEpics.id}`, { method: 'DELETE' });
                    toast.success(`Initiative ${viewingInitiativeInEpics.initiativeCode} deleted successfully!`);
                    setShowDeleteInitiativeConfirm(false);
                    setViewingInitiativeInEpics(null);
                    loadData();
                  } catch (err: any) {
                    toast.error(err?.message || 'Failed to delete initiative');
                  } finally {
                    setIsDeletingInitiative(false);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingInitiative ? 'Deleting...' : 'Yes, Delete Initiative'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal for Epics */}
      <TaskAssignModal
        isOpen={isTaskAssignModalOpen}
        onClose={() => {
          setIsTaskAssignModalOpen(false);
          setTaskAssignEpic(null);
        }}
        onSubmit={handleCreateTaskForEpic}
        initialEpicId={taskAssignEpic?.id || viewingEpic?.id}
        initialEntityId={(taskAssignEpic?.entityCode || taskAssignEpic?.entity || viewingEpic?.entityCode || viewingEpic?.entity) === 'CAG' ? 'CAG' : 'EHM'}
        initialDepartment={taskAssignEpic?.department || viewingEpic?.department || 'Operations & Delivery'}
      />

      {/* Record History Slide-Over Drawer */}
      {historyTarget && (
        <RecordHistoryPanel
          isOpen={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          tableName="epics"
          recordId={historyTarget.recordId}
          title={historyTarget.title}
          code={historyTarget.code}
        />
      )}
    </div>
  );
};
