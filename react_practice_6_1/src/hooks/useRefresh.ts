import { useEffect } from 'react';
// Requests are shared and deduplicated by thunk conditions, including StrictMode.
// Keep them alive across route changes so another subscriber can reuse the result.
export function useRefresh(load: () => void, refresh: () => void = load) {
  useEffect(() => {
    load();
    window.addEventListener('online', refresh);
    window.addEventListener('focus', load);
    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('focus', load);
    };
  }, [load, refresh]);
}
