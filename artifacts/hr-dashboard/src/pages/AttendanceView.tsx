import React, { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Calendar,
  CheckCircle2,
  Building2,
  Home,
  AlertCircle,
  HelpCircle,
  Lock,
  Edit,
  Filter,
  Users,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { MarkAttendanceModal } from '../components/MarkAttendanceModal';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName, isFemaleEmployee } from '../utils/avatars';
import { matchesEntityFilter } from '../utils/entityUtils';
import { getKolkataDateString } from '../utils/dateUtils';

interface EmployeeAttendanceRow {
  id: string;
  employeeName: string;
  email?: string;
  role: string;
  dept: string;
  entity: string;
  entityCode: 'CAG' | 'EHM' | 'BOTH';
  entityBadgeClass: string;
  avatar: string;
  isFemale: boolean;
  // Monthly metrics
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  attendanceRate: number;
  workModeBreakdown: string;
  // Today's metrics
  todayStatus: 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'LEAVE' | 'NOT_MARKED';
  todayWorkMode: 'IN_OFFICE' | 'REMOTE' | 'HYBRID' | null;
  todayClockIn: string | null;
}

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter Mode: 'TODAY' | 'MONTHLY' | 'CUSTOM'
  const [activeFilterTab, setActiveFilterTab] = useState<'TODAY' | 'MONTHLY' | 'CUSTOM'>('TODAY');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'NOT_MARKED'>('ALL');

  // Generate dynamic rolling list of months (current month + past 5 months)
  const availableMonths = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push(d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' }));
    }
    return list;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' });
  });

  const [customDate, setCustomDate] = useState<string>(() => {
    return getKolkataDateString();
  });

  const [todayDateKey, setTodayDateKey] = useState<string>(() => {
    return getKolkataDateString();
  });

  const [todayDateFormatted, setTodayDateFormatted] = useState<string>(() => {
    return new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  const [todayAttendance, setTodayAttendance] = useState<{
    marked: boolean;
    status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    workMode?: 'IN_OFFICE' | 'REMOTE';
  }>({
    marked: false,
  });

  // Find current user's matching employee profile
  const currentEmployee = useMemo(() => {
    return employees.find(
      (e) =>
        (user?.employeeId && e.id === user.employeeId) ||
        (user?.email && e.email?.toLowerCase() === user.email.toLowerCase())
    );
  }, [employees, user]);

  const currentEmployeeId = currentEmployee?.id || user?.employeeId;

  // Track 1-time edit permission for today
  const [hasEditedToday, setHasEditedToday] = useState<boolean>(false);

  useEffect(() => {
    try {
      const idKey = currentEmployeeId || user?.id || user?.email;
      if (idKey) {
        const key = `attendance_edited_${todayDateKey}_${idKey}`;
        setHasEditedToday(localStorage.getItem(key) === 'true');
      }
    } catch {
      setHasEditedToday(false);
    }
  }, [todayDateKey, currentEmployeeId, user]);

  const activeRole = localStorage.getItem('hros_active_role') || user?.role || 'EMPLOYEE';
  const isEmployeeMode = activeRole === 'EMPLOYEE';

  const loadAttendanceData = async () => {
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
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  // Monitor midnight 12:00 AM date change in Indian Standard Time (IST) to automatically roll over today's date & attendance
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDayStr = getKolkataDateString(new Date());
      if (currentDayStr !== todayDateKey) {
        setTodayDateKey(currentDayStr);
        setTodayDateFormatted(
          new Date().toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        );
        setSelectedMonth(
          new Date().toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
            month: 'long',
            year: 'numeric',
          })
        );
        setTodayAttendance({ marked: false });
        setHasEditedToday(false);
        setStatusFilter('ALL');
        loadAttendanceData();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [todayDateKey]);

  // Sync today's attendance status from loaded records for current user
  useEffect(() => {
    if (attendanceRecords.length > 0 && (user || currentEmployeeId)) {
      const todayIso = todayDateKey;
      const foundToday = attendanceRecords.find(a => 
        (a.date === todayIso || (a.createdAt && String(a.createdAt).startsWith(todayIso))) &&
        (
          (currentEmployeeId && a.employeeId === currentEmployeeId) ||
          (user?.email && (a.employeeEmail?.toLowerCase() === user.email.toLowerCase() || a.employeeName?.toLowerCase() === user.email.toLowerCase()))
        )
      );
      if (foundToday) {
        setTodayAttendance({
          marked: true,
          status: (foundToday.status as any) || 'PRESENT',
          workMode: (foundToday.workMode as any) || 'IN_OFFICE',
        });
      }
    }
  }, [attendanceRecords, user, currentEmployeeId, todayDateKey]);

  const handleMarkAttendance = async (data: {
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    workMode: 'IN_OFFICE' | 'REMOTE';
    isEdit?: boolean;
  }) => {
    try {
      await fetchApi('/api/attendance/clock-in', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: currentEmployeeId,
          workMode: data.workMode || 'IN_OFFICE',
          status: data.status,
          date: todayDateKey,
          isEdit: data.isEdit,
        }),
      });

      setTodayAttendance({
        marked: true,
        status: data.status,
        halfDayType: data.halfDayType,
        workMode: data.workMode,
      });

      if (data.isEdit) {
        const idKey = currentEmployeeId || user?.id || user?.email;
        const key = `attendance_edited_${todayDateKey}_${idKey}`;
        localStorage.setItem(key, 'true');
        setHasEditedToday(true);
        toast.success("Attendance updated successfully! This was your 1 allowed edit for today.");
      } else {
        toast.success("Attendance submitted for today! You have 1 edit available if needed.");
      }

      loadAttendanceData();
    } catch (err: any) {
      console.error('[CLOCK IN ERROR]:', err);
      toast.error(err?.message || 'Failed to submit attendance');
    }
  };

  // Compile Comprehensive Employee Attendance Data
  const liveAttendanceData: EmployeeAttendanceRow[] = useMemo(() => {
    return employees.map((emp) => {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Team Member';
      
      // Correct entity mapping: Read emp.entityCode, emp.entity, or emp.entityName
      const rawEntity = (emp.entityCode || emp.entity || '').toUpperCase();
      let entityCode: 'CAG' | 'EHM' | 'BOTH' = 'EHM';
      let entity = 'EHM';
      let entityBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';

      if (rawEntity === 'CAG' || rawEntity === 'CLIMAGRO') {
        entityCode = 'CAG';
        entity = 'CLIMAGRO';
        entityBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (rawEntity === 'COMMON' || rawEntity === 'BOTH') {
        entityCode = 'BOTH';
        entity = 'EHM & CLIMAGRO';
        entityBadgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
      }

      // Gender avatar determination: Only Prerna, Tarul, and Neha are female (pink), rest are male (blue)
      const isFemale = isFemaleEmployee(fullName, emp.email);
      const avatar = getAvatarByName(fullName, emp.email);

      // Filter all attendance records for this employee
      const empAtt = attendanceRecords.filter(
        (a) =>
          a.employeeId === emp.id ||
          (emp.email && (a.employeeEmail?.toLowerCase() === emp.email.toLowerCase() || a.employeeName?.toLowerCase() === fullName.toLowerCase()))
      );

      // Monthly metrics filtered specifically by the selectedMonth (e.g., "October 2026")
      const monthRecords = empAtt.filter((a) => {
        if (!a.date) return false;
        try {
          const d = new Date(a.date + 'T00:00:00');
          const recordMonth = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          return recordMonth === selectedMonth;
        } catch {
          return false;
        }
      });

      const presentDays = monthRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const halfDays = monthRecords.filter(a => a.status === 'HALF_DAY').length;
      const leaveDays = monthRecords.filter(a => a.status === 'LEAVE' || a.status === 'ABSENT').length;
      const totalAttended = presentDays + (halfDays * 0.5);

      const hasRecords = monthRecords.length > 0;
      const totalWorkingDays = hasRecords ? 22 : 0;
      const absentDays = hasRecords ? Math.max(0, totalWorkingDays - presentDays - halfDays) : 0;
      const rate = totalWorkingDays > 0 ? Math.min(100, Math.round((totalAttended / totalWorkingDays) * 100)) : 0;

      const officeCount = monthRecords.filter(a => a.workMode === 'IN_OFFICE').length;
      const remoteCount = monthRecords.filter(a => a.workMode === 'REMOTE' || a.workMode === 'HYBRID').length;
      const workModeBreakdown = hasRecords ? `${officeCount} Office / ${remoteCount} Remote` : 'No records this month';

      // Determine attendance for target date (Today or Custom selected date)
      const targetDateKey = activeFilterTab === 'CUSTOM' ? customDate : todayDateKey;
      const matchedRecord = empAtt.find(
        (a) => a.date === targetDateKey || (a.createdAt && String(a.createdAt).startsWith(targetDateKey))
      );

      let todayStatus: EmployeeAttendanceRow['todayStatus'] = 'NOT_MARKED';
      let todayWorkMode: EmployeeAttendanceRow['todayWorkMode'] = null;
      let todayClockIn: string | null = null;

      if (matchedRecord) {
        todayStatus = (matchedRecord.status as any) || 'PRESENT';
        todayWorkMode = (matchedRecord.workMode as any) || 'IN_OFFICE';
        todayClockIn = matchedRecord.clockIn || 'Marked';
      }

      return {
        id: emp.id,
        employeeName: fullName,
        email: emp.email,
        role: emp.designation || 'Specialist',
        dept: emp.departmentName || 'Product & Tech',
        entity,
        entityCode,
        entityBadgeClass,
        avatar,
        isFemale,
        totalWorkingDays,
        presentDays,
        absentDays,
        halfDays,
        leaveDays,
        attendanceRate: rate,
        workModeBreakdown,
        todayStatus,
        todayWorkMode,
        todayClockIn,
      };
    });
  }, [employees, attendanceRecords, todayDateKey, customDate, activeFilterTab, selectedMonth]);

  // Base entity-matched attendance for full team visibility
  const baseScopedAttendance = useMemo(() => {
    return liveAttendanceData.filter((att) => {
      return matchesEntityFilter({ entity: att.entity, entityCode: att.entityCode }, selectedEntity);
    });
  }, [liveAttendanceData, selectedEntity]);

  // KPI Metrics for Today / Custom Date (calculated accurately from base scoped roster)
  const todayKPIs = useMemo(() => {
    const total = baseScopedAttendance.length;
    const present = baseScopedAttendance.filter(a => a.todayStatus === 'PRESENT' || a.todayStatus === 'HALF_DAY').length;
    const notMarked = baseScopedAttendance.filter(a => a.todayStatus === 'NOT_MARKED').length;

    return { total, present, notMarked };
  }, [baseScopedAttendance]);

  // Filtered attendance applied to the table
  const filteredAttendance = useMemo(() => {
    return baseScopedAttendance.filter((att) => {
      const matchesSearch =
        att.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.role.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (activeFilterTab === 'TODAY' || activeFilterTab === 'CUSTOM') {
        if (statusFilter === 'PRESENT') {
          matchesStatus = att.todayStatus === 'PRESENT' || att.todayStatus === 'HALF_DAY';
        } else if (statusFilter === 'NOT_MARKED') {
          matchesStatus = att.todayStatus === 'NOT_MARKED';
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [baseScopedAttendance, searchTerm, activeFilterTab, statusFilter]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-gray-500 animate-pulse">
        Loading attendance records from live database...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 select-none max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              ATTENDANCE & PRESENCE
            </span>
            <span className="text-xs font-semibold text-gray-500">• Live Database</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Team Attendance System</h2>
          <p className="text-xs text-gray-500 font-medium">
            Daily check-ins, monthly attendance percentages, work mode tracking, and verified company presence.
          </p>
        </div>

        {/* User Attendance Action Capsule */}
        <div className="flex items-center flex-wrap gap-2.5">
          {todayAttendance.marked ? (
            <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-1.5 pr-3 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 px-2.5 py-1 rounded-xl bg-white border border-emerald-200 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Today: {todayAttendance.status} ({todayAttendance.workMode === 'REMOTE' ? 'Work From Home' : 'In Office'})</span>
              </span>

              {/* 1-Time Edit Option */}
              {!hasEditedToday ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(true);
                    setIsMarkModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-amber-600"
                  title="You can edit your attendance only one time today"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit (1 edit left)</span>
                </button>
              ) : (
                <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-2 py-1 rounded-lg border border-gray-200 flex items-center gap-1 shadow-2xs" title="1 edit already used for today">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span>Locked (1 edit used)</span>
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditMode(false);
                setIsMarkModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Switcher Bar: TODAY vs MONTHLY vs CUSTOM */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center p-1 bg-gray-100 border border-gray-200 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveFilterTab('TODAY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === 'TODAY'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Today's Live Presence</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('MONTHLY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === 'MONTHLY'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Monthly Summary</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('CUSTOM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === 'CUSTOM'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Custom Date</span>
            </button>
          </div>

          {/* Sub-Filters / Date Controls */}
          <div className="flex items-center gap-2.5">
            {activeFilterTab === 'MONTHLY' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {activeFilterTab === 'CUSTOM' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
                />
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee, dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Live Functional KPI Cards for Today / Custom Date */}
        {(activeFilterTab === 'TODAY' || activeFilterTab === 'CUSTOM') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            {/* Total Team Tile */}
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-700/20'
                  : 'bg-slate-50 text-gray-800 border-gray-200/90 hover:bg-slate-100'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold block ${statusFilter === 'ALL' ? 'text-slate-300' : 'text-gray-500'}`}>
                Total Team
              </span>
              <span className="text-xl font-black block mt-0.5">{todayKPIs.total}</span>
              <span className={`text-[10px] font-semibold block mt-0.5 ${statusFilter === 'ALL' ? 'text-slate-300 font-bold' : 'text-gray-400'}`}>
                {statusFilter === 'ALL' ? '✓ Showing all members' : 'Click to show all'}
              </span>
            </button>

            {/* Present Tile */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'PRESENT' ? 'ALL' : 'PRESENT')}
              className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                statusFilter === 'PRESENT'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold block ${statusFilter === 'PRESENT' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                Present
              </span>
              <span className="text-xl font-black block mt-0.5">{todayKPIs.present}</span>
              <span className={`text-[10px] font-semibold block mt-0.5 ${statusFilter === 'PRESENT' ? 'text-emerald-100 font-bold' : 'text-emerald-600'}`}>
                {statusFilter === 'PRESENT' ? '✓ Filter active (Click to reset)' : 'Click to filter present'}
              </span>
            </button>

            {/* Not Marked Tile */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'NOT_MARKED' ? 'ALL' : 'NOT_MARKED')}
              className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                statusFilter === 'NOT_MARKED'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-500/30'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/70'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold block ${statusFilter === 'NOT_MARKED' ? 'text-rose-100' : 'text-rose-700'}`}>
                Not Marked
              </span>
              <span className="text-xl font-black block mt-0.5">{todayKPIs.notMarked}</span>
              <span className={`text-[10px] font-semibold block mt-0.5 ${statusFilter === 'NOT_MARKED' ? 'text-rose-100 font-bold' : 'text-rose-600'}`}>
                {statusFilter === 'NOT_MARKED' ? '✓ Filter active (Click to reset)' : 'Click to filter not marked'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-gray-900">
              {activeFilterTab === 'TODAY'
                ? `Today's Presence Roster (${todayDateFormatted})`
                : activeFilterTab === 'CUSTOM'
                ? `Custom Date Attendance (${new Date(customDate + 'T00:00:00').toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })})`
                : `Monthly Attendance Summary (${selectedMonth})`}
            </h3>
            <span className="text-xs text-gray-400 font-bold">({filteredAttendance.length} employees)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Role / Dept</th>
                {activeFilterTab === 'TODAY' || activeFilterTab === 'CUSTOM' ? (
                  <>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Work Mode</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-3 text-center">Working Days</th>
                    <th className="py-3 px-3 text-center">Present</th>
                    <th className="py-3 px-3 text-center">Absent</th>
                    <th className="py-3 px-3 text-center">Work Mode</th>
                    <th className="py-3 px-4 text-right">Attendance %</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={activeFilterTab === 'TODAY' || activeFilterTab === 'CUSTOM' ? 5 : 7} className="py-10 text-center text-xs text-gray-400 font-semibold">
                    No matching attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Employee Name with Gender Icon (Blue for Male, Pink for Female) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={att.avatar}
                            alt={att.employeeName}
                            className={`w-8 h-8 rounded-full object-cover border-2 shadow-2xs ${
                              att.isFemale
                                ? 'border-pink-300 ring-2 ring-pink-100'
                                : 'border-sky-300 ring-2 ring-sky-100'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 block truncate">{att.employeeName}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{att.email || ''}</span>
                        </div>
                      </div>
                    </td>

                    {/* Accurate Entity Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border ${att.entityBadgeClass}`}>
                        {att.entity}
                      </span>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-800 block text-xs">{att.role}</span>
                      <span className="text-[10px] text-gray-400 block">{att.dept}</span>
                    </td>

                    {/* Today / Custom View Columns */}
                    {activeFilterTab === 'TODAY' || activeFilterTab === 'CUSTOM' ? (
                      <>
                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {att.todayStatus === 'PRESENT' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Present
                            </span>
                          )}
                          {att.todayStatus === 'HALF_DAY' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Half Day
                            </span>
                          )}
                          {att.todayStatus === 'ABSENT' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Absent
                            </span>
                          )}
                          {att.todayStatus === 'LEAVE' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                              On Leave
                            </span>
                          )}
                          {att.todayStatus === 'NOT_MARKED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                              Not Marked Yet
                            </span>
                          )}
                        </td>

                        {/* Work Mode */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {att.todayWorkMode === 'IN_OFFICE' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>In Office</span>
                            </span>
                          )}
                          {att.todayWorkMode === 'REMOTE' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700">
                              <Home className="w-3.5 h-3.5 text-blue-600" />
                              <span>Work From Home</span>
                            </span>
                          )}
                          {!att.todayWorkMode && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Monthly Summary Columns */}
                        <td className="py-3 px-3 text-center font-bold text-gray-800">{att.totalWorkingDays}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600">{att.presentDays}</td>
                        <td className="py-3 px-3 text-center font-bold text-red-600">{att.absentDays}</td>
                        <td className="py-3 px-3 text-center text-xs text-gray-500 font-medium">{att.workModeBreakdown}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-gray-900 text-xs">{att.attendanceRate}%</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Modal (supports Initial Mark & 1-Time Edit) */}
      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => {
          setIsMarkModalOpen(false);
          setIsEditMode(false);
        }}
        isEditMode={isEditMode}
        initialStatus={todayAttendance.status || 'PRESENT'}
        initialWorkMode={todayAttendance.workMode || 'IN_OFFICE'}
        onSubmitAttendance={handleMarkAttendance}
      />
    </div>
  );
};

export default AttendanceView;
