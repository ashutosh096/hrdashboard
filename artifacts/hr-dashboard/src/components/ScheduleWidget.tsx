import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';

export const ScheduleWidget: React.FC = () => {
  const { selectedEntity } = useEntity();
  const [activeTab, setActiveTab] = useState<'meetings' | 'tasks'>('meetings');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [liveMeetings, setLiveMeetings] = useState<any[]>([]);
  const [liveTasks, setLiveTasks] = useState<any[]>([]);

  useEffect(() => {
    async function loadWidgetData() {
      try {
        const [mRes, tRes] = await Promise.all([
          fetchApi<any[]>('/api/meetings'),
          fetchApi<any[]>('/api/tasks'),
        ]);

        if (Array.isArray(mRes)) {
          setLiveMeetings(
            mRes.map((m) => ({
              id: m.id,
              title: m.title,
              entity: 'CAG',
              badge: 'Scheduled',
              badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              time: m.startTime ? new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
              avatars: [FEMALE_AVATAR, MALE_AVATAR],
            }))
          );
        }

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

  const filteredMeetings = liveMeetings.filter((m) => selectedEntity === 'ALL' || m.entity === selectedEntity);
  const filteredTasks = liveTasks.filter((t) => selectedEntity === 'ALL' || t.entity === selectedEntity);

  const items = activeTab === 'meetings' ? filteredMeetings : filteredTasks;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 select-none">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-sm">Schedule & Deliverables</h3>
          </div>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'meetings' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Meetings ({filteredMeetings.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tasks' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tasks Due ({filteredTasks.length})
          </button>
        </div>

        {/* List Items */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 font-medium">No items available</div>
          ) : (
            items.map((item) => (
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

      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={() => toast.success('Event added!')}
      />
    </div>
  );
};
