import { useEffect, useRef, useState } from "react";
import {
  checkHealth,
  deleteConversation,
  getAgents,
  getConversation,
  getTools,
  listConversations,
  sendChat,
  streamChat,
} from "../api/demoApi.js";

export const exampleQuestions = [
  "武渭星做过哪些项目？",
  "分析一下 Nacos 连接超时",
  "生成一个磁盘巡检脚本",
  "什么是 RAG？",
];

const initialMessage = {
  role: "bot",
  text: "欢迎体验多智能体 Demo。你可以问简历/项目问题，也可以模拟故障分析或脚本生成。\n登录后还能对我说『添加任务：xxx』，我会把任务记入你的工作台。",
  suggestions: exampleQuestions,
};

export default function useChat(user) {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamSteps, setStreamSteps] = useState([]);
  const [streamActive, setStreamActive] = useState(null);
  const [status, setStatus] = useState("正在连接后端…");
  const [statusOnline, setStatusOnline] = useState(false);
  const [agentsMeta, setAgentsMeta] = useState([]);
  const [skills, setSkills] = useState([]);
  const [mcpTools, setMcpTools] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [selectedTools, setSelectedTools] = useState(new Set());
  const [trace, setTrace] = useState(null);
  const [blackboard, setBlackboard] = useState({});
  const [history, setHistory] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    async function boot() {
      try {
        const online = await checkHealth();
        setStatusOnline(online);
        setStatus(online ? "后端已连接 · DeepSeek + 多智能体在线" : "后端连接失败 · 演示可能不可用");
      } catch (e) {
        setStatus("后端连接失败 · 演示可能不可用");
      }
      try {
        setAgentsMeta(await getAgents());
      } catch (e) { /* ignore */ }
      try {
        const tools = await getTools();
        setSkills(tools.skills);
        setMcpTools(tools.mcpTools);
      } catch (e) { /* ignore */ }
    }
    boot();
  }, []);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
      setCurrentConvId(null);
    }
  }, [user]);

  async function loadHistory() {
    try {
      setHistory(await listConversations());
    } catch (e) { /* ignore */ }
  }

  async function openConversation(convId) {
    try {
      const data = await getConversation(convId);
      if (!data) return;
      const loaded = data.messages && data.messages.length ? data.messages : [{ role: "bot", text: "（空会话）" }];
      setMessages(loaded);
      setTrace(data.trace || null);
      setBlackboard({});
      setCurrentConvId(convId);
      setLeftOpen(false);
    } catch (e) { /* ignore */ }
  }

  async function removeConversation(convId) {
    try {
      await deleteConversation(convId);
      setHistory((prev) => prev.filter((c) => c.conversation_id !== convId));
      if (currentConvId === convId) {
        setCurrentConvId(null);
        setMessages([{ role: "bot", text: "会话已删除，开始新对话吧。", suggestions: exampleQuestions }]);
        setTrace(null);
      }
    } catch (e) { /* ignore */ }
  }

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
    setStreaming(true);
    setStreamSteps([]);
    setStreamActive("router");
    setTrace(null);
    setBlackboard({});
    setExpandedStep(null);

    const payload = {
      message: value,
      conversation_id: currentConvId,
      skills: Array.from(selectedSkills),
      tools: Array.from(selectedTools),
    };
    // 先放一个空 bot 气泡，chunk 逐块填充
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);
    let streamedText = "";
    let finished = false;

    function onEvent(evt) {
      if (evt.type === "stage") {
        setStreamSteps((prev) => [...prev, evt.stage]);
        setStreamActive(evt.stage.agent);
        if (evt.stage.status === "ok") {
          // 已完成的步骤不做高亮处理，由 TracePanel 展示
        }
      } else if (evt.type === "chunk") {
        streamedText += evt.text;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, text: streamedText };
          return next;
        });
      } else if (evt.type === "done") {
        finished = true;
        setTrace(evt.trace || null);
        setBlackboard(evt.blackboard || {});
        setCurrentConvId(evt.conversation_id || currentConvId);
        if (evt.agents && evt.agents.length) setStreamActive(evt.agents[evt.agents.length - 1]);
      }
    }

    try {
      await streamChat(payload, onEvent);
      if (user) loadHistory();
    } catch (e) {
      // SSE 不可用/失败时降级为普通接口
      try {
        const resp = await sendChat(payload);
        const data = await resp.json();
        if (resp.ok && data.answer) {
          setMessages((prev) => [...prev.slice(0, -1), { role: "bot", text: data.answer }]);
          setTrace(data.trace || null);
          setBlackboard(data.blackboard || {});
          setCurrentConvId(data.conversation_id);
          setStreamSteps(data.trace?.steps || []);
          if (user) loadHistory();
        } else {
          setMessages((prev) => [...prev.slice(0, -1), { role: "bot", text: data.detail || "请求失败，请稍后重试。" }]);
        }
      } catch (e2) {
        setMessages((prev) => [...prev.slice(0, -1), { role: "bot", text: "网络错误：无法连接后端服务。" }]);
      }
    } finally {
      setTyping(false);
      setStreaming(false);
      setStreamActive(null);
      if (finished) {
        setTimeout(() => {
          if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }, 100);
      }
    }
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return {
    messages,
    input,
    setInput,
    typing,
    streaming,
    streamSteps,
    streamActive,
    status,
    statusOnline,
    agentsMeta,
    skills,
    mcpTools,
    selectedSkills,
    selectedTools,
    trace,
    blackboard,
    history,
    currentConvId,
    expandedStep,
    setExpandedStep,
    leftOpen,
    setLeftOpen,
    traceOpen,
    setTraceOpen,
    chatRef,
    loadHistory,
    openConversation,
    removeConversation,
    toggleSkill,
    toggleTool,
    sendMessage,
    handleKeydown,
    selectedCount: selectedSkills.size + selectedTools.size,
  };
}
