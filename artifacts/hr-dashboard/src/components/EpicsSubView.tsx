import React, { useState, useEffect } from 'react';
import { Plus, Layers, Calendar, ArrowRight, ListTodo, Tag, Zap, Eye, Edit3, X, CheckCircle2, User, Search, Filter, Table, Building2, Archive, RotateCcw } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
import { toast } from 'sonner';

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

const DEFAULT_EPICS: EpicItem[] = [
  {
    id: 'ep-1',
    epicCode: 'EHM-EPIC-001',
    title: 'API Gateway Telemetry & Rate Limiting Pipeline',
    description: 'Design and deploy GraphQL telemetry pipelines and Redis rate-limiting middleware.',
    status: 'IN_PROGRESS',
    initiativeId: 'init-1',
    department: 'Product & Tech',
    targetWeek: 'Week 1 (Days 1–7)',
    sprintsCountTarget: 2,
    targetDate: '2026-09-10',
    sprintsCount: 2,
    tasksCount: 4,
    sprints: [],
    tasks: [],
  },
  {
    id: 'ep-2',
    epicCode: 'EHM-EPIC-002',
    title: 'Real-time WebSocket & Push Notification Engine',
    description: 'Redis pub/sub channels setup and concurrency stress testing for push notifications.',
    status: 'DONE',
    initiativeId: 'init-1',
    department: 'Product & Tech',
    targetWeek: 'Week 2 (Days 8–14)',
    sprintsCountTarget: 2,
    targetDate: '2026-09-05',
    sprintsCount: 2,
    tasksCount: 3,
    sprints: [],
    tasks: [],
  },
  {
    id: 'ep-3',
    epicCode: 'EHM-EPIC-003',
    title: 'OAuth2 & Role-Based Access Control Security Audit',
    description: 'Audit JWT bearer scopes, token expiration, and role permissions across all endpoints.',
    status: 'IN_PROGRESS',
    initiativeId: 'init-1',
    department: 'Product & Tech',
    targetWeek: 'Week 3 (Days 15–21)',
    sprintsCountTarget: 3,
    targetDate: '2026-09-15',
    sprintsCount: 3,
    tasksCount: 5,
    sprints: [],
    tasks: [],
  },
  {
    id: 'ep-4',
    epicCode: 'EHM-EPIC-004',
    title: 'Brand Identity & Client Case Study Portfolio',
    description: 'Craft enterprise branding collateral, client pitch decks, and case studies.',
    status: 'IN_PROGRESS',
    initiativeId: 'init-2',
    department: 'Marketing',
    targetWeek: 'Week 1 (Days 1–7)',
    sprintsCountTarget: 2,
    targetDate: '2026-09-12',
    sprintsCount: 2,
    tasksCount: 4,
    sprints: [],
    tasks: [],
  },
  {
    id: 'ep-5',
    epicCode: 'CAG-EPIC-001',
    title: 'Agri-Tech Subsidy & Government Compliance Report',
    description: 'Compile government subsidy documentation and field sensor telemetry analytics.',
    status: 'IN_PROGRESS',
    initiativeId: 'init-3',
    department: 'Grants & Governance',
    targetWeek: 'Week 2 (Days 8–14)',
    sprintsCountTarget: 2,
    targetDate: '2026-09-14',
    sprintsCount: 2,
    tasksCount: 3,
    sprints: [],
    tasks: [],
  },
];

export const EpicsSubView: React.FC<Props> = ({ isManager, onSelectSprint, selectedEpicIdToView, onClearSelectedEpic }) => {
  const [epics, setEpics] = useState<EpicItem[]>(DEFAULT_EPICS);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View & Edit Modal States (Middle Pop Card)
  const [viewingEpic, setViewingEpic] = useState<EpicItem | null>(null);
  const [editingEpic, setEditingEpic] = useState<EpicItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInitiativeId, setEditInitiativeId] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editTargetWeek, setEditTargetWeek] = useState('');
  const [editSprintsCountTarget, setEditSprintsCountTarget] = useState(2);
  const [editStatus, setEditStatus] = useState('PLANNED');

  const loadData = async () => {
    setLoading(true);
    try {
      const [epicsData, initsData, tasksData] = await Promise.all([
        fetchApi<EpicItem[]>('/api/epics'),
        fetchApi<InitiativeOption[]>('/api/initiatives'),
        fetchApi<any[]>('/api/tasks'),
      ]);
      if (epicsData && epicsData.length > 0) {
        setEpics(epicsData);
      } else {
        setEpics(DEFAULT_EPICS);
      }
      setAllTasks(tasksData || []);

      if (initsData && initsData.length > 0) {
        const sortedInits = [...initsData].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        setInitiatives(sortedInits);
        if (!selectedInitiativeId) setSelectedInitiativeId(sortedInits[0].id);
      }
    } catch {
      setEpics(DEFAULT_EPICS);
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
    setEditStatus(epic.status || 'PLANNED');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpic) return;

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
          status: editStatus,
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
    try {
      await fetchApi<any>(`/api/epics/${epicId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      const isArchivedTarget = newStatus === 'DONE' || newStatus === 'COMPLETED' || newStatus === 'ARCHIVED';
      if (isArchivedTarget) {
        toast.success(`Epic ${targetEpic?.epicCode || ''} status updated to ${newStatus} & pushed to Archive!`);
      } else {
        toast.success(`Epic ${targetEpic?.epicCode || ''} status updated to ${newStatus}`);
      }

      setEpics((prev) =>
        prev.map((e) => (e.id === epicId ? { ...e, status: newStatus } : e))
      );
      if (viewingEpic && viewingEpic.id === epicId) {
        setViewingEpic((prev) => (prev ? { ...prev, status: newStatus } : null));
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
    const epicStatus = epic.status || 'PLANNED';
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
        /* 📋 Scalable Compact Table View */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Epic Code</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Epic Title</th>
                  <th className="py-3 px-4">Parent Initiative</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Target Week</th>
                  <th className="py-3 px-4">Linked Tasks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filteredEpics.map((epic) => {
                  const parentInit = initiatives.find((i) => i.id === epic.initiativeId);
                  const epicStatus = epic.status || 'PLANNED';
                  const isDone = epicStatus === 'DONE' || epicStatus === 'COMPLETED' || epicStatus === 'ARCHIVED';
                  const isInProgress = epicStatus === 'IN_PROGRESS' || epicStatus === 'ACTIVE';

                  // Determine Entity Code
                  const entityCode = parentInit?.initiativeCode?.startsWith('CAG') 
                    ? 'CAG' 
                    : (epic.epicCode || '').startsWith('CAG') 
                    ? 'CAG' 
                    : 'EHM';
                  const isCAG = entityCode === 'CAG';

                  const tasksList = epic.tasks || [];

                  return (
                    <tr key={epic.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Epic Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {epic.epicCode}
                        </span>
                      </td>

                      {/* Entity Column */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border font-mono ${
                            isCAG
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isCAG ? 'climagroanalytics' : 'ehmconsultancy'}
                        </span>
                      </td>

                      {/* Epic Title */}
                      <td className="py-3 px-4 font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {epic.title}
                      </td>

                      {/* Parent Initiative (Code Only) */}
                      <td className="py-3 px-4">
                        {parentInit ? (
                          <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {parentInit.initiativeCode}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-semibold text-xs">-</span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4">
                        <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-bold">
                          {epic.department || 'Product & Tech'}
                        </span>
                      </td>

                      {/* Target Week */}
                      <td className="py-3 px-4 text-gray-500 font-semibold">
                        {epic.targetWeek || 'Week 1 (Days 1–7)'}
                      </td>

                      {/* Linked Tasks Dropdown */}
                      <td className="py-3 px-4">
                        {tasksList.length > 0 ? (
                          <select
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 focus:outline-none cursor-pointer shadow-2xs max-w-[150px] truncate"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) setViewingEpic(epic);
                            }}
                            title="View Linked Tasks"
                          >
                            <option value="" disabled>
                              {tasksList.length} Linked Task{tasksList.length > 1 ? 's' : ''}
                            </option>
                            {tasksList.map((tsk: any) => {
                              const isCAG = (epic.epicCode || '').startsWith('CAG');
                              const displayCode = (isCAG && tsk.taskCode?.startsWith('EHM-'))
                                ? tsk.taskCode.replace(/^EHM-/, 'CAG-')
                                : (tsk.taskCode || 'TSK');
                              return (
                                <option key={tsk.id} value={tsk.id}>
                                  [{displayCode}] {tsk.title}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <select
                            disabled
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed max-w-[140px]"
                          >
                            <option>0 Linked Tasks</option>
                          </select>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={epicStatus}
                          onChange={(e) => handleStatusChange(epic.id, e.target.value)}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase border cursor-pointer focus:outline-none transition-all shadow-2xs ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                          }`}
                          title="Change Epic Status (Setting to DONE moves to Archive)"
                        >
                          <option value="PLANNED">PLANNED</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingEpic(epic)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            title="View Full Epic & Details"
                          >
                            <Eye className="w-4 h-4 text-emerald-600" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 👁️ POP CARD DETAILS MODAL */}
      {viewingEpic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Feature Epic Details</h3>

              <button
                onClick={() => {
                  setViewingEpic(null);
                  if (onClearSelectedEpic) onClearSelectedEpic();
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. First: Parent Initiative Code & Title */}
              {(() => {
                const parentInit = initiatives.find((i) => i.id === viewingEpic.initiativeId);
                return (
                  <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Parent Initiative Code: <span className="font-mono text-emerald-700 font-extrabold bg-white px-2 py-0.5 rounded border border-emerald-300">{parentInit?.initiativeCode || viewingEpic.initiativeId}</span></span>
                    </div>
                    <div className="text-xs font-bold text-emerald-900 pl-6">
                      Parent Initiative Title: <span className="font-semibold text-gray-800">{parentInit?.title || 'N/A'}</span>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Second: Epic Code & Title */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                <div className="font-bold text-gray-900">
                  Epic Code: <span className="font-mono text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{viewingEpic.epicCode}</span>
                </div>
                <div className="font-bold text-gray-900">
                  Epic Title: <span className="text-gray-900 font-extrabold">{viewingEpic.title}</span>
                </div>
              </div>

              {/* 3. Third: Description & All Epic Info */}
              <div className="space-y-3">
                {viewingEpic.description && (
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Description</span>
                    <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-200 font-medium">
                      {viewingEpic.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Entity</span>
                    <span className="font-bold text-blue-700 font-mono">
                      {(viewingEpic.epicCode || '').startsWith('CAG') ? 'climagroanalytics' : 'ehmconsultancy'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Department</span>
                    <span className="font-bold text-amber-800">{viewingEpic.department || 'Product & Tech'}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Target Date / Week</span>
                    <span className="font-bold text-purple-700">{viewingEpic.targetWeek || viewingEpic.targetDate || 'Week 1 (Days 1–7)'}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Status</span>
                    <select
                      value={viewingEpic.status || 'PLANNED'}
                      onChange={(e) => handleStatusChange(viewingEpic.id, e.target.value)}
                      className="mt-0.5 text-xs font-extrabold px-2 py-0.5 rounded uppercase border bg-white text-emerald-700 border-emerald-300 focus:outline-none cursor-pointer"
                    >
                      <option value="PLANNED">PLANNED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Fourth: Hanging Tasks Assigned Under Epic */}
              {(() => {
                const isEpicCAG = (viewingEpic.epicCode || '').startsWith('CAG');
                const combined = [
                  ...(viewingEpic.tasks || []),
                  ...allTasks.filter((t: any) => t.epicId === viewingEpic.id || t.parentEpicCode === viewingEpic.epicCode)
                ];
                const linkedTasks = Array.from(new Map(combined.map((t: any) => [t.id || t.taskCode, t])).values());

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
                        {linkedTasks.map((taskItem: any, idx: number) => {
                          const displayTaskCode = isEpicCAG && taskItem.taskCode?.startsWith('EHM-')
                            ? taskItem.taskCode.replace(/^EHM-/, 'CAG-')
                            : (taskItem.taskCode || 'TSK-001');

                          return (
                          <div
                            key={taskItem.id || idx}
                            style={{ animationDelay: `${idx * 100}ms` }}
                            className="relative group transition-all duration-300 animate-in fade-in slide-in-from-top-3"
                          >
                            {/* Visual Hanging Line & Connector Node */}
                            <div className="absolute -left-6 top-4 w-3.5 h-0.5 bg-emerald-400 group-hover:bg-emerald-500 transition-colors" />
                            <div className="absolute -left-6 top-3.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-125 transition-transform" />

                            {/* Hanging Task Card */}
                            <div className="bg-gradient-to-r from-emerald-50/70 via-white to-purple-50/30 p-3.5 rounded-xl border border-gray-200 shadow-2xs group-hover:shadow-md group-hover:border-emerald-400 transition-all cursor-pointer">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-mono font-extrabold text-[11px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                                  {displayTaskCode}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  taskItem.status === 'DONE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                  taskItem.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {taskItem.status || 'TODO'}
                                </span>
                              </div>

                              <h5 className="font-bold text-xs text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                                {taskItem.title}
                              </h5>

                              <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium pt-2 mt-2 border-t border-gray-100">
                                <span className="truncate max-w-[220px]">
                                  <span className="text-gray-400">Assignee:</span> {taskItem.assigneeName || taskItem.assignee || 'admin@example.com'}
                                </span>
                                <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                                  <Calendar className="w-3 h-3 text-emerald-500" />
                                  <span>{taskItem.dueDate ? new Date(taskItem.dueDate).toLocaleDateString() : '2026-09-08'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-400 bg-gray-50/80 rounded-xl border border-dashed border-gray-200">
                        No Tasks created under this Epic yet.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* 5. Fifth: Footer View / Close & Edit Options */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
              {isManager ? (
                <button
                  onClick={() => {
                    const epicToEdit = viewingEpic;
                    setViewingEpic(null);
                    handleStartEdit(epicToEdit);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Epic</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setViewingEpic(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close View
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
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
                <textarea
                  rows={3}
                  placeholder="Technical scope, sprint goals, and acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
    </div>
  );
};
