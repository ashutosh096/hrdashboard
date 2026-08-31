import React from 'react';
import { BarChart3, CheckCircle2, Clock, TrendingUp, UserCheck, AlertCircle } from 'lucide-react';
import { useEntity } from '../contexts/EntityContext';

export const TaskAnalyticsPanel: React.FC = () => {
  const { selectedEntity } = useEntity();

  const employeeAnalytics = [
    { name: 'Priya Sharma', entity: 'EHM', total: 12, completed: 11, pending: 1, rate: 91.6, status: 'Excellent' },
    { name: 'Rahul Verma', entity: 'CAG', total: 10, completed: 8, pending: 2, rate: 80.0, status: 'Good' },
    { name: 'Anita Desai', entity: 'EHM', total: 15, completed: 12, pending: 3, rate: 80.0, status: 'Good' },
    { name: 'Vikram Mehta', entity: 'CAG', total: 12, completed: 9, pending: 3, rate: 75.0, status: 'On Track' },
  ].filter(emp => selectedEntity === 'ALL' || emp.entity === selectedEntity);

  const totalAssigned = employeeAnalytics.reduce((acc, curr) => acc + curr.total, 0);
  const totalCompleted = employeeAnalytics.reduce((acc, curr) => acc + curr.completed, 0);
  const totalPending = employeeAnalytics.reduce((acc, curr) => acc + curr.pending, 0);
  const overallRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
  const pendingRate = totalAssigned > 0 ? Math.round((totalPending / totalAssigned) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs space-y-5">
      {/* Top Header & Analytics Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900 tracking-tight">Task Analytics & Employee Performance</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Completion rate, pending tasks, and deliverable throughput per employee.
          </p>
        </div>

        {/* Quick Rate Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Completion Rate</span>
              <span className="text-sm font-extrabold text-emerald-800">{overallRate}%</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Pending Rate</span>
              <span className="text-sm font-extrabold text-amber-800">{pendingRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Task Analytics Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-3">Employee Name</th>
              <th className="py-3 px-3">Entity</th>
              <th className="py-3 px-3 text-center">Total Tasks</th>
              <th className="py-3 px-3 text-center">Completed</th>
              <th className="py-3 px-3 text-center">Pending</th>
              <th className="py-3 px-3">Completion Rate</th>
              <th className="py-3 px-3 text-right">Performance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
            {employeeAnalytics.map((emp, idx) => (
              <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-3 font-bold text-gray-900">{emp.name}</td>
                <td className="py-3.5 px-3 font-semibold text-gray-500">{emp.entity === 'EHM' ? 'ehmconsultancy' : 'climagroanalytics'}</td>
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
                <td className="py-3.5 px-3 text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    emp.rate >= 90
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : emp.rate >= 80
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
