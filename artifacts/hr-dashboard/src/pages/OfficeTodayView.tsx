import React from 'react';
import { Video, Calendar, Clock, Building2, Laptop, CheckCircle2 } from 'lucide-react';
import { useEntity } from '../contexts/EntityContext';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

export const OfficeTodayView: React.FC = () => {
  const { selectedEntity } = useEntity();

  const presenceList = [
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
        { title: 'System Security Sync', time: '02:00 PM - 02:45 PM', active: false },
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
        { title: 'Marketing Content Retrospective', time: '03:00 PM - 03:45 PM', active: false },
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
        { title: 'Enterprise Sales Partnership Call', time: '03:30 PM - 04:30 PM', active: false },
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

  const filteredPresence = presenceList.filter(
    item => selectedEntity === 'ALL' || item.entity === selectedEntity
  );

  return (
    <div className="p-6 space-y-6 select-none">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Office Today & Live Presence</h2>
        <p className="text-xs text-gray-500 font-medium">Real-time presence, active meeting status, and today's calendar schedule for each team member.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredPresence.map(item => (
          <div key={item.name} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-5">
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
    </div>
  );
};
