import React from 'react';
import { X, Mail, Shield, Building2, User as UserIcon, LogOut, Eye } from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { getAvatarByName } from '../utils/avatars';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, actualRole, previewRole, setPreviewRole } = useAuth();

  if (!isOpen) return null;

  const handleRolePreviewChange = (role: UserRole) => {
    if (actualRole !== 'ADMIN') return;
    setPreviewRole(role);
    toast.success(`Previewing layout as ${role}!`);
  };

  const handleLogout = () => {
    logout();
    onClose();
    toast.success('Logged out successfully');
  };

  const userInitial = user?.name ? user.name.trim()[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar Circle with Initial */}
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
          {userInitial}
        </div>

        {/* User Name & Email */}
        <h3 className="text-base font-bold text-gray-900 tracking-tight">{user?.name || 'Admin user'}</h3>
        <p className="text-xs text-gray-500 font-medium mb-4">{user?.email || 'admin@example.com'}</p>

        {/* 🔒 HARD GATED ROLE PREVIEW SWITCHER (Matching Image 3) */}
        {actualRole === 'ADMIN' && (
          <div className="mb-5 text-left">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Preview layout</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200/80">
              <button
                type="button"
                onClick={() => handleRolePreviewChange('ADMIN')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  previewRole === 'ADMIN'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-200/60'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRolePreviewChange('MANAGER')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  previewRole === 'MANAGER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-200/60'
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleRolePreviewChange('EMPLOYEE')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  previewRole === 'EMPLOYEE'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-200/60'
                }`}
              >
                Employee
              </button>
            </div>
          </div>
        )}

        {/* Entity & Employee ID Summary */}
        <div className="space-y-2.5 text-xs text-left mb-6 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500 font-medium">Entity</span>
            <span className="font-bold text-gray-900 font-mono">EHM consultancy</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500 font-medium">Employee ID</span>
            <span className="font-bold text-gray-900 font-mono">EHM-EMP01</span>
          </div>
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};
