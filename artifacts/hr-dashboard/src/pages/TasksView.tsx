import React, { useState, useEffect } from 'react';
import { Plus, Clock, Eye, Send, Target, Layers, ListTodo, Zap, Lock, Copy } from 'lucide-react';
import { TaskAssignModal } from '../components/TaskAssignModal';
import { TaskUpdateModal, TaskItem } from '../components/TaskUpdateModal';
import { TaskCloneModal } from '../components/TaskCloneModal';
import { InitiativesSubView } from '../components/InitiativesSubView';
import { EpicsSubView } from '../components/EpicsSubView';
import { SprintsSubView } from '../components/SprintsSubView';
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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      const formatted = tasksData.map(t => {
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
          status: t.status === 'DONE' ? 'DONE' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO',
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
    return matchesEntity;
  });

  const columns = [
    { key: 'TODO', label: 'To Do', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { key: 'IN_REVIEW', label: 'To Review', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    { key: 'DONE', label: 'Done', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const previousTasks = [...tasks];
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || targetTask.status === newStatus) return;

    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    toast.success(`Task ${targetTask.taskCode} moved to ${newStatus}`);

    try {
      await fetchApi(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('[DRAG DROP ROLLBACK ERROR]:', err);
      // Rollback on failure!
      setTasks(previousTasks);
      toast.error(`Failed to update status for ${targetTask.taskCode}. Rolling back.`);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode,
      title: task.title,
      entity: task.entityName || 'climagroanalytics',
      assignee: task.assigneeName,
      reviewingLead: task.reviewingLead || 'Manager',
      status: task.status === 'DONE' ? 'Done' : 'In Progress',
      outputUrl: task.outputUrl || '',
      waitingOn: 'None (Self)',
      notes: task.notes || '',
    });
  };

  const handleSendDelayAlertToEmployee = async (e: React.MouseEvent, taskCode: string, assigneeName: string) => {
    e.stopPropagation();
    toast.error(`Delay Warning Alert sent to employee ${assigneeName} for task ${taskCode}!`);
  };

  const handleSaveTaskUpdate = async (updated: TaskItem) => {
    const nextStatus = updated.status === 'Done' ? 'DONE' : updated.status === 'In Progress' ? 'IN_PROGRESS' : 'TODO';
    
    // Persist status change to Supabase via backend API
    try {
      await fetchApi(`/api/tasks/${updated.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          deliverableUrl: updated.outputUrl || '',
          description: updated.notes || '',
        }),
      });
      toast.success('Task status updated successfully in database!');
    } catch (err: any) {
      console.error('[TASK PATCH ERROR]:', err);
      toast.error('Failed to persist task status update to database.');
    }

    setTasks(tasks.map(t => t.id === updated.id ? {
      ...t,
      status: nextStatus,
      outputUrl: updated.outputUrl || '',
      notes: updated.notes || '',
    } : t));

    if (isEmployee) {
      toast.success(`Task submission notification sent to Reviewing Lead!`);
    }
  };

  const handleCreateTask = async (newTaskData: any) => {
    try {
      const created = await fetchApi<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(newTaskData),
      });
      toast.success(`Task ${created.taskCode || ''} assigned successfully!`);
      loadTasks();
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign task');
    }
  };

  // Initiatives, Epics, and Tasks tabs in Product Backlog
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
          onSelectEpic={(epicId) => {
            setSelectedEpicToViewId(epicId);
            setActiveTab('EPICS');
          }}
        />
      </div>

      <div className={currentTab === 'EPICS' ? 'block' : 'hidden'}>
        <EpicsSubView
          isManager={isManager}
          selectedEpicIdToView={selectedEpicToViewId}
          onClearSelectedEpic={() => setSelectedEpicToViewId(null)}
          onSelectInitiative={(initId) => {
            setSelectedInitiativeToViewId(initId);
            setActiveTab('INITIATIVES');
          }}
        />
      </div>

      <div className={currentTab === 'TASKS' ? 'block' : 'hidden'}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Product Backlog Tasks</h3>
              <p className="text-xs text-gray-500 font-medium">Granular deliverable tasks aligned under Initiative → Epic → Task hierarchy.</p>
            </div>

            <div className="flex items-center gap-2">
              {isManager && (
                <button
                  onClick={() => setIsCloneModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>📋 Quick Clone Task</span>
                </button>
              )}
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isEmployee ? '+ Create My Task' : '+ New Task'}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading tasks from database...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {columns.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.key);
                return (
                  <div
                    key={col.key}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.key)}
                    className="bg-gray-100/60 rounded-2xl p-4 border border-gray-200/80 flex flex-col min-h-[500px]"
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.color}`}>
                          {col.label}
                        </span>
                        <span className="text-xs font-bold text-gray-400">({colTasks.length})</span>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      {colTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => handleTaskClick(task)}
                          className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-grab active:cursor-grabbing group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {task.taskCode}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                task.priority === 'URGENT'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : task.priority === 'HIGH'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : task.priority === 'LOW'
                                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {task.priority || 'MEDIUM'}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-extrabold text-gray-900 mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
                            {task.title}
                          </h4>

                          {/* Lineage Info */}
                          {task.parentEpicCode && (
                            <div className="text-[10px] font-semibold text-gray-500 mb-2 truncate">
                              Epic: <span className="font-mono font-bold text-purple-700">{task.parentEpicCode}</span>
                            </div>
                          )}

                          {/* Assignee & Reviewing Lead */}
                          <div className="text-[11px] font-medium text-gray-600 space-y-0.5 bg-gray-50 p-2 rounded-lg border border-gray-100 mb-2">
                            <div className="truncate">
                              <span className="text-gray-400 font-bold">Assigned:</span>{' '}
                              <span className="text-gray-800 font-bold">{task.assigneeName}</span>
                            </div>
                            <div className="truncate">
                              <span className="text-gray-400 font-bold">Lead:</span>{' '}
                              <span className="text-gray-800 font-bold">{task.reviewingLead}</span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1 font-medium text-gray-500">
                              <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{task.dueDate}</span>
                            </div>

                            {!isEmployee && (
                              <button
                                onClick={(e) => handleSendDelayAlertToEmployee(e, task.taskCode, task.assigneeName)}
                                className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-2.5 h-2.5 text-amber-600" />
                                <span>Delay Alert</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
