import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Footer from "./components/Footer";
import { navLinks, profile, about, projects, footer } from "./data";

export default function App() {

  return (
    <div className="font-body">
      <Navbar links={navLinks} />
      <main>
        <Hero {...profile} />
        <About {...about} />
        <Projects items={projects} />
      </main>
      <Footer {...footer} name={`${profile.firstName} ${profile.lastName}`} />
    </div>
  );
}
