import { useState } from 'react';
import { Link } from 'react-router-dom';
import { refreshData } from '../store/refresh';
export default function Offline() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(
    'This page or its data has not been saved on this device yet. Previously downloaded stories are still available.',
  );
  async function retry() {
    setChecking(true);
    try {
      // A real network probe outside SW cache rules; navigator.onLine alone is not enough.
      const response = await fetch(
        `/manifest.json?connection-check=${Date.now()}`,
        {
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!response.ok) throw new Error('unavailable');
      await refreshData();
      if (window.location.pathname === '/offline')
        window.location.assign('/posts');
      else window.location.reload();
    } catch {
      setMessage(
        'Still unable to connect. Check your connection and try again, or browse saved stories.',
      );
    } finally {
      setChecking(false);
    }
  }
  return (
    <section className="container offline-page">
      <span className="eyebrow">FOLIO OFFLINE</span>
      <h1>
        A little pause.
        <br />
        <em>Your stories can wait.</em>
      </h1>
      <p role="status">{message}</p>
      <div className="offline-actions">
        <button
          className="button button-dark"
          disabled={checking}
          onClick={() => void retry()}
        >
          {checking ? 'Checking connection…' : 'Retry connection'}
        </button>
        <Link className="button button-outline" to="/posts">
          Browse saved stories
        </Link>
      </div>
    </section>
  );
}
