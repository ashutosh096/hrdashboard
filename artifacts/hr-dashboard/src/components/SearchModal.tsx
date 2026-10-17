import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Search,
  X,
  CheckSquare,
  User,
  Layers,
  Megaphone,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  Briefcase,
  FolderGit2,
  Bookmark,
  Clock,
  Mail,
  Phone,
  Building2,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Eye,
  CheckCircle2,
  Check,
  Copy,
  Send,
  MessageSquare,
  ListChecks,
} from 'lucide-react';
import { fetchApi, clearApiCache } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { formatDateTime, formatCommentDateTime } from '../utils/dateUtils';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';
import { MarkdownViewer } from './MarkdownViewer';
import { getAvatarByName } from '../utils/avatars';
import { getEntityBadge } from '../utils/entityUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SearchCategory = 'ALL' | 'PROJECTS' | 'EPICS' | 'TASKS' | 'TEAM' | 'SPRINTS' | 'ANNOUNCEMENTS';

export interface SearchItem {
  id: string;
  type: 'Project' | 'Epic' | 'Task' | 'Team' | 'Sprint' | 'Announcement';
  code: string;
  title: string;
  subtitle: string;
  description?: string;
  meta?: string;
  targetUrl: string;
  priority?: string;
  status?: string;
  department?: string;
  roleBadge?: string;
  email?: string;
  phone?: string;
  entityName?: string;
  ownerName?: string;
  deliverableUrl?: string;
  targetDate?: string;
  previousCodes?: string[];
  rawData?: any;
}

// Helper to normalize strings for robust, case-insensitive, hyphen-agnostic matching
const normalizeSearch = (str: string): string => {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Popup modal state for opened workspace items (renders directly over current background/dashboard)
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskItem | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<any | null>(null);
  const [selectedEpicForModal, setSelectedEpicForModal] = useState<any | null>(null);
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<any | null>(null);
  const [selectedAnnouncementForModal, setSelectedAnnouncementForModal] = useState<any | null>(null);

  // Quick preview inside search modal before opening full workspace popup
  const [viewingItem, setViewingItem] = useState<SearchItem | null>(null);

  // New comment text for Project workspace modal
  const [newProjectComment, setNewProjectComment] = useState('');

  // Raw fetched workspace data
  const [projects, setProjects] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [epics, setEpics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Check if any popup modal is actively open
  const hasActiveWorkspaceModal = Boolean(
    selectedTaskForModal ||
    selectedProjectForModal ||
    selectedEpicForModal ||
    selectedEmployeeForModal ||
    selectedAnnouncementForModal
  );

  // Close all open workspace modals and return to dashboard
  const handleCloseAll = () => {
    setSelectedTaskForModal(null);
    setSelectedProjectForModal(null);
    setSelectedEpicForModal(null);
    setSelectedEmployeeForModal(null);
    setSelectedAnnouncementForModal(null);
    setViewingItem(null);
    onClose();
  };

  // Close workspace modal and return to search modal
  const handleBackToSearch = () => {
    setSelectedTaskForModal(null);
    setSelectedProjectForModal(null);
    setSelectedEpicForModal(null);
    setSelectedEmployeeForModal(null);
    setSelectedAnnouncementForModal(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Global Hotkey (ESC handling)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (hasActiveWorkspaceModal) {
          handleBackToSearch();
        } else if (viewingItem) {
          setViewingItem(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasActiveWorkspaceModal, viewingItem, onClose]);

  // Load all workspace data sources whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setViewingItem(null);

    async function loadAllSearchData() {
      try {
        const [projData, initData, epicData, taskData, empData, sprintData, annData] = await Promise.all([
          fetchApi<any[]>('/api/projects').catch(() => []),
          fetchApi<any[]>('/api/initiatives').catch(() => []),
          fetchApi<any[]>('/api/epics').catch(() => []),
          fetchApi<any[]>('/api/tasks').catch(() => []),
          fetchApi<any[]>('/api/employees').catch(() => []),
          fetchApi<any[]>('/api/sprints').catch(() => []),
          fetchApi<any[]>('/api/announcements').catch(() => []),
        ]);

        if (isMounted) {
          setProjects(Array.isArray(projData) ? projData : []);
          setInitiatives(Array.isArray(initData) ? initData : []);
          setEpics(Array.isArray(epicData) ? epicData : []);
          setTasks(Array.isArray(taskData) ? taskData : []);
          setEmployees(Array.isArray(empData) ? empData : []);
          setSprints(Array.isArray(sprintData) ? sprintData : []);
          setAnnouncements(Array.isArray(annData) ? annData : []);
        }
      } catch (err) {
        console.error('[GLOBAL SEARCH LOAD ERROR]:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAllSearchData();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Index and normalize all searchable items
  const allItems: SearchItem[] = useMemo(() => {
    // 1. Projects (from /api/projects)
    const projectItems: SearchItem[] = projects.map((p) => {
      const code = p.code || p.projectCode || 'PRJ';
      const title = p.name || p.title || 'Untitled Project';
      const category = p.category || 'General';
      const entityStr = (p.entityCode || p.entity) === 'CAG' ? 'CLIMAGRO' : 'EHM';
      return {
        id: `project-${p.id}`,
        type: 'Project',
        code,
        title,
        subtitle: `${category} · ${p.lead ? `Lead: ${p.lead}` : ''} · Status: ${p.status || 'Active'}`,
        description: p.description || '',
        meta: entityStr,
        targetUrl: '/projects',
        status: p.status || 'Active',
        priority: p.priority || 'Medium',
        department: category,
        deliverableUrl: p.deliverableUrl || p.deliverable_url || p.techStack || '',
        targetDate: p.targetDate || p.target_date || '',
        ownerName: p.lead || p.ownerName || '',
        entityName: entityStr,
        rawData: p,
      };
    });

    // 1b. Initiatives (from /api/initiatives if separate)
    const initiativeItems: SearchItem[] = initiatives.map((init) => {
      const code = init.initiativeCode || init.code || 'INIT';
      const title = init.title || init.name || 'Untitled Initiative';
      const category = init.category || init.departmentName || 'General';
      return {
        id: `init-${init.id}`,
        type: 'Project',
        code,
        title,
        subtitle: `${category} · ${init.status || 'Active'} · ${init.epicsCountTarget ? `${init.epicsCountTarget} epics` : ''}`,
        description: init.description || '',
        meta: init.entityCode || 'EHM',
        targetUrl: '/projects',
        status: init.status || 'Active',
        department: category,
        deliverableUrl: init.deliverableUrl || init.deliverable_url || '',
        targetDate: init.targetDate || init.target_date || '',
        ownerName: init.createdByName || init.ownerName || '',
        rawData: init,
      };
    });

    // 2. Epics
    const epicItems: SearchItem[] = epics.map((ep) => {
      const code = ep.epicCode || ep.code || 'EPIC';
      const title = ep.title || ep.name || 'Untitled Epic';
      return {
        id: `epic-${ep.id}`,
        type: 'Epic',
        code,
        title,
        subtitle: `${ep.department || 'Product'} · ${ep.status || 'ACTIVE'} ${ep.tasksCount !== undefined ? `(${ep.tasksCount} tasks)` : ''}`,
        description: ep.description || '',
        meta: ep.targetWeek || 'Current Sprint',
        targetUrl: '/tasks',
        status: ep.status || 'ACTIVE',
        department: ep.department,
        targetDate: ep.targetDate || ep.target_date || '',
        rawData: ep,
      };
    });

    // 3. Tasks
    const taskItems: SearchItem[] = tasks.map((t) => ({
      id: `task-${t.id}`,
      type: 'Task',
      code: t.taskCode || t.code || 'TASK',
      title: t.title || 'Untitled Task',
      subtitle: `${t.status || 'IN_PROGRESS'} · ${t.priority || 'MEDIUM'} · ${t.assignee || t.assigneeName || 'Unassigned'}`,
      description: t.description || '',
      meta: t.entityCode || t.entity || 'EHM',
      targetUrl: '/tasks',
      priority: t.priority,
      status: t.status,
      deliverableUrl: t.deliverableUrl || t.deliverable_url || '',
      targetDate: t.dueDate || t.due_date || '',
      ownerName: t.assignee || t.assigneeName || '',
      rawData: t,
    }));

    // 4. Team Members
    const teamItems: SearchItem[] = employees.map((e) => {
      const fullName = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Team Member';
      const roleType = (e.role || 'EMPLOYEE').toUpperCase();
      const roleBadge = roleType === 'ADMIN' ? 'Admin' : roleType === 'MANAGER' ? 'Manager' : (e.designation || 'Specialist');
      const entityStr = (e.entityCode || (e as any).entity) === 'CAG' ? 'CLIMAGRO' : 'EHM';

      return {
        id: `emp-${e.id}`,
        type: 'Team',
        code: e.employeeCode || (e.id ? `EMP-${e.id.slice(0, 4)}` : 'EMP'),
        title: fullName,
        subtitle: `${e.designation || 'Specialist'} · ${e.departmentName || 'Engineering'} · ${e.email || ''}`,
        description: `Entity: ${entityStr} | Department: ${e.departmentName || 'General'} | Email: ${e.email || 'N/A'} | Phone: ${e.phone || 'Not added'}`,
        meta: e.phone ? `📞 ${e.phone}` : e.employeeCode || 'EHM',
        targetUrl: '/team',
        roleBadge,
        department: e.departmentName || 'Engineering',
        email: e.email || '',
        phone: e.phone || '',
        entityName: entityStr,
        previousCodes: Array.isArray(e.previousCodes) ? e.previousCodes : [],
        rawData: e,
      };
    });

    // 5. Sprints
    const sprintItems: SearchItem[] = sprints.map((s) => ({
      id: `sprint-${s.id}`,
      type: 'Sprint',
      code: s.sprintCode || 'SPRINT',
      title: s.name || s.targetWeek || 'Sprint Cycle',
      subtitle: `${s.status || 'ACTIVE'} · Goal: ${s.goal || s.targetWeek || 'Sprint Deliverables'}`,
      description: s.goal || s.description || 'Sprint deliverables and active execution cycle.',
      meta: s.entityCode || 'EHM',
      targetUrl: '/sprints',
      status: s.status || 'ACTIVE',
      targetDate: s.targetWeek || '',
      rawData: s,
    }));

    // 6. Announcements
    const announcementItems: SearchItem[] = announcements.map((a) => ({
      id: `ann-${a.id}`,
      type: 'Announcement',
      code: a.isPinned ? 'PINNED' : 'NOTICE',
      title: a.title || 'Company Notice',
      subtitle: (a.content || '').slice(0, 80) + '...',
      description: a.content || '',
      meta: a.priority || 'IMPORTANT',
      targetUrl: '/announcements',
      priority: a.priority,
      targetDate: a.createdAt ? formatDateTime(a.createdAt) : '',
      rawData: a,
    }));

    return [...projectItems, ...initiativeItems, ...epicItems, ...taskItems, ...teamItems, ...sprintItems, ...announcementItems];
  }, [projects, initiatives, epics, tasks, employees, sprints, announcements]);

  // Robust, 100% Case-Insensitive & Hyphen-Agnostic Search
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const cleanQueryNorm = normalizeSearch(cleanQuery);
    const searchTerms = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

    return allItems.filter((item) => {
      // Filter by tab category if selected
      if (selectedCategory !== 'ALL') {
        const itemType = item.type.toUpperCase();
        if (selectedCategory === 'PROJECTS' && itemType !== 'PROJECT') return false;
        if (selectedCategory === 'EPICS' && itemType !== 'EPIC') return false;
        if (selectedCategory === 'TASKS' && itemType !== 'TASK') return false;
        if (selectedCategory === 'TEAM' && itemType !== 'TEAM') return false;
        if (selectedCategory === 'SPRINTS' && itemType !== 'SPRINT') return false;
        if (selectedCategory === 'ANNOUNCEMENTS' && itemType !== 'ANNOUNCEMENT') return false;
      }

      if (searchTerms.length === 0) return true;

      // Prepare comprehensive searchable text haystack
      const raw = item.rawData || {};
      const haystackFields = [
        item.title || '',
        item.code || '',
        item.subtitle || '',
        item.description || '',
        item.meta || '',
        item.type || '',
        item.priority || '',
        item.status || '',
        item.department || '',
        item.email || '',
        item.phone || '',
        item.roleBadge || '',
        item.ownerName || '',
        raw.name || '',
        raw.firstName || '',
        raw.lastName || '',
        raw.designation || '',
        raw.employeeCode || '',
        raw.taskCode || '',
        raw.sprintCode || '',
        raw.epicCode || '',
        raw.lead || '',
        raw.techStack || '',
        (item.previousCodes || []).join(' '),
      ];

      const haystack = haystackFields.join(' ').toLowerCase();
      const haystackNorm = normalizeSearch(haystack);

      // Direct full query substring match
      if (haystack.includes(cleanQuery)) return true;

      // Normalized query match (handles "task0001" matching "TASK-0001", "prj01" matching "PRJ-01")
      if (cleanQueryNorm.length > 0 && haystackNorm.includes(cleanQueryNorm)) return true;

      // Multi-term match: every word in query must match
      return searchTerms.every((term) => {
        const termNorm = normalizeSearch(term);
        return haystack.includes(term) || (termNorm.length > 0 && haystackNorm.includes(termNorm));
      });
    });
  }, [allItems, query, selectedCategory]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  if (!isOpen) return null;

  // Open the interactive WORKSPACE POPUP MODAL right over the dashboard (NO URL redirect)
  const handleOpenWorkspaceModal = async (item: SearchItem) => {
    const raw = item.rawData || {};

    if (item.type === 'Task') {
      let taskData: any = raw;
      try {
        const fetched = await fetchApi<any>(`/api/tasks/${raw.id || item.id.replace('task-', '')}`);
        if (fetched && fetched.id) {
          taskData = fetched;
        }
      } catch {}

      const resolvedCode = taskData.taskCode || taskData.taskId || item.code || '';
      const resolvedEntity = taskData.entityCode || taskData.entity || taskData.entityName || 'EHM';

      setSelectedTaskForModal({
        ...taskData,
        taskId: resolvedCode,
        taskCode: resolvedCode,
        entity: resolvedEntity,
      });
      return;
    }

    if (item.type === 'Sprint') {
      // If sprint item is tied to tasks or has task structure, open in task update modal, otherwise show sprint modal
      if (raw.id && (raw.taskCode || raw.taskId || raw.status)) {
        const resolvedCode = raw.taskCode || raw.taskId || raw.sprintCode || item.code;
        setSelectedTaskForModal({
          ...raw,
          id: raw.id,
          taskId: resolvedCode,
          taskCode: resolvedCode,
          title: raw.name || raw.title || item.title,
          entity: raw.entityCode || raw.entity || 'EHM',
        });
      } else {
        setSelectedProjectForModal({
          ...raw,
          isSprint: true,
          name: item.title,
          code: item.code,
          category: 'Sprint Cycle',
          status: raw.status || 'ACTIVE',
          description: item.description,
        });
      }
      return;
    }

    if (item.type === 'Project') {
      setSelectedProjectForModal(raw);
      return;
    }

    if (item.type === 'Epic') {
      setSelectedEpicForModal(raw);
      return;
    }

    if (item.type === 'Team') {
      setSelectedEmployeeForModal(raw);
      return;
    }

    if (item.type === 'Announcement') {
      setSelectedAnnouncementForModal(raw);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (viewingItem || hasActiveWorkspaceModal) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleOpenWorkspaceModal(filteredResults[selectedIndex]);
      }
    }
  };

  const getCategoryCount = (cat: SearchCategory) => {
    if (cat === 'ALL') return allItems.length;
    return allItems.filter((i) => {
      if (cat === 'PROJECTS') return i.type === 'Project';
      if (cat === 'EPICS') return i.type === 'Epic';
      if (cat === 'TASKS') return i.type === 'Task';
      if (cat === 'TEAM') return i.type === 'Team';
      if (cat === 'SPRINTS') return i.type === 'Sprint';
      if (cat === 'ANNOUNCEMENTS') return i.type === 'Announcement';
      return false;
    }).length;
  };

  // Toggle milestone / checkpoint on project
  const handleToggleProjectCheckpoint = async (checkpointId: string) => {
    if (!selectedProjectForModal) return;
    const currentCheckpoints = Array.isArray(selectedProjectForModal.checkpoints) ? selectedProjectForModal.checkpoints : [];
    const updatedCheckpoints = currentCheckpoints.map((c: any) =>
      c.id === checkpointId ? { ...c, isCompleted: !c.isCompleted } : c
    );

    setSelectedProjectForModal({
      ...selectedProjectForModal,
      checkpoints: updatedCheckpoints,
    });

    try {
      await fetchApi(`/api/projects/${selectedProjectForModal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ checkpoints: updatedCheckpoints }),
      });
      clearApiCache('/api/projects');
      toast.success('Project checkpoint updated!');
    } catch (err: any) {
      toast.error('Failed to update checkpoint');
    }
  };

  // Update status on project
  const handleUpdateProjectStatus = async (newStatus: string) => {
    if (!selectedProjectForModal) return;
    setSelectedProjectForModal({
      ...selectedProjectForModal,
      status: newStatus,
    });

    try {
      await fetchApi(`/api/projects/${selectedProjectForModal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      clearApiCache('/api/projects');
      toast.success(`Project status updated to ${newStatus}!`);
    } catch (err: any) {
      toast.error('Failed to update project status');
    }
  };

  // Add comment to project
  const handleAddProjectComment = async () => {
    if (!selectedProjectForModal || !newProjectComment.trim()) return;
    const currentComments = Array.isArray(selectedProjectForModal.comments) ? selectedProjectForModal.comments : [];
    const commentObj = {
      id: `comm-${Date.now()}`,
      authorName: 'User',
      content: newProjectComment.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...currentComments, commentObj];

    setSelectedProjectForModal({
      ...selectedProjectForModal,
      comments: updatedComments,
    });
    setNewProjectComment('');

    try {
      await fetchApi(`/api/projects/${selectedProjectForModal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ comments: updatedComments }),
      });
      clearApiCache('/api/projects');
      toast.success('Comment posted!');
    } catch (err: any) {
      toast.error('Failed to save comment');
    }
  };

  return (
    <>
      {/* 1. MAIN GLOBAL SEARCH MODAL (Renders directly over dashboard) */}
      {!hasActiveWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs pt-14 sm:pt-16 p-4 select-none animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {!viewingItem ? (
              <>
                {/* Top Input Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white">
                  <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search projects, epics, tasks, team (case-insensitive, e.g. PRJ001, TASK-001, Harshit)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full text-sm sm:text-base border-none outline-none font-medium text-gray-900 placeholder-gray-400 bg-transparent"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-md hover:bg-gray-100 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Close Search (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filters Bar */}
                <div className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 overflow-x-auto no-scrollbar">
                  {(['ALL', 'PROJECTS', 'EPICS', 'TASKS', 'TEAM', 'SPRINTS', 'ANNOUNCEMENTS'] as SearchCategory[]).map((cat) => {
                    const count = getCategoryCount(cat);
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 bg-white border border-gray-200/60'
                        }`}
                      >
                        <span>
                          {cat === 'ALL'
                            ? 'All'
                            : cat === 'PROJECTS'
                            ? 'Projects'
                            : cat === 'EPICS'
                            ? 'Epics'
                            : cat === 'TASKS'
                            ? 'Tasks'
                            : cat === 'TEAM'
                            ? 'Team'
                            : cat === 'SPRINTS'
                            ? 'Sprints'
                            : 'Announcements'}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Results List */}
                <div
                  ref={resultsContainerRef}
                  className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-96 custom-scrollbar"
                >
                  {isLoading ? (
                    <div className="py-6 px-4 space-y-2.5 animate-pulse">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-xl" />
                      ))}
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <p className="text-sm font-bold text-gray-700">No results found for "{query}"</p>
                      <p className="text-xs text-gray-400">
                        Search is case-insensitive. Try searching by project code, task code, team member name, or keyword.
                      </p>
                    </div>
                  ) : (
                    filteredResults.map((r, index) => {
                      const isSelected = index === selectedIndex;
                      let Icon = CheckSquare;
                      let iconBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                      if (r.type === 'Project') {
                        Icon = FolderGit2;
                        iconBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                        badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                      } else if (r.type === 'Epic') {
                        Icon = Bookmark;
                        iconBg = 'bg-purple-50 text-purple-700 border-purple-200';
                        badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
                      } else if (r.type === 'Team') {
                        Icon = User;
                        iconBg = 'bg-blue-50 text-blue-700 border-blue-200';
                        badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
                      } else if (r.type === 'Sprint') {
                        Icon = Flame;
                        iconBg = 'bg-amber-50 text-amber-700 border-amber-200';
                        badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
                      } else if (r.type === 'Announcement') {
                        Icon = Megaphone;
                        iconBg = 'bg-rose-50 text-rose-700 border-rose-200';
                        badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
                      }

                      return (
                        <div
                          key={r.id}
                          onClick={() => handleOpenWorkspaceModal(r)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border group ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs translate-x-0.5'
                              : 'bg-white hover:bg-gray-50/80 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`p-2.5 rounded-xl border shrink-0 ${iconBg}`}>
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                  {r.title}
                                </h4>
                                <span className="text-[10px] font-bold font-mono text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded shrink-0">
                                  {r.code}
                                </span>
                                {r.type === 'Team' && r.previousCodes && r.previousCodes.length > 0 && (
                                  <span className="text-[9px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded shrink-0" title={`Historical codes: ${r.previousCodes.join(', ')}`}>
                                    prev: {r.previousCodes.join(', ')}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-gray-500 font-medium truncate">{r.subtitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 pl-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                              {r.type === 'Team' && r.roleBadge ? r.roleBadge : r.type}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWorkspaceModal(r);
                              }}
                              className="px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                              title="Open in Workspace Popup (Dashboard remains in background)"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Shortcut Helper */}
                <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px] text-gray-600 shadow-2xs">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px] text-gray-600 shadow-2xs">↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px] text-gray-600 shadow-2xs">↵</kbd>
                      Open in Popup
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px] text-gray-600 shadow-2xs">ESC</kbd>
                      Close
                    </span>
                  </div>

                  <span className="hidden sm:inline text-gray-500 font-semibold">
                    {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* 2. TASK WORKSPACE POPUP MODAL (Renders right over dashboard, background remains intact) */}
      {selectedTaskForModal && (
        <TaskUpdateModal
          isOpen={!!selectedTaskForModal}
          task={selectedTaskForModal}
          onClose={() => setSelectedTaskForModal(null)}
          onSave={async (updatedTask) => {
            try {
              await fetchApi(`/api/tasks/${updatedTask.id}`, {
                method: 'PATCH',
                body: JSON.stringify(updatedTask),
              });
              toast.success(`Task ${updatedTask.taskCode || ''} updated successfully!`);
              clearApiCache('/api/tasks');
              clearApiCache('/api/sprints');
              setSelectedTaskForModal(null);
            } catch (err: any) {
              toast.error(err?.message || 'Failed to update task');
            }
          }}
          onDelete={() => {
            clearApiCache('/api/tasks');
            clearApiCache('/api/sprints');
            setSelectedTaskForModal(null);
          }}
        />
      )}

      {/* 3. PROJECT WORKSPACE POPUP MODAL (Renders right over dashboard, background remains intact) */}
      {selectedProjectForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 my-8 space-y-4 text-left max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-wide">
                    {selectedProjectForModal.code || 'PRJ'}
                  </span>
                  {(() => {
                    const badge = getEntityBadge(selectedProjectForModal);
                    return (
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold uppercase border ${badge.className}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {selectedProjectForModal.priority || 'Medium'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  {selectedProjectForModal.name || selectedProjectForModal.title || 'Untitled Project'}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="px-2.5 py-1 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  ← Search
                </button>
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close Workspace (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Selector */}
            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-2xl border border-gray-200/70">
              <span className="text-xs font-bold text-gray-600">Current Execution Status:</span>
              <div className="flex items-center gap-1.5">
                {['Planning', 'Active', 'In Review', 'Completed'].map((st) => {
                  const isCurrent = (selectedProjectForModal.status || 'Active').toLowerCase() === st.toLowerCase();
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateProjectStatus(st)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                PROJECT OVERVIEW
              </span>
              <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100 text-xs text-gray-800 max-h-36 overflow-y-auto">
                {selectedProjectForModal.description ? (
                  <MarkdownViewer content={selectedProjectForModal.description} />
                ) : (
                  <p className="text-gray-400 italic">No description provided.</p>
                )}
              </div>
            </div>

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Project Lead</span>
                <span className="font-bold text-gray-800 truncate block mt-0.5">
                  {selectedProjectForModal.lead || 'Dr. Harshit Mishra'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Category / Domain</span>
                <span className="font-bold text-gray-800 truncate block mt-0.5">
                  {selectedProjectForModal.category || 'Technology & Systems'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Target Date</span>
                <span className="font-bold text-gray-800 truncate block mt-0.5">
                  {selectedProjectForModal.targetDate || 'Ongoing'}
                </span>
              </div>
            </div>

            {/* Deliverable Link */}
            {(selectedProjectForModal.deliverableUrl || selectedProjectForModal.techStack) && (
              <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-gray-900 truncate">
                    {selectedProjectForModal.deliverableUrl || selectedProjectForModal.techStack}
                  </span>
                </div>
                {selectedProjectForModal.deliverableUrl && (
                  <a
                    href={selectedProjectForModal.deliverableUrl.startsWith('http') ? selectedProjectForModal.deliverableUrl : `https://${selectedProjectForModal.deliverableUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors shrink-0"
                  >
                    Open Link ↗
                  </a>
                )}
              </div>
            )}

            {/* Checkpoints & Milestones List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                  CHECKPOINTS & MILESTONES
                </span>
                <span className="text-xs font-bold text-gray-500">
                  {(selectedProjectForModal.checkpoints || []).filter((c: any) => c.isCompleted).length} / {(selectedProjectForModal.checkpoints || []).length} done
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(!selectedProjectForModal.checkpoints || selectedProjectForModal.checkpoints.length === 0) ? (
                  <p className="text-xs text-gray-400 italic p-2 bg-gray-50 rounded-xl">No checkpoints configured.</p>
                ) : (
                  selectedProjectForModal.checkpoints.map((chk: any) => (
                    <div
                      key={chk.id}
                      onClick={() => handleToggleProjectCheckpoint(chk.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        chk.isCompleted
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={chk.isCompleted}
                        readOnly
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 pointer-events-none"
                      />
                      <span className={`text-xs font-medium flex-1 truncate ${chk.isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {chk.itemText || chk.name || 'Checkpoint task'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Project Comments & Activity Thread */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                UPDATES & DISCUSSION
              </span>

              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                {(selectedProjectForModal.comments || []).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No notes posted yet.</p>
                ) : (
                  (selectedProjectForModal.comments || []).map((comm: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                        <span>{comm.authorName || 'User'}</span>
                        <span>{comm.createdAt ? formatCommentDateTime(comm.createdAt) : ''}</span>
                      </div>
                      <p className="text-xs text-gray-800 font-medium whitespace-pre-wrap">{comm.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add a progress update..."
                  value={newProjectComment}
                  onChange={(e) => setNewProjectComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProjectComment()}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-medium text-gray-800"
                />
                <button
                  type="button"
                  onClick={handleAddProjectComment}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBackToSearch}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                ← Back to Search
              </button>
              <button
                type="button"
                onClick={handleCloseAll}
                className="px-5 py-2 text-xs font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EPIC WORKSPACE POPUP MODAL (Renders right over dashboard) */}
      {selectedEpicForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 space-y-4 text-left">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {selectedEpicForModal.epicCode || selectedEpicForModal.code || 'EPIC'}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedEpicForModal.status || 'ACTIVE'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {selectedEpicForModal.title || selectedEpicForModal.name || 'Untitled Epic'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseAll}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">EPIC DESCRIPTION</span>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 max-h-36 overflow-y-auto">
                <p className="whitespace-pre-wrap">{selectedEpicForModal.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Department</span>
                <span className="font-bold text-gray-800 mt-0.5 block">{selectedEpicForModal.department || 'Product'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Target Timeline</span>
                <span className="font-bold text-gray-800 mt-0.5 block">{selectedEpicForModal.targetWeek || selectedEpicForModal.targetDate || 'Current Sprint'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBackToSearch}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                ← Back to Search
              </button>
              <button
                type="button"
                onClick={handleCloseAll}
                className="px-5 py-2 text-xs font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TEAM MEMBER POPUP MODAL (Renders right over dashboard) */}
      {selectedEmployeeForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 space-y-4 text-left">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmployeeForModal.avatarUrl || getAvatarByName(`${selectedEmployeeForModal.firstName || ''} ${selectedEmployeeForModal.lastName || ''}`)}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-gray-900">
                      {`${selectedEmployeeForModal.firstName || ''} ${selectedEmployeeForModal.lastName || ''}`.trim() || 'Team Member'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {selectedEmployeeForModal.role || 'EMPLOYEE'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {selectedEmployeeForModal.designation || 'Specialist'} · {selectedEmployeeForModal.departmentName || 'Engineering'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseAll}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Employee Code</span>
                <span className="font-mono font-bold text-gray-800 block mt-0.5">
                  {selectedEmployeeForModal.employeeCode || selectedEmployeeForModal.id}
                </span>
                {Array.isArray(selectedEmployeeForModal.previousCodes) && selectedEmployeeForModal.previousCodes.length > 0 && (
                  <span className="text-[9px] font-mono text-amber-700 block mt-0.5">
                    prev: {selectedEmployeeForModal.previousCodes.join(', ')}
                  </span>
                )}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Entity</span>
                <span className="font-bold text-gray-800 block mt-0.5">
                  {selectedEmployeeForModal.entityCode === 'CAG' ? 'CLIMAGRO' : 'EHM'}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Email Address</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">{selectedEmployeeForModal.email || 'N/A'}</span>
                </div>
                {selectedEmployeeForModal.email && (
                  <a
                    href={`mailto:${selectedEmployeeForModal.email}`}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    Send Email
                  </a>
                )}
              </div>
              {selectedEmployeeForModal.phone && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Phone</span>
                    <span className="font-semibold text-gray-900 block mt-0.5">{selectedEmployeeForModal.phone}</span>
                  </div>
                  <a
                    href={`tel:${selectedEmployeeForModal.phone}`}
                    className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    Call
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBackToSearch}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                ← Back to Search
              </button>
              <button
                type="button"
                onClick={handleCloseAll}
                className="px-5 py-2 text-xs font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ANNOUNCEMENT POPUP MODAL (Renders right over dashboard) */}
      {selectedAnnouncementForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 space-y-4 text-left">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {selectedAnnouncementForModal.priority || 'NOTICE'}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {selectedAnnouncementForModal.createdAt ? formatDateTime(selectedAnnouncementForModal.createdAt) : ''}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  {selectedAnnouncementForModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseAll}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-xs text-gray-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {selectedAnnouncementForModal.content || 'No content provided.'}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBackToSearch}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                ← Back to Search
              </button>
              <button
                type="button"
                onClick={handleCloseAll}
                className="px-5 py-2 text-xs font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchModal;
