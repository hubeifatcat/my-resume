import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import AboutSection from "../components/sections/AboutSection.jsx";
import ProjectsSection from "../components/sections/ProjectsSection.jsx";
import ExperienceSection from "../components/sections/ExperienceSection.jsx";
import SkillsSection from "../components/sections/SkillsSection.jsx";
import EducationSection from "../components/sections/EducationSection.jsx";
import ContactSection from "../components/sections/ContactSection.jsx";
import usePageEffects from "../hooks/usePageEffects.js";
import { SITE } from "../config.js";

export default function ResumePage() {
  usePageEffects();

  return (
    <div className="site v3">
      <Navbar />
      <header className="p-resume-hero ma-reveal">
        <div className="container">
          <div className="ma-kicker">3 年政企交付 · AI 应用落地 · 可立即到岗</div>
          <h1>{SITE.name} · 实施交付 / AI 应用</h1>
          <p>
            3 年政企 SaaS 实施交付与运维经验，正在用 React、FastAPI、RAG、Agent
            把 AI 应用做成可在线验证的完整产品。
          </p>
        </div>
      </header>
      <AboutSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <EducationSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
