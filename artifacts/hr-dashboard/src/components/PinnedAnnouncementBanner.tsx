import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Megaphone, Pin, X, ChevronRight, ChevronLeft, Eye, Clock } from 'lucide-react';
import { fetchApi, clearApiCache } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { formatDateTime } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

export const PinnedAnnouncementBanner: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const userId = user?.id || user?.employeeId || user?.email || 'guest';

  // Collect all valid IDs for the current user
  const userIdentifiers = useMemo(() => {
    return [user?.id, user?.email, user?.employeeId, userId]
      .filter(Boolean)
      .map((x) => String(x).toLowerCase().trim());
  }, [user?.id, user?.email, user?.employeeId, userId]);

  const [pinnedList, setPinnedList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);

  // Helper to read dismissed IDs from local storage for current user
  const getStoredDismissedIds = useCallback((): string[] => {
    const ids = new Set<string>();
    try {
      const keys = [
        `hros_dismissed_pinned_${userId}`,
        user?.email ? `hros_dismissed_pinned_${user.email.toLowerCase()}` : null,
        user?.id ? `hros_dismissed_pinned_${user.id}` : null,
        user?.employeeId ? `hros_dismissed_pinned_${user.employeeId}` : null,
      ].filter(Boolean) as string[];

      for (const k of keys) {
        const val = localStorage.getItem(k);
        if (val) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((id) => ids.add(String(id)));
          }
        }
      }
    } catch {}
    return Array.from(ids);
  }, [userId, user?.email, user?.id, user?.employeeId]);

  const [dismissedIds, setDismissedIds] = useState<string[]>(getStoredDismissedIds);

  // Re-sync local dismissed IDs when user profile loads/changes
  useEffect(() => {
    setDismissedIds(getStoredDismissedIds());
  }, [getStoredDismissedIds]);

  // Load pinned announcements whenever user changes or logs in
  const loadPinned = useCallback(async () => {
    try {
      clearApiCache('/api/announcements');
      const data = await fetchApi<any[]>('/api/announcements');
      if (Array.isArray(data)) {
        const pinned = data.filter((a) => a && (a.isPinned === true || a.is_pinned === true));
        setPinnedList(pinned);
      }
    } catch (err) {
      console.warn('[PINNED BANNER LOAD]:', err);
    }
  }, []);

  useEffect(() => {
    loadPinned();
  }, [loadPinned, user?.id, user?.email]);

  // Dismiss handler: updates state, local storage for this user, and database permanently
  const handleDismiss = useCallback(
    (e: React.MouseEvent | null, id: string) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (!id) return;

      // 1. Immediately update React state
      setDismissedIds((prev) => Array.from(new Set([...prev, id])));

      // 2. Mark as dismissed in pinnedList in-memory
      setPinnedList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const seen = Array.isArray(item.seenBy) ? [...item.seenBy] : [];
            userIdentifiers.forEach((uid) => {
              if (!seen.includes(uid)) seen.push(uid);
            });
            return { ...item, isDismissed: true, seenBy: seen, seen_by: seen };
          }
          return item;
        })
      );

      // 3. Persist to localStorage across all current user keys
      try {
        const keys = [
          `hros_dismissed_pinned_${userId}`,
          user?.email ? `hros_dismissed_pinned_${user.email.toLowerCase()}` : null,
          user?.id ? `hros_dismissed_pinned_${user.id}` : null,
          user?.employeeId ? `hros_dismissed_pinned_${user.employeeId}` : null,
        ].filter(Boolean) as string[];

        for (const k of keys) {
          const existing = JSON.parse(localStorage.getItem(k) || '[]');
          const set = new Set([...existing, id]);
          localStorage.setItem(k, JSON.stringify(Array.from(set)));
        }
      } catch (err) {
        console.warn('[DISMISS LOCAL STORAGE SAVE]:', err);
      }

      // 4. Persist to PostgreSQL database so it stays dismissed permanently across logins and browsers
      clearApiCache('/api/announcements');
      fetchApi(`/api/announcements/${id}/dismiss`, {
        method: 'POST',
      }).catch((err) => console.warn('[BACKEND DISMISS POST]:', err));
    },
    [userId, user?.email, user?.id, user?.employeeId, userIdentifiers]
  );

  // Filter out any announcements that have been dismissed
  const activePinned = useMemo(() => {
    return pinnedList.filter((a) => {
      if (!a || !a.id) return false;

      // Check backend-computed isDismissed
      if (a.isDismissed === true) return false;

      // Check local dismissed state
      if (dismissedIds.includes(a.id)) return false;

      // Check seenBy / seen_by array from database
      const seenList = (Array.isArray(a.seenBy) ? a.seenBy : Array.isArray(a.seen_by) ? a.seen_by : []).map((x: any) =>
        String(x).toLowerCase().trim()
      );
      const isSeen = userIdentifiers.some((uid) => seenList.includes(uid));
      if (isSeen) return false;

      return true;
    });
  }, [pinnedList, dismissedIds, userIdentifiers]);

  // Adjust currentIndex if items were dismissed
  useEffect(() => {
    if (currentIndex >= activePinned.length && activePinned.length > 0) {
      setCurrentIndex(0);
    }
  }, [activePinned.length, currentIndex]);

  // If no pinned items remain, banner is completely hidden
  if (activePinned.length === 0) {
    return null;
  }

  const currentItem = activePinned[Math.min(currentIndex, activePinned.length - 1)];
  if (!currentItem) return null;

  const handleOpenNotice = (item: any) => {
    setSelectedAnnouncement(item);
    // Reading an announcement automatically marks it dismissed from the top banner for this user
    handleDismiss(null, item.id);
  };

  const p = (currentItem.priority || '').toUpperCase();
  const isUrgent = p === 'URGENT' || p === 'P1' || p === '1';
  const isImportant = p === 'IMPORTANT' || p === 'HIGH' || p === 'P2' || p === '2';

  const badgeColor = isUrgent
    ? 'bg-rose-100 text-rose-800 border-rose-200'
    : isImportant
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  const bannerBg = isUrgent
    ? 'bg-gradient-to-r from-rose-50/90 via-white to-rose-50/70 border-rose-200 shadow-xs'
    : isImportant
      ? 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/70 border-amber-200 shadow-xs'
      : 'bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/70 border-emerald-200 shadow-xs';

  return (
    <>
      <div className="w-full mb-5 select-none animate-in fade-in slide-in-from-top-2 duration-200">
        <div className={`relative flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${bannerBg} transition-all`}>
          {/* Left: Megaphone & Badge */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-gray-200/80 shadow-2xs shrink-0">
              <Megaphone className={`w-4 h-4 ${isUrgent ? 'text-rose-600' : isImportant ? 'text-amber-600' : 'text-emerald-600'}`} />
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${badgeColor}`}>
                {isUrgent ? 'Urgent Notice' : isImportant ? 'Important Notice' : 'Pinned Notice'}
              </span>

              <div
                onClick={() => handleOpenNotice(currentItem)}
                className="flex items-center gap-2 min-w-0 cursor-pointer group"
                title="Click to view full announcement"
              >
                <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                  {currentItem.title}
                </span>
                <span className="hidden md:inline-block text-xs text-gray-500 font-medium truncate max-w-md">
                  — {currentItem.content}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Dismiss */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Multi-pinned navigation */}
            {activePinned.length > 1 && (
              <div className="flex items-center gap-1 bg-white/80 border border-gray-200 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activePinned.length - 1))}
                  className="hover:text-gray-900 cursor-pointer p-0.5"
                  title="Previous pinned notice"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span>
                  {currentIndex + 1}/{activePinned.length}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev < activePinned.length - 1 ? prev + 1 : 0))}
                  className="hover:text-gray-900 cursor-pointer p-0.5"
                  title="Next pinned notice"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Read Button */}
            <button
              type="button"
              onClick={() => handleOpenNotice(currentItem)}
              className="px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Read</span>
            </button>

            {/* Cross Dismiss Button */}
            <button
              type="button"
              onClick={(e) => handleDismiss(e, currentItem.id)}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
              title="Dismiss notice from top banner (notice remains available in the Announcements tab)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Modal Viewer */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Badges Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const prio = (selectedAnnouncement.priority || '').toUpperCase();
                  const isUrg = prio === 'URGENT' || prio === 'P1' || prio === '1';
                  const isImp = prio === 'IMPORTANT' || prio === 'HIGH' || prio === 'P2' || prio === '2';
                  const text = isUrg ? 'Urgent' : isImp ? 'Important' : 'Normal';
                  const cl = isUrg
                    ? 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold'
                    : isImp
                      ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                      : 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
                  return <span className={`text-xs px-2.5 py-0.5 rounded-full border ${cl}`}>{text}</span>;
                })()}

                <span className="text-xs font-semibold text-gray-500">All companies</span>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-emerald-600" /> Pinned
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleDismiss(null, selectedAnnouncement.id);
                  setSelectedAnnouncement(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {selectedAnnouncement.title}
              </h2>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Body */}
            <div className="space-y-4 text-left">
              <div className="text-sm text-gray-700 font-normal leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto pr-1">
                {selectedAnnouncement.content}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium pt-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Posted {formatDateTime(selectedAnnouncement.createdAt)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  handleDismiss(null, selectedAnnouncement.id);
                  setSelectedAnnouncement(null);
                  setLocation('/announcements');
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                View all in Announcements Tab &rarr;
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDismiss(null, selectedAnnouncement.id);
                  setSelectedAnnouncement(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
