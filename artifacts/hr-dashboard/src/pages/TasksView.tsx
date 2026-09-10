import React, { useState, useEffect } from 'react';
import { Plus, Clock, Copy, Search, Filter, ArrowRight, Layers, Target, ListTodo, Lock, Eye } from 'lucide-react';
import { TaskAssignModal } from '../components/TaskAssignModal';
import { TaskUpdateModal, TaskItem } from '../components/TaskUpdateModal';
import { TaskCloneModal } from '../components/TaskCloneModal';
import { InitiativesSubView } from '../components/InitiativesSubView';
import { EpicsSubView } from '../components/EpicsSubView';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

type TabType = 'INITIATIVES' | 'EPICS' | 'TASKS';

export const TasksView: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { selectedEntity } = useEntity();

  const isEmployee = user?.role === 'EMPLOYEE';
  const isManager = !isEmployee;

  const [activeTab, setActiveTab] = useState<TabType>(user?.role === 'EMPLOYEE' ? 'TASKS' : 'INITIATIVES');
  const [selectedEpicToViewId, setSelectedEpicToViewId] = useState<string | null>(null);
  const [selectedInitiativeToViewId, setSelectedInitiativeToViewId] = useState<string | null>(null);
  const [returnToInitiativeId, setReturnToInitiativeId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Scalable Filtering & Pagination States for 100s of Tasks
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    if (user?.role === 'EMPLOYEE') {
      setActiveTab('TASKS');
    } else {
      setActiveTab('INITIATIVES');
    }
  }, [user?.role]);

  const currentTab = isEmployee ? 'TASKS' : activeTab;

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [tasksData, epicsData, initsData] = await Promise.all([
        fetchApi<any[]>('/api/tasks'),
        fetchApi<any[]>('/api/epics'),
        fetchApi<any[]>('/api/initiatives'),
      ]);

      const formatted = (tasksData || []).map(t => {
        const parentEpic = epicsData.find(ep => ep.id === t.epicId);
        const parentInit = initsData.find(init => init.id === (t.initiativeId || parentEpic?.initiativeId));

        const isCAG = (
          t.entityId === 'cag' ||
          t.taskCode?.startsWith('CAG') ||
          parentEpic?.epicCode?.startsWith('CAG') ||
          parentInit?.initiativeCode?.startsWith('CAG')
        );

        const entityCode = isCAG ? 'CAG' : 'EHM';
        const entityName = isCAG ? 'climagroanalytics' : 'ehmconsultancy';

        let taskCode = t.taskCode || t.id;
        if (isCAG && taskCode.startsWith('EHM-')) {
          taskCode = taskCode.replace(/^EHM-/, 'CAG-');
        }

        return {
          id: t.id,
          taskCode,
          title: t.title,
          entityCode,
          entityName,
          parentInitiativeCode: parentInit?.initiativeCode || (isCAG ? 'CAG-INIT-001' : 'EHM-INIT-001'),
          parentInitiativeTitle: parentInit?.title || '',
          parentEpicCode: parentEpic?.epicCode || (isCAG ? 'CAG-EPIC-001' : 'EHM-EPIC-001'),
          parentEpicTitle: parentEpic?.title || '',
          assigneeName: user?.email || 'Assignee',
          reviewingLead: 'Manager Lead',
          status: t.status === 'DONE' ? 'DONE' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : t.status === 'PLANNED' ? 'PLANNED' : 'BACKLOG',
          priority: t.priority || 'MEDIUM',
          dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '2026-09-02',
          notesCount: 1,
          outputUrl: t.deliverableUrl || '',
          notes: t.description || '',
        };
      });
      setTasks(formatted);
    } catch (err) {
      console.error('[TASKS VIEW FETCH ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const filteredTasks = tasks.filter(t => {
    const matchesEntity = selectedEntity === 'ALL' || t.entityCode === selectedEntity;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch = !searchQuery.trim() ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.parentEpicCode?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesEntity && matchesPriority && matchesStatus && matchesSearch;
  });

  // Pagination Math for Zero-Complexity Scalability
  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + pageSize);

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await fetchApi(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Task status updated to ${newStatus}`);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode,
      title: task.title,
      entity: task.entityCode === 'CAG' ? 'CLIMAGRO' : 'EHM',
      assignee: task.assigneeName,
      reviewingLead: task.reviewingLead || 'Manager Lead',
      status: task.status === 'DONE' ? 'Done' : 'In Progress',
      outputUrl: task.outputUrl || '',
      waitingOn: 'None (Self)',
      notes: task.notes || '',
    });
  };

  const handleSaveTaskUpdate = async (updated: TaskItem) => {
    const nextStatus = updated.status === 'Done' ? 'DONE' : updated.status === 'In Progress' ? 'IN_PROGRESS' : 'BACKLOG';
    
    try {
      await fetchApi(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          deliverableUrl: updated.outputUrl || '',
          description: updated.notes || '',
        }),
      });
      toast.success('Task updated successfully in database!');
      loadTasks();
    } catch (err: any) {
      console.error('[TASK PATCH ERROR]:', err);
      toast.error('Failed to persist task status update to database.');
    }
  };

  const handleCreateTask = async (newTaskData: any) => {
    try {
      const created = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...newTaskData,
          status: 'BACKLOG', // Task is created as Backlog, ready for Sprint Assignment!
        }),
      });
      toast.success(`Backlog Task ${created.taskCode || ''} created! View it in Sprint Backlog to assign.`);
      loadTasks();
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    }
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Enterprise Delivery & Product Backlog</h2>
          <p className="text-xs text-gray-500 font-medium">3-Tier Strategic Initiative → Epic → Task hierarchy execution engine.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200/80">
          {[
            { id: 'INITIATIVES', label: '1. Initiatives', icon: Target },
            { id: 'EPICS', label: '2. Epics', icon: Layers },
            { id: 'TASKS', label: '3. Tasks', icon: ListTodo },
          ].map((tab) => {
            const Icon = tab.icon;
            const isLockedForEmp = isEmployee && (tab.id === 'INITIATIVES' || tab.id === 'EPICS');
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isLockedForEmp) {
                    toast.info(`${tab.label} view is locked in Employee mode.`);
                    return;
                  }
                  setActiveTab(tab.id as TabType);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isLockedForEmp
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-75'
                    : isActive
                    ? 'bg-white text-emerald-700 shadow-xs border border-gray-200/60'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 cursor-pointer'
                }`}
              >
                {isLockedForEmp ? (
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Sub-View Rendering */}
      <div className={currentTab === 'INITIATIVES' ? 'block' : 'hidden'}>
        <InitiativesSubView
          isManager={isManager}
          selectedInitiativeIdToView={selectedInitiativeToViewId}
          onClearSelectedInitiative={() => setSelectedInitiativeToViewId(null)}
          onSelectEpic={(epicId, parentInitiativeId) => {
            setSelectedEpicToViewId(epicId);
            if (parentInitiativeId) {
              setReturnToInitiativeId(parentInitiativeId);
              setSelectedInitiativeToViewId(parentInitiativeId);
            }
            setActiveTab('EPICS');
          }}
        />
      </div>

      <div className={currentTab === 'EPICS' ? 'block' : 'hidden'}>
        <EpicsSubView
          isManager={isManager}
          selectedEpicIdToView={selectedEpicToViewId}
          onClearSelectedEpic={() => {
            setSelectedEpicToViewId(null);
            if (returnToInitiativeId) {
              const returnId = returnToInitiativeId;
              setReturnToInitiativeId(null);
              setSelectedInitiativeToViewId(returnId);
              setActiveTab('INITIATIVES');
            }
          }}
          onSelectInitiative={(initId) => {
            setReturnToInitiativeId(null);
            setSelectedInitiativeToViewId(initId);
            setActiveTab('INITIATIVES');
          }}
        />
      </div>

      <div className={currentTab === 'TASKS' ? 'block' : 'hidden'}>
        <div className="space-y-4">
          {/* Subview Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Product Backlog Tasks</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {filteredTasks.length} Master Tasks
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Create & manage backlog deliverables. Tasks created here populate directly into the Sprint Backlog for assignment.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isEmployee ? '+ Create My Task' : '+ New Task'}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search backlog tasks by title, ID, or epic..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent 🔴</option>
                  <option value="HIGH">High 🟠</option>
                  <option value="MEDIUM">Medium 🟡</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="BACKLOG">Backlog</option>
                  <option value="PLANNED">Planned</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* High-Performance Table View Built for 100s of Tasks */}
          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading backlog tasks from database...</div>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Task ID</th>
                      <th className="py-3.5 px-4">Entity</th>
                      <th className="py-3.5 px-4">Deliverable Title</th>
                      <th className="py-3.5 px-4">Parent Epic</th>
                      <th className="py-3.5 px-4 text-center">Priority</th>
                      <th className="py-3.5 px-4">Status / Cycle</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {paginatedTasks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs text-gray-400 font-medium">
                          No backlog tasks found matching criteria. Click "+ New Task" to create one.
                        </td>
                      </tr>
                    ) : (
                      paginatedTasks.map((t) => {
                        const isDone = t.status === 'DONE' || t.status === 'Done';
                        const isInProgress = t.status === 'IN_PROGRESS' || t.status === 'In Progress';

                        return (
                          <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                                {t.taskCode}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-block ${
                                t.entityCode === 'CAG'
                                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              }`}>
                                {t.entityCode === 'CAG' ? 'CLIMAGRO' : 'EHM'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-gray-900">{t.title}</div>
                              {t.notes && <div className="text-[11px] text-gray-400 line-clamp-1">{t.notes}</div>}
                            </td>
                            <td className="py-3.5 px-4">
                              {t.parentEpicCode ? (
                                <span className="font-mono text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 hover:bg-emerald-100 transition-all text-xs cursor-pointer">
                                  <span>{t.parentEpicCode}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs italic">No Parent Epic</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase border inline-block ${
                                  t.priority === 'URGENT' || t.priority === 'HIGH'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {t.priority || 'MEDIUM'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={isDone ? 'DONE' : isInProgress ? 'IN_PROGRESS' : t.status || 'BACKLOG'}
                                onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase border cursor-pointer focus:outline-none transition-all shadow-2xs ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : isInProgress
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                }`}
                              >
                                <option value="BACKLOG">BACKLOG</option>
                                <option value="PLANNED">PLANNED</option>
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="DONE">DONE</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleTaskClick(t)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  title="View Full Task Details"
                                >
                                  <Eye className="w-4 h-4 text-emerald-600" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => setLocation('/dashboard?sub=sprints')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <span>View in Sprint</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-3 bg-gray-50/80 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600">
                  <div>
                    Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Assign Modal for Managers */}
      <TaskAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Task Clone Modal */}
      <TaskCloneModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onSubmit={handleCreateTask}
        availableTasks={tasks}
      />

      {/* Task Update / Review Modal */}
      <TaskUpdateModal
        isOpen={!!selectedTaskToUpdate}
        task={selectedTaskToUpdate}
        onClose={() => setSelectedTaskToUpdate(null)}
        onSave={handleSaveTaskUpdate}
        isReadOnly={!isEmployee}
      />
    </div>
  );
};
