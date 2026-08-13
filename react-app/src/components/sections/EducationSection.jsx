import { education } from "../../data/content.js";

export default function EducationSection() {
  return (
    <section className="p-section p-alt" id="education">
      <div className="container">
        <div className="p-section-head">
          <span className="p-num">07</span>
          <h2>教育背景</h2>
        </div>
        <div className="edu glass">
          <h3>{education.school}</h3>
          <p className="major">{education.major}</p>
          <p className="detail">{education.period} · {education.extra}</p>
          <div className="honors">
            {education.honors.map((h) => <span className="honor" key={h}>{h}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
