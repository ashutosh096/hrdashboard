import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  X,
  User,
  Edit3,
  AlertCircle,
  FolderKanban,
  Calendar,
  Layers,
  Tag,
  CheckCircle2,
  Archive,
  Clock,
  CheckSquare,
  ListChecks,
  Trash2,
  MessageSquare,
  Send,
  Sparkles,
  Eye,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MoreHorizontal,
  Link as LinkIcon,
  Copy,
  Users,
  Loader2,
  History,
  UserCheck,
  Pencil,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { RichTextEditor } from '../components/RichTextEditor';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { SearchableSelect, SelectOption } from '../components/SearchableSelect';
import { RecordHistoryPanel } from '../components/RecordHistoryPanel';
import { RecentActivitySection } from '../components/RecentActivitySection';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';
import { fetchApi } from '@workspace/api-client-react';
import { formatAuthorDisplayName } from '../components/TaskUpdateModal';

export interface ApplicationItem {
  id: string;
  title: string;
  urlLink: string;
  entity?: 'EHM' | 'CAG' | 'COMMON';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reviewingLead: string;
  assignedTo: string;
  status: 'In Progress' | 'Done' | 'Pending' | 'Delayed';
  statusReason?: string;
  description: string;
  createdAt: string;
}

export const PROJECT_CATEGORY_OPTIONS = [
  'Sustainability Assessment & Reporting',
  'Sustainable Environmental Management',
  'Climate Risk Intelligence',
  'Geophysical Investigation',
  'Urban Planning & Management',
  'Training & Capacity Building',
  'Other',
];

export interface ProjectCheckpoint {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  entity: 'EHM' | 'CAG' | 'COMMON';
  entityCode?: string;
  entityName: string;
  category: string;
  lead: string;
  team: string[];
  budget: string;
  startDate: string;
  targetDate: string;
  status: 'Planning' | 'Active' | 'In Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  techStack: string;
  deliverableUrl?: string;
  milestonesCount: number;
  description: string;
  checkpoints?: ProjectCheckpoint[];
  comments?: { id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[];
  createdById?: string | null;
  createdByName?: string | null;
  createdAt?: string;
}

export const ApplicationsView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();

  // Top Level View: 'PROJECTS'
  const [activeMainTab] = useState<'PROJECTS'>('PROJECTS');

  // Sub-Tabs for Active vs Archived Items
  const [appSubTab, setAppSubTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [projectSubTab, setProjectSubTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Scalable Server-Side Filtering & Pagination States for Projects
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [leadFilter, setLeadFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    planningOrReview: 0,
    archived: 0,
  });
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeOverflowMenuId, setActiveOverflowMenuId] = useState<string | null>(null);
  const pageSize = 25;

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [selectedAppToUpdate, setSelectedAppToUpdate] = useState<ApplicationItem | null>(null);
  const [selectedProjectToUpdate, setSelectedProjectToUpdate] = useState<ProjectItem | null>(null);
  const [selectedProjectForView, setSelectedProjectForView] = useState<ProjectItem | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ recordId: string; title: string; code: string } | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  const isEmployee = user?.role === 'EMPLOYEE';
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);

  // Applications List Data
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  // Projects List Data with instant cache + Database sync
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const cacheKey = user?.id ? `hros_projects_list_${user.id}` : 'hros_projects_list';
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [collapsedProjectIds, setCollapsedProjectIds] = useState<Record<string, boolean>>({});

  // Debounce search input (~300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load projects from live database with true server pagination
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const effectiveEntity = selectedEntity !== 'ALL' ? selectedEntity : entityFilter;
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
        subTab: projectSubTab,
        entity: effectiveEntity,
        status: statusFilter,
        lead: leadFilter,
        search: debouncedSearch,
        paginate: 'true',
      });

      const res = await fetchApi<any>(`/api/projects?${queryParams.toString()}`);
      if (res && res.projects) {
        const sortedProjs = [...res.projects].sort((a: any, b: any) =>
          (a.name || a.title || '').localeCompare(b.name || b.title || '', undefined, { sensitivity: 'base' })
        );
        setProjects(sortedProjs);
        setTotalProjectsCount(res.totalCount || 0);
        setTotalPages(res.totalPages || Math.max(1, Math.ceil((res.totalCount || 0) / pageSize)));
        if (res.stats) {
          setProjectStats(res.stats);
        }
        try {
          const cacheKey = user?.id ? `hros_projects_list_${user.id}` : 'hros_projects_list';
          localStorage.setItem(cacheKey, JSON.stringify(sortedProjs));
        } catch {}
      } else if (Array.isArray(res)) {
        const sortedProjs = [...res].sort((a: any, b: any) =>
          (a.name || a.title || '').localeCompare(b.name || b.title || '', undefined, { sensitivity: 'base' })
        );
        setProjects(sortedProjs);
        setTotalProjectsCount(sortedProjs.length);
        setTotalPages(Math.max(1, Math.ceil(sortedProjs.length / pageSize)));
      }
    } catch (err) {
      console.error('[PROJECTS FETCH ERROR]:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load applications from live database
  const loadApplications = async () => {
    try {
      const data = await fetchApi<any[]>('/api/applications');
      if (Array.isArray(data)) {
        const mapped: ApplicationItem[] = data.map((d) => ({
          id: d.id,
          title: d.reason ? (d.reason.length > 50 ? d.reason.slice(0, 50) + '...' : d.reason) : `${d.type} Request`,
          urlLink: '',
          entity: 'EHM',
          priority: d.type === 'EQUIPMENT' ? 'High' : 'Medium',
          reviewingLead: d.reviewedBy ? 'Lead Reviewer' : 'Unassigned',
          assignedTo: d.employeeName || (user?.name || 'Unassigned'),
          status: d.status === 'APPROVED' ? 'Done' : d.status === 'REJECTED' ? 'Delayed' : 'Pending',
          description: `Type: ${d.type}. ${d.reason}`,
          createdAt: d.createdAt ? String(d.createdAt).split('T')[0] : 'Unknown',
        }));
        setApplications(mapped);
      }
    } catch (err: any) {
      console.error('[APPLICATIONS FETCH ERROR]:', err);
    }
  };

  useEffect(() => {
    // 1. Fetch DB employees
    fetchApi<any[]>('/api/employees')
      .then((data) => {
        if (Array.isArray(data)) setDbEmployees(data);
      })
      .catch((err) => {
        console.error('[EMPLOYEES FETCH ERROR]:', err);
      });

    loadProjects();
    loadApplications();
  }, [currentPage, projectSubTab, entityFilter, selectedEntity, statusFilter, leadFilter, debouncedSearch]);

  // Close overflow menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveOverflowMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const availableTeamMembers = React.useMemo(() => {
    const list = dbEmployees.map((emp) => ({
      id: emp.id || emp.email,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.email || 'Unassigned',
      code: emp.employeeCode || emp.code || 'EMP',
    }));
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [dbEmployees]);

  // Add Application Form State
  const [title, setTitle] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [reviewingLead, setReviewingLead] = useState('');
  const [assignedTo, setAssignedTo] = useState(user?.name || 'Unassigned');
  const [description, setDescription] = useState('');

  // Status Update Modal State for Applications
  const [updateStatus, setUpdateStatus] = useState<'In Progress' | 'Done' | 'Pending' | 'Delayed'>('In Progress');
  const [statusReason, setStatusReason] = useState('');

  // Status Update Modal State for Projects
  const [updateProjectStatus, setUpdateProjectStatus] = useState<'Planning' | 'Active' | 'In Review' | 'Completed'>('Active');

  // Add Project Form State (Basic Information & Checkpoints)
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projectEntity, setProjectEntity] = useState<'EHM' | 'CAG' | 'COMMON'>('EHM');
  const [projectCategory, setProjectCategory] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [selectedProjectLeads, setSelectedProjectLeads] = useState<string[]>([]);
  const [projectLead, setProjectLead] = useState('');
  const [projectTeam, setProjectTeam] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectTargetDate, setProjectTargetDate] = useState('');
  const [projectPriority, setProjectPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [projectTechStack, setProjectTechStack] = useState('');
  const [projectDeliverableUrl, setProjectDeliverableUrl] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Checkpoints Checklist Form State
  const [projectChecklists, setProjectChecklists] = useState<ProjectCheckpoint[]>([]);
  const [newCheckpointText, setNewCheckpointText] = useState('');
  const [editingProjectChkId, setEditingProjectChkId] = useState<string | null>(null);
  const [editingProjectChkText, setEditingProjectChkText] = useState('');

  // Multi-select Team Members State
  const [selectedTeamMemberNames, setSelectedTeamMemberNames] = useState<string[]>([]);

  // Project Clone & Comments Modal State
  const [isProjectClone, setIsProjectClone] = useState(false);
  const [cloneSourceProjectId, setCloneSourceProjectId] = useState('');
  const [projectComments, setProjectComments] = useState<{ id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[]>([]);
  const [newProjectCommentText, setNewProjectCommentText] = useState('');
  const [editingProjectCmtId, setEditingProjectCmtId] = useState<string | null>(null);
  const [editingProjectCmtText, setEditingProjectCmtText] = useState('');

  const handleAddProjectComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProjectCommentText.trim()) return;
    const newCmt = {
      id: `pcmt-${Date.now()}`,
      authorName: user?.name || 'Admin User',
      content: newProjectCommentText.trim(),
      createdAt: new Date().toISOString(),
    };
    setProjectComments(prev => [...prev, newCmt]);
    setNewProjectCommentText('');
  };

  const handleAddProjectCheckpoint = (textToAdd?: string) => {
    const text = (textToAdd || newCheckpointText).trim();
    if (!text) return;
    const newItem: ProjectCheckpoint = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: text,
      isCompleted: false,
    };
    setProjectChecklists(prev => [...prev, newItem]);
    if (!textToAdd) setNewCheckpointText('');
  };

  const handleRemoveProjectCheckpoint = (id: string) => {
    setProjectChecklists(prev => prev.filter(c => c.id !== id));
  };

  const handleToggleProjectCardCheckpoint = async (projectId: string, checkpointId: string) => {
    let updatedCheckpoints: ProjectCheckpoint[] = [];

    setProjects(prev => {
      const next = prev.map(p => {
        if (p.id !== projectId) return p;
        const updated = (p.checkpoints || []).map(c =>
          c.id === checkpointId ? { ...c, isCompleted: !c.isCompleted } : c
        );
        updatedCheckpoints = updated;
        return {
          ...p,
          checkpoints: updated,
          milestonesCount: updated.length,
        };
      });
      try { localStorage.setItem('hros_projects_list', JSON.stringify(next)); } catch {}
      return next;
    });

    if (selectedProjectForView?.id === projectId) {
      setSelectedProjectForView(prev => prev ? { ...prev, checkpoints: updatedCheckpoints } : null);
    }

    try {
      await fetchApi(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ checkpoints: updatedCheckpoints }),
      });
    } catch (err) {
      console.error('[CHECKPOINT PERSIST ERROR]:', err);
    }
  };

  // Scoped Applications & Active vs Archived Filtering
  const scopedApps = applications.filter(
    a => matchesEntityFilter(a, selectedEntity) && (isEmployee ? a.assignedTo === (user?.name || 'Unassigned') : true)
  );
  const activeAppsList = scopedApps.filter(a => a.status !== 'Done');
  const archivedAppsList = scopedApps.filter(a => a.status === 'Done');

  const displayedAppsList = (appSubTab === 'ACTIVE' ? activeAppsList : archivedAppsList).filter(
    a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reviewingLead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scoped Projects & Active vs Archived Filtering
  const currentUserName = (user?.name || '').toLowerCase();
  const userFirstName = (user?.name?.split(' ')[0] || '').toLowerCase();
  const userEmail = (user?.email || '').toLowerCase();

  const canEditProject = (p: ProjectItem) => {
    if (!isEmployee) return true;
    const userEmpId = user?.employeeId;
    const isLead = Boolean(
      (userEmpId && p.lead?.includes(userEmpId)) ||
      (currentUserName && p.lead?.toLowerCase().includes(currentUserName)) ||
      (userFirstName && p.lead?.toLowerCase().includes(userFirstName)) ||
      (userEmail && p.lead?.toLowerCase().includes(userEmail))
    );
    const isTeamMember =
      (Array.isArray(p.team) &&
        p.team.some((member) => {
          const mLower = member.toLowerCase();
          return Boolean(
            (userEmpId && member === userEmpId) ||
            (currentUserName && mLower.includes(currentUserName)) ||
            (userFirstName && mLower.includes(userFirstName)) ||
            (userEmail && mLower.includes(userEmail))
          );
        })) ||
      (Array.isArray((p as any).teamIds) && Boolean(userEmpId && (p as any).teamIds.includes(userEmpId)));
    const isCreator = Boolean(userEmpId && (p as any).createdById === userEmpId);
    return isLead || isTeamMember || isCreator;
  };

  const scopedProjects = projects.filter(p => {
    const matchesEntity = matchesEntityFilter(p, selectedEntity);
    if (!isEmployee) return matchesEntity;
    return matchesEntity && canEditProject(p);
  });
  const activeProjectsList = scopedProjects.filter(p => p.status !== 'Completed');
  const archivedProjectsList = scopedProjects.filter(p => p.status === 'Completed');

  const displayedProjectsList = (projectSubTab === 'ACTIVE' ? activeProjectsList : archivedProjectsList).filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Application Stats
  const totalAppsCount = scopedApps.length;
  const highPriorityAppsCount = scopedApps.filter(a => a.priority === 'High' || a.priority === 'Urgent').length;
  const pendingAppsCount = scopedApps.filter(a => a.status === 'Pending' || a.status === 'Delayed').length;



  const handleCloneProject = (proj: ProjectItem) => {
    setEditingProjectId(null);
    setProjectName(`[CLONE] ${proj.name}`);
    setProjectCode(`${proj.code}-CLONE`);
    setProjectEntity(proj.entity);
    const isKnown = PROJECT_CATEGORY_OPTIONS.slice(0, 6).includes(proj.category);
    if (isKnown) {
      setSelectedCategoryType(proj.category);
      setCustomCategoryText('');
    } else if (proj.category) {
      setSelectedCategoryType('Other');
      setCustomCategoryText(proj.category);
    } else {
      setSelectedCategoryType('');
      setCustomCategoryText('');
    }
    setProjectCategory(proj.category || '');
    setSelectedProjectLeads(proj.lead ? proj.lead.split(',').map((s) => s.trim()).filter(Boolean) : []);
    setProjectLead(proj.lead);
    setSelectedTeamMemberNames(proj.team);
    setProjectTeam(proj.team.join(', '));
    setProjectPriority(proj.priority);
    setProjectTechStack(proj.techStack || '');
    setProjectDeliverableUrl(proj.deliverableUrl || proj.techStack || '');
    setProjectDescription(proj.description);
    setProjectChecklists(proj.checkpoints ? proj.checkpoints.map(c => ({ ...c, isCompleted: false })) : []);
    setIsProjectClone(true);
    setShowAddProjectModal(true);
    toast.success(`Pre-filled clone form for project "${proj.name}". Adjust basic info to complete!`);
  };

  const handleEditProject = (proj: ProjectItem) => {
    setEditingProjectId(proj.id);
    setProjectName(proj.name);
    setProjectCode(proj.code);
    setProjectEntity(proj.entity);
    const isKnown = PROJECT_CATEGORY_OPTIONS.slice(0, 6).includes(proj.category);
    if (isKnown) {
      setSelectedCategoryType(proj.category);
      setCustomCategoryText('');
    } else if (proj.category) {
      setSelectedCategoryType('Other');
      setCustomCategoryText(proj.category);
    } else {
      setSelectedCategoryType('');
      setCustomCategoryText('');
    }
    setProjectCategory(proj.category || '');
    setSelectedProjectLeads(proj.lead ? proj.lead.split(',').map((s) => s.trim()).filter(Boolean) : []);
    setProjectLead(proj.lead);
    setSelectedTeamMemberNames(proj.team);
    setProjectTeam(proj.team.join(', '));
    setProjectStartDate(proj.startDate);
    setProjectTargetDate(proj.targetDate);
    setProjectPriority(proj.priority);
    setProjectTechStack(proj.techStack || '');
    setProjectDeliverableUrl(proj.deliverableUrl || '');
    setProjectDescription(proj.description);
    setProjectChecklists(proj.checkpoints || []);
    setProjectComments(proj.comments || []);
    setIsProjectClone(false);
    setShowAddProjectModal(true);
    toast.info(`Editing project "${proj.name}". Modify parameters and click Save Changes!`);
  };

  const handleAddAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let appType = 'REMOTE_WORK';
      if (priority === 'High' || priority === 'Urgent') appType = 'EQUIPMENT';
      else if (title.toLowerCase().includes('reimburse') || description.toLowerCase().includes('reimburse')) appType = 'REIMBURSEMENT';

      const fullReason = `${title}${urlLink ? ` - Link: ${urlLink}` : ''}${description ? ` | ${description}` : ''}`;
      await fetchApi('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          type: appType,
          reason: fullReason,
        }),
      });
      toast.success(`Application "${title}" submitted to server successfully!`);
      setShowAddModal(false);
      setTitle('');
      setUrlLink('');
      setDescription('');
      await loadApplications();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application');
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingProject) return;
    setIsSubmittingProject(true);

    try {

      const finalCheckpoints = projectChecklists;
      const finalTeam = selectedTeamMemberNames;
      const finalLead = selectedProjectLeads.length > 0 ? selectedProjectLeads.join(', ') : (projectLead ? projectLead.trim() : '');
      const finalDeliverableUrl = projectDeliverableUrl.trim();
      const finalCategory = selectedCategoryType === 'Other'
        ? (customCategoryText.trim() || 'Other')
        : (selectedCategoryType || projectCategory);

      if (editingProjectId) {
        const payload = {
          code: projectCode.trim() || undefined,
          name: projectName,
          entity: projectEntity,
          entityName: projectEntity === 'EHM' ? 'ehmconsultancy' : projectEntity === 'CAG' ? 'climagroanalytics' : 'common',
          category: finalCategory,
          lead: finalLead,
          team: finalTeam,
          budget: projectBudget,
          startDate: projectStartDate,
          targetDate: projectTargetDate,
          priority: projectPriority,
          techStack: projectTechStack,
          deliverableUrl: finalDeliverableUrl,
          milestonesCount: finalCheckpoints.length,
          description: projectDescription,
          checkpoints: finalCheckpoints,
          comments: projectComments,
        };

        try {
          const updated = await fetchApi<ProjectItem>(`/api/projects/${editingProjectId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          });

          toast.success(`Project "${projectName}" updated and saved to database!`);
          await loadProjects();
          if (selectedProjectForView?.id === editingProjectId) {
            setSelectedProjectForView(updated || { ...selectedProjectForView, ...payload });
          }
        } catch (err: any) {
          console.error('[PROJECT UPDATE ERROR]:', err);
          toast.error(`Failed to update project: ${err?.message || 'Server error'}`);
        }
      } else {
        const payload = {
          code: projectCode.trim() || undefined,
          name: projectName,
          entity: projectEntity,
          entityName: projectEntity === 'EHM' ? 'ehmconsultancy' : projectEntity === 'CAG' ? 'climagroanalytics' : 'common',
          category: finalCategory,
          lead: finalLead,
          team: finalTeam,
          budget: projectBudget,
          startDate: projectStartDate,
          targetDate: projectTargetDate,
          status: 'Planning' as const,
          priority: projectPriority,
          techStack: projectTechStack,
          deliverableUrl: finalDeliverableUrl,
          milestonesCount: finalCheckpoints.length,
          description: projectDescription,
          checkpoints: finalCheckpoints,
          comments: projectComments,
        };

        try {
          const created = await fetchApi<ProjectItem>('/api/projects', {
            method: 'POST',
            body: JSON.stringify(payload),
          });

          toast.success(`New project "${projectName}" (${created?.code || 'Created'}) saved permanently to database!`);
          await loadProjects();
        } catch (err: any) {
          console.error('[PROJECT CREATE ERROR]:', err);
          toast.error(`Failed to create project: ${err?.message || 'Server error'}`);
        }
      }

      setShowAddProjectModal(false);
      setEditingProjectId(null);
      setProjectName('');
      setProjectCode('');
      setProjectLead('');
      setSelectedProjectLeads([]);
      setSelectedTeamMemberNames([]);
      setProjectStartDate('');
      setProjectTargetDate('');
      setProjectTechStack('');
      setProjectDeliverableUrl('');
      setProjectCategory('');
      setSelectedCategoryType('');
      setCustomCategoryText('');
      setProjectDescription('');
      setProjectChecklists([]);
      setNewCheckpointText('');
      setProjectComments([]);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projName: string) => {
    if (isEmployee) return;
    if (!window.confirm(`Are you sure you want to delete project "${projName}"? This cannot be undone.`)) return;

    if (selectedProjectForView?.id === projectId) {
      setSelectedProjectForView(null);
    }

    try {
      await fetchApi(`/api/projects/${projectId}`, { method: 'DELETE' });
      toast.success(`Project "${projName}" permanently removed from database.`);
      await loadProjects();
    } catch (err: any) {
      console.error('[PROJECT DELETE ERROR]:', err);
      toast.error(`Failed to delete project: ${err?.message || 'Server error'}`);
    }
  };

  const handleSaveAppStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppToUpdate) return;

    if ((updateStatus === 'Pending' || updateStatus === 'Delayed') && !statusReason.trim()) {
      toast.error(`Please provide a reason why this application is ${updateStatus}!`);
      return;
    }

    try {
      const serverStatus = updateStatus === 'Done' ? 'APPROVED' : (updateStatus === 'Delayed' ? 'REJECTED' : 'PENDING');
      await fetchApi(`/api/applications/${selectedAppToUpdate.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: serverStatus,
          reason: statusReason.trim() ? `${selectedAppToUpdate.description} (Reason: ${statusReason})` : undefined,
        }),
      });

      if (updateStatus === 'Done') {
        toast.success(`Application "${selectedAppToUpdate.title}" marked as Approved and saved!`);
      } else {
        toast.success(`Application status updated to ${updateStatus} and saved!`);
      }

      setSelectedAppToUpdate(null);
      setStatusReason('');
      await loadApplications();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update application status on server');
    }
  };

  const handleSaveProjectStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectToUpdate) return;

    const projectId = selectedProjectToUpdate.id;
    const newStatus = updateProjectStatus;

    try {
      await fetchApi(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await loadProjects();
    } catch (err: any) {
      console.error('[STATUS PERSIST ERROR]:', err);
      toast.error(`Failed to update project status: ${err?.message || 'Server error'}`);
    }

    if (selectedProjectForView?.id === projectId) {
      setSelectedProjectForView(prev => prev ? { ...prev, status: newStatus } : null);
    }

    if (newStatus === 'Completed') {
      toast.success(`Project "${selectedProjectToUpdate.name}" marked as Completed and moved to Archived Projects!`);
    } else {
      toast.success(`Project status updated to ${newStatus}!`);
    }

    setSelectedProjectToUpdate(null);
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Projects and specifications</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage company project proposals, technical specifications, and archives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingProjectId(null);
              setProjectName('');
              setProjectCode('');
              setProjectLead('');
              setSelectedProjectLeads([]);
              setSelectedTeamMemberNames([]);
              setProjectStartDate('');
              setProjectTargetDate('');
              setProjectTechStack('');
              setProjectDeliverableUrl('');
              setProjectCategory('');
              setSelectedCategoryType('');
              setCustomCategoryText('');
              setProjectDescription('');
              setProjectChecklists([]);
              setNewCheckpointText('');
              setProjectComments([]);
              setShowAddProjectModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isEmployee ? '+ Propose Project' : '+ Add new project'}</span>
          </button>
        </div>
      </div>

      {/* PROJECTS & SPECIFICATIONS VIEW */}
      <div className="space-y-6">
        {/* Project Summary Stats Cards from Live Database COUNT(*) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
              Total projects
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {projectStats.total || totalProjectsCount}
            </span>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">
              Active
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
              {projectStats.active}
            </span>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
              In planning / review
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-800">
              {projectStats.planningOrReview}
            </span>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider block mb-1">
              Completed / archived
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-800">
              {projectStats.archived}
            </span>
          </div>
        </div>

        {/* Filter Toolbar & Debounced Search */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Active / Archived Pill Toggle */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => {
                  setProjectSubTab('ACTIVE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  projectSubTab === 'ACTIVE'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Active ({projectStats.active})
              </button>

              <button
                onClick={() => {
                  setProjectSubTab('ARCHIVED');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  projectSubTab === 'ARCHIVED'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Archived ({projectStats.archived})
              </button>
            </div>

            {/* Entity Filter Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <select
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="ALL">All entities</option>
                <option value="EHM">EHM</option>
                <option value="CAG">CLIMAGRO</option>
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="ALL">All statuses</option>
                <option value="Active">In progress</option>
                <option value="In Review">Reviewing</option>
                <option value="Planning">Planning</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Lead Filter Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <select
                value={leadFilter}
                onChange={(e) => {
                  setLeadFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="ALL">All leads</option>
                {availableTeamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full-width Debounced Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, name, category, lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200/90 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* High-Performance Paginated Projects Table */}
        {loadingProjects ? (
          <div className="py-16 text-center text-xs font-semibold text-gray-400 bg-white rounded-2xl border border-gray-200/80">
            Loading projects page {currentPage} from live database...
          </div>
        ) : (
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-3">Entity</th>
                    <th className="py-3 px-3">Progress</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-gray-400 font-medium">
                        No projects found matching criteria. Click "+ Add new project" to create one.
                      </td>
                    </tr>
                  ) : (
                    projects.map((prj, idx) => {
                      const isExpanded = collapsedProjectIds[prj.id] === true;
                      const completedCheckpoints = prj.checkpoints ? prj.checkpoints.filter((c) => c.isCompleted).length : 0;
                      const totalCheckpoints = prj.checkpoints ? prj.checkpoints.length : 0;
                      const checkpointPercent = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

                      const isCAG = (prj.entityCode || prj.entity) === 'CAG' || prj.entityName?.toLowerCase().includes('cag');
                      const entityLabel = isCAG ? 'CLIMAGRO' : 'EHM';

                      const statusLower = (prj.status || '').toLowerCase();
                      const statusDisplay =
                        statusLower === 'active' || statusLower === 'in progress' || statusLower === 'in_progress'
                          ? 'In progress'
                          : statusLower === 'in review' || statusLower === 'in_review' || statusLower === 'reviewing'
                          ? 'Reviewing'
                          : statusLower === 'planning'
                          ? 'Planning'
                          : 'Completed';

                      const isBottomRow = idx >= Math.max(0, projects.length - 2) || projects.length <= 3;

                      return (
                        <React.Fragment key={prj.id}>
                          <tr className="hover:bg-gray-50/80 transition-colors group">
                            {/* Column 1: Expand Chevron + Stacked Code & Name */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setCollapsedProjectIds((prev) => ({ ...prev, [prj.id]: !prev[prj.id] }))}
                                  className="p-1 text-gray-400 hover:text-gray-800 rounded transition-colors cursor-pointer shrink-0"
                                  title={isExpanded ? 'Collapse Inline Details' : 'Expand Inline Details'}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-[10px] font-semibold text-gray-400 tracking-wider">
                                      {prj.code}
                                    </span>
                                    {prj.createdByName && (
                                      <span className="text-[10px] text-gray-500 font-medium">
                                        • By <strong className="text-gray-700 font-semibold">{prj.createdByName}</strong>
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    onClick={() => setSelectedProjectForView(prj)}
                                    className="font-bold text-xs text-gray-900 hover:text-emerald-700 cursor-pointer transition-colors block truncate"
                                    title={prj.name}
                                  >
                                    {prj.name}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Entity */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {(() => {
                                const badge = getEntityBadge(prj);
                                return (
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wide shrink-0 ${badge.className}`}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </td>

                            {/* Column 3: Progress */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="text-xs font-semibold text-gray-600">
                                {totalCheckpoints > 0
                                  ? `${completedCheckpoints} of ${totalCheckpoints} done (${checkpointPercent}%)`
                                  : '0 of 0 done (0%)'}
                              </span>
                            </td>

                            {/* Column 4: Status */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                  statusDisplay === 'In progress'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : statusDisplay === 'Reviewing'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : statusDisplay === 'Planning'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {statusDisplay}
                              </span>
                            </td>

                            {/* Column 5: Action Buttons */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="relative inline-flex items-center gap-1 text-left" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setHistoryTarget({
                                    recordId: prj.id,
                                    title: prj.name,
                                    code: prj.code,
                                  })}
                                  className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="View Project Audit History"
                                >
                                  <History className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setActiveOverflowMenuId(activeOverflowMenuId === prj.id ? null : prj.id)}
                                  className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                  title="Project Options"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {activeOverflowMenuId === prj.id && (
                                  <div
                                    className={`absolute right-0 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 text-left ${
                                      isBottomRow
                                        ? 'bottom-full mb-1.5 origin-bottom-right'
                                        : 'top-full mt-1.5 origin-top-right'
                                    } animate-in fade-in zoom-in-95 duration-100`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveOverflowMenuId(null);
                                        setSelectedProjectForView(prj);
                                      }}
                                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>View details</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveOverflowMenuId(null);
                                        setHistoryTarget({
                                          recordId: prj.id,
                                          title: prj.name,
                                          code: prj.code,
                                        });
                                      }}
                                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                      <History className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Audit history</span>
                                    </button>

                                    {canEditProject(prj) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveOverflowMenuId(null);
                                          handleEditProject(prj);
                                        }}
                                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Edit project</span>
                                      </button>
                                    )}
                                    {!isEmployee && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveOverflowMenuId(null);
                                          handleDeleteProject(prj.id, prj.name);
                                        }}
                                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                        <span>Delete project</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Inline Collapsible Accordion Row */}
                          {isExpanded && (
                            <tr className="bg-gray-50/50">
                              <td colSpan={5} className="p-4 border-t border-gray-100">
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
                                  {prj.description && (
                                    <div className="pt-1">
                                      <MarkdownViewer content={prj.description} />
                                    </div>
                                  )}

                                  {/* Info Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-xs">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-emerald-600" /> Category
                                      </span>
                                      <span className="font-semibold text-gray-800 block">{prj.category || 'General'}</span>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                        <User className="w-3 h-3 text-indigo-600" /> Project Lead
                                      </span>
                                      <span className="font-bold text-indigo-700 block">{prj.lead || 'Unassigned'}</span>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-blue-600" /> Target Deadline
                                      </span>
                                      <span className="font-semibold text-gray-800 block">{prj.targetDate || '—'}</span>
                                    </div>
                                  </div>

                                  {/* Deliverable URL & Team Info */}
                                  <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-bold text-gray-500 flex items-center gap-1">
                                        <Layers className="w-3 h-3 text-purple-600" /> Deliverable URL(s) / Links:
                                      </span>
                                      {(prj.deliverableUrl || prj.techStack) && (prj.deliverableUrl || prj.techStack)?.startsWith('http') ? (
                                        <a
                                          href={prj.deliverableUrl || prj.techStack}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="font-extrabold text-emerald-600 hover:underline flex items-center gap-1"
                                        >
                                          <span className="max-w-[200px] truncate">{prj.deliverableUrl || prj.techStack}</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      ) : (
                                        <span className="font-extrabold text-purple-700">{prj.deliverableUrl || prj.techStack || '—'}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                                      <span>Assigned Team ({Array.isArray(prj.team) ? prj.team.length : 0}):</span>
                                      <span className="font-semibold">{Array.isArray(prj.team) ? prj.team.join(', ') : '—'}</span>
                                    </div>
                                  </div>

                                  {/* Checkpoints Checklist */}
                                  {prj.checkpoints && prj.checkpoints.length > 0 && (
                                    <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/80 space-y-2 text-xs">
                                      <div className="flex items-center justify-between text-[11px] font-bold">
                                        <span className="text-gray-700 flex items-center gap-1.5">
                                          <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Project Checkpoint Checklist</span>
                                        </span>
                                        <span className="text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full font-extrabold text-[10px]">
                                          {completedCheckpoints} of {totalCheckpoints} Done ({checkpointPercent}%)
                                        </span>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                          style={{ width: `${checkpointPercent}%` }}
                                        />
                                      </div>

                                      {/* Interactive Checkpoints */}
                                      <div className="space-y-1 pt-1 max-h-36 overflow-y-auto pr-0.5">
                                        {prj.checkpoints.map((chk) => (
                                          <label
                                            key={chk.id}
                                            className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                                              chk.isCompleted
                                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                disabled={isEmployee}
                                                checked={chk.isCompleted}
                                                onChange={() => {
                                                  if (isEmployee) return;
                                                  handleToggleProjectCardCheckpoint(prj.id, chk.id);
                                                }}
                                                className={`w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 ${
                                                  isEmployee ? 'cursor-default' : 'cursor-pointer'
                                                }`}
                                              />
                                              <span className={chk.isCompleted ? 'line-through text-gray-400' : ''}>
                                                {chk.title}
                                              </span>
                                            </div>
                                            {chk.isCompleted && (
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            )}
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination Controls */}
            <div className="p-3.5 bg-gray-50/90 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600">
              <div>
                Showing {totalProjectsCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
                {Math.min(currentPage * pageSize, totalProjectsCount)} of {totalProjectsCount.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {isEmployee ? 'Submit Application' : 'Add New Application'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAppSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Application Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google - Frontend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Application URL/Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://careers.google.com/..."
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs font-bold border border-gray-200 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Urgent">P1</option>
                    <option value="High">P2</option>
                    <option value="Medium">P3</option>
                    <option value="Low">P4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead</label>
                  <select
                    value={reviewingLead}
                    onChange={(e) => setReviewingLead(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {dbEmployees.length > 0 ? (
                      dbEmployees.map((emp) => (
                        <option key={emp.id} value={emp.name}>{emp.name}</option>
                      ))
                    ) : (
                      <option value="Unassigned">Unassigned</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Applicant Name</label>
                {isEmployee ? (
                  <div className="w-full text-xs font-bold bg-indigo-50/70 border border-indigo-200 rounded-xl p-2.5 text-indigo-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>{user?.name || 'Priyanka Sharma'}</span>
                  </div>
                ) : (
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {dbEmployees.length > 0 ? (
                      dbEmployees.map((emp) => (
                        <option key={emp.id} value={emp.name}>{emp.name}</option>
                      ))
                    ) : (
                      <option value="Unassigned">Unassigned</option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Add details, notes, deadline info..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Project Modal (Rich 2-Column Specification Form Layout) */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base tracking-tight">
                  {editingProjectId ? 'Edit Project Specifications & Details' : 'Configure New Project Specifications'}
                </h3>
                <span className="px-2.5 py-0.5 border rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                  {editingProjectId ? 'Edit Mode' : 'Project Spec Iteration'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Content Body */}
            <form onSubmit={handleAddProjectSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 flex-1 min-h-0">
              
              {/* Left Column (Project Specifications, Team, Deliverables & Checkpoints) */}
              <div className="lg:col-span-7 space-y-4 text-left">
                
                {/* Project Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar Farm Carbon & Environmental Audit"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Assign Team Members (Multi-Select Dropdown) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Assign Team Members (Optional)</span>
                    <span className="text-[10px] font-mono text-gray-400">Multi-select dropdown</span>
                  </label>
                  <SearchableSelect
                    options={availableTeamMembers.map((emp) => ({
                      id: emp.name,
                      code: emp.code,
                      label: emp.name,
                    }))}
                    isMulti={true}
                    multiValues={selectedTeamMemberNames}
                    onMultiChange={setSelectedTeamMemberNames}
                    placeholder="Select Team Members (Optional)..."
                    searchPlaceholder="Search team members..."
                  />
                </div>

                {/* Reviewing Lead / Manager */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Project Lead / Manager (Optional)</span>
                    <span className="text-[10px] font-mono text-gray-400">Multi-select dropdown</span>
                  </label>
                  <SearchableSelect
                    options={availableTeamMembers.map((emp) => ({
                      id: emp.name,
                      code: emp.code,
                      label: emp.name,
                    }))}
                    isMulti={true}
                    multiValues={selectedProjectLeads}
                    onMultiChange={setSelectedProjectLeads}
                    placeholder="Select Project Lead(s) (Optional)..."
                    searchPlaceholder="Search project leads..."
                  />
                </div>

                {/* Company Entity & Category */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Company / Entity</label>
                      <select
                        value={projectEntity}
                        onChange={(e) => setProjectEntity(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold cursor-pointer"
                      >
                        <option value="EHM">EHM</option>
                        <option value="CAG">CLIMAGRO</option>
                        <option value="COMMON">COMMON (Cross-entity)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Category / Domain</label>
                      <select
                        value={selectedCategoryType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedCategoryType(val);
                          if (val === 'Other') {
                            setProjectCategory(customCategoryText);
                          } else {
                            setProjectCategory(val);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold cursor-pointer"
                      >
                        <option value="">-- Select Category / Domain --</option>
                        {PROJECT_CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedCategoryType === 'Other' && (
                    <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/80 space-y-1 animate-in fade-in duration-150">
                      <label className="block text-[11px] font-bold text-emerald-900 flex items-center justify-between">
                        <span>Specify Custom Category / Domain *</span>
                        <span className="text-[10px] text-emerald-700 font-mono">Custom write-in</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your custom category or domain name..."
                        value={customCategoryText}
                        onChange={(e) => {
                          setCustomCategoryText(e.target.value);
                          setProjectCategory(e.target.value);
                        }}
                        className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-gray-900 placeholder-gray-400"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Timeline Dates & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Start Date</label>
                      {projectStartDate && (
                        <button
                          type="button"
                          onClick={() => setProjectStartDate('')}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={projectStartDate}
                      onChange={(e) => setProjectStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Target Date</label>
                      {projectTargetDate && (
                        <button
                          type="button"
                          onClick={() => setProjectTargetDate('')}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={projectTargetDate}
                      onChange={(e) => setProjectTargetDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      value={projectPriority}
                      onChange={(e) => setProjectPriority(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-gray-900 cursor-pointer"
                    >
                      <option value="Urgent">P1</option>
                      <option value="High">P2</option>
                      <option value="Medium">P3</option>
                      <option value="Low">P4</option>
                    </select>
                  </div>
                </div>

                {/* Deliverable URL(s) / Links */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Deliverable URL(s) / Links
                    </label>
                    {projectDeliverableUrl && projectDeliverableUrl.startsWith('http') && (
                      <a
                        href={projectDeliverableUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Link</span>
                      </a>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="e.g. https://github.com/org/repo or https://figma.com/file/... or live URL"
                      value={projectDeliverableUrl}
                      onChange={(e) => {
                        setProjectDeliverableUrl(e.target.value);
                        setProjectTechStack(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium pl-8"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Deliverable Goal / Scope Overview (Rich Text Editor) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Deliverable Goal / Objective</label>
                  <RichTextEditor
                    value={projectDescription}
                    onChange={setProjectDescription}
                    placeholder="Outline expected project scope and key deliverables outcome..."
                    rows={3}
                  />
                </div>

                {/* Subtask Checklist / Checkpoint Section */}
                <div className="pt-3 border-t border-gray-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
                      <span>Subtask Checklist</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {projectChecklists.filter(c => c.isCompleted).length} of {projectChecklists.length} Completed
                    </span>
                  </div>

                  {/* Checkpoints items list */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {projectChecklists.length === 0 ? (
                      <div className="py-3 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No subtasks added yet. Add one below!
                      </div>
                    ) : (
                      projectChecklists.map((item) => (
                        editingProjectChkId === item.id ? (
                          <div key={item.id} className="flex items-center gap-1.5 p-1.5 rounded-xl border border-emerald-300 bg-white">
                            <input
                              type="text"
                              value={editingProjectChkText}
                              onChange={(e) => setEditingProjectChkText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (editingProjectChkText.trim()) {
                                    setProjectChecklists(prev => prev.map(c => c.id === item.id ? { ...c, title: editingProjectChkText.trim() } : c));
                                    setEditingProjectChkId(null);
                                    setEditingProjectChkText('');
                                  }
                                } else if (e.key === 'Escape') {
                                  setEditingProjectChkId(null);
                                  setEditingProjectChkText('');
                                }
                              }}
                              autoFocus
                              className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editingProjectChkText.trim()) {
                                  setProjectChecklists(prev => prev.map(c => c.id === item.id ? { ...c, title: editingProjectChkText.trim() } : c));
                                  setEditingProjectChkId(null);
                                  setEditingProjectChkText('');
                                }
                              }}
                              title="Save checkpoint"
                              className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProjectChkId(null);
                                setEditingProjectChkText('');
                              }}
                              title="Cancel"
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
                                onChange={() => {
                                  setProjectChecklists(
                                    projectChecklists.map((c) =>
                                      c.id === item.id ? { ...c, isCompleted: !c.isCompleted } : c
                                    )
                                  );
                                }}
                                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                              />
                              <span className={`break-words ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                {item.title}
                              </span>
                            </label>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProjectChkId(item.id);
                                  setEditingProjectChkText(item.title);
                                }}
                                title="Edit subtask"
                                className="text-gray-400 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveProjectCheckpoint(item.id)}
                                title="Delete subtask"
                                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
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
                      value={newCheckpointText}
                      onChange={(e) => setNewCheckpointText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddProjectCheckpoint();
                        }
                      }}
                      className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddProjectCheckpoint()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
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
                  
                  {/* Template Cloning Box (Clean Black & White Monochrome) */}
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-300 space-y-2.5 shrink-0 shadow-2xs">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isProjectClone}
                        onChange={(e) => {
                          setIsProjectClone(e.target.checked);
                          if (!e.target.checked) setCloneSourceProjectId('');
                        }}
                        className="mt-0.5 rounded text-gray-900 focus:ring-gray-900 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-gray-900 block">Make Clone / Duplicate Copy</span>
                        <p className="text-[10px] text-gray-600 font-semibold leading-snug">
                          Check this box to duplicate an existing project or pre-fill parameters directly inside this form.
                        </p>
                      </div>
                    </label>

                    {isProjectClone && (
                      <div className="pt-2 border-t border-gray-200 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-gray-900 mb-1">
                          Select Existing Project to Clone From:
                        </label>
                        <select
                          value={cloneSourceProjectId}
                          onChange={(e) => {
                            setCloneSourceProjectId(e.target.value);
                            const source = projects.find(p => p.id === e.target.value);
                            if (source) {
                              setProjectName(`${source.name} (Clone)`);
                              setProjectCode(`${source.code}-CLONE`);
                              setProjectEntity(source.entity);
                              const isKnown = PROJECT_CATEGORY_OPTIONS.slice(0, 6).includes(source.category);
                              if (isKnown) {
                                setSelectedCategoryType(source.category);
                                setCustomCategoryText('');
                              } else if (source.category) {
                                setSelectedCategoryType('Other');
                                setCustomCategoryText(source.category);
                              } else {
                                setSelectedCategoryType('');
                                setCustomCategoryText('');
                              }
                              setProjectCategory(source.category || '');
                              setSelectedProjectLeads(source.lead ? source.lead.split(',').map((s) => s.trim()).filter(Boolean) : []);
                              setProjectLead(source.lead || '');
                              setSelectedTeamMemberNames(source.team || []);
                              setProjectTechStack(source.techStack || '');
                              setProjectDeliverableUrl(source.deliverableUrl || source.techStack || '');
                              setProjectDescription(source.description || '');
                              if (source.checkpoints) {
                                setProjectChecklists(source.checkpoints.map(c => ({ ...c, isCompleted: false })));
                              }
                              setProjectComments([
                                { id: 'pcm-1', authorName: 'System Log', content: `Cloned project parameters from "${source.name}"`, createdAt: new Date().toISOString(), isSystemLog: true },
                              ]);
                              toast.success(`Form pre-filled with project data from "${source.name}"!`);
                            }
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-purple-300 rounded-xl bg-white font-bold text-purple-950 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
                        >
                          <option value="">-- Choose Existing Project to Auto-Fill --</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>
                              [{p.code}] {p.name}
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
                        {projectComments.length}
                      </span>
                    </div>

                    {/* Comments Feed */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px] max-h-[240px]">
                      {projectComments.length === 0 ? (
                        <div className="h-full flex items-center justify-center py-8 text-center text-xs text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                          No comments yet. Post the first comment!
                        </div>
                      ) : (
                        projectComments.map((c) => (
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
                                <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                {!c.isSystemLog && (
                                  <div className="flex items-center gap-0.5 ml-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingProjectCmtId(c.id);
                                        setEditingProjectCmtText(c.content);
                                      }}
                                      title="Edit comment"
                                      className="p-0.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setProjectComments(prev => prev.filter(item => item.id !== c.id))}
                                      title="Delete comment"
                                      className="p-0.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {editingProjectCmtId === c.id ? (
                              <div className="pt-1 space-y-1.5">
                                <textarea
                                  value={editingProjectCmtText}
                                  onChange={(e) => setEditingProjectCmtText(e.target.value)}
                                  className="w-full text-xs p-2 border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                                  rows={2}
                                />
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProjectCmtId(null);
                                      setEditingProjectCmtText('');
                                    }}
                                    className="px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded-md font-semibold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editingProjectCmtText.trim()) {
                                        setProjectComments(prev => prev.map(item => item.id === c.id ? { ...item, content: editingProjectCmtText.trim() } : item));
                                        setEditingProjectCmtId(null);
                                        setEditingProjectCmtText('');
                                      }
                                    }}
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
                        value={newProjectCommentText}
                        onChange={(e) => setNewProjectCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddProjectComment(e);
                          }
                        }}
                        className="flex-1 text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddProjectComment()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Modal Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddProjectModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProject}
                    className={`flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                      isSubmittingProject
                        ? 'bg-emerald-400 cursor-not-allowed text-white opacity-75'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isSubmittingProject ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingProjectId ? (
                      <Edit3 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>
                      {isSubmittingProject
                        ? 'Saving...'
                        : editingProjectId
                        ? 'Save Changes'
                        : 'Save New Project'}
                    </span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Update Application Status Modal */}
      {selectedAppToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Update Application Status</h3>
                <p className="text-[11px] text-indigo-600 font-semibold">{selectedAppToUpdate.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppToUpdate(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAppStatusUpdate} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select New Status *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as any)}
                  className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Done">Done ✅ (Move to Archived)</option>
                  <option value="In Progress">In Progress 🔄</option>
                  <option value="Pending">Pending ⏳</option>
                  <option value="Delayed">Delayed ⚠️</option>
                </select>
              </div>

              {(updateStatus === 'Pending' || updateStatus === 'Delayed') && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-amber-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reason for {updateStatus} *</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={`Specify why this application is currently ${updateStatus}...`}
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full text-xs border border-amber-300 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  ></textarea>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedAppToUpdate(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Project Status Modal */}
      {selectedProjectToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Update Project Status</h3>
                <p className="text-[11px] text-emerald-600 font-semibold">{selectedProjectToUpdate.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectToUpdate(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectStatusUpdate} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Project Lifecycle Status *</label>
                <select
                  value={updateProjectStatus}
                  onChange={(e) => setUpdateProjectStatus(e.target.value as any)}
                  className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Planning">Planning / Spec 📋</option>
                  <option value="Active">Active / In Progress 🔄</option>
                  <option value="In Review">In Review 🔍</option>
                  <option value="Completed">Completed ✅ (Move to Archived Projects)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedProjectToUpdate(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Project Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded View Project Details Modal Popup */}
      {selectedProjectForView && (() => {
        const p = selectedProjectForView;
        const isCAG = (p.entityCode || p.entity) === 'CAG' || p.entityName?.toLowerCase().includes('cag');
        const entityLabel = isCAG ? 'CLIMAGROANALYTICS' : 'EHMCONSULTANCY';

        const priorityColor =
          p.priority === 'Urgent'
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : p.priority === 'High'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : p.priority === 'Low'
            ? 'bg-gray-100 text-gray-700 border-gray-200'
            : 'bg-blue-50 text-blue-700 border-blue-200';

        const teamList = Array.isArray(p.team) ? p.team : [];
        const checkpointsList = Array.isArray(p.checkpoints) ? p.checkpoints : [];
        const doneCount = checkpointsList.filter(c => c.isCompleted).length;
        const totalCount = checkpointsList.length;
        const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        const deliverable = p.deliverableUrl || p.techStack;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200/90 animate-in fade-in zoom-in-95 duration-200 my-8 space-y-4 text-left">
              
              {/* Header Badges & Close */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200 tracking-wide">
                    {p.code}
                  </span>
                  {(() => {
                    const badge = getEntityBadge(p);
                    return (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider border ${badge.className}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${priorityColor}`}>
                    {p.priority === 'Urgent' ? 'P1' : p.priority === 'High' ? 'P2' : p.priority === 'Low' ? 'P4' : 'P3'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProjectForView(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {p.name}
              </h2>

              {/* Project Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                  PROJECT DESCRIPTION
                </span>
                {p.description && p.description.trim() ? (
                  <div className="pt-1">
                    <MarkdownViewer content={p.description} />
                  </div>
                ) : (
                  <p className="text-xs font-medium text-gray-400 italic">No description added yet.</p>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* 2-Column Grid: Lead, Target Deadline, Created At, Created By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Project Lead */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>PROJECT LEAD</span>
                  </div>
                  <div className="text-xs font-bold text-gray-800">
                    {p.lead && p.lead.trim() ? (
                      p.lead
                    ) : (
                      <span className="italic font-normal text-gray-400">No lead assigned</span>
                    )}
                  </div>
                </div>

                {/* Target Deadline */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>TARGET DEADLINE</span>
                  </div>
                  <div className="text-xs font-bold text-gray-800">
                    {p.targetDate && p.targetDate.trim() ? (
                      p.targetDate
                    ) : (
                      <span className="italic font-normal text-gray-400">Not set</span>
                    )}
                  </div>
                </div>

                {/* Created At */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>CREATED AT</span>
                  </div>
                  <div className="text-xs font-bold text-gray-800">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                  </div>
                </div>

                {/* Created By (Right Below Created At) */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CREATED BY</span>
                  </div>
                  <div className="text-xs font-bold text-gray-800">
                    {p.createdByName || p.lead || 'Admin'}
                  </div>
                </div>
              </div>

              {/* Deliverable URL(s) / Links */}
              <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>DELIVERABLE URL(S) / LINKS</span>
                </div>
                <div>
                  {deliverable && deliverable.trim() ? (
                    deliverable.startsWith('http') ? (
                      <a
                        href={deliverable}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 break-all"
                      >
                        <span>{deliverable}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-gray-800 break-all">{deliverable}</span>
                    )
                  ) : (
                    <span className="text-xs italic font-normal text-gray-400">No links added yet.</span>
                  )}
                </div>
              </div>

              {/* Assigned Team */}
              <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>ASSIGNED TEAM ({teamList.length})</span>
                </div>
                {teamList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {teamList.map((m: string) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 shadow-2xs"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic font-normal text-gray-400">No team members assigned yet.</span>
                )}
              </div>

              {/* Checkpoint Checklist Box (Application Clean Emerald Theme) */}
              <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <ListChecks className="w-4 h-4 text-emerald-600" />
                    <span>Checkpoint checklist</span>
                  </div>
                  {checkpointsList.length > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {doneCount} of {totalCount} done ({pct}%)
                    </span>
                  )}
                </div>

                {checkpointsList.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {checkpointsList.map((chk) => (
                      <label
                        key={chk.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition-colors ${
                          chk.isCompleted
                            ? 'bg-emerald-100/60 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-white border-emerald-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={chk.isCompleted}
                            disabled={isEmployee}
                            onChange={() => {
                              if (isEmployee) return;
                              handleToggleProjectCardCheckpoint(p.id, chk.id);
                              setSelectedProjectForView(prev => {
                                if (!prev) return null;
                                const updated = (prev.checkpoints || []).map(c =>
                                  c.id === chk.id ? { ...c, isCompleted: !c.isCompleted } : c
                                );
                                return { ...prev, checkpoints: updated };
                              });
                            }}
                            className={`w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 ${
                              isEmployee ? 'cursor-default' : 'cursor-pointer'
                            }`}
                          />
                          <span className={chk.isCompleted ? 'line-through text-gray-400' : ''}>
                            {chk.title}
                          </span>
                        </div>
                        {chk.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800/80 italic font-medium">
                    No checkpoints defined for this project.
                  </p>
                )}
              </div>

              {/* Audit History Action */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setHistoryTarget({
                    recordId: p.id,
                    title: p.name,
                    code: p.code,
                  })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View Full Audit History</span>
                </button>
              </div>

              {/* Recent Activity Section */}
              <RecentActivitySection
                tableName="projects"
                recordId={p.id}
                onOpenHistory={() => setHistoryTarget({
                  recordId: p.id,
                  title: p.name,
                  code: p.code,
                })}
              />

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                {!isEmployee ? (
                  <button
                    type="button"
                    onClick={() => {
                      const current = selectedProjectForView;
                      setSelectedProjectForView(null);
                      if (current) handleCloneProject(current);
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Clone project</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedProjectForView(null)}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    Close
                  </button>

                  {selectedProjectForView && canEditProject(selectedProjectForView) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedProjectForView) handleEditProject(selectedProjectForView);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-white" />
                      <span>Edit project</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Record History Slide-Over Drawer */}
      {historyTarget && (
        <RecordHistoryPanel
          isOpen={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          tableName="projects"
          recordId={historyTarget.recordId}
          title={historyTarget.title}
          code={historyTarget.code}
        />
      )}
    </div>
  );
};
