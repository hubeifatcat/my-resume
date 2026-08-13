import { NavLink } from "react-router-dom";
import ParticleField from "../../ParticleField.jsx";
import { SITE } from "../../config.js";
import { stack } from "../../data/content.js";

export default function HeroSection() {
  return (
    <header className="ma-hero" id="top">
      <ParticleField />
      <div className="container">
        <div className="ma-hero-main ma-reveal">
          <div className="ma-kicker">在线可体验 · 已部署生产环境</div>
          <h1>把运维经验，<br />变成可交互的多智能体系统</h1>
          <p className="ma-role">RuntimeHarness · Blackboard · IntentRouter · RAG · MCP</p>
          <p className="ma-story">
            这个站点本身就是我的项目：FastAPI 调度 4 个 Agent 协作，React 负责前端，
            知识检索、日志分析、脚本生成各司其职，中间结果写入黑板，最后由 DeepSeek
            汇总回答。你可以直接提问，也可以展开轨迹看每一步 Agent 到底做了什么。
          </p>
          <div className="ma-tags">
            {stack.map((s) => <span key={s}>{s}</span>)}
          </div>
          <div className="ma-actions">
            <NavLink className="btn btn-primary" to="/demo">进入 Demo</NavLink>
            <NavLink className="btn btn-outline" to="/resume">查看简历</NavLink>
            <a href={SITE.github} target="_blank" rel="noreferrer" className="btn btn-outline">GitHub</a>
          </div>
        </div>
        <aside className="ma-hero-side ma-reveal">
          <div className="ma-shot-wrap">
            <span className="ma-live-dot"></span>
            <img
              className="ma-shot"
              src="assets/screenshots/demo.png"
              alt="多智能体 Demo 界面截图"
              loading="lazy"
            />
            <span className="ma-shot-caption">真实 Demo · 轨迹与黑板实时可查</span>
          </div>
          <div className="ma-stats">
            <div><strong>4 个</strong><span>Agent 协作单元</span></div>
            <div><strong>1 个</strong><span>统一调度 Harness</span></div>
            <div><strong>全程</strong><span>Trace 轨迹可回放</span></div>
            <div><strong>在线</strong><span>DeepSeek 驱动</span></div>
          </div>
        </aside>
      </div>
    </header>
  );
}
