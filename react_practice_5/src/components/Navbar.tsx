import { NavLink } from 'react-router-dom';
const links = [{ to: '/', text: 'Home', end: true }, { to: '/posts', text: 'Explore', end: false }, { to: '/dashboard', text: 'Dashboard', end: false }, { to: '/about', text: 'About', end: false }];
export default function Navbar() {
  return <header className="site-header"><div className="container nav-inner">
    <NavLink to="/" className="wordmark">folio<span>.</span></NavLink>
    <nav className="nav-links" aria-label="Main navigation">{links.map(link => <NavLink key={link.to} to={link.to} end={link.end} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>{link.text}</NavLink>)}</nav>
    <NavLink to="/login" className="nav-signin">Sign in <span aria-hidden="true">↗</span></NavLink>
  </div></header>;
}
