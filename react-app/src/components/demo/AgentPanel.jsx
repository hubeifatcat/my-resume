export default function AgentPanel(props) {
  const {
    agentsMeta,
    skills,
    mcpTools,
    selectedSkills,
    selectedTools,
    toggleSkill,
    toggleTool,
    history,
    user,
    loadHistory,
    openConversation,
    removeConversation,
    selectedCount,
    streamActive,
    streamSteps,
    typing,
  } = props;

  // 当前链路用到的 agent 集合（从实时步骤推导）
  const usedAgents = new Set((streamSteps || []).map((s) => s.agent));
  const isRunning = !!typing;

  function agentState(agentId) {
    if (isRunning && streamActive === agentId) return "running";
    if (usedAgents.has(agentId) && !(isRunning && streamActive === agentId)) return "done";
    return "idle";
  }

  const routeNode = { id: "router", name: "意图路由", desc: "识别问题类型，选择 Agent 执行链路" };

  return (
    <aside className={"ma-demo-left" + (props.leftOpen ? " open" : "")}>
      <div className="ma-side-block">
        <h3>Agent 链路</h3>
        <div className={"ma-agent-item" + (agentState("router") === "running" ? " running" : agentState("router") === "done" ? " done" : "")}>
          <span className="ma-agent-dot"></span>
          <div><strong>{routeNode.name}</strong><p>{routeNode.desc}</p></div>
        </div>
        {agentsMeta.length === 0 && <p className="ma-muted">等待后端返回 Agent 列表…</p>}
        {agentsMeta.map((a) => (
          <div className={"ma-agent-item" + (agentState(a.id) === "running" ? " running" : agentState(a.id) === "done" ? " done" : "")} key={a.id}>
            <span className="ma-agent-dot"></span>
            <div><strong>{a.name}</strong><p>{a.desc}</p></div>
          </div>
        ))}
      </div>

      <div className="ma-side-block">
        <h3>Skill / MCP <span className="ma-count">{selectedCount} 已选</span></h3>
        {skills.map((s) => (
          <label className="ma-tool-item" key={s.id}>
            <input type="checkbox" checked={selectedSkills.has(s.id)} onChange={() => toggleSkill(s.id)} />
            <div><strong>{s.name}</strong><p>{s.desc}</p></div>
          </label>
        ))}
        {mcpTools.map((t) => (
          <label className="ma-tool-item" key={t.id}>
            <input type="checkbox" checked={selectedTools.has(t.id)} onChange={() => toggleTool(t.id)} />
            <div><strong>{t.name}</strong><p>{t.desc}</p></div>
          </label>
        ))}
      </div>

      {user && (
        <div className="ma-side-block">
          <h3>我的历史 <button className="ma-btn-ghost ma-btn-mini" onClick={loadHistory}>刷新</button></h3>
          {history.length === 0 && <p className="ma-muted">暂无会话历史</p>}
          {history.map((c) => (
            <div className="ma-history-item" key={c.conversation_id}>
              <button onClick={() => openConversation(c.conversation_id)} title={c.title}>
                <strong>{c.title}</strong>
                <span>{c.message_count} 条 · {new Date(c.updated_at * 1000).toLocaleString()}</span>
              </button>
              <button className="ma-delete" onClick={() => removeConversation(c.conversation_id)} aria-label="删除">×</button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
