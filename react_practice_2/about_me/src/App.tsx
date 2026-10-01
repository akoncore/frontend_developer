import { useRef, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import ProfilePanel from "./components/ProfilePanel";
import Footer from "./components/Footer";
import { profile, about, contacts, address } from "./data";

export default function App() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closePanel = () => {
    setOpen(false);
    triggerRef.current?.focus(); // фокус профиль батырмасына қайтады
  };

  return (
    <>
      <Header
        name={profile.name}
        photo={profile.photo}
        isOpen={open}
        onProfileClick={() => setOpen(true)}
        buttonRef={triggerRef}
      />
      <main>
        <Hero {...profile} />
        <About {...about} />
      </main>
      <Footer name={profile.name} />

      <ProfilePanel
        isOpen={open}
        onClose={closePanel}
        profile={profile}
        contacts={contacts}
        address={address}
      />
    </>
  );
}
