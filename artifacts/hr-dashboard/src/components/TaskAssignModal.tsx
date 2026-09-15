import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Layers, Clock, Copy, Plus, CheckCircle, ShieldCheck, Sparkles, ListChecks, MessageSquare, Send } from 'lucide-react';
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
  status?: string;
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

  // Subtask Checklist & Comments state
  const [checklists, setChecklists] = useState<{ id: string; itemText: string; isCompleted: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const [comments, setComments] = useState<{ id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  const handleCloneSelect = (taskId: string) => {
    setCloneSourceId(taskId);
    const found = PREVIOUS_CLONE_TASKS.find((t) => t.id === taskId);
    if (found) {
      setTitle(`[CLONE] ${found.title}`);
      setDepartment(found.dept);
      setPriority(found.priority as any);
      setDescription(found.desc);
      setChecklists([
        { id: 'c-1', itemText: 'Verify requirements and specifications', isCompleted: false },
        { id: 'c-2', itemText: 'Initial setup & integration tests', isCompleted: false },
      ]);
      setComments([
        { id: 'cm-1', authorName: 'System', content: `Cloned template: ${found.title}`, createdAt: new Date().toISOString(), isSystemLog: true },
      ]);
      toast.success(`Pre-filled configuration from "${found.title}". Adjust details as needed!`);
    }
  };

  const handleAddChecklist = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      itemText: newChecklistText.trim(),
      isCompleted: false,
    };
    setChecklists((prev) => [...prev, newItem]);
    setNewChecklistText('');
  };

  const handleToggleChecklist = (id: string) => {
    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCompleted: !c.isCompleted } : c))
    );
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `cmt-${Date.now()}`,
      authorName: 'Admin User',
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    setNewCommentText('');
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

        const sortedEpics = [...epicsData].sort((a, b) =>
          (a.title || '').localeCompare(b.title || '')
        );
        setEpics(sortedEpics);
        if (sortedEpics.length > 0) {
          setSelectedEpicId(sortedEpics[0].id);
        }

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

    if (assignToSprint && !selectedSprintId) {
      return toast.error('Please select a Sprint');
    }

    if (!assigneeId) return toast.error('Please select an assignee');

    const selectedEpic = epics.find(ep => ep.id === selectedEpicId);

    const activeSprintItem = sprints.find((s: any) => s.status === 'IN_PROGRESS' || s.status === 'ACTIVE') || sprints[0];
    const futureSprintItem = sprints.find((s: any) => s.status === 'PLANNED' || s.status === 'UPCOMING') || sprints[1] || sprints[0];

    const resolvedSprintId = selectedSprintId === 'Active Sprint'
      ? (activeSprintItem?.id || null)
      : selectedSprintId === 'Future Sprint'
      ? (futureSprintItem?.id || null)
      : selectedSprintId || null;

    onSubmit({
      title,
      epicId: selectedEpicId || null,
      initiativeId: selectedEpic?.initiativeId || null,
      sprintId: assignToSprint ? resolvedSprintId : null,
      sprintCategory: assignToSprint ? selectedSprintId : null,
      assigneeId,
      reviewingLeadId: reviewingLeadId || assigneeId,
      department,
      dueDate,
      description,
      priority,
      checklists,
      comments,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base tracking-tight">Create New Task</h3>
            <span className="px-2.5 py-0.5 border rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
              Product Backlog & Sprint Assignment
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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0">
          
          {/* Left Column (Main Form Fields & Subtask Checklist) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            
            {/* Parent Epic Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Parent Epic (Optional)</span>
                </span>
                <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  Optional
                </span>
              </label>
              <select
                value={selectedEpicId}
                onChange={(e) => setSelectedEpicId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
              >
                <option value="">Select Parent Epic (Optional)...</option>
                {epics.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    [{ep.epicCode}] {ep.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox: Assign this also in sprint */}
            <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80 space-y-2">
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
              <p className="text-[10px] text-gray-400 font-medium pl-6">
                All created tasks populate directly into Product Backlog. Check this box to also assign to an Active or Future Sprint.
              </p>

              {assignToSprint && (
                <div className="pt-2 animate-in fade-in duration-150 space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Select Target Sprint *</span>
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Active Sprint & Future Sprint
                    </span>
                  </label>
                  <select
                    required={assignToSprint}
                    value={selectedSprintId}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                  >
                    <option value="">Select Target Sprint...</option>
                    <option value="Active Sprint">Active Sprint</option>
                    <option value="Future Sprint">Future Sprint</option>
                  </select>
                </div>
              )}
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Task Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Implement OAuth Callback Endpoint & Token Refresh"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Department & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Department *</label>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                >
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium 🟡</option>
                  <option value="HIGH">High 🟠</option>
                  <option value="URGENT">Urgent 🔴</option>
                </select>
              </div>
            </div>

            {/* Assigned To & Reviewing Lead */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Assigned To *</label>
                <select
                  required
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
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
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Reviewing Lead *</label>
                <select
                  required
                  value={reviewingLeadId}
                  onChange={(e) => setReviewingLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
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
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Target Date / Due Date *</label>
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
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Description</label>
              <textarea
                rows={2}
                placeholder="Task deliverable guidelines, technical specifications, and expected outputs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
              />
            </div>

            {/* Subtask Checklist Section */}
            <div className="pt-3 border-t border-gray-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-emerald-600" />
                  <span>Subtask Checklist</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {checklists.filter(c => c.isCompleted).length} of {checklists.length} Completed
                </span>
              </div>

              {/* Subtask items list */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {checklists.length === 0 ? (
                  <div className="py-3 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No subtasks added yet. Add one below!
                  </div>
                ) : (
                  checklists.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                        item.isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => handleToggleChecklist(item.id)}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                          {item.itemText}
                        </span>
                      </label>
                    </div>
                  ))
                )}
              </div>

              {/* Add Subtask Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new subtask checklist item..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklist(e);
                    }
                  }}
                  className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddChecklist()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column (Template Cloning & Activity/Comments) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-left space-y-4">
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              
              {/* Template Cloning Box */}
              <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200/80 space-y-2.5 shrink-0">
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

              {/* Activity & Comments Container (Replaces Live Task Summary) */}
              <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex-1 flex flex-col min-h-0 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Activity & Comments</span>
                  </span>
                  <span className="text-[10px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                    {comments.length}
                  </span>
                </div>

                {/* Comments Feed */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px] max-h-[240px]">
                  {comments.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-8 text-center text-xs text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      No comments yet. Post the first comment!
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 shadow-2xs ${
                          c.isSystemLog
                            ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                            : 'bg-white border-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                          <span className={c.isSystemLog ? 'text-purple-700 font-mono' : 'text-emerald-700'}>
                            {c.authorName || 'User'}
                          </span>
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-medium text-gray-800 leading-relaxed">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input & Post Button */}
                <div className="flex gap-2 pt-2 border-t border-gray-100 shrink-0">
                  <input
                    type="text"
                    placeholder="Write a comment or activity log..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment(e);
                      }
                    }}
                    className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Assign & Create Task</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

