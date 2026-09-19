import React, { useState, useEffect } from 'react';
import { Mail, UserPlus, Phone, X, Check, Copy, Link as LinkIcon, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
import { matchesEntityFilter } from '../utils/entityUtils';

const DEFAULT_TEAM_MEMBERS = [
  {
    id: 'emp-1',
    name: 'Ashutosh Mishra',
    email: 'ashutosh@ehmconsultancy.com',
    phone: '+91 98201 11001',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Product & Tech',
    role: 'Lead Systems Architect',
    avatar: getAvatarByName('Ashutosh Mishra'),
  },
  {
    id: 'emp-2',
    name: 'Priyanka Sharma',
    email: 'priyanka@ehmconsultancy.com',
    phone: '+91 98201 11002',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Marketing',
    role: 'Senior Brand Strategist',
    avatar: getAvatarByName('Priyanka Sharma'),
  },
  {
    id: 'emp-3',
    name: 'Utkarsh Mishra',
    email: 'utkarsh@ehmconsultancy.com',
    phone: '+91 98201 11003',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Operations & Delivery',
    role: 'Operations Lead',
    avatar: getAvatarByName('Utkarsh Mishra'),
  },
  {
    id: 'emp-4',
    name: 'Prerna Shukla',
    email: 'prerna@ehmconsultancy.com',
    phone: '+91 98201 11004',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Grants & Governance',
    role: 'Grants Strategist',
    avatar: getAvatarByName('Prerna Shukla'),
  },
  {
    id: 'emp-5',
    name: 'Shreyansh Siladar',
    email: 'shreyansh@ehmconsultancy.com',
    phone: '+91 98201 11005',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'SM Marketing',
    role: 'Social Media Lead',
    avatar: getAvatarByName('Shreyansh Siladar'),
  },
  {
    id: 'emp-6',
    name: "Tarul Ma'am",
    email: 'tarul@climagroanalytics.com',
    phone: '+91 98201 11006',
    entity: 'CAG',
    entityName: 'climagroanalytics',
    dept: 'Operations & Delivery',
    role: 'Delivery Associate',
    avatar: getAvatarByName("Tarul Ma'am"),
  },
  {
    id: 'emp-7',
    name: 'Dr. Harshit Mishra',
    email: 'harshit@ehmconsultancy.com',
    phone: '+91 98201 11007',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Sales',
    role: 'Managing Director / Sales Lead',
    avatar: getAvatarByName('Dr. Harshit Mishra'),
  },
  {
    id: 'emp-8',
    name: 'Neha Shukla',
    email: 'neha@ehmconsultancy.com',
    phone: '+91 98201 11008',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Marketing',
    role: 'Marketing Lead',
    avatar: getAvatarByName('Neha Shukla'),
  },
  {
    id: 'emp-9',
    name: 'Dr. Utsav Mishra',
    email: 'utsav@climagroanalytics.com',
    phone: '+91 98201 11009',
    entity: 'CAG',
    entityName: 'climagroanalytics',
    dept: 'Operations & Delivery',
    role: 'Operations VP',
    avatar: getAvatarByName('Dr. Utsav Mishra'),
  },
  {
    id: 'emp-10',
    name: 'Jitendra Sir',
    email: 'jitendra@ehmconsultancy.com',
    phone: '+91 98201 11010',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Product & Tech',
    role: 'Chief Technology Officer',
    avatar: getAvatarByName('Jitendra Sir'),
  },
  {
    id: 'emp-11',
    name: 'Pranshu Dubey',
    email: 'pranshu@ehmconsultancy.com',
    phone: '+91 98201 11011',
    entity: 'EHM',
    entityName: 'ehmconsultancy',
    dept: 'Product & System',
    role: 'DevOps Engineer',
    avatar: getAvatarByName('Pranshu Dubey'),
  },
  {
    id: 'emp-12',
    name: 'Himanshu Tiwari',
    email: 'himanshu@climagroanalytics.com',
    phone: '+91 98201 11012',
    entity: 'CAG',
    entityName: 'climagroanalytics',
    dept: 'Engineering',
    role: 'Frontend Engineer',
    avatar: getAvatarByName('Himanshu Tiwari'),
  },
];

export const TeamDirectoryView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [showAddModal, setShowAddModal] = useState(false);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Invite modal state
  const [createdEmployee, setCreatedEmployee] = useState<any | null>(null);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isEmployee = user?.role === 'EMPLOYEE';

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('Marketing');
  const [entity, setEntity] = useState<'EHM' | 'CAG'>('EHM');

  const loadTeam = async () => {
    try {
      const data = await fetchApi<any[]>('/api/employees');
      if (Array.isArray(data)) {
        const formatted = data.map(emp => {
          const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
          const entityCode = emp.employeeCode?.startsWith('CAG') ? 'CAG' : 'EHM';
          return {
            id: emp.id,
            name: empName,
            email: emp.email,
            phone: emp.phone || '+91 98201 12345',
            entity: entityCode,
            entityName: entityCode === 'CAG' ? 'climagroanalytics' : 'ehmconsultancy',
            dept: emp.departmentName || 'Engineering',
            role: emp.designation || 'Specialist',
            avatar: getAvatarByName(empName),
          };
        });
        setTeam(formatted);
      }
    } catch (err) {
      console.error('[TEAM DIRECTORY FETCH ERROR]:', err);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const res = await fetchApi<any>('/api/employees', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim(),
          personalEmail: personalEmail.trim(),
          role: roleToAssign,
          designation: position || 'Specialist',
          salary: 85000,
        }),
      });

      if (res.supabaseInviteResult?.sent === true) {
        toast.success(`Employee ${fullName} added! Supabase invitation email sent to ${targetMail}.`);
      } else if (res.supabaseInviteResult?.error) {
        toast.warning(`Employee added, but Supabase Auth invite notice: ${res.supabaseInviteResult.error}`);
      } else {
        toast.success(`Employee ${fullName} added with code ${res.employee?.employeeCode || ''}!`);
      }

      loadTeam();
      setShowAddModal(false);

      setFullName('');
      setEmail('');
      setPersonalEmail('');
      setRole('EMPLOYEE');
      setPosition('');
      setPhoneNumber('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"? This will clear all associated database records so the email address can be re-tested.`)) {
      return;
    }

    try {
      await fetchApi(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      toast.success(`Employee "${name}" deleted from database!`);
      loadTeam();
    } catch (err: any) {
      toast.error(err.message || `Failed to delete ${name}`);
    }
  };

  const handleCopyLink = () => {
    if (!createdInviteLink) return;
    navigator.clipboard.writeText(createdInviteLink);
    setCopiedLink(true);
    toast.success('Invitation link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
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
            const isClimagro = (member.entity || '').toUpperCase() === 'CAG' || (member.entityName || '').toLowerCase().includes('climagro');
            const initials = member.name ? member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'EM';

            return (
              <div key={member.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 text-left text-gray-900 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Initials Avatar Badge */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 shadow-2xs ${
                      isClimagro ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {initials}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 tracking-tight truncate">{member.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-medium truncate">{member.role}</p>

                      {/* Entity & Department Pill Badges */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isClimagro ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {isClimagro ? 'Climagro' : 'EHM'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                          {member.dept || 'Engineering'}
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
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-700">{member.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Remove Action Button */}
                {!isEmployee && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-gray-400">{member.id}</span>
                    <button
                      onClick={() => handleDeleteEmployee(member.id, member.name)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                      title="Remove employee record"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Remove</span>
                    </button>
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
                  {user?.role !== 'ADMIN' && (
                    <p className="text-[10px] text-gray-400 font-medium mt-1">
                      * Only Admins can assign Manager role.
                    </p>
                  )}
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
                    <option value="Sustainability">Sustainability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Entity</label>
                  <select
                    value={entity}
                    onChange={e => setEntity(e.target.value as any)}
                    className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 cursor-pointer"
                  >
                    <option value="EHM">EHM</option>
                    <option value="CAG">CLIMAGRO</option>
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
    </div>
  );
};
