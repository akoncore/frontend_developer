import { useEffect, useState } from 'react';

export function useAsync<T>(loader: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({ data: null, loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    loader(controller.signal)
      .then(data => { if (!controller.signal.aborted) setState({ data, loading: false, error: null }); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setState({ data: null, loading: false, error: error instanceof Error ? error.message : 'Unexpected error' }); });
    return () => controller.abort();
  // loader is intentionally derived from the dependency values at the call site.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
