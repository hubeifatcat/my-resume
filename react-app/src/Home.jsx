import { useEffect } from "react";

export default function Home({ onChat }) {
  useEffect(() => {
    const nav = document.getElementById("siteNav");
    const toggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    const scrollTop = document.getElementById("scrollTop");

    const onScroll = () => {
      nav && nav.classList.toggle("scrolled", window.scrollY > 20);
      scrollTop && scrollTop.classList.toggle("visible", window.scrollY > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    toggle && toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks &&
      navLinks.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => navLinks.classList.remove("open"))
      );
    scrollTop &&
      scrollTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="site">
      <nav className="site-nav" id="siteNav">
        <div className="container">
          <a href="#top" className="brand">
            <span className="mark">W</span>
            <span>武渭星</span>
          </a>
          <ul className="nav-links" id="navLinks">
            <li><a href="#about">关于</a></li>
            <li><a href="#work">经历</a></li>
            <li><a href="#projects">项目</a></li>
            <li><a href="#contact">联系</a></li>
          </ul>
          <div className="nav-actions">
            <button className="btn btn-primary btn-sm" onClick={onChat}>AI 助手</button>
            <button className="nav-toggle" id="navToggle" aria-label="菜单">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      <header className="p-hero" id="top">
        <div className="container">
          <div className="p-hero-main">
            <div className="p-kicker">你好，我是 @武渭星</div>
            <h1>
              AI 增强型
              <br />
              实施运维工程师
            </h1>
            <p className="p-role">政企交付 · 云原生运维 · Agent / RAG / 大模型落地</p>
            <p className="p-story">
              3 年政企 SaaS 实施交付与运维，驻场国网信产项目。我把本地大模型、RAG 知识库和
              Agent 工作流带进日常运维，也让故障定位从 10 分钟压到 1 分钟。最近还在独立完成
              一个生产级 AI 简历助手：React + FastAPI + DeepSeek + RAG，从零部署到公网。
            </p>
            <div className="p-tags">
              <span>Docker / K8s</span>
              <span>阿里云</span>
              <span>Python / FastAPI</span>
              <span>Agent / RAG</span>
              <span>DeepSeek</span>
              <span>Caddy</span>
            </div>
            <div className="p-actions">
              <a href="#contact" className="btn btn-primary">聊聊吗</a>
              <button className="btn btn-outline" onClick={onChat}>问我 AI 助手</button>
              <a href="https://github.com/hubeifatcat" target="_blank" rel="noreferrer" className="btn btn-outline">GitHub</a>
            </div>
          </div>

          <aside className="p-hero-side">
            <div className="p-monogram">武</div>
            <div className="p-side-label">OPEN TO WORK · 北京</div>
            <div className="p-stats">
              <div><strong>3 年</strong><span>政企实施运维</span></div>
              <div><strong>10min→1min</strong><span>故障定位提效</span></div>
              <div><strong>+40%</strong><span>脚本编写效率</span></div>
              <div><strong>+50%</strong><span>报告生成效率</span></div>
            </div>
          </aside>
        </div>
        <div className="container p-scroll">
          <span>SCROLL</span><span className="p-scroll-line"></span>
        </div>
      </header>

      <section className="p-section" id="about">
        <div className="container">
          <div className="p-section-head">
            <span className="p-num">01</span>
            <h2>关于我</h2>
          </div>
          <div className="p-about">
            <p>
              我不是只会“看着服务器”的运维，也不是只会写接口的后端。我的方式是：把运维里重复的、
              可量化的部分交给 AI，把自己留给判断和交付。国网数字化审计平台的阿里云运维、
              DataWorks 数据链路、Nacos/Redis/Nginx 中间件，都是我熟悉的日常。
            </p>
            <p>
              我现在做的是把“AI 辅助运维”升级成“AI 原生运维”：从本地大模型部署、RAG 知识库，
              到 Agent + MCP 工具调用，再到生产环境的部署与安全。
            </p>
          </div>
        </div>
      </section>

      <section className="p-section p-alt" id="work">
        <div className="container">
          <div className="p-section-head">
            <span className="p-num">02</span>
            <h2>工作经历</h2>
          </div>
          <div className="p-jobs">
            <div className="p-job">
              <div className="p-job-top"><h3>中电金信 · 实施运维专员</h3><span>2025.03 - 至今</span></div>
              <p>国网数字化审计平台驻场，阿里云生产环境高可用、DataWorks 数据链路、中间件治理与安全加固。</p>
            </div>
            <div className="p-job">
              <div className="p-job-top"><h3>北京金轩锋 · 运维专员</h3><span>2024.07 - 2025.03</span></div>
              <p>7×24 视频监控平台，Zabbix + Grafana 监控体系与链路故障排查。</p>
            </div>
            <div className="p-job">
              <div className="p-job-top"><h3>南京华苏 · 实施工程师</h3><span>2023.10 - 2024.06</span></div>
              <p>统一权限平台微服务化部署、阿里云迁移、Oracle 到 MySQL 数据适配。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="p-section" id="projects">
        <div className="container">
          <div className="p-section-head">
            <span className="p-num">03</span>
            <h2>精选项目</h2>
          </div>
          <div className="p-projects">
            <article className="p-project">
              <span className="p-tag">Agent / RAG</span>
              <h3>智能运维知识库 Agent</h3>
              <p>多智能体 + Hybrid RAG + 本地大模型 + MCP 受控工具调用，故障经验沉淀为可交互问答。</p>
              <div className="p-meta">Recall@4=100% · P95 检索 260ms</div>
            </article>
            <article className="p-project">
              <span className="p-tag">LLM 落地</span>
              <h3>私有化大模型辅助运维</h3>
              <p>Ollama + Dify + RAG 知识库，把故障定位从 10 分钟压到 1 分钟。</p>
              <div className="p-meta">脚本效率 +40% · 报告效率 +50%</div>
            </article>
            <article className="p-project">
              <span className="p-tag">全栈 / 生产部署</span>
              <h3>简历站 AI 助手</h3>
              <p>React 前端 + FastAPI 后端 + DeepSeek + RAG，Caddy 反代部署到公网，可真实对话。</p>
              <div className="p-meta">本站在线 · 端到端自研</div>
            </article>
          </div>
        </div>
      </section>

      <section className="p-section p-alt" id="contact">
        <div className="container">
          <div className="p-section-head">
            <span className="p-num">04</span>
            <h2>聊聊吗</h2>
          </div>
          <div className="p-contact">
            <div><span>邮箱</span><a href="mailto:18335357090@163.com">18335357090@163.com</a></div>
            <div><span>电话</span><a href="tel:19054750791">190-5475-0791</a></div>
            <div><span>微信</span>wwx-_-168</div>
            <div><span>GitHub</span><a href="https://github.com/hubeifatcat" target="_blank" rel="noreferrer">hubeifatcat</a></div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <span>2026 武渭星 · AI 增强型运维工程师</span>
          <div className="footer-links">
            <button className="link-btn" onClick={onChat}>AI 助手</button>
            <a href="https://github.com/hubeifatcat/my-resume" target="_blank" rel="noreferrer">网站源码</a>
          </div>
        </div>
      </footer>

      <button className="fab ai" onClick={onChat} aria-label="AI 助手">AI</button>
      <button className="fab top" id="scrollTop" aria-label="回到顶部">↑</button>
    </div>
  );
}
