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

  const projects = [
    {
      tag: "全栈 · 生产部署",
      name: "简历站 AI 助手",
      desc: "React 前端 + FastAPI 后端 + DeepSeek + RAG，Caddy 反代部署到公网，在线可对话。",
      meta: "从 0 到 1 独立完成 · 已上线",
      stack: ["React", "FastAPI", "DeepSeek", "RAG", "Caddy"],
    },
    {
      tag: "Agent · RAG",
      name: "智能运维知识库 Agent",
      desc: "多智能体 + Hybrid RAG + 本地大模型 + MCP 受控工具调用，把故障经验变成可交互系统。",
      meta: "Recall@4=100% · P95 检索 260ms",
      stack: ["Python", "FastAPI", "Chroma", "MCP", "Ollama"],
    },
    {
      tag: "LLM 落地",
      name: "私有化大模型辅助运维",
      desc: "Ollama + Dify + RAG 知识库，让 AI 真正参与日常运维并量化提效。",
      meta: "故障定位 10min→1min · 脚本 +40%",
      stack: ["Ollama", "Dify", "RAG", "Shell", "Python"],
    },
  ];

  const skillGroups = [
    { title: "AI 研发", items: ["Python", "FastAPI", "React / Vite", "RAG", "Agent / MCP", "DeepSeek"] },
    { title: "云原生", items: ["Docker", "K8s", "阿里云", "Caddy", "CI/CD"] },
    { title: "数据与中间件", items: ["Nacos", "Redis", "Nginx", "DataWorks", "MySQL", "Oracle"] },
  ];

  return (
    <div className="site v3">
      <nav className="site-nav" id="siteNav">
        <div className="container">
          <a href="#top" className="brand">
            <span className="mark">W</span>
            <span>武渭星</span>
          </a>
          <ul className="nav-links" id="navLinks">
            <li><a href="#about">关于</a></li>
            <li><a href="#projects">研发项目</a></li>
            <li><a href="#work">经历</a></li>
            <li><a href="#skills">技术栈</a></li>
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
            <div className="p-kicker glass">你好，我是 @武渭星 · AI 研发 / 全栈工程</div>
            <h1>把运维经验，<br />编译成 AI 研发能力</h1>
            <p className="p-role">AI 应用 · Agent / RAG · 全栈工程 · 生产部署</p>
            <p className="p-story glass">
              从 3 年政企交付运维出发，我正在完成一次转型：独立做出一个生产级 AI 助手
              （React + FastAPI + DeepSeek + RAG），从设计、开发、部署到安全加固全流程都由自己闭环；
              同时把 Agent、RAG、MCP 工具链真正落进运维场景。
            </p>
            <div className="p-tags">
              <span>Python / FastAPI</span>
              <span>React / Vite</span>
              <span>RAG / Agent</span>
              <span>Docker / K8s</span>
              <span>DeepSeek</span>
              <span>Caddy / DevOps</span>
            </div>
            <div className="p-actions">
              <a href="#projects" className="btn btn-primary">看研发项目</a>
              <button className="btn btn-outline" onClick={onChat}>问我 AI 助手</button>
              <a href="https://github.com/hubeifatcat" target="_blank" rel="noreferrer" className="btn btn-outline">GitHub</a>
            </div>
          </div>

          <aside className="p-hero-side glass">
            <div className="p-monogram">武</div>
            <div className="p-side-label">OPEN TO AI R&D · 北京</div>
            <div className="p-stats">
              <div><strong>3 年</strong><span>政企交付运维</span></div>
              <div><strong>1 个</strong><span>生产级 AI 助手</span></div>
              <div><strong>10min→1min</strong><span>故障定位提效</span></div>
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
          <div className="p-about glass">
            <p>
              运维是我的底盘：阿里云、Docker/K8s、Nacos/Redis/Nginx、DataWorks、数据库迁移，
              这些我都亲手做过，也知道生产环境里“能上线”和“能扛住”的区别。
            </p>
            <p>
              研发是我的方向：我在用 Python/FastAPI 写后端，用 React 做前端，用 RAG、Agent、MCP
              搭 AI 应用，并且坚持把每一段代码部署到真实环境里验证。目标是从“AI 增强型运维”
              成长为“能独立交付 AI 应用的全栈研发工程师”。
            </p>
          </div>
        </div>
      </section>

      <section className="p-section p-alt" id="projects">
        <div className="container">
          <div className="p-section-head">
            <span className="p-num">02</span>
            <h2>研发项目</h2>
          </div>
          <div className="p-projects">
            {projects.map((p) => (
              <article className="p-project glass" key={p.name}>
                <span className="p-tag">{p.tag}</span>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
                <div className="p-stack">
                  {p.stack.map((s) => <span key={s}>{s}</span>)}
                </div>
                <div className="p-meta">{p.meta}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section" id="work">
        <div className="container">
          <div className="p-section-head">
            <span className="p-num">03</span>
            <h2>工作经历</h2>
          </div>
          <div className="p-jobs">
            <div className="p-job glass">
              <div className="p-job-top"><h3>中电金信 · 实施运维专员</h3><span>2025.03 - 至今</span></div>
              <p>国网数字化审计平台驻场，阿里云生产环境高可用、DataWorks 数据链路、中间件治理与安全加固。</p>
            </div>
            <div className="p-job glass">
              <div className="p-job-top"><h3>北京金轩锋 · 运维专员</h3><span>2024.07 - 2025.03</span></div>
              <p>7×24 视频监控平台，Zabbix + Grafana 监控体系与链路故障排查。</p>
            </div>
            <div className="p-job glass">
              <div className="p-job-top"><h3>南京华苏 · 实施工程师</h3><span>2023.10 - 2024.06</span></div>
              <p>统一权限平台微服务化部署、阿里云迁移、Oracle 到 MySQL 数据适配。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="p-section p-alt" id="skills">
        <div className="container">
          <div className="p-section-head">
            <span className="p-num">04</span>
            <h2>技术栈</h2>
          </div>
          <div className="p-skills">
            {skillGroups.map((g) => (
              <div className="p-skill glass" key={g.title}>
                <h3>{g.title}</h3>
                <div className="p-stack">
                  {g.items.map((s) => <span key={s}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section" id="contact">
        <div className="container">
          <div className="p-section-head">
            <span className="p-num">05</span>
            <h2>聊聊吗</h2>
          </div>
          <div className="p-contact glass">
            <div><span>邮箱</span><a href="mailto:18335357090@163.com">18335357090@163.com</a></div>
            <div><span>电话</span><a href="tel:19054750791">190-5475-0791</a></div>
            <div><span>微信</span>wwx-_-168</div>
            <div><span>GitHub</span><a href="https://github.com/hubeifatcat" target="_blank" rel="noreferrer">hubeifatcat</a></div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <span>2026 武渭星 · AI 研发 / 全栈工程</span>
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
