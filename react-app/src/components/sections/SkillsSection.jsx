import { skillGroups } from "../../data/content.js";

export default function SkillsSection() {
  return (
    <section className="p-section" id="skills">
      <div className="container">
        <div className="p-section-head">
          <span className="p-num">06</span>
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
  );
}
