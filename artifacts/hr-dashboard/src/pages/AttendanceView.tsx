import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock3, Palmtree, Lock, Search, Users, Award } from 'lucide-react';
import { MarkAttendanceModal } from '../components/MarkAttendanceModal';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

import { useEntity } from '../contexts/EntityContext';

interface MonthlyEmployeeAttendance {
  id: string;
  employeeName: string;
  role: string;
  dept: string;
  entity: 'EHM' | 'CAG';
  avatar: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  attendanceRate: number;
  workModeBreakdown: string;
}

const MOCK_MONTHLY_ATTENDANCE: MonthlyEmployeeAttendance[] = [
  {
    id: 'att-1',
    employeeName: 'Ashutosh Mishra',
    role: 'Lead Systems Architect',
    dept: 'Product & Tech',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 21,
    absentDays: 0,
    halfDays: 1,
    leaveDays: 0,
    attendanceRate: 95,
    workModeBreakdown: '18 Office / 3 Remote',
  },
  {
    id: 'att-2',
    employeeName: 'Priyanka Sharma',
    role: 'Senior Brand Strategist',
    dept: 'Marketing',
    entity: 'EHM',
    avatar: FEMALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 20,
    absentDays: 1,
    halfDays: 1,
    leaveDays: 0,
    attendanceRate: 91,
    workModeBreakdown: '15 Office / 5 Remote / 2 Hybrid',
  },
  {
    id: 'att-3',
    employeeName: 'Utkarsh Mishra',
    role: 'Operations Lead',
    dept: 'Operations & Delivery',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 22,
    absentDays: 0,
    halfDays: 0,
    leaveDays: 0,
    attendanceRate: 100,
    workModeBreakdown: '20 Office / 2 Hybrid',
  },
  {
    id: 'att-4',
    employeeName: 'Prerna Shukla',
    role: 'Grants Strategist',
    dept: 'Grants & Governance',
    entity: 'EHM',
    avatar: FEMALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 19,
    absentDays: 1,
    halfDays: 1,
    leaveDays: 1,
    attendanceRate: 86,
    workModeBreakdown: '14 Office / 5 Remote',
  },
  {
    id: 'att-5',
    employeeName: 'Shreyansh Siladar',
    role: 'Social Media Lead',
    dept: 'SM Marketing',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 20,
    absentDays: 0,
    halfDays: 2,
    leaveDays: 0,
    attendanceRate: 91,
    workModeBreakdown: '16 Office / 4 Hybrid',
  },
  {
    id: 'att-6',
    employeeName: "Tarul Ma'am",
    role: 'Delivery Associate',
    dept: 'Operations & Delivery',
    entity: 'CAG',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 21,
    absentDays: 1,
    halfDays: 0,
    leaveDays: 0,
    attendanceRate: 95,
    workModeBreakdown: '18 Office / 3 Remote',
  },
  {
    id: 'att-7',
    employeeName: 'Dr. Harshit Mishra',
    role: 'Managing Director / Sales Lead',
    dept: 'Sales',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 22,
    absentDays: 0,
    halfDays: 0,
    leaveDays: 0,
    attendanceRate: 100,
    workModeBreakdown: '22 Office',
  },
  {
    id: 'att-8',
    employeeName: 'Neha Shukla',
    role: 'Marketing Lead',
    dept: 'Marketing',
    entity: 'EHM',
    avatar: FEMALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 21,
    absentDays: 0,
    halfDays: 1,
    leaveDays: 0,
    attendanceRate: 95,
    workModeBreakdown: '19 Office / 2 Hybrid',
  },
  {
    id: 'att-9',
    employeeName: 'Dr. Utsav Mishra',
    role: 'Operations VP',
    dept: 'Operations & Delivery',
    entity: 'CAG',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 21,
    absentDays: 0,
    halfDays: 1,
    leaveDays: 0,
    attendanceRate: 95,
    workModeBreakdown: '20 Office / 1 Remote',
  },
  {
    id: 'att-10',
    employeeName: 'Jitendra Sir',
    role: 'Chief Technology Officer',
    dept: 'Product & Tech',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 22,
    absentDays: 0,
    halfDays: 0,
    leaveDays: 0,
    attendanceRate: 100,
    workModeBreakdown: '22 Office',
  },
  {
    id: 'att-11',
    employeeName: 'Pranshu Dubey',
    role: 'DevOps Engineer',
    dept: 'Product & System',
    entity: 'EHM',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 21,
    absentDays: 0,
    halfDays: 1,
    leaveDays: 0,
    attendanceRate: 95,
    workModeBreakdown: '17 Office / 4 Hybrid',
  },
  {
    id: 'att-12',
    employeeName: 'Himanshu Tiwari',
    role: 'Frontend Engineer',
    dept: 'Product & Tech',
    entity: 'CAG',
    avatar: MALE_AVATAR,
    totalWorkingDays: 22,
    presentDays: 20,
    absentDays: 1,
    halfDays: 1,
    leaveDays: 0,
    attendanceRate: 91,
    workModeBreakdown: '15 Office / 5 Remote',
  },
];

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [todayAttendance, setTodayAttendance] = useState<{
    marked: boolean;
    status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    workMode?: 'IN_OFFICE' | 'REMOTE';
  }>({
    marked: false,
  });

  const isEmployee = user?.role === 'EMPLOYEE';
  const months = ['August 2026', 'July 2026', 'June 2026', 'May 2026'];

  const handleAttendanceSubmitted = async (data: any) => {
    try {
      await fetchApi('/api/attendance/clock-in', {
        method: 'POST',
        body: JSON.stringify({ workMode: data.workMode || 'IN_OFFICE', employeeName: user?.email }),
      });
      setTodayAttendance({
        marked: true,
        status: data.status,
        halfDayType: data.halfDayType,
        workMode: data.workMode,
      });
    } catch (err) {
      console.error('[CLOCK IN ERROR]:', err);
    }
  };

  const filteredAttendance = MOCK_MONTHLY_ATTENDANCE.filter(
    (att) =>
      (selectedEntity === 'ALL' || att.entity === selectedEntity) &&
      (!isEmployee || att.employeeName === (user?.name || 'Ashutosh Mishra')) &&
      (att.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Monthly Attendance & Presence Records</h2>
          <p className="text-xs text-gray-500 font-medium">
            Monthly working days summary, presence percentage, leave counts, and work mode breakdown per employee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/90 rounded-2xl shadow-2xs hover:border-gray-300 transition-all cursor-pointer">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer pr-1"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <CalendarIcon className="w-4 h-4 text-gray-500 shrink-0" />
            </div>
          </div>

          {isEmployee && (
            todayAttendance.marked ? (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl shadow-2xs">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Attendance Marked ({todayAttendance.status})</span>
              </div>
            ) : (
              <button
                onClick={() => setIsMarkModalOpen(true)}
                className="flex items-center gap-2 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Mark Attendance Today</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Top Monthly Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-gray-900">91.8%</span>
            <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wider">AVG ATTENDANCE RATE</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-gray-900">22 Days</span>
            <span className="text-[11px] font-bold text-blue-700 block uppercase tracking-wider">WORKING DAYS IN {selectedMonth.toUpperCase()}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-gray-900">20.1 Days</span>
            <span className="text-[11px] font-bold text-amber-700 block uppercase tracking-wider">AVG PRESENT / EMPLOYEE</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-gray-900">16 Staff</span>
            <span className="text-[11px] font-bold text-purple-700 block uppercase tracking-wider">TRACKED EMPLOYEES</span>
          </div>
        </div>
      </div>

      {/* Monthly Presence Summary Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Monthly Attendance Summary — {selectedMonth}
            </h3>
            <p className="text-xs text-gray-400 font-medium">Aggregated monthly working days, presence stats, and work mode breakdown per staff member.</p>
          </div>

          {/* Search Input */}
          <div className="max-w-xs w-full relative">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-emerald-500 transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search employee or dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/60">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4 text-center">Working Days</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Absent / Leave</th>
                <th className="py-3 px-4 text-center">Half Day / Late</th>
                <th className="py-3 px-4 text-center">Attendance Rate</th>
                <th className="py-3 px-4 text-right">Work Mode Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {filteredAttendance.map((att) => (
                <tr key={att.id} className="hover:bg-gray-50/90 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={att.avatar} alt={att.employeeName} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-2xs" />
                      <div>
                        <span className="font-bold text-gray-900 block text-sm">{att.employeeName}</span>
                        <span className="text-[11px] text-gray-400 font-semibold">{att.role} ({att.dept})</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-gray-900">{att.totalWorkingDays} Days</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-extrabold text-xs">
                      {att.presentDays} Days
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-red-600">
                    {att.absentDays + att.leaveDays > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-extrabold text-xs">
                        {att.absentDays + att.leaveDays} Day(s)
                      </span>
                    ) : (
                      <span className="text-gray-400">0 Days</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                    {att.halfDays > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-extrabold text-xs">
                        {att.halfDays} Day(s)
                      </span>
                    ) : (
                      <span className="text-gray-400">0 Days</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                        <div
                          className={`h-full rounded-full ${
                            att.attendanceRate >= 90 ? 'bg-emerald-500' : att.attendanceRate >= 80 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${att.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="font-extrabold text-gray-900 text-xs">{att.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-gray-600">{att.workModeBreakdown}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        onSubmitAttendance={handleAttendanceSubmitted}
      />
    </div>
  );
};
