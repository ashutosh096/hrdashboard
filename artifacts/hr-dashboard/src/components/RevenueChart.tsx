import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Calendar, Settings, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';

const defaultData = [
  { name: 'Jan', actual: 120, target: 110 },
  { name: 'Feb', actual: 140, target: 130 },
  { name: 'Mar', actual: 130, target: 135 },
  { name: 'Apr', actual: 170, target: 150 },
  { name: 'May', actual: 160, target: 145 },
  { name: 'Jun', actual: 190, target: 170 },
  { name: 'Jul', actual: 175, target: 160 },
  { name: 'Aug', actual: 185, target: 175 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const loggedHours = payload[0]?.value || 160;
    const targetHours = payload[1]?.value || 145;
    return (
      <div className="bg-white border border-gray-200/90 p-3 rounded-xl shadow-xl text-xs font-sans space-y-1 select-none">
        <p className="text-gray-400 font-bold uppercase text-[10px]">{label} Sprint Output</p>
        <div className="flex items-center gap-1.5 font-bold text-gray-900">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Logged Work: {loggedHours} hrs</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-amber-700 text-[11px]">
          <span>Target Target: {targetHours} hrs</span>
        </div>
        <p className="text-[10px] text-emerald-600 font-extrabold pt-0.5">
          ✓ {Math.round((loggedHours / targetHours) * 100)}% Sprint Efficiency
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
      {/* Header controls */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">Weekly Attendance & Output</h3>
          <p className="text-xs text-gray-400 font-medium">Hours logged this week, showing steady team productivity growth.</p>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Calendar className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Settings className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ExternalLink className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Sub-info & legend */}
      <div className="flex items-center justify-between text-xs mb-4">
        <div>
          <span className="text-gray-400">Last update: </span>
          <span className="font-semibold text-gray-700">08.31.26 at 7:00 PM</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600 font-semibold">Hours Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-gray-600 font-semibold">Target Sprint Output</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Curve with Work Hours formatting */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={defaultData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${v} hrs`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#emeraldGradient)" />
            <Area type="monotone" dataKey="target" stroke="#FBBF24" strokeWidth={2} strokeDasharray="4 4" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
