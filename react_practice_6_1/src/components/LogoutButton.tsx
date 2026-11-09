import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authErrorMessage } from '../services/authService';
export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  async function handleLogout() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        className="button button-outline"
        disabled={pending}
        onClick={() => void handleLogout()}
      >
        {pending ? 'Signing out…' : 'Logout'}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
