import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  label?: string;
  trend?: string;
  icon: LucideIcon | React.ReactNode;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, label, trend, icon, onClick }) => {
  const displayLabel = label || trend || '';

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200/80 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-emerald-400 hover:ring-2 hover:ring-emerald-400/20 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          {renderIcon()}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-400 font-medium">{displayLabel}</span>
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</span>
      </div>
    </div>
  );
};
