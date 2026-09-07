import React, { useState, useEffect } from 'react';
import { X, Copy, Calendar, Layers, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TaskCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clonedTask: any) => void;
  availableTasks?: any[];
}

const DEFAULT_PREVIOUS_TASKS = [
  { id: 'cl-1', taskCode: 'EHM-EMP01-001', title: 'API Gateway Telemetry Pipeline Integration', dept: 'Product & Tech', priority: 'HIGH', desc: 'GraphQL gateway telemetry & rate limiting middleware.', lead: 'Dr. Harshit Mishra' },
  { id: 'cl-2', taskCode: 'EHM-EMP01-002', title: 'Real-time WebSocket Notification & Push Engine', dept: 'Product & Tech', priority: 'HIGH', desc: 'Redis pub/sub channels setup and 500 connection stress testing.', lead: 'Jitendra Sir' },
  { id: 'cl-3', taskCode: 'EHM-EMP01-003', title: 'OAuth2 & Role-Based Access Control Security Audit', dept: 'Product & Tech', priority: 'URGENT', desc: 'Audit JWT bearer scopes and token expiration.', lead: 'Jitendra Sir' },
  { id: 'cl-4', taskCode: 'EHM-EPIC-004', title: 'Q3 Brand Marketing Client Acquisition Campaign', dept: 'Marketing', priority: 'HIGH', desc: 'Brand identity collateral and B2B campaign funnel.', lead: 'Priyanka Sharma' },
  { id: 'cl-5', taskCode: 'CAG-EPIC-001', title: 'Agri-Tech Subsidy & Government Compliance Report', dept: 'Grants & Governance', priority: 'HIGH', desc: 'Government subsidy compliance and field telemetry.', lead: 'Dr. Utsav Mishra' },
];

export const TaskCloneModal: React.FC<TaskCloneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableTasks,
}) => {
  const cloneOptions = availableTasks && availableTasks.length > 0 ? availableTasks : DEFAULT_PREVIOUS_TASKS;

  const [selectedSourceId, setSelectedSourceId] = useState(cloneOptions[0]?.id || '');
  const [newTitle, setNewTitle] = useState(`[CLONE] ${cloneOptions[0]?.title || 'Task Deliverable'}`);
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [department, setDepartment] = useState(cloneOptions[0]?.dept || 'Product & Tech');
  const [priority, setPriority] = useState(cloneOptions[0]?.priority || 'HIGH');
  const [description, setDescription] = useState(cloneOptions[0]?.desc || '');

  useEffect(() => {
    if (!isOpen) return;
    if (cloneOptions.length > 0) {
      const first = cloneOptions[0];
      setSelectedSourceId(first.id);
      setNewTitle(`[CLONE] ${first.title}`);
      setDepartment(first.dept || first.department || 'Product & Tech');
      setPriority(first.priority || 'HIGH');
      setDescription(first.desc || first.notes || first.description || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSource = (id: string) => {
    setSelectedSourceId(id);
    const found = cloneOptions.find((t) => t.id === id);
    if (found) {
      setNewTitle(`[CLONE] ${found.title}`);
      setDepartment(found.dept || found.department || 'Product & Tech');
      setPriority(found.priority || 'HIGH');
      setDescription(found.desc || found.notes || found.description || '');
      toast.success(`Pre-filled configuration from "${found.title}". Adjust title/date to complete!`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return toast.error('Please enter a cloned task title');

    const source = cloneOptions.find((t) => t.id === selectedSourceId);

    onSubmit({
      title: newTitle,
      department,
      priority,
      dueDate: newDueDate,
      description,
      assigneeName: source?.assigneeName || 'Ashutosh Mishra',
      reviewingLead: source?.lead || source?.reviewingLead || 'Dr. Harshit Mishra',
      isCloned: true,
    });

    toast.success(`Task "${newTitle}" cloned successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Quick Clone Task</h2>
              <p className="text-[11px] text-gray-400 font-medium">
                Select a previous task to duplicate all details with minimal entry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Select Previous Task to Clone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-purple-600" />
                <span>Select Previous Task to Clone *</span>
              </span>
              <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                1-Click Pre-Fill
              </span>
            </label>
            <select
              value={selectedSourceId}
              onChange={(e) => handleSelectSource(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/30 font-bold text-gray-900"
            >
              {cloneOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.taskCode || t.dept || 'TASK'}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Cloned Task Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">New Cloned Task Title *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-gray-900"
            />
          </div>

          {/* Step 3: Target Due Date & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Due Date *</label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-semibold text-gray-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Description Preview */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description (Cloned)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-gray-600 bg-gray-50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Clone & Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
