import React, { useState, useEffect, useMemo } from 'react';
import { Video, Calendar, Clock, Building2, Laptop, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';

const formatISTTime = (d: Date | string): string => {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getKolkataDateString = (d: Date): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return getKolkataDateString(d1) === getKolkataDateString(d2);
};

export const OfficeTodayView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [employees, setEmployees] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'TOMORROW'>('TODAY');
  const [cardDateFilters, setCardDateFilters] = useState<Record<string, 'TODAY' | 'TOMORROW'>>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [employeesData, availabilityData] = await Promise.all([
          fetchApi<any[]>('/api/employees'),
          fetchApi<any[]>('/api/meetings/availability').catch(() => []),
        ]);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setAvailability(Array.isArray(availabilityData) ? availabilityData : []);
      } catch (err) {
        console.error('[OFFICE TODAY FETCH ERROR]:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getTargetDate = (filter: 'TODAY' | 'TOMORROW') => {
    const d = new Date();
    if (filter === 'TOMORROW') d.setDate(d.getDate() + 1);
    return d;
  };

  const presenceList = useMemo(() => {
    const now = new Date();

    return (employees.length > 0 ? employees : []).map((emp, idx) => {
      const entity = emp.entityCode || emp.entity || 'EHM';
      const entityName = entity === 'CAG' ? 'CLIMAGRO' : entity === 'COMMON' ? 'EHM & CLIMAGRO' : 'EHM';

      const isSelf =
        (user?.employeeId && emp.id === user.employeeId) ||
        (user?.id && emp.id === user.id) ||
        (user?.email && (emp.email || '').toLowerCase() === user.email.toLowerCase());

      const empAvail = availability.find((a: any) => a.employeeId === emp.id || (a.email && a.email.toLowerCase() === (emp.email || '').toLowerCase()));
      const availBusySlots = empAvail?.busySlots || empAvail?.busy || [];

      // Determine active date filter for this employee (individual override or global)
      const empDateFilter = cardDateFilters[emp.id] || dateFilter;
      const targetDate = getTargetDate(empDateFilter);

      // Filter slots strictly matching target day, excluding full-day status notes (like 24h "Office" entries)
      const targetSlots = availBusySlots.filter((slot: any) => {
        const slotStart = new Date(slot.start || slot.startTime);
        let slotEnd = slot.end || slot.endTime ? new Date(slot.end || slot.endTime) : new Date(slotStart.getTime() + 30 * 60000);
        if (slotEnd.getTime() <= slotStart.getTime()) slotEnd = new Date(slotStart.getTime() + 30 * 60000);

        const durationHours = (slotEnd.getTime() - slotStart.getTime()) / 3600000;
        const titleLower = (slot.meetingTitle || slot.title || '').toLowerCase();
        const isAllDayStatus = slot.isAllDay || durationHours >= 12 || titleLower === 'office' || titleLower === 'wfh';

        if (isAllDayStatus) return false;
        return !isNaN(slotStart.getTime()) && isSameDay(slotStart, targetDate);
      });

      // Sort chronologically ascending: Morning (e.g. 9 AM) -> Noon (12 PM) -> Evening (4 PM)
      targetSlots.sort((a: any, b: any) => {
        const timeA = new Date(a.start || a.startTime).getTime();
        const timeB = new Date(b.start || b.startTime).getTime();
        return timeA - timeB;
      });

      const dayMeetings = targetSlots.map((slot: any, sIdx: number) => {
        const start = new Date(slot.start || slot.startTime);
        let end = slot.end || slot.endTime ? new Date(slot.end || slot.endTime) : new Date(start.getTime() + 30 * 60000);
        if (end.getTime() <= start.getTime()) {
          end = new Date(start.getTime() + 30 * 60000);
        }

        const active = isSameDay(now, targetDate) && now >= start && now <= end;

        const displayTitle = isSelf || !slot.isPrivate
          ? (slot.meetingTitle || slot.title || `Meeting ${sIdx + 1}`)
          : `Meeting ${sIdx + 1}`;

        return {
          title: displayTitle,
          isPrivate: !isSelf && slot.isPrivate,
          time: `${formatISTTime(start)} - ${formatISTTime(end)}`,
          active,
          rawStart: start,
        };
      });

      // Live presence is checked against TODAY
      const todaySlots = availBusySlots.filter((slot: any) => {
        const slotStart = new Date(slot.start || slot.startTime);
        let slotEnd = slot.end || slot.endTime ? new Date(slot.end || slot.endTime) : new Date(slotStart.getTime() + 30 * 60000);
        if (slotEnd.getTime() <= slotStart.getTime()) slotEnd = new Date(slotStart.getTime() + 30 * 60000);

        const durationHours = (slotEnd.getTime() - slotStart.getTime()) / 3600000;
        const titleLower = (slot.meetingTitle || slot.title || '').toLowerCase();
        const isAllDayStatus = slot.isAllDay || durationHours >= 12 || titleLower === 'office' || titleLower === 'wfh';

        if (isAllDayStatus) return false;
        return !isNaN(slotStart.getTime()) && isSameDay(slotStart, now);
      });
      const isCurrentlyInMeeting = todaySlots.some((slot: any) => {
        const start = new Date(slot.start || slot.startTime);
        let end = slot.end || slot.endTime ? new Date(slot.end || slot.endTime) : new Date(start.getTime() + 30 * 60000);
        if (end.getTime() <= start.getTime()) {
          end = new Date(start.getTime() + 30 * 60000);
        }
        return now >= start && now <= end;
      });

      const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email;

      return {
        id: emp.id,
        name: empName,
        employeeCode: emp.employeeCode || '-',
        entity,
        entityCode: entity,
        entityId: emp.entityId,
        entityName,
        dept: emp.departmentName || 'Product & Tech',
        role: emp.designation || 'Team Specialist',
        avatar: getAvatarByName(empName),
        status: isCurrentlyInMeeting ? 'Busy in Meeting' : 'In Office (Present)',
        isMeeting: isCurrentlyInMeeting,
        workMode: 'IN_OFFICE',
        dayMeetings,
        currentFilter: empDateFilter,
      };
    });
  }, [employees, availability, user, dateFilter, cardDateFilters]);

  const filteredPresence = presenceList.filter(
    item => matchesEntityFilter(item, selectedEntity)
  );

  const handleSetCardFilter = (empId: string, filter: 'TODAY' | 'TOMORROW') => {
    setCardDateFilters(prev => ({ ...prev, [empId]: filter }));
  };

  const dateFilterLabel = (filter: 'TODAY' | 'TOMORROW') => {
    if (filter === 'TOMORROW') return "Tomorrow's";
    return "Today's";
  };

  return (
    <div className="p-6 space-y-6 select-none">
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Office Today & Live Presence</h2>
          <p className="text-xs text-gray-500 font-medium">Real-time presence, active meeting status, and calendar schedules ordered morning to evening.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Global Date Filter Selector */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80">
            {(['TODAY', 'TOMORROW'] as const).map((filterOpt) => (
              <button
                key={filterOpt}
                onClick={() => {
                  setDateFilter(filterOpt);
                  setCardDateFilters({}); // reset individual card overrides when global changes
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  dateFilter === filterOpt
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterOpt.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Office
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> In Meeting
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading office presence and meetings...</div>
      ) : filteredPresence.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-3xl p-12 text-center shadow-xs">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-gray-800">No Team Members Found</h4>
          <p className="text-xs text-gray-400 mt-1">No active team members matched the selected entity filter ({selectedEntity || 'ALL'}).</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredPresence.map(item => (
            <div key={item.id || item.name} className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between space-y-5">
              {/* Header: Avatar + Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-2xs"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          item.isMeeting ? 'bg-amber-500 ring-2 ring-amber-400 animate-ping' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 leading-snug">{item.name}</h3>
                      <span className="text-xs font-semibold text-emerald-700 block">{item.role}</span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold block">{item.employeeCode}</span>
                    </div>
                  </div>

                  {(() => {
                    const badge = getEntityBadge(item);
                    return (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wide border ${badge.className}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Single Clean Presence Status Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    item.isMeeting
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.isMeeting ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="truncate">{item.status}</span>
                </div>

                {/* Department Tag */}
                <div className="text-[11px] font-semibold text-gray-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span>Department:</span>
                  <span className="font-bold text-gray-800">{item.dept}</span>
                </div>

                {/* Meetings Timeline Schedule with Individual Day Filter */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" /> {dateFilterLabel(item.currentFilter)} Meetings
                    </span>
                    <span className="text-emerald-700 font-extrabold">({item.dayMeetings.length})</span>
                  </div>

                  {/* Per-Card Quick Date Filter Switcher */}
                  <div className="flex items-center bg-gray-50 p-0.5 rounded-lg border border-gray-200/60 text-[10px] font-bold">
                    {(['TODAY', 'TOMORROW'] as const).map((filterOpt) => (
                      <button
                        key={filterOpt}
                        onClick={() => handleSetCardFilter(item.id, filterOpt)}
                        className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${
                          item.currentFilter === filterOpt
                            ? 'bg-white text-emerald-800 shadow-2xs font-extrabold border border-gray-200/50'
                            : 'text-gray-400 hover:text-gray-700'
                        }`}
                      >
                        {filterOpt === 'TODAY' ? 'Today' : 'Tomorrow'}
                      </button>
                    ))}
                  </div>

                  {item.dayMeetings.length === 0 ? (
                    <div className="p-2.5 rounded-xl border border-dashed border-gray-200 text-center text-[11px] font-medium text-gray-400 bg-gray-50/50">
                      No meetings scheduled for this day. Available for focus work.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {item.dayMeetings.map((m: any, mIdx: number) => (
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
                              <span className="text-[9px] font-extrabold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded uppercase shrink-0">
                                Active Now
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
                            <Clock className="w-3 h-3 text-gray-400" />
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

