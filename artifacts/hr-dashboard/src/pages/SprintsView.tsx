import React from 'react';
import { SprintsSubView } from '../components/SprintsSubView';
import { useAuth } from '../contexts/AuthContext';

export const SprintsView: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="p-6 space-y-6 select-none">
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Personal Employee Sprints</h2>
        <p className="text-xs text-gray-500 font-medium">
          Time-bound iteration cycles linked to Parent Epics and assigned per employee with designated Reviewing Leads.
        </p>
      </div>

      <SprintsSubView isManager={isManager} />
    </div>
  );
};
