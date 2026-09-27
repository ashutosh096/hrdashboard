import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Plus, X, Clock, Eye, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '@workspace/api-client-react';

export const AnnouncementsView: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<any | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isEmployee = user?.role === 'EMPLOYEE';

  // Announcement Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'URGENT' | 'IMPORTANT' | 'NORMAL' | 'INFO'>('IMPORTANT');
  const [entityScope, setEntityScope] = useState<'BOTH' | 'EHM' | 'CAG'>('BOTH');
  const [isPinned, setIsPinned] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any[]>('/api/announcements');
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[ANNOUNCEMENTS FETCH ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingAnnouncementId(null);
    setTitle('');
    setContent('');
    setPriority('IMPORTANT');
    setEntityScope('BOTH');
    setIsPinned(false);
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingAnnouncementId(item.id);
    setTitle(item.title || '');
    setContent(item.content || '');
    const p = (item.priority || 'IMPORTANT').toUpperCase();
    setPriority(p === 'URGENT' ? 'URGENT' : p === 'NORMAL' ? 'NORMAL' : 'IMPORTANT');
    setEntityScope('BOTH');
    setIsPinned(!!item.isPinned);
    setViewingAnnouncement(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string, annTitle: string) => {
    if (isEmployee) return;
    if (!window.confirm(`Are you sure you want to delete announcement "${annTitle}"? This cannot be undone.`)) return;

    try {
      await fetchApi(`/api/announcements/${id}`, { method: 'DELETE' });
      toast.success(`Announcement "${annTitle}" deleted successfully!`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (viewingAnnouncement?.id === id) {
        setViewingAnnouncement(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete announcement');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncementId) {
        const updated = await fetchApi<any>(`/api/announcements/${editingAnnouncementId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title,
            content,
            priority,
            isPinned,
          }),
        });

        toast.success('Announcement updated successfully!');
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingAnnouncementId ? (updated || { ...a, title, content, priority, isPinned }) : a))
        );
      } else {
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
        setAnnouncements((prev) => [newAnn || { id: `ann-${Date.now()}`, title, content, priority, isPinned, createdAt: new Date().toISOString() }, ...prev]);
      }

      setShowModal(false);
      setEditingAnnouncementId(null);
      setTitle('');
      setContent('');
      setPriority('IMPORTANT');
      setIsPinned(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save announcement');
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

        {/* Manager/Admin post button */}
        {!isEmployee && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
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
          {announcements.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400 bg-white border border-gray-200/80 rounded-2xl p-8">
              No announcements posted yet. Click "New Announcement" to publish one!
            </div>
          ) : (
            announcements.map((item, idx) => {
              const p = (item.priority || '').toUpperCase();
              const isUrgent = p === 'URGENT' || p === 'P1' || p === '1';
              const isImportant = p === 'IMPORTANT' || p === 'HIGH' || p === 'P2' || p === '2';
              const badgeText = isUrgent ? 'Urgent' : isImportant ? 'Important' : 'Normal';
              const badgeClass = isUrgent 
                ? 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold' 
                : isImportant 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';

              return (
                <div 
                  key={item.id || idx} 
                  className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3 hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {item.isPinned && <Pin className="w-4 h-4 text-emerald-600 fill-emerald-600 shrink-0" />}
                      <h3 
                        onClick={() => setViewingAnnouncement(item)}
                        className="font-bold text-gray-900 text-base hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        {item.title}
                      </h3>
                    </div>
                    
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>

                  {/* Card Body */}
                  <p 
                    onClick={() => setViewingAnnouncement(item)}
                    className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2 cursor-pointer hover:text-gray-900 transition-colors"
                  >
                    {item.content}
                  </p>

                  {/* Card Divider */}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-400 font-medium">
                      <span>{formatDateTime(item.createdAt)}</span>
                      <span>·</span>
                      <span className="text-gray-500 font-semibold">All companies</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewingAnnouncement(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        View
                      </button>

                      {!isEmployee && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View Full Announcement Modal */}
      {viewingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Top Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const p = (viewingAnnouncement.priority || '').toUpperCase();
                  const isUrgent = p === 'URGENT' || p === 'P1' || p === '1';
                  const isImportant = p === 'IMPORTANT' || p === 'HIGH' || p === 'P2' || p === '2';
                  const badgeText = isUrgent ? 'Urgent' : isImportant ? 'Important' : 'Normal';
                  const badgeClass = isUrgent 
                    ? 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold' 
                    : isImportant 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' 
                      : 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
                  return (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                      {badgeText}
                    </span>
                  );
                })()}

                <span className="text-xs font-semibold text-gray-500">
                  All companies
                </span>

                {viewingAnnouncement.isPinned && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-emerald-600" /> Pinned
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingAnnouncement(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Title */}
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {viewingAnnouncement.title}
              </h2>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Modal Body */}
            <div className="space-y-4 text-left">
              <div className="text-sm text-gray-700 font-normal leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto pr-1">
                {viewingAnnouncement.content}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium pt-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Posted {formatDateTime(viewingAnnouncement.createdAt)}</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
              {!isEmployee && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDelete(viewingAnnouncement.id, viewingAnnouncement.title)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(viewingAnnouncement)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    Edit
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setViewingAnnouncement(null)}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {editingAnnouncementId ? 'Edit Announcement' : 'Post Announcement'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
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
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="URGENT">URGENT (P1)</option>
                    <option value="IMPORTANT">IMPORTANT (P2)</option>
                    <option value="NORMAL">NORMAL (P3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Scope</label>
                  <select
                    value={entityScope}
                    onChange={(e) => setEntityScope(e.target.value as any)}
                    className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingAnnouncementId ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
