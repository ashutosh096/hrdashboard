import React, { useState, useEffect } from 'react';
import { X, Save, Link2, MessageSquare, Eye, ExternalLink, CheckCircle, CheckSquare, Plus, ListChecks, Send, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';

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

interface ChecklistItem {
  id: string;
  itemText: string;
  isCompleted: boolean;
  completedAt?: string | null;
  sortOrder: number;
}

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  isSystemLog: boolean;
  createdAt: string;
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
  
  const readOnlyMode = isReadOnly !== undefined ? isReadOnly : isManagerOrAdmin;

  const [entity, setEntity] = useState('climagroanalytics');
  const [parentTaskId, setParentTaskId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [assignee, setAssignee] = useState('Priyanka Sharma');
  const [reviewingLead, setReviewingLead] = useState('Dr. Harshit Mishra');
  const [outputUrl, setOutputUrl] = useState('');
  const [status, setStatus] = useState<'In Progress' | 'Done' | 'Delayed' | 'Blocked'>('In Progress');
  const [waitingOn, setWaitingOn] = useState('None (Self)');
  const [notes, setNotes] = useState('');

  // Checklist & Comments state
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  const loadTaskData = async () => {
    if (!task?.id) return;
    try {
      const [checklistsData, commentsData] = await Promise.all([
        fetchApi<ChecklistItem[]>(`/api/tasks/${task.id}/checklists`),
        fetchApi<CommentItem[]>(`/api/tasks/${task.id}/comments`),
      ]);
      setChecklists(checklistsData || []);
      setComments(commentsData || []);
    } catch (err) {
      console.error('[TASK SUB-RESOURCES FETCH ERROR]:', err);
    }
  };

  useEffect(() => {
    if (task) {
      setEntity(task.entity || 'climagroanalytics');
      setParentTaskId(task.taskId || 'CA-MAR-01');
      setTaskName(task.title || '');
      setAssignee(task.assignee || 'Priyanka Sharma');
      setReviewingLead(task.reviewingLead || 'Dr. Harshit Mishra');
      setOutputUrl(task.outputUrl || '');
      setStatus(task.status || 'In Progress');
      setWaitingOn(task.waitingOn || 'None (Self)');
      setNotes(task.notes || 'Pushed from Roadmap');
      loadTaskData();
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    try {
      const newItem = await fetchApi<ChecklistItem>(`/api/tasks/${task.id}/checklists`, {
        method: 'POST',
        body: JSON.stringify({ itemText: newChecklistText.trim() }),
      });
      setChecklists((prev) => [...prev, newItem]);
      setNewChecklistText('');
      toast.success('Subtask checklist item added!');
    } catch (err) {
      toast.error('Failed to add subtask');
    }
  };

  const handleToggleChecklist = async (item: ChecklistItem) => {
    const nextVal = !item.isCompleted;
    setChecklists((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, isCompleted: nextVal } : c))
    );
    try {
      const updated = await fetchApi<ChecklistItem>(`/api/tasks/checklists/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted: nextVal }),
      });
      setChecklists((prev) =>
        prev.map((c) => (c.id === item.id ? updated : c))
      );
    } catch (err) {
      toast.error('Failed to update subtask');
      setChecklists((prev) =>
        prev.map((c) => (c.id === item.id ? item : c))
      );
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const newComment = await fetchApi<CommentItem>(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newCommentText.trim() }),
      });
      setComments((prev) => [...prev, newComment]);
      setNewCommentText('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

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

  const completedChecklistCount = checklists.filter((c) => c.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base tracking-tight">
              {readOnlyMode ? `Submission Review: ${parentTaskId}` : `Task Details: ${parentTaskId}`}
            </h3>
            <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${
              readOnlyMode ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {readOnlyMode ? 'Read-Only View 👁️' : 'Auto-Generated ID'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0">
          
          {/* Left Column (Task Info & Checklist) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand / Entity & Parent Task ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Brand / Entity</label>
                  <input
                    type="text"
                    disabled
                    value={entity === 'ehmconsultancy' || entity === 'EHM' ? 'EHM' : entity === 'climagroanalytics' || entity === 'CAG' ? 'CLIMAGRO' : entity}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Parent Task ID</label>
                  <input
                    type="text"
                    disabled
                    value={parentTaskId}
                    className="w-full text-xs font-bold bg-emerald-50/60 border border-emerald-200 rounded-xl p-2.5 text-emerald-800 outline-none"
                  />
                </div>
              </div>

              {/* Deliverable / Task Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Deliverable / Task Name</label>
                <input
                  type="text"
                  disabled
                  value={taskName}
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 outline-none"
                />
              </div>

              {/* Assignee & Reviewing Lead */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Assignee</label>
                  <input
                    type="text"
                    disabled
                    value={assignee}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Reviewing Lead</label>
                  <input
                    type="text"
                    disabled
                    value={reviewingLead}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                  />
                </div>
              </div>

              {/* Deliverable URL / File Attachment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Deliverable Attachment Link</span>
                  </label>
                  {outputUrl && (
                    <a
                      href={outputUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Link ↗</span>
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

              {/* Status Dropdown & Dependency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Status</label>
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
                      className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="In Progress">In Progress ⏳</option>
                      <option value="To Review">To Review 🔍</option>
                      <option value="Done">Done / Approved ✅</option>
                      <option value="Delayed">Delayed ⚠️</option>
                      <option value="Blocked">Blocked 🛑</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Dependency / Waiting On</label>
                  {readOnlyMode ? (
                    <div className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 cursor-default">
                      {waitingOn}
                    </div>
                  ) : (
                    <select
                      value={waitingOn}
                      onChange={e => setWaitingOn(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="None (Self)">None (Self)</option>
                      <option value="Waiting on Reviewing Lead">Waiting on Reviewing Lead</option>
                      <option value="Waiting on API Backend">Waiting on API Backend</option>
                      <option value="Waiting on Client Feedback">Waiting on Client Feedback</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Progress Notes / Comments */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Progress Notes / Comments
                </label>
                <textarea
                  rows={2}
                  readOnly={readOnlyMode}
                  placeholder={readOnlyMode ? "No progress notes filled by employee." : "Detail your daily progress..."}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={`w-full text-xs border rounded-xl p-3 outline-none font-medium resize-none ${
                    readOnlyMode
                      ? 'bg-gray-50 border-gray-200 text-gray-800 cursor-default'
                      : 'border-gray-300 focus:ring-2 focus:ring-emerald-500'
                  }`}
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                {readOnlyMode ? (
                  <>
                    <span className="text-[11px] font-semibold text-gray-400">
                      Lead: <strong className="text-gray-700">{reviewingLead}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Done Reviewing</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                )}
              </div>
            </form>

            {/* Checklist Section below Task Info */}
            <div className="pt-4 border-t border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-emerald-600" />
                  <span>Subtask Checklist</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {completedChecklistCount} of {checklists.length} Completed
                </span>
              </div>

              {/* Subtask items list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {checklists.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No subtasks added yet. Add one below!
                  </div>
                ) : (
                  checklists.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                        item.isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => handleToggleChecklist(item)}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                          {item.itemText}
                        </span>
                      </label>

                      {item.completedAt && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Done {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Subtask Form */}
              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new subtask checklist item..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column (Activity Log & Comments) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-left min-h-[420px]">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-200 mb-3 flex-shrink-0">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Activity & Comments</span>
              </span>
              <span className="text-[10px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                {comments.length}
              </span>
            </div>

            {/* Comments Feed */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[260px] mb-3">
              {comments.length === 0 ? (
                <div className="h-full flex items-center justify-center py-12 text-center text-xs text-gray-400 font-medium bg-white rounded-xl border border-dashed border-gray-200">
                  No comments yet. Post the first comment!
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 shadow-2xs ${
                      c.isSystemLog
                        ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                        : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <span className={c.isSystemLog ? 'text-purple-700 font-mono' : 'text-emerald-700'}>
                        {c.authorName || 'System'}
                      </span>
                      <span>{new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <p className="font-medium text-gray-800 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2.5 border-t border-gray-200 flex-shrink-0">
              <input
                type="text"
                placeholder="Write a comment or activity log..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
