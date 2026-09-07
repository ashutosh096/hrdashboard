import React, { useState } from 'react';
import { Users, AlertCircle, Link as LinkIcon, CheckCircle2, FileText, Plus, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { MALE_AVATAR, FEMALE_AVATAR } from '../utils/avatars';

interface TeamTaskItem {
  id: string;
  taskCode: string;
  title: string;
  entityName: string;
  entityCode: 'EHM' | 'CAG' | 'BOTH';
  partners: string[];
  partnerAvatars: string[];
  reviewingLead: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  dueDate: string;
  status: 'In Progress' | 'Completed' | 'Delayed';
  outputUrl?: string;
  notes?: string;
}

export const TeamTasksView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const isEmployee = user?.role === 'EMPLOYEE';

  const [teamTasks, setTeamTasks] = useState<TeamTaskItem[]>([
    {
      id: 'tt-1',
      taskCode: 'ALL-MAR-ADH-892',
      title: 'Joint Q3 Marketing Campaign & CliAgro API Integration Launch',
      entityName: 'ehmconsultancy & climagroanalytics',
      entityCode: 'BOTH',
      partners: ['Priyanka Sharma', "Tarul Ma'am"],
      partnerAvatars: [FEMALE_AVATAR, MALE_AVATAR],
      reviewingLead: 'Dr. Harshit Mishra',
      priority: 'URGENT',
      dueDate: '2026-09-05',
      status: 'In Progress',
      outputUrl: 'https://canva.link/climagro-joint-campaign',
      notes: "Priyanka handling pitch assets & social graphics; Tarul Ma'am verifying telemetry API endpoints.",
    },
    {
      id: 'tt-2',
      taskCode: 'EHM-OPS-ADH-402',
      title: 'Cross-Entity Vendor Procurement Audit & Compliance Kit',
      entityName: 'ehmconsultancy',
      entityCode: 'EHM',
      partners: ['Utkarsh Mishra', 'Dr. Utsav Mishra'],
      partnerAvatars: [MALE_AVATAR, MALE_AVATAR],
      reviewingLead: 'Dr. Utsav Mishra',
      priority: 'HIGH',
      dueDate: '2026-09-10',
      status: 'In Progress',
      outputUrl: 'https://drive.google.com/joint-procurement-audit',
      notes: 'Utkarsh reviewing operational logistics; Dr. Utsav leading delivery compliance check.',
    },
  ]);

  const filteredTasks = teamTasks.filter(t => {
    if (selectedEntity !== 'ALL' && t.entityCode !== 'BOTH' && t.entityCode !== selectedEntity) {
      return false;
    }
    if (isEmployee) {
      const userFirstName = user?.name?.split(' ')[0]?.toLowerCase() || '';
      return t.partners.some(p => p.toLowerCase().includes(userFirstName));
    }
    return true;
  });

  const handleMarkCompleted = (taskId: string) => {
    setTeamTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'Completed' } : t))
    );
    toast.success('Team task marked as completed!');
  };

  return (
    <div className="p-6 space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Team & Shared Tasks</h2>
          <p className="text-xs text-gray-500 font-medium">Multi-partner deliverables and cross-entity collaborative assignments.</p>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">
          No team tasks assigned for entity filter: <span className="font-bold text-gray-700">{selectedEntity}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold tracking-wider font-mono text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
                    {task.taskCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      task.priority === 'URGENT'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-snug">{task.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{task.notes}</p>

                {/* Partners Row */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {task.partnerAvatars.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Partner"
                          className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-2xs"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700">{task.partners.join(' & ')}</span>
                  </div>

                  <div className="text-right text-[11px] font-semibold text-gray-400">
                    Lead: <span className="text-gray-700 font-bold">{task.reviewingLead}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Due {task.dueDate}
                </span>

                <div className="flex items-center gap-2">
                  {task.outputUrl && (
                    <a
                      href={task.outputUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
                      <span>Output</span>
                    </a>
                  )}

                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => handleMarkCompleted(task.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
