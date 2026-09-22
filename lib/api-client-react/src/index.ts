import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// High-Speed In-Memory Client Cache for Instant Tab Switching (0ms latency)
const apiCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh cache

export function getCachedApi<T = any>(endpoint: string): T | null {
  const entry = apiCache.get(endpoint);
  if (entry) {
    return entry.data as T;
  }
  return null;
}

export function setCachedApi<T = any>(endpoint: string, data: T) {
  apiCache.set(endpoint, { data, timestamp: Date.now() });
}

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix) || key.includes(prefix)) {
      apiCache.delete(key);
    }
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('hros_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Check if we can return from memory cache for GET requests
  const isGet = method === 'GET';
  if (isGet) {
    // In-flight request deduplication
    if (inFlightRequests.has(endpoint)) {
      return inFlightRequests.get(endpoint) as Promise<T>;
    }
  } else {
    // If mutation (POST/PUT/DELETE), invalidate relevant cache entries
    const rootPath = endpoint.split('?')[0].split('/').slice(0, 3).join('/');
    clearApiCache(rootPath);
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(endpoint, { ...options, headers });
      if (!res.ok) {
        if (res.status === 401 && endpoint.startsWith('/api/auth/me')) {
          localStorage.removeItem('hros_token');
          localStorage.removeItem('hros_active_role');
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/accept-invite')) {
            if (!(window as any).__redirecting_to_login) {
              (window as any).__redirecting_to_login = true;
              setTimeout(() => {
                window.location.href = '/login?expired=true';
              }, 300);
            }
          }
        }
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || 'API request failed');
      }
      const data = await res.json();
      if (isGet) {
        apiCache.set(endpoint, { data, timestamp: Date.now() });
      }
      return data as T;
    } finally {
      if (isGet) {
        inFlightRequests.delete(endpoint);
      }
    }
  })();

  if (isGet) {
    inFlightRequests.set(endpoint, fetchPromise);
  }

  return fetchPromise;
}

export function useDashboardData(entityCode?: string) {
  return useQuery({
    queryKey: ['dashboard', entityCode],
    queryFn: () => fetchApi<{
      stats: { totalEmployees: number; presentToday: number; activeMeetings: number; activeTasks: number };
      trend: Array<{ name: string; hours: number; attendance: number }>;
      sprintSummary: Array<any>;
      crossEntityComparison?: any;
    }>(`/api/dashboard?entity=${entityCode || 'ALL'}`),
    staleTime: 60 * 1000,
  });
}

export function useTasks(entityCode?: string) {
  return useQuery({
    queryKey: ['tasks', entityCode],
    queryFn: () => fetchApi<Array<any>>(`/api/tasks?entity=${entityCode || 'ALL'}`),
    staleTime: 60 * 1000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask: any) => fetchApi('/api/tasks', { method: 'POST', body: JSON.stringify(newTask) }),
    onSuccess: () => {
      clearApiCache('/api/tasks');
      clearApiCache('/api/dashboard');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: () => fetchApi<Array<any>>('/api/meetings'),
    staleTime: 60 * 1000,
  });
}

export function useEmployees(entityCode?: string) {
  return useQuery({
    queryKey: ['employees', entityCode],
    queryFn: () => fetchApi<Array<any>>(`/api/employees?entity=${entityCode || 'ALL'}`),
    staleTime: 60 * 1000,
  });
}
