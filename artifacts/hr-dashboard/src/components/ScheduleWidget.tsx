import React, { useState } from 'react';
import { Calendar, Video, Clock, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

import { useEntity } from '../contexts/EntityContext';

export const ScheduleWidget: React.FC = () => {
  const { selectedEntity } = useEntity();
  const [activeTab, setActiveTab] = useState<'meetings' | 'tasks'>('meetings');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const meetings = [
    {
      id: 'm-1',
      title: 'Sprint Planning',
      entity: 'EHM',
      badge: 'Starting Soon',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      time: '09:00 AM - 09:30 AM',
      location: 'Google Meet',
      avatars: [FEMALE_AVATAR, MALE_AVATAR],
    },
    {
      id: 'm-2',
      title: 'Design Review',
      entity: 'CAG',
      badge: 'Starting Soon',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      time: '11:30 AM - 12:15 PM',
      location: 'Google Meet',
      avatars: [FEMALE_AVATAR, MALE_AVATAR],
    },
  ];

  const tasks = [
    {
      id: 't-1',
      title: 'EHM-MAR-ADH-672: Brand Refresh',
      entity: 'EHM',
      badge: 'In Progress',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      time: 'Due 05:00 PM',
      location: 'Deliverable',
      avatars: [FEMALE_AVATAR],
    },
    {
      id: 't-2',
      title: 'CAG-DEV-SPR-101: IoT API Test',
      entity: 'CAG',
      badge: 'Urgent',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      time: 'Due Tomorrow',
      location: 'GitHub PR',
      avatars: [MALE_AVATAR],
    },
  ];

  const filteredMeetings = meetings.filter((m) => selectedEntity === 'ALL' || m.entity === selectedEntity);
  const filteredTasks = tasks.filter((t) => selectedEntity === 'ALL' || t.entity === selectedEntity);

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
            Meetings (2)
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tasks' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tasks Due (2)
          </button>
        </div>

        {/* List Items */}
        <div className="space-y-2.5">
          {items.map(item => (
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
                  {item.avatars.map((url, idx) => (
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
          ))}
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
