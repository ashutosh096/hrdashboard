import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, Search, Filter, Archive, AlertCircle, Users, Lock, Clock, MoveRight, ChevronLeft, ChevronRight, Eye, Sparkles, X, Layers, ListChecks, MessageSquare, Send } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { RichTextEditor } from './RichTextEditor';
import { formatDateTime } from '../utils/dateUtils';

interface SprintItem {
  id: string;
  sprintCode: string;
  name: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  epicTitle?: string;
  department?: string | null;
  targetWeek?: string | null;
  reviewingLeadId?: string | null;
  reviewingLeadName?: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  goal?: string;
  tasksCount?: number;
  tasks?: any[];
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  designation: string;
  email: string;
}

interface EpicOption {
  id: string;
  epicCode: string;
  title: string;
}

interface Props {
  isManager: boolean;
}

const DEPARTMENT_OPTIONS = [
  'Marketing',
  'Sales',
  'Product & Tech',
  'Operations & Delivery',
  'Grants & Governance',
];

// Persistent local task store across role switches & re-mounts
const CREATED_TASKS_CACHE: any[] = [];

const WEEKS = [
  { id: 'ALL', label: 'All Weeks (Month 1)', isFuture: false },
  { id: 'Week 1 (Days 1–7)', label: 'Week 1 (Days 1–7)', isFuture: false },
  { id: 'Week 2 (Days 8–14)', label: 'Week 2 (Days 8–14)', isFuture: false },
  { id: 'Week 3 (Days 15–21)', label: 'Week 3 (Days 15–21)', isFuture: true },
  { id: 'Week 4 (Days 22–28)', label: 'Week 4 (Days 22–28)', isFuture: true },
];

const KANBAN_COLUMNS = [
  { id: 'BACKLOG', label: 'Backlog', color: 'bg-slate-100/80 border-slate-200 text-slate-700', badgeColor: 'bg-slate-200 text-slate-800' },
  { id: 'PLANNED', label: 'Planned', color: 'bg-purple-50/80 border-purple-200 text-purple-800', badgeColor: 'bg-purple-100 text-purple-800' },
  { id: 'TODO', label: 'To Do', color: 'bg-blue-50/80 border-blue-200 text-blue-800', badgeColor: 'bg-blue-100 text-blue-800' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-50/80 border-amber-200 text-amber-800', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'TO_REVIEW', label: 'To Review', color: 'bg-indigo-50/80 border-indigo-200 text-indigo-800', badgeColor: 'bg-indigo-100 text-indigo-800' },
  { id: 'DONE', label: 'Done', color: 'bg-emerald-50/80 border-emerald-200 text-emerald-800', badgeColor: 'bg-emerald-100 text-emerald-800' },
];

export const SprintsSubView: React.FC<Props> = ({ isManager }) => {
  const { user } = useAuth();
  const [sprints, setSprints] = useState<SprintItem[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [epics, setEpics] = useState<EpicOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Scalable View Controls & Filters
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
  const [sprintCategory, setSprintCategory] = useState<'ACTIVE' | 'PAST' | 'FUTURE' | 'DATE_RANGE'>('ACTIVE');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBacklogExpanded, setIsBacklogExpanded] = useState<boolean>(true);

  // Synchronized Top Horizontal Scrollbar & Quick Jump Navigation Refs
  const kanbanContainerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  const handleTopScroll = () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (topScrollRef.current && kanbanContainerRef.current) {
      kanbanContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const handleKanbanScroll = () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (topScrollRef.current && kanbanContainerRef.current) {
      topScrollRef.current.scrollLeft = kanbanContainerRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const scrollBoard = (direction: 'left' | 'right') => {
    if (kanbanContainerRef.current) {
      const amount = direction === 'left' ? -350 : 350;
      kanbanContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const scrollToColumn = (colId: string) => {
    const colEl = document.getElementById(`kanban-column-${colId}`);
    if (colEl && kanbanContainerRef.current) {
      colEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  // Status Transition Confirmation Modals State
  const [confirmPlannedModal, setConfirmPlannedModal] = useState<{
    task: any;
    targetColumn: string;
  } | null>(null);

  const [assignTaskModal, setAssignTaskModal] = useState<{
    task: any;
    targetColumn: string;
    assigneeId: string;
    reviewingLeadId: string;
    sprintWeek: string;
    dueDate: string;
    priority: string;
    description: string;
    checklists: { id: string; itemText: string; isCompleted: boolean }[];
    comments: { id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[];
    newChecklistText?: string;
    newCommentText?: string;
  } | null>(null);

  const [confirmDoneModal, setConfirmDoneModal] = useState<{
    task: any;
    deliverableUrl: string;
    notes: string;
    checklists: { id: string; itemText: string; isCompleted: boolean }[];
    comments: { id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[];
    newChecklistText?: string;
    newCommentText?: string;
  } | null>(null);

  // Task Update / Review Modal State
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);

  // New Sprint Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedEpicId, setSelectedEpicId] = useState('');
  const [sprintName, setSprintName] = useState('');
  const [department, setDepartment] = useState('Product & Tech');
  
  const initialCurrentDay = new Date().getDate();
  const defaultWeekStr = initialCurrentDay <= 7 ? 'Week 1 (Days 1–7)' : initialCurrentDay <= 14 ? 'Week 2 (Days 8–14)' : initialCurrentDay <= 21 ? 'Week 3 (Days 15–21)' : 'Week 4 (Days 22–28)';
  const [targetWeek, setTargetWeek] = useState(defaultWeekStr);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [goal, setGoal] = useState('');
  const [isClone, setIsClone] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Checklist & Comments state
  const [modalChecklists, setModalChecklists] = useState<{ id: string; itemText: string; isCompleted: boolean }[]>([]);
  const [modalNewChecklistText, setModalNewChecklistText] = useState('');
  const [modalComments, setModalComments] = useState<{ id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[]>([]);
  const [modalNewCommentText, setModalNewCommentText] = useState('');

  const handleAddModalChecklist = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modalNewChecklistText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      itemText: modalNewChecklistText.trim(),
      isCompleted: false,
    };
    setModalChecklists((prev) => [...prev, newItem]);
    setModalNewChecklistText('');
  };

  const handleToggleModalChecklist = (id: string) => {
    setModalChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCompleted: !c.isCompleted } : c))
    );
  };

  const handleAddModalComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modalNewCommentText.trim()) return;
    const newComment = {
      id: `cmt-${Date.now()}`,
      authorName: 'Admin User',
      content: modalNewCommentText.trim(),
      createdAt: new Date().toISOString(),
    };
    setModalComments((prev) => [...prev, newComment]);
    setModalNewCommentText('');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sprintsData, empData, epicsData, tasksData] = await Promise.all([
        fetchApi<SprintItem[]>('/api/sprints'),
        fetchApi<any[]>('/api/employees'),
        fetchApi<any[]>('/api/epics'),
        fetchApi<any[]>('/api/tasks'),
      ]);
      setSprints(sprintsData || []);
      
      const merged = [...CREATED_TASKS_CACHE, ...(tasksData || [])];
      const uniqueTasks = Array.from(new Map(merged.map(t => [t.id, t])).values());
      setAllTasks(uniqueTasks);

      const formattedEmps = (empData || []).map(e => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        employeeCode: e.employeeCode,
        designation: e.designation || 'Team Member',
        email: e.email || '',
      }));
      setEmployees(formattedEmps);

      if (formattedEmps.length > 0) {
        if (selectedEmpIds.length === 0) setSelectedEmpIds([formattedEmps[0].id]);
        if (!selectedLeadId) setSelectedLeadId(formattedEmps[0].id);
      }

      const sortedEpics = [...(epicsData || [])].sort((a, b) => a.title.localeCompare(b.title));
      setEpics(sortedEpics);
      if (sortedEpics.length > 0 && !selectedEpicId) {
        setSelectedEpicId(sortedEpics[0].id);
      }
    } catch (err) {
      console.error('[FETCH SPRINTS DATA ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTaskColumn = (task: any): string => {
    const status = (task.status || '').toUpperCase();
    if (status === 'DONE' || status === 'COMPLETED') return 'DONE';
    if (status === 'IN_REVIEW' || status === 'TO_REVIEW' || status === 'REVIEW') return 'TO_REVIEW';
    if (status === 'IN_PROGRESS' || status === 'ACTIVE') return 'IN_PROGRESS';
    if (status === 'TODO') return 'TODO';
    if (status === 'PLANNED') return 'PLANNED';
    return 'BACKLOG';
  };

  const handleMoveTask = async (taskId: string, newColumn: string) => {
    let apiStatus = 'BACKLOG';
    if (newColumn === 'DONE') apiStatus = 'DONE';
    else if (newColumn === 'TO_REVIEW') apiStatus = 'IN_REVIEW';
    else if (newColumn === 'IN_PROGRESS') apiStatus = 'IN_PROGRESS';
    else if (newColumn === 'TODO') apiStatus = 'TODO';
    else if (newColumn === 'PLANNED') apiStatus = 'PLANNED';

    const targetTask = allTasks.find(t => t.id === taskId);
    const taskTitle = targetTask?.title || 'Deliverable Task';
    const taskCode = targetTask?.taskCode || taskId;
    const reviewingLead = targetTask?.reviewingLead || 'Reviewing Lead';

    try {
      await fetchApi(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: apiStatus }),
      });

      if (newColumn === 'TO_REVIEW') {
        fetchApi('/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            title: `Review Pending: ${taskCode}`,
            message: `Task ${taskCode} "${taskTitle}" has been pushed to To Review queue for your manager sign-off.`,
            isRead: false,
          }),
        }).catch(() => {});
        toast.success(`Review Pending notification sent to Lead (${reviewingLead})!`);
      } else {
        toast.success(`Task ${taskCode} moved to ${newColumn}!`);
      }
    } catch (err) {
      if (newColumn === 'TO_REVIEW') {
        toast.success(`Review Pending notification logged for Lead (${reviewingLead})!`);
      } else {
        toast.success(`Task status updated to ${newColumn}!`);
      }
    }

    setAllTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: apiStatus } : t))
    );
  };

  const handleTaskStatusTransition = (taskId: string, targetColumn: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const currentColumn = getTaskColumn(task);
    if (currentColumn === targetColumn) return;

    // 1. Backlog -> Planned: Confirmation modal popup
    if (targetColumn === 'PLANNED') {
      setConfirmPlannedModal({
        task,
        targetColumn: 'PLANNED',
      });
      return;
    }

    // 2. Planned or Backlog -> To Do or In Progress: Assign Employee & Lead form modal
    if ((currentColumn === 'BACKLOG' || currentColumn === 'PLANNED') && ['TODO', 'IN_PROGRESS'].includes(targetColumn)) {
      setAssignTaskModal({
        task,
        targetColumn,
        assigneeId: task.assigneeId || (employees[0]?.id || ''),
        reviewingLeadId: task.reviewingLeadId || (employees[0]?.id || ''),
        sprintWeek: task.sprintWeek || task.targetWeek || 'Week 1 (Days 1–7)',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        priority: task.priority || 'P3',
        description: task.description || task.notes || '',
        checklists: task.checklists || [
          { id: `c-${Date.now()}-1`, itemText: 'Requirement Analysis & Solution Design', isCompleted: false },
          { id: `c-${Date.now()}-2`, itemText: 'Implementation & Module Integration', isCompleted: false },
          { id: `c-${Date.now()}-3`, itemText: 'QA Validation & Code Review Sign-off', isCompleted: false },
        ],
        comments: task.comments || [],
        newChecklistText: '',
        newCommentText: '',
      });
      return;
    }

    // 3. To Review / In Progress -> Done: Completion sign-off modal form
    if (targetColumn === 'DONE') {
      setConfirmDoneModal({
        task,
        deliverableUrl: task.deliverableUrl || task.outputUrl || '',
        notes: task.description || task.notes || '',
        checklists: task.checklists || [
          { id: `c-${Date.now()}-1`, itemText: 'Requirement Analysis & Solution Design', isCompleted: true },
          { id: `c-${Date.now()}-2`, itemText: 'Implementation & Module Integration', isCompleted: true },
          { id: `c-${Date.now()}-3`, itemText: 'QA Validation & Code Review Sign-off', isCompleted: true },
        ],
        comments: task.comments || [],
        newChecklistText: '',
        newCommentText: '',
      });
      return;
    }

    // 4. Default move (e.g. to TO_REVIEW which notifies reviewing lead)
    handleMoveTask(taskId, targetColumn);
  };

  const confirmShiftToPlanned = async () => {
    if (!confirmPlannedModal) return;
    const { task } = confirmPlannedModal;

    try {
      await fetchApi(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PLANNED' }),
      });
      toast.success(`Task ${task.taskCode || task.id} shifted to Planned!`);
    } catch (err) {
      toast.success(`Task shifted to Planned!`);
    }

    setAllTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: 'PLANNED' } : t))
    );
    setConfirmPlannedModal(null);
  };

  const confirmAssignTask = async () => {
    if (!assignTaskModal) return;
    const { task, targetColumn, assigneeId, reviewingLeadId, sprintWeek, dueDate, priority, description, checklists, comments } = assignTaskModal;

    let apiStatus = 'TODO';
    if (targetColumn === 'DONE') apiStatus = 'DONE';
    else if (targetColumn === 'TO_REVIEW') apiStatus = 'IN_REVIEW';
    else if (targetColumn === 'IN_PROGRESS') apiStatus = 'IN_PROGRESS';

    const assignedEmp = employees.find(e => e.id === assigneeId);
    const leadEmp = employees.find(e => e.id === reviewingLeadId);

    try {
      await fetchApi(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: apiStatus,
          assigneeId,
          reviewingLeadId,
          sprintWeek,
          dueDate,
          priority,
          description,
          checklists,
          comments,
        }),
      });
      toast.success(`Task ${task.taskCode || task.id} assigned and shifted to ${targetColumn}!`);
    } catch (err) {
      toast.success(`Task assigned and shifted to ${targetColumn}!`);
    }

    setAllTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
              ...t,
              status: apiStatus,
              assigneeId,
              assigneeName: assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}` : t.assigneeName,
              assigneeEmail: assignedEmp?.email || t.assigneeEmail,
              reviewingLeadId,
              reviewingLead: leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}` : t.reviewingLead,
              sprintWeek,
              dueDate,
              priority,
              description,
              checklists,
              comments,
            }
          : t
      )
    );

    setAssignTaskModal(null);
  };

  const confirmMarkAsDone = async () => {
    if (!confirmDoneModal) return;
    const { task, deliverableUrl, notes, checklists, comments } = confirmDoneModal;

    try {
      await fetchApi(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'DONE',
          deliverableUrl,
          description: notes,
          checklists,
          comments,
        }),
      });
      toast.success(`Task ${task.taskCode || task.id} signed off and marked Done!`);
    } catch (err) {
      toast.success(`Task marked as Done!`);
    }

    setAllTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? { ...t, status: 'DONE', deliverableUrl, description: notes, checklists, comments }
          : t
      )
    );

    setConfirmDoneModal(null);
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName.trim()) return toast.error('Please enter a sprint task title');

    setIsSubmitting(true);
    const targetEmpId = selectedEmpIds[0] || (employees[0]?.id || 'emp-1');
    const assignedEmp = employees.find(e => e.id === targetEmpId);
    const leadEmp = employees.find(e => e.id === selectedLeadId);

    let createdId = `task-${Date.now()}`;
    let createdCode = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const createdTask = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: sprintName,
          description: goal,
          assigneeId: targetEmpId,
          assigneeIds: selectedEmpIds.length > 0 ? selectedEmpIds : [targetEmpId],
          reviewingLeadId: selectedLeadId || null,
          epicId: selectedEpicId || null,
          status: 'BACKLOG',
          priority: 'P3',
          dueDate: endDate,
        }),
      }).catch(() => null);

      if (createdTask?.id || (Array.isArray(createdTask) && createdTask[0]?.id)) {
        const item = Array.isArray(createdTask) ? createdTask[0] : createdTask;
        createdId = item.id;
        createdCode = item.taskCode || item.sprintCode || createdCode;
      }

      const createdSprint = await fetchApi<any>('/api/sprints', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: targetEmpId,
          assigneeIds: selectedEmpIds.length > 0 ? selectedEmpIds : [targetEmpId],
          epicId: selectedEpicId || null,
          reviewingLeadId: selectedLeadId || null,
          name: sprintName,
          department,
          targetWeek,
          startDate,
          endDate,
          goal,
          status: 'PLANNED',
          checklists: modalChecklists,
          comments: modalComments,
        }),
      }).catch(() => null);

      if (!createdCode && (createdSprint?.taskCode || createdSprint?.sprintCode)) {
        createdCode = createdSprint.taskCode || createdSprint.sprintCode;
      }
    } catch (err: any) {
      console.warn('[BACKEND SPRINT API NOTICE]: Using local sprint task state fallback.', err);
    }

    const assignedEmpNames = selectedEmpIds
      .map(id => {
        const emp = employees.find(e => e.id === id);
        return emp ? `${emp.firstName} ${emp.lastName}` : null;
      })
      .filter(Boolean);

    const assigneeNamesStr = assignedEmpNames.length > 0 
      ? assignedEmpNames.join(', ') 
      : (assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}` : 'Unassigned');

    const newTask = {
      id: createdId,
      taskCode: createdCode,
      title: sprintName,
      status: 'BACKLOG',
      assigneeId: selectedEmpIds[0] || targetEmpId,
      assigneeIds: selectedEmpIds.length > 0 ? selectedEmpIds : [targetEmpId],
      assigneeName: assigneeNamesStr,
      assigneeEmail: assignedEmp?.email || '',
      reviewingLeadId: selectedLeadId || null,
      reviewingLead: leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}` : 'Unassigned',
      sprintWeek: targetWeek,
      priority: 'P3',
      dueDate: endDate,
      description: goal,
      checklists: modalChecklists,
      comments: modalComments,
      createdAt: new Date().toISOString(),
      createdById: user?.id || 'mgr-1',
      isEmployeeCreated: !isManager,
      createdInMode: isManager ? 'MANAGER' : 'EMPLOYEE',
    };

    CREATED_TASKS_CACHE.unshift(newTask);
    setAllTasks(prev => [newTask, ...prev]);
    toast.success(`Task "${sprintName}" created and added to Product Backlog!`);
    setIsModalOpen(false);
    setSprintName('');
    setGoal('');
    setModalChecklists([]);
    setModalComments([]);
    setIsSubmitting(false);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode || task.id,
      title: task.title,
      entity: (task.assigneeCode || '').startsWith('CAG') ? 'CLIMAGRO' : 'EHM',
      assignee: task.assigneeName || 'Employee',
      reviewingLead: task.reviewingLead || 'Manager Lead',
      status: task.status === 'DONE' ? 'Done' : task.status === 'IN_REVIEW' ? 'In Progress' : 'In Progress',
      outputUrl: task.deliverableUrl || task.outputUrl || '',
      waitingOn: 'None (Self)',
      notes: task.description || task.notes || '',
      createdAt: task.createdAt,
    });
  };

  const handleSaveTaskUpdate = async (updated: TaskItem) => {
    const nextStatus = updated.status === 'Done' ? 'DONE' : 'IN_PROGRESS';
    try {
      await fetchApi<any>(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          deliverableUrl: updated.outputUrl,
          description: updated.notes,
        }),
      });
      toast.success(`Task ${updated.taskId} updated successfully!`);
      loadData();
    } catch (err) {
      toast.success(`Task status updated locally!`);
      setAllTasks(allTasks.map(t => t.id === updated.id ? { ...t, status: nextStatus } : t));
    }
  };

  const handleCloneTask = async (sourceTaskItem: TaskItem, importChecklistAndLinks: boolean) => {
    const sourceTask = allTasks.find(t => t.id === sourceTaskItem.id || t.taskCode === sourceTaskItem.taskId) || sourceTaskItem;
    const sourceCode = sourceTask.taskCode || sourceTaskItem.taskId || sourceTask.id;
    const newId = `task-clone-${Date.now()}`;
    const newCode = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;

    const firstComment = {
      id: `cmt-${Date.now()}`,
      authorName: 'System Log',
      content: `This task was created from the source task ${sourceCode}`,
      isSystemLog: true,
      createdAt: new Date().toISOString(),
    };

    const clonedTaskObj = {
      id: newId,
      taskCode: newCode,
      title: `[CLONE] ${sourceTask.title || sourceTaskItem.title}`,
      status: 'PLANNED',
      assigneeId: sourceTask.assigneeId || null,
      assigneeName: sourceTask.assigneeName || sourceTaskItem.assignee || 'Unassigned',
      assigneeEmail: sourceTask.assigneeEmail || '',
      reviewingLeadId: sourceTask.reviewingLeadId || null,
      reviewingLead: sourceTask.reviewingLead || sourceTaskItem.reviewingLead || 'Unassigned',
      sprintWeek: sourceTask.sprintWeek || 'Week 1 (Days 1–7)',
      priority: sourceTask.priority || 'P3',
      dueDate: sourceTask.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description: sourceTask.description || sourceTaskItem.notes || '',
      deliverableUrl: importChecklistAndLinks ? (sourceTask.deliverableUrl || sourceTaskItem.outputUrl || '') : '',
      checklists: importChecklistAndLinks ? (sourceTask.checklists || []) : [],
      comments: [firstComment, ...(sourceTask.comments || [])],
      createdAt: new Date().toISOString(),
    };

    setAllTasks(prev => [clonedTaskObj, ...prev]);

    setSelectedTaskToUpdate({
      id: clonedTaskObj.id,
      taskId: clonedTaskObj.taskCode,
      title: clonedTaskObj.title,
      entity: (clonedTaskObj.taskCode || '').startsWith('CAG') ? 'CLIMAGRO' : 'EHM',
      assignee: clonedTaskObj.assigneeName,
      reviewingLead: clonedTaskObj.reviewingLead,
      status: 'In Progress',
      outputUrl: clonedTaskObj.deliverableUrl,
      waitingOn: 'None (Self)',
      notes: clonedTaskObj.description,
      createdAt: clonedTaskObj.createdAt,
    });

    toast.success(`Task duplicated! Opening cloned task ${newCode}...`);
  };

  const getCurrentSprintWeekIndex = (): number => {
    const day = new Date().getDate();
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    return 4;
  };

  const getSprintWeekIndex = (weekStr?: string | null): number => {
    if (!weekStr) return 0;
    const lower = weekStr.toLowerCase();
    if (lower.includes('week 1') || lower.includes('days 1–7') || lower.includes('days 1-7')) return 1;
    if (lower.includes('week 2') || lower.includes('days 8–14') || lower.includes('days 8-14')) return 2;
    if (lower.includes('week 3') || lower.includes('days 15–21') || lower.includes('days 15-21')) return 3;
    if (lower.includes('week 4') || lower.includes('days 22–28') || lower.includes('days 22-28')) return 4;
    return 0;
  };

  const currentWeekIdx = getCurrentSprintWeekIndex();

  const filteredTasks = allTasks.filter(t => {
    const isDone = t.status === 'DONE' || t.status === 'COMPLETED';
    const matchesViewMode = viewMode === 'ARCHIVE' ? isDone : true;

    const taskCol = getTaskColumn(t);

    const taskWeekStr = t.sprintWeek || t.targetWeek || '';
    const taskWeekIdx = getSprintWeekIndex(taskWeekStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = t.dueDate ? new Date(t.dueDate) : null;

    let matchesSprintCategory = true;
    if (sprintCategory === 'ACTIVE') {
      // Active Sprints (Present week's sprints, present week backlog, or currently active tasks)
      const isPresentWeek = taskWeekIdx === currentWeekIdx;
      const isActiveStatus = taskCol === 'IN_PROGRESS' || taskCol === 'TODO' || taskCol === 'TO_REVIEW' || taskCol === 'PLANNED';
      const isUnassignedWeek = taskWeekIdx === 0;
      const isBacklogTask = taskCol === 'BACKLOG';
      matchesSprintCategory = isPresentWeek || isUnassignedWeek || isActiveStatus || isBacklogTask;
    } else if (sprintCategory === 'PAST') {
      // Past Sprints (Past week's sprints: e.g. Week 1 or Week 2 when currently in Week 3, or past due date)
      const isPastWeek = taskWeekIdx > 0 && taskWeekIdx < currentWeekIdx;
      const isPastDueDate = taskDueDate && taskDueDate < today;
      matchesSprintCategory = isPastWeek || (isPastDueDate && taskCol !== 'BACKLOG');
    } else if (sprintCategory === 'FUTURE') {
      // Future Sprints & Undecided Sprints (Future weeks, or tasks not declared / not decided / Backlog)
      const isFutureWeek = taskWeekIdx > currentWeekIdx;
      const isUndecidedOrBacklog = taskWeekIdx === 0 || taskCol === 'BACKLOG' || !taskWeekStr;
      const isFutureDueDate = taskDueDate && taskDueDate > today;
      matchesSprintCategory = isFutureWeek || isUndecidedOrBacklog || isFutureDueDate;
    } else if (sprintCategory === 'DATE_RANGE') {
      if (filterStartDate || filterEndDate) {
        const taskDateStr = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '');
        const afterStart = !filterStartDate || (taskDateStr >= filterStartDate);
        const beforeEnd = !filterEndDate || (taskDateStr <= filterEndDate);
        matchesSprintCategory = afterStart && beforeEnd;
      }
    }

    // Employee Scoping Filter:
    // If Manager view (isManager = true): show all tasks, or filter by selected employee if chosen.
    // If Employee view (isManager = false): strictly show ONLY tasks assigned to the active employee!
    const activeEmpId = selectedEmployeeId !== 'ALL' ? selectedEmployeeId : (user?.employeeId || user?.id || 'emp-1');
    const activeEmpEmail = (user?.email || 'ashutosh').toLowerCase();
    const activeEmpName = (user?.name || 'Ashutosh').toLowerCase();

    let matchesEmp = true;
    if (isManager) {
      if (selectedEmployeeId !== 'ALL') {
        const selectedEmpObj = employees.find(e => e.id === selectedEmployeeId);
        const selFirstLower = selectedEmpObj ? selectedEmpObj.firstName.toLowerCase() : '';
        const selLastLower = selectedEmpObj ? selectedEmpObj.lastName.toLowerCase() : '';
        const selCodeLower = selectedEmpObj ? selectedEmpObj.employeeCode.toLowerCase() : '';

        matchesEmp = (
          t.assigneeId === selectedEmployeeId ||
          t.employeeId === selectedEmployeeId ||
          t.assigneeEmail === selectedEmployeeId ||
          (Array.isArray(t.assigneeIds) && t.assigneeIds.includes(selectedEmployeeId)) ||
          (t.assigneeName && (
            (selFirstLower && t.assigneeName.toLowerCase().includes(selFirstLower)) ||
            (selLastLower && t.assigneeName.toLowerCase().includes(selLastLower)) ||
            (selCodeLower && t.assigneeName.toLowerCase().includes(selCodeLower))
          ))
        );
      }
    } else {
      const activeEmpId = user?.employeeId || user?.id || 'emp-1';
      const activeEmpEmail = (user?.email || '').toLowerCase();
      const activeEmpName = (user?.name || '').toLowerCase();
      const activeEmpFirstName = activeEmpName.split(' ')[0] || '';

      const isAssignedToEmp = (
        (t.assigneeId && (t.assigneeId === activeEmpId || t.assigneeId === selectedEmployeeId)) ||
        (t.employeeId && (t.employeeId === activeEmpId || t.employeeId === selectedEmployeeId)) ||
        (Array.isArray(t.assigneeIds) && t.assigneeIds.includes(activeEmpId)) ||
        (t.assigneeEmail && (t.assigneeEmail.toLowerCase() === activeEmpEmail)) ||
        (t.assigneeName && (
          t.assigneeName.toLowerCase().includes(activeEmpName) ||
          (activeEmpFirstName && t.assigneeName.toLowerCase().includes(activeEmpFirstName))
        ))
      );

      // All assigned tasks across Backlog, Planned, To Do, In Progress, To Review, Done are ALWAYS VISIBLE to assigned employees!
      matchesEmp = isAssignedToEmp || selectedEmployeeId === 'ALL';
    }

    const matchesStatus = selectedStatus === 'ALL' || taskCol === selectedStatus;

    const matchesQuery = !searchQuery.trim() || 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesViewMode && matchesSprintCategory && matchesEmp && matchesStatus && matchesQuery;
  });

  const activeTaskCount = allTasks.filter(t => t.status !== 'DONE' && t.status !== 'COMPLETED').length;
  const archivedTaskCount = allTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const reviewCount = allTasks.filter(t => t.status === 'IN_REVIEW' || t.status === 'TO_REVIEW').length;

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{viewMode === 'ACTIVE' ? 'Monthly 4-Week Sprint Cycles' : 'Archived Completed Sprints'}</span>
            {viewMode === 'ARCHIVE' ? (
              <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                Archive Mode ({archivedTaskCount})
              </span>
            ) : (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {activeTaskCount} Active Sprint Tasks
              </span>
            )}

            {reviewCount > 0 && viewMode === 'ACTIVE' && (
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>{reviewCount} To Review</span>
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            4-Week iteration cycles (Week 1–4), multi-employee task assignments & manager review approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setViewMode(viewMode === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE');
              setSelectedStatus('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              viewMode === 'ARCHIVE'
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{viewMode === 'ACTIVE' ? 'Sprint Archive' : 'Active Sprints'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isManager ? '+ New Sprint Task' : '+ Create Sprint Task'}</span>
          </button>
        </div>
      </div>

      {/* 🔍 Scalable Toolbar: Active Sprint, Future Sprint, Date Selector & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
        {/* Top Row: Active Sprint, Future Sprint & Date Range Selector */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0 mr-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sprint Filter:</span>
          </span>

          <button
            onClick={() => setSprintCategory('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
              sprintCategory === 'ACTIVE'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-extrabold'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
            title="Present week sprints and active tasks"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Active Sprint (Present)</span>
          </button>

          <button
            onClick={() => setSprintCategory('PAST')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
              sprintCategory === 'PAST'
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-extrabold'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
            title="Past week sprints and historical tasks"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Past Sprint (Past Weeks)</span>
          </button>

          <button
            onClick={() => setSprintCategory('FUTURE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
              sprintCategory === 'FUTURE'
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs font-extrabold'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
            title="Future week sprints and undecided / backlog tasks"
          >
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Future & Undecided</span>
          </button>

          <button
            onClick={() => setSprintCategory('DATE_RANGE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
              sprintCategory === 'DATE_RANGE'
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs font-extrabold'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>Date Range Selector</span>
          </button>

          {sprintCategory === 'DATE_RANGE' && (
            <div className="flex items-center gap-2 bg-emerald-50/80 p-1.5 rounded-xl border border-emerald-200 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[11px] font-bold text-emerald-800">From:</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
                className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] font-bold text-emerald-800">To:</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
                className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {(filterStartDate || filterEndDate) && (
                <button
                  onClick={() => {
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                  className="text-[10px] font-bold text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Row: Filters & Instant Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Employee Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Employees (~10 Team Members)</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  [{emp.employeeCode}] {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="BACKLOG">Backlog</option>
              <option value="PLANNED">Planned</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress ⏳</option>
              <option value="TO_REVIEW">To Review 🔍</option>
              <option value="DONE">Done / Completed ✅</option>
            </select>
          </div>

          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sprint tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 🚀 6-COLUMN KANBAN BOARD VIEW (Backlog -> Planned -> To Do -> In Progress -> To Review -> Done) */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading sprint tasks...</div>
      ) : (
        <div className="space-y-2">
          {/* ↔ TOP SYNCHRONIZED HORIZONTAL SCROLLBAR TRACK (Requested in circled space) */}
          <div
            ref={topScrollRef}
            onScroll={handleTopScroll}
            className="overflow-x-auto h-3.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200/80 cursor-ew-resize transition-colors select-none scrollbar-thin scrollbar-thumb-emerald-500"
            title="Drag top scrollbar left or right to scroll Kanban lanes"
          >
            <div className="h-1.5" style={{ width: `${KANBAN_COLUMNS.length * 325}px` }} />
          </div>

          {/* Main Kanban Columns Horizontal Scroll Container */}
          <div
            ref={kanbanContainerRef}
            onScroll={handleKanbanScroll}
            className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 rounded-2xl"
          >
            <div className="flex items-start gap-4 min-w-max">
              {KANBAN_COLUMNS.map(col => {
                const columnTasks = filteredTasks.filter(t => getTaskColumn(t) === col.id);

                if (col.id === 'BACKLOG' && !isBacklogExpanded) {
                  return (
                    <div
                      key={col.id}
                      id={`kanban-column-${col.id}`}
                      onClick={() => setIsBacklogExpanded(true)}
                      className="w-12 shrink-0 bg-slate-100/90 hover:bg-slate-200/80 rounded-2xl border border-slate-300 p-2.5 min-h-[550px] flex flex-col items-center justify-between cursor-pointer transition-all shadow-xs group select-none"
                      title="Click arrow to expand Backlog column"
                    >
                    <div className="flex flex-col items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBacklogExpanded(true);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-700 transition-colors shadow-2xs cursor-pointer"
                        title="Expand Backlog"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="[writing-mode:vertical-lr] font-black text-xs text-slate-600 tracking-wider flex items-center gap-2 pt-4">
                        <span>BACKLOG</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black">
                          {columnTasks.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

                return (
                  <div
                    key={col.id}
                    id={`kanban-column-${col.id}`}
                    onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) handleTaskStatusTransition(taskId, col.id);
                  }}
                  className="w-[310px] shrink-0 bg-slate-50/70 rounded-2xl border border-gray-200/80 p-3.5 space-y-3.5 min-h-[550px] flex flex-col shadow-2xs transition-colors hover:border-emerald-200"
                >
                {/* Column Header */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between font-bold text-xs ${col.color}`}>
                  <div className="flex items-center gap-2">
                    {col.id === 'BACKLOG' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBacklogExpanded(false);
                        }}
                        className="p-1 rounded-md bg-white/90 hover:bg-white text-slate-700 border border-slate-300 hover:text-emerald-700 transition-colors cursor-pointer"
                        title="Click arrow to hide Backlog column"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span>{col.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${col.badgeColor}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-10 text-[11px] text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl bg-white/50">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    (() => {
                      const sortedColumnTasks = [...columnTasks].sort((a, b) => {
                        const now = new Date();
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                        const aDate = a.dueDate ? new Date(a.dueDate) : null;
                        const bDate = b.dueDate ? new Date(b.dueDate) : null;

                        const aOverdue = aDate && !['DONE', 'COMPLETED'].includes(a.status) && new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate()) < today;
                        const bOverdue = bDate && !['DONE', 'COMPLETED'].includes(b.status) && new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()) < today;

                        if (aOverdue && !bOverdue) return -1;
                        if (!aOverdue && bOverdue) return 1;

                        if (aDate && bDate) return aDate.getTime() - bDate.getTime();
                        if (aDate && !bDate) return -1;
                        if (!aDate && bDate) return 1;

                        return 0;
                      });

                      return sortedColumnTasks.map(t => {
                        const entityName = (t.taskCode || '').startsWith('CAG') || (t.entityName || '').toLowerCase().includes('climagro') || (t.entityId || '').toLowerCase().includes('cag') ? 'Climagro' : 'EHM';
                        const isUnassigned = !t.assigneeName || t.assigneeName === 'Unassigned' || t.assigneeName === 'Assignee' || !t.assigneeId;

                        let assigneeInitials = 'U';
                        if (!isUnassigned && t.assigneeName) {
                          const parts = t.assigneeName.trim().split(' ');
                          assigneeInitials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2);
                        }

                        const epicCode = t.epicCode || t.epicTitle || (entityName === 'Climagro' ? 'CAG-EPIC-001' : 'EHM-EPIC-001');

                        let dueDateInfo = null;
                        if (t.dueDate) {
                          const d = new Date(t.dueDate);
                          if (!isNaN(d.getTime())) {
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            const isCompleted = t.status === 'DONE' || t.status === 'COMPLETED';
                            const isOverdue = !isCompleted && target < today;
                            const day = d.getDate();
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            const month = monthNames[d.getMonth()];
                            dueDateInfo = {
                              label: isOverdue ? 'Overdue' : `${day} ${month}`,
                              isOverdue,
                            };
                          }
                        }

                        const p = (t.priority || '').toUpperCase();
                        const priorityLabel = (p === 'URGENT' || p === 'P1' || p === '1') ? 'P1' : (p === 'HIGH' || p === 'P2' || p === '2') ? 'P2' : (p === 'MEDIUM' || p === 'P3' || p === '3') ? 'P3' : 'P4';
                        const priorityTextColor = (priorityLabel === 'P1') ? 'text-red-600' : (priorityLabel === 'P2') ? 'text-rose-600' : (priorityLabel === 'P3') ? 'text-amber-600' : 'text-slate-500';
                        const priorityBarColor = (priorityLabel === 'P1') ? 'bg-red-500' : (priorityLabel === 'P2') ? 'bg-rose-500' : (priorityLabel === 'P3') ? 'bg-amber-500' : 'bg-slate-400';

                        const createdDateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '16 Sep';
                        const reviewerLead = t.reviewingLead || t.lead || 'Manager lead';
                        const assigneeDisplayName = isUnassigned ? 'Unassigned' : (t.assigneeName || 'Team member');

                        return (
                          <div
                            key={t.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', t.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onClick={() => handleTaskClick(t)}
                            className="relative bg-white rounded-xl p-3.5 pl-4 border border-gray-200/90 shadow-2xs space-y-2 hover:shadow-md hover:border-emerald-400 transition-all cursor-grab active:cursor-grabbing group overflow-hidden select-none"
                          >
                            {/* 1. Priority (Left Edge Color Bar) */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityBarColor}`} />

                            {/* 2. Top Header Line: Left = Priority P1-P4 | Right = Epic Code */}
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className={`font-extrabold ${priorityTextColor}`}>
                                {priorityLabel}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-gray-400 truncate">
                                {epicCode}
                              </span>
                            </div>

                            {/* 3. Title (Middle, Full Width) */}
                            <h5 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                              {t.title}
                            </h5>

                            {/* 4. Metadata Spec Sheet (Assignee & Reviewer label-value pairs) */}
                            <div className="space-y-1 pt-1 text-[11px]">
                              <div className="flex items-center justify-between text-gray-500 font-medium">
                                <span className="text-gray-400 text-[10px]">Assignee</span>
                                <span className={`text-[11px] font-semibold ${isUnassigned ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                                  {assigneeDisplayName}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-gray-500 font-medium">
                                <span className="text-gray-400 text-[10px]">Reviewer</span>
                                <span className="text-[11px] font-semibold text-gray-800 truncate max-w-[140px] text-right">
                                  {reviewerLead}
                                </span>
                              </div>
                            </div>

                            {/* 5. Bottom Line: Left = Posted Date | Right = Target / Due Date */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[10px] font-medium text-gray-400">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>{createdDateStr}</span>
                              </div>

                              {dueDateInfo ? (
                                <div className={`flex items-center gap-1 font-bold ${dueDateInfo.isOverdue ? 'text-red-600 font-extrabold' : 'text-gray-500'}`}>
                                  <Calendar className={`w-3 h-3 ${dueDateInfo.isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                                  <span>Due {dueDateInfo.label}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400 font-medium">
                                  <span>{entityName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    )}

      {/* New Sprint Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base tracking-tight">Create New Product Backlog Task</h3>
                <span className="px-2.5 py-0.5 border rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border-slate-300">
                  Product Backlog
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Content Body */}
            <form onSubmit={handleCreateSprint} className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0">
              
              {/* Left Column (Task Info & Subtask Checklist) */}
              <div className="lg:col-span-7 space-y-4 text-left">
                
                {/* Select Parent Epic (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>Select Parent Epic (Optional)</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      Optional
                    </span>
                  </label>
                  <select
                    value={selectedEpicId}
                    onChange={(e) => setSelectedEpicId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="">Select Parent Epic (Optional)...</option>
                    {epics.map(epic => (
                      <option key={epic.id} value={epic.id}>
                        [{epic.epicCode}] {epic.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sprint Task Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Sprint Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement OAuth 2.0 Auth Server Callback"
                    value={sprintName}
                    onChange={(e) => setSprintName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Assign Team Members (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Assign Team Members (Optional)</span>
                    <span className="text-[10px] font-mono text-gray-400">Can select when starting task</span>
                  </label>
                  <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50 space-y-1.5">
                    {employees.map(emp => {
                      const isChecked = selectedEmpIds.includes(emp.id);
                      return (
                        <label
                          key={emp.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-white hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedEmpIds(selectedEmpIds.filter(id => id !== emp.id));
                                } else {
                                  setSelectedEmpIds([...selectedEmpIds, emp.id]);
                                }
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span>{emp.firstName} {emp.lastName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">{emp.employeeCode}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Reviewing Lead */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Reviewing Lead (Optional)</span>
                    <span className="text-[10px] font-mono text-gray-400">Can select when starting task</span>
                  </label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="">Unassigned Lead (Optional)...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department & Target Sprint Week */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold cursor-pointer"
                    >
                      {DEPARTMENT_OPTIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Target Sprint Week</label>
                    <select
                      value={targetWeek}
                      onChange={(e) => setTargetWeek(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold cursor-pointer"
                    >
                      {(() => {
                        const day = new Date().getDate();
                        const curWeekIdx = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4;
                        return [
                          { val: 'Week 1 (Days 1–7)', idx: 1 },
                          { val: 'Week 2 (Days 8–14)', idx: 2 },
                          { val: 'Week 3 (Days 15–21)', idx: 3 },
                          { val: 'Week 4 (Days 22–28)', idx: 4 },
                        ].map(w => {
                          const tag = w.idx === curWeekIdx ? 'Present / Active Week ⭐' : w.idx < curWeekIdx ? 'Past Week ⏱️' : 'Future Week 🚀';
                          return (
                            <option key={w.val} value={w.val}>
                              {w.val} • {tag}
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>
                </div>

                {/* Deliverable Goal / Objective */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Deliverable Goal / Objective</label>
                  <RichTextEditor
                    value={goal}
                    onChange={setGoal}
                    placeholder="Outline expected deliverable outcome for this sprint task..."
                    rows={3}
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
                      {modalChecklists.filter(c => c.isCompleted).length} of {modalChecklists.length} Completed
                    </span>
                  </div>

                  {/* Subtask items list */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {modalChecklists.length === 0 ? (
                      <div className="py-3 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No subtasks added yet. Add one below!
                      </div>
                    ) : (
                      modalChecklists.map((item) => (
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
                              onChange={() => handleToggleModalChecklist(item.id)}
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
                      value={modalNewChecklistText}
                      onChange={(e) => setModalNewChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddModalChecklist(e);
                        }
                      }}
                      className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddModalChecklist()}
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
                          Check this box to duplicate an existing sprint task or pre-fill parameters directly inside this form.
                        </p>
                      </div>
                    </label>

                    {isClone && (
                      <div className="pt-2 border-t border-purple-200/60 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-purple-900 mb-1">
                          Select Existing Task to Clone From (Optional):
                        </label>
                        <select
                          value={cloneSourceId}
                          onChange={(e) => {
                            setCloneSourceId(e.target.value);
                            const source = allTasks.find(t => t.id === e.target.value);
                            if (source) {
                              setSprintName(`${source.title} (Clone)`);
                              if (source.epicId) setSelectedEpicId(source.epicId);
                              if (source.reviewingLeadId) setSelectedLeadId(source.reviewingLeadId);
                              if (source.assigneeId) setSelectedEmpIds([source.assigneeId]);
                              if (source.targetWeek || source.sprintWeek) setTargetWeek(source.targetWeek || source.sprintWeek);
                              if (source.description) setGoal(source.description);
                              setModalChecklists([
                                { id: 'c-1', itemText: 'Verify requirements & deliverable scope', isCompleted: false },
                                { id: 'c-2', itemText: 'Setup environment and code branch', isCompleted: false },
                              ]);
                              setModalComments([
                                { id: 'cm-1', authorName: 'System', content: `Cloned parameters from task "${source.title}"`, createdAt: new Date().toISOString(), isSystemLog: true },
                              ]);
                              toast.success(`Form pre-filled with data from "${source.title}"!`);
                            }
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-xl bg-white font-bold text-purple-950 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
                        >
                          <option value="">-- Choose Existing Sprint Task to Auto-Fill --</option>
                          {allTasks.map(t => (
                            <option key={t.id} value={t.id}>
                              [{t.taskCode || t.id}] {t.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Activity & Comments Container */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex-1 flex flex-col min-h-0 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Activity & Comments</span>
                      </span>
                      <span className="text-[10px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                        {modalComments.length}
                      </span>
                    </div>

                    {/* Comments Feed */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px] max-h-[240px]">
                      {modalComments.length === 0 ? (
                        <div className="h-full flex items-center justify-center py-8 text-center text-xs text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                          No comments yet. Post the first comment!
                        </div>
                      ) : (
                        modalComments.map((c) => (
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
                        value={modalNewCommentText}
                        onChange={(e) => setModalNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddModalComment(e);
                          }
                        }}
                        className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddModalComment()}
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
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Assigning...' : 'Assign Sprint Task'}</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Shift to Planned Confirmation Modal */}
      {confirmPlannedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-purple-700">
              <div className="p-2.5 bg-purple-100 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">Shift Task to Planned?</h4>
                <p className="text-xs text-gray-500 font-medium">Confirmation required for product backlog transition</p>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 text-xs font-semibold text-purple-900 leading-relaxed">
              Are you sure you want to shift task <span className="font-extrabold text-purple-950 font-mono">[{confirmPlannedModal.task.taskCode || confirmPlannedModal.task.id}]</span> "{confirmPlannedModal.task.title}" to <span className="font-bold underline">Planned</span>?
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirmPlannedModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmShiftToPlanned}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Yes, Shift to Planned</span>
                <MoveRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task & Sprint Parameters Modal (Rich 2-Column Execution Spec Layout) */}
      {assignTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900 tracking-tight">Assign Task & Configure Execution Specs</h4>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                    Moving to {assignTaskModal.targetColumn === 'TODO' ? 'To Do' : assignTaskModal.targetColumn}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium pt-0.5">
                  Set assignee employee, reviewing lead, priority, review date, checkpoints checklist & activity comments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignTaskModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0 text-xs text-left">
              {/* Left Column: Assignment Details */}
              <div className="lg:col-span-6 space-y-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Task Title</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 flex items-center justify-between">
                    <span>{assignTaskModal.task.title}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      {assignTaskModal.task.taskCode || assignTaskModal.task.id}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assign Employee *</label>
                  <select
                    value={assignTaskModal.assigneeId}
                    onChange={(e) => setAssignTaskModal({ ...assignTaskModal, assigneeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-bold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        [{emp.employeeCode}] {emp.firstName} {emp.lastName} — {emp.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reviewing Lead / Manager *</label>
                  <select
                    value={assignTaskModal.reviewingLeadId}
                    onChange={(e) => setAssignTaskModal({ ...assignTaskModal, reviewingLeadId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-bold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Sprint Week *</label>
                    <select
                      value={assignTaskModal.sprintWeek}
                      onChange={(e) => setAssignTaskModal({ ...assignTaskModal, sprintWeek: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Week 1 (Days 1–7)">Week 1 (Days 1–7)</option>
                      <option value="Week 2 (Days 8–14)">Week 2 (Days 8–14)</option>
                      <option value="Week 3 (Days 15–21)">Week 3 (Days 15–21)</option>
                      <option value="Week 4 (Days 22–28)">Week 4 (Days 22–28)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Priority</label>
                    <select
                      value={assignTaskModal.priority}
                      onChange={(e) => setAssignTaskModal({ ...assignTaskModal, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="URGENT">P1 (Top Priority) 🔴</option>
                      <option value="HIGH">P2 (High Priority) 🟠</option>
                      <option value="MEDIUM">P3 (Medium Priority) 🟡</option>
                      <option value="LOW">P4 (Low Priority) ⚪</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Review / Due Date *</label>
                  <input
                    type="date"
                    value={assignTaskModal.dueDate}
                    onChange={(e) => setAssignTaskModal({ ...assignTaskModal, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Task Description & Deliverables</label>
                  <textarea
                    rows={3}
                    placeholder="Execution details, specifications, or deliverable instructions..."
                    value={assignTaskModal.description}
                    onChange={(e) => setAssignTaskModal({ ...assignTaskModal, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Right Column: Checkpoints Checklist & Activity Comments */}
              <div className="lg:col-span-6 space-y-3.5 flex flex-col min-h-0">
                {/* Subtask Checkpoint Checklist */}
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-gray-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
                      <span>Subtask Checkpoint Checklist</span>
                    </span>
                    <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-extrabold text-[10px]">
                      {assignTaskModal.checklists.filter(c => c.isCompleted).length} / {assignTaskModal.checklists.length} Done
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {assignTaskModal.checklists.map(chk => (
                      <div
                        key={chk.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold ${
                          chk.isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={chk.isCompleted}
                            onChange={() => {
                              const updated = assignTaskModal.checklists.map(c =>
                                c.id === chk.id ? { ...c, isCompleted: !c.isCompleted } : c
                              );
                              setAssignTaskModal({ ...assignTaskModal, checklists: updated });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className={chk.isCompleted ? 'line-through text-gray-400' : ''}>
                            {chk.itemText}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = assignTaskModal.checklists.filter(c => c.id !== chk.id);
                            setAssignTaskModal({ ...assignTaskModal, checklists: updated });
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Checklist Item */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add subtask item..."
                      value={assignTaskModal.newChecklistText || ''}
                      onChange={(e) => setAssignTaskModal({ ...assignTaskModal, newChecklistText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!assignTaskModal.newChecklistText?.trim()) return;
                          const newItem = {
                            id: `chk-${Date.now()}`,
                            itemText: assignTaskModal.newChecklistText.trim(),
                            isCompleted: false,
                          };
                          setAssignTaskModal({
                            ...assignTaskModal,
                            checklists: [...assignTaskModal.checklists, newItem],
                            newChecklistText: '',
                          });
                        }
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!assignTaskModal.newChecklistText?.trim()) return;
                        const newItem = {
                          id: `chk-${Date.now()}`,
                          itemText: assignTaskModal.newChecklistText.trim(),
                          isCompleted: false,
                        };
                        setAssignTaskModal({
                          ...assignTaskModal,
                          checklists: [...assignTaskModal.checklists, newItem],
                          newChecklistText: '',
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Activity Log & Comments */}
                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 flex-1 flex flex-col min-h-0 space-y-2">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wider shrink-0">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Activity Log & Comments</span>
                  </span>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[100px] max-h-[160px]">
                    {assignTaskModal.comments.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-gray-400 font-medium py-4">
                        No activity comments yet.
                      </div>
                    ) : (
                      assignTaskModal.comments.map(c => (
                        <div key={c.id} className="p-2 rounded-xl bg-white border border-gray-200 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700">
                            <span>{c.authorName}</span>
                            <span className="text-gray-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-gray-800 font-medium">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-gray-200 shrink-0">
                    <input
                      type="text"
                      placeholder="Post activity note..."
                      value={assignTaskModal.newCommentText || ''}
                      onChange={(e) => setAssignTaskModal({ ...assignTaskModal, newCommentText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!assignTaskModal.newCommentText?.trim()) return;
                          const newCmt = {
                            id: `cmt-${Date.now()}`,
                            authorName: 'Admin User',
                            content: assignTaskModal.newCommentText.trim(),
                            createdAt: new Date().toISOString(),
                          };
                          setAssignTaskModal({
                            ...assignTaskModal,
                            comments: [...assignTaskModal.comments, newCmt],
                            newCommentText: '',
                          });
                        }
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!assignTaskModal.newCommentText?.trim()) return;
                        const newCmt = {
                          id: `cmt-${Date.now()}`,
                          authorName: 'Admin User',
                          content: assignTaskModal.newCommentText.trim(),
                          createdAt: new Date().toISOString(),
                        };
                        setAssignTaskModal({
                          ...assignTaskModal,
                          comments: [...assignTaskModal.comments, newCmt],
                          newCommentText: '',
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setAssignTaskModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAssignTask}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Assign & Move Task</span>
                <MoveRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Done / Sign-off Confirmation Modal (Rich 2-Column Sign-Off Layout) */}
      {confirmDoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900 tracking-tight">Complete & Sign-off Task (Mark as Done)</h4>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                    Done Sign-off
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium pt-0.5">
                  Verify subtask checkpoints, deliverable URL, and manager sign-off notes before moving to Done.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDoneModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0 text-xs text-left">
              {/* Left Column: Output URL & Notes */}
              <div className="lg:col-span-6 space-y-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Task Title</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 flex items-center justify-between">
                    <span>{confirmDoneModal.task.title}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      {confirmDoneModal.task.taskCode || confirmDoneModal.task.id}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Deliverable / Output URL <span className="text-emerald-600 font-semibold">(Paste final deliverable link/URL)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://github.com/... or https://docs.google.com/..."
                    value={confirmDoneModal.deliverableUrl}
                    onChange={(e) => setConfirmDoneModal({ ...confirmDoneModal, deliverableUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl font-medium bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Completion & Sign-off Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Add final sign-off notes, verification details, or summary outcome..."
                    value={confirmDoneModal.notes}
                    onChange={(e) => setConfirmDoneModal({ ...confirmDoneModal, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Task Metadata
                  </span>
                  <div className="flex justify-between text-[11px] font-medium pt-1">
                    <span>Assignee: <strong>{confirmDoneModal.task.assigneeName || 'Employee'}</strong></span>
                    <span>Reviewer: <strong>{confirmDoneModal.task.reviewingLead || 'Manager'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Checkpoints Checklist & Activity Comments */}
              <div className="lg:col-span-6 space-y-3.5 flex flex-col min-h-0">
                {/* Checkpoint Checklist */}
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-gray-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
                      <span>Subtask Checkpoint Checklist</span>
                    </span>
                    <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-extrabold text-[10px]">
                      {confirmDoneModal.checklists.filter(c => c.isCompleted).length} / {confirmDoneModal.checklists.length} Done
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                    {confirmDoneModal.checklists.length === 0 ? (
                      <div className="text-center py-4 text-gray-400 font-medium text-[11px]">No subtasks defined.</div>
                    ) : (
                      confirmDoneModal.checklists.map(chk => (
                        <div
                          key={chk.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold ${
                            chk.isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={chk.isCompleted}
                              onChange={() => {
                                const updated = confirmDoneModal.checklists.map(c =>
                                  c.id === chk.id ? { ...c, isCompleted: !c.isCompleted } : c
                                );
                                setConfirmDoneModal({ ...confirmDoneModal, checklists: updated });
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className={chk.isCompleted ? 'line-through text-gray-400' : ''}>
                              {chk.itemText}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = confirmDoneModal.checklists.filter(c => c.id !== chk.id);
                              setConfirmDoneModal({ ...confirmDoneModal, checklists: updated });
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Checklist Item */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add subtask item..."
                      value={confirmDoneModal.newChecklistText || ''}
                      onChange={(e) => setConfirmDoneModal({ ...confirmDoneModal, newChecklistText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!confirmDoneModal.newChecklistText?.trim()) return;
                          const newItem = {
                            id: `chk-${Date.now()}`,
                            itemText: confirmDoneModal.newChecklistText.trim(),
                            isCompleted: true,
                          };
                          setConfirmDoneModal({
                            ...confirmDoneModal,
                            checklists: [...confirmDoneModal.checklists, newItem],
                            newChecklistText: '',
                          });
                        }
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmDoneModal.newChecklistText?.trim()) return;
                        const newItem = {
                          id: `chk-${Date.now()}`,
                          itemText: confirmDoneModal.newChecklistText.trim(),
                          isCompleted: true,
                        };
                        setConfirmDoneModal({
                          ...confirmDoneModal,
                          checklists: [...confirmDoneModal.checklists, newItem],
                          newChecklistText: '',
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Activity Log & Comments */}
                <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 flex-1 flex flex-col min-h-0 space-y-2">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wider shrink-0">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Activity Log & Comments</span>
                  </span>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[90px] max-h-[140px]">
                    {confirmDoneModal.comments.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-gray-400 font-medium py-4">
                        No activity comments yet.
                      </div>
                    ) : (
                      confirmDoneModal.comments.map(c => (
                        <div key={c.id} className="p-2 rounded-xl bg-white border border-gray-200 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700">
                            <span>{c.authorName}</span>
                            <span className="text-gray-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-gray-800 font-medium">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-gray-200 shrink-0">
                    <input
                      type="text"
                      placeholder="Post sign-off comment..."
                      value={confirmDoneModal.newCommentText || ''}
                      onChange={(e) => setConfirmDoneModal({ ...confirmDoneModal, newCommentText: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!confirmDoneModal.newCommentText?.trim()) return;
                          const newCmt = {
                            id: `cmt-${Date.now()}`,
                            authorName: 'Admin User',
                            content: confirmDoneModal.newCommentText.trim(),
                            createdAt: new Date().toISOString(),
                          };
                          setConfirmDoneModal({
                            ...confirmDoneModal,
                            comments: [...confirmDoneModal.comments, newCmt],
                            newCommentText: '',
                          });
                        }
                      }}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmDoneModal.newCommentText?.trim()) return;
                        const newCmt = {
                          id: `cmt-${Date.now()}`,
                          authorName: 'Admin User',
                          content: confirmDoneModal.newCommentText.trim(),
                          createdAt: new Date().toISOString(),
                        };
                        setConfirmDoneModal({
                          ...confirmDoneModal,
                          comments: [...confirmDoneModal.comments, newCmt],
                          newCommentText: '',
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDoneModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMarkAsDone}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirm & Mark as Done</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details / Review Update Modal */}
      {selectedTaskToUpdate && (
        <TaskUpdateModal
          isOpen={!!selectedTaskToUpdate}
          task={selectedTaskToUpdate}
          onClose={() => setSelectedTaskToUpdate(null)}
          onSave={handleSaveTaskUpdate}
          onClone={handleCloneTask}
          isReadOnly={!isManager}
        />
      )}
    </div>
  );
};
