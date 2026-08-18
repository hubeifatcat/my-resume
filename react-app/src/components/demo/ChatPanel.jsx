import { renderMessage } from "../../lib/text.jsx";

export default function ChatPanel(props) {
  const { messages, typing, streaming, input, setInput, chatRef, sendMessage, handleKeydown } = props;

  return (
    <main className="ma-demo-chat" ref={chatRef}>
      <div className="ma-chat">
        {messages.map((m, i) => (
          <div className={"ma-msg " + m.role} key={i}>
            <div className="ma-avatar">{m.role === "bot" ? "AI" : "我"}</div>
            <div className="ma-bubble">
              <div className={"ma-text" + (streaming && i === messages.length - 1 && m.role === "bot" ? " streaming" : "")}>{renderMessage(m.text)}</div>
              {m.suggestions && (
                <div className="ma-suggestions">
                  {m.suggestions.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && !streaming && (
          <div className="ma-msg bot">
            <div className="ma-avatar">AI</div>
            <div className="ma-bubble ma-typing"><span></span><span></span><span></span></div>
          </div>
        )}
        {!typing && messages.length === 1 && (
          <p className="ma-demo-hint">
            可先点示例问题，也可以选左侧 Skill / MCP 工具后自由提问。
          </p>
        )}
      </div>

      <div className="ma-input-area">
        <textarea
          rows="1"
          placeholder="输入问题，例如：分析一下 Nacos 连接超时"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeydown}
        />
        <button className="ma-send" disabled={!input.trim() || typing} onClick={() => sendMessage()}>发送</button>
      </div>
    </main>
  );
}
