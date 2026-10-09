import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, clearApiCache } from '@workspace/api-client-react';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { toast } from 'sonner';

/**
 * Standard hook to derive active authentication state for query keys
 */
export function useEffectiveAuth() {
  const { user, actualRole, previewRole } = useAuth();
  const userId = user?.id || '';
  const effectiveRole = (actualRole === 'ADMIN' && previewRole) ? previewRole : (actualRole || 'EMPLOYEE');
  return { userId, effectiveRole, user, actualRole, previewRole };
}

// ==========================================
// 1. TASKS QUERY HOOK
// ==========================================
export function useTasksQuery(params?: Record<string, any>) {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  const queryKey = ['tasks', 'list', userId, effectiveRole, selectedEntity, params || {}];

  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = '/api/tasks';
      if (params) {
        const sp = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') sp.append(k, String(v));
        });
        const qs = sp.toString();
        if (qs) url += `?${qs}`;
      }
      const data = await fetchApi<any[]>(url);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 2. SPRINTS QUERY HOOK
// ==========================================
export function useSprintsQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  return useQuery({
    queryKey: ['sprints', 'list', userId, effectiveRole, selectedEntity],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/sprints');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 3. INITIATIVES QUERY HOOK
// ==========================================
export function useInitiativesQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  return useQuery({
    queryKey: ['initiatives', 'list', userId, effectiveRole, selectedEntity],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/initiatives');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 4. EPICS QUERY HOOK
// ==========================================
export function useEpicsQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  return useQuery({
    queryKey: ['epics', 'list', userId, effectiveRole, selectedEntity],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/epics');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 5. PROJECTS QUERY HOOK
// ==========================================
export function useProjectsQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  return useQuery({
    queryKey: ['projects', 'list', userId, effectiveRole, selectedEntity],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/projects');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 6. EMPLOYEES / TEAM DIRECTORY HOOK
// ==========================================
export function useEmployeesQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  return useQuery({
    queryKey: ['employees', 'list', userId, effectiveRole, selectedEntity],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/employees');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 7. MEETINGS QUERY HOOK
// ==========================================
export function useMeetingsQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  return useQuery({
    queryKey: ['meetings', 'list', userId, effectiveRole, selectedEntity],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/meetings');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 8. ANNOUNCEMENTS QUERY HOOK
// ==========================================
export function useAnnouncementsQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  return useQuery({
    queryKey: ['announcements', 'list', userId, effectiveRole, selectedEntity],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/announcements');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 9. ATTENDANCE QUERY HOOK
// ==========================================
export function useAttendanceQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();
  const { selectedEntity } = useEntity();

  return useQuery({
    queryKey: ['attendance', 'list', userId, effectiveRole, selectedEntity],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/attendance');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// ==========================================
// 10. DEPARTMENTS QUERY HOOK
// ==========================================
export function useDepartmentsQuery() {
  const { userId, effectiveRole } = useEffectiveAuth();

  return useQuery({
    queryKey: ['departments', 'list', userId, effectiveRole],
    queryFn: async () => {
      const data = await fetchApi<any[]>('/api/departments');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    staleTime: 60000,
    gcTime: 10 * 60 * 1000,
  });
}

// ==========================================
// 11. TASK SUBRESOURCES & PREFETCH (Checklists, Comments, History)
// ==========================================
export function useTaskSubresources(taskId?: string) {
  const { userId, effectiveRole } = useEffectiveAuth();

  const checklistsQuery = useQuery({
    queryKey: ['task', taskId, 'checklists', userId, effectiveRole],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await fetchApi<any[]>(`/api/tasks/${taskId}/checklists`);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!taskId && !!userId,
    staleTime: 30000,
  });

  const commentsQuery = useQuery({
    queryKey: ['task', taskId, 'comments', userId, effectiveRole],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await fetchApi<any[]>(`/api/tasks/${taskId}/comments`);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!taskId && !!userId,
    staleTime: 30000,
  });

  const historyQuery = useQuery({
    queryKey: ['task', taskId, 'history', userId, effectiveRole],
    queryFn: async () => {
      if (!taskId) return [];
      const res = await fetchApi<any[]>(`/api/tasks/${taskId}/history`).catch(() => []);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!taskId && !!userId,
    staleTime: 30000,
  });

  return {
    checklists: checklistsQuery.data || [],
    isChecklistsLoading: checklistsQuery.isLoading,
    comments: commentsQuery.data || [],
    isCommentsLoading: commentsQuery.isLoading,
    history: historyQuery.data || [],
    isHistoryLoading: historyQuery.isLoading,
  };
}

/**
 * Prefetch task checklists and comments on row hover
 */
export function usePrefetchTask() {
  const queryClient = useQueryClient();
  const { userId, effectiveRole } = useEffectiveAuth();

  return (taskId: string) => {
    if (!taskId || !userId) return;
    queryClient.prefetchQuery({
      queryKey: ['task', taskId, 'checklists', userId, effectiveRole],
      queryFn: async () => {
        const res = await fetchApi<any[]>(`/api/tasks/${taskId}/checklists`);
        return Array.isArray(res) ? res : [];
      },
      staleTime: 30000,
    });
    queryClient.prefetchQuery({
      queryKey: ['task', taskId, 'comments', userId, effectiveRole],
      queryFn: async () => {
        const res = await fetchApi<any[]>(`/api/tasks/${taskId}/comments`);
        return Array.isArray(res) ? res : [];
      },
      staleTime: 30000,
    });
  };
}

// ==========================================
// 12. OPTIMISTIC TASK MUTATION HOOK
// ==========================================
export function useOptimisticTaskUpdate() {
  const queryClient = useQueryClient();
  const { userId, effectiveRole } = useEffectiveAuth();

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      return fetchApi(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onMutate: async ({ taskId, updates }) => {
      // Snapshot all tasks queries to roll back on error
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousQueries = queryClient.getQueriesData<any[]>({ queryKey: ['tasks', 'list'] });

      // Optimistically update every tasks list in cache
      queryClient.setQueriesData<any[]>({ queryKey: ['tasks', 'list'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((t) => (t.id === taskId || t.taskId === taskId ? { ...t, ...updates } : t));
      });

      return { previousQueries };
    },
    onError: (err: any, _vars, context) => {
      // Rollback to prior snapshot
      if (context?.previousQueries) {
        context.previousQueries.forEach(([qKey, qData]) => {
          queryClient.setQueryData(qKey, qData);
        });
      }
      const msg = err?.message || 'Failed to update task';
      toast.error(msg);
    },
    onSuccess: () => {
      toast.success('Task updated successfully');
    },
    onSettled: () => {
      clearApiCache();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['epics'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
