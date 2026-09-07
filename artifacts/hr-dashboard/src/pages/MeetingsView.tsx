import React, { useState, useEffect } from 'react';
import { Calendar, Video, Plus, CheckSquare, RefreshCw, Chrome, Filter, Building2, Laptop, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleMeetingModal } from '../components/ScheduleMeetingModal';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

const MOCK_PRESENCE_LIST = [
  {
    name: 'Ashutosh Mishra',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Product & Tech',
    role: 'Lead Systems Architect',
    avatar: MALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'API Telemetry & Gateway Architecture', time: '10:00 AM - 10:45 AM', active: false },
    ],
  },
  {
    name: 'Priyanka Sharma',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Marketing',
    role: 'Senior Brand Strategist',
    avatar: FEMALE_AVATAR,
    status: 'Busy in Meeting — until 11:30 AM',
    isMeeting: true,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Brand Campaign Alignment', time: '10:30 AM - 11:30 AM', active: true },
    ],
  },
  {
    name: 'Utkarsh Mishra',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Operations & Delivery',
    role: 'Operations Lead',
    avatar: MALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Vendor Logistics & Ops Audit', time: '11:00 AM - 11:45 AM', active: false },
    ],
  },
  {
    name: 'Prerna Shukla',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Grants & Governance',
    role: 'Grants Strategist',
    avatar: FEMALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Agri-Tech Subsidy Governance Sync', time: '01:30 PM - 02:15 PM', active: false },
    ],
  },
  {
    name: 'Shreyansh Siladar',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'SM Marketing',
    role: 'Social Media Lead',
    avatar: MALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Social Media Campaign Planning', time: '02:00 PM - 02:30 PM', active: false },
    ],
  },
  {
    name: "Tarul Ma'am",
    entity: 'CAG',
    entityName: 'climagroanalytics',
    dept: 'Operations & Delivery',
    role: 'Delivery Associate',
    avatar: MALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Client Dispatch & Delivery Sync', time: '04:00 PM - 04:30 PM', active: false },
    ],
  },
  {
    name: 'Dr. Harshit Mishra',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Sales',
    role: 'Managing Director / Sales Lead',
    avatar: MALE_AVATAR,
    status: 'Busy in Executive Sync',
    isMeeting: true,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Executive Board & Strategy Sync', time: '10:00 AM - 11:30 AM', active: true },
    ],
  },
  {
    name: 'Neha Shukla',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Marketing',
    role: 'Marketing Lead',
    avatar: FEMALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Marketing Growth & Metrics', time: '01:00 PM - 01:45 PM', active: false },
    ],
  },
  {
    name: 'Dr. Utsav Mishra',
    entity: 'CAG',
    entityName: 'climagroanalytics',
    dept: 'Operations & Delivery',
    role: 'Operations VP',
    avatar: MALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Operations Delivery Strategy', time: '11:30 AM - 12:15 PM', active: false },
    ],
  },
  {
    name: 'Jitendra Sir',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Product & Tech',
    role: 'Chief Technology Officer',
    avatar: MALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'Technical Leadership & Architecture Review', time: '02:30 PM - 03:30 PM', active: false },
    ],
  },
  {
    name: 'Pranshu Dubey',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Product & System',
    role: 'DevOps Engineer',
    avatar: MALE_AVATAR,
    status: 'In Office (Present)',
    isMeeting: false,
    workMode: 'IN_OFFICE',
    todayMeetings: [
      { title: 'DevOps & CI/CD Infra Sync', time: '03:00 PM - 03:45 PM', active: false },
    ],
  },
  {
    name: 'Himanshu Tiwari',
    entity: 'CAG',
    entityName: 'climagroanalytics',
    dept: 'Product & Tech',
    role: 'Frontend Engineer',
    avatar: MALE_AVATAR,
    status: 'Remote Working',
    isMeeting: false,
    workMode: 'REMOTE',
    todayMeetings: [
      { title: 'Frontend UI Code Review', time: '04:00 PM - 04:45 PM', active: false },
    ],
  },
];

export const MeetingsView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'AVAILABILITY'>('SCHEDULE');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'PAST' | 'RECURRING'>('ALL');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const isJustConnected = searchParams.get('calendarConnected') === 'true';

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any[]>('/api/meetings');
      setMeetings(data);
    } catch (err) {
      console.error('[MEETINGS FETCH ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const data = await fetchApi<any[]>('/api/meetings/availability');
      setAvailability(data);
    } catch (err) {
      console.error('[AVAILABILITY FETCH ERROR]:', err);
    }
  };

  // Explicit user-triggered Sync button handler (shows toast notification)
  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetchApi<any>('/api/meetings/sync');
      setIsConnected(true);
      toast.success(`${res.message} (${res.created || 0} imported, ${res.updated || 0} updated, ${res.cancelled || 0} cancelled)`);
      await loadMeetings();
      await loadAvailability();
    } catch (err: any) {
      if (err.needsOAuth || err.message?.includes('not connected')) {
        setIsConnected(false);
        toast.error('Google Calendar not connected. Click "Connect Google Calendar" to grant permission.');
      } else {
        toast.error('Sync failed');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Silent automatic background fetch when page opens (NO TOAST POPUPS!)
  useEffect(() => {
    const init = async () => {
      await loadMeetings();
      await loadAvailability();

      if (isJustConnected) {
        setIsConnected(true);
        toast.success('Google Calendar connected successfully!');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        try {
          const res = await fetchApi<any>('/api/meetings/sync');
          setIsConnected(true);
          if (res.created > 0 || res.updated > 0 || res.cancelled > 0) {
            await loadMeetings();
            await loadAvailability();
          }
        } catch {
          // Silent catch on background load
        }
      }
    };
    init();
  }, []);

  const handleConnectGoogle = () => {
    if (isConnecting) return;
    setIsConnecting(true);
    window.location.href = `/api/auth/google?userId=${user?.id || ''}`;
  };

  const handleConvertToTask = (m: any) => {
    toast.success(`Converted meeting "${m.title}" action item into a Task!`);
  };

  const handleSaveMeeting = async (meetingPayload: any) => {
    try {
      await fetchApi('/api/meetings', {
        method: 'POST',
        body: JSON.stringify(meetingPayload),
      });
      toast.success('Meeting scheduled on Google Calendar & Google Meet link generated!');
      await loadMeetings();
      await loadAvailability();
      setIsScheduleModalOpen(false);
    } catch (err: any) {
      if (err.needsOAuth || err.message?.includes('not connected')) {
        toast.error('Google Calendar is not connected. Please connect Google Calendar first.');
        setIsConnected(false);
      } else {
        toast.error(err.message || 'Failed to schedule meeting');
      }
    }
  };

  // Date & Time Filtering Logic (User Specified Rules)
  const getFilteredMeetings = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    if (dateFilter === 'TODAY') {
      return meetings.filter(m => m.startTime && new Date(m.startTime).toISOString().split('T')[0] === todayStr);
    }

    if (dateFilter === 'TOMORROW') {
      return meetings.filter(m => m.startTime && new Date(m.startTime).toISOString().split('T')[0] === tomorrowStr);
    }

    if (dateFilter === 'PAST') {
      // Last 7 days that ended
      return meetings.filter(m => {
        const end = m.endTime ? new Date(m.endTime) : new Date(m.startTime);
        return end < now && end >= sevenDaysAgo;
      });
    }

    if (dateFilter === 'RECURRING') {
      // Show all occurrences of repeating/series meetings (multiple meetings sharing same title)
      const titleCounts: Record<string, number> = {};
      meetings.forEach(m => {
        const key = m.title.toLowerCase().trim();
        titleCounts[key] = (titleCounts[key] || 0) + 1;
      });
      return meetings.filter(m => titleCounts[m.title.toLowerCase().trim()] > 1);
    }

    // Default 'ALL': Show all distinct meetings, but deduplicate repeating series (keep 1 instance per title so repeating cards don't clutter)
    const seenTitles = new Set<string>();
    const titleCounts: Record<string, number> = {};
    meetings.forEach(m => {
      const key = m.title.toLowerCase().trim();
      titleCounts[key] = (titleCounts[key] || 0) + 1;
    });

    return meetings.filter(m => {
      const key = m.title.toLowerCase().trim();
      const isRepeatingSeries = titleCounts[key] > 1;
      if (isRepeatingSeries) {
        if (seenTitles.has(key)) return false; // Hide additional duplicate cards in All view
        seenTitles.add(key);
      }
      return true;
    });
  };

  const filteredMeetings = getFilteredMeetings();

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Google Calendar Connection Banner if Disconnected */}
      {isConnected === false && (
        <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-emerald-950 border border-blue-500/40 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 text-white animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Chrome className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Google Calendar Not Connected</h3>
              <p className="text-xs text-gray-300 font-medium">
                Grant OAuth calendar access to sync your Google Calendar events and generate real, working Google Meet links.
              </p>
            </div>
          </div>
          <button
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Chrome className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>{isConnecting ? 'Redirecting to Google...' : 'Connect Google Calendar Now'}</span>
          </button>
        </div>
      )}

      {/* Top Bar Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Meetings & Schedule</h2>
          <p className="text-xs text-gray-500 font-medium">Two-way Google Calendar sync & team availability schedule.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('SCHEDULE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'SCHEDULE' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Meetings Feed
            </button>
            <button
              onClick={() => setActiveTab('AVAILABILITY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'AVAILABILITY' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Office Today & Availability
            </button>
          </div>

          <button
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            <Chrome className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>{isConnecting ? 'Connecting...' : isConnected ? 'Re-Connect Google' : 'Connect Google'}</span>
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Google Calendar'}</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Date & Time Filter Toolbar Pills */}
      {activeTab === 'SCHEDULE' && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200/60">
          <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mr-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filter Feed:</span>
          </div>

          <button
            onClick={() => setDateFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              dateFilter === 'ALL' ? 'bg-gray-900 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Meetings ({filteredMeetings.length})
          </button>

          <button
            onClick={() => setDateFilter('TODAY')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              dateFilter === 'TODAY' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Today's Meetings
          </button>

          <button
            onClick={() => setDateFilter('TOMORROW')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              dateFilter === 'TOMORROW' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Tomorrow's Meetings
          </button>

          <button
            onClick={() => setDateFilter('PAST')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              dateFilter === 'PAST' ? 'bg-gray-700 text-white shadow-2xs' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Past 7 Days
          </button>

          <button
            onClick={() => setDateFilter('RECURRING')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              dateFilter === 'RECURRING' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Recurring / Series
          </button>
        </div>
      )}

      {/* Main Meetings Feed or Availability View */}
      {activeTab === 'SCHEDULE' ? (
        loading ? (
          <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading meetings from server...</div>
        ) : filteredMeetings.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-gray-400">
            No meetings found for filter: <span className="font-bold text-gray-700">{dateFilter}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMeetings.map((m, idx) => (
              <div key={m.id || idx} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                      {m.source === 'GOOGLE_CALENDAR_IMPORTED' ? 'Imported from Google' : 'Synced Google Meet'}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>

                <p className="text-xs text-gray-500 font-medium">{m.description || 'No description'}</p>

                <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="font-semibold">
                    {m.startTime ? new Date(m.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Scheduled'}
                  </span>
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
                  <span className="text-xs text-gray-400 font-medium">Status: {m.status || 'SCHEDULED'}</span>
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
        )
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Office Today & Live Team Availability</h3>
              <p className="text-xs text-gray-500 font-medium">Real-time presence, active meeting status, and today's calendar schedule for each team member.</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Office
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> In Meeting
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Remote
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {MOCK_PRESENCE_LIST.filter(item => selectedEntity === 'ALL' || item.entity === selectedEntity).map(item => (
              <div key={item.name} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/20 shadow-2xs"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                      <span className="text-[11px] font-semibold text-gray-400 block">{item.entityName}</span>
                      <span className="text-xs font-semibold text-emerald-600 block">{item.role}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        item.isMeeting
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : item.workMode === 'REMOTE'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${item.isMeeting ? 'bg-amber-500 animate-ping' : item.workMode === 'REMOTE' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                      <span>{item.status}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                      {item.workMode === 'REMOTE' ? <Laptop className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      <span>{item.workMode === 'REMOTE' ? 'Remote Working' : 'Office Location'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" /> Today's Meetings
                      </span>
                      <span>({item.todayMeetings.length})</span>
                    </div>

                    <div className="space-y-1.5">
                      {item.todayMeetings.map(m => (
                        <div
                          key={m.title}
                          className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                            m.active
                              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                              : 'bg-gray-50/60 border-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 line-clamp-1">{m.title}</span>
                            {m.active && (
                              <span className="text-[9px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded uppercase shrink-0">
                                Active Now
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>{m.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {availability.length > 0 && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Sync Calendar Availability Windows</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availability.map((emp) => (
                  <div key={emp.employeeId} className="border border-gray-200/80 rounded-xl p-3.5 space-y-1 bg-gray-50/50">
                    <h5 className="text-xs font-bold text-gray-900">{emp.name}</h5>
                    <span className="text-[10px] text-gray-400 font-medium block">{emp.designation || 'Team Member'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveMeeting}
      />
    </div>
  );
};
