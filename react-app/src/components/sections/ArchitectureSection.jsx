import { architectureSteps } from "../../data/content.js";

export default function ArchitectureSection() {
  return (
    <section className="ma-section ma-alt ma-reveal">
      <div className="container">
        <div className="ma-section-head">
          <span className="ma-num">01</span>
          <h2>运行架构</h2>
        </div>
        <div className="ma-arch">
          {architectureSteps.map((step, index) => (
            <span key={step} className="ma-arch-group">
              <span className={"ma-node" + (index === 1 ? " strong" : "")}>{step}</span>
              {index < architectureSteps.length - 1 && <span className="ma-arrow">→</span>}
            </span>
          ))}
        </div>
        <p className="ma-arch-note">
          用户消息先做意图路由，再由知识检索、日志分析、脚本生成等 Agent 协作，
          中间结果写入黑板，最后由汇总 Agent 统一生成回答；全程轨迹可回放。
        </p>
      </div>
    </section>
  );
}
