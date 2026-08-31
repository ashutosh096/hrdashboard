import React, { useState } from 'react';
import { Calendar, Video, Plus, CheckSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleMeetingModal } from '../components/ScheduleMeetingModal';

export const MeetingsView: React.FC = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [meetings, setMeetings] = useState([
    {
      id: 'm-1',
      title: 'Team Standup & Sprint Sync',
      description: 'Daily operational check-in across EHM and CliAgro core leads.',
      time: 'Today 09:00 AM - 09:30 AM',
      googleMeetUrl: 'https://meet.google.com/hros-standup-2026',
      organizer: 'Sanjay Kapoor',
    },
    {
      id: 'm-2',
      title: 'Design Review & Architecture Audit',
      description: 'Reviewing brand refresh graphics and CliAgro IoT Gateway schema.',
      time: 'Today 11:30 AM - 12:15 PM',
      googleMeetUrl: 'https://meet.google.com/hros-design-rev',
      organizer: 'Priya Sharma',
    },
  ]);

  const handleSync = () => {
    toast.success('Syncing Google Calendar events across all connected user accounts...');
  };

  const handleConvertToTask = (m: any) => {
    toast.success(`Converted meeting "${m.title}" action item into a Task!`);
  };

  const handleSaveMeeting = (newMeeting: any) => {
    setMeetings([newMeeting, ...meetings]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Meetings & Schedule</h2>
          <p className="text-xs text-gray-500 font-medium">Two-way Google Calendar sync & Google Meet link auto-generation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Google Calendar</span>
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.map((m) => (
          <div key={m.id} className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                  Synced Google Meet
                </span>
                <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>

            <p className="text-xs text-gray-500 font-medium">{m.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="font-semibold">{m.time}</span>
              {m.googleMeetUrl ? (
                <a
                  href={m.googleMeetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline font-bold"
                >
                  <Video className="w-4 h-4 text-blue-500" />
                  <span>Join Google Meet</span>
                </a>
              ) : (
                <span className="text-gray-400 font-semibold">In Person</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">Organizer: {m.organizer}</span>
              <button
                onClick={() => handleConvertToTask(m)}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Convert to Task</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Google Calendar-Style Event Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveMeeting}
      />
    </div>
  );
};
