import React from 'react';
import { X, Mail, Shield, Building2, User, Key, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { getAvatarByName } from '../utils/avatars';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, setRole } = useAuth();

  if (!isOpen) return null;

  const handleRoleChange = (role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    setRole(role);
    toast.success(`Role switched to ${role}!`);
  };

  const handleLogout = () => {
    logout();
    onClose();
    toast.success('Logged out successfully');
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
            src={user?.avatarUrl || getAvatarByName(user?.name || user?.email)}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20 mx-auto shadow-md"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{user?.name || 'User'}</h3>
        <p className="text-xs text-emerald-600 font-semibold mb-3">{user?.role || 'System Administrator'}</p>

        {/* Role Selector Pills */}
        <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/80 mb-4 flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" /> Active Role:
          </span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
            <button
              onClick={() => handleRoleChange('ADMIN')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                user?.role === 'ADMIN' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              ADMIN
            </button>
            <button
              onClick={() => handleRoleChange('MANAGER')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                user?.role === 'MANAGER' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              LEAD
            </button>
            <button
              onClick={() => handleRoleChange('EMPLOYEE')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                user?.role === 'EMPLOYEE' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              EMP
            </button>
          </div>
        </div>

        <div className="space-y-2 text-left text-xs mb-6">
          <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-semibold text-gray-700 truncate">{user?.email || 'admin@example.com'}</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-semibold text-gray-700">Entity: ehmconsultancy</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-semibold text-gray-700">ID: {user?.id || 'usr-admin-uuid'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200/60 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out Account</span>
        </button>
      </div>
    </div>
  );
};
