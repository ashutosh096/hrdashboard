import React from 'react';
import { X, Mail, Shield, Building2, Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { toast } from 'sonner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, setRole, logout } = useAuth();
  const { selectedEntity } = useEntity();

  if (!isOpen) return null;

  const entityName =
    selectedEntity === 'ALL'
      ? 'ehmconsultancy & climagroanalytics'
      : selectedEntity === 'EHM'
      ? 'ehmconsultancy'
      : 'climagroanalytics';

  const handleLogout = () => {
    logout();
    onClose();
    toast.success('Logged out successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative inline-block mb-3">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20 mx-auto shadow-md"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{user?.name || 'Sanjay Kapoor'}</h3>
        <p className="text-xs text-emerald-600 font-semibold mb-3">Senior HR & Operations Lead</p>

        {/* Role Selector Pills */}
        <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/80 mb-4 flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Role:</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRole('MANAGER')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                user?.role === 'MANAGER' || user?.role === 'ADMIN'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Manager View
            </button>
            <button
              onClick={() => setRole('EMPLOYEE')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                user?.role === 'EMPLOYEE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Employee View
            </button>
          </div>
        </div>

        <div className="space-y-2.5 text-left bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80 text-xs mb-4">
          <div className="flex items-center gap-2.5 text-gray-700">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Email</span>
              <span className="font-semibold text-gray-900">{user?.email || 'admin@ehm-climagro.com'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-gray-700">
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Company Entity</span>
              <span className="font-semibold text-gray-900">{entityName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-gray-700">
            <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Position</span>
              <span className="font-semibold text-gray-900">Principal Architect & HR Owner</span>
            </div>
          </div>
        </div>

        {/* Modal Actions: Close & Logout */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
