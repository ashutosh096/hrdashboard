import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('hros_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'API request failed');
  }
  return res.json();
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
  });
}

export function useTasks(entityCode?: string) {
  return useQuery({
    queryKey: ['tasks', entityCode],
    queryFn: () => fetchApi<Array<any>>(`/api/tasks?entity=${entityCode || 'ALL'}`),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask: any) => fetchApi('/api/tasks', { method: 'POST', body: JSON.stringify(newTask) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: () => fetchApi<Array<any>>('/api/meetings'),
  });
}

export function useEmployees(entityCode?: string) {
  return useQuery({
    queryKey: ['employees', entityCode],
    queryFn: () => fetchApi<Array<any>>(`/api/employees?entity=${entityCode || 'ALL'}`),
  });
}
