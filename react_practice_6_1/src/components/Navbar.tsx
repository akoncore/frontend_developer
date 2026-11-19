import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  const { pathname } = useLocation();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="container nav-inner">
        <NavLink to="/" className="wordmark">
          folio<span>.</span>
        </NavLink>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setMenuPath(open ? null : pathname)}
        >
          {open ? 'Close menu' : 'Menu'}
        </button>
        <nav
          id="main-navigation"
          className={`nav-links${open ? ' is-open' : ''}`}
          aria-label="Main navigation"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setMenuPath(null);
              document
                .querySelector<HTMLButtonElement>('.menu-toggle')
                ?.focus();
            }
          }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMenuPath(null)}
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
