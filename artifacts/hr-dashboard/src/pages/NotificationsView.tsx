import React from 'react';
import { Bell, CheckSquare, Megaphone, Calendar } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const alerts = [
    { id: '1', title: 'New Task Assigned: EHM-MAR-ADH-672', time: '10 mins ago', icon: CheckSquare },
    { id: '2', title: 'Upcoming Meeting: Team Standup at 09:00 AM', time: '45 mins ago', icon: Calendar },
    { id: '3', title: 'Pinned Announcement: Q3 All-Hands Review', time: '2 hours ago', icon: Megaphone },
  ];

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notifications</h2>
        <p className="text-xs text-gray-500 font-medium">Realtime alerts backed by Supabase Realtime channel stream.</p>
      </div>

      <div className="space-y-3">
        {alerts.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="bg-white border border-gray-200/80 p-4 rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-800">{a.title}</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
