import React, { useEffect, useState, useMemo } from 'react';
import { BarChart3, Calendar, CheckCircle2, Clock, Search, X } from 'lucide-react';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';

interface EmployeeRecord {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  entityId?: string;
  entityCode?: string;
  entity?: string;
  entityName?: string;
}

interface TaskRecord {
  id: string;
  taskCode?: string;
  title: string;
  assigneeId: string;
  assigneeIds?: string[];
  priority?: string;
  dueDate?: string;
  status: string;
  entityId?: string;
  sprintWeek?: string;
  createdAt?: string;
}

interface EmployeeAnalytics {
  id: string;
  name: string;
  employeeCode?: string;
  entityId?: string;
  entityCode?: string;
  entity: string;
  rawEmp?: any;
  total: number;
  completed: number;
  pending: number;
  rate: number;
}

// Generate dynamic months (current month + future + past)
const DYNAMIC_MONTH_OPTIONS = (() => {
  const options = [];
  const currentDate = new Date();
  for (let i = -2; i <= 9; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();
    const value = `${monthName.toUpperCase()}_${year}`;
    const label = `${monthName} ${year}`;
    options.push({ value, label, month: d.getMonth(), year });
  }
  options.push({ value: 'ALL_MONTHS', label: 'All Months', month: -1, year: 0 });
  return options;
})();

const getCurrentMonthKey = (): string => {
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const year = now.getFullYear();
  return `${monthName}_${year}`;
};

export const TaskAnalyticsPanel: React.FC = () => {
  const { selectedEntity } = useEntity();
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic Month & Week Filter States - default to current live month & All Weeks
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey);
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL_WEEKS');

  useEffect(() => {
    async function loadData() {
      try {
        const [empData, taskData] = await Promise.all([
          fetchApi('/api/employees'),
          fetchApi('/api/tasks'),
        ]);
        setEmployees(Array.isArray(empData) ? empData : []);
        setTasks(Array.isArray(taskData) ? taskData : []);
      } catch (err) {
        console.error('Failed to load task analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Helper to extract task date
  const getTaskDate = (t: TaskRecord): Date | null => {
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      if (!isNaN(d.getTime())) return d;
    }
    if (t.createdAt) {
      const d = new Date(t.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const targetMonthOpt = useMemo(
    () => DYNAMIC_MONTH_OPTIONS.find((o) => o.value === selectedMonth),
    [selectedMonth]
  );

  // Check if task matches selected month
  const matchesMonth = (t: TaskRecord): boolean => {
    if (selectedMonth === 'ALL_MONTHS' || !targetMonthOpt || targetMonthOpt.month === -1) {
      return true;
    }
    const d = getTaskDate(t);
    if (!d) return false;
    return d.getMonth() === targetMonthOpt.month && d.getFullYear() === targetMonthOpt.year;
  };

  // Check if task matches selected week
  const matchesWeek = (t: TaskRecord): boolean => {
    if (selectedWeek === 'ALL_WEEKS') return true;

    const sw = (t.sprintWeek || '').toLowerCase();
    if (selectedWeek === 'WEEK_1' && (sw.includes('week 1') || sw.includes('w1'))) return true;
    if (selectedWeek === 'WEEK_2' && (sw.includes('week 2') || sw.includes('w2'))) return true;
    if (selectedWeek === 'WEEK_3' && (sw.includes('week 3') || sw.includes('w3'))) return true;
    if (selectedWeek === 'WEEK_4' && (sw.includes('week 4') || sw.includes('w4'))) return true;

    // Fallback to day of month from task date
    const d = getTaskDate(t);
    if (d) {
      const day = d.getDate();
      if (selectedWeek === 'WEEK_1') return day >= 1 && day <= 7;
      if (selectedWeek === 'WEEK_2') return day >= 8 && day <= 14;
      if (selectedWeek === 'WEEK_3') return day >= 15 && day <= 21;
      if (selectedWeek === 'WEEK_4') return day >= 22;
    }
    return false;
  };

  const employeeAnalytics: EmployeeAnalytics[] = useMemo(() => {
    return employees
      .map((emp) => {
        // Resolve entity using getEntityBadge directly to match Team Directory page exactly
        const badgeInfo = getEntityBadge(emp);
        const resolvedEntity = badgeInfo.label;

        let empTasks = tasks.filter(
          (t) =>
            t.assigneeId === emp.id ||
            (Array.isArray(t.assigneeIds) && t.assigneeIds.includes(emp.id))
        );

        // Functional Month & Week Filtering on live task records
        empTasks = empTasks.filter((t) => matchesMonth(t) && matchesWeek(t));

        const total = empTasks.length;
        const completed = empTasks.filter((t) => t.status === 'DONE' || t.status === 'COMPLETED').length;
        const pending = total - completed;
        const rawRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const rate = Math.min(100, rawRate);

        return {
          id: emp.id,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Team Member',
          employeeCode: emp.employeeCode,
          entityId: emp.entityId,
          entityCode: emp.entityCode,
          entity: resolvedEntity,
          rawEmp: emp,
          total,
          completed,
          pending,
          rate,
        };
      })
      .filter((emp) => matchesEntityFilter(emp.rawEmp || emp, selectedEntity));
  }, [employees, tasks, selectedEntity, selectedMonth, selectedWeek, targetMonthOpt]);

  // Robust Search Filter across member name, employee code, and entity
  const filteredEmpAnalytics = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employeeAnalytics;

    return employeeAnalytics.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        (emp.employeeCode && emp.employeeCode.toLowerCase().includes(q)) ||
        emp.entity.toLowerCase().includes(q)
    );
  }, [employeeAnalytics, searchTerm]);

  // Metric pills reflect the active filter view
  const displayList = filteredEmpAnalytics;
  const totalAssigned = displayList.reduce((acc, curr) => acc + curr.total, 0);
  const totalCompleted = displayList.reduce((acc, curr) => acc + curr.completed, 0);
  const totalPending = displayList.reduce((acc, curr) => acc + curr.pending, 0);
  const overallRate = totalAssigned > 0 ? Math.min(100, Math.round((totalCompleted / totalAssigned) * 100)) : 0;
  const pendingRate = totalAssigned > 0 ? Math.min(100, Math.round((totalPending / totalAssigned) * 100)) : 0;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Clock className="w-4 h-4 animate-spin text-emerald-600" /> Loading live task analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4 select-none">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900 tracking-tight">Task Analytics & Team Performance</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Completion rate, pending tasks, and deliverable throughput per team member (Live Database).
          </p>
        </div>

        {/* Right Controls: Filters & Grouped Metric Badges */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
          {/* Dynamic Month Selection Dropdown */}
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 absolute left-3 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500 cursor-pointer transition-colors"
              title="Filter by month"
            >
              {DYNAMIC_MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Week Selection Dropdown */}
          <div className="relative flex items-center">
            <Clock className="w-3.5 h-3.5 text-emerald-600 absolute left-3 pointer-events-none" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500 cursor-pointer transition-colors"
              title="Filter by sprint week"
            >
              <option value="ALL_WEEKS">All Weeks</option>
              <option value="WEEK_1">Week 1 (Days 1–7)</option>
              <option value="WEEK_2">Week 2 (Days 8–14)</option>
              <option value="WEEK_3">Week 3 (Days 15–21)</option>
              <option value="WEEK_4">Week 4 (Days 22–28+)</option>
            </select>
          </div>

          {/* Employee Search Box */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search team member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 w-full sm:w-44 focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grouped Metric Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Completion Rate Pill */}
            <div className="bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase block leading-none">Completion Rate</span>
                <span className="text-sm font-extrabold text-emerald-800 leading-tight">{overallRate}%</span>
              </div>
            </div>

            {/* Pending Rate Pill */}
            <div className="bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase block leading-none">Pending Rate</span>
                <span className="text-sm font-extrabold text-amber-800 leading-tight">{pendingRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EMPLOYEE PERFORMANCE TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-3">Team Member Name</th>
              <th className="py-3 px-3">Entity</th>
              <th className="py-3 px-3 text-center">Total Tasks</th>
              <th className="py-3 px-3 text-center">Completed</th>
              <th className="py-3 px-3 text-center">Pending</th>
              <th className="py-3 px-3">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
            {filteredEmpAnalytics.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-gray-400 font-medium">
                  {searchTerm ? `No team member matching "${searchTerm}" found.` : 'No team member performance records match criteria.'}
                </td>
              </tr>
            ) : (
              filteredEmpAnalytics.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-gray-900">{emp.name}</div>
                    {emp.employeeCode && (
                      <div className="text-[10px] font-semibold text-gray-400">{emp.employeeCode}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {(() => {
                      const badge = getEntityBadge(emp.rawEmp || emp);
                      return (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wide shrink-0 ${badge.className}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-gray-800">{emp.total}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-600">{emp.completed}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-amber-600">{emp.pending}</td>
                  <td className="py-3.5 px-3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${emp.rate}%` }}
                        ></div>
                      </div>
                      <span className="font-extrabold text-gray-800 text-[11px] w-10 text-right">{emp.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


