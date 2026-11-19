import { onlineManager, QueryClient } from '@tanstack/react-query';
// A page may START offline after a reload, without receiving an offline event.
if (typeof navigator !== 'undefined') onlineManager.setOnline(navigator.onLine);
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Allow fetch to reach the Service Worker even when the browser is offline.
      networkMode: 'always',
      refetchOnReconnect: 'always',
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: { networkMode: 'always' },
  },
});
