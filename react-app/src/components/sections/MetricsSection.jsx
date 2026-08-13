import { metrics } from "../../data/content.js";

export default function MetricsSection() {
  return (
    <section className="ma-metrics ma-reveal">
      <div className="container">
        {metrics.map((m) => (
          <div className="ma-metric" key={m.label}>
            <strong>{m.value}</strong>
            <span>{m.label}</span>
            <small>{m.note}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
