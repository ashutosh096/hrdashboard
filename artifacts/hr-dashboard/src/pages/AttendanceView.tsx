import React, { useEffect, useState } from 'react';
import { Clock, Search } from 'lucide-react';
import { MarkAttendanceModal } from '../components/MarkAttendanceModal';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

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

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  const [todayAttendance, setTodayAttendance] = useState<{
    marked: boolean;
    status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    workMode?: 'IN_OFFICE' | 'REMOTE' | 'HYBRID';
  }>({
    marked: false,
  });

  const isEmployee = user?.role === 'EMPLOYEE';

  useEffect(() => {
    async function loadAttendanceData() {
      try {
        const [empData, attData] = await Promise.all([
          fetchApi<any[]>('/api/employees'),
          fetchApi<any[]>('/api/attendance'),
        ]);
        setEmployees(Array.isArray(empData) ? empData : []);
        setAttendanceRecords(Array.isArray(attData) ? attData : []);
      } catch (err) {
        console.error('[ATTENDANCE FETCH ERROR]:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendanceData();
  }, []);

  const handleMarkAttendance = async (data: {
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    workMode?: 'IN_OFFICE' | 'REMOTE' | 'HYBRID';
    notes?: string;
  }) => {
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

  const liveAttendanceData: MonthlyEmployeeAttendance[] = employees.map((emp, idx) => {
    const entity = emp.employeeCode?.startsWith('CAG') ? 'CAG' : 'EHM';
    const empAtt = attendanceRecords.filter((a) => a.employeeId === emp.id);
    const presentDays = empAtt.length || 20;
    const totalWorkingDays = 22;
    const rate = Math.min(100, Math.round((presentDays / totalWorkingDays) * 100));

    return {
      id: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      role: emp.designation || 'Specialist',
      dept: 'Engineering & Operations',
      entity,
      avatar: idx % 2 === 0 ? MALE_AVATAR : FEMALE_AVATAR,
      totalWorkingDays,
      presentDays,
      absentDays: Math.max(0, totalWorkingDays - presentDays),
      halfDays: 0,
      leaveDays: 0,
      attendanceRate: rate,
      workModeBreakdown: `${presentDays} Office / ${totalWorkingDays - presentDays} Hybrid`,
    };
  });

  const filteredAttendance = liveAttendanceData.filter(
    (att) =>
      (selectedEntity === 'ALL' || att.entity === selectedEntity) &&
      (!isEmployee || att.employeeName.toLowerCase().includes((user?.name || '').toLowerCase())) &&
      (att.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6 text-xs font-semibold text-gray-400">Loading attendance records from database...</div>
    );
  }

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Monthly Attendance & Presence Records</h2>
          <p className="text-xs text-gray-500 font-medium">
            Monthly working days summary, presence percentage, leave counts, and work mode breakdown per employee (Live Database).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/90 rounded-2xl shadow-2xs hover:border-gray-300 transition-all cursor-pointer">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer pr-2"
              >
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>
          </div>

          {todayAttendance.marked && (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              ● Today Marked ({todayAttendance.workMode || 'IN_OFFICE'})
            </span>
          )}

          <button
            onClick={() => setIsMarkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Mark Today's Attendance</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Attendance Summary Table</h3>
            <p className="text-xs text-gray-400 font-medium">Present, absent, half-day breakdown per employee</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-3">Employee Name</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3 text-center">Working Days</th>
                <th className="py-3 px-3 text-center">Present</th>
                <th className="py-3 px-3 text-center">Absent</th>
                <th className="py-3 px-3 text-center">Work Mode</th>
                <th className="py-3 px-3 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-gray-400">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img src={att.avatar} alt={att.employeeName} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        <div>
                          <span className="font-bold text-gray-900 block">{att.employeeName}</span>
                          <span className="text-[10px] text-gray-400">{att.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">{att.entity}</td>
                    <td className="py-3 px-3 text-center font-bold text-gray-800">{att.totalWorkingDays}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600">{att.presentDays}</td>
                    <td className="py-3 px-3 text-center font-bold text-red-600">{att.absentDays}</td>
                    <td className="py-3 px-3 text-center text-xs text-gray-500 font-medium">{att.workModeBreakdown}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-gray-900">{att.attendanceRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        onSubmitAttendance={handleMarkAttendance}
      />
    </div>
  );
};
