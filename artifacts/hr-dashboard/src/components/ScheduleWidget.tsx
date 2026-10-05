import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { MALE_AVATAR } from '../utils/avatars';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';

interface ScheduleWidgetProps {
  className?: string;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ className }) => {
  const { selectedEntity } = useEntity();
  const [liveTasks, setLiveTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [viewingTask, setViewingTask] = useState<TaskItem | null>(null);

  const loadWidgetData = async () => {
    try {
      const [tRes, empRes] = await Promise.all([
        fetchApi<any[]>('/api/tasks').catch(() => []),
        fetchApi<any[]>('/api/employees').catch(() => []),
      ]);

      if (Array.isArray(empRes)) {
        setEmployees(empRes);
      }

      if (Array.isArray(tRes)) {
        const now = new Date();

        // Only keep tasks with due dates that are strictly overdue, and not completed/done
        const overdueTasks = tRes.filter((t) => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          if (isNaN(d.getTime())) return false;
          // Overdue check: target due date is earlier than now
          if (d.getTime() >= now.getTime()) return false;

          // If marked as done or completed, remove from here
          const st = (t.status || '').toUpperCase();
          if (st === 'DONE' || st === 'COMPLETED') return false;

          return true;
        });

        setLiveTasks(
          overdueTasks.map((t) => {
            const priorityUpper = (t.priority || '').toUpperCase();
            let rank = 4;
            let badge = 'P3';
            let badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';

            if (priorityUpper === 'URGENT' || priorityUpper === '1' || priorityUpper === 'P1') {
              rank = 1;
              badge = 'P1';
              badgeColor = 'bg-red-100 text-red-800 border-red-200';
            } else if (priorityUpper === 'HIGH' || priorityUpper === '2' || priorityUpper === 'P2') {
              rank = 2;
              badge = 'P2';
              badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
            } else if (priorityUpper === 'MEDIUM' || priorityUpper === '3' || priorityUpper === 'P3') {
              rank = 3;
              badge = 'P3';
              badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
            } else if (priorityUpper === 'LOW' || priorityUpper === '4' || priorityUpper === 'P4') {
              rank = 4;
              badge = 'P4';
              badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            }

            const d = new Date(t.dueDate);
            const daysOverdue = Math.max(1, Math.ceil((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));

            return {
              id: t.id,
              taskCode: t.taskCode,
              rawTask: t,
              title: t.taskCode ? `${t.taskCode}: ${t.title}` : t.title,
              entity: (t.entityCode || t.entity) === 'CAG' ? 'CAG' : 'EHM',
              rank,
              badge,
              badgeColor,
              time: `Due ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} (${daysOverdue}d overdue)`,
              avatars: [MALE_AVATAR],
            };
          })
        );
      }
    } catch (err) {
      console.error('[WIDGET FETCH ERROR]:', err);
    }
  };

  useEffect(() => {
    loadWidgetData();

    const handleTasksUpdated = () => {
      loadWidgetData();
    };

    window.addEventListener('tasks-updated', handleTasksUpdated);
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated);
    };
  }, []);

  const filteredTasks = liveTasks
    .filter((t) => matchesEntityFilter(t, selectedEntity))
    .sort((a, b) => a.rank - b.rank);

  const handleOpenTask = (item: any) => {
    const raw = item.rawTask || item;
    const assignedEmp = employees.find((e) => e.id === raw.assigneeId);
    const leadEmp = employees.find((e) => e.id === raw.reviewingLeadId);

    const resolvedAssignee = (raw.assigneeName && raw.assigneeName !== 'Unassigned')
      ? raw.assigneeName
      : (assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}`.trim() : raw.assignee || 'Unassigned');

    const resolvedLead = (raw.reviewingLead && raw.reviewingLead !== 'Manager lead')
      ? raw.reviewingLead
      : (leadEmp ? `${leadEmp.firstName} ${leadEmp.lastName}`.trim() : raw.reviewingLead || 'Unassigned');

    const taskBadge = getEntityBadge(raw);
    const resolvedEntity = taskBadge.isCommon ? 'COMMON' : taskBadge.isCAG ? 'CLIMAGRO' : 'EHM';

    const modalTask: TaskItem = {
      id: raw.id,
      taskId: raw.taskCode || raw.id,
      taskCode: raw.taskCode || raw.id,
      title: raw.title || '',
      entity: resolvedEntity,
      entityCode: raw.entityCode || (resolvedEntity === 'CLIMAGRO' ? 'CAG' : resolvedEntity === 'COMMON' ? 'COMMON' : 'EHM'),
      epicId: raw.epicId || null,
      parentEpicCode: raw.epicCode || raw.parentEpicCode || null,
      parentEpicTitle: raw.epicTitle || raw.parentEpicTitle || null,
      assignee: resolvedAssignee,
      assigneeId: raw.assigneeId || (assignedEmp?.id || ''),
      reviewingLead: resolvedLead,
      reviewingLeadId: raw.reviewingLeadId || (leadEmp?.id || ''),
      status: raw.status === 'DONE' || raw.status === 'COMPLETED' ? 'Done' :
        raw.status === 'IN_REVIEW' || raw.status === 'TO_REVIEW' ? 'To Review' :
          raw.status === 'PLANNED' ? 'Planned' :
            raw.status === 'BACKLOG' ? 'Backlog' :
              raw.status === 'DELAYED' ? 'Delayed' :
                raw.status === 'BLOCKED' ? 'Blocked' : 'In Progress',
      outputUrl: raw.deliverableUrl || raw.outputUrl || '',
      waitingOn: raw.waitingOn || 'None (Self)',
      notes: raw.description || raw.notes || '',
      dueDate: raw.dueDate ? String(raw.dueDate).split('T')[0] : '',
      targetWeek: raw.sprintWeek || raw.targetWeek || 'Week 1 (Days 1–7)',
      priority: raw.priority || 'P3',
      createdAt: raw.createdAt,
      createdById: raw.createdById || raw.creatorId,
      createdByName: raw.createdByName || raw.creatorName || '',
      creatorName: raw.createdByName || raw.creatorName || '',
    };

    setViewingTask(modalTask);
  };

  return (
    <>
      <div className={`bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 select-none ${className || ''}`}>
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className={`w-4 h-4 ${filteredTasks.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
              <h3 className="font-bold text-gray-900 text-sm">Tasks Due & Deliverables</h3>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                filteredTasks.length > 0
                  ? 'text-rose-700 bg-rose-50 border-rose-200/80'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200/80'
              }`}
            >
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task Overdue' : 'Tasks Overdue'}
            </span>
          </div>

          {/* List Items with Sleek Custom Scrollbar */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[390px] pr-2 custom-scrollbar">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400 font-medium space-y-1">
                <div className="text-emerald-600 font-bold">All caught up! 🎉</div>
                <div>No overdue tasks or deliverables at this time.</div>
              </div>
            ) : (
              filteredTasks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenTask(item)}
                  className="p-3 bg-gray-50/70 border border-gray-200/60 rounded-xl space-y-2 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs group cursor-pointer"
                  title="Click to view task details"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTask(item);
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Open task in view mode"
                      >
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-emerald-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-rose-700 font-semibold">{item.time}</span>
                    </div>

                    <div className="flex -space-x-1.5">
                      {item.avatars.map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Participant"
                          className="w-5 h-5 rounded-full border border-white object-cover shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task View Mode Modal directly on Dashboard (background remains Dashboard!) */}
      {viewingTask && (
        <TaskUpdateModal
          isOpen={!!viewingTask}
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          isReadOnly={true}
          onSave={async () => {
            await loadWidgetData();
            window.dispatchEvent(new CustomEvent('tasks-updated'));
            setViewingTask(null);
          }}
        />
      )}
    </>
  );
};


