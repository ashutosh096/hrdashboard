import React, { useState, useEffect } from 'react';
import { X, Save, Link2, MessageSquare, AlertCircle, Shield, Building2 } from 'lucide-react';
import { toast } from 'sonner';

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
  onSave: (updatedTask: TaskItem) => void;
}

export const TaskUpdateModal: React.FC<TaskUpdateModalProps> = ({
  isOpen,
  task,
  onClose,
  onSave,
}) => {
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
    onSave({
      ...task,
      status,
      outputUrl,
      waitingOn,
      notes,
    });
    toast.success(`Task ${parentTaskId} updated & synced with Reviewing Lead (${reviewingLead})!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header matching Image 3 */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base tracking-tight">Task Details: {parentTaskId}</h3>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
              Auto-Generated ID
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
              readOnly
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Deliverable URL / Output Link (Drive, Canva, GitHub PR)</label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="https://canva.link/... or https://github.com/..."
                value={outputUrl}
                onChange={e => setOutputUrl(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Row 5: Status Dropdown & Dependency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
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
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dependency / Waiting On</label>
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
              placeholder="Detail your daily progress or obstacles for reviewing leads..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
            ></textarea>
          </div>

          {/* Footer Buttons */}
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
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes & Sync</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
