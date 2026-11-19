import { useSyncExternalStore } from 'react';

export const OFFLINE_MESSAGE =
  'This data is not saved on this device. Connect and try again.';
type Source = { cached: boolean; savedAt: number };
const sources = new Map<string, Source>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function useDataSource(url: string) {
  return useSyncExternalStore(subscribe, () => sources.get(url));
}
export async function fetchPublicJSON(
  url: string,
  signal?: AbortSignal,
): Promise<unknown> {
  let response: Response;
  try {
    // Public reads explicitly omit credentials. SW only caches this allowlisted traffic.
    response = await fetch(url, { signal, credentials: 'omit' });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(OFFLINE_MESSAGE);
  }
  if (response.headers.get('X-Folio-Offline') === '1')
    throw new Error(OFFLINE_MESSAGE);
  if (!response.ok)
    throw new Error(
      `Cannot load stories (${response.status}). Please try again.`,
    );
  const data: unknown = await response.json();
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  sources.set(url, {
    cached: response.headers.get('X-Folio-Source') === 'cache',
    savedAt: Number(response.headers.get('X-Folio-Saved-At') || Date.now()),
  });
  listeners.forEach((listener) => listener());
  return data;
}
