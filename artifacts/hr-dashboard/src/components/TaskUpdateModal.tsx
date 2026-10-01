import React, { useState, useEffect } from 'react';
import { X, Save, Link2, MessageSquare, Eye, ExternalLink, CheckCircle, CheckSquare, Plus, ListChecks, Send, Paperclip, Clock, Copy, Trash2, History, UserCheck, Pencil, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { RichTextEditor } from './RichTextEditor';
import { MarkdownViewer } from './MarkdownViewer';
import { CalendarPicker } from './CalendarPicker';
import { RecordHistoryPanel } from './RecordHistoryPanel';
import { RecentActivitySection } from './RecentActivitySection';
import { formatDateTime } from '../utils/dateUtils';
import { getEntityBadge } from '../utils/entityUtils';

export interface ChecklistItem {
  id: string;
  itemText: string;
  isCompleted: boolean;
  completedAt?: string | null;
  sortOrder: number;
}

export interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  isSystemLog: boolean;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  taskId: string; // e.g. CA-MAR-01 or EHM-MAR-672 or CAG-I10-EP05-T002
  taskCode?: string;
  title: string;
  entity: string; // EHM or CLIMAGRO / CAG or COMMON
  entityId?: string;
  entityCode?: string;
  entityName?: string;
  epicId?: string | null;
  parentEpicCode?: string | null;
  parentEpicTitle?: string | null;
  assignee: string;
  assigneeId?: string;
  reviewingLead: string;
  reviewingLeadId?: string;
  status: string; // 'In Progress' | 'Done' | 'Delayed' | 'Blocked' | 'To Review' | 'Planned' | 'Backlog'
  outputUrl?: string;
  waitingOn?: string;
  notes?: string;
  dueDate?: string;
  targetWeek?: string;
  priority?: string;
  createdById?: string | null;
  createdByName?: string | null;
  creatorName?: string | null;
  createdAt?: string;
  checklists?: ChecklistItem[];
  comments?: CommentItem[];
}

interface TaskUpdateModalProps {
  isOpen: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onSave?: (updatedTask: TaskItem) => void;
  onClone?: (sourceTask: TaskItem, importChecklistAndLinks: boolean) => void;
  onDelete?: (taskId: string) => void;
  isReadOnly?: boolean;
}

const normalizePriorityCode = (p: string | undefined): 'P1' | 'P2' | 'P3' | 'P4' => {
  if (!p) return 'P3';
  const val = String(p).toUpperCase().trim();
  if (val === 'URGENT' || val === 'CRITICAL' || val === 'P1' || val === '1') return 'P1';
  if (val === 'HIGH' || val === 'P2' || val === '2') return 'P2';
  if (val === 'MEDIUM' || val === 'MED' || val === 'P3' || val === '3') return 'P3';
  if (val === 'LOW' || val === 'P4' || val === '4') return 'P4';
  return 'P3';
};

const formatPriorityLabel = (p: string | undefined): string => {
  const code = normalizePriorityCode(p);
  if (code === 'P1') return 'P1 - Critical / Urgent 🔥';
  if (code === 'P2') return 'P2 - High Priority ⚡';
  if (code === 'P3') return 'P3 - Medium Priority 📌';
  if (code === 'P4') return 'P4 - Low Priority 📝';
  return 'P3 - Medium Priority 📌';
};

const parseDateForInput = (d: string | undefined | null): string => {
  if (!d) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(d).trim())) {
    return String(d).trim();
  }
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return '';
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDueDateDisplay = (d: string | undefined | null): string => {
  if (!d) return 'Not set';
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return String(d);
  return parsed.toLocaleDateString();
};

export const formatAuthorDisplayName = (name?: string | null): string => {
  if (!name) return 'User';
  if (name.includes('@')) {
    const raw = name.split('@')[0].replace(/[._-]/g, ' ');
    return raw
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return name;
};

export const TaskUpdateModal: React.FC<TaskUpdateModalProps> = ({
  isOpen,
  task,
  onClose,
  onSave,
  onClone,
  onDelete,
  isReadOnly,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isAssignee = isEmployee
    ? Boolean(
      (user?.employeeId && task?.assigneeId === user.employeeId) ||
      (user?.name && task?.assignee && user.name.toLowerCase() === task.assignee.toLowerCase())
    )
    : true;

  const canUserEditTask = isManagerOrAdmin || isAssignee;
  const readOnlyMode = isReadOnly !== undefined ? isReadOnly : !canUserEditTask;

  const [showCloneConfirmModal, setShowCloneConfirmModal] = useState(false);
  const [importChecklistAndLinks, setImportChecklistAndLinks] = useState(true);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const [employeesList, setEmployeesList] = useState<{ id: string; name: string; designation: string }[]>([]);
  const [epicsList, setEpicsList] = useState<{ id: string; epicCode: string; title: string; entityCode?: string }[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<string>('');
  const [entity, setEntity] = useState('EHM');
  const [parentTaskId, setParentTaskId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [reviewingLead, setReviewingLead] = useState('');
  const [reviewingLeadId, setReviewingLeadId] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [status, setStatus] = useState<string>('In Progress');
  const [waitingOn, setWaitingOn] = useState('None (Self)');
  const [notes, setNotes] = useState('');
  const [targetWeek, setTargetWeek] = useState('');
  const [priority, setPriority] = useState('P3');
  const [dueDate, setDueDate] = useState('');

  // Checklist & Comments state
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState<string>('');

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>('');

  const [isSavingTask, setIsSavingTask] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetchApi<any[]>('/api/employees').catch(() => []),
        fetchApi<any[]>('/api/epics').catch(() => []),
      ]).then(([empData, epicsData]) => {
        if (Array.isArray(empData)) {
          const list = empData.map((e) => ({
            id: e.id,
            name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || e.employeeCode || 'Team Member',
            designation: e.designation || 'Team Member',
          }));
          list.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
          setEmployeesList(list);
        }
        if (Array.isArray(epicsData)) {
          const list = epicsData.map((ep: any) => ({
            id: ep.id,
            epicCode: ep.epicCode,
            title: ep.title,
            entityCode: ep.entityCode || ep.entity,
          }));
          list.sort((a, b) => (a.title || a.epicCode || '').localeCompare(b.title || b.epicCode || '', undefined, { sensitivity: 'base' }));
          setEpicsList(list);
        }
      }).catch(() => { });
    }
  }, [isOpen]);

  const loadTaskData = async () => {
    if (!task?.id) return;
    try {
      const [checklistsData, commentsData] = await Promise.all([
        fetchApi<ChecklistItem[]>(`/api/tasks/${task.id}/checklists`).catch(() => []),
        fetchApi<CommentItem[]>(`/api/tasks/${task.id}/comments`).catch(() => []),
      ]);
      if (checklistsData && checklistsData.length > 0) {
        setChecklists(checklistsData);
      } else if (Array.isArray((task as any).checklists) && (task as any).checklists.length > 0) {
        setChecklists((task as any).checklists);
      } else {
        setChecklists([]);
      }

      if (commentsData && commentsData.length > 0) {
        setComments(commentsData);
      } else if (Array.isArray((task as any).comments) && (task as any).comments.length > 0) {
        setComments((task as any).comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('[TASK SUB-RESOURCES FETCH ERROR]:', err);
    }
  };

  useEffect(() => {
    if (task) {
      // 1. Resolve exact task code from any possible property
      const realCode = (
        task.taskCode ||
        task.taskId ||
        (task as any).code ||
        (task as any).task_code ||
        ''
      ).trim();

      // 2. Resolve entity accurately using getEntityBadge & explicit properties
      const badge = getEntityBadge({
        ...task,
        taskCode: realCode || task.taskCode,
        taskId: realCode || task.taskId,
      });

      let isEnt = 'EHM';
      if (badge.isCommon) {
        isEnt = 'COMMON';
      } else if (badge.isCAG) {
        isEnt = 'CLIMAGRO';
      } else {
        isEnt = 'EHM';
      }

      setEntity(isEnt);
      setParentTaskId(realCode || (task.id ? `TSK-${task.id.slice(0, 6)}` : 'TSK-001'));
      setTaskName(task.title || '');

      const rawAssignee = (task.assignee || '').replace(/\(.*?\)/g, '').trim();
      const isActuallyUnassigned = !task.assigneeId || !rawAssignee || rawAssignee.toLowerCase() === 'unassigned';
      if (isActuallyUnassigned) {
        setAssignee('Unassigned');
        setAssigneeId('');
      } else {
        const matchedAssignee = employeesList.find(e => e.id === task.assigneeId || e.name.toLowerCase() === rawAssignee.toLowerCase());
        setAssignee(matchedAssignee ? matchedAssignee.name : rawAssignee);
        setAssigneeId(task.assigneeId || matchedAssignee?.id || '');
      }

      const rawLead = (task.reviewingLead || '').replace(/\(.*?\)/g, '').trim();
      const isLeadUnassigned = !task.reviewingLeadId || !rawLead || rawLead.toLowerCase() === 'unassigned' || rawLead.toLowerCase() === 'manager lead';
      if (isLeadUnassigned) {
        setReviewingLead('Unassigned');
        setReviewingLeadId('');
      } else {
        const matchedLead = employeesList.find(e => e.id === task.reviewingLeadId || e.name.toLowerCase() === rawLead.toLowerCase());
        setReviewingLead(matchedLead ? matchedLead.name : rawLead);
        setReviewingLeadId(task.reviewingLeadId || matchedLead?.id || '');
      }

      setOutputUrl(task.outputUrl || '');
      setStatus(task.status || 'In Progress');
      setWaitingOn(task.waitingOn || 'None (Self)');
      setNotes(task.notes || '');
      setTargetWeek(task.targetWeek || 'Week 1 (Days 1–7)');
      setPriority(normalizePriorityCode(task.priority));
      setDueDate(parseDateForInput(task.dueDate));
      setSelectedEpicId(task.epicId || (task as any).parentEpicId || '');
      loadTaskData();
    }
  }, [task?.id, isOpen]);

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

  const handleStartEditChecklist = (item: ChecklistItem) => {
    setEditingChecklistId(item.id);
    setEditingChecklistText(item.itemText);
  };

  const handleCancelEditChecklist = () => {
    setEditingChecklistId(null);
    setEditingChecklistText('');
  };

  const handleSaveEditChecklist = async (id: string) => {
    if (!editingChecklistText.trim()) return;
    const newText = editingChecklistText.trim();
    try {
      const updated = await fetchApi<ChecklistItem>(`/api/tasks/checklists/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ itemText: newText }),
      });
      setChecklists((prev) =>
        prev.map((c) => (c.id === id ? { ...c, itemText: updated.itemText || newText } : c))
      );
      setEditingChecklistId(null);
      setEditingChecklistText('');
      toast.success('Checklist item updated!');
    } catch (err) {
      toast.error('Failed to update checklist item');
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    try {
      await fetchApi(`/api/tasks/checklists/${id}`, {
        method: 'DELETE',
      });
      setChecklists((prev) => prev.filter((c) => c.id !== id));
      if (editingChecklistId === id) {
        setEditingChecklistId(null);
        setEditingChecklistText('');
      }
      toast.success('Checklist item deleted!');
    } catch (err) {
      toast.error('Failed to delete checklist item');
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

  const handleStartEditComment = (c: CommentItem) => {
    setEditingCommentId(c.id);
    setEditingCommentText(c.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEditComment = async (id: string) => {
    if (!editingCommentText.trim()) return;
    const newContent = editingCommentText.trim();
    try {
      const updated = await fetchApi<CommentItem>(`/api/tasks/comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: newContent }),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, content: updated.content || newContent } : c))
      );
      setEditingCommentId(null);
      setEditingCommentText('');
      toast.success('Comment updated!');
    } catch (err) {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await fetchApi(`/api/tasks/comments/${id}`, {
        method: 'DELETE',
      });
      setComments((prev) => prev.filter((c) => c.id !== id));
      if (editingCommentId === id) {
        setEditingCommentId(null);
        setEditingCommentText('');
      }
      toast.success('Comment deleted!');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnlyMode) {
      onClose();
      return;
    }
    if (onSave) {
      try {
        setIsSavingTask(true);
        const resolvedCode = entity === 'CLIMAGRO' ? 'CAG' : entity === 'COMMON' ? 'COMMON' : 'EHM';
        const matchedEpic = epicsList.find((e) => e.id === selectedEpicId);
        await onSave({
          ...task,
          taskId: parentTaskId,
          taskCode: parentTaskId,
          title: taskName,
          entity,
          entityCode: resolvedCode,
          entityId: undefined,
          epicId: selectedEpicId || null,
          parentEpicCode: matchedEpic ? matchedEpic.epicCode : selectedEpicId ? task.parentEpicCode : null,
          parentEpicTitle: matchedEpic ? matchedEpic.title : selectedEpicId ? task.parentEpicTitle : null,
          assignee: assigneeId ? assignee : 'Unassigned',
          assigneeId: assigneeId || '',
          reviewingLead: reviewingLeadId ? reviewingLead : 'Unassigned',
          reviewingLeadId: reviewingLeadId || '',
          targetWeek,
          priority,
          dueDate,
          status,
          outputUrl,
          waitingOn,
          notes,
          checklists,
          comments,
        });
        onClose();
      } catch (err: any) {
        console.error('[MODAL SAVE ERROR]:', err);
        toast.error(err?.message || 'Failed to save changes to database');
      } finally {
        setIsSavingTask(false);
      }
    } else {
      onClose();
    }
  };

  const completedChecklistCount = checklists.filter((c) => c.isCompleted).length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base tracking-tight">
              {readOnlyMode ? `Submission Review: ${parentTaskId}` : `Edit Task Details: ${parentTaskId}`}
            </h3>
            <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${readOnlyMode ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
              {readOnlyMode ? 'Read-Only View 👁️' : 'Manager Edit Mode ✏️'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(true)}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Delete Task (Admin Only)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Delete Task</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCloneConfirmModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Duplicate / Clone Task"
            >
              <Copy className="w-3.5 h-3.5 text-purple-600" />
              <span>Clone Task</span>
            </button>
            <button
              type="button"
              onClick={() => setShowHistoryPanel(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="View Task Audit History"
            >
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>History</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal Popup */}
        {showDeleteConfirmModal && task && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
              <div className="flex items-center gap-3 text-red-700">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Delete Task Confirmation</h4>
                  <p className="text-xs text-gray-500 font-medium">Permanent Admin Action</p>
                </div>
              </div>

              <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs font-semibold text-gray-800 space-y-2">
                <div>Are you sure you want to permanently delete task <span className="font-mono text-red-700 font-bold">[{parentTaskId}]</span> "{taskName}"?</div>
                <p className="text-[11px] text-red-600 font-medium">This will permanently remove this task, all checklist items, and comment logs.</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingTask}
                  onClick={async () => {
                    try {
                      setIsDeletingTask(true);
                      await fetchApi(`/api/tasks/${task.id}`, { method: 'DELETE' });
                      toast.success(`Task ${parentTaskId} deleted successfully!`);
                      setShowDeleteConfirmModal(false);
                      if (onDelete) {
                        onDelete(task.id);
                      }
                      onClose();
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to delete task');
                    } finally {
                      setIsDeletingTask(false);
                    }
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingTask ? 'Deleting...' : 'Yes, Delete Task'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clone Confirmation Modal Popup */}
        {showCloneConfirmModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-purple-700">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Duplicate Task Confirmation</h4>
                  <p className="text-xs text-gray-500 font-medium">Create a duplicate copy of this task</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 space-y-2">
                <div>Are you sure you want to clone task <span className="font-mono text-purple-700 font-bold">[{parentTaskId}]</span> "{taskName}"?</div>

                <label className="flex items-center gap-2.5 pt-2 border-t border-gray-200 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={importChecklistAndLinks}
                    onChange={(e) => setImportChecklistAndLinks(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Import checklist items and deliverable links also</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCloneConfirmModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCloneConfirmModal(false);
                    if (onClone) {
                      onClone(task, importChecklistAndLinks);
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Confirm & Clone</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0">

          {/* Left Column (Task Info & Checklist) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand / Entity & Parent Task ID & Created At & Created By */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Brand / Entity</label>
                  {readOnlyMode ? (
                    <input
                      type="text"
                      disabled
                      value={
                        entity === 'COMMON' || entity === 'BOTH' || entity.includes('COMMON')
                          ? 'EHM & CLIMAGRO'
                          : entity === 'CAG' || entity === 'CLIMAGRO' || entity.includes('climagro')
                            ? 'CLIMAGRO'
                            : 'EHM'
                      }
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                    />
                  ) : (
                    <select
                      value={entity}
                      onChange={(e) => setEntity(e.target.value)}
                      className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="EHM">EHM</option>
                      <option value="CLIMAGRO">CLIMAGRO</option>
                      <option value="COMMON">EHM & CLIMAGRO (COMMON)</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Task Code</label>
                  <input
                    type="text"
                    disabled
                    value={parentTaskId}
                    className="w-full text-xs font-bold bg-emerald-50/60 border border-emerald-200 rounded-xl p-2.5 text-emerald-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Created At</label>
                  <input
                    type="text"
                    disabled
                    value={formatDateTime(task.createdAt)}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Created By</label>
                  <input
                    type="text"
                    disabled
                    value={task.createdByName || task.creatorName || (task as any).createdBy || (employeesList.find(e => e.id === ((task as any).createdById || (task as any).creatorId))?.name) || 'Admin'}
                    className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                  />
                </div>
              </div>

              {/* Deliverable / Task Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Deliverable / Task Name</label>
                {readOnlyMode ? (
                  <input
                    type="text"
                    disabled
                    value={taskName}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task title / deliverable name..."
                    className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl p-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Parent Feature Epic */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Parent Feature Epic
                  </label>
                  {selectedEpicId ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Linked to Feature Epic
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-gray-400">
                      No Parent Epic (Standalone Backlog Task)
                    </span>
                  )}
                </div>
                {readOnlyMode ? (
                  <input
                    type="text"
                    disabled
                    value={
                      (() => {
                        const matched = epicsList.find((e) => e.id === selectedEpicId);
                        if (matched) return `${matched.epicCode}: ${matched.title}`;
                        if (task.parentEpicCode) return `${task.parentEpicCode}: ${task.parentEpicTitle || ''}`.trim();
                        return 'No parent epic (Standalone Backlog)';
                      })()
                    }
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                  />
                ) : (
                  <select
                    value={selectedEpicId}
                    onChange={(e) => setSelectedEpicId(e.target.value)}
                    className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">No parent epic (Standalone Backlog)</option>
                    {epicsList.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        {ep.epicCode} - {ep.title} ({ep.entityCode || 'ALL'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Assignee & Reviewing Lead */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Assignee</label>
                  {readOnlyMode ? (
                    <input
                      type="text"
                      disabled
                      value={assignee}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                    />
                  ) : (
                    <select
                      value={assigneeId}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        setAssigneeId(targetId);
                        if (!targetId) {
                          setAssignee('Unassigned');
                        } else {
                          const match = employeesList.find((emp) => emp.id === targetId);
                          setAssignee(match ? match.name : 'Unassigned');
                        }
                      }}
                      className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">Select Assignee (Unassigned)</option>
                      {employeesList.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                      {assignee && assignee !== 'Unassigned' && !employeesList.some((e) => e.name.toLowerCase() === assignee.toLowerCase() || e.id === assigneeId) && (
                        <option value={assigneeId || assignee}>{assignee}</option>
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Reviewing Lead</label>
                  {readOnlyMode ? (
                    <input
                      type="text"
                      disabled
                      value={reviewingLead}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                    />
                  ) : (
                    <select
                      value={reviewingLeadId}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        setReviewingLeadId(targetId);
                        if (!targetId) {
                          setReviewingLead('Unassigned');
                        } else {
                          const match = employeesList.find((emp) => emp.id === targetId);
                          setReviewingLead(match ? match.name : 'Unassigned');
                        }
                      }}
                      className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">Select Reviewing Lead (Unassigned / None)</option>
                      {employeesList.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                      {reviewingLead && reviewingLead !== 'Unassigned' && !employeesList.some((e) => e.name.toLowerCase() === reviewingLead.toLowerCase() || e.id === reviewingLeadId) && (
                        <option value={reviewingLeadId || reviewingLead}>{reviewingLead}</option>
                      )}
                    </select>
                  )}
                </div>
              </div>

              {/* Priority & Due Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Priority</label>
                  {readOnlyMode ? (
                    <input
                      type="text"
                      disabled
                      value={formatPriorityLabel(priority)}
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 outline-none"
                    />
                  ) : (
                    <select
                      value={normalizePriorityCode(priority)}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="P1">P1 - Critical / Urgent 🔥</option>
                      <option value="P2">P2 - High Priority ⚡</option>
                      <option value="P3">P3 - Medium Priority 📌</option>
                      <option value="P4">P4 - Low Priority 📝</option>
                    </select>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date</label>
                    {!readOnlyMode && dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate('')}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Clear Due Date
                      </button>
                    )}
                  </div>
                  {readOnlyMode ? (
                    <input
                      type="text"
                      disabled
                      value={dueDate ? formatDueDateDisplay(dueDate) : 'No due date set'}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-700 outline-none"
                    />
                  ) : (
                    <CalendarPicker
                      value={dueDate}
                      onChange={(formatted, rawDate) => {
                        if (!formatted) {
                          setDueDate('');
                        } else if (rawDate) {
                          const yyyy = rawDate.getFullYear();
                          const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
                          const dd = String(rawDate.getDate()).padStart(2, '0');
                          setDueDate(`${yyyy}-${mm}-${dd}`);
                        } else {
                          setDueDate(formatted);
                        }
                      }}
                      placeholder="Select Due Date..."
                      formatMode="date"
                    />
                  )}
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
                    placeholder={readOnlyMode ? "No deliverable link attached by team member" : "https://canva.link/... or https://github.com/..."}
                    value={outputUrl}
                    onChange={e => setOutputUrl(e.target.value)}
                    className={`w-full text-xs border rounded-xl py-2.5 pl-9 pr-3 outline-none font-medium ${readOnlyMode
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
                      <span className={`w-2.5 h-2.5 rounded-full ${status === 'Done' ? 'bg-emerald-500' : status === 'Delayed' ? 'bg-amber-500' : status === 'Blocked' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></span>
                      <span>{status}</span>
                    </div>
                  ) : (
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Backlog">Backlog 📂</option>
                      <option value="Planned">Planned 📋</option>
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
                {readOnlyMode ? (
                  <MarkdownViewer
                    content={notes || 'No progress notes filled by team member.'}
                    className="bg-gray-50 p-3 rounded-xl border border-gray-200"
                  />
                ) : (
                  <RichTextEditor
                    value={notes}
                    onChange={setNotes}
                    placeholder="Detail your daily progress..."
                    rows={3}
                  />
                )}
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
                      disabled={isSavingTask}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingTask ? 'Saving to Database...' : 'Save Changes'}</span>
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
                    editingChecklistId === item.id ? (
                      <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl border border-emerald-300 bg-white">
                        <input
                          type="text"
                          value={editingChecklistText}
                          onChange={(e) => setEditingChecklistText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditChecklist(item.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEditChecklist();
                            }
                          }}
                          autoFocus
                          className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditChecklist(item.id)}
                          title="Save subtask"
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditChecklist}
                          title="Cancel edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        key={item.id}
                        className={`group flex items-center justify-between p-2.5 rounded-xl border transition-colors ${item.isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 cursor-pointer flex-1 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => handleToggleChecklist(item)}
                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                          />
                          <span className={`break-words ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                            {item.itemText}
                          </span>
                        </label>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.completedAt && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Done {new Date(item.completedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {!readOnlyMode && (
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditChecklist(item)}
                                title="Edit subtask"
                                className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteChecklist(item.id)}
                                title="Delete subtask"
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
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
                    className={`p-3 rounded-xl border text-xs space-y-1 shadow-2xs group ${c.isSystemLog
                        ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                        : 'bg-white border-gray-200 text-gray-800'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <span className={c.isSystemLog ? 'text-purple-700 font-mono' : 'text-emerald-700'}>
                        {formatAuthorDisplayName(c.authorName)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 font-semibold text-gray-400">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {formatDateTime(c.createdAt)}
                        </span>
                        {!c.isSystemLog && !readOnlyMode && (
                          <div className="flex items-center gap-0.5 ml-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditComment(c)}
                              title="Edit comment"
                              className="p-0.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              title="Delete comment"
                              className="p-0.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {editingCommentId === c.id ? (
                      <div className="pt-1 space-y-1.5">
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="w-full text-xs p-2 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                          rows={2}
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={handleCancelEditComment}
                            className="px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded-md font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditComment(c.id)}
                            className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    )}
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

            {/* Audit History Timeline Widget */}
            <div className="mt-3 pt-2">
              <RecentActivitySection
                tableName="tasks"
                recordId={task.id}
                onOpenHistory={() => setShowHistoryPanel(true)}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Record History Slide-Over Drawer */}
      {showHistoryPanel && (
        <RecordHistoryPanel
          isOpen={showHistoryPanel}
          onClose={() => setShowHistoryPanel(false)}
          tableName="tasks"
          recordId={task.id}
          title={task.title}
          code={task.taskCode || task.taskId}
        />
      )}
    </div>
  );
};
