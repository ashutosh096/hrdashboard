import React, { useState, useEffect } from 'react';
import { Plus, Layers, Calendar, ArrowRight, ListTodo, Tag, Zap, Eye, Edit3, X, CheckCircle2, User, Search, Filter, Table, Building2, Archive, RotateCcw, Pencil, Clock, Target, BarChart3, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
import { toast } from 'sonner';
import { MarkdownViewer } from './MarkdownViewer';
import { RichTextEditor } from './RichTextEditor';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { CalendarPicker } from './CalendarPicker';
import { formatDateTime } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

interface EpicItem {
  id: string;
  epicCode: string;
  title: string;
  description: string;
  status: string;
  initiativeId: string;
  department?: string | null;
  targetWeek?: string | null;
  sprintsCountTarget?: number;
  targetDate: string | null;
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
  const isAdmin = user?.role === 'ADMIN';
  const [epics, setEpics] = useState<EpicItem[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteInitiativeConfirm, setShowDeleteInitiativeConfirm] = useState(false);
  const [isDeletingInitiative, setIsDeletingInitiative] = useState(false);
  const [initiatives, setInitiatives] = useState<InitiativeOption[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: Active vs Archive Mode
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');

  // Scalable Filter & Search Toolbar State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [collapsedInitiativeIds, setCollapsedInitiativeIds] = useState<Record<string, boolean>>({});

  // New Epic Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Product & Tech');
  const [targetWeek, setTargetWeek] = useState('Week 1 (Days 1–7)');
  const [sprintsCountTarget, setSprintsCountTarget] = useState<number>(0);
  const [isClone, setIsClone] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View & Edit Modal States (Middle Pop Card)
  const [viewingEpic, setViewingEpic] = useState<EpicItem | null>(null);
  const [viewingInitiativeInEpics, setViewingInitiativeInEpics] = useState<any | null>(null);
  const [editingEpic, setEditingEpic] = useState<EpicItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInitiativeId, setEditInitiativeId] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editTargetWeek, setEditTargetWeek] = useState('');
  const [editSprintsCountTarget, setEditSprintsCountTarget] = useState<number>(0);
  const [editStatus, setEditStatus] = useState('PLANNED');
  const [selectedTaskToView, setSelectedTaskToView] = useState<TaskItem | null>(null);

  const handleOpenTaskModal = (taskItem: any) => {
    const isCAG = taskItem.entityId === 'cag' || taskItem.taskCode?.startsWith('CAG');
    setSelectedTaskToView({
      id: taskItem.id || 'tsk-1',
      taskId: taskItem.taskCode || taskItem.id || 'CAG-EMP01-001',
      title: taskItem.title || 'Task Deliverable',
      entity: isCAG ? 'climagroanalytics' : 'ehmconsultancy',
      assignee: taskItem.assigneeName || taskItem.assignee || 'admin@example.com',
      reviewingLead: taskItem.reviewingLead || 'Dr. Harshit Mishra',
      status: taskItem.status === 'DONE' ? 'Done' : 'In Progress',
      outputUrl: taskItem.deliverableUrl || taskItem.outputUrl || '',
      waitingOn: 'None (Self)',
      notes: taskItem.description || taskItem.notes || '',
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [epicsData, initsData, tasksData] = await Promise.all([
        fetchApi<EpicItem[]>('/api/epics'),
        fetchApi<InitiativeOption[]>('/api/initiatives'),
        fetchApi<any[]>('/api/tasks'),
      ]);
      setEpics(epicsData || []);
      setAllTasks(tasksData || []);

      if (initsData && initsData.length > 0) {
        const sortedInits = [...initsData].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        setInitiatives(sortedInits);
        if (!selectedInitiativeId) setSelectedInitiativeId(sortedInits[0].id);
      }
    } catch {
      setEpics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleInitsUpdate = () => {
      fetchApi<InitiativeOption[]>('/api/initiatives').then((initsData) => {
        if (initsData && initsData.length > 0) {
          const sortedInits = [...initsData].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          setInitiatives(sortedInits);
        }
      }).catch(() => {});
    };
    window.addEventListener('initiatives-updated', handleInitsUpdate);
    return () => {
      window.removeEventListener('initiatives-updated', handleInitsUpdate);
    };
  }, []);

  // When Create or Edit modal opens, always fetch freshest initiatives list
  useEffect(() => {
    if (isModalOpen || editingEpic) {
      fetchApi<InitiativeOption[]>('/api/initiatives').then((initsData) => {
        if (initsData && initsData.length > 0) {
          const sortedInits = [...initsData].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          setInitiatives(sortedInits);
          if (!selectedInitiativeId && sortedInits[0]) {
            setSelectedInitiativeId(sortedInits[0].id);
          }
        }
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

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter an epic title');
    if (!selectedInitiativeId) return toast.error('Please select a parent initiative');

    setIsSubmitting(true);
    try {
      const created = await fetchApi<any>('/api/epics', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          initiativeId: selectedInitiativeId,
          department,
          targetWeek,
          sprintsCountTarget: sprintsCountTarget > 0 ? sprintsCountTarget : undefined,
        }),
      });
      toast.success(`Epic ${created.epicCode} created successfully!`);
      setTitle('');
      setDescription('');
      setSprintsCountTarget(0);
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
    setEditInitiativeId(epic.initiativeId);
    setEditDepartment(epic.department || 'Product & Tech');
    setEditTargetWeek(epic.targetWeek || 'Week 1 (Days 1–7)');
    setEditSprintsCountTarget(epic.sprintsCountTarget || 0);
    setEditStatus(epic.status === 'COMPLETED' ? 'DONE' : (epic.status || 'PLANNED'));
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
          initiativeId: editInitiativeId,
          department: editDepartment,
          targetWeek: editTargetWeek,
          sprintsCountTarget: editSprintsCountTarget > 0 ? editSprintsCountTarget : 0,
          status: apiStatus,
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Active vs Archived pools
  const activeEpics = epics.filter(e => e.status !== 'DONE' && e.status !== 'COMPLETED' && e.status !== 'ARCHIVED');
  const archivedEpics = epics.filter(e => e.status === 'DONE' || e.status === 'COMPLETED' || e.status === 'ARCHIVED');
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
        /* 📋 Clean Initiative Card Container & Collapsed Gray Sub-line Epics List */
        <div className="space-y-4">
          {initiatives.map((init) => {
            const epicsUnderInit = filteredEpics.filter(
              (e) => e.initiativeId === init.id || e.initiativeId === init.initiativeCode
            );
            if (epicsUnderInit.length === 0) return null;

            const isCollapsed = collapsedInitiativeIds[init.id] !== false;

            return (
              <div key={init.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                {/* Initiative Header Bar */}
                <div 
                  className="bg-gray-50/90 border-b border-gray-200 px-5 py-3 flex items-center justify-between transition-colors select-none"
                >
                  <div 
                    onClick={() => setViewingInitiativeInEpics(init)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:text-emerald-700"
                  >
                    <Target className="w-4 h-4 text-gray-500 shrink-0" />
                    <h4 className="font-bold text-gray-900 text-sm truncate">{init.title}</h4>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                      {init.initiativeCode} • {epicsUnderInit.length} epic{epicsUnderInit.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCollapsedInitiativeIds(prev => ({ ...prev, [init.id]: !isCollapsed }));
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title={isCollapsed ? "Expand Epics Section" : "Collapse Epics Section"}
                  >
                    <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Child Epics List */}
                {!isCollapsed && (
                <div className="divide-y divide-gray-100">
                  {epicsUnderInit.map((epic) => {
                    const rawStatus = epic.status || 'PLANNED';
                    const epicStatus = rawStatus === 'COMPLETED' ? 'DONE' : rawStatus;
                    const isDone = epicStatus === 'DONE' || epicStatus === 'COMPLETED';
                    const isInProgress = epicStatus === 'IN_PROGRESS' || epicStatus === 'ACTIVE';

                    const tasksList = epic.tasks || [];
                    const totalTasks = tasksList.length;
                    const doneTasks = tasksList.filter((t: any) => t.status === 'DONE' || t.status === 'COMPLETED').length;
                    
                    const tasksSummary = totalTasks === 0 
                      ? 'no tasks yet' 
                      : doneTasks > 0 
                      ? `${totalTasks} task${totalTasks > 1 ? 's' : ''}, ${doneTasks} done` 
                      : `${totalTasks} task${totalTasks > 1 ? 's' : ''}`;

                    return (
                      <div 
                        key={epic.id}
                        onClick={() => setViewingEpic(epic)}
                        className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-emerald-50/20 transition-colors cursor-pointer group"
                      >
                        {/* Title & Gray Sub-line */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <h5 className="font-bold text-gray-900 group-hover:text-emerald-700 text-sm transition-colors">
                            {epic.title}
                          </h5>
                          <p className="text-xs text-gray-400 font-medium">
                            {epic.epicCode} • {epic.department || 'Product and tech'} • {tasksSummary}
                          </p>
                        </div>

                        {/* Right: Week, Status Pill & Chevron Arrow */}
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs font-bold text-gray-700">
                            {epic.targetWeek ? epic.targetWeek.split(' ')[0] + ' ' + (epic.targetWeek.split(' ')[1] || '') : 'Week 1'}
                          </span>

                          <span className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all ${
                            isDone 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : isInProgress 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {isDone ? 'Done' : isInProgress ? 'Active' : 'Planned'}
                          </span>

                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            );
          })}

          {/* Standalone / Unassigned Epics fallback */}
          {(() => {
            const unassignedEpics = filteredEpics.filter(
              (e) => !initiatives.some((i) => i.id === e.initiativeId || i.initiativeCode === e.initiativeId)
            );
            if (unassignedEpics.length === 0) return null;

            return (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <div className="bg-gray-50/80 border-b border-gray-200 px-5 py-3.5">
                  <h4 className="font-bold text-gray-500 text-xs uppercase tracking-wider">General / Standalone Epics</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {unassignedEpics.map((epic) => {
                    const rawStatus = epic.status || 'PLANNED';
                    const epicStatus = rawStatus === 'COMPLETED' ? 'DONE' : rawStatus;
                    const isDone = epicStatus === 'DONE' || epicStatus === 'COMPLETED';
                    const isInProgress = epicStatus === 'IN_PROGRESS' || epicStatus === 'ACTIVE';

                    const tasksList = epic.tasks || [];
                    const totalTasks = tasksList.length;
                    const doneTasks = tasksList.filter((t: any) => t.status === 'DONE' || t.status === 'COMPLETED').length;
                    const tasksSummary = totalTasks === 0 ? 'no tasks yet' : doneTasks > 0 ? `${totalTasks} tasks, ${doneTasks} done` : `${totalTasks} tasks`;

                    return (
                      <div 
                        key={epic.id}
                        onClick={() => setViewingEpic(epic)}
                        className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-emerald-50/20 transition-colors cursor-pointer group"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <h5 className="font-bold text-gray-900 group-hover:text-emerald-700 text-sm transition-colors">
                            {epic.title}
                          </h5>
                          <p className="text-xs text-gray-400 font-medium">
                            {epic.epicCode} • {epic.department || 'General'} • {tasksSummary}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs font-bold text-gray-700">
                            {epic.targetWeek ? epic.targetWeek.split(' ')[0] + ' ' + (epic.targetWeek.split(' ')[1] || '') : 'Week 1'}
                          </span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                            isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isInProgress ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {isDone ? 'Done' : isInProgress ? 'Active' : 'Planned'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
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
                const parentInit = initiatives.find((i) => i.id === viewingEpic.initiativeId);
                const parentTitle = parentInit?.title || 'Initiative';
                const isCAG = (viewingEpic.epicCode || '').startsWith('CAG') || parentInit?.initiativeCode?.startsWith('CAG');
                const rawStatus = viewingEpic.status || 'PLANNED';
                const statusLabel = rawStatus === 'COMPLETED' || rawStatus === 'DONE' ? 'Done' : rawStatus === 'IN_PROGRESS' || rawStatus === 'ACTIVE' ? 'In progress' : 'Planned';

                return (
                  <div className="space-y-3">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      {parentInit ? (
                        <span 
                          onClick={() => {
                            setViewingInitiativeInEpics(parentInit);
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
                        {viewingEpic.epicCode}
                      </span>
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase tracking-wide">
                        {isCAG ? 'Climagro' : 'EHM'}
                      </span>
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
                  {viewingEpic.title}
                </h2>
                {viewingEpic.description && (
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {viewingEpic.description}
                  </p>
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

              {/* 3-Column Metadata Grid */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
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
                  <span className="text-xs text-gray-400 font-medium block mb-1">Created</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingEpic.createdAt ? new Date(viewingEpic.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '21 Sept 2026'}
                  </span>
                </div>
              </div>

              {/* Linked Tasks Section with Progress Bar */}
              {(() => {
                const isEpicCAG = (viewingEpic.epicCode || '').startsWith('CAG');
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
                                className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
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
                                className="w-5 h-5 flex items-center justify-center text-xs font-bold text-emerald-700 hover:bg-emerald-100/70 rounded transition-colors"
                                title="Increase Target Tasks Count"
                              >
                                +
                              </button>
                            </div>
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
                        const displayTaskCode = isEpicCAG && taskItem.taskCode?.startsWith('EHM-')
                          ? taskItem.taskCode.replace(/^EHM-/, 'CAG-')
                          : (taskItem.taskCode || 'TSK-001');

                        const assigneeStr = taskItem.assigneeName || taskItem.assignee || 'unassigned';
                        const dateStr = taskItem.createdAt ? new Date(taskItem.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '21 Sept';

                        const isTaskDone = taskItem.status === 'DONE' || taskItem.status === 'COMPLETED';
                        const isTaskInProgress = taskItem.status === 'IN_PROGRESS' || taskItem.status === 'ACTIVE';
                        const taskStatusLabel = isTaskDone ? 'Done' : isTaskInProgress ? 'In progress' : (taskItem.priority === 'URGENT' || taskItem.priority === 'HIGH' || taskItem.priority === 'P1') ? 'P1' : 'Planned';

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

                      {/* Uncreated Task Slots if configured target > linked tasks */}
                      {configuredTarget > linkedTasks.length && Array.from({ length: configuredTarget - linkedTasks.length }).map((_, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs text-gray-400 font-medium">
                          <span>Task slot {linkedTasks.length + idx + 1} — not created yet</span>
                          {isManager && (
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(`Creating Task slot ${linkedTasks.length + idx + 1} for ${viewingEpic.epicCode}`);
                              }}
                              className="px-3 py-1 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
                            >
                              Add
                            </button>
                          )}
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

      {/* MANAGER EDIT EPIC MODAL */}
      {editingEpic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {editingEpic.epicCode}
                </span>
                <h3 className="text-lg font-bold text-gray-900">Edit Feature Epic</h3>
              </div>
              <button
                onClick={() => setEditingEpic(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Parent Initiative */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Parent Initiative *</label>
                <select
                  required
                  value={editInitiativeId}
                  onChange={(e) => setEditInitiativeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                >
                  {initiatives.map((init) => (
                    <option key={init.id} value={init.id}>
                      [{init.initiativeCode}] {init.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Epic Title *</label>
                <input
                  type="text"
                  required
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

              {/* Department & Target Week */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Week / Date</label>
                  <CalendarPicker
                    value={editTargetWeek}
                    onChange={(formatted) => setEditTargetWeek(formatted)}
                    placeholder="e.g. 28 Sep 2026 or Week 1 (Days 1–7)"
                    formatMode="date"
                  />
                </div>
              </div>

              {/* Target Tasks Count & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
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
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW EPIC CREATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Feature Epic</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Level 2 Breakdown
              </span>
            </div>

            <form onSubmit={handleCreateEpic} className="space-y-4">
              {/* Parent Initiative Selection (Alphabetical Order) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Parent Initiative *</label>
                <select
                  required
                  value={selectedInitiativeId}
                  onChange={(e) => setSelectedInitiativeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                >
                  {initiatives.map((init) => (
                    <option key={init.id} value={init.id}>
                      [{init.initiativeCode}] {init.title}
                    </option>
                  ))}
                </select>
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

              {/* Department & Target Week */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Week / Date</label>
                  <CalendarPicker
                    value={targetWeek}
                    onChange={(formatted) => setTargetWeek(formatted)}
                    placeholder="e.g. 28 Sep 2026 or Week 1 (Days 1–7)"
                    formatMode="date"
                  />
                </div>
              </div>

              {/* Planned Tasks Target */}
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
                      Check this box to duplicate an existing Feature Epic configuration into a new sequence code under this initiative.
                    </p>
                  </div>
                </label>

                {isClone && (
                  <div className="pt-2 border-t border-purple-200/60 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Select Existing Feature Epic to Clone From (Optional):
                    </label>
                    <select
                      value={cloneSourceId}
                      onChange={(e) => {
                        setCloneSourceId(e.target.value);
                        const source = epics.find(ep => ep.id === e.target.value);
                        if (source) {
                          setTitle(`${source.title} (Clone)`);
                          setDescription(source.description || '');
                          if (source.initiativeId) setSelectedInitiativeId(source.initiativeId);
                          if (source.department) setDepartment(source.department);
                          if (source.targetWeek) setTargetWeek(source.targetWeek);
                          if (source.sprintsCountTarget) setSprintsCountTarget(source.sprintsCountTarget);
                          toast.success(`Form pre-filled with data from "${source.title}"!`);
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-xl bg-white font-bold text-purple-950 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Choose Existing Epic to Auto-Fill --</option>
                      {epics.map(ep => (
                        <option key={ep.id} value={ep.id}>
                          [{ep.epicCode}] {ep.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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

      {/* 🚀 BIG VIEW MODE MODAL FOR STRATEGIC INITIATIVE (EXACT IMAGE 1 DESIGN) */}
      {viewingInitiativeInEpics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 text-left select-none">
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
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                      {statusLabel}
                    </span>
                  </div>
                );
              })()}

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  {viewingInitiativeInEpics.title}
                </h2>
                {viewingInitiativeInEpics.description && (
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {viewingInitiativeInEpics.description}
                  </p>
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

              {/* 3-Column Metadata Grid */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
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
                  <span className="text-xs text-gray-400 font-medium block mb-1">Created</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingInitiativeInEpics.createdAt ? new Date(viewingInitiativeInEpics.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '21 Sept 2026'}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 select-none">
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
    </div>
  );
};
