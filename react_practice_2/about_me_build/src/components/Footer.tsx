import type { FooterData } from "../types";
import { contact } from "../data";

interface FooterProps extends FooterData {
  name: string;
}

export default function Footer({ quote, note, name }: FooterProps) {
  return (
    <footer id="contact" className="footer">
      <div aria-hidden className="footer-gradient" />

      {/* abstract mountain silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        className="footer-mountains"
      >
        <path
          d="M0 220 L180 90 L320 170 L480 40 L620 150 L760 70 L940 180 L1080 60 L1200 140 L1200 220 Z"
          fill="url(#mtn)"
        />

        <defs>
          <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="#6366f1"
              stopOpacity="0.35"
            />
            <stop
              offset="100%"
              stopColor="#060814"
              stopOpacity="0.9"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="footer-content">
        <p className="footer-quote">
          &ldquo;{quote}&rdquo;
        </p>

        <p className="footer-note">
          {note} ↗
        </p>

        <div className="footer-links">
          <a
            href={`mailto:${contact.email}`}
            className="footer-link"
          >
            {contact.email}
          </a>

          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            GitHub
          </a>

          <a
            href={contact.instagram}
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            Instagram
          </a>
        </div>

        <p className="footer-copyright">
          © {new Date().getFullYear()} {name}. Built with React,
          TypeScript & Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}