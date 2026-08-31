import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Video, MapPin, AlignLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (meeting: any) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [isAllDay, setIsAllDay] = useState(false);
  const [entity, setEntity] = useState<'EHM' | 'CAG'>('EHM');
  const [location, setLocation] = useState('Google Meet');
  const [googleMeetLink, setGoogleMeetLink] = useState('https://meet.google.com/hros-auto-gen');
  const [hasGoogleMeet, setHasGoogleMeet] = useState(true);
  const [description, setDescription] = useState('');
  const [selectedGuests, setSelectedGuests] = useState<string[]>(['Priya Sharma', 'Rahul Verma']);

  if (!isOpen) return null;

  const guestsList = ['Priya Sharma', 'Rahul Verma', 'Anita Desai', 'Vikram Mehta', 'Dr. Harshit Mishra', 'Neha Shukla'];

  const toggleGuest = (name: string) => {
    if (selectedGuests.includes(name)) {
      setSelectedGuests(selectedGuests.filter(g => g !== name));
    } else {
      setSelectedGuests([...selectedGuests, name]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeeting = {
      id: `m-${Date.now()}`,
      title: title || 'New Scheduled Meeting',
      description,
      startTime: `${startDate}T${startTime}:00`,
      endTime: `${startDate}T${endTime}:00`,
      location: hasGoogleMeet ? 'Google Meet' : location,
      googleMeetUrl: hasGoogleMeet ? googleMeetLink : null,
      organizerName: 'You',
      guests: selectedGuests,
      entity,
    };
    if (onSave) onSave(newMeeting);
    toast.success('Meeting scheduled & synced to Google Calendar!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      {/* Google Calendar-Style Event Modal */}
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Google Calendar Event</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Title Input */}
          <div>
            <input
              type="text"
              required
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-emerald-500 outline-none pb-1.5 transition-colors placeholder-gray-300"
            />
          </div>

          {/* Event / Entity Pill Switcher */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-gray-500">Entity:</span>
            <button
              type="button"
              onClick={() => setEntity('EHM')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                entity === 'EHM' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-gray-100 text-gray-600'
              }`}
            >
              ehmconsultancy
            </button>
            <button
              type="button"
              onClick={() => setEntity('CAG')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                entity === 'CAG' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-gray-100 text-gray-600'
              }`}
            >
              climagroanalytics
            </button>
          </div>

          {/* Date & Time Picker Row */}
          <div className="flex items-center gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200/80">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg p-1.5 font-semibold text-gray-800"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg p-1.5 font-semibold text-gray-800"
            />
            <span className="text-gray-400 font-bold">–</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg p-1.5 font-semibold text-gray-800"
            />
          </div>

          {/* Google Meet Video Conferencing Toggle */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block">Google Meet Video Conferencing</span>
                <span className="text-[10px] text-emerald-700 font-semibold truncate block">{googleMeetLink}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHasGoogleMeet(!hasGoogleMeet)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                hasGoogleMeet ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {hasGoogleMeet ? 'Added' : 'Add Meet'}
            </button>
          </div>

          {/* Guests Multi-Select */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Guests / Invitees</span>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200 max-h-28 overflow-y-auto">
              {guestsList.map((g) => {
                const isSel = selectedGuests.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGuest(g)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSel ? 'bg-emerald-500 text-white shadow-2xs' : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    {isSel ? `✓ ${g}` : `+ ${g}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
              <AlignLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Description</span>
            </div>
            <textarea
              rows={2}
              placeholder="Meeting agenda or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Auto-syncs to Google Calendar
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-colors"
              >
                Save Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
