import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { MALE_AVATAR } from '../utils/avatars';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';

interface ScheduleWidgetProps {
  className?: string;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ className }) => {
  const { selectedEntity } = useEntity();
  const [liveTasks, setLiveTasks] = useState<any[]>([]);

  useEffect(() => {
    async function loadWidgetData() {
      try {
        const tRes = await fetchApi<any[]>('/api/tasks');

        if (Array.isArray(tRes)) {
          setLiveTasks(
            tRes.map((t) => ({
              id: t.id,
              title: `${t.taskCode}: ${t.title}`,
              entity: t.taskCode.startsWith('CAG') ? 'CAG' : 'EHM',
              badge: t.priority || t.status,
              badgeColor: t.priority === 'URGENT' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200',
              time: t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'Upcoming',
              avatars: [MALE_AVATAR],
            }))
          );
        }
      } catch (err) {
        console.error('[WIDGET FETCH ERROR]:', err);
      }
    }
    loadWidgetData();
  }, []);

  const filteredTasks = liveTasks.filter((t) => selectedEntity === 'ALL' || t.entity === selectedEntity);

  return (
    <div className={`bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 select-none ${className || ''}`}>
      <div className="space-y-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-sm">Tasks Due & Deliverables</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
            {filteredTasks.length} Tasks Due
          </span>
        </div>

        {/* List Items */}
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 min-h-[220px]">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 font-medium">No tasks due available</div>
          ) : (
            filteredTasks.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-gray-50/70 border border-gray-200/60 rounded-xl space-y-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.time}</span>
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
  );
};
