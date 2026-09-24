import Hero from "./components/Hero";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { profile, about, contacts } from "./data";

export default function App() {
  return (
    <>
      <main>
        <Hero {...profile} />
        <About {...about} />
        <Contact items={contacts} />
      </main>
      <Footer name={profile.name} />
    </>
  );
}
