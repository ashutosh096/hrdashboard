import React, { useState } from 'react';
import { CheckSquare, Calendar, Clock, CheckCircle, Video, Edit3, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { TaskUpdateModal, TaskItem } from './TaskUpdateModal';

export interface EmployeeDeliverableTask {
  id: string;
  taskId: string;
  title: string;
  dept: string;
  entity: string;
  priority: string;
  lead: string;
  assigneeName: string;
  status: 'In Progress' | 'Done' | 'Delayed' | 'Blocked';
  dueDate: string;
  outputUrl: string;
  waitingOn: string;
  notes: string;
  delayRequested: boolean;
}

export const EmployeeDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Scoped employee deliverables with explicit interface typing
  const [myTasks, setMyTasks] = useState<EmployeeDeliverableTask[]>([
    {
      id: '1',
      taskId: 'CA-MAR-01',
      title: 'Finalize Q3 Marketing Pitch Deck & Master Prospects',
      dept: 'Marketing',
      entity: 'climagroanalytics',
      priority: 'HIGH',
      lead: 'Dr. Harshit Mishra',
      assigneeName: 'Priya Sharma',
      status: 'Delayed',
      dueDate: 'Today, 5:00 PM',
      outputUrl: 'https://canva.link/climagro-q3-deck',
      waitingOn: 'Waiting on Reviewing Lead',
      notes: 'Task flagged as delayed. Reviewing Lead requested updated deadline.',
      delayRequested: true,
    },
    {
      id: '2',
      taskId: 'EHM-MAR-672',
      title: 'Review CliAgro Brand Refresh & Social Kit',
      dept: 'Marketing',
      entity: 'ehmconsultancy',
      priority: 'MEDIUM',
      lead: 'Neha Shukla',
      assigneeName: 'Priya Sharma',
      status: 'In Progress',
      dueDate: 'Tomorrow, 12:00 PM',
      outputUrl: 'https://github.com/ehm/brand-assets',
      waitingOn: 'None (Self)',
      notes: 'Exported SVG vectors for social media.',
      delayRequested: false,
    },
    {
      id: '3',
      taskId: 'EHM-OPS-412',
      title: 'Submit Sprint Week 34 Audit Deliverables',
      dept: 'Operations & Delivery',
      entity: 'ehmconsultancy',
      priority: 'HIGH',
      lead: 'Utsav Mishra',
      assigneeName: 'Priya Sharma',
      status: 'Done',
      dueDate: 'Yesterday',
      outputUrl: 'https://drive.google.com/audit-report-w34',
      waitingOn: 'None (Self)',
      notes: 'Signed off by operations team.',
      delayRequested: false,
    },
  ]);

  const delayedTask = myTasks.find(t => t.status === 'Delayed');

  const handleOpenTaskUpdate = (t: EmployeeDeliverableTask) => {
    setSelectedTask({
      id: t.id,
      taskId: t.taskId,
      title: t.title,
      entity: t.entity,
      assignee: t.assigneeName,
      reviewingLead: t.lead,
      status: t.status,
      outputUrl: t.outputUrl,
      waitingOn: t.waitingOn,
      notes: t.notes,
    });
  };

  const handleSaveTaskUpdate = (updated: TaskItem) => {
    setMyTasks(myTasks.map(t => t.id === updated.id ? {
      ...t,
      status: updated.status,
      outputUrl: updated.outputUrl || '',
      waitingOn: updated.waitingOn || 'None (Self)',
      notes: updated.notes || '',
    } : t));
  };

  const handleSendDelayRequest = (taskCode: string, leadName: string) => {
    toast.success(`Delay Extension Request for ${taskCode} sent to ${leadName}!`);
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Banner Alert for Delayed Tasks */}
      {delayedTask && (
        <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl p-4 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">⚠️ Task Delay Notice: {delayedTask.taskId}</h4>
              <p className="text-[11px] font-semibold text-amber-800">
                Your task <strong className="text-amber-950">{delayedTask.title}</strong> is flagged as delayed by Lead {delayedTask.lead}.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSendDelayRequest(delayedTask.taskId, delayedTask.lead)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Delay Extension Request</span>
          </button>
        </div>
      )}

      {/* Employee Greeting Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs rounded-full text-[10px] font-bold uppercase tracking-wider">
              Employee Portal
            </span>
            <span className="text-xs text-emerald-100 font-medium">• ehmconsultancy</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Welcome back, {user?.name || 'Priya Sharma'}! 👋</h2>
          <p className="text-xs text-emerald-100 mt-1">Here is your daily work schedule, sprint deliverables, and team meetings.</p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs text-emerald-200 block font-semibold">Today's Status</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/40 border border-white/20 rounded-full text-xs font-bold text-white mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <span>Present • In Office</span>
          </span>
        </div>
      </div>

      {/* Top 4 Employee Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Assigned Deliverables</span>
            <span className="text-lg font-bold text-gray-900">3 Active Tasks</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Google Meetings</span>
            <span className="text-lg font-bold text-gray-900">2 Scheduled Today</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Logged Work Hours</span>
            <span className="text-lg font-bold text-gray-900">38.5 hrs this week</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Sprint Efficiency</span>
            <span className="text-lg font-bold text-emerald-600">96.4% On Track</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: My Tasks (60%) + My Schedule (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Assigned Deliverables Only */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base tracking-tight">My Deliverables & Tasks</h3>
              <p className="text-xs text-gray-400 font-medium">Only tasks assigned to you are displayed here.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Sprint Week 35
            </span>
          </div>

          <div className="space-y-3">
            {myTasks.map(t => (
              <div
                key={t.id}
                onClick={() => handleOpenTaskUpdate(t)}
                className="p-4 border border-gray-200/80 bg-white hover:bg-emerald-50/20 hover:border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer transition-all shadow-2xs group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {t.taskId}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                      t.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.priority}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">• Reviewing Lead: {t.lead}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">{t.title}</h4>
                  <p className="text-xs text-gray-500 font-medium">{t.notes}</p>
                </div>

                {/* Task Status Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-xl border ${
                    t.status === 'Done'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : t.status === 'Delayed'
                      ? 'bg-amber-100 text-amber-900 border-amber-400 font-black'
                      : t.status === 'Blocked'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}>
                    {t.status}
                  </span>
                  <button className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: My Google Meetings Today */}
        <div className="lg:col-span-1 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base tracking-tight">Today's Meetings</h3>
            <span className="text-xs text-gray-400 font-semibold">Google Sync</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">2:30 PM - 3:15 PM</span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full animate-pulse">LIVE NOW</span>
              </div>
              <h4 className="font-bold text-gray-900 text-xs">EHM Strategy & Marketing Alignment</h4>
              <p className="text-[11px] text-gray-500 font-medium">With Dr. Harshit Mishra & Neha Shukla</p>
              <a
                href="https://meet.google.com/abc-defg-hij"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg justify-center transition-colors shadow-2xs mt-1"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Google Meet</span>
              </a>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">4:30 PM - 5:00 PM</span>
                <span className="text-[10px] text-gray-400 font-semibold">Upcoming</span>
              </div>
              <h4 className="font-bold text-gray-900 text-xs">Weekly Sprint Review</h4>
              <p className="text-[11px] text-gray-500 font-medium">With Jitendra Sir & Utsav Mishra</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Update Modal */}
      <TaskUpdateModal
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTaskUpdate}
      />
    </div>
  );
};
