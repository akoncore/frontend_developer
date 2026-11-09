import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from './LogoutButton';
const links = [
  { to: '/', text: 'Home', end: true },
  { to: '/posts', text: 'Explore', end: false },
  { to: '/dashboard', text: 'Dashboard', end: false },
  { to: '/about', text: 'About', end: false },
  { to: '/community', text: 'Community', end: false },
];
export default function Navbar() {
  const { user, loading } = useAuth();
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="container nav-inner">
        <NavLink to="/" className="wordmark">
          folio<span>.</span>
        </NavLink>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {link.text}
            </NavLink>
          ))}
        </nav>
        <div className="auth-nav">
          {loading ? (
            <span role="status">Loading…</span>
          ) : user ? (
            <>
              <NavLink to="/profile" className="nav-signin">
                Profile
              </NavLink>
              <LogoutButton />
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-signin">
                Login
              </NavLink>
              <NavLink to="/signup" className="nav-signin">
                Signup
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
