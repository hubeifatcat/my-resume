import { agents } from "../../data/content.js";

export default function AgentsSection() {
  return (
    <section className="ma-section ma-reveal">
      <div className="container">
        <div className="ma-section-head">
          <span className="ma-num">02</span>
          <h2>Agent 能力</h2>
        </div>
        <div className="ma-agents">
          {agents.map((a) => (
            <article className="ma-agent ma-reveal" key={a.name}>
              <span className="ma-agent-icon">{a.icon}</span>
              <h3>{a.name}</h3>
              <p>{a.desc}</p>
              <small className="ma-agent-evidence">{a.evidence}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
