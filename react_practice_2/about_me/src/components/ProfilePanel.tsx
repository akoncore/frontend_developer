import { useEffect, useRef } from "react";
import Contact from "./Contact";
import type { ContactItem, Profile } from "../types";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  contacts: ContactItem[];
  address: string;
}

export default function ProfilePanel({ isOpen, onClose, profile, contacts, address }: ProfilePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`overlay ${isOpen ? "is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside
        id="profile-panel"
        className={`panel ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Profile"
      >
        <div className="panel__top">
          <img src={profile.photo} alt={profile.photoAlt} />
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.role}</p>
          </div>
          <button ref={closeRef} className="panel__close" onClick={onClose} aria-label="Close profile">
            ✕
          </button>
        </div>

        <Contact items={contacts} />

        <section aria-labelledby="address-title">
          <h3 id="address-title">Address</h3>
          <p className="panel__address">{address}</p>
        </section>
      </aside>
    </>
  );
}
