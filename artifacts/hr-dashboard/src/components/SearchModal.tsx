import React, { useEffect, useState } from 'react';
import { Search, X, CheckSquare, User, Calendar } from 'lucide-react';
import { fetchApi } from '@workspace/api-client-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  type: 'Task' | 'Employee';
  code: string;
  title: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    async function loadSearchData() {
      try {
        const [taskData, empData] = await Promise.all([
          fetchApi<any[]>('/api/tasks'),
          fetchApi<any[]>('/api/employees'),
        ]);
        setTasks(Array.isArray(taskData) ? taskData : []);
        setEmployees(Array.isArray(empData) ? empData : []);
      } catch (err) {
        console.error('[SEARCH FETCH ERROR]:', err);
      }
    }
    loadSearchData();
  }, [isOpen]);

  if (!isOpen) return null;

  const liveTaskResults: SearchItem[] = tasks.map((t) => ({
    id: t.id,
    type: 'Task',
    code: t.taskCode || 'TASK',
    title: t.title,
  }));

  const liveEmployeeResults: SearchItem[] = employees.map((e) => ({
    id: e.id,
    type: 'Employee',
    code: e.employeeCode || 'EMP',
    title: `${e.firstName} ${e.lastName} (${e.designation || 'Specialist'})`,
  }));

  const allLiveResults = [...liveTaskResults, ...liveEmployeeResults];

  const searchResults = allLiveResults.filter(
    (r) =>
      query === '' ||
      (r.title || '').toLowerCase().includes(query.toLowerCase()) ||
      (r.code || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs pt-20 p-4">
      <div className="bg-white rounded-xl max-w-xl w-full p-4 shadow-2xl border border-gray-200">
        <div className="flex items-center gap-3 px-3 pb-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks (e.g. EHM-I01-EP01-T001), employees..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base border-none outline-none font-medium text-gray-800 placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto pt-2 space-y-1 custom-scrollbar">
          {searchResults.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400 font-medium">
              No matching tasks or employees found.
            </div>
          ) : (
            searchResults.map((r) => {
              const Icon = r.type === 'Task' ? CheckSquare : User;
              return (
                <div
                  key={r.id}
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
            })
          )}
        </div>
      </div>
    </div>
  );
};
