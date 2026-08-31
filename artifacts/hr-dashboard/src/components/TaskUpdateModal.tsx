import React, { useState, useEffect } from 'react';
import { X, Save, Link2, MessageSquare, AlertCircle, Shield, Building2, Eye, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export interface TaskItem {
  id: string;
  taskId: string; // e.g. CA-MAR-01 or EHM-MAR-672
  title: string;
  entity: string; // ehmconsultancy or climagroanalytics
  assignee: string;
  reviewingLead: string;
  status: 'In Progress' | 'Done' | 'Delayed' | 'Blocked';
  outputUrl?: string;
  waitingOn?: string;
  notes?: string;
}

interface TaskUpdateModalProps {
  isOpen: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onSave?: (updatedTask: TaskItem) => void;
  isReadOnly?: boolean;
}

export const TaskUpdateModal: React.FC<TaskUpdateModalProps> = ({
  isOpen,
  task,
  onClose,
  onSave,
  isReadOnly,
}) => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  
  // If isReadOnly is explicitly specified, use it; otherwise default to true for Manager/Admin
  const readOnlyMode = isReadOnly !== undefined ? isReadOnly : isManagerOrAdmin;

  const [entity, setEntity] = useState('climagroanalytics');
  const [parentTaskId, setParentTaskId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [assignee, setAssignee] = useState('Priya Sharma');
  const [reviewingLead, setReviewingLead] = useState('Dr. Harshit Mishra');
  const [outputUrl, setOutputUrl] = useState('');
  const [status, setStatus] = useState<'In Progress' | 'Done' | 'Delayed' | 'Blocked'>('In Progress');
  const [waitingOn, setWaitingOn] = useState('None (Self)');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (task) {
      setEntity(task.entity || 'climagroanalytics');
      setParentTaskId(task.taskId || 'CA-MAR-01');
      setTaskName(task.title || '');
      setAssignee(task.assignee || 'Priya Sharma');
      setReviewingLead(task.reviewingLead || 'Dr. Harshit Mishra');
      setOutputUrl(task.outputUrl || '');
      setStatus(task.status || 'In Progress');
      setWaitingOn(task.waitingOn || 'None (Self)');
      setNotes(task.notes || 'Pushed from Roadmap');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnlyMode) {
      onClose();
      return;
    }
    if (onSave) {
      onSave({
        ...task,
        status,
        outputUrl,
        waitingOn,
        notes,
      });
    }
    toast.success(`Task ${parentTaskId} updated & synced with Reviewing Lead (${reviewingLead})!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base tracking-tight">
              {readOnlyMode ? `Submission Review: ${parentTaskId}` : `Task Details: ${parentTaskId}`}
            </h3>
            <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${
              readOnlyMode ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {readOnlyMode ? 'Read-Only Manager View 👁️' : 'Auto-Generated ID'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Read-Only Inspection Notice Banner for Managers */}
        {readOnlyMode && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900 font-bold mb-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Employee Submission Details (Read-Only)</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
              Assignee: {assignee}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Row 1: Brand / Entity & Parent Task ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Brand / Entity</label>
              <input
                type="text"
                disabled
                value={entity}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Parent Task ID</label>
              <input
                type="text"
                disabled
                value={parentTaskId}
                className="w-full text-xs font-bold bg-emerald-50/60 border border-emerald-200 rounded-xl p-2.5 text-emerald-800 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Deliverable / Task Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Deliverable / Task Name</label>
            <input
              type="text"
              disabled
              value={taskName}
              className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 outline-none"
            />
          </div>

          {/* Row 3: Assignee & Reviewing Lead */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Assignee</label>
              <input
                type="text"
                disabled
                value={assignee}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead</label>
              <input
                type="text"
                disabled
                value={reviewingLead}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
              />
            </div>
          </div>

          {/* Row 4: Deliverable URL / Output Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">Deliverable URL / Output Link (Drive, Canva, GitHub PR)</label>
              {outputUrl && (
                <a
                  href={outputUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Deliverable Link ↗</span>
                </a>
              )}
            </div>
            <div className="relative">
              <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                readOnly={readOnlyMode}
                placeholder={readOnlyMode ? "No deliverable link attached by employee" : "https://canva.link/... or https://github.com/..."}
                value={outputUrl}
                onChange={e => setOutputUrl(e.target.value)}
                className={`w-full text-xs border rounded-xl py-2.5 pl-9 pr-3 outline-none font-medium ${
                  readOnlyMode
                    ? 'bg-gray-50 border-gray-200 text-gray-800 font-mono select-all cursor-default'
                    : 'border-gray-300 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Row 5: Status Dropdown & Dependency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
              {readOnlyMode ? (
                <div className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 flex items-center gap-2 cursor-default">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    status === 'Done' ? 'bg-emerald-500' : status === 'Delayed' ? 'bg-amber-500' : status === 'Blocked' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></span>
                  <span>{status}</span>
                </div>
              ) : (
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="In Progress">In Progress ⏳</option>
                  <option value="Done">Done ✅</option>
                  <option value="Delayed">Delayed ⚠️</option>
                  <option value="Blocked">Blocked 🛑</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dependency / Waiting On</label>
              {readOnlyMode ? (
                <div className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 cursor-default">
                  {waitingOn}
                </div>
              ) : (
                <select
                  value={waitingOn}
                  onChange={e => setWaitingOn(e.target.value)}
                  className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="None (Self)">None (Self)</option>
                  <option value="Waiting on Reviewing Lead">Waiting on Reviewing Lead</option>
                  <option value="Waiting on API Backend">Waiting on API Backend</option>
                  <option value="Waiting on Client Feedback">Waiting on Client Feedback</option>
                </select>
              )}
            </div>
          </div>

          {/* Row 6: Assignee Progress Notes / Comments / Daily Standup Update */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assignee Progress Notes / Comments / Daily Standup Update</span>
            </label>
            <textarea
              rows={3}
              readOnly={readOnlyMode}
              placeholder={readOnlyMode ? "No progress notes filled by employee." : "Detail your daily progress or obstacles for reviewing leads..."}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className={`w-full text-xs border rounded-xl p-3 outline-none font-medium resize-none ${
                readOnlyMode
                  ? 'bg-gray-50 border-gray-200 text-gray-800 cursor-default'
                  : 'border-gray-300 focus:ring-2 focus:ring-emerald-500'
              }`}
            ></textarea>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {readOnlyMode ? (
              <>
                <span className="text-[11px] font-semibold text-gray-400">
                  Reviewing Lead: <strong className="text-gray-700">{reviewingLead}</strong>
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Done Reviewing Submission</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes & Sync</span>
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
