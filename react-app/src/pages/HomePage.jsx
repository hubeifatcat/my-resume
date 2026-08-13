import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import HeroSection from "../components/sections/HeroSection.jsx";
import MetricsSection from "../components/sections/MetricsSection.jsx";
import ArchitectureSection from "../components/sections/ArchitectureSection.jsx";
import AgentsSection from "../components/sections/AgentsSection.jsx";
import ProjectsSection from "../components/sections/ProjectsSection.jsx";
import AboutSection from "../components/sections/AboutSection.jsx";
import ExperienceSection from "../components/sections/ExperienceSection.jsx";
import SkillsSection from "../components/sections/SkillsSection.jsx";
import ContactSection from "../components/sections/ContactSection.jsx";
import usePageEffects from "../hooks/usePageEffects.js";
import { NavLink } from "react-router-dom";

export default function HomePage() {
  usePageEffects();

  return (
    <div className="site v3">
      <Navbar />
      <HeroSection />
      <MetricsSection />
      <ArchitectureSection />
      <AgentsSection />
      <ProjectsSection />
      <AboutSection />
      <ExperienceSection />
      <SkillsSection />
      <ContactSection />
      <Footer />
      <NavLink className="fab ai" to="/demo" aria-label="Demo">Demo</NavLink>
      <button className="fab top" id="scrollTop" aria-label="回到顶部">↑</button>
    </div>
  );
}
