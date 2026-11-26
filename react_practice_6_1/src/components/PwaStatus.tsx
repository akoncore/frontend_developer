import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { refreshData } from '../store/refresh';
import { useOnline } from '../hooks/useOnline';
import { useDataSource } from '../services/publicData';
import { applyUpdate, usePwa } from '../pwa/register';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
export default function PwaStatus() {
  const online = useOnline();
  const { pathname } = useLocation();
  const pwa = usePwa();
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [help, setHelp] = useState(false);
  const [installed, setInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches,
  );
  const dataUrl = pathname.startsWith('/community')
    ? `https://jsonplaceholder.typicode.com/posts${/^\/community\/\d+$/.test(pathname) ? '/' + pathname.split('/')[2] : ''}`
    : '/data/posts.json';
  const source = useDataSource(dataUrl);
  const dataPage =
    ['/', '/dashboard', '/posts', '/community'].includes(pathname) ||
    /^\/(posts|community)\//.test(pathname);
  useEffect(() => {
    const prompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    const done = () => {
      setInstalled(true);
      setInstall(null);
    };
    window.addEventListener('beforeinstallprompt', prompt);
    window.addEventListener('appinstalled', done);
    return () => {
      window.removeEventListener('beforeinstallprompt', prompt);
      window.removeEventListener('appinstalled', done);
    };
  }, []);
  async function installApp() {
    if (!install) {
      setHelp((value) => !value);
      return;
    }
    await install.prompt();
    await install.userChoice;
    setInstall(null);
  }
  return (
    <aside className="pwa-bar" aria-label="Application status">
      <div className="container pwa-status-row">
        <span
          className={online ? 'connection online' : 'connection offline'}
          role="status"
        >
          {online ? 'Online' : 'Offline — saved stories available'}
        </span>
        {pwa.ready && (
          <span className="offline-ready">App saved for offline use</span>
        )}
        {!installed && (
          <button className="clear-button" onClick={() => void installApp()}>
            Install Folio
          </button>
        )}
      </div>
      {help && (
        <p className="container pwa-note">
          Use your browser’s Install app option. On iPhone or iPad, open Safari,
          tap Share, then Add to Home Screen.
        </p>
      )}
      {dataPage && source && (source.cached || !online) && (
        <div className="container cached-notice" role="status">
          <span>
            Showing saved data. Last downloaded:{' '}
            {new Date(source.savedAt).toLocaleString()}.
          </span>
          <button
            className="clear-button"
            disabled={!online}
            onClick={() => void refreshData()}
          >
            Refresh data
          </button>
        </div>
      )}
      {pwa.error && (
        <p className="container pwa-note" role="status">
          {pwa.error}
        </p>
      )}
      {pwa.update && (
        <div className="container update-notice" role="status">
          <span>
            A new version of Folio is ready. Updating reloads open tabs; finish
            any unsaved edits first.
          </span>
          <button
            className="button button-dark"
            disabled={pwa.applying}
            onClick={applyUpdate}
          >
            {pwa.applying ? 'Updating…' : 'Update now'}
          </button>
        </div>
      )}
    </aside>
  );
}
