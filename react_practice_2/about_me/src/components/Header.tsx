import type { RefObject } from "react";

interface HeaderProps {
  name: string;
  photo: string;
  isOpen: boolean;
  onProfileClick: () => void;
  buttonRef: RefObject<HTMLButtonElement>;
}

export default function Header({ name, photo, isOpen, onProfileClick, buttonRef }: HeaderProps) {
  return (
    <div className="topbar">
      <span className="topbar__brand">{name}</span>
      <button
        ref={buttonRef}
        className="profile-btn"
        onClick={onProfileClick}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="profile-panel"
      >
        <img src={photo} alt="" />
        Profile
      </button>
    </div>
  );
}
