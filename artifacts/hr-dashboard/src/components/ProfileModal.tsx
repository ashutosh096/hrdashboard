import React, { useState, useEffect } from 'react';
import { X, Mail, Shield, Building2, User as UserIcon, LogOut, Eye, Edit2, Phone, Check, Loader2, Lock } from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, actualRole, previewRole, setPreviewRole, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setIsEditing(false);
    }
  }, [isOpen, user]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const userInitial = (user?.name || name || user?.email || 'U').trim()[0].toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar Circle with Initial */}
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
          {userInitial}
        </div>

        {!isEditing ? (
          /* VIEW MODE */
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">{user?.name || 'User'}</h3>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                title="Edit Name & Mobile"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-4">{user?.email || 'user@example.com'}</p>

            {/* 🔒 HARD GATED ROLE PREVIEW SWITCHER (Matching Admin View) */}
            {actualRole === 'ADMIN' && (
              <div className="mb-4 text-left">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preview layout</label>
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

            {/* Entity, Mobile & Employee ID Summary */}
            <div className="space-y-2 text-xs text-left mb-5 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  Mobile
                </span>
                <span className={`font-semibold ${user?.phone ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                  {user?.phone || 'Not added'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  Entity
                </span>
                <span className="font-bold text-gray-900 font-mono">{user?.entityName || 'EHM consultancy'}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  Employee ID
                </span>
                <span className="font-bold text-gray-900 font-mono">{user?.employeeCode || 'EHM-EMP01'}</span>
              </div>
            </div>

            {/* Actions: Edit Profile & Log Out */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile (Name & Mobile)</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        ) : (
          /* EDIT MODE (Only Name & Mobile are editable) */
          <form onSubmit={handleSave} className="text-left">
            <div className="text-center mb-4">
              <h4 className="text-sm font-bold text-gray-900">Edit Profile</h4>
              <p className="text-[11px] text-gray-500">Update your name and contact mobile number</p>
            </div>

            <div className="space-y-3 mb-5">
              {/* Name Field (Editable) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Mobile Field (Editable) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Email (Locked / Readonly) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Email (Locked)</span>
                  <Lock className="w-3 h-3 text-gray-400" />
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Employee ID & Entity (Locked / Readonly) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Entity</span>
                  <div className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono font-bold truncate">
                    {user?.entityName || 'EHM'}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Employee ID</span>
                  <div className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono font-bold truncate">
                    {user?.employeeCode || 'EHM-EMP01'}
                  </div>
                </div>
              </div>
            </div>

            {/* Save / Cancel Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setName(user?.name || '');
                  setPhone(user?.phone || '');
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="flex-1 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
