import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Tag, ShieldCheck, Layers, Clock } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { toast } from 'sonner';

interface TaskAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
}

interface EpicOption {
  id: string;
  epicCode: string;
  title: string;
  initiativeId: string;
}

interface SprintOption {
  id: string;
  sprintCode: string;
  name: string;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  designation: string;
}

const DEPARTMENT_OPTIONS = [
  'Marketing',
  'Sales',
  'Product & Tech',
  'Operations & Delivery',
  'Grants & Governance',
];

const PREVIOUS_CLONE_TASKS = [
  { id: 'cl-1', title: 'API Gateway Telemetry Pipeline Integration', dept: 'Product & Tech', priority: 'HIGH', desc: 'GraphQL telemetry logging & rate limiting middleware.' },
  { id: 'cl-2', title: 'Real-time WebSocket Notification & Push Engine', dept: 'Product & Tech', priority: 'HIGH', desc: 'Redis pub/sub channels setup and concurrency testing.' },
  { id: 'cl-3', title: 'OAuth2 & Role-Based Access Control Security Audit', dept: 'Product & Tech', priority: 'URGENT', desc: 'Audit JWT bearer scopes and token expiration.' },
  { id: 'cl-4', title: 'Q3 Brand Marketing Client Acquisition Campaign', dept: 'Marketing', priority: 'HIGH', desc: 'Brand identity collateral and B2B campaign funnel.' },
  { id: 'cl-5', title: 'Agri-Tech Subsidy & Government Compliance Report', dept: 'Grants & Governance', priority: 'HIGH', desc: 'Government subsidy compliance and field telemetry.' },
];

export const TaskAssignModal: React.FC<TaskAssignModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [epics, setEpics] = useState<EpicOption[]>([]);
  const [sprints, setSprints] = useState<SprintOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isClone, setIsClone] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [selectedEpicId, setSelectedEpicId] = useState('');
  const [assignToSprint, setAssignToSprint] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Product & Tech');
  const [assigneeId, setAssigneeId] = useState('');
  const [reviewingLeadId, setReviewingLeadId] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  const handleCloneSelect = (taskId: string) => {
    setCloneSourceId(taskId);
    const found = PREVIOUS_CLONE_TASKS.find((t) => t.id === taskId);
    if (found) {
      setTitle(`[CLONE] ${found.title}`);
      setDepartment(found.dept);
      setPriority(found.priority as any);
      setDescription(found.desc);
      toast.success(`Pre-filled configuration from "${found.title}". Adjust basic info to complete clone!`);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      setLoading(true);
      try {
        const [epicsData, sprintsData, empsData] = await Promise.all([
          fetchApi<any[]>('/api/epics'),
          fetchApi<any[]>('/api/sprints'),
          fetchApi<any[]>('/api/employees'),
        ]);

        // Alphabetically sort Epics by Title
        const sortedEpics = [...epicsData].sort((a, b) =>
          (a.title || '').localeCompare(b.title || '')
        );
        setEpics(sortedEpics);
        if (sortedEpics.length > 0) {
          setSelectedEpicId(sortedEpics[0].id);
        }

        // Alphabetically sort Sprints by Name
        const sortedSprints = [...sprintsData].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );
        setSprints(sortedSprints);
        if (sortedSprints.length > 0) {
          setSelectedSprintId(sortedSprints[0].id);
        }

        const formattedEmps = empsData.map(e => ({
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName,
          employeeCode: e.employeeCode,
          designation: e.designation || 'Team Member',
        }));
        setEmployees(formattedEmps);
        if (formattedEmps.length > 0) {
          setAssigneeId(formattedEmps[0].id);
          setReviewingLeadId(formattedEmps[0].id);
        }
      } catch (err) {
        console.error('[TASK MODAL OPTIONS FETCH ERROR]:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter a task title');
    
    // Parent Epic is mandatory ONLY if assignToSprint is false
    if (!assignToSprint && !selectedEpicId) {
      return toast.error('Please select a Parent Epic');
    }

    if (assignToSprint && !selectedSprintId) {
      return toast.error('Please select a Sprint');
    }

    if (!assigneeId) return toast.error('Please select an assignee');

    const selectedEpic = epics.find(ep => ep.id === selectedEpicId);

    onSubmit({
      title,
      epicId: selectedEpicId || null,
      initiativeId: selectedEpic?.initiativeId || null,
      sprintId: assignToSprint ? selectedSprintId : null,
      assigneeId,
      reviewingLeadId: reviewingLeadId || assigneeId,
      department,
      dueDate,
      description,
      priority,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create New Task</h2>
            <p className="text-[11px] text-gray-400 font-medium">
              Assign deliverable task under Parent Epic (or Sprint).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Epic Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Parent Epic {assignToSprint ? '(Optional)' : '* (Mandatory)'}</span>
              </span>
              {!assignToSprint && (
                <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Required
                </span>
              )}
            </label>
            <select
              required={!assignToSprint}
              value={selectedEpicId}
              onChange={(e) => setSelectedEpicId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
            >
              <option value="">{assignToSprint ? 'Select Parent Epic (Optional)...' : 'Select Parent Epic...'}</option>
              {epics.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  [{ep.epicCode}] {ep.title}
                </option>
              ))}
            </select>
          </div>

          {/* Checkbox: Assign this also in sprint */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="assignToSprint"
                checked={assignToSprint}
                onChange={(e) => setAssignToSprint(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="assignToSprint" className="text-xs font-bold text-gray-800 cursor-pointer">
                Assign this also in sprint
              </label>
            </div>

            {assignToSprint && (
              <div className="pt-2 animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Select Sprint *</span>
                </label>
                <select
                  required={assignToSprint}
                  value={selectedSprintId}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
                >
                  <option value="">Select Target Sprint...</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.sprintCode}] {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement OAuth Callback Endpoint & Token Refresh"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Department & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Assigned To & Reviewing Lead */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Assigned To *</label>
              <select
                required
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900"
              >
                <option value="">Select Employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    [{emp.employeeCode}] {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead *</label>
              <select
                required
                value={reviewingLeadId}
                onChange={(e) => setReviewingLeadId(e.target.value)}
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
          </div>

          {/* Target Date / Due Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Target Date / Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Task deliverable guidelines, technical specifications, and expected outputs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
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
                  Check this box to clone or duplicate task parameters directly inside this form.
                </p>
              </div>
            </label>

            {isClone && (
              <div className="pt-2 border-t border-purple-200/60 animate-in fade-in duration-150">
                <label className="block text-[11px] font-bold text-purple-900 mb-1">
                  Select Task Template to Clone From (Optional):
                </label>
                <select
                  value={cloneSourceId}
                  onChange={(e) => handleCloneSelect(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-xl bg-white font-bold text-purple-950 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
                >
                  <option value="">-- Choose Task Template to Auto-Fill --</option>
                  {PREVIOUS_CLONE_TASKS.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      [{ct.dept}] {ct.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors"
            >
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
