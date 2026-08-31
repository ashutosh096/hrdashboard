import React, { useState } from 'react';
import { Users, Clock, Link2, MessageSquare, CheckCircle, AlertCircle, Edit3, Shield, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { TaskUpdateModal, TaskItem } from '../components/TaskUpdateModal';

export interface TeamTaskItem {
  id: string;
  taskCode: string;
  title: string;
  entityName: string;
  entityCode: string;
  partners: string[];
  partnerAvatars: string[];
  reviewingLead: string;
  priority: string;
  dueDate: string;
  status: 'In Progress' | 'Done' | 'Delayed' | 'Blocked';
  outputUrl: string;
  notes: string;
}

export const TeamTasksView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<TaskItem | null>(null);

  const isEmployee = user?.role === 'EMPLOYEE';

  const [teamTasks, setTeamTasks] = useState<TeamTaskItem[]>([
    {
      id: 'tt-1',
      taskCode: 'ALL-MAR-ADH-892',
      title: 'Joint Q3 Marketing Campaign & CliAgro API Integration Launch',
      entityName: 'ehmconsultancy & climagroanalytics',
      entityCode: 'BOTH',
      partners: ['Priya Sharma', 'Rahul Verma'],
      partnerAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      ],
      reviewingLead: 'Dr. Harshit Mishra',
      priority: 'URGENT',
      dueDate: '2026-09-05',
      status: 'In Progress',
      outputUrl: 'https://canva.link/climagro-joint-campaign',
      notes: 'Priya handling pitch assets & social graphics; Rahul verifying telemetry API endpoints.',
    },
    {
      id: 'tt-2',
      taskCode: 'EHM-OPS-ADH-402',
      title: 'Cross-Entity Vendor Procurement Audit & Compliance Kit',
      entityName: 'ehmconsultancy',
      entityCode: 'EHM',
      partners: ['Anita Desai', 'Vikram Mehta'],
      partnerAvatars: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      ],
      reviewingLead: 'Utsav Mishra',
      priority: 'HIGH',
      dueDate: '2026-09-10',
      status: 'In Progress',
      outputUrl: 'https://drive.google.com/joint-procurement-audit',
      notes: 'Anita reviewing operational logistics; Vikram leading financial compliance check.',
    },
  ]);

  // Scoping: If Employee, show team tasks where the employee is one of the partners!
  const filtered = teamTasks.filter(t => {
    const matchesEntity = selectedEntity === 'ALL' || t.entityCode === selectedEntity || t.entityCode === 'BOTH';
    const matchesEmployee = isEmployee ? t.partners.includes(user?.name || 'Priya Sharma') : true;
    return matchesEntity && matchesEmployee;
  });

  const handleOpenUpdateModal = (t: TeamTaskItem) => {
    setSelectedTaskToUpdate({
      id: t.id,
      taskId: t.taskCode,
      title: t.title,
      entity: t.entityName,
      assignee: t.partners.join(' + '),
      reviewingLead: t.reviewingLead,
      status: t.status,
      outputUrl: t.outputUrl,
      waitingOn: 'None (Self)',
      notes: t.notes,
    });
  };

  const handleSendDelayAlert = (e: React.MouseEvent, taskCode: string, partners: string[]) => {
    e.stopPropagation();
    toast.error(`Delay Warning Alert sent to team partners (${partners.join(', ')}) for task ${taskCode}!`);
  };

  const handleSaveUpdate = (updated: TaskItem) => {
    setTeamTasks(teamTasks.map(t => t.id === updated.id ? {
      ...t,
      status: updated.status,
      outputUrl: updated.outputUrl || '',
      notes: updated.notes || '',
    } : t));
  };

  return (
    <div className="p-6 space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Team & Partner Tasks</h2>
          <p className="text-xs text-gray-500 font-medium">
            {isEmployee ? 'Joint deliverables assigned to you and your team partners.' : 'Kanban & joint deliverable management across partner teams.'}
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
          {filtered.length} Active Partner Tasks
        </span>
      </div>

      {/* Partner Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(task => (
          <div
            key={task.id}
            className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            {/* Header: Code & Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {task.taskCode}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {task.entityName}
                </span>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                task.priority === 'URGENT' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {task.priority}
              </span>
            </div>

            {/* Task Title */}
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-snug">{task.title}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">{task.notes}</p>
            </div>

            {/* Team Partners Box */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {task.partnerAvatars.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Partner"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-2xs"
                    />
                  ))}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Team Partners</span>
                  <span className="text-xs font-extrabold text-gray-900">{task.partners.join(' & ')}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Reviewing Lead</span>
                <span className="text-xs font-semibold text-gray-800">{task.reviewingLead}</span>
              </div>
            </div>

            {/* Deliverable URL Link */}
            {task.outputUrl && (
              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={task.outputUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline flex items-center gap-1 font-bold truncate max-w-xs"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="truncate">{task.outputUrl}</span>
                </a>
              </div>
            )}

            {/* Bottom Row: Due Date & Role-Based Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Due: {task.dueDate}</span>
              </div>

              {isEmployee ? (
                <button
                  onClick={() => handleOpenUpdateModal(task)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Team Status →</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleSendDelayAlert(e, task.taskCode, task.partners)}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    title="Send Delay Alert to Team Partners"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-600" />
                    <span>Send Delay Alert</span>
                  </button>

                  <button
                    onClick={() => handleOpenUpdateModal(task)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    title="Review Team Submission"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Review Submission</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Update / Review Modal */}
      <TaskUpdateModal
        isOpen={!!selectedTaskToUpdate}
        task={selectedTaskToUpdate}
        onClose={() => setSelectedTaskToUpdate(null)}
        onSave={handleSaveUpdate}
      />
    </div>
  );
};
