import Navbar from "../components/Navbar.jsx";
import AgentPanel from "../components/demo/AgentPanel.jsx";
import ChatPanel from "../components/demo/ChatPanel.jsx";
import TracePanel from "../components/demo/TracePanel.jsx";
import useChat from "../hooks/useChat.js";
import { useAuth } from "../hooks/useAuth.jsx";

export default function DemoPage() {
  const { user } = useAuth();
  const chat = useChat(user);

  return (
    <div className="ma-demo-page">
      <Navbar />
      <header className="ma-demo-header">
        <div>
          <h1>多智能体 <span>Demo</span></h1>
          <p>意图路由 → Agent 协作 → 黑板 → DeepSeek 汇总 → 轨迹回放</p>
        </div>
        <div className="ma-demo-header-right">
          <div className={"ma-status" + (chat.statusOnline ? " online" : "")}>
            <span className="dot"></span>
            <span>{chat.status}</span>
          </div>
          <button className="ma-btn-ghost" onClick={() => chat.setLeftOpen(!chat.leftOpen)}>Agent / 历史</button>
          <button className="ma-btn-ghost" onClick={() => chat.setTraceOpen(!chat.traceOpen)}>轨迹</button>
        </div>
      </header>

      <div className="ma-demo-body">
        <AgentPanel
          agentsMeta={chat.agentsMeta}
          skills={chat.skills}
          mcpTools={chat.mcpTools}
          selectedSkills={chat.selectedSkills}
          selectedTools={chat.selectedTools}
          toggleSkill={chat.toggleSkill}
          toggleTool={chat.toggleTool}
          history={chat.history}
          user={user}
          loadHistory={chat.loadHistory}
          openConversation={chat.openConversation}
          removeConversation={chat.removeConversation}
          selectedCount={chat.selectedCount}
          leftOpen={chat.leftOpen}
          streamActive={chat.streamActive}
          streamSteps={chat.streamSteps}
          typing={chat.typing}
        />
        <ChatPanel
          messages={chat.messages}
          typing={chat.typing}
          streaming={chat.streaming}
          input={chat.input}
          setInput={chat.setInput}
          chatRef={chat.chatRef}
          sendMessage={chat.sendMessage}
          handleKeydown={chat.handleKeydown}
          quota={chat.quota}
        />
        <TracePanel
          trace={chat.trace}
          blackboard={chat.blackboard}
          expandedStep={chat.expandedStep}
          setExpandedStep={chat.setExpandedStep}
          traceOpen={chat.traceOpen}
          streamSteps={chat.streamSteps}
        />
      </div>
    </div>
  );
}
