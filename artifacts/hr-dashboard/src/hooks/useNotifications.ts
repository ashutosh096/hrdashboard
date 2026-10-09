import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, clearApiCache } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export interface NotificationSummary {
  unreadCount: number;
  latestUnreadId: string | null;
  latestUnreadCreatedAt: string | null;
}

export interface NotificationItem {
  id: string;
  type: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | Date | null;
  createdAt: string;
  payload?: any;
}

export interface ActiveToastItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  payload?: any;
  isRead?: boolean;
}

const TOASTED_IDS_STORAGE_KEY = 'hros_toasted_ids';
const LAST_TOASTED_AT_STORAGE_KEY = 'hros_last_toasted_at';
const BROADCAST_CHANNEL_NAME = 'hive_notification_toasts';

function getStoredToastedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(TOASTED_IDS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.slice(-200));
    }
  } catch {}
  return new Set();
}

function saveStoredToastedIds(ids: Set<string>) {
  try {
    const arr = Array.from(ids).slice(-200);
    localStorage.setItem(TOASTED_IDS_STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

function getStoredLastToastedAt(): string | null {
  try {
    return localStorage.getItem(LAST_TOASTED_AT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveStoredLastToastedAt(isoString: string) {
  try {
    localStorage.setItem(LAST_TOASTED_AT_STORAGE_KEY, isoString);
  } catch {}
}

export function useNotifications(isTrayOpen: boolean = false) {
  const queryClient = useQueryClient();
  const { user, previewRole } = useAuth();
  const userId = user?.id;
  const effectiveRole = previewRole || user?.role || 'EMPLOYEE';

  const [activeToasts, setActiveToasts] = useState<ActiveToastItem[]>([]);
  const isFirstLoadBaselineSet = useRef<boolean>(false);
  const prevFingerprintRef = useRef<string | null>(null);
  const isFirstSummaryRun = useRef<boolean>(true);

  // Cross-tab broadcast channel
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, id, createdAt } = event.data || {};
        if (type === 'TOAST_QUEUED' && id) {
          // Another tab already toasted this; remove from active toasts here
          setActiveToasts((prev) => prev.filter((t) => t.id !== id));
        } else if (type === 'NOTIFICATION_READ' && id) {
          setActiveToasts((prev) => prev.filter((t) => t.id !== id));
          queryClient.invalidateQueries({
            queryKey: ['notifications', 'summary', userId, effectiveRole],
          });
          queryClient.invalidateQueries({
            queryKey: ['notifications', 'list', userId, effectiveRole],
          });
        } else if (type === 'ALL_NOTIFICATIONS_READ') {
          setActiveToasts([]);
          queryClient.invalidateQueries({
            queryKey: ['notifications', 'summary', userId, effectiveRole],
          });
          queryClient.invalidateQueries({
            queryKey: ['notifications', 'list', userId, effectiveRole],
          });
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [userId, effectiveRole, queryClient]);

  // Fallback storage event listener for cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOASTED_IDS_STORAGE_KEY) {
        const freshIds = getStoredToastedIds();
        setActiveToasts((prev) => prev.filter((t) => !freshIds.has(t.id)));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 1. Lightweight Unread Summary Query (30s interval, paused in background, refetch on window focus)
  const summaryQuery = useQuery<NotificationSummary>({
    queryKey: ['notifications', 'summary', userId, effectiveRole],
    queryFn: async () => {
      const data = await fetchApi<NotificationSummary>('/api/notifications/unread-summary');
      return data;
    },
    enabled: !!userId,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  // 2. Full Notifications List Query (fetched once on mount, enabled: !!userId without ref)
  const listQuery = useQuery<NotificationItem[]>({
    queryKey: ['notifications', 'list', userId, effectiveRole],
    queryFn: async () => {
      const data = await fetchApi<NotificationItem[]>('/api/notifications');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: Infinity,
  });

  // 3. Effect: Invalidate list query when summary fingerprint (unreadCount + latestUnreadId) changes
  const summaryFingerprint = summaryQuery.data
    ? `${summaryQuery.data.unreadCount}_${summaryQuery.data.latestUnreadId || ''}`
    : null;

  useEffect(() => {
    if (!summaryFingerprint) return;

    if (isFirstSummaryRun.current) {
      isFirstSummaryRun.current = false;
      prevFingerprintRef.current = summaryFingerprint;
      return;
    }

    if (prevFingerprintRef.current !== summaryFingerprint) {
      prevFingerprintRef.current = summaryFingerprint;
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list', userId, effectiveRole],
      });
    }
  }, [summaryFingerprint, userId, effectiveRole, queryClient]);

  // 4a. Initial Mount Seeding: Seed backlog IDs and initial baseline once on initial data arrival
  useEffect(() => {
    if (isFirstLoadBaselineSet.current) return;
    if (summaryQuery.data === undefined || listQuery.data === undefined) return;

    isFirstLoadBaselineSet.current = true;
    const storedLastToastedAt = getStoredLastToastedAt();

    if (!storedLastToastedAt) {
      const serverBaseline =
        summaryQuery.data?.latestUnreadCreatedAt ||
        listQuery.data.find((n) => !n.isRead)?.createdAt ||
        new Date(0).toISOString();

      saveStoredLastToastedAt(serverBaseline);

      // Seed pre-existing unread notifications into toasted IDs so backlog never pops
      const currentToasted = getStoredToastedIds();
      listQuery.data.forEach((n) => currentToasted.add(n.id));
      saveStoredToastedIds(currentToasted);
    }
  }, [summaryQuery.data, listQuery.data]);

  // 4b. Live Notification Toasting (runs whenever listQuery.data updates AFTER mount)
  useEffect(() => {
    if (!isFirstLoadBaselineSet.current) return;
    if (!listQuery.data || listQuery.data.length === 0) return;

    const baselineStr = getStoredLastToastedAt();
    const baselineTime = baselineStr ? new Date(baselineStr).getTime() : 0;
    const toastedSet = getStoredToastedIds();

    // Check for fresh unread items created strictly after the server baseline
    const candidates = listQuery.data
      .filter((n) => !n.isRead)
      .filter((n) => !toastedSet.has(n.id))
      .filter((n) => {
        const itemTime = new Date(n.createdAt).getTime();
        return itemTime > baselineTime;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (candidates.length === 0) return;

    candidates.forEach((candidate) => {
      // Re-read localStorage right before queueing to verify other tabs haven't toasted it
      const freshToasted = getStoredToastedIds();
      if (freshToasted.has(candidate.id)) return;

      // Advance lastToastedAt to notification's server createdAt
      saveStoredLastToastedAt(candidate.createdAt);
      freshToasted.add(candidate.id);
      saveStoredToastedIds(freshToasted);

      // If tray is open: suppressed from popping, but still marked toasted so it doesn't pop when tray closes
      if (isTrayOpen) {
        channelRef.current?.postMessage({
          type: 'TOAST_QUEUED',
          id: candidate.id,
          createdAt: candidate.createdAt,
        });
        return;
      }

      // Tray is closed: Queue toast for visual display
      setActiveToasts((prev) => {
        if (prev.some((t) => t.id === candidate.id)) return prev;
        return [
          ...prev,
          {
            id: candidate.id,
            type: candidate.type,
            title: candidate.title,
            message: candidate.message,
            createdAt: candidate.createdAt,
            payload: candidate.payload,
            isRead: false,
          },
        ];
      });

      // Broadcast to other tabs so they don't duplicate
      channelRef.current?.postMessage({
        type: 'TOAST_QUEUED',
        id: candidate.id,
        createdAt: candidate.createdAt,
      });
    });
  }, [listQuery.data, isTrayOpen]);

  // If tray opens while active toasts are visible, suppress them and mark as toasted
  useEffect(() => {
    if (isTrayOpen && activeToasts.length > 0) {
      const freshToasted = getStoredToastedIds();
      activeToasts.forEach((t) => {
        freshToasted.add(t.id);
        saveStoredLastToastedAt(t.createdAt);
      });
      saveStoredToastedIds(freshToasted);
      setActiveToasts([]);
    }
  }, [isTrayOpen, activeToasts]);

  // 5. Optimistic Dismiss / Mark as Read Mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/api/notifications/${id}/read`, { method: 'POST' });
    },
    onMutate: async (id: string) => {
      // Optimistically remove from active toasts
      setActiveToasts((prev) => prev.filter((t) => t.id !== id));

      // Optimistically mark as read in notifications list cache
      const listKey = ['notifications', 'list', userId, effectiveRole];
      await queryClient.cancelQueries({ queryKey: listKey });
      const prevList = queryClient.getQueryData<NotificationItem[]>(listKey);

      if (prevList) {
        queryClient.setQueryData<NotificationItem[]>(listKey, (old) =>
          (old || []).map((item) =>
            item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
          )
        );
      }

      // Optimistically decrement summary unread count
      const summaryKey = ['notifications', 'summary', userId, effectiveRole];
      await queryClient.cancelQueries({ queryKey: summaryKey });
      const prevSummary = queryClient.getQueryData<NotificationSummary>(summaryKey);

      if (prevSummary) {
        queryClient.setQueryData<NotificationSummary>(summaryKey, (old) =>
          old ? { ...old, unreadCount: Math.max(0, old.unreadCount - 1) } : old
        );
      }

      // Broadcast across tabs
      channelRef.current?.postMessage({ type: 'NOTIFICATION_READ', id });

      return { prevList, prevSummary };
    },
    onError: (_err, _id, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(['notifications', 'list', userId, effectiveRole], context.prevList);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['notifications', 'summary', userId, effectiveRole], context.prevSummary);
      }
    },
    onSettled: () => {
      clearApiCache('/api/notifications');
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'summary', userId, effectiveRole],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return fetchApi('/api/notifications/read-all', { method: 'POST' });
    },
    onMutate: async () => {
      setActiveToasts([]);

      const listKey = ['notifications', 'list', userId, effectiveRole];
      await queryClient.cancelQueries({ queryKey: listKey });
      const prevList = queryClient.getQueryData<NotificationItem[]>(listKey);

      if (prevList) {
        queryClient.setQueryData<NotificationItem[]>(listKey, (old) =>
          (old || []).map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() }))
        );
      }

      const summaryKey = ['notifications', 'summary', userId, effectiveRole];
      await queryClient.cancelQueries({ queryKey: summaryKey });
      const prevSummary = queryClient.getQueryData<NotificationSummary>(summaryKey);

      if (prevSummary) {
        queryClient.setQueryData<NotificationSummary>(summaryKey, (old) =>
          old ? { ...old, unreadCount: 0, latestUnreadId: null } : old
        );
      }

      channelRef.current?.postMessage({ type: 'ALL_NOTIFICATIONS_READ' });

      return { prevList, prevSummary };
    },
    onError: (err: any, _variables, context) => {
      if (context?.prevList) {
        queryClient.setQueryData(['notifications', 'list', userId, effectiveRole], context.prevList);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['notifications', 'summary', userId, effectiveRole], context.prevSummary);
      }
      toast.error(err?.message || 'Failed to mark notifications read');
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
    onSettled: () => {
      clearApiCache('/api/notifications');
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'summary', userId, effectiveRole],
      });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list', userId, effectiveRole],
      });
    },
  });

  const dismissToast = useCallback(
    (id: string) => {
      markAsReadMutation.mutate(id);
    },
    [markAsReadMutation]
  );

  return {
    unreadCount: summaryQuery.data?.unreadCount ?? 0,
    latestUnreadId: summaryQuery.data?.latestUnreadId ?? null,
    latestUnreadCreatedAt: summaryQuery.data?.latestUnreadCreatedAt ?? null,
    isSummaryLoading: summaryQuery.isLoading,
    notifications: listQuery.data ?? [],
    isListLoading: listQuery.isLoading,
    activeToasts,
    dismissToast,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
  };
}
