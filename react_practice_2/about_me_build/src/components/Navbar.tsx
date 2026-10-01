import { useState } from "react";
import type { NavLink } from "../types";

interface NavbarProps {
  links: NavLink[];
}

export default function Navbar({ links }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-90 px-6 py-6 sm:px-10">
        <a href="#home" className="font-display text-lg font-semibold text-white">
          AA
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-sm text-white/70 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-violet-400 to-blue-400 transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <ul className="mx-6 flex flex-col gap-1 rounded-2xl border border-white/20 bg-navy-900/95 p-4 backdrop-blur md:hidden">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
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
