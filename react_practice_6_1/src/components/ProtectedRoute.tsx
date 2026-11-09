import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ErrorState, LoadingState } from './States';
export default function ProtectedRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState text="Restoring your session…" />;
  if (error) return <ErrorState message={error} />;
  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname + location.search }}
    />
  );
}
