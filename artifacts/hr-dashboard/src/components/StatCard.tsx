import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  label: string;
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, label, icon: Icon }) => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</span>
      </div>
    </div>
  );
};
