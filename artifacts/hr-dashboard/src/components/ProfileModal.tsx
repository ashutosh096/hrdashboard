import React, { useState, useEffect } from 'react';
import { X, Mail, Shield, Building2, User as UserIcon, LogOut, Edit2, Phone, Check, Loader2, Lock, Briefcase, Sparkles } from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { getAvatarByName } from '../utils/avatars';

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
    const label = role === 'EMPLOYEE' ? 'Team' : role === 'MANAGER' ? 'Manager' : 'Admin';
    toast.success(`Previewing layout as ${label}!`);
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
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const roleName = user?.role === 'ADMIN' ? 'Admin' : user?.role === 'MANAGER' ? 'Manager' : 'Team Member';
  
  const roleBadgeClass = user?.role === 'ADMIN'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : user?.role === 'MANAGER'
      ? 'bg-teal-50 text-teal-700 border-teal-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  const entityDisplay = user?.entityName || (
    user?.entityCode === 'CAG' 
      ? 'CLIMAGRO' 
      : user?.entityCode === 'EHM' 
        ? 'EHM consultancy' 
        : 'EHM & Climagro'
  );

  const employeeCodeDisplay = user?.employeeCode || '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 text-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Avatar Circle */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-18 h-18 rounded-full object-cover ring-4 ring-emerald-50 shadow-xs"
              />
            ) : (
              <div className="w-18 h-18 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-2xl flex items-center justify-center ring-4 ring-emerald-100/70 shadow-xs">
                {userInitial}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"></span>
          </div>

          {/* User Name & Email */}
          <div className="mt-3 text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{displayName}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeClass}`}>
                {roleName}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {!isEditing ? (
          /* VIEW MODE */
          <div className="space-y-4">
            {/* Admin Role Preview Switcher */}
            {actualRole === 'ADMIN' && (
              <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 px-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-600" /> Preview layout
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">Admin only</span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleRolePreviewChange('ADMIN')}
                    className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      previewRole === 'ADMIN'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRolePreviewChange('MANAGER')}
                    className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      previewRole === 'MANAGER'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100'
                    }`}
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRolePreviewChange('EMPLOYEE')}
                    className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      previewRole === 'EMPLOYEE' || (previewRole as any) === 'Team Member'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100'
                    }`}
                  >
                    Team
                  </button>
                </div>
              </div>
            )}

            {/* Profile Information List with Clean Dividers */}
            <div className="divide-y divide-gray-100 border-y border-gray-100 text-xs">
              {/* Mobile */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  Mobile
                </span>
                <span className={`font-semibold ${user?.phone ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                  {user?.phone || 'Not added'}
                </span>
              </div>

              {/* Entity */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  Entity
                </span>
                <span className="font-bold text-gray-900">{entityDisplay}</span>
              </div>

              {/* Team Member ID */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  Team Member ID
                </span>
                <span className="font-bold text-gray-900 font-mono">{employeeCodeDisplay}</span>
              </div>

              {/* Designation / Department */}
              {user?.designation && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-gray-500 font-medium flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                    Designation
                  </span>
                  <span className="font-semibold text-gray-900">{user.designation}</span>
                </div>
              )}
            </div>

            {/* Actions: Edit name & mobile + Log out */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-bold text-xs rounded-xl border border-gray-200 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-600" />
                <span>Edit name & mobile</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50/60 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="text-center pb-1">
              <h4 className="text-sm font-bold text-gray-900">Edit Profile Details</h4>
              <p className="text-[11px] text-gray-500">Update your full name and contact phone number</p>
            </div>

            <div className="space-y-3">
              {/* Full Name */}
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
                    placeholder="e.g. Ashutosh Mishra"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
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
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
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

              {/* Entity & Team Member ID (Readonly) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Entity</span>
                  <div className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-bold truncate">
                    {entityDisplay}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Team Member ID</span>
                  <div className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-mono font-bold truncate">
                    {employeeCodeDisplay}
                  </div>
                </div>
              </div>
            </div>

            {/* Save / Cancel Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setName(user?.name || '');
                  setPhone(user?.phone || '');
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="flex-1 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
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

