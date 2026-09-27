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
} from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { formatDateTime } from '../utils/dateUtils';

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
  rawData?: any;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewingItem, setViewingItem] = useState<SearchItem | null>(null);

  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [epics, setEpics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Global Hotkey (Cmd+K / Ctrl+K and ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (viewingItem) {
          setViewingItem(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewingItem, onClose]);

  // Load all workspace data sources whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setViewingItem(null);

    async function loadAllSearchData() {
      try {
        const [initData, epicData, taskData, empData, sprintData, annData] = await Promise.all([
          fetchApi<any[]>('/api/initiatives').catch(() => []),
          fetchApi<any[]>('/api/epics').catch(() => []),
          fetchApi<any[]>('/api/tasks').catch(() => []),
          fetchApi<any[]>('/api/employees').catch(() => []),
          fetchApi<any[]>('/api/sprints').catch(() => []),
          fetchApi<any[]>('/api/announcements').catch(() => []),
        ]);

        if (isMounted) {
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
    // 1. Projects / Initiatives (Applications)
    const projectItems: SearchItem[] = initiatives.map((init) => {
      const code = init.initiativeCode || init.code || 'PRJ';
      const title = init.title || init.name || 'Untitled Project';
      const category = init.category || 'General';
      const domain = init.domain || 'Technology';
      return {
        id: `project-${init.id}`,
        type: 'Project',
        code,
        title,
        subtitle: `${category} · ${domain} · Status: ${init.status || 'ACTIVE'}`,
        description: init.description || '',
        meta: init.entityCode || 'EHM',
        targetUrl: '/applications',
        status: init.status || 'ACTIVE',
        department: category,
        deliverableUrl: init.deliverableUrl || init.deliverable_url || '',
        targetDate: init.targetDate || init.target_date || '',
        ownerName: init.ownerName || init.leadName || '',
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
      subtitle: `${t.status || 'IN_PROGRESS'} · ${t.priority || 'MEDIUM'} ${t.description ? `· ${t.description.slice(0, 60)}...` : ''}`,
      description: t.description || '',
      meta: t.entityCode || t.entity || 'EHM',
      targetUrl: '/tasks',
      priority: t.priority,
      status: t.status,
      deliverableUrl: t.deliverableUrl || t.deliverable_url || '',
      targetDate: t.dueDate || t.due_date || '',
      rawData: t,
    }));

    // 4. Team Members
    const teamItems: SearchItem[] = employees.map((e) => {
      const fullName = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Team Member';
      const roleType = (e.role || 'EMPLOYEE').toUpperCase();
      const roleBadge = roleType === 'ADMIN' ? 'Admin' : roleType === 'MANAGER' ? 'Manager' : (e.designation || 'Specialist');
      const entityStr = e.entityCode || (e.employeeCode?.startsWith('CAG') ? 'CLIMAGRO' : 'EHM');

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

    return [...projectItems, ...epicItems, ...taskItems, ...teamItems, ...sprintItems, ...announcementItems];
  }, [initiatives, epics, tasks, employees, sprints, announcements]);

  // Robust Multi-term Case-Insensitive Search
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
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
      const haystack = [
        item.title,
        item.code,
        item.subtitle,
        item.description || '',
        item.meta || '',
        item.type,
        item.priority || '',
        item.status || '',
        item.department || '',
        item.email || '',
        item.phone || '',
        item.roleBadge || '',
      ]
        .join(' ')
        .toLowerCase();

      // All search terms must match (supports e.g. "ehm task", "dr harshit", "urgent notice", "p1", "epic 01")
      return searchTerms.every((term) => haystack.includes(term));
    });
  }, [allItems, query, selectedCategory]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  if (!isOpen) return null;

  const handleOpenItem = (item: SearchItem) => {
    // Open in rich interactive view mode inside modal
    setViewingItem(item);
  };

  const handleNavigateDirect = (item: SearchItem) => {
    onClose();
    if (item.targetUrl) {
      setLocation(item.targetUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (viewingItem) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleOpenItem(filteredResults[selectedIndex]);
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

  return (
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
                placeholder="Search projects, epics, tasks, team (e.g. EHM-I01, harshit, P1, sprint)..."
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
                <div className="py-12 text-center text-xs font-semibold text-gray-400">
                  Loading full workspace search index...
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-bold text-gray-700">No results found for "{query}"</p>
                  <p className="text-xs text-gray-400">
                    Try searching with a project code, epic title, task ID, team member name, or keyword.
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
                      onClick={() => handleOpenItem(r)}
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
                            handleNavigateDirect(r);
                          }}
                          className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={`Open ${r.type} in workspace page`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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
                  View Details
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
        ) : (
          /* ITEM VIEW MODE (Full interactive detail preview) */
          <div className="p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* View Mode Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {viewingItem.type}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    {viewingItem.code}
                  </span>
                  {viewingItem.status && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {viewingItem.status}
                    </span>
                  )}
                  {viewingItem.priority && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {viewingItem.priority}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  {viewingItem.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Back to search results"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* View Mode Content Grid */}
            <div className="space-y-3.5 text-xs text-left">
              {viewingItem.description && (
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/70 max-h-48 overflow-y-auto">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                    Details & Summary
                  </span>
                  <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                    {viewingItem.description}
                  </p>
                </div>
              )}

              {/* Specific attribute rows */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                {viewingItem.department && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Department / Domain</span>
                    <span className="font-bold text-gray-900">{viewingItem.department}</span>
                  </div>
                )}

                {viewingItem.ownerName && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Project Lead / Owner</span>
                    <span className="font-bold text-gray-900">{viewingItem.ownerName}</span>
                  </div>
                )}

                {viewingItem.email && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                    <span className="font-semibold text-gray-900">{viewingItem.email}</span>
                  </div>
                )}

                {viewingItem.phone && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contact Phone</span>
                    <span className="font-semibold text-gray-900">{viewingItem.phone}</span>
                  </div>
                )}

                {viewingItem.targetDate && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target / Due Date</span>
                    <span className="font-semibold text-gray-900">{viewingItem.targetDate}</span>
                  </div>
                )}

                {viewingItem.entityName && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Entity</span>
                    <span className="font-bold text-gray-900">{viewingItem.entityName}</span>
                  </div>
                )}
              </div>

              {/* Deliverable link preview if available */}
              {viewingItem.deliverableUrl && (
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-gray-900 truncate">{viewingItem.deliverableUrl}</span>
                  </div>
                  <a
                    href={viewingItem.deliverableUrl.startsWith('http') ? viewingItem.deliverableUrl : `https://${viewingItem.deliverableUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors shrink-0"
                  >
                    Open Link ↗
                  </a>
                </div>
              )}
            </div>

            {/* View Mode Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                &larr; Back to Results
              </button>

              <button
                type="button"
                onClick={() => handleNavigateDirect(viewingItem)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Open in Workspace View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
