import React, { useState } from 'react';
import { Briefcase, Plus, Search, ExternalLink, X, Shield, Star, Clock, CheckCircle2, User, Edit3, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export interface ApplicationItem {
  id: string;
  title: string;
  urlLink: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reviewingLead: string;
  assignedTo: string;
  status: 'In Progress' | 'Done' | 'Pending' | 'Delayed';
  statusReason?: string;
  description: string;
  createdAt: string;
}

export const ApplicationsView: React.FC = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppToUpdate, setSelectedAppToUpdate] = useState<ApplicationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isEmployee = user?.role === 'EMPLOYEE';

  // Add Form State
  const [title, setTitle] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [reviewingLead, setReviewingLead] = useState('Dr. Harshit Mishra');
  const [assignedTo, setAssignedTo] = useState(user?.name || 'Priya Sharma');
  const [description, setDescription] = useState('');

  // Status Update Modal State
  const [updateStatus, setUpdateStatus] = useState<'In Progress' | 'Done' | 'Pending' | 'Delayed'>('In Progress');
  const [statusReason, setStatusReason] = useState('');

  const [applications, setApplications] = useState<ApplicationItem[]>([
    {
      id: 'app-1',
      title: 'Google - Frontend Developer',
      urlLink: 'https://careers.google.com/jobs/results/12345',
      priority: 'High',
      reviewingLead: 'Dr. Harshit Mishra',
      assignedTo: 'Priya Sharma',
      status: 'In Progress',
      description: 'Submitted resume and portfolio. Technical phone screen scheduled for next Tuesday.',
      createdAt: '2026-08-28',
    },
    {
      id: 'app-2',
      title: 'Microsoft - Cloud Solutions Lead',
      urlLink: 'https://careers.microsoft.com/us/en/job/67890',
      priority: 'Urgent',
      reviewingLead: 'Neha Shukla',
      assignedTo: 'Priya Sharma',
      status: 'Pending',
      statusReason: 'Awaiting talent acquisition HR partner confirmation call',
      description: 'Internal referral submitted by Neha. Manager assigned this to Priya.',
      createdAt: '2026-08-30',
    },
    {
      id: 'app-3',
      title: 'CliAgro Systems - Senior IoT Architect',
      urlLink: 'https://climagroanalytics.com/careers/iot-arch',
      priority: 'Medium',
      reviewingLead: 'Utsav Mishra',
      assignedTo: 'Anita Desai',
      status: 'Done',
      description: 'Offer letter signed & accepted. Onboarding set for 1st of September.',
      createdAt: '2026-08-31',
    },
  ]);

  // Scoping: If Employee, show applications assigned to them (including Manager-created ones)
  const scopedApps = applications.filter(a => isEmployee ? a.assignedTo === (user?.name || 'Priya Sharma') : true);

  const filtered = scopedApps.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.reviewingLead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = scopedApps.length;
  const highPriorityCount = scopedApps.filter(a => a.priority === 'High' || a.priority === 'Urgent').length;
  const pendingCount = scopedApps.filter(a => a.status === 'Pending' || a.status === 'Delayed').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAssignee = isEmployee ? (user?.name || 'Priya Sharma') : assignedTo;
    const newApp: ApplicationItem = {
      id: `app-${Date.now()}`,
      title,
      urlLink,
      priority,
      reviewingLead,
      assignedTo: finalAssignee,
      status: 'In Progress',
      description,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setApplications([newApp, ...applications]);
    toast.success(`Application "${title}" created and synced with ${reviewingLead}!`);
    setShowAddModal(false);
    // Reset form
    setTitle('');
    setUrlLink('');
    setDescription('');
  };

  const handleOpenStatusUpdate = (app: ApplicationItem) => {
    setSelectedAppToUpdate(app);
    setUpdateStatus(app.status);
    setStatusReason(app.statusReason || '');
  };

  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppToUpdate) return;

    if ((updateStatus === 'Pending' || updateStatus === 'Delayed') && !statusReason.trim()) {
      toast.error(`Please provide a reason why this application is ${updateStatus}!`);
      return;
    }

    setApplications(applications.map(a => a.id === selectedAppToUpdate.id ? {
      ...a,
      status: updateStatus,
      statusReason: updateStatus === 'Pending' || updateStatus === 'Delayed' ? statusReason : undefined,
    } : a));

    toast.success(`Application status updated to ${updateStatus}!`);
    setSelectedAppToUpdate(null);
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Applications</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {isEmployee ? 'Applications assigned to you by manager and your submitted applications.' : 'Manage and track work or job application links and manager assignments.'}
          </p>
        </div>
        <button
          onClick={() => {
            setAssignedTo(user?.name || 'Priya Sharma');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
            MY APPLICATIONS
          </span>
          <span className="text-3xl font-extrabold text-gray-900">{totalCount}</span>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
            HIGH / URGENT
          </span>
          <span className="text-3xl font-extrabold text-amber-900">{highPriorityCount}</span>
        </div>

        <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-extrabold text-red-700 uppercase tracking-wider block mb-1">
            PENDING / DELAYED
          </span>
          <span className="text-3xl font-extrabold text-red-900">{pendingCount}</span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">
            REVIEWED BY LEADS
          </span>
          <span className="text-3xl font-extrabold text-emerald-900">2</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-md relative">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200/90 rounded-xl shadow-2xs focus-within:border-indigo-500 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search applications by title, notes, lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Application Title</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Reviewing Lead</th>
                  <th className="py-3 px-3">Applicant / Assigned To</th>
                  <th className="py-3 px-3">Description & Reason Notes</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-3">
                      <span className="font-bold text-gray-900 block text-sm">{app.title}</span>
                      {app.urlLink && (
                        <a
                          href={app.urlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold mt-0.5"
                        >
                          <span>{app.urlLink}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          app.status === 'Done' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          app.status === 'Pending' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                          app.status === 'Delayed' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {app.status}
                        </span>
                        {app.statusReason && (
                          <span className="text-[10px] text-amber-800 font-semibold block italic max-w-[140px] truncate">
                            Reason: {app.statusReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        app.priority === 'Urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                        app.priority === 'High' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {app.priority}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-semibold text-gray-800">{app.reviewingLead}</td>
                    <td className="py-4 px-3 font-bold text-indigo-700">
                      <div className="flex items-center gap-1.5 pt-1">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{app.assignedTo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-600 font-normal max-w-xs">
                      <p className="truncate">{app.description}</p>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenStatusUpdate(app)}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Update Status</span>
                        </button>

                        {app.urlLink && (
                          <a
                            href={app.urlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Open
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-600">No applications assigned or found.</h4>
            <p className="text-xs text-gray-400 mt-1">Click "+ Add Application" above to track a new application.</p>
          </div>
        )}
      </div>

      {/* Add New Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {isEmployee ? 'Submit Application' : 'Add New Application'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Application Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google - Frontend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Application URL/Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://careers.google.com/..."
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reviewing Lead</label>
                  <select
                    value={reviewingLead}
                    onChange={(e) => setReviewingLead(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Dr. Harshit Mishra">Dr. Harshit Mishra</option>
                    <option value="Neha Shukla">Neha Shukla</option>
                    <option value="Utsav Mishra">Utsav Mishra</option>
                    <option value="Jitendra Sir">Jitendra Sir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Applicant Name</label>
                {isEmployee ? (
                  <div className="w-full text-xs font-bold bg-indigo-50/70 border border-indigo-200 rounded-xl p-2.5 text-indigo-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>{user?.name || 'Priya Sharma'}</span>
                    <span className="ml-auto text-[10px] font-extrabold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded uppercase">
                      Current User
                    </span>
                  </div>
                ) : (
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Rahul Verma">Rahul Verma</option>
                    <option value="Anita Desai">Anita Desai</option>
                    <option value="Vikram Mehta">Vikram Mehta</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Add details, notes, deadline info..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                ></textarea>
              </div>

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
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Application Status & Reason Modal */}
      {selectedAppToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Update Application Status</h3>
                <p className="text-[11px] text-indigo-600 font-semibold">{selectedAppToUpdate.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppToUpdate(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select New Status *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as any)}
                  className="w-full text-xs font-bold border border-gray-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Done">Done ✅</option>
                  <option value="In Progress">In Progress 🔄</option>
                  <option value="Pending">Pending ⏳</option>
                  <option value="Delayed">Delayed ⚠️</option>
                </select>
              </div>

              {/* Conditional Reason Input for Pending / Delayed */}
              {(updateStatus === 'Pending' || updateStatus === 'Delayed') && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-amber-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reason for {updateStatus} *</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={`Specify why this application is currently ${updateStatus}...`}
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full text-xs border border-amber-300 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  ></textarea>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedAppToUpdate(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  Save Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
