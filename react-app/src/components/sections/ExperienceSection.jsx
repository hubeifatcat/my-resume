import { jobs } from "../../data/content.js";

export default function ExperienceSection() {
  return (
    <section className="p-section p-alt" id="work">
      <div className="container">
        <div className="p-section-head">
          <span className="p-num">05</span>
          <h2>工作经历</h2>
        </div>
        <div className="p-jobs">
          {jobs.map((job) => (
            <div className="p-job glass" key={job.company}>
              <div className="p-job-top">
                <h3>{job.company}</h3>
                <span>{job.period}</span>
              </div>
              <p>{job.summary}</p>
              <ul>
                {job.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
