export default function AboutSection() {
  return (
    <section className="p-section" id="about">
      <div className="container">
        <div className="p-section-head">
          <span className="p-num">04</span>
          <h2>关于我</h2>
        </div>
        <div className="p-about glass">
          <p>
            运维是我的底盘：阿里云、Docker/K8s、Nacos/Redis/Nginx、DataWorks、
            数据库迁移，这些我都亲手做过，也知道生产环境里“能上线”和“能扛住”的区别。
          </p>
          <p>
            研发是我的方向：我在用 Python/FastAPI 写后端，用 React 做前端，用 RAG、Agent、MCP
            搭 AI 应用，并且坚持把每一段代码部署到真实环境里验证。目标是从“AI 增强型运维”
            成长为“能独立交付 AI 应用的全栈研发工程师”。
          </p>
        </div>
      </div>
    </section>
  );
}
