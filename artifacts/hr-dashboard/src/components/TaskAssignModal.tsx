import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Layers, Clock, Copy, Plus, CheckCircle, ShieldCheck, Sparkles, ListChecks, MessageSquare, Send, Pencil, Trash2, Check, Link2, ExternalLink, Paperclip } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { RichTextEditor } from './RichTextEditor';
import { CalendarPicker } from './CalendarPicker';
import { SearchableSelect } from './SearchableSelect';
import { formatAuthorDisplayName } from './TaskUpdateModal';
import { formatDateTime } from '../utils/dateUtils';
import { matchesEntityFilter } from '../utils/entityUtils';

interface TaskAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  initialEpicId?: string;
  initialEntityId?: 'EHM' | 'CAG';
  initialDepartment?: string;
  initialTitle?: string;
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

export const TaskAssignModal: React.FC<TaskAssignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialEpicId,
  initialEntityId,
  initialDepartment,
  initialTitle,
}) => {
  const [epics, setEpics] = useState<EpicOption[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<SprintOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedEntityId, setSelectedEntityId] = useState<'EHM' | 'CAG'>('EHM');
  const [isClone, setIsClone] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [selectedEpicId, setSelectedEpicId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Product & Tech');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [reviewingLeadIds, setReviewingLeadIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  // Task Deliverable Links state (Supports multiple structured links: name, url, note)
  const [deliverableLinks, setDeliverableLinks] = useState<{ name: string; url: string; note?: string }[]>([]);
  const [newDeliverableLinkName, setNewDeliverableLinkName] = useState('');
  const [newDeliverableLinkUrl, setNewDeliverableLinkUrl] = useState('');
  const [newDeliverableLinkNote, setNewDeliverableLinkNote] = useState('');

  // Subtask Checklist & Comments state
  const [checklists, setChecklists] = useState<{ id: string; itemText: string; isCompleted: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState('');

  const [comments, setComments] = useState<{ id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const epicOptions = React.useMemo(() => {
    const filtered = epics.filter((ep: any) => {
      if (!selectedEntityId) return true;
      return matchesEntityFilter(ep, selectedEntityId);
    });
    const listToUse = filtered.length > 0 ? filtered : epics;
    return listToUse.map((ep) => ({
      id: ep.id,
      code: ep.epicCode,
      label: ep.title,
    }));
  }, [epics, selectedEntityId]);

  const projectOptions = React.useMemo(() => {
    const filtered = projects.filter((proj: any) => {
      if (!selectedEntityId) return true;
      return matchesEntityFilter(proj, selectedEntityId);
    });
    const listToUse = filtered.length > 0 ? filtered : projects;
    return listToUse.map((proj) => ({
      id: proj.id,
      code: proj.code,
      label: proj.name,
      subtitle: proj.entity,
    }));
  }, [projects, selectedEntityId]);

  const employeeOptions = React.useMemo(() => {
    return employees.map((emp) => ({
      id: emp.id,
      code: emp.employeeCode,
      label: `${emp.firstName} ${emp.lastName}`.trim() || emp.employeeCode,
      subtitle: emp.designation,
    }));
  }, [employees]);

  const cloneTaskOptions = React.useMemo(() => {
    return PREVIOUS_CLONE_TASKS.map((ct) => ({
      id: ct.id,
      code: ct.dept,
      label: ct.title,
    }));
  }, []);

  const handleCloneSelect = (taskId: string) => {
    setCloneSourceId(taskId);
    const found = PREVIOUS_CLONE_TASKS.find((t) => t.id === taskId);
    if (found) {
      setTitle(`[CLONE] ${found.title}`);
      setDepartment(found.dept);
      setPriority(found.priority as any);
      setDescription(found.desc);
      setChecklists([
        { id: 'c-1', itemText: 'Checkpoint 1', isCompleted: false },
        { id: 'c-2', itemText: 'Checkpoint 2', isCompleted: false },
        { id: 'c-3', itemText: 'Checkpoint 3', isCompleted: false },
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

  const handleStartEditChecklist = (item: { id: string; itemText: string }) => {
    setEditingChecklistId(item.id);
    setEditingChecklistText(item.itemText);
  };

  const handleCancelEditChecklist = () => {
    setEditingChecklistId(null);
    setEditingChecklistText('');
  };

  const handleSaveEditChecklist = (id: string) => {
    if (!editingChecklistText.trim()) return;
    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, itemText: editingChecklistText.trim() } : c))
    );
    setEditingChecklistId(null);
    setEditingChecklistText('');
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklists((prev) => prev.filter((c) => c.id !== id));
    if (editingChecklistId === id) {
      setEditingChecklistId(null);
      setEditingChecklistText('');
    }
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

  const handleStartEditComment = (c: any) => {
    setEditingCommentId(c.id);
    setEditingCommentText(c.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEditComment = (id: string) => {
    if (!editingCommentText.trim()) return;
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: editingCommentText.trim() } : c))
    );
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (editingCommentId === id) {
      setEditingCommentId(null);
      setEditingCommentText('');
    }
  };

  const handleAddDeliverableLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedUrl = newDeliverableLinkUrl.trim();
    if (!trimmedUrl) {
      toast.error('Please enter a deliverable URL');
      return;
    }

    let formattedUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(formattedUrl) && (formattedUrl.includes('.') || formattedUrl.startsWith('localhost'))) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const linkName = newDeliverableLinkName.trim() || 'Deliverable Link';
    const linkNote = newDeliverableLinkNote.trim();

    if (deliverableLinks.some(l => l.url.toLowerCase() === formattedUrl.toLowerCase())) {
      toast.error('This deliverable URL has already been added');
      return;
    }

    setDeliverableLinks((prev) => [...prev, { name: linkName, url: formattedUrl, note: linkNote }]);
    setNewDeliverableLinkName('');
    setNewDeliverableLinkUrl('');
    setNewDeliverableLinkNote('');
    toast.success(`Deliverable link "${linkName}" added`);
  };

  const handleRemoveDeliverableLink = (indexToRemove: number) => {
    setDeliverableLinks((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const loadOptions = async () => {
    setLoading(true);
    try {
      const [epicsData, sprintsData, empsData, projsData] = await Promise.all([
        fetchApi<any[]>('/api/epics').catch(() => []),
        fetchApi<any[]>('/api/sprints').catch(() => []),
        fetchApi<any[]>('/api/employees').catch(() => []),
        fetchApi<any[]>('/api/projects').catch(() => []),
      ]);

      const sortedEpics = [...(epicsData || [])].sort((a, b) =>
        (a.title || a.epicCode || '').localeCompare(b.title || b.epicCode || '', undefined, { sensitivity: 'base' })
      );
      setEpics(sortedEpics);

      const sortedSprints = [...(sprintsData || [])].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
      );
      setSprints(sortedSprints);

      const sortedProjects = [...(projsData || [])].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
      );
      setProjects(sortedProjects);

      const formattedEmps = (empsData || []).map(e => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        employeeCode: e.employeeCode,
        designation: e.designation || 'Team Member',
      })).sort((a, b) =>
        `${a.firstName || ''} ${a.lastName || ''}`.trim().localeCompare(
          `${b.firstName || ''} ${b.lastName || ''}`.trim(),
          undefined,
          { sensitivity: 'base' }
        )
      );
      setEmployees(formattedEmps);
      // Keep assigneeId, reviewingLeadId, selectedSprintId, selectedEpicId, selectedProjectId EMPTY by default
    } catch (err) {
      console.error('[TASK MODAL OPTIONS FETCH ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (initialEpicId) {
      setSelectedEpicId(initialEpicId);
    } else {
      setSelectedEpicId('');
    }
    if (initialEntityId) {
      setSelectedEntityId(initialEntityId);
    } else {
      setSelectedEntityId('EHM');
    }
    if (initialDepartment) {
      setDepartment(initialDepartment);
    } else {
      setDepartment('Product & Tech');
    }
    if (initialTitle) {
      setTitle(initialTitle);
    } else {
      setTitle('');
    }
    setDescription('');
    setDueDate('');
    setAssigneeIds([]);
    setReviewingLeadIds([]);
    setDeliverableLinks([]);
    setNewDeliverableLinkName('');
    setNewDeliverableLinkUrl('');
    setNewDeliverableLinkNote('');
    setChecklists([]);
    setComments([]);
    setIsClone(false);
    setCloneSourceId('');
    setSelectedProjectId('');

    loadOptions();

    const handleSync = () => {
      loadOptions();
    };

    window.addEventListener('epics-updated', handleSync);
    window.addEventListener('initiatives-updated', handleSync);
    window.addEventListener('sprints-updated', handleSync);
    return () => {
      window.removeEventListener('epics-updated', handleSync);
      window.removeEventListener('initiatives-updated', handleSync);
      window.removeEventListener('sprints-updated', handleSync);
    };
  }, [isOpen, initialEpicId, initialEntityId, initialDepartment, initialTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter a task title');

    const selectedEpic = epics.find(ep => ep.id === selectedEpicId);

    // Auto-include any link typed into the input field even if "+ Add Link" was not clicked
    let finalLinks = [...deliverableLinks];
    if (newDeliverableLinkUrl.trim()) {
      let extra = newDeliverableLinkUrl.trim();
      if (!/^https?:\/\//i.test(extra) && (extra.includes('.') || extra.startsWith('localhost'))) {
        extra = `https://${extra}`;
      }
      if (!finalLinks.some(l => l.url === extra)) {
        finalLinks.push({
          name: newDeliverableLinkName.trim() || 'Deliverable Link',
          url: extra,
          note: newDeliverableLinkNote.trim() || '',
        });
      }
    }

    const deliverableUrlValue = finalLinks.map(l => l.url).join(', ');

    onSubmit({
      title,
      entity: selectedEntityId,
      entityCode: selectedEntityId,
      epicId: selectedEpicId || null,
      projectId: selectedProjectId || null,
      initiativeId: selectedEpic?.initiativeId || null,
      sprintId: null,
      sprintCategory: null,
      assigneeId: assigneeIds[0] || null,
      assigneeIds: assigneeIds,
      reviewingLeadId: reviewingLeadIds[0] || null,
      reviewingLeadIds: reviewingLeadIds,
      department,
      dueDate,
      description,
      deliverableUrl: deliverableUrlValue,
      deliverableUrls: finalLinks.map(l => l.url),
      deliverableLinks: finalLinks,
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
              Product Backlog Task
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
            
            {/* Target Entity & Department (Grid Pair 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Target Entity *</span>
                  </span>
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value as 'EHM' | 'CAG')}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                >
                  <option value="EHM">EHM</option>
                  <option value="CAG">CLIMAGRO</option>
                </select>
              </div>

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
            </div>

            {/* Parent Epic & Parent Project (Grid Pair 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Parent Epic</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    Optional
                  </span>
                </label>
                <SearchableSelect
                  options={epicOptions}
                  value={selectedEpicId}
                  onChange={setSelectedEpicId}
                  placeholder="Select Parent Epic..."
                  noneLabel="-- No Epic (Standalone) --"
                  searchPlaceholder="Search epics..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Parent Project</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    Optional
                  </span>
                </label>
                <SearchableSelect
                  options={projectOptions}
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                  placeholder="Select Parent Project..."
                  noneLabel="-- No Project (Standalone) --"
                  searchPlaceholder="Search projects..."
                />
              </div>
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

            {/* Priority & Target Date / Due Date (Grid Pair 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 cursor-pointer"
                >
                  <option value="URGENT">P1</option>
                  <option value="HIGH">P2</option>
                  <option value="MEDIUM">P3</option>
                  <option value="LOW">P4</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Target Date / Due Date</label>
                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                </div>
                <CalendarPicker
                  value={dueDate}
                  onChange={(formatted, rawDate) => {
                    if (rawDate) {
                      const yyyy = rawDate.getFullYear();
                      const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(rawDate.getDate()).padStart(2, '0');
                      setDueDate(`${yyyy}-${mm}-${dd}`);
                    } else {
                      setDueDate(formatted);
                    }
                  }}
                  placeholder="Select Due Date (Optional)..."
                  formatMode="date"
                />
              </div>
            </div>

            {/* Assigned To & Reviewing Lead (Grid Pair 4: Multi-Select supported, can be kept empty) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned To (Multi-Select)</label>
                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                </div>
                <SearchableSelect
                  options={employeeOptions}
                  isMulti={true}
                  multiValues={assigneeIds}
                  onMultiChange={setAssigneeIds}
                  placeholder="Select Team Members (Optional)..."
                  noneLabel="-- Unassigned (None) --"
                  searchPlaceholder="Search team members..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Reviewing Lead (Multi-Select)</label>
                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                </div>
                <SearchableSelect
                  options={employeeOptions}
                  isMulti={true}
                  multiValues={reviewingLeadIds}
                  onMultiChange={setReviewingLeadIds}
                  placeholder="Select Reviewing Leads (Optional)..."
                  noneLabel="-- Unassigned Lead --"
                  searchPlaceholder="Search managers..."
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Description</label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Task deliverable guidelines, technical specifications, and expected outputs..."
                rows={3}
              />
            </div>

            {/* Task Deliverable Links (Multiple Links Supported) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Task Deliverable & Links</span>
                </label>
                <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                  {deliverableLinks.length} {deliverableLinks.length === 1 ? 'Link' : 'Links'} Added
                </span>
              </div>

              {/* Add Link Input Group with Custom Name, URL, and Note */}
              <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200/80 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={newDeliverableLinkName}
                      onChange={(e) => setNewDeliverableLinkName(e.target.value)}
                      placeholder="Link Name (e.g. HTML Link, Test Link, Figma, PR)"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                    />
                  </div>
                  <div className="md:col-span-5 relative">
                    <Link2 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={newDeliverableLinkUrl}
                      onChange={(e) => setNewDeliverableLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDeliverableLink(e);
                        }
                      }}
                      placeholder="https://... (GitHub, Figma, Live URL)"
                      className="w-full text-xs border border-gray-300 rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={() => handleAddDeliverableLink()}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Multiple Links List */}
              {deliverableLinks.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {deliverableLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-gray-800 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <Link2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-emerald-950">
                              {link.name || 'Deliverable Link'}
                            </span>
                            {link.note && (
                              <span className="text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                {link.note}
                              </span>
                            )}
                          </div>
                          <p className="truncate font-mono text-[11px] text-emerald-800 hover:underline cursor-pointer" title={link.url}>
                            {link.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open link in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open ↗</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverableLink(idx)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 font-medium pl-1">
                  Optional: Add one or more named deliverable links (HTML Prototype, Test Link, Docs).
                </p>
              )}
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
                    editingChecklistId === item.id ? (
                      <div key={item.id} className="flex items-center gap-1.5 p-1.5 rounded-xl border border-emerald-300 bg-white">
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
                          className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditChecklist(item.id)}
                          title="Save subtask"
                          className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditChecklist}
                          title="Cancel edit"
                          className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        key={item.id}
                        className={`group flex items-center justify-between p-2 rounded-xl border transition-colors ${
                          item.isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer flex-1 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => handleToggleChecklist(item.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                          />
                          <span className={`break-words ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                            {item.itemText}
                          </span>
                        </label>
                        <div className="flex items-center gap-0.5 shrink-0">
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
                      </div>
                    )
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
                    <SearchableSelect
                      options={cloneTaskOptions}
                      value={cloneSourceId}
                      onChange={(newVal) => handleCloneSelect(newVal)}
                      placeholder="-- Choose Task Template to Auto-Fill --"
                      noneLabel="-- None / Don't Clone --"
                      searchPlaceholder="Search task templates to clone..."
                    />
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
                        className={`p-2.5 rounded-xl border text-xs space-y-1 shadow-2xs group ${
                          c.isSystemLog
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
                            {!c.isSystemLog && (
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


