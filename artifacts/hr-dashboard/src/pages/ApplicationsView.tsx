import React, { useState } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { RichTextEditor } from '../components/RichTextEditor';

export interface ApplicationItem {
  id: string;
  title: string;
  urlLink: string;
  entity?: 'EHM' | 'CAG';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reviewingLead: string;
  assignedTo: string;
  status: 'In Progress' | 'Done' | 'Pending' | 'Delayed';
  statusReason?: string;
  description: string;
  createdAt: string;
}

export interface ProjectCheckpoint {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  entity: 'EHM' | 'CAG';
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
  milestonesCount: number;
  description: string;
  checkpoints?: ProjectCheckpoint[];
}

export const ApplicationsView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();

  // Top Level View: 'PROJECTS'
  const [activeMainTab] = useState<'PROJECTS'>('PROJECTS');

  // Sub-Tabs for Active vs Archived Items
  const [appSubTab, setAppSubTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [projectSubTab, setProjectSubTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Modals & Search State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [selectedAppToUpdate, setSelectedAppToUpdate] = useState<ApplicationItem | null>(null);
  const [selectedProjectToUpdate, setSelectedProjectToUpdate] = useState<ProjectItem | null>(null);
  const [selectedProjectForView, setSelectedProjectForView] = useState<ProjectItem | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isEmployee = user?.role === 'EMPLOYEE';

  // Add Application Form State
  const [title, setTitle] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [reviewingLead, setReviewingLead] = useState('Dr. Harshit Mishra');
  const [assignedTo, setAssignedTo] = useState(user?.name || 'Priyanka Sharma');
  const [description, setDescription] = useState('');

  // Status Update Modal State for Applications
  const [updateStatus, setUpdateStatus] = useState<'In Progress' | 'Done' | 'Pending' | 'Delayed'>('In Progress');
  const [statusReason, setStatusReason] = useState('');

  // Status Update Modal State for Projects
  const [updateProjectStatus, setUpdateProjectStatus] = useState<'Planning' | 'Active' | 'In Review' | 'Completed'>('Active');

  // Add Project Form State (Basic Information & Checkpoints)
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projectEntity, setProjectEntity] = useState<'EHM' | 'CAG'>('EHM');
  const [projectCategory, setProjectCategory] = useState('Environmental Compliance');
  const [projectLead, setProjectLead] = useState('Dr. Harshit Mishra');
  const [projectTeam, setProjectTeam] = useState('Ashutosh Mishra, Priyanka Sharma');
  const [projectBudget] = useState('$45,000');
  const [projectStartDate, setProjectStartDate] = useState('2026-09-01');
  const [projectTargetDate, setProjectTargetDate] = useState('2026-12-15');
  const [projectPriority, setProjectPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [projectTechStack, setProjectTechStack] = useState('React, Node.js, Python, GIS');
  const [projectDescription, setProjectDescription] = useState('');

  // Checkpoints Checklist Form State
  const [projectChecklists, setProjectChecklists] = useState<ProjectCheckpoint[]>([]);
  const [newCheckpointText, setNewCheckpointText] = useState('');

  // Multi-select Team Members State
  const [selectedTeamMemberNames, setSelectedTeamMemberNames] = useState<string[]>([
    'Ashutosh Mishra',
    'Priyanka Sharma',
  ]);

  // Project Clone & Comments Modal State
  const [isProjectClone, setIsProjectClone] = useState(false);
  const [cloneSourceProjectId, setCloneSourceProjectId] = useState('');
  const [projectComments, setProjectComments] = useState<{ id: string; authorName: string; content: string; createdAt: string; isSystemLog?: boolean }[]>([]);
  const [newProjectCommentText, setNewProjectCommentText] = useState('');

  const TEAM_MEMBERS_LIST = [
    { id: 'tm-1', name: 'Ashutosh Mishra', code: 'EHM-EMP01' },
    { id: 'tm-2', name: 'Priyanka Sharma', code: 'EHM-EMP02' },
    { id: 'tm-3', name: 'Prerna Shukla', code: 'EHM-EMP03' },
    { id: 'tm-4', name: 'Himanshu Tiwari', code: 'CAG-EMP01' },
    { id: 'tm-5', name: 'Utkarsh Mishra', code: 'EHM-EMP04' },
    { id: 'tm-6', name: 'Shreyansh Siladar', code: 'CAG-EMP02' },
    { id: 'tm-7', name: 'Dr. Utsav Mishra', code: 'CAG-EMP03' },
    { id: 'tm-8', name: "Tarul Ma'am", code: 'EHM-EMP06' },
  ];

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

  const handleToggleProjectCardCheckpoint = (projectId: string, checkpointId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const updated = (p.checkpoints || []).map(c =>
          c.id === checkpointId ? { ...c, isCompleted: !c.isCompleted } : c
        );
        return {
          ...p,
          checkpoints: updated,
          milestonesCount: updated.length,
        };
      })
    );
  };

  // Applications List Data
  const [applications, setApplications] = useState<ApplicationItem[]>([
    {
      id: 'app-1',
      title: 'Google - Frontend Developer',
      urlLink: 'https://careers.google.com/jobs/results/12345',
      entity: 'EHM',
      priority: 'High',
      reviewingLead: 'Dr. Harshit Mishra',
      assignedTo: 'Priyanka Sharma',
      status: 'In Progress',
      description: 'Submitted resume and portfolio. Technical phone screen scheduled for next Tuesday.',
      createdAt: '2026-08-28',
    },
    {
      id: 'app-2',
      title: 'Microsoft - Cloud Solutions Lead',
      urlLink: 'https://careers.microsoft.com/us/en/job/67890',
      entity: 'EHM',
      priority: 'Urgent',
      reviewingLead: 'Neha Shukla',
      assignedTo: 'Priyanka Sharma',
      status: 'Pending',
      statusReason: 'Awaiting talent acquisition HR partner confirmation call',
      description: 'Internal referral submitted by Neha. Manager assigned this to Priyanka.',
      createdAt: '2026-08-30',
    },
    {
      id: 'app-3',
      title: 'CliAgro Systems - Senior IoT Architect',
      urlLink: 'https://climagroanalytics.com/careers/iot-arch',
      entity: 'CAG',
      priority: 'Medium',
      reviewingLead: 'Dr. Utsav Mishra',
      assignedTo: 'Prerna Shukla',
      status: 'Done',
      description: 'Offer letter signed & accepted. Onboarding set for 1st of September.',
      createdAt: '2026-08-31',
    },
  ]);

  // Projects List Data
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'prj-1',
      code: 'EHM-PRJ-2026-01',
      name: 'Solar Farm Carbon & Environmental Audit',
      entity: 'EHM',
      entityName: 'ehmconsultancy',
      category: 'Environmental Compliance',
      lead: 'Dr. Harshit Mishra',
      team: ['Priyanka Sharma', 'Prerna Shukla'],
      budget: '$45,000',
      startDate: '2026-09-01',
      targetDate: '2026-12-15',
      status: 'Active',
      priority: 'High',
      techStack: 'Python, GIS Satellites, Carbon Metrics DB',
      milestonesCount: 4,
      description: 'Comprehensive carbon footprint audit and sustainability reporting for Gujarat solar installations.',
      checkpoints: [
        { id: 'c1', title: 'Carbon Audit Framework Approval', isCompleted: true },
        { id: 'c2', title: 'Gujarat Field Telemetry & Solar Data Collection', isCompleted: true },
        { id: 'c3', title: 'Satellite GIS Metrics Calibration', isCompleted: false },
        { id: 'c4', title: 'Final Environmental Compliance Delivery', isCompleted: false },
      ],
    },
    {
      id: 'prj-2',
      code: 'CAG-PRJ-2026-02',
      name: 'CliAgro IoT Telemetry & Micro-Climate Sensors',
      entity: 'CAG',
      entityName: 'climagroanalytics',
      category: 'IoT & Telemetry',
      lead: "Tarul Ma'am",
      team: ['Himanshu Tiwari', 'Dr. Utsav Mishra'],
      budget: '$68,000',
      startDate: '2026-08-15',
      targetDate: '2026-11-30',
      status: 'Active',
      priority: 'Urgent',
      techStack: 'Rust, MQTT, React, TimeSeries DB',
      milestonesCount: 4,
      description: 'Real-time soil sensor telemetry ingestion engine for precision agricultural climate dashboards.',
      checkpoints: [
        { id: 'c5', title: 'Hardware Sensor Procurement & Calibration', isCompleted: true },
        { id: 'c6', title: 'MQTT Telemetry Data Stream Ingestion', isCompleted: true },
        { id: 'c7', title: 'Micro-Climate Dashboard Analytics UI', isCompleted: true },
        { id: 'c8', title: 'Field Stress Testing & Regional Rollout', isCompleted: false },
      ],
    },
    {
      id: 'prj-3',
      code: 'CAG-PRJ-2026-03',
      name: 'Agri-Tech Soil Moisture AI Predictive Model',
      entity: 'CAG',
      entityName: 'climagroanalytics',
      category: 'AI Analytics',
      lead: 'Dr. Utsav Mishra',
      team: ['Himanshu Tiwari'],
      budget: '$32,000',
      startDate: '2026-10-01',
      targetDate: '2027-01-20',
      status: 'Planning',
      priority: 'Medium',
      techStack: 'PyTorch, FastApi, PostgreSQL, Docker',
      milestonesCount: 3,
      description: 'Predictive machine learning algorithm estimating crop yield based on micro-humidity data.',
      checkpoints: [
        { id: 'c9', title: 'Dataset Curation & Preprocessing', isCompleted: true },
        { id: 'c10', title: 'PyTorch Predictive Model Training', isCompleted: false },
        { id: 'c11', title: 'FastAPI Microservice Docker Containerization', isCompleted: false },
      ],
    },
  ]);

  const [collapsedProjectIds, setCollapsedProjectIds] = useState<Record<string, boolean>>({});

  // Scoped Applications & Active vs Archived Filtering
  const scopedApps = applications.filter(
    a => (selectedEntity === 'ALL' || a.entity === selectedEntity) && (isEmployee ? a.assignedTo === (user?.name || 'Priyanka Sharma') : true)
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

  const scopedProjects = projects.filter(p => {
    const matchesEntity = selectedEntity === 'ALL' || p.entity === selectedEntity;
    if (!isEmployee) return matchesEntity;

    const isLead = (
      (currentUserName && p.lead?.toLowerCase().includes(currentUserName)) ||
      (userFirstName && p.lead?.toLowerCase().includes(userFirstName)) ||
      (userEmail && p.lead?.toLowerCase().includes(userEmail))
    );
    const isTeamMember = Array.isArray(p.team) && p.team.some(member => {
      const mLower = member.toLowerCase();
      return (
        (currentUserName && mLower.includes(currentUserName)) ||
        (userFirstName && mLower.includes(userFirstName)) ||
        (userEmail && mLower.includes(userEmail))
      );
    });

    return matchesEntity && (isLead || isTeamMember);
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

  // Project Stats
  const totalProjectsCount = scopedProjects.length;
  const activeProjectsCount = activeProjectsList.filter(p => p.status === 'Active').length;
  const planningProjectsCount = activeProjectsList.filter(p => p.status === 'Planning' || p.status === 'In Review').length;

  const handleCloneApplication = (app: ApplicationItem) => {
    setTitle(`[CLONE] ${app.title}`);
    setUrlLink(app.urlLink);
    setPriority(app.priority);
    setReviewingLead(app.reviewingLead);
    setAssignedTo(app.assignedTo);
    setDescription(app.description);
    setShowAddModal(true);
    toast.success(`Pre-filled clone form for "${app.title}". Adjust basic info to complete!`);
  };

  const handleCloneProject = (proj: ProjectItem) => {
    setEditingProjectId(null);
    setProjectName(`[CLONE] ${proj.name}`);
    setProjectCode(`${proj.code}-CLONE`);
    setProjectEntity(proj.entity);
    setProjectCategory(proj.category);
    setProjectLead(proj.lead);
    setSelectedTeamMemberNames(proj.team);
    setProjectTeam(proj.team.join(', '));
    setProjectPriority(proj.priority);
    setProjectTechStack(proj.techStack);
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
    setProjectCategory(proj.category);
    setProjectLead(proj.lead);
    setSelectedTeamMemberNames(proj.team);
    setProjectTeam(proj.team.join(', '));
    setProjectStartDate(proj.startDate);
    setProjectTargetDate(proj.targetDate);
    setProjectPriority(proj.priority);
    setProjectTechStack(proj.techStack);
    setProjectDescription(proj.description);
    setProjectChecklists(proj.checkpoints || []);
    setIsProjectClone(false);
    setShowAddProjectModal(true);
    toast.info(`Editing project "${proj.name}". Modify parameters and click Save Changes!`);
  };

  const handleAddAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAssignee = isEmployee ? (user?.name || 'Priyanka Sharma') : assignedTo;
    const newApp: ApplicationItem = {
      id: `app-${Date.now()}`,
      title,
      urlLink,
      priority,
      reviewingLead,
      assignedTo: finalAssignee,
      status: 'In Progress',
      description,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setApplications([newApp, ...applications]);
    toast.success(`Application "${title}" created and synced with ${reviewingLead}!`);
    setShowAddModal(false);
    setTitle('');
    setUrlLink('');
    setDescription('');
  };

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedCode = projectCode || `${projectEntity}-PRJ-${new Date().getFullYear()}-0${projects.length + 1}`;

    const defaultCheckpoints: ProjectCheckpoint[] = [
      { id: `c-${Date.now()}-1`, title: 'Requirement Spec Approval', isCompleted: false },
      { id: `c-${Date.now()}-2`, title: 'Environment & Tech Stack Setup', isCompleted: false },
      { id: `c-${Date.now()}-3`, title: 'Core Deliverables Implementation', isCompleted: false },
      { id: `c-${Date.now()}-4`, title: 'QA & Final Project Delivery', isCompleted: false },
    ];

    const finalCheckpoints = projectChecklists.length > 0 ? projectChecklists : defaultCheckpoints;
    const finalTeam = selectedTeamMemberNames.length > 0
      ? selectedTeamMemberNames
      : projectTeam.split(',').map(s => s.trim()).filter(Boolean);

    if (editingProjectId) {
      setProjects(prev =>
        prev.map(p => {
          if (p.id !== editingProjectId) return p;
          const updated: ProjectItem = {
            ...p,
            code: generatedCode,
            name: projectName,
            entity: projectEntity,
            entityName: projectEntity === 'EHM' ? 'ehmconsultancy' : 'climagroanalytics',
            category: projectCategory,
            lead: projectLead,
            team: finalTeam,
            startDate: projectStartDate,
            targetDate: projectTargetDate,
            priority: projectPriority,
            techStack: projectTechStack,
            milestonesCount: finalCheckpoints.length,
            description: projectDescription,
            checkpoints: finalCheckpoints,
          };
          if (selectedProjectForView?.id === editingProjectId) {
            setSelectedProjectForView(updated);
          }
          return updated;
        })
      );
      toast.success(`Project "${projectName}" specifications updated successfully!`);
    } else {
      const newProject: ProjectItem = {
        id: `prj-${Date.now()}`,
        code: generatedCode,
        name: projectName,
        entity: projectEntity,
        entityName: projectEntity === 'EHM' ? 'ehmconsultancy' : 'climagroanalytics',
        category: projectCategory,
        lead: projectLead,
        team: finalTeam,
        budget: projectBudget,
        startDate: projectStartDate,
        targetDate: projectTargetDate,
        status: 'Planning',
        priority: projectPriority,
        techStack: projectTechStack,
        milestonesCount: finalCheckpoints.length,
        description: projectDescription,
        checkpoints: finalCheckpoints,
      };

      setProjects([newProject, ...projects]);
      toast.success(`New project "${projectName}" (${generatedCode}) created with ${finalCheckpoints.length} checkpoints!`);
    }

    setShowAddProjectModal(false);
    setEditingProjectId(null);
    setProjectName('');
    setProjectCode('');
    setProjectDescription('');
    setProjectChecklists([]);
    setNewCheckpointText('');
  };

  const handleSaveAppStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppToUpdate) return;

    if ((updateStatus === 'Pending' || updateStatus === 'Delayed') && !statusReason.trim()) {
      toast.error(`Please provide a reason why this application is ${updateStatus}!`);
      return;
    }

    setApplications(
      applications.map(a =>
        a.id === selectedAppToUpdate.id
          ? {
              ...a,
              status: updateStatus,
              statusReason: updateStatus === 'Pending' || updateStatus === 'Delayed' ? statusReason : undefined,
            }
          : a
      )
    );

    if (updateStatus === 'Done') {
      toast.success(`Application "${selectedAppToUpdate.title}" marked as Done and moved to Archived tab!`);
    } else {
      toast.success(`Application status updated to ${updateStatus}!`);
    }

    setSelectedAppToUpdate(null);
  };

  const handleSaveProjectStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectToUpdate) return;

    setProjects(
      projects.map(p =>
        p.id === selectedProjectToUpdate.id
          ? {
              ...p,
              status: updateProjectStatus,
            }
          : p
      )
    );

    if (updateProjectStatus === 'Completed') {
      toast.success(`Project "${selectedProjectToUpdate.name}" marked as Completed and moved to Archived Projects!`);
    } else {
      toast.success(`Project status updated to ${updateProjectStatus}!`);
    }

    setSelectedProjectToUpdate(null);
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Dedicated Projects Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-emerald-600" />
            <span>Projects & Specifications</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage company project proposals, technical specifications, status lifecycles, and project archives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingProjectId(null);
              setProjectName('');
              setProjectCode('');
              setProjectDescription('');
              setProjectChecklists([]);
              setSelectedTeamMemberNames(['Ashutosh Mishra', 'Priyanka Sharma']);
              setShowAddProjectModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>
      {/* PROJECTS & SPECIFICATIONS VIEW */}
      <div className="space-y-6">
        {/* Project Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
              TOTAL PROJECTS
            </span>
            <span className="text-3xl font-extrabold text-gray-900">{totalProjectsCount}</span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">
              ACTIVE PROJECTS
            </span>
            <span className="text-3xl font-extrabold text-emerald-900">{activeProjectsCount}</span>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider block mb-1">
              IN PLANNING / REVIEW
            </span>
            <span className="text-3xl font-extrabold text-blue-900">{planningProjectsCount}</span>
          </div>

          <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider block mb-1">
              COMPLETED / ARCHIVED
            </span>
            <span className="text-3xl font-extrabold text-purple-900">{archivedProjectsList.length}</span>
          </div>
        </div>

          {/* Sub-Tab Switcher for Projects: Active Projects vs Archived Projects */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-gray-200/60">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200 w-fit">
              <button
                onClick={() => setProjectSubTab('ACTIVE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  projectSubTab === 'ACTIVE' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Projects ({activeProjectsList.length})</span>
              </button>

              <button
                onClick={() => setProjectSubTab('ARCHIVED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  projectSubTab === 'ARCHIVED' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Archive className="w-3.5 h-3.5 text-gray-600" />
                <span>Archived Projects ({archivedProjectsList.length})</span>
              </button>
            </div>

            {/* Search Bar for Projects */}
            <div className="max-w-md w-full relative">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200/90 rounded-xl shadow-2xs focus-within:border-emerald-500 transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search projects by code, name, category, lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium"
                />
              </div>
            </div>
          </div>

          {/* Projects Specifications List View (Collapsible like Initiative View, Closed by default) */}
          {displayedProjectsList.length > 0 ? (
            <div className="space-y-3">
              {displayedProjectsList.map((prj) => {
                const isCollapsed = collapsedProjectIds[prj.id] !== false;
                const completedCheckpoints = prj.checkpoints ? prj.checkpoints.filter(c => c.isCompleted).length : 0;
                const totalCheckpoints = prj.checkpoints ? prj.checkpoints.length : 0;
                const checkpointPercent = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

                return (
                  <div
                    key={prj.id}
                    className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all"
                  >
                    {/* Collapsible Project Header Bar (Simple View) */}
                    <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between gap-3 select-none">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => setCollapsedProjectIds(prev => ({ ...prev, [prj.id]: !prev[prj.id] }))}
                          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors shrink-0 cursor-pointer"
                          title={isCollapsed ? 'Expand Project Details' : 'Collapse Project Details'}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>

                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 uppercase shrink-0">
                          {prj.code}
                        </span>

                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase shrink-0">
                          {(prj.entity === 'CAG' || prj.code?.startsWith('CAG') || prj.entityName?.toLowerCase().includes('cag') || prj.entityName?.toLowerCase().includes('climagro')) ? 'CLIMAGRO' : 'EHM'}
                        </span>

                        <h3 
                          onClick={() => setCollapsedProjectIds(prev => ({ ...prev, [prj.id]: !prev[prj.id] }))}
                          className="text-xs sm:text-sm font-bold text-gray-900 truncate cursor-pointer hover:text-emerald-700 transition-colors"
                        >
                          {prj.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {totalCheckpoints > 0 && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-block">
                            {completedCheckpoints} of {totalCheckpoints} Done ({checkpointPercent}%)
                          </span>
                        )}

                        {/* Interactive Status Dropdown */}
                        <select
                          value={prj.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'Planning' | 'Active' | 'In Review' | 'Completed';
                            setProjects(prev => prev.map(p => p.id === prj.id ? { ...p, status: newStatus } : p));
                            toast.success(`Project "${prj.name}" status updated to ${newStatus}!`);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border outline-none cursor-pointer transition-all shadow-2xs ${
                            prj.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : prj.status === 'Planning'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : prj.status === 'In Review'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                          }`}
                          title="Change Project Status"
                        >
                          <option value="Active">🔄 In Progress</option>
                          <option value="In Review">🔍 Reviewing</option>
                          <option value="Planning">📋 Planned</option>
                          <option value="Completed">✅ Completed</option>
                        </select>

                        {/* View Details Icon Button */}
                        <button
                          onClick={() => setSelectedProjectForView(prj)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                          title="View Full Project Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Project Details Body */}
                    {!isCollapsed && (
                      <div className="p-4 space-y-3 bg-white border-t border-gray-100">
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{prj.description}</p>

                        {/* Basic Information Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Tag className="w-3 h-3 text-emerald-600" /> Category
                            </span>
                            <span className="font-semibold text-gray-800 block">{prj.category}</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <User className="w-3 h-3 text-indigo-600" /> Project Lead
                            </span>
                            <span className="font-bold text-indigo-700 block">{prj.lead}</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-600" /> Target Deadline
                            </span>
                            <span className="font-semibold text-gray-800 block">{prj.targetDate}</span>
                          </div>
                        </div>

                        {/* Tech Stack & Team Info */}
                        <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-gray-500 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-purple-600" /> Tech Stack / Deliverables:
                            </span>
                            <span className="font-extrabold text-purple-700">{prj.techStack}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-600">
                            <span>Assigned Team ({prj.team.length}):</span>
                            <span className="font-semibold">{prj.team.join(', ')}</span>
                          </div>
                        </div>

                        {/* Checkpoints & Milestones Checklist Section */}
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
                              {prj.checkpoints.map(chk => (
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
                                      checked={chk.isCompleted}
                                      onChange={() => handleToggleProjectCardCheckpoint(prj.id, chk.id)}
                                      className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
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
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-white border border-gray-200/80 rounded-2xl">
              <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-600">
                {projectSubTab === 'ARCHIVED' ? 'No archived projects found.' : 'No active projects found.'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {projectSubTab === 'ARCHIVED'
                  ? 'Projects marked as "Completed" will automatically appear here.'
                  : 'Click "+ Add New Project" above to create a project specification.'}
              </p>
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
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead</label>
                  <select
                    value={reviewingLead}
                    onChange={(e) => setReviewingLead(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Dr. Harshit Mishra">Dr. Harshit Mishra</option>
                    <option value="Neha Shukla">Neha Shukla</option>
                    <option value="Utsav Mishra">Utsav Mishra</option>
                    <option value="Jitendra Sir">Jitendra Sir</option>
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
                    <option value="Ashutosh Mishra">Ashutosh Mishra</option>
                    <option value="Priyanka Sharma">Priyanka Sharma</option>
                    <option value="Utkarsh Mishra">Utkarsh Mishra</option>
                    <option value="Prerna Shukla">Prerna Shukla</option>
                    <option value="Shreyansh Siladar">Shreyansh Siladar</option>
                    <option value="Tarul Ma'am">Tarul Ma'am</option>
                    <option value="Dr. Harshit Mishra">Dr. Harshit Mishra</option>
                    <option value="Neha Shukla">Neha Shukla</option>
                    <option value="Dr. Utsav Mishra">Dr. Utsav Mishra</option>
                    <option value="Jitendra Sir">Jitendra Sir</option>
                    <option value="Pranshu Dubey">Pranshu Dubey</option>
                    <option value="Himanshu Tiwari">Himanshu Tiwari</option>
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

                {/* Assign Team Members (Multi-Select Enabled) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Assign Team Members * (Multi-Select Enabled)
                  </label>
                  <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50 space-y-1.5">
                    {TEAM_MEMBERS_LIST.map((emp) => {
                      const isChecked = selectedTeamMemberNames.includes(emp.name);
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
                                  setSelectedTeamMemberNames(selectedTeamMemberNames.filter(n => n !== emp.name));
                                } else {
                                  setSelectedTeamMemberNames([...selectedTeamMemberNames, emp.name]);
                                }
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span>{emp.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">{emp.code}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Reviewing Lead / Manager */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Project Lead / Manager *</label>
                  <select
                    required
                    value={projectLead}
                    onChange={(e) => setProjectLead(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="Dr. Harshit Mishra">Dr. Harshit Mishra (VP Tech & Lead)</option>
                    <option value="Neha Shukla">Neha Shukla (HR & Delivery Manager)</option>
                    <option value="Dr. Utsav Mishra">Dr. Utsav Mishra (AI & Research Lead)</option>
                    <option value="Tarul Ma'am">Tarul Ma'am (Operations Lead)</option>
                    <option value="Jitendra Sir">Jitendra Sir (Governance & Grants)</option>
                  </select>
                </div>

                {/* Company Entity & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Company / Entity</label>
                    <select
                      value={projectEntity}
                      onChange={(e) => setProjectEntity(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold cursor-pointer"
                    >
                      <option value="EHM">EHM (EHM Consultancy)</option>
                      <option value="CAG">CLIMAGRO (CliAgro Systems)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Category / Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. Environmental Compliance"
                      value={projectCategory}
                      onChange={(e) => setProjectCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                    />
                  </div>
                </div>

                {/* Timeline Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={projectStartDate}
                      onChange={(e) => setProjectStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Target Completion Date</label>
                    <input
                      type="date"
                      value={projectTargetDate}
                      onChange={(e) => setProjectTargetDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                    />
                  </div>
                </div>

                {/* Tech Stack & Key Tools */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Tech Stack & Key Tools</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Python, GIS, PostgreSQL"
                    value={projectTechStack}
                    onChange={(e) => setProjectTechStack(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
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

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-gray-400 self-center">Quick Add:</span>
                    {[
                      'Requirement Spec Approval',
                      'System Architecture Setup',
                      'Environment & DB Setup',
                      'QA & Testing Delivery',
                      'Final Client Sign-off',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddProjectCheckpoint(preset)}
                        className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  {/* Checkpoints items list */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {projectChecklists.length === 0 ? (
                      <div className="py-3 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No subtasks added yet. Add one below!
                      </div>
                    ) : (
                      projectChecklists.map((item) => (
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
                              onChange={() => {
                                setProjectChecklists(
                                  projectChecklists.map((c) =>
                                    c.id === item.id ? { ...c, isCompleted: !c.isCompleted } : c
                                  )
                                );
                              }}
                              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                              {item.title}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveProjectCheckpoint(item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-200 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                  
                  {/* Template Cloning Box */}
                  <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200/80 space-y-2.5 shrink-0">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isProjectClone}
                        onChange={(e) => {
                          setIsProjectClone(e.target.checked);
                          if (!e.target.checked) setCloneSourceProjectId('');
                        }}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-purple-950 block">Make Clone / Duplicate Copy</span>
                        <p className="text-[10px] text-purple-700 font-semibold leading-snug">
                          Check this box to duplicate an existing project or pre-fill parameters directly inside this form.
                        </p>
                      </div>
                    </label>

                    {isProjectClone && (
                      <div className="pt-2 border-t border-purple-200/60 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-purple-900 mb-1">
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
                              setProjectCategory(source.category);
                              setProjectLead(source.lead);
                              setSelectedTeamMemberNames(source.team);
                              setProjectTechStack(source.techStack);
                              setProjectDescription(source.description);
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
                    className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {editingProjectId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingProjectId ? 'Save Changes' : 'Save New Project'}</span>
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
      {selectedProjectForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 my-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 uppercase">
                    {selectedProjectForView.code}
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    {selectedProjectForView.entityName}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {selectedProjectForView.priority} Priority
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight pt-1">
                  {selectedProjectForView.name}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isEmployee && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedProjectForView) handleEditProject(selectedProjectForView);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Edit Project Specifications"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-white" />
                    <span>Edit Project</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProjectForView(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Project Description
                  </h4>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                    {selectedProjectForView.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" /> Category
                    </span>
                    <span className="font-bold text-gray-800 block">{selectedProjectForView.category}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                      <User className="w-3 h-3 text-indigo-600" /> Project Lead
                    </span>
                    <span className="font-bold text-indigo-700 block">{selectedProjectForView.lead}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" /> Target Deadline
                    </span>
                    <span className="font-semibold text-gray-800 block">{selectedProjectForView.targetDate}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Start Date
                    </span>
                    <span className="font-semibold text-gray-800 block">{selectedProjectForView.startDate}</span>
                  </div>
                </div>

                <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" /> Tech Stack & Deliverables
                    </span>
                  </div>
                  <p className="font-extrabold text-purple-800">{selectedProjectForView.techStack}</p>
                  <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[11px] text-purple-950 font-medium">
                    <span>Assigned Team ({selectedProjectForView.team.length}):</span>
                    <span className="font-bold">{selectedProjectForView.team.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Checkpoints & Live Interactions */}
              <div className="space-y-4">
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-gray-800 flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
                      <span>Checkpoint Checklist</span>
                    </span>
                    {selectedProjectForView.checkpoints && selectedProjectForView.checkpoints.length > 0 && (() => {
                      const doneCount = selectedProjectForView.checkpoints.filter(c => c.isCompleted).length;
                      const totalCount = selectedProjectForView.checkpoints.length;
                      const pct = Math.round((doneCount / totalCount) * 100);
                      return (
                        <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-extrabold text-[11px]">
                          {doneCount} / {totalCount} ({pct}%)
                        </span>
                      );
                    })()}
                  </div>

                  {selectedProjectForView.checkpoints && selectedProjectForView.checkpoints.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedProjectForView.checkpoints.map((chk) => (
                        <label
                          key={chk.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            chk.isCompleted
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={chk.isCompleted}
                              onChange={() => {
                                handleToggleProjectCardCheckpoint(selectedProjectForView.id, chk.id);
                                setSelectedProjectForView(prev => {
                                  if (!prev) return null;
                                  const updated = (prev.checkpoints || []).map(c =>
                                    c.id === chk.id ? { ...c, isCompleted: !c.isCompleted } : c
                                  );
                                  return { ...prev, checkpoints: updated };
                                });
                              }}
                              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className={chk.isCompleted ? 'line-through text-gray-400' : ''}>
                              {chk.title}
                            </span>
                          </div>
                          {chk.isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium py-4 text-center">No checkpoints defined for this project.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {!isEmployee && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedProjectForView) handleEditProject(selectedProjectForView);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Project</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const current = selectedProjectForView;
                      setSelectedProjectForView(null);
                      if (current) handleCloneProject(current);
                    }}
                    className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Clone Project</span>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForView(null)}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
