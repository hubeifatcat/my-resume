import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import HeroSection from "../components/sections/HeroSection.jsx";
import MetricsSection from "../components/sections/MetricsSection.jsx";
import ArchitectureSection from "../components/sections/ArchitectureSection.jsx";
import AgentsSection from "../components/sections/AgentsSection.jsx";
import ProjectsSection from "../components/sections/ProjectsSection.jsx";
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

      {/* 在线体验 CTA：项目展示站入口 */}
      <section className="ma-section ma-alt ma-reveal">
        <div className="container">
          <div className="ma-section-head">
            <span className="ma-num">05</span>
            <h2>在线体验</h2>
          </div>
          <div className="p-cta">
            <h3>这个站点本身就是可运行的项目</h3>
            <p>
              到 Demo 页直接提问，看 Agent 逐个协作、轨迹实时回放；到工作台管理任务与知识资产；
              完整的个人履历在简历页。
            </p>
            <div className="ma-actions">
              <NavLink className="btn btn-primary" to="/demo">进入 Demo</NavLink>
              <NavLink className="btn btn-outline" to="/workbench">AI 工作台</NavLink>
              <NavLink className="btn btn-outline" to="/resume">查看简历</NavLink>
            </div>
          </div>
        </div>
      </section>

      <ProjectsSection />
      <Footer />
      <NavLink className="fab ai" to="/demo" aria-label="Demo">Demo</NavLink>
      <button className="fab top" id="scrollTop" aria-label="回到顶部">↑</button>
    </div>
  );
}
