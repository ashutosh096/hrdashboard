import React from 'react';
import { Calendar, ChevronDown, CheckCircle2, RefreshCw, Clock } from 'lucide-react';

export const ProjectSummaryTable: React.FC = () => {
  const rows = [
    {
      id: 'r-1',
      name: 'Orion',
      code: 'EHM-MAR-ADH-672',
      deliverable: 'Brand Refresh Assets',
      totalRevenue: '$32,580',
      netProfit: '$12,300',
      grossProfit: '$12,300',
      status: 'Completed',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
    },
    {
      id: 'r-2',
      name: 'Zenith',
      code: 'CAG-DEV-SPR-101',
      deliverable: 'IoT Sensor API Gateway',
      totalRevenue: '$28,640',
      netProfit: '$10,250',
      grossProfit: '$10,250',
      status: 'Ongoing',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: RefreshCw,
    },
    {
      id: 'r-3',
      name: 'Helios',
      code: 'EHM-OPS-PROC-412',
      deliverable: 'Q3 Procurement Audit',
      totalRevenue: '$19,480',
      netProfit: '$7,920',
      grossProfit: '$7,920',
      status: 'Pending',
      statusColor: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: Clock,
    },
  ];

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs">
      {/* Table Header Controls matching screenshot */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Project Progress Summary</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Updated: Apr 16, 2025</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <span>This Quarter</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Table matching screenshot */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-3">Project Name</th>
              <th className="py-3 px-3">Total Revenue</th>
              <th className="py-3 px-3">Net Profit</th>
              <th className="py-3 px-3">Gross Profit</th>
              <th className="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-gray-900">{row.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{row.code} — {row.deliverable}</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-gray-900">{row.totalRevenue}</td>
                  <td className="py-3.5 px-3 font-semibold text-gray-900">{row.netProfit}</td>
                  <td className="py-3.5 px-3 font-semibold text-gray-900">{row.grossProfit}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${row.statusColor}`}>
                      <Icon className="w-3 h-3" />
                      <span>{row.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
