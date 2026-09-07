import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, Target, Calendar, Layers, ArrowRight, Tag, BarChart3, CheckCircle2, PlayCircle, AlertCircle, Archive, RotateCcw, Building2 } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { toast } from 'sonner';

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
  onSelectEpic: (epicId: string) => void;
}

const ENTITY_OPTIONS = [
  { id: 'ehmconsultancy', name: 'ehmconsultancy', code: 'EHM' },
  { id: 'climagroanalytics', name: 'climagroanalytics', code: 'CAG' },
];

const DEPARTMENT_OPTIONS = [
  'Marketing',
  'Sales',
  'Product & Tech',
  'Operations & Delivery',
  'Grants & Governance',
];

const DEFAULT_INITIATIVES: InitiativeItem[] = [
  {
    id: 'init-1',
    initiativeCode: 'EHM-INIT-001',
    title: 'Enterprise Multi-Tenant AI Platform & Telemetry Core',
    description: 'Strategic Tech initiative to deploy GraphQL gateway, Redis pub/sub messaging engine, and Supabase DDL schema migrations across EHM & CAG.',
    status: 'IN_PROGRESS',
    entityId: 'ehmconsultancy',
    entityName: 'ehmconsultancy',
    entityCode: 'EHM',
    departmentId: 'Product & Tech',
    subDepartment: 'Core Engineering',
    targetMonth: 'Month 1 (Weeks 1–4)',
    epicsCountTarget: 4,
    targetDeliverableMetric: '99.9% API Uptime & Telemetry Logging',
    targetDate: '2026-09-30',
    epicsCount: 3,
    epics: [
      { id: 'ep-1', epicCode: 'EHM-EPIC-001', title: 'API Gateway Telemetry & Rate Limiting Pipeline', status: 'IN_PROGRESS', targetDate: '2026-09-10' },
      { id: 'ep-2', epicCode: 'EHM-EPIC-002', title: 'Real-time WebSocket & Push Notification Engine', status: 'DONE', targetDate: '2026-09-05' },
      { id: 'ep-3', epicCode: 'EHM-EPIC-003', title: 'OAuth2 & Role-Based Access Control Security Audit', status: 'IN_PROGRESS', targetDate: '2026-09-15' },
    ],
  },
  {
    id: 'init-2',
    initiativeCode: 'EHM-INIT-002',
    title: 'Q3 Brand Marketing & Digital Client Acquisition',
    description: 'High-growth marketing campaign targeting enterprise SaaS clients, brand strategy collateral, and social media outreach.',
    status: 'IN_PROGRESS',
    entityId: 'ehmconsultancy',
    entityName: 'ehmconsultancy',
    entityCode: 'EHM',
    departmentId: 'Marketing',
    subDepartment: 'Brand & Social',
    targetMonth: 'Month 1 (Weeks 1–4)',
    epicsCountTarget: 3,
    targetDeliverableMetric: '500+ Qualified B2B Enterprise Leads',
    targetDate: '2026-09-25',
    epicsCount: 2,
    epics: [
      { id: 'ep-4', epicCode: 'EHM-EPIC-004', title: 'Brand Identity & Client Case Study Portfolio', status: 'IN_PROGRESS', targetDate: '2026-09-12' },
      { id: 'ep-5', epicCode: 'EHM-EPIC-005', title: 'LinkedIn B2B Enterprise Campaign & Ad Funnel', status: 'IN_PROGRESS', targetDate: '2026-09-18' },
    ],
  },
  {
    id: 'init-3',
    initiativeCode: 'CAG-INIT-001',
    title: 'Climagro Analytics IoT & Agri-Tech Compliance Subsidies',
    description: 'Cross-entity governance initiative for agri-tech telemetry sensors, grant application tracking, and delivery operations.',
    status: 'IN_PROGRESS',
    entityId: 'climagroanalytics',
    entityName: 'climagroanalytics',
    entityCode: 'CAG',
    departmentId: 'Grants & Governance',
    subDepartment: 'Operations & Grants',
    targetMonth: 'Month 1 (Weeks 1–4)',
    epicsCountTarget: 3,
    targetDeliverableMetric: '100% Grant Compliance & Field Telemetry',
    targetDate: '2026-09-28',
    epicsCount: 2,
    epics: [
      { id: 'ep-6', epicCode: 'CAG-EPIC-001', title: 'Agri-Tech Subsidy & Government Compliance Report', status: 'IN_PROGRESS', targetDate: '2026-09-14' },
      { id: 'ep-7', epicCode: 'CAG-EPIC-002', title: 'Vendor Logistics & Field Dispatch Telemetry', status: 'DONE', targetDate: '2026-09-08' },
    ],
  },
];

export const InitiativesSubView: React.FC<Props> = ({ isManager, onSelectEpic }) => {
  const [initiatives, setInitiatives] = useState<InitiativeItem[]>(DEFAULT_INITIATIVES);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null); // CLOSED BY DEFAULT

  // View Mode: Active vs Archive Mode
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const initData = await fetchApi<InitiativeItem[]>('/api/initiatives');
      if (initData && initData.length > 0) {
        setInitiatives(initData);
      } else {
        setInitiatives(DEFAULT_INITIATIVES);
      }
    } catch (err) {
      setInitiatives(DEFAULT_INITIATIVES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
            const isExpanded = expandedId === item.id; // CLOSED BY DEFAULT
            const targetMonthStr = item.targetMonth || 'Month 1 (Weeks 1–4)';
            const epicsDivision = item.epicsCountTarget || 3;

            const isDone = item.status === 'DONE' || item.status === 'COMPLETED';
            const isInProgress = item.status === 'ACTIVE' || item.status === 'IN_PROGRESS';

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:border-emerald-300 transition-all"
              >
                {/* Initiative Main Row (CLOSED BY DEFAULT) */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 mt-1">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {item.initiativeCode}
                        </span>

                        {/* Brand / Entity Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/90 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-emerald-600" />
                          <span>{item.entityName || (item.initiativeCode?.startsWith('CAG') ? 'climagroanalytics' : 'ehmconsultancy')}</span>
                        </span>

                        {/* Status Badge Dropdown (triggers Confirmation Modal) */}
                        <select
                          value={isDone ? 'DONE' : isInProgress ? 'ACTIVE' : 'PLANNED'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => openStatusConfirmModal(item, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border cursor-pointer outline-none transition-colors ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          <option value="PLANNED">PLANNED</option>
                          <option value="ACTIVE">IN PROGRESS</option>
                          <option value="DONE">DONE (COMPLETED)</option>
                        </select>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{targetMonthStr}</span>
                        </span>

                        {item.subDepartment && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>{item.subDepartment}</span>
                          </span>
                        )}

                        {item.targetDeliverableMetric && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3 text-emerald-600" />
                            <span>Metric: {item.targetDeliverableMetric}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-gray-900">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium shrink-0">
                    {/* Status Action Buttons with Confirmation Popovers */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openStatusConfirmModal(item, 'ACTIVE')}
                        title="Mark as In Progress"
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                          isInProgress
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-gray-100 hover:bg-blue-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <PlayCircle className="w-3 h-3" />
                        <span>In Progress</span>
                      </button>

                      <button
                        onClick={() => openStatusConfirmModal(item, 'DONE')}
                        title="Mark as Done"
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                          isDone
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold text-gray-800">
                        {item.epicsCount} / {epicsDivision} Epics
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Section showing Responsive 6-Epic Per Row Grid */}
                {isExpanded && (
                  <div className="bg-gray-50/80 p-5 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Linked Epics ({item.epics?.length || 0} / {epicsDivision} Planned)</span>
                      </h5>
                    </div>

                    {item.epics && item.epics.length > 0 ? (
                      <div
                        className={`grid gap-3 ${
                          item.epics.length === 1
                            ? 'grid-cols-1'
                            : item.epics.length === 2
                            ? 'grid-cols-1 md:grid-cols-2'
                            : item.epics.length === 3
                            ? 'grid-cols-1 md:grid-cols-3'
                            : item.epics.length === 4
                            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                            : item.epics.length === 5
                            ? 'grid-cols-1 sm:grid-cols-3 md:grid-cols-5'
                            : 'grid-cols-1 sm:grid-cols-3 md:grid-cols-6'
                        }`}
                      >
                        {item.epics.map((epic) => {
                          const epicStatus = epic.status || 'PLANNED';
                          const isEpicDone = epicStatus === 'DONE' || epicStatus === 'COMPLETED';
                          const isEpicInProgress = epicStatus === 'IN_PROGRESS' || epicStatus === 'ACTIVE';

                          return (
                            <div
                              key={epic.id}
                              onClick={() => onSelectEpic(epic.id)}
                              className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
                            >
                              {/* Line 1: Epic ID Badge & Status Badge */}
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {epic.epicCode}
                                </span>

                                <span
                                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${
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

                              {/* Line 2: Epic Name (left) & View Epic Link (right) */}
                              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-gray-100">
                                <div className="flex items-center gap-1 truncate max-w-[65%]">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                                    Epic:
                                  </span>
                                  <h6 className="text-[11px] font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                                    {epic.title}
                                  </h6>
                                </div>

                                <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold shrink-0">
                                  <span>View</span>
                                  <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-400 font-medium bg-white rounded-xl border border-dashed border-gray-200">
                        No Epics created under this Initiative yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
                <textarea
                  rows={3}
                  placeholder="Comprehensive goal summary, deliverables, and outcome objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
    </div>
  );
};
