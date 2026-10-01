import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  FileText,
  Users,
  Crown,
  Briefcase,
  CheckSquare,
  Download,
  Target,
  FolderKanban,
  Clock,
  Zap,
  HelpCircle,
  Check,
  ArrowDown,
  Compass,
  Lightbulb,
  CheckCheck,
  Calendar,
  Eye,
  Lock,
  ChevronRight,
  ChevronDown,
  Activity,
  Award,
  Workflow,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { ExportReportModal } from '../components/ExportReportModal';

type ActiveRoleTab = 'my_role' | 'compare_all' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
type MainCategory = 'all' | 'hierarchy' | 'sprints' | 'tasks' | 'governance';
type FlowViewMode = 'pipeline' | 'tree';

interface FlowStep {
  step: number;
  level: string;
  name: string;
  question: string;
  role: string;
  roleIcon: string;
  colorName: 'purple' | 'emerald' | 'blue' | 'amber' | 'teal' | 'rose' | 'cyan';
  borderClass: string;
  bgLightClass: string;
  accentBarClass: string;
  badgeClass: string;
  textClass: string;
  exampleName: string;
  exampleDesc: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    step: 1,
    level: 'Objective',
    name: 'INITIATIVE',
    question: 'Why are we doing this?',
    role: 'Leadership / Admin',
    roleIcon: '👑',
    colorName: 'emerald',
    borderClass: 'border-emerald-200 hover:border-emerald-400',
    bgLightClass: 'bg-emerald-50/50',
    accentBarClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    textClass: 'text-emerald-700',
    exampleName: 'EHM Agra City – Proposal Dev & Govt Engagement',
    exampleDesc: 'Highest strategic company objective (Leadership / Admin)',
  },
  {
    step: 2,
    level: 'Workstream',
    name: 'EPIC',
    question: 'What major workstream?',
    role: 'Manager / Lead',
    roleIcon: '👔',
    colorName: 'blue',
    borderClass: 'border-blue-200 hover:border-blue-400',
    bgLightClass: 'bg-blue-50/50',
    accentBarClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    textClass: 'text-blue-700',
    exampleName: 'Proposal Development',
    exampleDesc: 'Major workstream under the initiative (Manager / Lead)',
  },
  {
    step: 3,
    level: 'Action',
    name: 'TASK',
    question: 'What exactly to deliver?',
    role: 'Team Assignee',
    roleIcon: '👥',
    colorName: 'amber',
    borderClass: 'border-amber-200 hover:border-amber-400',
    bgLightClass: 'bg-amber-50/50',
    accentBarClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    textClass: 'text-amber-700',
    exampleName: 'Prepare Technical Proposal',
    exampleDesc: 'Specific actionable deliverable with clear owner (Team / Assignee)',
  },
  {
    step: 4,
    level: 'Steps',
    name: 'SUBTASK',
    question: 'What smaller actions?',
    role: 'Assignee Checklist',
    roleIcon: '👥',
    colorName: 'teal',
    borderClass: 'border-teal-200 hover:border-teal-400',
    bgLightClass: 'bg-teal-50/50',
    accentBarClass: 'bg-teal-500',
    badgeClass: 'bg-teal-100 text-teal-700 border-teal-200',
    textClass: 'text-teal-700',
    exampleName: 'Collect project requirements from City Engineer',
    exampleDesc: 'Checklist action needed to complete the task (Assignee Checklist)',
  },
  {
    step: 5,
    level: 'Cycle',
    name: 'SPRINT',
    question: 'When is it executed?',
    role: '4-Week Timebox',
    roleIcon: '👔',
    colorName: 'rose',
    borderClass: 'border-rose-200 hover:border-rose-400',
    bgLightClass: 'bg-rose-50/50',
    accentBarClass: 'bg-rose-500',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    textClass: 'text-rose-700',
    exampleName: 'Current 4-week Sprint (Weeks 1–4)',
    exampleDesc: 'Time-boxed execution cycle for focused delivery (4-Week Timebox)',
  },
  {
    step: 6,
    level: 'State',
    name: 'STATUS',
    question: 'Where does it stand?',
    role: 'Everyone Updates',
    roleIcon: '👥',
    colorName: 'cyan',
    borderClass: 'border-cyan-200 hover:border-cyan-400',
    bgLightClass: 'bg-cyan-50/50',
    accentBarClass: 'bg-cyan-500',
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    textClass: 'text-cyan-700',
    exampleName: 'Backlog → Planned → In Progress → Completed',
    exampleDesc: 'Reflects true current state; never artificial (Everyone)',
  },
];

const CATEGORIES: { id: MainCategory; label: string; icon: string; shortDesc: string }[] = [
  { id: 'all', label: 'All Categories', icon: '🌟', shortDesc: 'Complete HIVE System Overview' },
  { id: 'hierarchy', label: 'Work Hierarchy & Epics', icon: '🎯', shortDesc: 'Initiatives, Epics & Tasks' },
  { id: 'sprints', label: 'Sprints & Reviews', icon: '🚀', shortDesc: '4-Week Cycles & Quality Approvals' },
  { id: 'tasks', label: 'Tasks & Subtask Checklists', icon: '✅', shortDesc: 'Deliverables & Micro Checklists' },
  { id: 'governance', label: 'Governance & Auditing', icon: '🛡️', shortDesc: '3 Roles & Responsibilities' },
];

interface RoleActionRule {
  id: string;
  category: 'hierarchy' | 'sprints' | 'tasks' | 'governance';
  categoryIcon: string;
  workArea: string;
  subArea: string;
  adminCanDo: string;
  adminAllowed: boolean;
  managerCanDo: string;
  managerAllowed: boolean;
  teamCanDo: string;
  teamAllowed: boolean;
}

const ROLE_ACTIONS_TABLE: RoleActionRule[] = [
  {
    id: 'r1',
    category: 'hierarchy',
    categoryIcon: '🎯',
    workArea: 'Strategic Initiatives',
    subArea: 'Company Goals & Targets',
    adminCanDo: 'Creates & sets top-level company goals, measurable target metrics, and brand entities.',
    adminAllowed: true,
    managerCanDo: 'Aligns workstreams to goals; tracks progress on high-level department milestones.',
    managerAllowed: true,
    teamCanDo: 'Full visibility to understand company purpose and how their work contributes.',
    teamAllowed: true,
  },
  {
    id: 'r2',
    category: 'hierarchy',
    categoryIcon: '📁',
    workArea: 'Projects & Contracts',
    subArea: 'Delivery Spaces & Clients',
    adminCanDo: 'Creates project spaces, approves client contracts, sets financials, and appoints Leads.',
    adminAllowed: true,
    managerCanDo: 'Manages project execution, coordinates team rosters, updates tech stack and deliverables.',
    managerAllowed: true,
    teamCanDo: 'Works within assigned projects and delivers deliverables according to specs.',
    teamAllowed: true,
  },
  {
    id: 'r3',
    category: 'hierarchy',
    categoryIcon: '📦',
    workArea: 'Epics & Workstreams',
    subArea: 'Major Work Packages',
    adminCanDo: 'Monitors progress across all company epics and oversees cross-team dependencies.',
    adminAllowed: true,
    managerCanDo: 'Creates & structures Epics; groups related tasks into clear, manageable packages.',
    managerAllowed: true,
    teamCanDo: 'Executes deliverables grouped inside their assigned epics.',
    teamAllowed: true,
  },
  {
    id: 'r4',
    category: 'sprints',
    categoryIcon: '🚀',
    workArea: '4-Week Sprints',
    subArea: 'Execution Iteration Cycles',
    adminCanDo: 'Reviews sprint health, overall team velocity, and on-time completion rates.',
    adminAllowed: true,
    managerCanDo: 'Plans & schedules 4-week sprints, commits tasks from backlog, and conducts reviews.',
    managerAllowed: true,
    teamCanDo: 'Commits to sprint tasks and focuses on finishing deliverables within 4 weeks.',
    teamAllowed: true,
  },
  {
    id: 'r5',
    category: 'tasks',
    categoryIcon: '✅',
    workArea: 'Daily Tasks',
    subArea: 'Actionable Deliverables',
    adminCanDo: 'Master access: can create, edit, prioritize, or reassign any task across the company.',
    adminAllowed: true,
    managerCanDo: 'Creates tasks, assigns owners, sets deadlines, priority, and designates Review Leads.',
    managerAllowed: true,
    teamCanDo: 'Creates own tasks, works on assigned tasks, and updates honest status as work advances.',
    teamAllowed: true,
  },
  {
    id: 'r6',
    category: 'tasks',
    categoryIcon: '📝',
    workArea: 'Subtask Checklists',
    subArea: 'Step-by-Step Micro Steps',
    adminCanDo: 'Full visibility into all subtasks to inspect work thoroughness across projects.',
    adminAllowed: true,
    managerCanDo: 'Reviews subtask checklists to verify tasks are broken down properly.',
    managerAllowed: true,
    teamCanDo: 'Adds step-by-step checklist items and ticks them off one-by-one as work is completed.',
    teamAllowed: true,
  },
  {
    id: 'r7',
    category: 'sprints',
    categoryIcon: '🔍',
    workArea: 'Quality Sign-Off',
    subArea: 'Review Lead Approval',
    adminCanDo: 'Has master sign-off authority across all company deliverables.',
    adminAllowed: true,
    managerCanDo: 'Acts as Reviewing Lead: inspects proof links (Canva, Drive, GitHub) and signs off.',
    managerAllowed: true,
    teamCanDo: 'Attaches proof links (Drive, GitHub, Figma) and requests manager sign-off.',
    teamAllowed: true,
  },
  {
    id: 'r8',
    category: 'governance',
    categoryIcon: '💰',
    workArea: 'Budgets & Financials',
    subArea: 'Commercials & Costs',
    adminCanDo: 'Full master control: sets contract budgets, commercial figures, and payment schedules.',
    adminAllowed: true,
    managerCanDo: 'Restricted: focuses on project deliverables, timeline, and team execution.',
    managerAllowed: false,
    teamCanDo: 'Restricted: focuses strictly on task execution and deliverable quality.',
    teamAllowed: false,
  },
  {
    id: 'r9',
    category: 'governance',
    categoryIcon: '🛡️',
    workArea: 'Audit History & Logs',
    subArea: 'Transparency & Tracking',
    adminCanDo: 'Full company audit log: sees every change with exact 12-hour timestamps and real names.',
    adminAllowed: true,
    managerCanDo: 'Tracks history and updates across assigned projects, epics, and team tasks.',
    managerAllowed: true,
    teamCanDo: 'Views history of updates on assigned tasks and subtask checklist ticks.',
    teamAllowed: true,
  },
];

export const ReportsView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [activeRoleTab, setActiveRoleTab] = useState<ActiveRoleTab>('compare_all');
  const [activeCategory, setActiveCategory] = useState<MainCategory>('all');
  const [flowViewMode, setFlowViewMode] = useState<FlowViewMode>('pipeline');
  const [selectedFlowStep, setSelectedFlowStep] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Normalize logged-in user role strictly to ADMIN, MANAGER, or EMPLOYEE
  const rawRole = (user?.role || 'ADMIN').toUpperCase();
  const currentUserRole: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' =
    rawRole === 'MANAGER' ? 'MANAGER' : rawRole === 'EMPLOYEE' ? 'EMPLOYEE' : 'ADMIN';

  const effectiveRole = activeRoleTab === 'my_role' ? currentUserRole : activeRoleTab;

  // Filtered role action rules based on category and search
  const filteredRoleActions = useMemo(() => {
    return ROLE_ACTIONS_TABLE.filter((rule) => {
      if (activeCategory !== 'all' && rule.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          rule.workArea.toLowerCase().includes(q) ||
          rule.subArea.toLowerCase().includes(q) ||
          rule.adminCanDo.toLowerCase().includes(q) ||
          rule.managerCanDo.toLowerCase().includes(q) ||
          rule.teamCanDo.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20 select-none">
      {/* 1. Header Hero Banner */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                HIVE WORKBOOK & PLAYBOOK
              </span>
              <span className="text-xs text-gray-500 font-medium">3-Role System: Admin • Manager • Team Member</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>What is HIVE & How Does Work Breakdown?</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1 max-w-3xl leading-relaxed">
              HIVE gives our company a single, clear operating system so Leadership sets the strategic goal (Initiative), Managers organize the workstreams (Epics & Sprints), and Team members execute concrete deliverables (Tasks & Subtasks).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2 text-xs font-bold text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Your Role: <strong className="text-emerald-700 uppercase">{currentUserRole === 'ADMIN' ? '👑 Admin' : currentUserRole === 'MANAGER' ? '👔 Manager' : '👥 Team Member'}</strong></span>
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title="Export Sprint Summary CSV or PDF"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>Export Reports</span>
            </button>
          </div>
        </div>

        {/* 2. Four Main Categories Switcher */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">All Categories:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-gray-50/70 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <span className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                    {cat.shortDesc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Role Column Highlight Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 scrollbar-none">
          <span className="text-[11px] font-bold text-gray-400 mr-1 shrink-0">Highlight Role:</span>
          <button
            onClick={() => setActiveRoleTab('compare_all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeRoleTab === 'compare_all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Show All 3 Roles Side-by-Side</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('ADMIN')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeRoleTab === 'ADMIN'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>👑 Focus Admin</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('MANAGER')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeRoleTab === 'MANAGER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>👔 Focus Manager</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('EMPLOYEE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeRoleTab === 'EMPLOYEE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👥 Focus Team Member</span>
          </button>
        </div>
      </div>

      {/* 4. WORK BREAKDOWN FLOW CHART (Application Colors) */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Header with Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5" />
                AGILE WORKFLOW MODEL
              </span>
              <span className="text-xs text-gray-500 font-medium">Flow Chart & Execution Map</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              The Core Work Hierarchy & Execution Flow
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Leadership sets Direction (Initiatives) ➔ Managers Plan Workstreams (Epics) ➔ Team Executes Deliverables (Tasks)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-gray-100 border border-gray-200 rounded-xl">
              <button
                type="button"
                onClick={() => setFlowViewMode('pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  flowViewMode === 'pipeline'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Step Flow Chart</span>
              </button>
              <button
                type="button"
                onClick={() => setFlowViewMode('tree')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  flowViewMode === 'tree'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hierarchy Tree Flow</span>
              </button>
            </div>
          </div>
        </div>

        {/* Flow Chart Mode: Pipeline vs Tree */}
        {flowViewMode === 'pipeline' ? (
          <div className="space-y-4">
            {/* Step-by-Step Flow Chart Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              {FLOW_STEPS.map((s, idx) => {
                const isSelected = selectedFlowStep === s.step;
                return (
                  <div
                    key={s.step}
                    onClick={() => setSelectedFlowStep(isSelected ? null : s.step)}
                    className={`relative bg-white rounded-xl border p-4 transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                      s.borderClass
                    } ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 shadow-md scale-[1.02]'
                        : 'shadow-2xs hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Top colored accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-xl ${s.accentBarClass}`} />

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.badgeClass}`}>
                          {s.step}. {s.level}
                        </span>
                        <span className="text-xs">{s.roleIcon}</span>
                      </div>

                      <div>
                        <h3 className={`text-base font-black tracking-tight ${s.textClass}`}>
                          {s.name}
                        </h3>
                        <p className="text-xs text-gray-700 font-semibold mt-0.5 leading-snug">
                          {s.question}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 font-medium truncate">{s.role}</span>
                      {idx < FLOW_STEPS.length - 1 && (
                        <div className="hidden lg:flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors shrink-0">
                          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Tree Flow Chart (Application Colors) */
          <div className="p-6 bg-slate-50/70 border border-gray-200 rounded-2xl space-y-6">
            {/* Level 1: Leadership & Strategic Direction */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full mb-2 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-emerald-700" />
                <span>LEVEL 1 • LEADERSHIP STRATEGIC GOAL</span>
              </div>
              <div className="w-full max-w-md bg-white border border-emerald-200 rounded-xl p-4 shadow-xs text-center space-y-1 relative hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 rounded-t-xl" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">1. Objective</span>
                <h4 className="text-base font-black text-gray-900">INITIATIVE</h4>
                <p className="text-xs text-gray-600 font-medium">
                  <strong>Why are we doing this?</strong> Sets high-level organizational goals & strategic outcomes.
                </p>
                <div className="text-[11px] font-bold text-emerald-700 pt-1">👑 Managed by: Leadership / Admin</div>
              </div>

              {/* Vertical Branch Down */}
              <div className="flex flex-col items-center my-1 text-gray-400">
                <div className="w-0.5 h-6 bg-gray-300" />
                <ChevronDown className="w-4 h-4 text-gray-500 -mt-1" />
                <span className="text-[10px] font-bold uppercase text-gray-400">Delegates & Scopes Work</span>
              </div>
            </div>

            {/* Level 2: Manager & Planning */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100/90 px-3 py-1 rounded-full mb-2 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                <span>LEVEL 2 • MANAGER WORKSTREAM PLANNING</span>
              </div>

              <div className="w-full max-w-md bg-white border border-blue-200 rounded-xl p-4 shadow-xs text-center space-y-1 relative hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500 rounded-t-xl" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">2. Workstream</span>
                <h4 className="text-base font-black text-gray-900">EPIC</h4>
                <p className="text-xs text-gray-600 font-medium">
                  <strong>What major workstream?</strong> Major work package under an Initiative holding multiple related tasks.
                </p>
                <div className="text-[11px] font-bold text-blue-700 pt-1">👔 Managed by: Manager / Lead</div>
              </div>

              {/* Vertical Branch Down */}
              <div className="flex flex-col items-center my-1 text-gray-400">
                <div className="w-0.5 h-6 bg-gray-300" />
                <ChevronDown className="w-4 h-4 text-gray-500 -mt-1" />
                <span className="text-[10px] font-bold uppercase text-gray-400">Broken Down into Execution</span>
              </div>
            </div>

            {/* Level 3: Team Execution */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full mb-2 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>LEVEL 3 • TEAM DELIVERABLES & CHECKLISTS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {/* Task */}
                <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs space-y-1 relative hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500 rounded-t-xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-amber-600">3. Action</span>
                    <span className="text-xs">👥</span>
                  </div>
                  <h4 className="text-base font-black text-gray-900">TASK</h4>
                  <p className="text-xs text-gray-600 font-medium">
                    <strong>What exactly to deliver?</strong> Specific actionable item with 1 owner, due date, and attached proof.
                  </p>
                  <div className="text-[11px] font-bold text-amber-700 pt-1">👥 Team Assignee</div>
                </div>

                {/* Subtask */}
                <div className="bg-white border border-teal-200 rounded-xl p-4 shadow-xs space-y-1 relative hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-500 rounded-t-xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-teal-600">4. Steps</span>
                    <span className="text-xs">👥</span>
                  </div>
                  <h4 className="text-base font-black text-gray-900">SUBTASK</h4>
                  <p className="text-xs text-gray-600 font-medium">
                    <strong>What smaller steps?</strong> Checklist items to tick off so nothing is forgotten during execution.
                  </p>
                  <div className="text-[11px] font-bold text-teal-700 pt-1">👥 Assignee Checklist</div>
                </div>
              </div>

              {/* Vertical Branch Down */}
              <div className="flex flex-col items-center my-1 text-gray-400">
                <div className="w-0.5 h-6 bg-gray-300" />
                <ChevronDown className="w-4 h-4 text-gray-500 -mt-1" />
                <span className="text-[10px] font-bold uppercase text-gray-400">Tracked in Cadence</span>
              </div>
            </div>

            {/* Level 4: Timebox & State */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-rose-800 bg-rose-100/90 px-3 py-1 rounded-full mb-2 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-rose-700" />
                <span>LEVEL 4 • 4-WEEK SPRINT CADENCE & PROGRESS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {/* Sprint */}
                <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs space-y-1 relative hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500 rounded-t-xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-rose-600">5. Cycle</span>
                    <span className="text-xs">👔</span>
                  </div>
                  <h4 className="text-base font-black text-gray-900">SPRINT</h4>
                  <p className="text-xs text-gray-600 font-medium">
                    <strong>When is it executed?</strong> 4-week iteration cycle for focused, undistracted team execution.
                  </p>
                  <div className="text-[11px] font-bold text-rose-700 pt-1">👔 4-Week Timebox</div>
                </div>

                {/* Status */}
                <div className="bg-white border border-cyan-200 rounded-xl p-4 shadow-xs space-y-1 relative hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-500 rounded-t-xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-cyan-600">6. State</span>
                    <span className="text-xs">👥</span>
                  </div>
                  <h4 className="text-base font-black text-gray-900">STATUS</h4>
                  <p className="text-xs text-gray-600 font-medium">
                    <strong>Where does it stand?</strong> Backlog ➔ Planned ➔ In Progress ➔ Completed (Honest state).
                  </p>
                  <div className="text-[11px] font-bold text-cyan-700 pt-1">👥 Everyone Updates</div>
                </div>
              </div>
            </div>

            {/* Note on Independent Projects */}
            <div className="max-w-2xl mx-auto p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-3 text-xs text-purple-900 shadow-2xs">
              <div className="p-1.5 bg-purple-100 rounded-lg text-purple-700 shrink-0">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-purple-950">Projects (Independent Delivery Workspaces): </span>
                <span className="text-purple-800">
                  Projects (such as <em>Laxmi Taal DPR</em>) are distinct delivery workspaces for client contracts. They operate in parallel to, but are separate from, the core <strong>Initiative → Epic → Task</strong> work hierarchy.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Practical Example from Current Company Work (EHM & ClimAgro) - Application Color Styling */}
        <div className="bg-slate-50/70 border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Practical Example from Current Company Work (EHM & ClimAgro):</span>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">Click any row or step above to highlight</span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-extrabold text-gray-600 bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">HIVE Level</th>
                  <th className="py-2.5 px-3">Real Project Example</th>
                  <th className="py-2.5 px-3">Why it exists & Who manages it</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {FLOW_STEPS.map((s) => {
                  const isSelected = selectedFlowStep === s.step;
                  return (
                    <tr
                      key={s.step}
                      onClick={() => setSelectedFlowStep(isSelected ? null : s.step)}
                      className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/80 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${s.badgeClass}`}>
                          {s.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        {s.exampleName}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 text-xs">
                        {s.exampleDesc} ({s.role})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Deep-Dive Content per Category */}
      {(activeCategory === 'all' || activeCategory === 'hierarchy') && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-800 font-bold">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">🎯 Work Hierarchy & Epics (Why & How)</h2>
              <p className="text-xs text-gray-500">How high-level strategy connects to daily execution.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-700" />
                <span>What is an Initiative?</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                An <strong>Initiative</strong> is the highest-level company goal (like <em>EHM Agra City – Proposal Development</em>). It explains <strong>WHY</strong> we are spending effort and sets the strategic direction.
              </p>
              <div className="text-[11px] font-bold text-emerald-800">Who manages it: Admin / Leadership</div>
            </div>

            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-2">
              <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-700" />
                <span>What is an Epic?</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                An <strong>Epic</strong> is a major workstream under an Initiative (like <em>Proposal Development</em>). It is large enough to contain multiple tasks, giving team members a clear folder for related work.
              </p>
              <div className="text-[11px] font-bold text-blue-800">Who manages it: Manager / Lead</div>
            </div>

            <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 space-y-2">
              <div className="font-extrabold text-purple-900 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-purple-700" />
                <span>What is a Project? (Separate Delivery Context)</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                A <strong>Project</strong> is a dedicated delivery workspace for client contracts & technical execution (like <em>Laxmi Taal DPR</em>). It operates independently from the strategic Initiative hierarchy.
              </p>
              <div className="text-[11px] font-bold text-purple-800">Who manages it: Project Lead & Manager</div>
            </div>
          </div>
        </div>
      )}

      {(activeCategory === 'all' || activeCategory === 'sprints') && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-800 font-bold">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">🚀 Sprints & Reviews (4-Week Iterations)</h2>
              <p className="text-xs text-gray-500">Why short cycles prevent delays and keep everyone aligned.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <strong className="text-gray-900 block text-sm">Why do we use 4-Week Sprints?</strong>
              <p className="text-gray-600 leading-relaxed">
                Instead of working towards a vague deadline months away, a 4-week sprint lets the team pick a focused batch of work, commit to finishing it, and conduct a clean demo/review at the end of 28 days.
              </p>
              <ul className="space-y-1 text-gray-600 pt-1">
                <li>• <strong>Sprint Kickoff:</strong> Select backlog tasks and agree on targets.</li>
                <li>• <strong>Execution Weeks:</strong> Focus on daily deliverables without scope creep.</li>
                <li>• <strong>Review & Close:</strong> Verify outputs and celebrate finished milestones.</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <strong className="text-gray-900 block text-sm">How Review & Sign-Off Works</strong>
              <p className="text-gray-600 leading-relaxed">
                Every task has a designated <strong>Reviewing Lead / Manager</strong>. When the assignee moves work to <em>Completed</em>, the Lead verifies the attached proof (Canva, Google Drive, GitHub, PDF) before officially approving the task.
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
                Rule: No task is marked completed without visible proof and Review Lead sign-off.
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeCategory === 'all' || activeCategory === 'tasks') && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800 font-bold">
              <CheckSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">✅ Tasks & Subtask Checklists (Execution)</h2>
              <p className="text-xs text-gray-500">The basic unit of delivery with zero ambiguity.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 space-y-2">
              <strong className="text-teal-900 block font-extrabold">What makes a Good Task?</strong>
              <p className="text-gray-600 leading-relaxed">
                A task must be clear enough that the assignee knows what to do without a meeting. It must have <strong>1 clear owner</strong>, a target <strong>due date</strong>, and an expected output.
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-2">
              <strong className="text-amber-900 block font-extrabold">Why use Subtask Checklists?</strong>
              <p className="text-gray-600 leading-relaxed">
                Large tasks can feel overwhelming. Subtasks let you list 3 to 5 micro-steps (e.g. <em>1. Collect data, 2. Draft slide, 3. Send for review</em>) and tick them off as you progress.
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <strong className="text-emerald-900 block font-extrabold">Definition of Done (DoD)</strong>
              <p className="text-gray-600 leading-relaxed">
                Work is done when: (1) deliverable meets requirements, (2) all subtasks are ticked, (3) live link is attached, and (4) reviewer has confirmed quality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. REDESIGNED ROLE RESPONSIBILITIES & ACTIONS IN TABULAR FORM (Replaces old img 1 permissions matrix) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-gray-900">
                3-Role Responsibilities & Capabilities (Tabular Form)
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Clear, simple comparison of what <strong>Admin</strong>, <strong>Manager</strong>, and <strong>Team Member</strong> can do across each area of HIVE.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search work area or actions..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 3-Role Easy Tabular Form */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-[22%]">Work Area</th>
                <th
                  className={`py-3 px-4 w-[26%] transition-colors ${
                    effectiveRole === 'ADMIN'
                      ? 'bg-amber-100/80 text-amber-900 border-x-2 border-amber-300'
                      : 'text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">👑</span>
                    <span>Admin (Leadership)</span>
                  </div>
                </th>
                <th
                  className={`py-3 px-4 w-[26%] transition-colors ${
                    effectiveRole === 'MANAGER'
                      ? 'bg-blue-100/80 text-blue-900 border-x-2 border-blue-300'
                      : 'text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">👔</span>
                    <span>Manager (Project Lead)</span>
                  </div>
                </th>
                <th
                  className={`py-3 px-4 w-[26%] transition-colors ${
                    effectiveRole === 'EMPLOYEE'
                      ? 'bg-indigo-100/80 text-indigo-900 border-x-2 border-indigo-300'
                      : 'text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">👥</span>
                    <span>Team Member (Employee)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRoleActions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Work Area Column */}
                  <td className="py-3 px-4 bg-gray-50/40 align-top">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span>{item.categoryIcon}</span>
                      <span>{item.workArea}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mt-0.5">
                      {item.subArea}
                    </span>
                  </td>

                  {/* Admin Column */}
                  <td
                    className={`py-3 px-4 align-top transition-colors ${
                      effectiveRole === 'ADMIN'
                        ? 'bg-amber-50/50 border-x-2 border-amber-200'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 leading-relaxed">
                      {item.adminAllowed ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 border border-rose-300">
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <span className={item.adminAllowed ? 'text-gray-800 font-medium' : 'text-gray-500 italic'}>
                        {item.adminCanDo}
                      </span>
                    </div>
                  </td>

                  {/* Manager Column */}
                  <td
                    className={`py-3 px-4 align-top transition-colors ${
                      effectiveRole === 'MANAGER'
                        ? 'bg-blue-50/50 border-x-2 border-blue-200'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 leading-relaxed">
                      {item.managerAllowed ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 border border-rose-300">
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <span className={item.managerAllowed ? 'text-gray-800 font-medium' : 'text-gray-500 italic'}>
                        {item.managerCanDo}
                      </span>
                    </div>
                  </td>

                  {/* Team Member Column */}
                  <td
                    className={`py-3 px-4 align-top transition-colors ${
                      effectiveRole === 'EMPLOYEE'
                        ? 'bg-indigo-50/50 border-x-2 border-indigo-200'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 leading-relaxed">
                      {item.teamAllowed ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 border border-rose-300">
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <span className={item.teamAllowed ? 'text-gray-800 font-medium' : 'text-gray-500 italic'}>
                        {item.teamCanDo}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Legend / Summary Notes */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Role Philosophy:</span>
            <span>👑 <strong>Leadership</strong> sets goals ➔ 👔 <strong>Managers</strong> plan & review ➔ 👥 <strong>Team Members</strong> execute daily deliverables.</span>
          </div>
          <span className="text-[11px] text-gray-400 font-semibold shrink-0">Intern role has been retired</span>
        </div>
      </div>

      {/* 7. Quick Working Rhythm & Definition of Done */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Daily & Weekly Working Rhythm</span>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <p><strong>☀️ Daily:</strong> Open HIVE, work on top priority task, tick off subtasks, update status when finished.</p>
            <p><strong>📅 Weekly:</strong> Check deadlines with your reviewing lead, raise blockers early, review upcoming tasks.</p>
            <p><strong>🏁 Sprint Close:</strong> Review completed deliverables against Definition of Done.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCheck className="w-4 h-4" />
            <span>Definition of Done (DoD) Checklist</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-700">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Deliverable matches task specification.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>All subtask checklist items checked off.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Proof attached (Drive, GitHub, Canva link).</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Reviewing lead has inspected and approved.</span>
            </li>
          </ul>
        </div>
      </div>

      <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
};

export default ReportsView;
