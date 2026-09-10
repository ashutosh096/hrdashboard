import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';

export const AnnouncementsView: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isEmployee = user?.role === 'EMPLOYEE';

  // Announcement Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'URGENT' | 'IMPORTANT' | 'NORMAL' | 'INFO'>('IMPORTANT');
  const [entityScope, setEntityScope] = useState<'BOTH' | 'EHM' | 'CAG'>('BOTH');
  const [isPinned, setIsPinned] = useState(true);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any[]>('/api/announcements');
      setAnnouncements(data);
    } catch (err) {
      console.error('[ANNOUNCEMENTS FETCH ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAnn = await fetchApi<any>('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title,
          content,
          priority,
          isPinned,
        }),
      });

      toast.success('Announcement published successfully to company feed!');
      loadAnnouncements();
      setShowModal(false);
      setTitle('');
      setContent('');
      setPriority('IMPORTANT');
      setIsPinned(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to post announcement');
    }
  };

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Announcements & Feed</h2>
          <p className="text-xs text-gray-500 font-medium">Company-wide notices, pinned bulletins, and policy updates across all entities.</p>
        </div>

        {/* Manager-only post button */}
        {!isEmployee && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400">Loading company announcements...</div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {announcements.map((item, idx) => (
            <div key={item.id || idx} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.isPinned && <Pin className="w-4 h-4 text-emerald-600 fill-emerald-600" />}
                  <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                    All Companies
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.priority === 'URGENT'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : item.priority === 'IMPORTANT'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {item.priority || 'NORMAL'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">{item.content}</p>
              <span className="text-xs text-gray-400 font-medium block pt-2">{item.createdAt || 'Recent'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Post Announcement</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Announcement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 All-Hands & Performance Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority Badge</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="IMPORTANT">IMPORTANT</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Scope</label>
                  <select
                    value={entityScope}
                    onChange={(e) => setEntityScope(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BOTH">All Companies</option>
                    <option value="EHM">EHM</option>
                    <option value="CAG">CLIMAGRO</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="pinNotice" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Pin announcement to top of feed
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Announcement Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the full announcement message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
