import { projects } from "../../data/content.js";
import demoShot from "../../assets/screenshots/demo.png";

export default function ProjectsSection() {
  return (
    <section className="p-section p-alt" id="projects">
      <div className="container">
        <div className="p-section-head">
          <span className="p-num">03</span>
          <h2>项目与成果</h2>
          <p>只放真实做过、能讲清楚、有验证入口的内容。</p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project glass" key={project.name}>
              <div className="badge-row">
                <span className={"badge " + project.tagType}>{project.tag}</span>
                <span className="period">{project.year}</span>
              </div>
              <h3>{project.name}</h3>
              <p className="desc">{project.desc}</p>
              <ul>
                {project.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="project-actions">
                {project.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel={link.url.startsWith("http") ? "noreferrer" : undefined}
                    className="btn btn-outline btn-sm"
                  >
                    {link.label}
                  </a>
                ))}
                {project.shot && (
                  <img className="project-shot" src={project.shot === "demo" ? demoShot : project.shot} alt={`${project.name} 截图`} loading="lazy" />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
