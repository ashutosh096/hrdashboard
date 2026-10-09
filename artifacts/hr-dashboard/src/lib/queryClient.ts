import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30s stale time
      gcTime: 10 * 60 * 1000, // 10 min cache time
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
