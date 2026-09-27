import React from 'react';
import { SprintsSubView } from '../components/SprintsSubView';
import { useAuth } from '../contexts/AuthContext';

export const SprintsView: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="p-6 space-y-6 select-none">
      <SprintsSubView isManager={isManager} />
    </div>
  );
};

