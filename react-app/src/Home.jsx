import { useEffect, useRef } from "react";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            entry.target.querySelectorAll(".fill").forEach((f) => {
              f.style.width = f.dataset.w + "%";
            });
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home({ onChat }) {
  const pageRef = useReveal();

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
    toggle &&
      toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks &&
      navLinks.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => navLinks.classList.remove("open"))
      );
    scrollTop &&
      scrollTop.addEventListener("click", () =>
        window.scrollTo({ top: 0, behavior: "smooth" })
      );
    return () => {
      window.removeEventListener("scroll", onScroll);
      toggle && toggle.removeEventListener("click", () => {});
    };
  }, []);

  return (
    <div ref={pageRef}>
      <nav className="site-nav" id="siteNav">
        <div className="container">
          <a href="#home" className="brand">
            <span className="mark">武</span>
            <span>武渭星</span>
            <span className="dot"></span>
          </a>
          <ul className="nav-links" id="navLinks">
            <li><a href="#advantages">优势</a></li>
            <li><a href="#experience">经历</a></li>
            <li><a href="#projects">项目</a></li>
            <li><a href="#skills">技能</a></li>
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

      <header className="hero" id="home">
        <div className="container">
          <div>
            <div className="hero-eyebrow"><span className="pulse"></span> 开放机会 · 北京</div>
            <h1>武渭星 <span className="accent">Wu</span></h1>
            <p className="hero-subtitle">实施运维工程师 · AI Agent 落地实践 · 3 年政企经验</p>
            <p className="hero-story">
              3 年政企 SaaS 平台实施交付与运维经验，驻场国网信产项目。负责阿里云生产环境高可用保障、
              微服务中间件运维与数据同步链路建设，同时把本地大模型、RAG 知识库和 Agent 工作流带入日常运维，
              让故障定位从 10 分钟压缩到 1 分钟以内。
            </p>
            <div className="hero-meta">
              <span>统招本科 · 计算机</span>
              <span>退伍军人</span>
              <span>AI 增强型运维</span>
              <span>即时到岗 · 接受出差</span>
            </div>
            <div className="hero-tags">
              <span className="tag blue">Docker / K8s</span>
              <span className="tag blue">阿里云</span>
              <span className="tag cyan">AI + LLM 部署</span>
              <span className="tag cyan">RAG 知识库</span>
              <span className="tag green">Dify 平台</span>
              <span className="tag">国产化信创</span>
              <span className="tag">政企交付</span>
              <span className="tag">CI/CD</span>
            </div>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">联系我</a>
              <a href="#projects" className="btn btn-outline">查看项目</a>
              <a href="https://github.com/hubeifatcat" target="_blank" rel="noreferrer" className="btn btn-outline">GitHub</a>
            </div>
            <div className="hero-stats">
              <div className="stat"><div className="value">3 年</div><div className="label">政企实施运维经验</div></div>
              <div className="stat"><div className="value">10min→1min</div><div className="label">故障定位提效</div></div>
              <div className="stat"><div className="value">+40%</div><div className="label">脚本编写效率</div></div>
              <div className="stat"><div className="value">99.9%</div><div className="label">生产环境可用率</div></div>
            </div>
          </div>

          <aside className="hero-card">
            <div className="monogram">武</div>
            <div className="name">武渭星</div>
            <div className="role">实施运维工程师 · AI Agent 落地</div>
            <div className="contact">
              <span>邮箱 <a href="mailto:18335357090@163.com">18335357090@163.com</a></span>
              <span>电话 <a href="tel:19054750791">190-5475-0791</a></span>
              <span>GitHub <a href="https://github.com/hubeifatcat" target="_blank" rel="noreferrer">hubeifatcat</a></span>
            </div>
          </aside>
        </div>
        <div className="container">
          <span className="scroll-cue"><span className="line"></span> 向下查看完整履历</span>
        </div>
      </header>

      <section id="advantages">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-kicker">Core Strengths</div>
            <h2>个人优势</h2>
            <p>3 年政企项目实施 + 运维 + 云迁移全流程经验，AI 辅助运维先行者</p>
          </div>
          <div className="adv-grid">
            <div className="adv-card reveal"><span className="num">01</span><h3>全栈运维能力</h3><p>阿里云生产环境运维（ECS/SLB/RDS/OSS），日均巡检 50+ 云资源实例，告警闭环率 100%；Docker 容器化与 K8s 编排，管理 30+ 微服务模块；Nacos、Redis、Nginx 中间件集群运维；麒麟 OS + 达梦/人大金仓国产化适配。</p></div>
            <div className="adv-card reveal"><span className="num">02</span><h3>云迁移与架构升级</h3><p>完成单体到微服务架构升级，覆盖 Nacos 服务发现、Sentinel 限流、SkyWalking 链路追踪；云下系统全量迁移至阿里云，基于 DataWorks 平滑迁移数据；Oracle 到 MySQL 迁移适配，含表结构、类型映射、存储过程重构。</p></div>
            <div className="adv-card reveal"><span className="num">03</span><h3>个人 AI 学习实践</h3><p>基于 Ollama + Qwen2.5 部署本地大模型，搭建 Dify 平台实现 Chatflow/Workflow 编排；构建 RAG 运维知识库（Obsidian 双链 + Embedding），故障定位 10min→1min；Claude Code 辅助生成脚本，代码效率提升 +40%。</p></div>
            <div className="adv-card reveal"><span className="num">04</span><h3>政企交付全流程</h3><p>统筹系统版本发布与变更管理，输出风险评估报告，生产变更零事故；制定蓝绿发布与灰度验证方案，完成 20+ 次版本迭代；独立交付部署方案、测试用例、操作手册；基于 RBAC 管控百人级权限体系。</p></div>
            <div className="adv-card reveal"><span className="num">05</span><h3>安全运维与自动化</h3><p>常态化漏洞扫描与安全加固：Redis 未授权、Nginx CVE 升级、TLS 加固；Shell 脚本实现批量巡检、日志采集、健康检查自动化；Jenkins + Git CI/CD 半自动化流水线；Zabbix + Grafana 监控告警体系。</p></div>
            <div className="adv-card reveal"><span className="num">06</span><h3>综合素质</h3><p>统招计算机本科（前 20%），计算机设计大赛省级三等奖；两年服役经历，纪律性强、抗压能力突出；团支书/学生会背景，具备跨部门沟通与用户培训经验；持续探索 AI + 运维落地。</p></div>
          </div>
        </div>
      </section>

      <section className="alt" id="experience">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-kicker">Experience</div>
            <h2>工作经历</h2>
            <p>3 年实施运维实战，覆盖政企、运营商、AI 基础设施</p>
          </div>
          <div className="timeline">
            <article className="job reveal">
              <div className="job-top"><h3>中电金信软件有限公司</h3><span className="period">2025.03 - 至今</span></div>
              <div className="company">实施运维专员 · 国网数字化审计平台项目（驻场国电通/北京信通）</div>
              <div className="tech-pills">
                <span className="tech-pill">阿里云 ECS/SLB/RDS/OSS</span><span className="tech-pill">Docker/K8s</span><span className="tech-pill">DataWorks</span><span className="tech-pill">Nacos</span><span className="tech-pill">Redis</span><span className="tech-pill">Nginx</span><span className="tech-pill">Shell/Python</span>
              </div>
              <ul>
                <li>负责阿里云生产环境系统高可用保障，配置 ECS/SLB/RDS 告警规则与动态阈值，实现异常自动告警与应急响应闭环。</li>
                <li>基于 DataWorks 构建离线数据同步管道，配置周期性调度与异常重试，保障多源业务数据稳定入仓。</li>
                <li>负责微服务中间件集群运维：Nacos 命名空间隔离与灰度配置、Redis 大 Key 与慢查询治理、Nginx 流量分发与 SSL 证书管理。</li>
                <li>统筹版本发布与变更管理，制定蓝绿发布与灰度验证方案，输出变更风险评估，生产变更零事故。</li>
                <li>执行常态化安全运维，修复 Redis 未授权访问、Nginx CVE、TLS 协议加固，推动安全基线整改闭环。</li>
                <li>基于 RBAC 权限模型完成用户权限审计与变更管理，输出日报/周报/月报及资产归档材料。</li>
              </ul>
            </article>

            <article className="job reveal">
              <div className="job-top"><h3>北京金轩锋科技发展有限公司</h3><span className="period">2024.07 - 2025.03</span></div>
              <div className="company">运维专员 · 视频监控监测平台</div>
              <div className="tech-pills">
                <span className="tech-pill">Linux</span><span className="tech-pill">Shell</span><span className="tech-pill">TCP/IP</span><span className="tech-pill">Zabbix</span><span className="tech-pill">Grafana</span>
              </div>
              <ul>
                <li>负责 7×24 小时监控平台稳定性，基于 GB/T 28181 维护视频流传输通道，保障日均千路视频流稳定接入。</li>
                <li>设计 Shell 链路健康巡检脚本，集成 Zabbix 自动告警，故障发现至响应 5 分钟内闭环。</li>
                <li>基于 Zabbix + Grafana 构建可视化监控看板，覆盖服务器资源与网络链路质量指标。</li>
                <li>使用 tcpdump 抓包分析视频流中断问题，定位丢包与时延故障点，协同运营商完成链路优化。</li>
              </ul>
            </article>

            <article className="job reveal">
              <div className="job-top"><h3>南京华苏科技有限公司</h3><span className="period">2023.10 - 2024.06</span></div>
              <div className="company">实施工程师 · 统一权限平台项目</div>
              <div className="tech-pills">
                <span className="tech-pill">阿里云 ECS/RDS</span><span className="tech-pill">Docker</span><span className="tech-pill">微服务</span><span className="tech-pill">Nacos</span><span className="tech-pill">Sentinel</span><span className="tech-pill">Oracle</span><span className="tech-pill">MySQL</span><span className="tech-pill">DataWorks</span><span className="tech-pill">Jenkins</span>
              </div>
              <ul>
                <li>负责阿里云生产环境微服务容器化部署与版本迭代，基于 Nacos 管理服务发现与配置热更新。</li>
                <li>配置 Sentinel 限流降级与熔断策略、网关路由规则及 SkyWalking 调用链追踪。</li>
                <li>主导云下系统全量迁移至阿里云，基于 DataWorks 完成历史数据全量迁移与增量实时同步。</li>
                <li>完成 Oracle 到 MySQL 迁移适配：数据类型映射、DDL 转换、存储过程重构、数据校验脚本。</li>
                <li>基于 Jenkins + Git 搭建持续集成流水线，实现构建、镜像打包、制品推送、远程部署半自动化。</li>
                <li>独立交付部署方案、测试用例、操作手册，基于禅道完成缺陷管理与需求闭环，组织试点省市培训。</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="projects">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-kicker">Projects</div>
            <h2>项目经历</h2>
            <p>从架构升级到 AI 辅助运维的完整实践链条</p>
          </div>
          <div className="project-grid">
            <article className="project reveal">
              <div className="badge-row"><span className="badge">个人学习 · AI Agent 落地</span><span className="period">2026.05 - 至今</span></div>
              <h3>智能运维知识库 Agent</h3>
              <p className="desc">基于 Python 后端生态独立研发的多智能体知识库问答系统，把故障排查经验沉淀为可交互的智能问答与自动化执行。</p>
              <ul>
                <li>多 Agent 协作架构：自研 Runtime Harness 调度器 + Blackboard 黑板机制，拆分为意图路由、风险判定、Prompt 组装、安全校验四个单元。</li>
                <li>Hybrid RAG 检索引擎：BM25 关键词 + Chroma 向量双路检索，加权融合 + 重排，Recall@4=100%，MRR=0.876，P95 检索 260ms。</li>
                <li>分层记忆：Redis 短期滑动窗口 + MySQL 长期快照，LLM Token 输入量下降 13.54%。</li>
                <li>本地大模型高可用：Ollama + Qwen2.5-7B，统一 ModelRouter 路由 + 三态熔断 + SSE 流式降级，9 组故障注入测试全部通过。</li>
                <li>MCP 受控工具调用：用户显式确认 + 二次确认，异步队列 + 权限校验 + 幂等 + 租约超时 + 人工兜底。</li>
              </ul>
              <div className="note">个人学习实践项目，完整验证“多智能体 + 混合检索 + 本地大模型 + 受控工具调用”企业级 Agent 链路。</div>
            </article>

            <article className="project reveal">
              <div className="badge-row"><span className="badge">个人实践 · 核心亮点</span><span className="period">2025.04 - 至今</span></div>
              <h3>私有化大模型辅助运维工具</h3>
              <p className="desc">在本地服务器基于 Docker 完成 Ollama 私有化部署，运行 Qwen2.5 系列模型，搭建 Dify 平台构建运维知识库与自动化工作流。</p>
              <ul>
                <li>Dify 平台搭建 Chatflow：“告警输入 → 日志匹配 → 根因分析 → 建议输出”端到端流程。</li>
                <li>RAG 运维知识库：Obsidian 双链笔记作为知识源，配合 Embedding 语义检索，高频故障定位从 10 分钟压缩到 1 分钟内。</li>
                <li>Claude Code 辅助生成 Shell/Python 巡检脚本与日志摘要脚本，人工编写时间缩短约 40%。</li>
                <li>结构化 Prompt 输出模板，自动生成巡检报告初稿，报告生成效率提升 50%+。</li>
              </ul>
              <div className="note">个人学习实践项目，已跑通“本地模型部署 → Dify 配置 → RAG 挂载 → 场景验证”全链路。</div>
            </article>

            <article className="project reveal">
              <div className="badge-row"><span className="badge work">实施工程师</span><span className="period">2023.10 - 2024.06</span></div>
              <h3>统一权限 3.0 架构升级</h3>
              <p className="desc">负责政企统一权限平台从单体到微服务架构的全面升级，覆盖阿里云生产部署、云迁移、数据适配全流程。</p>
              <ul>
                <li>完成单体到微服务架构升级的部署改造，阿里云生产环境容器化部署与日常运维。</li>
                <li>主导云下系统整体云上迁移，完成大批量业务数据迁移与一致性校验。</li>
                <li>独立完成 Oracle 到 MySQL 迁移适配、存储结构改造、自动化迁移脚本编写。</li>
                <li>编写测试用例、部署实施文档、用户操作手册，通过禅道闭环处理报错。</li>
              </ul>
            </article>

            <article className="project reveal">
              <div className="badge-row"><span className="badge work">全栈开发 · 毕设</span><span className="period">2023.06 - 2023.11</span></div>
              <h3>基于 GVA 架构的社区管理平台</h3>
              <p className="desc">Go + Vue 前后端分离架构，覆盖权限管理、数据管控、前后端联调全流程。</p>
              <ul>
                <li>Viper 配置管理、Zap 日志、Gorm 建表，简化 SQL 提升可维护性。</li>
                <li>JWT 登录凭证 + 拦截器鉴权，保障后台资源访问安全。</li>
                <li>事务机制实现权限安全更新，CORS 联调，ElementUI + Axios + Pinia 前端状态管理。</li>
              </ul>
              <div className="note">前后端分离全栈项目实践，为运维开发一体化能力打下基础。</div>
            </article>
          </div>
        </div>
      </section>

      <section className="alt" id="skills">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-kicker">Skills</div>
            <h2>专业技能</h2>
            <p>覆盖全栈运维 + AI 工程化的完整技能矩阵</p>
          </div>
          <div className="skill-grid">
            <div className="skill-card reveal">
              <h3>云平台 &amp; 容器编排</h3>
              <SkillRow name="阿里云 ECS/SLB/RDS/OSS" level="熟练" w="85" />
              <SkillRow name="Docker / Docker Compose" level="熟练" w="82" />
              <SkillRow name="Kubernetes" level="进阶中" w="55" />
              <SkillRow name="Jenkins / GitLab CI" level="掌握" w="60" />
              <SkillRow name="Nacos / Sentinel / SkyWalking" level="掌握" w="65" />
              <SkillRow name="Ansible" level="学习中" w="30" />
            </div>
            <div className="skill-card reveal">
              <h3>操作系统 &amp; 服务器</h3>
              <SkillRow name="CentOS / Rocky Linux" level="熟练" w="85" />
              <SkillRow name="麒麟 OS（国产）" level="熟练" w="80" />
              <SkillRow name="Shell 脚本编程" level="熟练" w="78" />
              <SkillRow name="Ubuntu / Debian" level="掌握" w="70" />
              <SkillRow name="systemd / 性能调优" level="进阶中" w="50" />
            </div>
            <div className="skill-card reveal">
              <h3>中间件 · 数据库 · 监控</h3>
              <SkillRow name="Nginx" level="熟练" w="80" />
              <SkillRow name="Redis" level="熟练" w="78" />
              <SkillRow name="MySQL" level="熟练" w="80" />
              <SkillRow name="Oracle" level="掌握" w="65" />
              <SkillRow name="ELK / Elastic Stack" level="掌握" w="60" />
              <SkillRow name="Prometheus + Grafana" level="进阶中" w="45" />
              <SkillRow name="Zabbix" level="掌握" w="65" />
              <SkillRow name="RocketMQ / Kafka" level="了解" w="30" />
            </div>
            <div className="skill-card reveal">
              <h3>编程 &amp; 开发</h3>
              <SkillRow name="Python" level="掌握" w="65" />
              <SkillRow name="Shell" level="熟练" w="80" />
              <SkillRow name="Go / Gin" level="基础" w="40" />
              <SkillRow name="SQL" level="掌握" w="65" />
            </div>
          </div>

          <div className="ai-band reveal">
            <div>
              <h3>AI 增强运维 · 成果量化</h3>
              <p>AI 辅助运维已在实际工作中落地，形成完整工具链闭环</p>
            </div>
            <div className="ai-metric"><div className="value">10x</div><div className="label">故障定位效率</div></div>
            <div className="ai-metric"><div className="value">+40%</div><div className="label">脚本编写效率</div></div>
            <div className="ai-metric"><div className="value">+50%</div><div className="label">报告生成效率</div></div>
            <div className="ai-metric"><div className="value">全链路</div><div className="label">部署到场景已跑通</div></div>
          </div>
        </div>
      </section>

      <section id="certificates">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-kicker">Certificates</div>
            <h2>资格证书</h2>
          </div>
          <div className="certs reveal">
            <span className="cert">网络安全管理员</span>
            <span className="cert">计算机三级</span>
            <span className="cert">退伍证（两年服役）</span>
            <span className="cert">普通话二级乙等</span>
            <span className="cert">驾驶证 C1</span>
            <span className="cert">职场英语一级</span>
          </div>
        </div>
      </section>

      <section className="alt" id="education">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-kicker">Education</div>
            <h2>教育背景</h2>
          </div>
          <div className="edu reveal">
            <h3>湖北工程学院新技术学院</h3>
            <div className="major">计算机科学与技术 · 本科</div>
            <div className="detail">2020 - 2024 · 专业排名前 20%</div>
            <div className="honors">
              <span className="honor">计算机设计大赛省级三等奖</span>
              <span className="honor">大创省级奖项</span>
              <span className="honor">优秀团员</span>
              <span className="honor">优秀班干</span>
              <span className="honor">优秀青年志愿者</span>
              <span className="honor">优秀团支书</span>
            </div>
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-kicker">Contact</div>
            <h2>联系我</h2>
            <p>开放北京实施运维岗位机会 · 期待与您沟通</p>
          </div>
          <div className="contact-grid reveal">
            <div className="contact-item"><div className="label">电话</div><div className="value"><a href="tel:19054750791">190-5475-0791</a></div></div>
            <div className="contact-item"><div className="label">邮箱</div><div className="value"><a href="mailto:18335357090@163.com">18335357090@163.com</a></div></div>
            <div className="contact-item"><div className="label">微信</div><div className="value">wwx-_-168</div></div>
            <div className="contact-item"><div className="label">GitHub</div><div className="value"><a href="https://github.com/hubeifatcat" target="_blank" rel="noreferrer">hubeifatcat</a></div></div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <span>2026 武渭星 · AI 增强型运维工程师 · 北京</span>
          <div className="footer-links">
            <a href="https://github.com/hubeifatcat/my-resume" target="_blank" rel="noreferrer">网站源码</a>
            <button className="link-btn" onClick={onChat}>AI 助手</button>
            <a href="javascript:window.print()">下载简历</a>
          </div>
        </div>
      </footer>

      <button className="fab ai" onClick={onChat} aria-label="AI 助手">AI</button>
      <button className="fab top" id="scrollTop" aria-label="回到顶部">↑</button>
    </div>
  );
}

function SkillRow({ name, level, w }) {
  return (
    <div className="skill-row">
      <div className="top"><span>{name}</span><span className="level">{level}</span></div>
      <div className="bar"><div className="fill" data-w={w}></div></div>
    </div>
  );
}
