import React from 'react';
import { Eye, RotateCcw, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RolePreviewBanner: React.FC = () => {
  const { actualRole, previewRole, setPreviewRole } = useAuth();

  // HARD GATE: Only render banner if the authentic logged-in user is ADMIN AND actively previewing another role
  if (actualRole !== 'ADMIN' || !previewRole || previewRole === 'ADMIN') {
    return null;
  }

  const roleLabel = previewRole === 'EMPLOYEE' ? 'Team Member View' : 'Manager / Lead View';

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md select-none border-b border-amber-400 shrink-0">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
        <span className="tracking-tight">
          Previewing Layout: <span className="underline font-black">{roleLabel}</span> (Authenticated Real Role: ADMIN)
        </span>
      </div>
      <button
        type="button"
        onClick={() => setPreviewRole('ADMIN')}
        className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white rounded-lg transition-all text-[11px] font-extrabold shadow-2xs shrink-0 cursor-pointer"
      >
        <RotateCcw className="w-3 h-3 text-amber-400" />
        <span>Reset to Admin View</span>
      </button>
    </div>
  );
};

