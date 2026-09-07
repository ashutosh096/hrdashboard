import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from 'recharts';
import { Calendar, Settings, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const taskAnalyticsData = [
  { name: 'Week 1', completed: 22, inReview: 8, pending: 15 },
  { name: 'Week 2', completed: 30, inReview: 12, pending: 18 },
  { name: 'Week 3', completed: 38, inReview: 15, pending: 12 },
  { name: 'Week 4', completed: 45, inReview: 14, pending: 10 },
  { name: 'Week 5', completed: 52, inReview: 10, pending: 8 },
  { name: 'Week 6', completed: 58, inReview: 9, pending: 12 },
  { name: 'Week 7', completed: 64, inReview: 11, pending: 7 },
  { name: 'Week 8', completed: 72, inReview: 8, pending: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const completed = payload[0]?.value || 0;
    const inReview = payload[1]?.value || 0;
    const pending = payload[2]?.value || 0;
    const total = completed + inReview + pending;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <div className="bg-white border border-gray-200/90 p-3.5 rounded-xl shadow-xl text-xs font-sans space-y-1.5 select-none min-w-[190px]">
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">{label} Sprint Deliverables</p>
        
        <div className="flex items-center justify-between font-extrabold text-emerald-700 text-xs">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed (Approved):</span>
          </span>
          <span>{completed} tasks</span>
        </div>

        <div className="flex items-center justify-between font-bold text-amber-700 text-xs">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>To Review:</span>
          </span>
          <span>{inReview} tasks</span>
        </div>

        <div className="flex items-center justify-between font-bold text-blue-700 text-xs">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Pending / In Progress:</span>
          </span>
          <span>{pending} tasks</span>
        </div>

        <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-emerald-600">
          <span>Sprint Completion Rate:</span>
          <span>{completionRate}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs select-none">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Task Progress & Sprint Analytics</h3>
          <p className="text-xs text-gray-500 font-medium">Weekly status tracking of Pending, In Progress, To Review, and Completed deliverables.</p>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Filter Date Range"><Calendar className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Settings"><Settings className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Export Analytics"><ExternalLink className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Sub-info & legend badges */}
      <div className="flex flex-wrap items-center justify-between text-xs mb-4 gap-2">
        <div>
          <span className="text-gray-400">Last update: </span>
          <span className="font-semibold text-gray-700">09.06.26 at 11:30 PM</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-gray-700 font-bold">Completed (Approved)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-gray-700 font-bold">To Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-gray-700 font-bold">Pending / In Progress</span>
          </div>
        </div>
      </div>

      {/* Recharts Area & Curve Chart */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={taskAnalyticsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${v} tasks`} />
            <Tooltip content={<CustomTooltip />} />
            
            <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#emeraldGradient)" />
            <Area type="monotone" dataKey="inReview" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" fill="url(#amberGradient)" />
            <Area type="monotone" dataKey="pending" stroke="#3B82F6" strokeWidth={2} strokeDasharray="2 2" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
