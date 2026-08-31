import React, { useState } from 'react';
import { MoreHorizontal, Video } from 'lucide-react';

interface ScheduleWidgetProps {
  onViewDetail?: (item: any) => void;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ onViewDetail }) => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'tasks'>('meetings');

  const meetings = [
    {
      id: 'm-1',
      title: 'Team Standup',
      badge: 'Starting Soon',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      time: '09:00 AM - 09:30 AM',
      location: 'Zoom Meeting',
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      ],
    },
    {
      id: 'm-2',
      title: 'Design Review',
      badge: 'Starting Soon',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      time: '11:30 AM - 12:15 PM',
      location: 'Zoom Meeting',
      avatars: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      ],
    },
  ];

  const tasks = [
    {
      id: 't-1',
      title: 'EHM-MAR-ADH-672: Brand Refresh',
      badge: 'In Progress',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      time: 'Due 05:00 PM',
      location: 'Deliverable',
      avatars: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'],
    },
    {
      id: 't-2',
      title: 'CAG-DEV-SPR-101: IoT API Test',
      badge: 'Urgent',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      time: 'Due Tomorrow',
      location: 'GitHub PR',
      avatars: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'],
    },
  ];

  const items = activeTab === 'meetings' ? meetings : tasks;

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs flex flex-col h-full">
      {/* Top Header matching screenshot */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Schedule</h3>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Switcher matching screenshot */}
      <div className="bg-gray-100 p-1 rounded-lg flex items-center mb-4">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'meetings'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Meetings
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'tasks'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Task
        </button>
      </div>

      {/* Item Cards matching screenshot */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 bg-gray-50/50 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">{item.title}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Start at</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded-md">
                <Video className="w-3.5 h-3.5 text-blue-500" />
                <span>{item.location}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{item.time}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex -space-x-2 overflow-hidden">
                {item.avatars.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Attendee"
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <button
                onClick={() => onViewDetail && onViewDetail(item)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
