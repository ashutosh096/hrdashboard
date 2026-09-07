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
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';

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
}

export const ApplicationsView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();

  // Top Level Toggle: 'APPLICATIONS' or 'PROJECTS'
  const [activeMainTab, setActiveMainTab] = useState<'APPLICATIONS' | 'PROJECTS'>('APPLICATIONS');

  // Sub-Tabs for Active vs Archived Items
  const [appSubTab, setAppSubTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [projectSubTab, setProjectSubTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Modals & Search State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [selectedAppToUpdate, setSelectedAppToUpdate] = useState<ApplicationItem | null>(null);
  const [selectedProjectToUpdate, setSelectedProjectToUpdate] = useState<ProjectItem | null>(null);
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

  // Add Project Form State (Basic Information)
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
      milestonesCount: 5,
      description: 'Comprehensive carbon footprint audit and sustainability reporting for Gujarat solar installations.',
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
      milestonesCount: 8,
      description: 'Real-time soil sensor telemetry ingestion engine for precision agricultural climate dashboards.',
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
      milestonesCount: 4,
      description: 'Predictive machine learning algorithm estimating crop yield based on micro-humidity data.',
    },
  ]);

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
  const scopedProjects = projects.filter(p => selectedEntity === 'ALL' || p.entity === selectedEntity);
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
    setProjectName(`[CLONE] ${proj.name}`);
    setProjectCode(`${proj.code}-CLONE`);
    setProjectEntity(proj.entity);
    setProjectCategory(proj.category);
    setProjectLead(proj.lead);
    setProjectTeam(proj.team.join(', '));
    setProjectPriority(proj.priority);
    setProjectTechStack(proj.techStack);
    setProjectDescription(proj.description);
    setShowAddProjectModal(true);
    toast.success(`Pre-filled clone form for project "${proj.name}". Adjust basic info to complete!`);
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
    const newProject: ProjectItem = {
      id: `prj-${Date.now()}`,
      code: generatedCode,
      name: projectName,
      entity: projectEntity,
      entityName: projectEntity === 'EHM' ? 'ehmconsultancy' : 'climagroanalytics',
      category: projectCategory,
      lead: projectLead,
      team: projectTeam.split(',').map(s => s.trim()).filter(Boolean),
      budget: projectBudget,
      startDate: projectStartDate,
      targetDate: projectTargetDate,
      status: 'Planning',
      priority: projectPriority,
      techStack: projectTechStack,
      milestonesCount: 4,
      description: projectDescription,
    };

    setProjects([newProject, ...projects]);
    toast.success(`New project "${projectName}" (${generatedCode}) created!`);
    setShowAddProjectModal(false);
    setProjectName('');
    setProjectCode('');
    setProjectDescription('');
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
      {/* Top Header & Main Toggle Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Applications & Project Specifications</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage job/work applications, project proposals, status lifecycles, and archived items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Top Toggle Group: Job Applications vs Projects */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-2xs">
            <button
              onClick={() => setActiveMainTab('APPLICATIONS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeMainTab === 'APPLICATIONS' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Applications</span>
            </button>

            <button
              onClick={() => setActiveMainTab('PROJECTS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeMainTab === 'PROJECTS' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projects & Basic Info</span>
            </button>
          </div>

          {activeMainTab === 'APPLICATIONS' ? (
            <button
              onClick={() => {
                setAssignedTo(user?.name || 'Priyanka Sharma');
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab 1: APPLICATIONS VIEW */}
      {activeMainTab === 'APPLICATIONS' && (
        <div className="space-y-6">
          {/* 4 Stat Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
              <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                MY APPLICATIONS
              </span>
              <span className="text-3xl font-extrabold text-gray-900">{totalAppsCount}</span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-2xs">
              <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
                HIGH / URGENT
              </span>
              <span className="text-3xl font-extrabold text-amber-900">{highPriorityAppsCount}</span>
            </div>

            <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-5 shadow-2xs">
              <span className="text-[11px] font-extrabold text-red-700 uppercase tracking-wider block mb-1">
                PENDING / DELAYED
              </span>
              <span className="text-3xl font-extrabold text-red-900">{pendingAppsCount}</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 shadow-2xs">
              <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">
                REVIEWED BY LEADS
              </span>
              <span className="text-3xl font-extrabold text-emerald-900">2</span>
            </div>
          </div>

          {/* Sub-Tab Filter Bar (Active Applications vs Archived / Completed) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-gray-200/60">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200 w-fit">
              <button
                onClick={() => setAppSubTab('ACTIVE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  appSubTab === 'ACTIVE' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Active Applications ({activeAppsList.length})</span>
              </button>

              <button
                onClick={() => setAppSubTab('ARCHIVED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  appSubTab === 'ARCHIVED' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Archive className="w-3.5 h-3.5 text-emerald-600" />
                <span>Archived / Completed ({archivedAppsList.length})</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="max-w-md w-full relative">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200/90 rounded-xl shadow-2xs focus-within:border-indigo-500 transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search applications by title, notes, lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium"
                />
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
            {displayedAppsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Application Title</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Reviewing Lead</th>
                      <th className="py-3 px-3">Applicant / Assigned To</th>
                      <th className="py-3 px-3">Description & Reason Notes</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                    {displayedAppsList.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-3">
                          <span className="font-bold text-gray-900 block text-sm">{app.title}</span>
                          {app.urlLink && (
                            <a
                              href={app.urlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold mt-0.5"
                            >
                              <span>{app.urlLink}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                app.status === 'Done'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : app.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : app.status === 'Delayed'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}
                            >
                              {app.status}
                            </span>
                            {app.statusReason && (
                              <span className="text-[10px] text-amber-800 font-semibold block italic max-w-[140px] truncate">
                                Reason: {app.statusReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              app.priority === 'Urgent'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : app.priority === 'High'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {app.priority}
                          </span>
                        </td>
                        <td className="py-4 px-3 font-semibold text-gray-800">{app.reviewingLead}</td>
                        <td className="py-4 px-3 font-bold text-indigo-700">
                          <div className="flex items-center gap-1.5 pt-1">
                            <User className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{app.assignedTo}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-gray-600 font-normal max-w-xs">
                          <p className="truncate">{app.description}</p>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isEmployee && (
                              <button
                                onClick={() => handleCloneApplication(app)}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                📋 Clone
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedAppToUpdate(app);
                                setUpdateStatus(app.status);
                                setStatusReason(app.statusReason || '');
                              }}
                              className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Update Status</span>
                            </button>

                            {app.urlLink && (
                              <a
                                href={app.urlLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Open
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-gray-600">
                  {appSubTab === 'ARCHIVED' ? 'No archived applications found.' : 'No active applications assigned or found.'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {appSubTab === 'ARCHIVED'
                    ? 'Applications marked as "Done" will automatically appear here.'
                    : 'Click "+ Add Application" above to track a new application.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Tab 2: PROJECTS & BASIC INFORMATION VIEW */}
      {activeMainTab === 'PROJECTS' && (
        <div className="space-y-6">
          {/* Project Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          {/* Projects Specifications Cards */}
          {displayedProjectsList.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayedProjectsList.map((prj) => (
                <div
                  key={prj.id}
                  className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 uppercase">
                            {prj.code}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                            {prj.entityName}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900">{prj.name}</h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            prj.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : prj.status === 'Planning'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : prj.status === 'In Review'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {prj.status}
                        </span>

                        {!isEmployee && (
                          <button
                            onClick={() => handleCloneProject(prj)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Quick Clone Project"
                          >
                            📋 Clone
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedProjectToUpdate(prj);
                            setUpdateProjectStatus(prj.status);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Update Status"
                        >
                          <Edit3 className="w-3 h-3 text-emerald-600" />
                          <span>Status</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 font-medium line-clamp-2">{prj.description}</p>

                    {/* Basic Information Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-xs">
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
                  </div>
                </div>
              ))}
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
      )}

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

      {/* Add New Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Project (Basic Information)</h3>
                <p className="text-xs text-gray-500">Configure key project specs, timeline dates, lead, and team setup.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar Energy Audit"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Project Code</label>
                  <input
                    type="text"
                    placeholder="e.g. EHM-PRJ-2026-04"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company / Entity</label>
                  <select
                    value={projectEntity}
                    onChange={(e) => setProjectEntity(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EHM">ehmconsultancy</option>
                    <option value="CAG">climagroanalytics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category / Domain</label>
                  <input
                    type="text"
                    placeholder="e.g. Environmental Compliance"
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Project Lead</label>
                <select
                  value={projectLead}
                  onChange={(e) => setProjectLead(e.target.value)}
                  className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Dr. Harshit Mishra">Dr. Harshit Mishra</option>
                  <option value="Neha Shukla">Neha Shukla</option>
                  <option value="Utsav Mishra">Utsav Mishra</option>
                  <option value="Jitendra Sir">Jitendra Sir</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={projectStartDate}
                    onChange={(e) => setProjectStartDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={projectTargetDate}
                    onChange={(e) => setProjectTargetDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tech Stack & Key Tools</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, GIS, PostgreSQL"
                  value={projectTechStack}
                  onChange={(e) => setProjectTechStack(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Project Overview & Deliverables</label>
                <textarea
                  rows={3}
                  placeholder="Enter project summary, scope, and key deliverables..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save New Project
                </button>
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
    </div>
  );
};
