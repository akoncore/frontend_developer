import { useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authErrorMessage } from '../services/authService';
import { safeReturnPath, validateSignup } from '../services/validation';
import { LoadingState } from '../components/States';
export default function Login({ signup = false }: { signup?: boolean }) {
  const auth = useAuth();
  const location = useLocation();
  const destination = safeReturnPath(location.state?.from);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  if (auth.loading) return <LoadingState text="Restoring your session…" />;
  if (auth.user) return <Navigate to={destination} replace />;
  async function run(action: () => Promise<unknown>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (signup) {
      const message = validateSignup(email, password, confirmation);
      if (message) {
        setError(message);
        return;
      }
    }
    void run(() =>
      signup ? auth.signup(email, password) : auth.login(email, password),
    );
  }
  const disabled = pending || !auth.configured || Boolean(auth.error);
  return (
    <div className="login-page container">
      <div className="login-panel">
        <span className="eyebrow">
          {signup ? 'JOIN THE JOURNAL' : 'WELCOME BACK'}
        </span>
        <h1>
          {signup ? 'Create your' : 'Sign in to'}{' '}
          <em>{signup ? 'account.' : 'folio.'}</em>
        </h1>
        <p>
          {signup
            ? 'A place for your next great idea.'
            : 'Your stories and your profile, all in one place.'}
        </p>
        {!auth.configured && (
          <p className="form-error" role="alert">
            Authentication is not configured. Add Firebase settings to
            .env.local and restart the app.
          </p>
        )}
        {(error || auth.error) && (
          <p className="form-error" role="alert">
            {error || auth.error}
          </p>
        )}
        <form onSubmit={submit} aria-busy={pending}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            required
            minLength={signup ? 6 : undefined}
            type="password"
            autoComplete={signup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={disabled}
          />
          {signup && (
            <>
              <label htmlFor="confirmation">Confirm password</label>
              <input
                id="confirmation"
                required
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={disabled}
              />
            </>
          )}
          <button
            className="button button-dark"
            type="submit"
            disabled={disabled}
          >
            {pending ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
          </button>
          <div className="auth-divider">or</div>
          <button
            className="button button-outline"
            type="button"
            disabled={disabled}
            onClick={() => void run(auth.loginWithGoogle)}
          >
            Continue with Google
          </button>
        </form>
        <p>
          {signup ? 'Already have an account?' : 'New to Folio?'}{' '}
          <Link
            className="text-link"
            to={signup ? '/login' : '/signup'}
            state={location.state}
          >
            {signup ? 'Sign in' : 'Create account'}
          </Link>
        </p>
      </div>
      <div className="login-visual">
        <div className="login-visual-inner">
          <span>WORDS THAT CONNECT US</span>
          <h2>
            Every great idea
            <br />
            starts with a story.
          </h2>
        </div>
      </div>
    </div>
  );
}
