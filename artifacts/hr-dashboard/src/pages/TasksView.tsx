import React, { useState } from 'react';
import { Plus, CheckSquare, Clock, AlertCircle, MessageSquare, Link as LinkIcon, Send, Eye, Bell } from 'lucide-react';
import { TaskAssignModal } from '../components/TaskAssignModal';
import { TaskUpdateModal, TaskItem } from '../components/TaskUpdateModal';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const TasksView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);

  const isEmployee = user?.role === 'EMPLOYEE';

  const [tasks, setTasks] = useState([
    {
      id: 't-1',
      taskCode: 'EHM-MAR-ADH-672',
      title: 'Brand Refresh Assets & Social Kit',
      entityCode: 'EHM',
      entityName: 'ehmconsultancy',
      assigneeName: 'Priya Sharma',
      reviewingLead: 'Dr. Harshit Mishra',
      sprintWeek: 'Sprint 35',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: '2026-09-02',
      notesCount: 2,
      outputUrl: 'https://canva.link/ehm-brand-social-kit',
      notes: 'Finalized logo variants and export files.',
    },
    {
      id: 't-2',
      taskCode: 'CAG-DEV-SPR-101',
      title: 'IoT Sensor API Gateway v2',
      entityCode: 'CAG',
      entityName: 'climagroanalytics',
      assigneeName: 'Rahul Verma',
      reviewingLead: 'Neha Shukla',
      sprintWeek: 'Sprint 35',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: '2026-09-04',
      notesCount: 1,
      outputUrl: 'https://github.com/climagro/api-gateway',
      notes: 'Deployed staging build v2.1.',
    },
    {
      id: 't-3',
      taskCode: 'EHM-OPS-PROC-412',
      title: 'Q3 Vendor Procurement Audit',
      entityCode: 'EHM',
      entityName: 'ehmconsultancy',
      assigneeName: 'Anita Desai',
      reviewingLead: 'Utsav Mishra',
      sprintWeek: 'Sprint 36',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '2026-09-08',
      notesCount: 0,
      outputUrl: '',
      notes: 'Initial requirements document created.',
    },
  ]);

  // Employee sees ONLY tasks assigned to them; Manager sees ALL tasks
  const filteredTasks = tasks.filter(t => {
    const matchesEntity = selectedEntity === 'ALL' || t.entityCode === selectedEntity;
    const matchesAssignee = isEmployee ? t.assigneeName === (user?.name || 'Priya Sharma') : true;
    return matchesEntity && matchesAssignee;
  });

  const columns = [
    { key: 'TODO', label: 'To Do', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { key: 'DONE', label: 'Done', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  const handleTaskClick = (task: any) => {
    setSelectedTaskToUpdate({
      id: task.id,
      taskId: task.taskCode,
      title: task.title,
      entity: task.entityName || 'climagroanalytics',
      assignee: task.assigneeName,
      reviewingLead: task.reviewingLead || 'Dr. Harshit Mishra',
      status: task.status === 'DONE' ? 'Done' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'In Progress',
      outputUrl: task.outputUrl || '',
      waitingOn: 'None (Self)',
      notes: task.notes || 'Pushed from Roadmap',
    });
  };

  const handleSendDelayAlertToEmployee = (e: React.MouseEvent, taskCode: string, assigneeName: string) => {
    e.stopPropagation();
    toast.error(`Delay Warning Alert sent to employee ${assigneeName} for task ${taskCode}!`);
  };

  const handleSaveTaskUpdate = (updated: TaskItem) => {
    const nextStatus = updated.status === 'Done' ? 'DONE' : updated.status === 'In Progress' ? 'IN_PROGRESS' : 'TODO';
    setTasks(tasks.map(t => t.id === updated.id ? {
      ...t,
      status: nextStatus,
      outputUrl: updated.outputUrl || '',
      notes: updated.notes || '',
    } : t));

    if (isEmployee) {
      toast.success(`Task submission notification sent to Reviewing Lead (${updated.reviewingLead})!`);
    }
  };

  return (
    <div className="p-6 space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Tasks & Sprints</h2>
          <p className="text-xs text-gray-500 font-medium">
            {isEmployee ? 'My assigned deliverables and sprint progress.' : 'Kanban board & deliverable management with auto Task IDs.'}
          </p>
        </div>

        {/* Manager-Only + New Task Button */}
        {!isEmployee && (
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="bg-gray-100/60 rounded-2xl p-4 border border-gray-200/80 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-bold text-gray-400">({colTasks.length})</span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-emerald-400"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {task.taskCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'URGENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mb-3">Assignee: {task.assigneeName}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.dueDate}</span>
                      </div>

                      {/* Controls differ between Employee and Manager */}
                      {isEmployee ? (
                        <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                          <span>Update Status →</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleSendDelayAlertToEmployee(e, task.taskCode, task.assigneeName)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                            title="Send Delay Alert to Employee"
                          >
                            <Send className="w-3 h-3 text-amber-600" />
                            <span>Send Delay Alert</span>
                          </button>

                          <button
                            onClick={() => handleTaskClick(task)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                            title="View Employee Submission"
                          >
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>View Submission</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Assign Modal for Managers */}
      <TaskAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={(newTask) => setTasks([newTask, ...tasks])}
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
