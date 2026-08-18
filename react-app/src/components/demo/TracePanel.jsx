export default function TracePanel(props) {
  const { trace, blackboard, expandedStep, setExpandedStep, traceOpen, streamSteps } = props;

  // 流式期间实时展示步骤；结束后用完整 trace
  const steps = (streamSteps && streamSteps.length ? streamSteps : (trace && trace.steps)) || null;

  return (
    <aside className={"ma-demo-trace" + (traceOpen ? " open" : "")}>
      <div className="ma-side-block">
        <h3>轨迹时间线</h3>
        {!steps && <p className="ma-muted">发送问题后，这里会展示每一步 Agent 的执行轨迹。</p>}
        {steps && (
          <div className="ma-trace-list">
            {steps.map((s) => (
              <div className={"ma-trace-step" + (s.status === "ok" ? "" : " error")} key={s.seq}>
                <button onClick={() => setExpandedStep(expandedStep === s.seq ? null : s.seq)}>
                  <span className="ma-step-seq">{s.seq}</span>
                  <span className="ma-step-main">
                    <strong>{s.agent} · {s.action}</strong>
                    <small>{s.output} · {s.latency_ms}ms</small>
                  </span>
                </button>
                {expandedStep === s.seq && (
                  <div className="ma-step-detail">
                    <p><b>输入：</b>{s.input}</p>
                    <p><b>输出：</b>{s.output}</p>
                    <p><b>状态：</b>{s.status}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ma-side-block">
        <h3>黑板视图</h3>
        {Object.keys(blackboard).length === 0 && <p className="ma-muted">Agent 写入的中间结果会显示在这里。</p>}
        {Object.entries(blackboard).map(([k, v]) => (
          <div className="ma-blackboard-item" key={k}>
            <strong>{k}</strong>
            <p>{typeof v === "string" ? v : JSON.stringify(v)}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
