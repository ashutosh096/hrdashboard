import React, { useState, useEffect } from 'react';
import { Plus, X, Target, Calendar, Layers, ArrowRight, Tag, BarChart3, AlertCircle, Archive, Building2, Pencil, Save, Zap, ListTodo } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { MarkdownViewer } from './MarkdownViewer';
import { RichTextEditor } from './RichTextEditor';

interface InitiativeItem {
  id: string;
  initiativeCode: string;
  title: string;
  description: string;
  status: string;
  entityId: string;
  entityName?: string;
  entityCode?: string;
  departmentId?: string | null;
  subDepartment?: string | null;
  targetMonth?: string | null;
  epicsCountTarget?: number;
  targetDeliverableMetric?: string | null;
  targetDate: string | null;
  epicsCount: number;
  epics: Array<{
    id: string;
    epicCode: string;
    title: string;
    status: string;
    targetDate: string | null;
  }>;
}

interface Props {
  isManager: boolean;
  onSelectEpic: (epicId: string, parentInitiativeId?: string) => void;
  selectedInitiativeIdToView?: string | null;
  onClearSelectedInitiative?: () => void;
}

const ENTITY_OPTIONS = [
  { id: 'ehmconsultancy', name: 'EHM', code: 'EHM' },
  { id: 'climagroanalytics', name: 'CLIMAGRO', code: 'CAG' },
];

const DEPARTMENT_OPTIONS = [
  'Marketing',
  'Sales',
  'Product & Tech',
  'Operations & Delivery',
  'Grants & Governance',
];

export const InitiativesSubView: React.FC<Props> = ({ isManager, onSelectEpic, selectedInitiativeIdToView, onClearSelectedInitiative }) => {
  const [initiatives, setInitiatives] = useState<InitiativeItem[]>([]);
  const [viewingInitiative, setViewingInitiative] = useState<InitiativeItem | null>(null);
  const [viewingEpicDetails, setViewingEpicDetails] = useState<any | null>(null);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: Active vs Archive Mode
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');

  // Modal Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEntityId, setEditEntityId] = useState('ehmconsultancy');
  const [editSubDepartment, setEditSubDepartment] = useState('');
  const [editTargetMonth, setEditTargetMonth] = useState('Month 1 (Weeks 1–4)');
  const [editEpicsCountTarget, setEditEpicsCountTarget] = useState(3);
  const [editTargetDeliverableMetric, setEditTargetDeliverableMetric] = useState('');
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

  // Status Change Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    initiative: InitiativeItem | null;
    newStatus: string;
  }>({
    isOpen: false,
    initiative: null,
    newStatus: '',
  });

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entityId, setEntityId] = useState('ehmconsultancy');
  const [departmentName, setDepartmentName] = useState('Marketing');
  const [subDepartment, setSubDepartment] = useState('');
  const [targetMonth, setTargetMonth] = useState('Month 1 (Weeks 1–4)');
  const [epicsCountTarget, setEpicsCountTarget] = useState(3);
  const [targetDeliverableMetric, setTargetDeliverableMetric] = useState('');
  const [isClone, setIsClone] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const initData = await fetchApi<InitiativeItem[]>('/api/initiatives');
      setInitiatives(initData || []);
    } catch (err) {
      setInitiatives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedInitiativeIdToView && initiatives.length > 0) {
      const match = initiatives.find(
        (i) => i.id === selectedInitiativeIdToView || i.initiativeCode === selectedInitiativeIdToView
      );
      if (match) {
        setViewingInitiative(match);
        setTimeout(() => {
          const el = document.getElementById(`initiative-card-${match.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    }
  }, [selectedInitiativeIdToView, initiatives]);

  const startEditMode = () => {
    if (!viewingInitiative) return;
    setEditTitle(viewingInitiative.title);
    setEditDescription(viewingInitiative.description || '');
    setEditEntityId(viewingInitiative.entityId || 'ehmconsultancy');
    setEditSubDepartment(viewingInitiative.subDepartment || '');
    setEditTargetMonth(viewingInitiative.targetMonth || 'Month 1 (Weeks 1–4)');
    setEditEpicsCountTarget(viewingInitiative.epicsCountTarget || 3);
    setEditTargetDeliverableMetric(viewingInitiative.targetDeliverableMetric || '');
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
  };

  const handleEpicStatusChange = async (epicId: string, newStatus: string) => {
    try {
      await fetchApi(`/api/epics/${epicId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Epic status updated to ${newStatus}`);
      if (viewingEpicDetails && viewingEpicDetails.id === epicId) {
        setViewingEpicDetails((prev: any) => (prev ? { ...prev, status: newStatus } : null));
      }
      loadData();
    } catch (err) {
      toast.error('Failed to update epic status');
    }
  };

  const handleSaveInitiativeEdits = async () => {
    if (!viewingInitiative) return;
    setIsSubmitting(true);
    try {
      await fetchApi(`/api/initiatives/${viewingInitiative.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          entityId: editEntityId,
          subDepartment: editSubDepartment,
          targetMonth: editTargetMonth,
          epicsCountTarget: editEpicsCountTarget,
          targetDeliverableMetric: editTargetDeliverableMetric,
        }),
      });

      toast.success(`Initiative ${viewingInitiative.initiativeCode} updated successfully!`);
      setShowSaveConfirmModal(false);
      setIsEditMode(false);
      await loadData();

      setViewingInitiative((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle,
              description: editDescription,
              entityId: editEntityId,
              subDepartment: editSubDepartment,
              targetMonth: editTargetMonth,
              epicsCountTarget: editEpicsCountTarget,
              targetDeliverableMetric: editTargetDeliverableMetric,
            }
          : null
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update initiative details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStatusConfirmModal = (initiative: InitiativeItem, targetStatus: string) => {
    setConfirmModal({
      isOpen: true,
      initiative,
      newStatus: targetStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmModal.initiative || !confirmModal.newStatus) return;

    const { id, initiativeCode } = confirmModal.initiative;
    const targetStatus = confirmModal.newStatus;

    setIsSubmitting(true);
    try {
      await fetchApi(`/api/initiatives/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: targetStatus }),
      });

      if (targetStatus === 'DONE' || targetStatus === 'COMPLETED') {
        toast.success(`Initiative ${initiativeCode} completed & moved to Archive!`);
      } else {
        toast.success(`Initiative ${initiativeCode} status updated to ${targetStatus}`);
      }

      setConfirmModal({ isOpen: false, initiative: null, newStatus: '' });
      loadData();
      if (viewingInitiative && viewingInitiative.id === id) {
        setViewingInitiative((prev) => prev ? { ...prev, status: targetStatus } : null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update initiative status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInitiative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter an initiative title');

    setIsSubmitting(true);
    try {
      const created = await fetchApi<any>('/api/initiatives', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          entityId,
          subDepartment: `${departmentName}${subDepartment ? ' - ' + subDepartment : ''}`,
          targetMonth,
          epicsCountTarget,
          targetDeliverableMetric,
        }),
      });
      toast.success(`Initiative ${created.initiativeCode} created successfully!`);
      setTitle('');
      setDescription('');
      setSubDepartment('');
      setTargetMonth('Month 1 (Weeks 1–4)');
      setEpicsCountTarget(3);
      setTargetDeliverableMetric('');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create initiative');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Initiatives by Active vs Archive
  const activeInitiatives = initiatives.filter(i => i.status !== 'DONE' && i.status !== 'COMPLETED');
  const archivedInitiatives = initiatives.filter(i => i.status === 'DONE' || i.status === 'COMPLETED');
  const displayedInitiatives = viewMode === 'ACTIVE' ? activeInitiatives : archivedInitiatives;

  return (
    <div className="space-y-6 select-none">
      {/* Header & Create Action / Archive Toggle Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{viewMode === 'ACTIVE' ? 'Strategic Initiatives' : 'Archived Initiatives'}</span>
            {viewMode === 'ARCHIVE' && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                Archive Mode ({archivedInitiatives.length})
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            {viewMode === 'ACTIVE'
              ? 'Long-term organizational goals & milestones currently active.'
              : 'Completed & archived strategic initiatives.'}
          </p>
        </div>

        {/* Action Buttons: Archive Mode Toggle & New Initiative */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode(viewMode === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
              viewMode === 'ARCHIVE'
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            <Archive className="w-4 h-4 text-purple-500" />
            <span>{viewMode === 'ARCHIVE' ? 'Back to Active' : `Archive (${archivedInitiatives.length})`}</span>
          </button>

          {isManager && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Initiative</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading initiatives from database...</div>
      ) : displayedInitiatives.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
          {viewMode === 'ARCHIVE' ? (
            <>
              <Archive className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">No Archived Initiatives</p>
              <p className="text-xs text-gray-400 mt-1">When an initiative is marked as Done, it automatically moves to this Archive.</p>
            </>
          ) : (
            <>
              <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">No Active Initiatives created yet</p>
              {isManager && <p className="text-xs text-gray-400 mt-1">Click "New Initiative" above to plan a new goal.</p>}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedInitiatives.map((item) => {
            const targetMonthStr = item.targetMonth || 'Month 1 (Weeks 1–4)';
            const epicsDivision = item.epicsCountTarget || 3;

            const isDone = item.status === 'DONE' || item.status === 'COMPLETED';
            const isInProgress = item.status === 'ACTIVE' || item.status === 'IN_PROGRESS';

            const isSelected = selectedInitiativeIdToView === item.id || selectedInitiativeIdToView === item.initiativeCode;

            return (
              <div
                key={item.id}
                id={`initiative-card-${item.id}`}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-gray-200'
                }`}
              >
                {/* Main Card Line - View button triggers Big View Mode */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {/* Main Screen badges in exact order: 1. Code -> 2. Entity -> 3. Due Date -> 4. Department */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* 1. Code */}
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {item.initiativeCode}
                      </span>

                      {/* 2. Entity */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/90 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        <span>
                          {(item.entityName || item.initiativeCode || '').toLowerCase().includes('cag') || (item.entityName || '').toLowerCase().includes('climagro')
                            ? 'CLIMAGRO'
                            : 'EHM'}
                        </span>
                      </span>

                      {/* 3. Due Date / Target Month */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{targetMonthStr}</span>
                      </span>

                      {/* 4. Department */}
                      {item.subDepartment && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{item.subDepartment}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 shrink-0">
                        Title:
                      </span>
                      <h4 className="text-base font-bold text-gray-900">{item.title}</h4>
                    </div>

                    {item.description && (
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 shrink-0">
                          Description:
                        </span>
                        <p className="text-xs text-gray-500 font-medium line-clamp-1">{item.description}</p>
                      </div>
                    )}

                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium shrink-0">
                    {/* Status Dropdown (Moved to Red Marked spot on Right Side) */}
                    <select
                      value={isDone ? 'DONE' : isInProgress ? 'ACTIVE' : 'PLANNED'}
                      onChange={(e) => openStatusConfirmModal(item, e.target.value)}
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-xl uppercase border cursor-pointer outline-none transition-colors shadow-xs ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      <option value="PLANNED">PLANNED</option>
                      <option value="ACTIVE">IN PROGRESS</option>
                      <option value="DONE">DONE (COMPLETED)</option>
                    </select>

                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 font-bold">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {item.epicsCount} / {epicsDivision} Epics
                      </span>
                    </div>

                    {/* ONLY trigger to open Big View Mode Modal */}
                    <button
                      onClick={() => {
                        setViewingInitiative(item);
                        setIsEditMode(false);
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🚀 BIG VIEW MODE MODAL FOR STRATEGIC INITIATIVE */}
      {viewingInitiative && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    {isEditMode ? 'Edit Strategic Initiative' : 'Strategic Initiative Details'}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold">
                    {isEditMode ? 'Modify goal parameters and save changes' : 'Full breakdown of goal, metadata, and linked epics'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isManager && (
                  <button
                    type="button"
                    onClick={isEditMode ? cancelEditMode : startEditMode}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      isEditMode
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{isEditMode ? 'Cancel Edit' : 'Edit Initiative'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setViewingInitiative(null);
                    setIsEditMode(false);
                    onClearSelectedInitiative?.();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Section 1: Initiative Title */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Initiative Title
                </span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-bold text-gray-900 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                ) : (
                  <h2 className="text-xl font-black text-gray-900 tracking-tight leading-snug">
                    {viewingInitiative.title}
                  </h2>
                )}
              </div>

              {/* Section 2: Initiative Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Initiative Code
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {viewingInitiative.initiativeCode}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Entity / Brand
                  </span>
                  {isEditMode ? (
                    <select
                      value={editEntityId}
                      onChange={(e) => setEditEntityId(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-lg bg-white"
                    >
                      {ENTITY_OPTIONS.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-gray-900">
                      {(viewingInitiative.entityName || viewingInitiative.initiativeCode || '').toLowerCase().includes('cag') || (viewingInitiative.entityName || '').toLowerCase().includes('climagro')
                        ? 'CLIMAGRO'
                        : 'EHM'}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Due Date / Target Month
                  </span>
                  {isEditMode ? (
                    <select
                      value={editTargetMonth}
                      onChange={(e) => setEditTargetMonth(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-lg bg-white"
                    >
                      <option value="Month 1 (Weeks 1–4)">Month 1 (Weeks 1–4)</option>
                      <option value="Month 2 (Weeks 5–8)">Month 2 (Weeks 5–8)</option>
                      <option value="Month 3 (Weeks 9–12)">Month 3 (Weeks 9–12)</option>
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      <span>{viewingInitiative.targetMonth || 'Month 1 (Weeks 1–4)'}</span>
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Department & Track
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editSubDepartment}
                      onChange={(e) => setEditSubDepartment(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-lg bg-white"
                    />
                  ) : (
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>{viewingInitiative.subDepartment || viewingInitiative.departmentId || 'General'}</span>
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Current Status
                  </span>
                  <select
                    value={viewingInitiative.status === 'DONE' || viewingInitiative.status === 'COMPLETED' ? 'DONE' : viewingInitiative.status === 'ACTIVE' || viewingInitiative.status === 'IN_PROGRESS' ? 'ACTIVE' : 'PLANNED'}
                    onChange={(e) => openStatusConfirmModal(viewingInitiative, e.target.value)}
                    className={`text-xs font-extrabold px-2 py-0.5 rounded uppercase border cursor-pointer outline-none transition-colors ${
                      viewingInitiative.status === 'DONE' || viewingInitiative.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : viewingInitiative.status === 'ACTIVE' || viewingInitiative.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="ACTIVE">IN PROGRESS</option>
                    <option value="DONE">DONE (COMPLETED)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Target Epics Division
                  </span>
                  {isEditMode ? (
                    <select
                      value={editEpicsCountTarget}
                      onChange={(e) => setEditEpicsCountTarget(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-lg bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                        <option key={num} value={num}>{num} Epics</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{viewingInitiative.epicsCount || 0} / {viewingInitiative.epicsCountTarget || 3} Epics</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Section 3: Target Deliverable Metric Goal */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target Deliverable Metric Goal</span>
                </h4>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editTargetDeliverableMetric}
                    onChange={(e) => setEditTargetDeliverableMetric(e.target.value)}
                    placeholder="e.g. 99.9% Uptime, 50k MAU Growth"
                    className="w-full px-3.5 py-2 text-xs font-medium border border-emerald-300 rounded-xl bg-white focus:outline-none"
                  />
                ) : viewingInitiative.targetDeliverableMetric ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs font-bold text-emerald-950">
                    {viewingInitiative.targetDeliverableMetric}
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
                {isEditMode ? (
                  <RichTextEditor
                    value={editDescription}
                    onChange={setEditDescription}
                    placeholder="Comprehensive goal summary, deliverables, and outcome objectives..."
                    rows={4}
                  />
                ) : viewingInitiative.description ? (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-800">
                    <MarkdownViewer content={viewingInitiative.description} />
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
                    <span>Linked Epics ({viewingInitiative.epics?.length || 0} / {viewingInitiative.epicsCountTarget || 3} Planned)</span>
                  </h4>
                </div>

                {viewingInitiative.epics && viewingInitiative.epics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingInitiative.epics.map((epic) => {
                      const epicStatus = epic.status || 'PLANNED';
                      const isEpicDone = epicStatus === 'DONE' || epicStatus === 'COMPLETED';
                      const isEpicInProgress = epicStatus === 'IN_PROGRESS' || epicStatus === 'ACTIVE';

                      return (
                        <div
                          key={epic.id}
                          onClick={async () => {
                            try {
                              const fullEpic = await fetchApi<any>(`/api/epics/${epic.id}`).catch(() => epic);
                              const tasksData = await fetchApi<any[]>('/api/tasks').catch(() => []);
                              setAllTasks(tasksData || []);
                              setViewingEpicDetails(fullEpic || epic);
                            } catch (e) {
                              setViewingEpicDetails(epic);
                            }
                          }}
                          className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
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
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                                    isEpicDone
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold'
                                      : isEpicInProgress
                                      ? 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold'
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}
                                >
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
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={cancelEditMode}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel Edit
                  </button>
                  <button
                    onClick={() => setShowSaveConfirmModal(true)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setViewingInitiative(null);
                    setIsEditMode(false);
                    onClearSelectedInitiative?.();
                  }}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Close View Mode
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ CONFIRMATION POPUP MODAL FOR SAVE EDIT CHANGES */}
      {showSaveConfirmModal && viewingInitiative && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirm Save Changes</h3>
                <p className="text-xs text-gray-400 font-medium">Please review before saving updates.</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed font-medium mb-6">
              Are you sure you want to save the edited changes for Initiative{' '}
              <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {viewingInitiative.initiativeCode}
              </span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowSaveConfirmModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveInitiativeEdits}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                {isSubmitting ? 'Saving...' : 'Yes, Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ⚠️ CONFIRMATION POPUP MODAL FOR STATUS CHANGE */}
      {confirmModal.isOpen && confirmModal.initiative && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-4">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirm Status Change</h3>
                <p className="text-xs text-gray-400 font-medium">Please confirm before updating milestone status.</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                Are you sure you want to mark Initiative{' '}
                <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {confirmModal.initiative.initiativeCode}
                </span>{' '}
                (<span className="font-bold text-gray-900">{confirmModal.initiative.title}</span>) as{' '}
                <span className="font-extrabold uppercase text-emerald-600 underline">
                  {confirmModal.newStatus === 'ACTIVE'
                    ? 'IN PROGRESS'
                    : confirmModal.newStatus === 'DONE'
                    ? 'DONE (ARCHIVED)'
                    : confirmModal.newStatus}
                </span>
                ?
              </p>
              {confirmModal.newStatus === 'DONE' && (
                <p className="text-[11px] text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-200 font-semibold">
                  📦 Note: Marking as DONE will automatically move this initiative into the Archive view.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, initiative: null, newStatus: '' })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                {isSubmitting ? 'Updating...' : 'Yes, Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal for Creating Initiative */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Strategic Initiative</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Agile Setup
              </span>
            </div>

            <form onSubmit={handleCreateInitiative} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Initiative Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Cloud Infrastructure & Security Hardening"
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
                  placeholder="Comprehensive goal summary, deliverables, and outcome objectives..."
                  rows={3}
                />
              </div>

              {/* Brand / Entity & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand / Entity *</label>
                  <select
                    required
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    {ENTITY_OPTIONS.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    required
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
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

              {/* Sub-Department / Track */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sub-Department / Track</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Architecture, Frontend UI, Mobile App, Data Pipeline"
                  value={subDepartment}
                  onChange={(e) => setSubDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Target Deliverable Metric */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Deliverable Metric</label>
                <input
                  type="text"
                  placeholder="e.g. 99.9% Uptime, 50k MAU Growth, 100% OAuth Security Pass"
                  value={targetDeliverableMetric}
                  onChange={(e) => setTargetDeliverableMetric(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Target Month & How many Epics division for this */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Month *</label>
                  <select
                    required
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    <option value="Month 1 (Weeks 1–4)">Month 1 (Weeks 1–4)</option>
                    <option value="Month 2 (Weeks 5–8)">Month 2 (Weeks 5–8)</option>
                    <option value="Month 3 (Weeks 9–12)">Month 3 (Weeks 9–12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">How many Epics division for this? *</label>
                  <select
                    value={epicsCountTarget}
                    onChange={(e) => setEpicsCountTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                  >
                    <option value={1}>1 Epic</option>
                    <option value={2}>2 Epics</option>
                    <option value={3}>3 Epics</option>
                    <option value={4}>4 Epics</option>
                    <option value={5}>5 Epics</option>
                    <option value={6}>6 Epics</option>
                    <option value={8}>8 Epics</option>
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
                      Check this box to duplicate an existing Strategic Initiative configuration into a new sequence code.
                    </p>
                  </div>
                </label>

                {isClone && (
                  <div className="pt-2 border-t border-purple-200/60 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Select Existing Initiative to Clone From (Optional):
                    </label>
                    <select
                      value={cloneSourceId}
                      onChange={(e) => {
                        setCloneSourceId(e.target.value);
                        const source = initiatives.find(i => i.id === e.target.value);
                        if (source) {
                          setTitle(`${source.title} (Clone)`);
                          setDescription(source.description || '');
                          if (source.entityId) setEntityId(source.entityId);
                          if (source.subDepartment) setSubDepartment(source.subDepartment);
                          if (source.targetMonth) setTargetMonth(source.targetMonth);
                          if (source.epicsCountTarget) setEpicsCountTarget(source.epicsCountTarget);
                          if (source.targetDeliverableMetric) setTargetDeliverableMetric(source.targetDeliverableMetric || '');
                          toast.success(`Form pre-filled with data from "${source.title}"!`);
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-xl bg-white font-bold text-purple-950 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Choose Existing Initiative to Auto-Fill --</option>
                      {initiatives.map(i => (
                        <option key={i.id} value={i.id}>
                          [{i.initiativeCode}] {i.title}
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
                  {isSubmitting ? 'Creating...' : 'Create Initiative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ POP CARD EPIC DETAILS MODAL (OPENED OVER INITIATIVE) */}
      {viewingEpicDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 text-left select-none">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Feature Epic Details</h3>
                  <p className="text-[11px] text-gray-400 font-semibold">
                    Full breakdown of goal, metadata, and linked tasks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingEpicDetails(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* 1. Epic Title */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Epic Title
                </span>
                <h2 className="text-xl font-black text-gray-900 tracking-tight leading-snug">
                  {viewingEpicDetails.title}
                </h2>
              </div>

              {/* 2. Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Epic Code
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {viewingEpicDetails.epicCode}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Entity / Brand
                  </span>
                  <span className="text-xs font-bold text-blue-700 font-mono">
                    {(viewingEpicDetails.epicCode || '').startsWith('CAG') ? 'CLIMAGRO' : 'EHM'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Target Date / Week
                  </span>
                  <span className="text-xs font-bold text-purple-700">
                    {viewingEpicDetails.targetWeek || viewingEpicDetails.targetDate || 'Week 1 (Days 1–7)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Status
                  </span>
                  <select
                    value={viewingEpicDetails.status === 'DONE' || viewingEpicDetails.status === 'COMPLETED' ? 'DONE' : viewingEpicDetails.status || 'PLANNED'}
                    onChange={(e) => handleEpicStatusChange(viewingEpicDetails.id, e.target.value)}
                    className="text-xs font-extrabold px-2 py-0.5 rounded uppercase border bg-white text-emerald-700 border-emerald-300 focus:outline-none cursor-pointer"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>

              {/* 3. Parent Initiative Link Box */}
              {(() => {
                const parentInit = initiatives.find((i) => i.id === viewingEpicDetails.initiativeId) || viewingInitiative;
                const parentCode = parentInit?.initiativeCode || 'N/A';
                const parentTitle = parentInit?.title || 'No Parent Initiative Linked';

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

              {/* 4. Description */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                  Epic Description
                </span>
                {viewingEpicDetails.description ? (
                  <MarkdownViewer content={viewingEpicDetails.description} className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 text-sm text-gray-800" />
                ) : (
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 text-xs text-gray-400 italic">
                    No epic description provided.
                  </div>
                )}
              </div>

              {/* 5. Hanging Tasks Linked Under Epic */}
              {(() => {
                const isEpicCAG = (viewingEpicDetails.epicCode || '').startsWith('CAG');
                const combined = [
                  ...(viewingEpicDetails.tasks || []),
                  ...allTasks.filter((t: any) => t.epicId === viewingEpicDetails.id || t.parentEpicCode === viewingEpicDetails.epicCode)
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
                              <div className="absolute -left-6 top-4 w-3.5 h-0.5 bg-emerald-400 group-hover:bg-emerald-500 transition-colors" />
                              <div className="absolute -left-6 top-3.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-125 transition-transform" />

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

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingEpicDetails(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
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
