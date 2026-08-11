import { useEffect, useRef, useState } from "react";

// 后端接入点：真实 API 地址（Caddy 反代，已剥离 /wuxing 前缀）
const BACKEND_URL = "https://api.liumingqing.com/wuxing/api/chat";
// 健康检查走 GET /api/health，/api/chat 只接受 POST
const BACKEND_HEALTH_URL = BACKEND_URL.replace(/\/api\/chat$/, "/api/health");

const skills = [
  { id: "fault-diagnosis", name: "故障排查", desc: "按日志链路定位故障根因" },
  { id: "log-analysis", name: "日志分析", desc: "日志摘要、异常提取" },
  { id: "inspection-script", name: "巡检脚本", desc: "生成 Shell/Python 巡检脚本" },
  { id: "rag-search", name: "知识库检索", desc: "RAG 检索运维知识库" }
];

const mcpTools = [
  { id: "server-status", name: "服务器状态", desc: "CPU / 内存 / 磁盘 / 进程" },
  { id: "log-query", name: "日志查询", desc: "按关键字查询最近日志" },
  { id: "ticket-create", name: "工单创建", desc: "创建变更 / 故障工单" }
];

const knowledgeBase = {
  "工作经历": "武渭星有 3 年政企实施运维经验：\n\n1. 中电金信（2025.03-至今）实施运维专员，负责国网数字化审计平台阿里云运维，涉及 Docker/K8s、Nacos、Redis、Nginx 等中间件，保障 99.9% 可用率。\n2. 北京金轩锋（2024.07-2025.03）运维专员，7×24 视频监控平台，Zabbix+Grafana 监控看板。\n3. 南京华苏科技（2023.10-2024.06）实施工程师，微服务部署升级、Oracle 到 MySQL 迁移、Jenkins CI/CD。",
  "技术": "云平台：阿里云、Docker、Kubernetes\n中间件：Nginx、Redis、Nacos、Sentinel\n数据库：MySQL、Oracle\n监控：Zabbix、Grafana、ELK、Prometheus\nCI/CD：Jenkins、Git\n编程：Shell（熟练）、Python（掌握）、Go（基础）\nAI：Ollama 私有化部署、Dify、RAG 知识库、Claude Code",
  "项目": "1. 智能运维知识库 Agent：多智能体 + Hybrid RAG + 本地大模型 + MCP 受控工具调用。\n2. 私有化大模型辅助运维工具：Ollama + Dify + RAG，故障定位 10min→1min。\n3. 统一权限 3.0 架构升级：单体转微服务 + 阿里云迁移 + Oracle→MySQL。\n4. 基于 GVA 架构的社区管理平台（毕设）：Go + Vue 前后端分离。",
  "联系": "电话：190-5475-0791\n邮箱：18335357090@163.com\n微信：wwx-_-168\nGitHub：github.com/hubeifatcat\n简历网站：hubeifatcat.github.io/my-resume",
  "你好": "你好！我是武渭星的 AI 助手，可以问他的工作经历、技术能力、项目经验等问题。",
  "你是谁": "我是武渭星的 AI 运维助手，当前为前端模拟回复模式，后端正在接入本地大模型。"
};

const fallbackResponses = [
  "好问题，不过这个超出了我的知识范围，建议直接联系武渭星本人详聊。",
  "这个问题我需要想想，你可以通过邮箱 18335357090@163.com 联系他。",
  "这个细节我不太确定，直接和他本人沟通更准确。",
  "这块我还没学会，他的技术栈还在不断扩展中。"
];

function findAnswer(input) {
  const lower = input.toLowerCase();
  for (const [key, answer] of Object.entries(knowledgeBase)) {
    if (input.includes(key) || lower.includes(key)) return answer;
  }
  if (lower.includes("经历") || lower.includes("经验") || lower.includes("工作")) return knowledgeBase["工作经历"];
  if (lower.includes("技术") || lower.includes("技能") || lower.includes("擅长") || lower.includes("栈")) return knowledgeBase["技术"];
  if (lower.includes("项目") || lower.includes("做过")) return knowledgeBase["项目"];
  if (lower.includes("联系") || lower.includes("电话") || lower.includes("邮箱") || lower.includes("微信")) return knowledgeBase["联系"];
  if (lower.includes("你好") || lower.includes("hello") || lower.includes("hi")) return knowledgeBase["你好"];
  if (lower.includes("你是谁") || lower.includes("什么") || lower.includes("干嘛")) return knowledgeBase["你是谁"];
  if (lower.includes("ai") || lower.includes("模型") || lower.includes("大模型") || lower.includes("ollama") || lower.includes("dify")) {
    return "武渭星在 AI 辅助运维方面有完整实践：Docker 部署 Ollama 运行 Qwen2.5，搭建 Dify 平台编排 Chatflow/Workflow，构建基于 Obsidian 的 RAG 知识库，实现 AI 辅助故障排查与文档生成。";
  }
  return null;
}

function getSmartResponse(input) {
  const direct = findAnswer(input);
  return direct || fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// 把回答里的邮箱、网址、手机号渲染成可点击链接
function renderText(text) {
  const re = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|1\d{10}|0\d{2,3}-?\d{7,8})/g;
  return text.split(re).map((part, i) => {
    if (!part) return null;
    if (/^https?:\/\//i.test(part)) {
      return <a key={i} href={part} target="_blank" rel="noreferrer">{part}</a>;
    }
    if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(part)) {
      return <a key={i} href={"mailto:" + part}>{part}</a>;
    }
    if (/^1\d{10}$/.test(part) || /^0\d{2,3}-?\d{7,8}$/.test(part)) {
      return <a key={i} href={"tel:" + part.replace(/-/g, "")}>{part}</a>;
    }
    return part;
  });
}

export default function Chat({ onHome }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "你好，我是武渭星的 AI 运维助手，可以问他关于工作经历、技术栈、项目和联系方式的问题。",
      suggestions: ["他有什么工作经历？", "他擅长什么技术？", "他做过什么项目？", "怎么联系他？"]
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [selectedTools, setSelectedTools] = useState(new Set());
  const [typing, setTyping] = useState(false);
  const [status, setStatus] = useState("后端部署中 · 当前为模拟回复");
  const [statusOnline, setStatusOnline] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    async function checkBackend() {
      if (BACKEND_URL) {
        try {
          const resp = await fetch(BACKEND_HEALTH_URL, { method: "GET", signal: AbortSignal.timeout(3000) });
          if (resp.ok) {
            setStatus("后端服务已连接 · 真实 AI 回复中");
            setStatusOnline(true);
            return;
          }
        } catch (e) {
          // ignore
        }
      }
      try {
        const resp = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(3000) });
        if (resp.ok) {
          setStatus("本地 Ollama 已连接 · 真实 AI 回复中");
          setStatusOnline(true);
        }
      } catch (e) {
        // 本地无模型，保持模拟模式
      }
    }
    checkBackend();
  }, []);

  function toggleSkill(id) {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTool(id) {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function sendMessage(text) {
    const value = (text ?? input).trim();
    if (!value || typing) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: value }]);
    setTyping(true);

    if (BACKEND_URL) {
      try {
        const resp = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: value,
            skills: Array.from(selectedSkills),
            tools: Array.from(selectedTools)
          }),
          signal: AbortSignal.timeout(20000)
        });
        if (resp.ok) {
          const data = await resp.json();
          setTyping(false);
          setMessages((prev) => [...prev, { role: "bot", text: data.answer || "暂无回复" }]);
          return;
        }
      } catch (e) {
        // 后端不可用时回退到模拟回复
      }
    }

    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));
    setTyping(false);
    setMessages((prev) => [...prev, { role: "bot", text: getSmartResponse(value) }]);
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const selectedCount = selectedSkills.size + selectedTools.size;

  return (
    <div className="chat-page">
      <nav className="site-nav">
        <div className="container">
          <a href="#/" className="brand">
            <span className="mark">武</span>
            <span>武渭星</span>
          </a>
          <ul className="nav-links">
            <li><a href="#/">简历</a></li>
            <li><a href="#/chat" className="active">AI 助手</a></li>
          </ul>
        </div>
      </nav>

      <header className="chat-header">
        <h1>AI <span>运维助手</span></h1>
        <p>基于本地大模型（Ollama + Qwen）的智能问答 · 后端部署中</p>
        <div className={"status-bar" + (statusOnline ? " online" : "")}>
          <span className="dot"></span>
          <span>{status}</span>
        </div>
        <div className="side-toggle-wrap">
          <button className="side-toggle" onClick={() => setPanelOpen(!panelOpen)}>工具与 Skill</button>
        </div>
      </header>

      <div className="workspace">
        <aside className={"side-panel" + (panelOpen ? " open" : "")}>
          <div className="side-head">
            <h2>SKILL / MCP 工具</h2>
            <span className="count">{selectedCount} 已选</span>
          </div>
          <div className="side-group">
            <h3>Skill</h3>
            {skills.map((s) => (
              <label className="side-item" key={s.id}>
                <input type="checkbox" checked={selectedSkills.has(s.id)} onChange={() => toggleSkill(s.id)} />
                <div>
                  <div className="name">{s.name}</div>
                  <div className="desc">{s.desc}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="side-group">
            <h3>MCP 工具</h3>
            {mcpTools.map((t) => (
              <label className="side-item" key={t.id}>
                <input type="checkbox" checked={selectedTools.has(t.id)} onChange={() => toggleTool(t.id)} />
                <div>
                  <div className="name">{t.name}</div>
                  <div className="desc">{t.desc}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="side-note">当前为前端占位列表，后端接入后自动加载真实工具</div>
        </aside>

        <main className="chat-wrap" ref={chatRef}>
          <div className="chat">
            {messages.map((m, i) => (
              <div className={"msg " + m.role} key={i}>
                <div className="avatar">{m.role === "bot" ? "AI" : "我"}</div>
                <div className="bubble">
                  <div className="text">{renderText(m.text)}</div>
                  {m.suggestions && (
                    <div className="suggestions">
                      {m.suggestions.map((s) => (
                        <button key={s} onClick={() => sendMessage(s)}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="msg bot typing">
                <div className="avatar">AI</div>
                <div className="bubble">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="input-area">
        <div className="input-box">
          <textarea
            rows="1"
            placeholder="输入你的问题…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeydown}
          />
          <button className="send-btn" disabled={!input.trim() || typing} onClick={() => sendMessage()}>→</button>
        </div>
        <div className="disclaimer">AI 回复仅供参考，后端部署完成后将接入本地大模型</div>
      </div>
    </div>
  );
}
