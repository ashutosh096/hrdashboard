import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'wouter';

export const AttendanceView: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 select-none my-8">
      <div className="bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>Module Temporarily Locked</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Attendance Tracking Paused
          </h2>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            The Attendance module is currently locked for all roles. Team attendance tracking and check-ins are temporarily paused and will resume soon.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
