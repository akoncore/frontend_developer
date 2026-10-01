import type { FooterData } from "../types";
import { contact } from "../data";

interface FooterProps extends FooterData {
  name: string;
}

export default function Footer({ quote, note, name }: FooterProps) {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-navy-950 px-6 pb-14 pt-20 text-center sm:px-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent"
      />

      {/* abstract mountain silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-60"
      >
        <path d="M0 220 L180 90 L320 170 L480 40 L620 150 L760 70 L940 180 L1080 60 L1200 140 L1200 220 Z" fill="url(#mtn)" />
        <defs>
          <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#060814" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative mx-auto max-w-xl">
        <p className="font-display text-xl text-white sm:text-2xl">&ldquo;{quote}&rdquo;</p>

        <p
          className="mt-6 text-lg text-blue-300/80"
          style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
        >
          {note} ↗
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
          <a href={`mailto:${contact.email}`} className="hover:text-white">
            {contact.email}
          </a>
          <a href={contact.github} target="_blank" rel="noreferrer" className="hover:text-white">
            GitHub
          </a>
          <a href={contact.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
            Instagram
          </a>
        </div>

        <p className="mt-8 text-xs text-white/30">
          © {new Date().getFullYear()} {name}. Built with React, TypeScript & Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
