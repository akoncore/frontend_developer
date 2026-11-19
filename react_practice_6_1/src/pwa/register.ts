import { useSyncExternalStore } from 'react';
import { queryClient } from '../services/queryClient';

type State = {
  ready: boolean;
  update: boolean;
  error: string;
  applying: boolean;
};
let state: State = { ready: false, update: false, error: '', applying: false };
let registration: ServiceWorkerRegistration | undefined;
const listeners = new Set<() => void>();
function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const usePwa = () => useSyncExternalStore(subscribe, () => state);
export async function checkForUpdate() {
  if (registration && navigator.onLine) {
    try {
      await registration.update();
    } catch {
      /* Keep the current working version. */
    }
  }
}
export function applyUpdate() {
  if (!registration?.waiting) return;
  setState({ applying: true });
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}
export async function registerPwa() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  let controlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    setState({ ready: true });
    // Reload every old tab after the accepted update; initial claim needs no reload.
    if (controlled) window.location.reload();
    else void queryClient.invalidateQueries();
    controlled = true;
  });
  try {
    registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    });
    setState({
      ready: Boolean(navigator.serviceWorker.controller),
      update: Boolean(registration.waiting),
    });
    const watch = () => {
      const worker = registration?.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') {
          setState({ update: Boolean(navigator.serviceWorker.controller) });
        }
      });
    };
    registration.addEventListener('updatefound', watch);
    watch();
    void navigator.serviceWorker.ready.then(() => setState({ ready: true }));
    window.addEventListener('online', checkForUpdate);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void checkForUpdate();
    });
    window.setInterval(checkForUpdate, 60 * 60 * 1000);
  } catch {
    setState({
      error:
        'Offline setup could not finish. Reconnect and reload to try again.',
    });
  }
}
