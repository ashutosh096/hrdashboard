import React, { useState, useEffect } from 'react';
import { Mail, UserPlus, Phone, X, Check, Copy, Link as LinkIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';

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
  const [team, setTeam] = useState<any[]>(DEFAULT_TEAM_MEMBERS);
  const [loading, setLoading] = useState(false);

  // Invite modal state
  const [createdEmployee, setCreatedEmployee] = useState<any | null>(null);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isEmployee = user?.role === 'EMPLOYEE';

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('Marketing');
  const [entity, setEntity] = useState<'EHM' | 'CAG'>('EHM');

  const loadTeam = async () => {
    try {
      const data = await fetchApi<any[]>('/api/employees');
      if (data && data.length > 0) {
        const formatted = data.map(emp => {
          const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
          return {
            id: emp.id,
            name: empName,
            email: emp.email,
            phone: emp.phone || '+91 98201 12345',
            entity: emp.entityId === 'cag' ? 'CAG' : 'EHM',
            entityName: emp.entityId || 'ehmconsultancy',
            dept: emp.designation || 'Engineering',
            role: emp.designation || 'Specialist',
            avatar: getAvatarByName(empName),
          };
        });

        // Merge API employees with default roster to avoid duplicates
        const existingNames = new Set(formatted.map(f => f.name.toLowerCase()));
        const remainingDefaults = DEFAULT_TEAM_MEMBERS.filter(
          d => !existingNames.has(d.name.toLowerCase())
        );

        setTeam([...formatted, ...remainingDefaults]);
      }
    } catch (err) {
      console.error('[TEAM DIRECTORY FETCH ERROR]:', err);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const filtered = team.filter(t => selectedEntity === 'ALL' || t.entity === selectedEntity);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || fullName;
      const lastName = parts.slice(1).join(' ') || '';

      const res = await fetchApi<any>('/api/employees', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          designation: position || 'Specialist',
          salary: 85000,
        }),
      });

      toast.success(`Employee ${fullName} added with code ${res.employee?.employeeCode || ''}!`);
      loadTeam();
      setShowAddModal(false);

      if (res.inviteLink) {
        setCreatedEmployee(res.employee);
        setCreatedInviteLink(res.inviteLink);
      }

      setFullName('');
      setEmail('');
      setPosition('');
      setPhoneNumber('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add employee');
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
          <p className="text-xs text-gray-500 font-medium">Employee roster across ehmconsultancy and climagroanalytics.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(member => (
            <div key={member.id} className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs text-center space-y-4">
              <div className="relative inline-block">
                <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-emerald-500/20 shadow-xs" />
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">{member.name}</h3>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">{member.role}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wider font-mono">{member.id}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                <div className="flex items-center justify-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-[11px]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invitation Link Modal popup after employee creation */}
      {createdInviteLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-500/30 animate-in fade-in zoom-in-95 duration-200 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-base">Employee Invitation Link</h3>
              </div>
              <button
                onClick={() => setCreatedInviteLink(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl space-y-2">
              <p className="text-xs font-bold text-emerald-900">
                ✅ Employee {createdEmployee?.firstName || ''} ({createdEmployee?.email}) created!
              </p>
              <p className="text-xs text-emerald-800">
                An invitation email was sent. You can also copy and share this direct setup link with the employee:
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dashboard Setup URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdInviteLink}
                  className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none text-gray-700 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCreatedInviteLink(null)}
                className="px-5 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-base">Add Employee & Send Invitation</h3>
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Tarul Ma'am"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@climagroanalytics.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Position / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Systems Engineer"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Product & Tech">Product & Tech</option>
                    <option value="Operations & Delivery">Operations & Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company Entity</label>
                  <select
                    value={entity}
                    onChange={e => setEntity(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EHM">ehmconsultancy</option>
                    <option value="CAG">climagroanalytics</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Add & Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
