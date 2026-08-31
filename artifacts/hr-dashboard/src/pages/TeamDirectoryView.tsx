import React, { useState } from 'react';
import { Mail, Plus, UserPlus, Phone, Briefcase, Building2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';

export const TeamDirectoryView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [showAddModal, setShowAddModal] = useState(false);

  const isEmployee = user?.role === 'EMPLOYEE';

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('Marketing');
  const [entity, setEntity] = useState<'EHM' | 'CAG'>('EHM');

  const [team, setTeam] = useState([
    { id: '1', name: 'Priya Sharma', email: 'priya@ehmconsultancy.com', phone: '+91 98201 12345', entity: 'EHM', entityName: 'ehmconsultancy', dept: 'Marketing', role: 'Senior Brand Strategist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: '2', name: 'Rahul Verma', email: 'rahul@climagroanalytics.com', phone: '+91 98202 23456', entity: 'CAG', entityName: 'climagroanalytics', dept: 'Product & Tech', role: 'IoT Systems Architect', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: '3', name: 'Anita Desai', email: 'anita@ehmconsultancy.com', phone: '+91 98203 34567', entity: 'EHM', entityName: 'ehmconsultancy', dept: 'Operations & Delivery', role: 'Operations Manager', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { id: '4', name: 'Vikram Mehta', email: 'vikram@climagroanalytics.com', phone: '+91 98204 45678', entity: 'CAG', entityName: 'climagroanalytics', dept: 'Grants & Governance', role: 'Lead Governance Analyst', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  ]);

  const filtered = team.filter(t => selectedEntity === 'ALL' || t.entity === selectedEntity);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember = {
      id: `emp-${Date.now()}`,
      name: fullName || 'New Team Member',
      email,
      phone: phoneNumber || '+91 98000 00000',
      entity,
      entityName: entity === 'EHM' ? 'ehmconsultancy' : 'climagroanalytics',
      dept: department,
      role: position || 'Team Member',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    };
    setTeam([newMember, ...team]);
    toast.success(`Employee ${fullName} added & invite email sent via Resend!`);
    setShowAddModal(false);
    // Reset form
    setFullName('');
    setEmail('');
    setPosition('');
    setPhoneNumber('');
  };

  return (
    <div className="p-6 space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Team Directory</h2>
          <p className="text-xs text-gray-500 font-medium">Employee roster across ehmconsultancy and climagroanalytics.</p>
        </div>

        {/* Hide Add Employee button for Employee Role */}
        {!isEmployee && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Employee Cards Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(member => (
          <div key={member.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col items-center text-center">
            <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-50 mb-3 shadow-xs" />
            <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
            <span className="text-xs text-emerald-600 font-semibold mb-1">{member.role}</span>
            <span className="text-[11px] text-gray-400 font-medium mb-3">{member.entityName} • {member.dept}</span>
            <div className="w-full space-y-1.5 pt-2 border-t border-gray-100">
              <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-600 font-medium border border-gray-200 px-3 py-1.5 rounded-lg w-full justify-center transition-colors">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{member.email}</span>
              </a>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium justify-center">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>{member.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal — Wider 2-Column Card Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-base">Add Employee & Send Resend Invite</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Verma"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Work Email */}
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
                {/* Position */}
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

                {/* Phone Number */}
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
                {/* Department Dropdown */}
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
                    <option value="Grants & Governance">Grants & Governance</option>
                  </select>
                </div>

                {/* Company Entity Dropdown */}
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

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors"
                >
                  Send Resend Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
