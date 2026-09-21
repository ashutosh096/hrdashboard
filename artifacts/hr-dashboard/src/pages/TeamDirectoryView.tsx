import React, { useState, useEffect } from 'react';
import { Mail, UserPlus, Phone, X, Check, Copy, Link as LinkIcon, Sparkles, Trash2, Loader2, Edit3, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
import { matchesEntityFilter } from '../utils/entityUtils';

export const TeamDirectoryView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [reinvitingId, setReinvitingId] = useState<string | null>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isEmployee = user?.role === 'EMPLOYEE';

  // Add Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('Marketing');
  const [entity, setEntity] = useState<'EHM' | 'CAG' | 'COMMON'>('EHM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form state
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'EMPLOYEE' | 'MANAGER' | 'ADMIN'>('EMPLOYEE');
  const [editPosition, setEditPosition] = useState('');
  const [editDepartment, setEditDepartment] = useState('Marketing');
  const [editEntity, setEditEntity] = useState<'EHM' | 'CAG' | 'COMMON'>('EHM');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<any[]>('/api/employees');

      if (Array.isArray(data)) {
        const formatted = data.map(emp => {
          const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
          const rawEntity = emp.entityCode || (emp.employeeCode?.startsWith('CAG') ? 'CAG' : (emp.employeeCode?.startsWith('COM') ? 'COMMON' : 'EHM'));
          const roleType = (emp.role || 'EMPLOYEE').toUpperCase();
          const defaultCode = roleType === 'MANAGER' ? `${rawEntity === 'CAG' ? 'CAG' : (rawEntity === 'COMMON' ? 'COM' : 'EHM')}-MGR01` : `${rawEntity === 'CAG' ? 'CAG' : (rawEntity === 'COMMON' ? 'COM' : 'EHM')}-EMP01`;

          return {
            id: emp.id,
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            employeeCode: emp.employeeCode || defaultCode,
            name: empName,
            email: emp.email,
            phone: emp.phone && emp.phone.trim() ? emp.phone.trim() : null,
            entity: rawEntity,
            dept: emp.departmentName || 'Engineering',
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const filtered = team.filter(t => matchesEntityFilter(t, selectedEntity));

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() && !personalEmail.trim()) {
      toast.error('Please provide at least a Work Email or Personal Email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || fullName;
      const lastName = parts.slice(1).join(' ') || '';

      const targetMail = (email.trim() || personalEmail.trim()).toLowerCase();
      const roleToAssign = user?.role === 'ADMIN' ? role : 'EMPLOYEE';

      await fetchApi<any>('/api/employees', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim(),
          personalEmail: personalEmail.trim(),
          role: roleToAssign,
          designation: position || 'Specialist',
          entityCode: entity,
          departmentName: department,
        }),
      });

      toast.success(`Employee ${fullName} added! Invitation email sent to ${targetMail}.`);

      loadTeam();
      setShowAddModal(false);

      setFullName('');
      setEmail('');
      setPersonalEmail('');
      setRole('EMPLOYEE');
      setPosition('');
      setPhoneNumber('');
      setEntity('EHM');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (emp: any) => {
    setEditingEmployee(emp);
    setEditFullName(emp.name || '');
    setEditEmail(emp.email || '');
    setEditRole(emp.roleType || 'EMPLOYEE');
    setEditPosition(emp.role || '');
    setEditDepartment(emp.dept || 'Marketing');
    setEditEntity(emp.entity || 'EHM');
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
          designation: editPosition,
          role: editRole,
          departmentName: editDepartment,
          entityCode: editEntity,
        }),
      });

      toast.success(`Employee ${editFullName} updated successfully!`);
      setEditingEmployee(null);
      loadTeam();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update employee details');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReinviteEmployee = async (id: string, email: string, name: string) => {
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
    if (!window.confirm(`Are you sure you want to delete employee "${name}"? This will clear all associated database records.`)) {
      return;
    }

    try {
      await fetchApi(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      toast.success(`Employee "${name}" deleted!`);
      loadTeam();
    } catch (err: any) {
      toast.error(err.message || `Failed to delete ${name}`);
    }
  };

  return (
    <div className="p-6 space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Team Directory</h2>
          <p className="text-xs text-gray-500 font-medium">Employee roster across EHM and CLIMAGRO.</p>
        </div>

        {!isEmployee && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading team members...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">No employees found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filtered.map(member => {
            const entityUpper = (member.entity || '').toUpperCase();
            const isClimagro = entityUpper === 'CAG' || entityUpper === 'CLIMAGRO';
            const isCommon = entityUpper === 'COMMON' || entityUpper === 'BOTH';
            const initials = member.name ? member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'EM';
            const isReinviting = reinvitingId === member.id;

            return (
              <div key={member.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 text-left text-gray-900 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Initials Avatar Badge */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 shadow-2xs ${
                      isCommon
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isClimagro
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {initials}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 tracking-tight truncate">{member.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-medium truncate">{member.role}</p>

                      {/* Entity, Department & Role Pill Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isCommon
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : isClimagro
                              ? 'bg-purple-600 text-white'
                              : 'bg-blue-600 text-white'
                        }`}>
                          {isCommon ? 'EHM & CLIMAGRO' : isClimagro ? 'Climagro' : 'EHM'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                          {member.dept || 'Engineering'}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          member.roleType === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : member.roleType === 'MANAGER'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {member.roleType === 'ADMIN' ? 'ADMIN' : member.roleType === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate text-gray-700">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-700">{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Re-invite, View/Edit & Remove */}
                {!isEmployee && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 shadow-2xs shrink-0">
                      {member.employeeCode}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {/* Re-invite Button */}
                      <button
                        onClick={() => handleReinviteEmployee(member.id, member.email, member.name)}
                        disabled={isReinviting}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        title="Resend invitation email"
                      >
                        {isReinviting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 text-emerald-600" />}
                        <span>{isReinviting ? 'Sending...' : 'Re-invite'}</span>
                      </button>

                      {/* View / Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                        title="View or Edit employee details"
                      >
                        <Edit3 className="w-3 h-3 text-blue-600" />
                        <span>View / Edit</span>
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleDeleteEmployee(member.id, member.name)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                        title="Remove employee record"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white text-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-base">Add employee</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
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
                    value={user?.role === 'ADMIN' ? role : 'EMPLOYEE'}
                    onChange={e => setRole(e.target.value as 'EMPLOYEE' | 'MANAGER')}
                    disabled={user?.role !== 'ADMIN'}
                    className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    {user?.role === 'ADMIN' && <option value="MANAGER">Manager</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Personal email</label>
                  <input
                    type="email"
                    placeholder="tarul.personal@gmail.com"
                    value={personalEmail}
                    onChange={e => setPersonalEmail(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Work email (optional)</label>
                  <input
                    type="email"
                    placeholder="tarul@ehmconsultancy.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Product & Tech">Product & Tech</option>
                    <option value="Operations & Delivery">Operations & Delivery</option>
                  </select>
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
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
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
                <h3 className="font-bold text-gray-900 text-base">View / Edit Employee Details</h3>
                <p className="text-[11px] text-gray-500 font-medium">Update details for {editingEmployee.employeeCode}</p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
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
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    {user?.role === 'ADMIN' && <option value="ADMIN">Admin</option>}
                  </select>
                </div>
              </div>

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
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Product & Tech">Product & Tech</option>
                    <option value="Operations & Delivery">Operations & Delivery</option>
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
