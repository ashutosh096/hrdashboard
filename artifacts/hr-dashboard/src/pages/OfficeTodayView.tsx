import React from 'react';
import { Video, Calendar, Clock, Building2, Laptop, CheckCircle2 } from 'lucide-react';
import { useEntity } from '../contexts/EntityContext';

export const OfficeTodayView: React.FC = () => {
  const { selectedEntity } = useEntity();

  const presenceList = [
    {
      name: 'Priya Sharma',
      entity: 'EHM',
      entityName: 'ehmconsultancy',
      dept: 'Marketing',
      role: 'Senior Brand Strategist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Busy in Meeting — until 09:30 AM',
      isMeeting: true,
      workMode: 'IN_OFFICE',
      todayMeetings: [
        { title: 'Team Standup & Sprint Sync', time: '09:00 AM - 09:30 AM', active: true },
        { title: 'Design Review & Assets Audit', time: '11:30 AM - 12:15 PM', active: false },
        { title: 'Brand Client Campaign Review', time: '02:00 PM - 02:45 PM', active: false },
        { title: 'Marketing Weekly Retrospective', time: '04:30 PM - 05:00 PM', active: false },
      ],
    },
    {
      name: 'Rahul Verma',
      entity: 'CAG',
      entityName: 'climagroanalytics',
      dept: 'Engineering',
      role: 'IoT Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'In Office (Present)',
      isMeeting: false,
      workMode: 'IN_OFFICE',
      todayMeetings: [
        { title: 'IoT Sensor API Architecture Sync', time: '10:00 AM - 10:45 AM', active: false },
        { title: 'CliAgro Telemetry Pipeline Demo', time: '03:00 PM - 03:45 PM', active: false },
      ],
    },
    {
      name: 'Anita Desai',
      entity: 'EHM',
      entityName: 'ehmconsultancy',
      dept: 'Operations',
      role: 'Operations Manager',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      status: 'Busy in Meeting — until 12:15 PM',
      isMeeting: true,
      workMode: 'IN_OFFICE',
      todayMeetings: [
        { title: 'Q3 Vendor Procurement Audit', time: '11:30 AM - 12:15 PM', active: true },
        { title: 'Cross-Entity Ops Review', time: '02:30 PM - 03:15 PM', active: false },
        { title: 'EHM Facilities & Logistics Sync', time: '04:00 PM - 04:30 PM', active: false },
      ],
    },
    {
      name: 'Vikram Mehta',
      entity: 'CAG',
      entityName: 'climagroanalytics',
      dept: 'Finance',
      role: 'Lead Financial Analyst',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'Remote Working',
      isMeeting: false,
      workMode: 'REMOTE',
      todayMeetings: [
        { title: 'Agri-Tech Depreciation Audit', time: '01:00 PM - 01:45 PM', active: false },
      ],
    },
  ];

  const filtered = presenceList.filter(p => selectedEntity === 'ALL' || p.entity === selectedEntity);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Office Today & Live Presence</h2>
        <p className="text-xs text-gray-500 font-medium">
          Real-time presence, active meeting status, and today's calendar schedule for each team member.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            {/* Employee Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-xs"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                        item.isMeeting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    ></span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                    <span className="text-[11px] text-gray-400 font-semibold block">{item.entityName}</span>
                    <span className="text-[11px] text-emerald-600 font-medium">{item.role}</span>
                  </div>
                </div>
              </div>

              {/* Current Live Status Pill */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    item.isMeeting
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : item.workMode === 'REMOTE'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {item.isMeeting ? (
                    <Video className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  ) : item.workMode === 'REMOTE' ? (
                    <Laptop className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{item.status}</span>
                </span>
              </div>

              {/* Today's Meetings Schedule Breakdown */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    Today's Meetings ({item.todayMeetings.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {item.todayMeetings.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-2 rounded-xl border text-xs transition-all ${
                        m.active
                          ? 'bg-amber-50/90 border-amber-300 text-amber-900 font-semibold'
                          : 'bg-gray-50/70 border-gray-100 text-gray-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold mb-0.5">
                        <span className={m.active ? 'text-amber-800' : 'text-gray-900'}>{m.title}</span>
                        {m.active && (
                          <span className="text-[9px] font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded uppercase">
                            Active Now
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
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
    </div>
  );
};
