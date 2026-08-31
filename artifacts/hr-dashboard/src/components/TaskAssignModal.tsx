import React, { useState } from 'react';
import { X, Users, User, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TaskAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
}

export const TaskAssignModal: React.FC<TaskAssignModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [assignmentMode, setAssignmentMode] = useState<'INDIVIDUAL' | 'PARTNER'>('INDIVIDUAL');
  const [entityCode, setEntityCode] = useState<'EHM' | 'CAG' | 'BOTH'>('EHM');
  const [departmentCode, setDepartmentCode] = useState<'MAR' | 'DEV' | 'OPS' | 'HR' | 'FIN'>('MAR');
  const [title, setTitle] = useState('');
  const [sprintWeek, setSprintWeek] = useState('Sprint 35');
  const [assigneeName, setAssigneeName] = useState('Priya Sharma');
  const [selectedPartners, setSelectedPartners] = useState<string[]>(['Priya Sharma', 'Rahul Verma']);
  const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
  const [reviewingLead, setReviewingLead] = useState('Dr. Harshit Mishra');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [deliverableUrl, setDeliverableUrl] = useState('');

  const employeeOptions = [
    'Priya Sharma',
    'Rahul Verma',
    'Anita Desai',
    'Vikram Mehta',
  ];

  if (!isOpen) return null;

  const generatedCode = `${entityCode === 'BOTH' ? 'ALL' : entityCode}-${departmentCode}-ADH-${Math.floor(100 + Math.random() * 900)}`;

  const togglePartner = (empName: string) => {
    if (selectedPartners.includes(empName)) {
      if (selectedPartners.length === 1) {
        toast.error('Select at least 1 team partner!');
        return;
      }
      setSelectedPartners(selectedPartners.filter(p => p !== empName));
    } else {
      setSelectedPartners([...selectedPartners, empName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      entityCode,
      departmentCode,
      sprintWeek,
      assigneeName: assignmentMode === 'INDIVIDUAL' ? assigneeName : selectedPartners.join(' + '),
      partners: assignmentMode === 'PARTNER' ? selectedPartners : [assigneeName],
      isPartnerTask: assignmentMode === 'PARTNER',
      reviewingLead,
      priority,
      deliverableUrl,
      taskCode: generatedCode,
    });
    toast.success(`Task ${generatedCode} assigned as ${assignmentMode === 'PARTNER' ? 'Partner Team Task' : 'Individual Task'}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assign New Task</h2>
            <p className="text-[11px] text-gray-400 font-medium">Create individual task or joint partner team deliverable.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assignment Type Selector: Individual vs Partner / Team Task */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Task Assignment Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAssignmentMode('INDIVIDUAL')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  assignmentMode === 'INDIVIDUAL'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Individual Task</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentMode('PARTNER')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  assignmentMode === 'PARTNER'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Partner / Team Task</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Entity Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Entity</label>
              <select
                value={entityCode}
                onChange={(e) => setEntityCode(e.target.value as any)}
                className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="EHM">ehmconsultancy</option>
                <option value="CAG">climagroanalytics</option>
                <option value="BOTH">Both (Both Entities)</option>
              </select>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
              <select
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value as any)}
                className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="MAR">Marketing (MAR)</option>
                <option value="DEV">Engineering (DEV)</option>
                <option value="OPS">Operations (OPS)</option>
                <option value="HR">Human Resources (HR)</option>
                <option value="FIN">Finance (FIN)</option>
              </select>
            </div>
          </div>

          {/* Task Code */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Auto Task ID Code</label>
            <input
              type="text"
              readOnly
              value={generatedCode}
              className="w-full text-xs font-mono font-bold border border-gray-200 rounded-xl p-2.5 bg-gray-100 text-emerald-700"
            />
          </div>

          {/* Task Title / Deliverable Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Task Title / Deliverable Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Joint Q3 Marketing Campaign & API Launch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Target Sprint Week */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Sprint Week</label>
              <input
                type="text"
                value={sprintWeek}
                onChange={(e) => setSprintWeek(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Assignee Section */}
          {assignmentMode === 'INDIVIDUAL' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned To</label>
                <select
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {employeeOptions.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reviewing Lead</label>
                <select
                  value={reviewingLead}
                  onChange={(e) => setReviewingLead(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  <option value="Dr. Harshit Mishra">Dr. Harshit Mishra</option>
                  <option value="Neha Shukla">Neha Shukla</option>
                  <option value="Utsav Mishra">Utsav Mishra</option>
                  <option value="Jitendra Sir">Jitendra Sir</option>
                </select>
              </div>
            </div>
          ) : (
            /* Multi-Select Partner Dropdown Box */
            <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5 space-y-2 relative">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-emerald-950">Select Partner Team Members (Dropdown) *</label>
                <span className="text-[10px] font-bold text-emerald-700">{selectedPartners.length} Partners Selected</span>
              </div>
              
              {/* Dropdown Container Box */}
              <div className="relative">
                <div
                  onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)}
                  className="w-full min-h-[42px] p-2 bg-white border border-gray-300 rounded-xl flex items-center justify-between gap-2 cursor-pointer hover:border-emerald-500 transition-colors"
                >
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {selectedPartners.map((partner) => (
                      <span
                        key={partner}
                        className="inline-flex items-center gap-1 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-2xs"
                      >
                        <span>{partner}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePartner(partner);
                          }}
                          className="hover:bg-emerald-700 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      </span>
                    ))}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPartnerDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu Popover */}
                {isPartnerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                    <p className="text-[10px] text-gray-400 font-bold px-2 py-1 uppercase">Select 2 or more partners:</p>
                    {employeeOptions.map((emp) => {
                      const isSelected = selectedPartners.includes(emp);
                      return (
                        <div
                          key={emp}
                          onClick={() => togglePartner(emp)}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span>{emp}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reviewing Lead</label>
                <select
                  value={reviewingLead}
                  onChange={(e) => setReviewingLead(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-white font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Dr. Harshit Mishra">Dr. Harshit Mishra</option>
                  <option value="Neha Shukla">Neha Shukla</option>
                  <option value="Utsav Mishra">Utsav Mishra</option>
                  <option value="Jitendra Sir">Jitendra Sir</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors"
            >
              Assign Task & Sync
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
