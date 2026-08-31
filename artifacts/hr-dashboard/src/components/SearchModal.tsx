import React, { useState } from 'react';
import { Search, X, CheckSquare, Calendar, User, Megaphone } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const mockResults = [
    { type: 'Task', code: 'EHM-MAR-ADH-672', title: 'Brand Refresh Assets & Social Kit', icon: CheckSquare },
    { type: 'Task', code: 'CAG-DEV-SPR-101', title: 'IoT Sensor API Gateway v2', icon: CheckSquare },
    { type: 'Employee', code: 'EHM Marketing', title: 'Priya Sharma (Senior Brand Strategist)', icon: User },
    { type: 'Employee', code: 'CAG Engineering', title: 'Rahul Verma (IoT Systems Architect)', icon: User },
    { type: 'Meeting', code: '09:00 AM Today', title: 'Team Standup & Sprint Sync', icon: Calendar },
    { type: 'Announcement', code: 'Pinned Notice', title: 'Q3 All-Hands & Entity Performance Review', icon: Megaphone },
  ].filter(r => query === '' || r.title.toLowerCase().includes(query.toLowerCase()) || r.code.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs pt-20 p-4">
      <div className="bg-white rounded-xl max-w-xl w-full p-4 shadow-2xl border border-gray-200">
        <div className="flex items-center gap-3 px-3 pb-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks (e.g. EHM-MAR-ADH-672), employees, meetings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base border-none outline-none font-medium text-gray-800 placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto pt-2 space-y-1 custom-scrollbar">
          {mockResults.map((r, i) => {
            const Icon = r.icon;
            return (
              <div
                key={i}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{r.title}</h4>
                    <p className="text-xs text-gray-400 font-mono">{r.code}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">
                  {r.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
