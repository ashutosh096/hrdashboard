import React, { useState, useEffect } from 'react';
import { Plus, Layers, Calendar, ArrowRight, ListTodo, Tag, Zap, Eye, Edit3, X, CheckCircle2, User, Search, Filter, Table, Building2, Archive, RotateCcw, Pencil, Clock, Target, BarChart3, ChevronRight } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
import { toast } from 'sonner';
import { MarkdownViewer } from './MarkdownViewer';
import { RichTextEditor } from './RichTextEditor';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { formatDateTime } from '../utils/dateUtils';

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
  const [epics, setEpics] = useState<EpicItem[]>([]);
  const [initiatives, setInitiatives] = useState<InitiativeOption[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: Active vs Archive Mode
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');

  // Scalable Filter & Search Toolbar State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PLANNED' | 'IN_PROGRESS' | 'DONE'>('ALL');

  // New Epic Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Product & Tech');
  const [targetWeek, setTargetWeek] = useState('Week 1 (Days 1–7)');
  const [sprintsCountTarget, setSprintsCountTarget] = useState(2);
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
  const [editSprintsCountTarget, setEditSprintsCountTarget] = useState(2);
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
  }, []);

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
          sprintsCountTarget,
        }),
      });
      toast.success(`Epic ${created.epicCode} created successfully!`);
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
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
    setEditSprintsCountTarget(epic.sprintsCountTarget || 2);
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
          sprintsCountTarget: editSprintsCountTarget,
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

            return (
              <div key={init.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                {/* Initiative Header Bar */}
                <div 
                  onClick={() => setViewingInitiativeInEpics(init)}
                  className="bg-gray-50/90 border-b border-gray-200 px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Target className="w-4 h-4 text-gray-500 shrink-0" />
                    <h4 className="font-bold text-gray-900 text-sm truncate">{init.title}</h4>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                      {init.initiativeCode} • {epicsUnderInit.length} epic{epicsUnderInit.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Child Epics List */}
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
                    {viewingEpic.department || 'Product and tech'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Created</span>
                  <span className="text-xs font-bold text-gray-900 block">
                    {viewingEpic.createdAt ? new Date(viewingEpic.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '8 Sep 2026'}
                  </span>
                </div>
              </div>

              {/* Linked Tasks Section */}
              {(() => {
                const isEpicCAG = (viewingEpic.epicCode || '').startsWith('CAG');
                const combined = [
                  ...(viewingEpic.tasks || []),
                  ...allTasks.filter((t: any) => t.epicId === viewingEpic.id || t.parentEpicCode === viewingEpic.epicCode)
                ];
                const linkedTasks = Array.from(new Map(combined.map((t: any) => [t.id || t.taskCode, t])).values());
                const doneCount = linkedTasks.filter((t: any) => t.status === 'DONE' || t.status === 'COMPLETED').length;

                return (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">Linked tasks</h4>
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{doneCount} of {linkedTasks.length} done</span>
                      </span>
                    </div>

                    {linkedTasks.length > 0 ? (
                      <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                        {linkedTasks.map((taskItem: any, idx: number) => {
                          const displayTaskCode = isEpicCAG && taskItem.taskCode?.startsWith('EHM-')
                            ? taskItem.taskCode.replace(/^EHM-/, 'CAG-')
                            : (taskItem.taskCode || 'TSK-001');

                          const assigneeStr = taskItem.assigneeName || taskItem.assignee || 'unassigned';
                          const dateStr = taskItem.createdAt ? new Date(taskItem.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '18 Sep';

                          const isTaskDone = taskItem.status === 'DONE' || taskItem.status === 'COMPLETED';
                          const isTaskInProgress = taskItem.status === 'IN_PROGRESS' || taskItem.status === 'ACTIVE';
                          const taskStatusLabel = isTaskDone ? 'Done' : isTaskInProgress ? 'In progress' : (taskItem.priority === 'URGENT' || taskItem.priority === 'HIGH' || taskItem.priority === 'P1') ? 'P1' : 'P2';

                          return (
                            <div
                              key={taskItem.id || idx}
                              onClick={() => handleOpenTaskModal(taskItem)}
                              className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <h5 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors">
                                  {taskItem.title}
                                </h5>
                                <p className="text-[11px] text-gray-400 font-medium">
                                  {displayTaskCode} • {assigneeStr} • {dateStr}
                                </p>
                              </div>

                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                                isTaskDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                isTaskInProgress ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                taskStatusLabel === 'P1' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                              }`}>
                                {taskStatusLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-gray-400 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                        No tasks created under this epic yet.
                      </div>
                    )}

                    {/* Add Task Button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          toast.info(`Task creation for ${viewingEpic.epicCode} initiated`);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
                      >
                        Add task
                      </button>
                    </div>
                  </div>
                );
              })()}
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Week *</label>
                  <select
                    value={editTargetWeek}
                    onChange={(e) => setEditTargetWeek(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    {TARGET_WEEK_OPTIONS.map((week) => (
                      <option key={week} value={week}>
                        {week}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Week *</label>
                  <select
                    value={targetWeek}
                    onChange={(e) => setTargetWeek(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    {TARGET_WEEK_OPTIONS.map((week) => (
                      <option key={week} value={week}>
                        {week}
                      </option>
                    ))}
                  </select>
                </div>
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
        isReadOnly={true}
      />

      {/* Strategic Initiative Details Modal (Exact Image 1 layout) */}
      {viewingInitiativeInEpics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto select-none">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    Strategic Initiative Details
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold">
                    Full breakdown of goal, metadata, and linked epics
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingInitiativeInEpics(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {/* Section 1: Initiative Title */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Initiative Title
                </span>
                <h2 className="text-xl font-black text-gray-900 tracking-tight leading-snug">
                  {viewingInitiativeInEpics.title}
                </h2>
              </div>

              {/* Section 2: Initiative Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Initiative Code
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {viewingInitiativeInEpics.initiativeCode || viewingInitiativeInEpics.code || 'CAG-INIT'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Entity / Brand
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {(viewingInitiativeInEpics.initiativeCode || '').startsWith('CAG') ? 'CLIMAGRO' : 'EHM'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Due Date / Target Month
                  </span>
                  <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>{viewingInitiativeInEpics.targetMonth || 'Month 1 (Weeks 1–4)'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Posting Date & Time
                  </span>
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formatDateTime(viewingInitiativeInEpics.createdAt)}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Department & Track
                  </span>
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>{viewingInitiativeInEpics.subDepartment || viewingInitiativeInEpics.departmentId || 'Product & Tech'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Current Status
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded uppercase border bg-blue-100 text-blue-800 border-blue-300 inline-block">
                    {viewingInitiativeInEpics.status || 'IN_PROGRESS'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Target Epics Division
                  </span>
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{viewingInitiativeInEpics.epicsCount || 0} / {viewingInitiativeInEpics.epicsCountTarget || 3} Epics</span>
                  </span>
                </div>
              </div>

              {/* Section 3: Target Deliverable Metric Goal */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target Deliverable Metric Goal</span>
                </h4>
                {viewingInitiativeInEpics.targetDeliverableMetric ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs font-bold text-emerald-950">
                    {viewingInitiativeInEpics.targetDeliverableMetric}
                  </div>
                ) : (
                  <p className="text-xs italic text-gray-400">No deliverable metric target specified.</p>
                )}
              </div>

              {/* Section 4: Detailed Description */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                  Initiative Description
                </h4>
                {viewingInitiativeInEpics.description ? (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-800">
                    <MarkdownViewer content={viewingInitiativeInEpics.description} />
                  </div>
                ) : (
                  <p className="text-xs italic text-gray-400">No description provided.</p>
                )}
              </div>

              {/* Section 5: Linked Epics */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Linked Epics ({viewingInitiativeInEpics.epics?.length || 0} / {viewingInitiativeInEpics.epicsCountTarget || 3} Planned)</span>
                  </h4>
                </div>

                {viewingInitiativeInEpics.epics && viewingInitiativeInEpics.epics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingInitiativeInEpics.epics.map((epic: any) => {
                      const epicStatus = epic.status || 'PLANNED';
                      return (
                        <div
                          key={epic.id}
                          onClick={() => {
                            const foundEpic = epics.find(e => e.id === epic.id || e.epicCode === epic.epicCode);
                            setViewingInitiativeInEpics(null);
                            setViewingEpic(foundEpic || epic);
                          }}
                          className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between text-left"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Epic Code</span>
                                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {epic.epicCode}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5 text-right">Status</span>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-blue-100 text-blue-800 border-blue-300">
                                  {epicStatus}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Epic Title</span>
                              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                {epic.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs font-bold text-emerald-600">
                            <span>View Epic Details</span>
                            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    No Epics created under this Initiative yet.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingInitiativeInEpics(null)}
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
