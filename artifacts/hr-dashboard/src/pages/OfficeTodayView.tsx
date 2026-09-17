import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Building2, Laptop, CheckCircle2 } from 'lucide-react';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

export const OfficeTodayView: React.FC = () => {
  const { selectedEntity } = useEntity();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [meetingsData, employeesData] = await Promise.all([
          fetchApi<any[]>('/api/meetings'),
          fetchApi<any[]>('/api/employees'),
        ]);
        setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      } catch (err) {
        console.error('[OFFICE TODAY FETCH ERROR]:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const presenceList = (employees.length > 0 ? employees : []).map((emp, idx) => {
    const entity = emp.employeeCode?.startsWith('CAG') ? 'CAG' : 'EHM';
    const entityName = entity === 'CAG' ? 'climagroanalytics' : 'ehmconsultancy';
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const empMeetings = meetings.filter((m) => {
      const isCalendarSynced =
        m.source === 'GOOGLE_CALENDAR' ||
        m.source === 'GOOGLE_CALENDAR_IMPORTED' ||
        Boolean(m.googleEventId) ||
        Boolean(m.googleMeetUrl) ||
        Boolean(m.isGoogleCalendar);
      if (!isCalendarSynced) return false;

      const start = m.startTime ? new Date(m.startTime) : new Date();
      const end = m.endTime ? new Date(m.endTime) : start;
      if (end < sevenDaysAgo && start < sevenDaysAgo) return false;

      const isOrganizer = m.organizerId === emp.id;
      const isInvitee = Array.isArray(m.invitees) && m.invitees.includes(emp.id);
      return isOrganizer || isInvitee;
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todaysEmpMeetings = empMeetings.filter((m) => {
      if (!m.startTime) return false;
      const mDate = new Date(m.startTime);
      return !isNaN(mDate.getTime()) && mDate.toISOString().split('T')[0] === todayStr;
    });

    const seenTitles = new Set<string>();
    const todayMeetings = todaysEmpMeetings
      .filter((m) => {
        const key = `${(m.title || '').toLowerCase().trim()}_${new Date(m.startTime).getTime()}`;
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      })
      .map((m) => {
        const start = m.startTime ? new Date(m.startTime) : new Date();
        const end = m.endTime ? new Date(m.endTime) : new Date(start.getTime() + 30 * 60000);
        const active = now >= start && now <= end;
        return {
          title: m.title,
          time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          active,
        };
      });

    const isMeeting = todaysEmpMeetings.some((m) => {
      const start = m.startTime ? new Date(m.startTime) : new Date();
      const end = m.endTime ? new Date(m.endTime) : new Date(start.getTime() + 30 * 60000);
      return now >= start && now <= end;
    });

    return {
      id: emp.id,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email,
      entity,
      entityName,
      dept: 'Engineering & Operations',
      role: emp.designation || 'Team Member',
      avatar: idx % 2 === 0 ? MALE_AVATAR : FEMALE_AVATAR,
      status: isMeeting ? 'Busy in Meeting' : 'In Office (Present)',
      isMeeting,
      workMode: 'IN_OFFICE',
      todayMeetings,
    };
  });

  const filteredPresence = presenceList.filter(
    item => selectedEntity === 'ALL' || item.entity === selectedEntity
  );

  return (
    <div className="p-6 space-y-6 select-none">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Office Today & Live Presence</h2>
        <p className="text-xs text-gray-500 font-medium">Real-time presence, active meeting status, and today's calendar schedule for each team member.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading office presence and meetings...</div>
      ) : filteredPresence.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">No team members found for selected entity.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredPresence.map(item => (
            <div key={item.id || item.name} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-5">
              {/* Header: Avatar + Info */}
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

                {/* Status Badge */}
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

                {/* Today's Meetings Timeline Schedule */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" /> Today's Meetings
                    </span>
                    <span>({item.todayMeetings.length})</span>
                  </div>

                  {item.todayMeetings.length === 0 ? (
                    <p className="text-[11px] font-medium text-gray-400 italic">No meetings scheduled today</p>
                  ) : (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                      {item.todayMeetings.map((m, mIdx) => (
                        <div
                          key={m.title + mIdx}
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
