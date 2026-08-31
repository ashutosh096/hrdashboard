import React, { useState } from 'react';
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock3, Palmtree, Lock, Building2 } from 'lucide-react';
import { MarkAttendanceModal } from '../components/MarkAttendanceModal';
import { useAuth } from '../contexts/AuthContext';

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  // Attendance state for today
  const [todayAttendance, setTodayAttendance] = useState<{
    marked: boolean;
    status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    workMode?: 'IN_OFFICE' | 'REMOTE';
  }>({
    marked: false,
  });

  const isEmployee = user?.role === 'EMPLOYEE';

  const months = [
    'August 2026',
    'July 2026',
    'June 2026',
    'May 2026',
    'April 2026',
    'March 2026',
  ];

  // Employee-specific summary count (Image 2 Match)
  const employeeStats = {
    present: todayAttendance.marked && todayAttendance.status === 'PRESENT' ? 22 : 21,
    absent: todayAttendance.marked && todayAttendance.status === 'ABSENT' ? 1 : 0,
    halfDay: todayAttendance.marked && todayAttendance.status === 'HALF_DAY' ? 1 : 0,
    leave: todayAttendance.marked && todayAttendance.status === 'LEAVE' ? 1 : 0,
  };

  const allEmployeesSummary = [
    { name: 'Priya Sharma', email: 'priya@ehmconsultancy.com', daysPresent: 22, totalDays: 22, rate: 100 },
    { name: 'Rahul Verma', email: 'rahul@climagroanalytics.com', daysPresent: 20, totalDays: 22, rate: 91 },
    { name: 'Anita Desai', email: 'anita@ehmconsultancy.com', daysPresent: 21, totalDays: 22, rate: 95 },
    { name: 'Vikram Mehta', email: 'vikram@climagroanalytics.com', daysPresent: 18, totalDays: 22, rate: 82 },
  ];

  const employeeOnlySummary = [
    {
      name: user?.name || 'Priya Sharma',
      email: user?.email || 'priya@ehmconsultancy.com',
      daysPresent: employeeStats.present,
      totalDays: 22,
      rate: Math.round((employeeStats.present / 22) * 100),
    },
  ];

  const handleAttendanceSubmitted = (data: any) => {
    setTodayAttendance({
      marked: true,
      status: data.status,
      halfDayType: data.halfDayType,
      workMode: data.workMode,
    });
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Attendance & Presence</h2>
          <p className="text-xs text-gray-500 font-medium">
            {isEmployee ? 'Mark daily presence and track monthly attendance status.' : 'Monthly presence tracking and working days summary per employee.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector Pill */}
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

          {/* Employee Mark Attendance Button / Locked Status */}
          {isEmployee && (
            todayAttendance.marked ? (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl shadow-2xs">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Attendance Marked & Locked ({todayAttendance.status})</span>
              </div>
            ) : (
              <button
                onClick={() => setIsMarkModalOpen(true)}
                className="flex items-center gap-2 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all animate-bounce"
              >
                <Clock className="w-4 h-4" />
                <span>Mark Attendance Today</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Image 2 Top Stat Cards for Employee View */}
      {isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PRESENT CARD (Green) */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-bold shadow-2xs border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-950">{employeeStats.present}</span>
              <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wider">PRESENT</span>
            </div>
          </div>

          {/* ABSENT CARD (Red/Pink) */}
          <div className="bg-red-50/80 border border-red-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold shadow-2xs border border-red-100">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-red-950">{employeeStats.absent}</span>
              <span className="text-[11px] font-bold text-red-700 block uppercase tracking-wider">ABSENT</span>
            </div>
          </div>

          {/* HALF DAY CARD (Light Blue) */}
          <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold shadow-2xs border border-blue-100">
              <Clock3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-blue-950">{employeeStats.halfDay}</span>
              <span className="text-[11px] font-bold text-blue-700 block uppercase tracking-wider">HALF DAY</span>
            </div>
          </div>

          {/* LEAVE CARD (Purple) */}
          <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-purple-600 flex items-center justify-center font-bold shadow-2xs border border-purple-100">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-purple-950">{employeeStats.leave}</span>
              <span className="text-[11px] font-bold text-purple-700 block uppercase tracking-wider">LEAVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Presence Summary Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Monthly Presence Summary — {selectedMonth}
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            {isEmployee ? 'Your individual monthly working days & presence rate' : 'Total working days each employee was present'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Days Present</th>
                <th className="py-2.5 px-3">Breakdown</th>
                <th className="py-2.5 px-3">Presence Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {(isEmployee ? employeeOnlySummary : allEmployeesSummary).map((emp, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-gray-900 block">{emp.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium block">{emp.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs">
                      {emp.daysPresent} days Present
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-600">
                    {emp.daysPresent} Present / {emp.totalDays - emp.daysPresent} Absent
                  </td>
                  <td className="py-3 px-3 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${emp.rate}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-800 text-[11px]">{emp.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal with Confirmation & Lock */}
      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        onSubmitAttendance={handleAttendanceSubmitted}
      />
    </div>
  );
};
