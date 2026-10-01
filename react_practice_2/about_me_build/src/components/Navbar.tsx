import { useState } from "react";
import type { NavLink } from "../types";

interface NavbarProps {
  links: NavLink[];
}

export default function Navbar({ links }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#home" className="navbar-logo">
          AA
        </a>

        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="navbar-link">
                {link.label}

                <span className="navbar-link-line" />
              </a>
            </li>
          ))}
        </ul>

        <button
          className="navbar-menu-button"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {open && (
        <ul className="mobile-menu">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="mobile-menu-link"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}