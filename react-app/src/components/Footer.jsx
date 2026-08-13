import { NavLink } from "react-router-dom";
import { SITE } from "../config.js";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <span>2026 {SITE.name} · 智能运维知识库 Agent</span>
        <div className="footer-links">
          <NavLink className="link-btn" to="/demo">进入 Demo</NavLink>
          <a href={SITE.repo} target="_blank" rel="noreferrer">网站源码</a>
        </div>
      </div>
    </footer>
  );
}
