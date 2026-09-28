import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Link as LinkIcon, 
  UserPlus, 
  Mail, 
  Phone, 
  Edit3, 
  Trash2, 
  Send, 
  Loader2, 
  X, 
  Check, 
  Copy, 
  Shield, 
  Building, 
  Briefcase,
  Eye,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';

const DEPARTMENT_OPTIONS = [
  'Ops & Delivery',
  'Marketing',
  'Sales',
  'Product & Tech',
  'Grants & Governance',
];

export const TeamDirectoryView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [reinvitingId, setReinvitingId] = useState<string | null>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isEmployee = user?.role === 'EMPLOYEE';
  const isAdmin = user?.role === 'ADMIN';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Active action menu row ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Team Member' | 'MANAGER' | 'ADMIN'>('Team Member');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('Marketing');
  const [entity, setEntity] = useState<'EHM' | 'CAG' | 'COMMON'>('EHM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form state
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'Team Member' | 'MANAGER' | 'ADMIN'>('Team Member');
  const [editPosition, setEditPosition] = useState('');
  const [editDepartment, setEditDepartment] = useState('Marketing');
  const [editEntity, setEditEntity] = useState<'EHM' | 'CAG' | 'COMMON'>('EHM');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadTeam = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchApi<any[]>('/api/employees');

      if (Array.isArray(data)) {
        const formatted = data.map(emp => {
          const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Team Member';
          const rawEntity = emp.entityCode || emp.entity || 'EHM';
          const roleType = (emp.role || 'EMPLOYEE').toUpperCase();
          return {
            id: emp.id,
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            employeeCode: emp.employeeCode || '-',
            name: empName,
            email: emp.email || '',
            phone: emp.phone && emp.phone.trim() ? emp.phone.trim() : null,
            entity: rawEntity,
            dept: emp.departmentName || 'Product & Tech',
            role: emp.designation || 'Specialist',
            roleType,
            avatar: getAvatarByName(empName),
          };
        });

        setTeam(formatted);
      }
    } catch (err) {
      console.error('[TEAM DIRECTORY FETCH ERROR]:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadTeam(true);
      }
    }, 10000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadTeam(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Filter team members based on global entity selector + local table filters
  const filteredTeam = team.filter(member => {
    if (!matchesEntityFilter(member, selectedEntity)) return false;

    if (entityFilter !== 'ALL') {
      const entUpper = (member.entity || member.entityCode || '').toUpperCase();
      if (entityFilter === 'COMMON' && entUpper !== 'COMMON' && entUpper !== 'BOTH') {
        return false;
      }
      if (entityFilter === 'CAG' && entUpper !== 'CAG' && entUpper !== 'CLIMAGRO') {
        return false;
      }
      if (entityFilter === 'EHM' && entUpper !== 'EHM') {
        return false;
      }
    }

    if (roleFilter !== 'ALL') {
      if (member.roleType !== roleFilter) return false;
    }

    if (departmentFilter !== 'ALL') {
      if (member.dept !== departmentFilter) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchName = member.name.toLowerCase().includes(query);
      const matchEmail = (member.email || '').toLowerCase().includes(query);
      const matchCode = (member.employeeCode || '').toLowerCase().includes(query);
      const matchRole = (member.role || '').toLowerCase().includes(query);
      const matchDept = (member.dept || '').toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchCode && !matchRole && !matchDept) {
        return false;
      }
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entityFilter, roleFilter, departmentFilter, selectedEntity]);

  const totalCount = filteredTeam.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const currentRows = filteredTeam.slice(startIndex, endIndex);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim()) {
      toast.error('Please provide an email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || fullName;
      const lastName = parts.slice(1).join(' ') || '';

      const targetMail = email.trim().toLowerCase();
      const roleToAssign = user?.role === 'ADMIN' ? role : 'Team Member';

      await fetchApi<any>('/api/employees', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email: targetMail,
          phone: phoneNumber.trim() || undefined,
          role: roleToAssign,
          designation: position || 'Specialist',
          entityCode: entity,
          departmentName: department,
        }),
      });

      toast.success(`Team member ${fullName} added! Invitation email sent to ${targetMail}.`);

      loadTeam();
      setShowAddModal(false);

      setFullName('');
      setEmail('');
      setRole('Team Member');
      setPosition('');
      setPhoneNumber('');
      setEntity('EHM');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (emp: any) => {
    setActiveMenuId(null);
    setEditingEmployee(emp);
    setEditFullName(emp.name || '');
    setEditEmail(emp.email || '');
    setEditPhone(emp.phone || '');
    setEditRole(emp.roleType || 'Team Member');
    setEditPosition(emp.role || '');
    setEditDepartment(emp.dept || 'Product & Tech');
    const normEnt = (emp.entity || emp.entityCode || '').toUpperCase();
    if (normEnt.includes('CAG') || normEnt.includes('CLIMAGRO')) {
      setEditEntity('CAG');
    } else if (normEnt.includes('COM') || normEnt.includes('BOTH') || normEnt.includes('COMMON')) {
      setEditEntity('COMMON');
    } else {
      setEditEntity('EHM');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || isUpdating) return;

    setIsUpdating(true);
    try {
      const parts = editFullName.trim().split(' ');
      const firstName = parts[0] || editFullName;
      const lastName = parts.slice(1).join(' ') || '';

      await fetchApi(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName,
          lastName,
          email: editEmail.trim(),
          phone: editPhone.trim() || undefined,
          designation: editPosition,
          role: editRole,
          departmentName: editDepartment,
          entityCode: editEntity,
        }),
      });

      toast.success(`Team member ${editFullName} updated successfully!`);
      setEditingEmployee(null);
      loadTeam();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update team member details');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReinviteEmployee = async (id: string, email: string, name: string) => {
    setActiveMenuId(null);
    setReinvitingId(id);
    try {
      const res = await fetchApi<any>(`/api/employees/${id}/reinvite`, {
        method: 'POST',
      });
      toast.success(res.message || `Invitation email resent successfully to ${email}!`);
    } catch (err: any) {
      toast.error(err.message || `Failed to resend invitation to ${email}`);
    } finally {
      setReinvitingId(null);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    setActiveMenuId(null);
    if (!window.confirm(`Are you sure you want to delete team member "${name}"? This will clear all associated database records.`)) {
      return;
    }

    try {
      await fetchApi(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      toast.success(`Team member "${name}" deleted!`);
      loadTeam();
    } catch (err: any) {
      toast.error(err.message || `Failed to delete ${name}`);
    }
  };

  const getEntityDisplayName = (member: any): string => {
    const entityUpper = (member.entity || member.entityCode || '').toUpperCase();
    if (entityUpper === 'COMMON' || entityUpper === 'BOTH') {
      return 'EHM & CLIMAGRO';
    }
    if (entityUpper === 'CAG' || entityUpper === 'CLIMAGRO') {
      return 'CLIMAGRO';
    }
    return 'EHM';
  };

  const getRoleBadge = (roleType: string) => {
    const upper = (roleType || 'Team Member').toUpperCase();
    if (upper === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          Admin
        </span>
      );
    }
    if (upper === 'MANAGER') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          Manager
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        Team Member
      </span>
    );
  };

  const getInitials = (name: string): string => {
    if (!name) return 'EM';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 space-y-5 select-none text-gray-900">
      {/* 1. Top Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Team directory</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Team roster across EHM and CLIMAGRO.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const inviteUrl = `${window.location.origin}/accept-invite`;
              navigator.clipboard.writeText(inviteUrl);
              toast.success('Team Invite Link copied! ' + inviteUrl);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 shadow-2xs transition-colors cursor-pointer"
            title="Copy invitation link to share with new team members"
          >
            <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
            <span>Copy invite link</span>
          </button>

          {!isEmployee && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-white" />
              <span>Add Team Member</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-5 relative bg-white border border-gray-200 rounded-xl shadow-2xs focus-within:border-emerald-500 transition-colors">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3.5 pr-4 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 bg-transparent outline-none"
          />
        </div>

        {/* Entity Dropdown */}
        <div className="sm:col-span-3 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-2xs">
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
          >
            <option value="ALL">All entities</option>
            <option value="COMMON">EHM & CLIMAGRO</option>
            <option value="CAG">CLIMAGRO</option>
            <option value="EHM">EHM</option>
          </select>
        </div>

        {/* Role Dropdown */}
        <div className="sm:col-span-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-2xs">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Team Member</option>
          </select>
        </div>

        {/* Department Dropdown */}
        <div className="sm:col-span-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-2xs">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer truncate"
          >
            <option value="ALL">All departments</option>
            {DEPARTMENT_OPTIONS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Team Directory Table */}
      <div className="border border-gray-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 font-bold">
                <th className="py-3.5 px-4 font-bold text-gray-700">Name</th>
                <th className="py-3.5 px-4 font-bold text-gray-700">Entity</th>
                <th className="py-3.5 px-4 font-bold text-gray-700">Contact</th>
                <th className="py-3.5 px-4 font-bold text-gray-700">Dept</th>
                <th className="py-3.5 px-4 font-bold text-gray-700">Role</th>
                <th className="py-3.5 px-4 font-bold text-gray-700 text-right"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-gray-400 font-semibold text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading team members...
                  </td>
                </tr>
              ) : currentRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-gray-400 font-semibold text-xs">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                currentRows.map(member => {
                  const initials = getInitials(member.name);
                  const entityDisplay = getEntityDisplayName(member);
                  const isMenuOpen = activeMenuId === member.id;
                  const isReinviting = reinvitingId === member.id;

                  return (
                    <tr 
                      key={member.id} 
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* Name & ID Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          {/* Avatar Initials Box */}
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 tracking-wider shadow-2xs">
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-xs tracking-tight group-hover:text-emerald-700 transition-colors truncate">
                              {member.name}
                            </div>
                            <div className="font-mono text-[11px] text-gray-400 font-normal tracking-wide">
                              {member.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Entity Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {(() => {
                          const badge = getEntityBadge(member);
                          return (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wide shrink-0 ${badge.className}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Contact Column */}
                      <td className="py-3.5 px-4 text-gray-600 truncate max-w-[220px]" title={member.email}>
                        <a 
                          href={`mailto:${member.email}`}
                          onClick={e => e.stopPropagation()} 
                          className="hover:text-emerald-700 hover:underline transition-colors"
                        >
                          {member.email || '—'}
                        </a>
                      </td>

                      {/* Department Column */}
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        {member.dept || 'Ops & Delivery'}
                      </td>

                      {/* Role Column */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(member.roleType)}
                      </td>

                      {/* Action Menu Column */}
                      <td className="py-3.5 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : member.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                          title="Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Action Menu */}
                        {isMenuOpen && (
                          <div 
                            ref={menuRef}
                            className="absolute right-4 top-10 z-30 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-left animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEdit(member);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                              <span>View / Edit details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReinviteEmployee(member.id, member.email, member.name)}
                              disabled={isReinviting}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isReinviting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                              ) : (
                                <Send className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              <span>{isReinviting ? 'Sending...' : 'Resend invite email'}</span>
                            </button>

                            {isAdmin && (
                              <div className="border-t border-gray-100 my-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEmployee(member.id, member.name)}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Delete Team Member</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Footer & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 border-t border-gray-200 bg-gray-50/60 text-xs text-gray-500 font-medium">
          <div>
            Showing {totalCount === 0 ? 0 : startIndex + 1}-{endIndex} of {totalCount}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-gray-800 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Employee Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white text-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-base">Add Team Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full name</label>
                  <input
                    type="text"
                    placeholder="Tarul Sharma"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'Team Member' | 'MANAGER' | 'ADMIN')}
                    disabled={user?.role !== 'ADMIN'}
                    className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="EMPLOYEE">Team Member</option>
                    <option value="MANAGER">Manager</option>
                    {user?.role === 'ADMIN' && <option value="ADMIN">Admin</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Position</label>
                  <input
                    type="text"
                    placeholder="Senior systems engineer"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Entity</label>
                <select
                  value={entity}
                  onChange={e => setEntity(e.target.value as any)}
                  className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer font-bold"
                >
                  <option value="EHM">EHM</option>
                  <option value="CAG">CLIMAGRO</option>
                  <option value="COMMON">EHM & CLIMAGRO (COMMON)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Sending...' : 'Send invitation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / View Employee Details Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white text-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">View / Edit Team Member Details</h3>
                <p className="text-[11px] text-gray-500 font-medium">Update details for {editingEmployee.employeeCode}</p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as any)}
                    disabled={user?.role !== 'ADMIN'}
                    className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="EMPLOYEE">Team Member</option>
                    <option value="MANAGER">Manager</option>
                    {user?.role === 'ADMIN' && <option value="ADMIN">Admin</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Designation / Position</label>
                  <input
                    type="text"
                    required
                    value={editPosition}
                    onChange={e => setEditPosition(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
                  <select
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Entity</label>
                <select
                  value={editEntity}
                  onChange={e => setEditEntity(e.target.value as any)}
                  className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer font-bold"
                >
                  <option value="EHM">EHM</option>
                  <option value="CAG">CLIMAGRO</option>
                  <option value="COMMON">EHM & CLIMAGRO (COMMON)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

