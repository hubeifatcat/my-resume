import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import useChat from "../hooks/useChat.js";
import { useAuth } from "../hooks/useAuth.jsx";

const navItems = [
  { id: "home", label: "首页" },
  { id: "tasks", label: "任务", badge: 2 },
  { id: "schedule", label: "日程" },
  { id: "files", label: "文件" },
  { id: "logs", label: "日志" },
  { id: "notice", label: "公告" },
  { id: "profile", label: "我的" },
];

const stats = [
  { label: "今日待办", value: "2", unit: "个", note: "待处理任务待完成", tone: "blue" },
  { label: "进行中", value: "2", unit: "个", note: "正在推进的任务", tone: "cyan" },
  { label: "今日会议", value: "3", unit: "场", note: "当天日程安排", tone: "amber" },
  { label: "工作完成率", value: "33", unit: "%", note: "整体任务完成情况", tone: "green" },
];

const quickEntries = [
  { label: "日程管理", desc: "查看今日安排与会议" },
  { label: "我的任务", desc: "管理工作任务与进度" },
  { label: "文件中心", desc: "管理办公文件资料" },
  { label: "工作日志", desc: "记录每日工作情况" },
  { label: "公司公告", desc: "查看企业最新通知" },
  { label: "个人中心", desc: "管理个人信息资料" },
];

const weekTasks = [
  { day: "周一", count: 4 },
  { day: "周二", count: 6 },
  { day: "周三", count: 3 },
  { day: "周四", count: 5 },
  { day: "周五", count: 2 },
  { day: "周六", count: 1 },
];

const assets = [
  { name: "项目知识库", meta: "RAG 检索 · 12 篇" },
  { name: "运维案例", meta: "故障排查 · 36 条" },
  { name: "文件资产", meta: "部署手册 · 8 份" },
];

const roles = ["项目经理助手", "运维分析助手", "文档写作助手", "脚本生成助手"];

const moduleContent = {
  tasks: {
    title: "任务",
    desc: "当前待办 2 个，进行中 2 个。可点击下方 AI 助手快速生成任务拆解与进度建议。",
    items: ["梳理今日待办清单", "跟进项目交付验收", "生成周报草稿"],
  },
  schedule: {
    title: "日程",
    desc: "今日 3 场会议，可在 AI 对话中请求生成会议纪要与待办。",
    items: ["10:00 项目周会", "14:00 需求评审", "16:30 交付复盘"],
  },
  files: {
    title: "文件",
    desc: "文件中心已接入知识库资产，AI 可基于文件内容回答与总结。",
    items: ["部署方案.pdf", "用户操作手册.docx", "故障案例库.md"],
  },
  logs: {
    title: "日志",
    desc: "记录每日工作情况，支持 AI 总结与报告生成。",
    items: ["今日完成部署验收", "处理客户反馈 3 条", "更新巡检记录"],
  },
  notice: {
    title: "公告",
    desc: "查看企业最新通知，AI 可提取公告要点。",
    items: ["8 月安全演练安排", "新版本发布说明", "培训计划通知"],
  },
  profile: {
    title: "我的",
    desc: "个人资料与偏好设置。",
    items: ["账号信息", "系统设置", "偏好与主题"],
  },
};

export default function WorkbenchPage() {
  const { user, setAuthOpen, logout } = useAuth();
  const chat = useChat(user);
  const [activeNav, setActiveNav] = useState("home");
  const [activeRole, setActiveRole] = useState("项目经理助手");
  const [temperature, setTemperature] = useState(0.4);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch(API_BASE_URL + "announcements")
      .then((resp) => resp.json())
      .then((data) => setAnnouncements(data.announcements || []))
      .catch(() => setAnnouncements([]));
  }, []);

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  function runPrompt(prompt) {
    chat.sendMessage(prompt);
  }

  function renderChat() {
    return (
      <section className="wb-chat">
        <div className="wb-chat-head">
          <div>
            <h3>AI 工作台助手</h3>
            <p>任务拆解 · 文档总结 · 运维分析 · 脚本生成</p>
          </div>
          <div className="wb-chat-status">
            <span className="dot"></span>
            <span>{chat.statusOnline ? "DeepSeek 在线" : "演示模式"}</span>
          </div>
        </div>
        <div className="wb-quick-row">
          {["智能总结", "文档解析", "生成巡检脚本", "分析今日日志"].map((cmd) => (
            <button key={cmd} onClick={() => runPrompt(cmd === "智能总结" ? "帮我总结今天的重点工作" : cmd === "文档解析" ? "解析部署方案并给出要点" : cmd === "生成巡检脚本" ? "生成一个磁盘巡检脚本" : "分析今天的工作日志并给出建议")}>
              {cmd}
            </button>
          ))}
        </div>
        <div className="wb-msg-list" ref={chat.chatRef}>
          {chat.messages.map((m, i) => (
            <div className={"wb-msg " + m.role} key={i}>
              <div className="wb-avatar">{m.role === "bot" ? "AI" : "我"}</div>
              <div className="wb-bubble">
                <p>{m.text}</p>
                {m.suggestions && (
                  <div className="wb-suggestions">
                    {m.suggestions.map((s) => (
                      <button key={s} onClick={() => runPrompt(s)}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {chat.typing && (
            <div className="wb-msg bot">
              <div className="wb-avatar">AI</div>
              <div className="wb-bubble wb-typing"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>
        <div className="wb-input-row">
          <textarea
            rows="1"
            placeholder="输入任务、问题或指令，例如：帮我拆解今天的工作"
            value={chat.input}
            onChange={(e) => chat.setInput(e.target.value)}
            onKeyDown={chat.handleKeydown}
          />
          <button className="wb-send" disabled={!chat.input.trim() || chat.typing} onClick={() => chat.sendMessage()}>发送</button>
        </div>
      </section>
    );
  }

  function renderAiSide() {
    return (
      <aside className="wb-ai-side">
        <div className="wb-side-block">
          <h3>AI 角色</h3>
          <div className="wb-role-list">
            {roles.map((role) => (
              <button
                key={role}
                className={activeRole === role ? "active" : ""}
                onClick={() => setActiveRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
          <label className="wb-slider">
            <span>温度 / 创造性 <b>{temperature.toFixed(1)}</b></span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="wb-side-block">
          <h3>对话历史</h3>
          {chat.history.length ? (
            chat.history.slice(0, 5).map((c) => (
              <button className="wb-history-item" key={c.conversation_id} onClick={() => chat.openConversation(c.conversation_id)}>
                <strong>{c.title}</strong>
                <span>{c.message_count} 条</span>
              </button>
            ))
          ) : (
            <p className="wb-muted">暂无历史，登录后可保存会话。</p>
          )}
        </div>
        <div className="wb-side-block">
          <h3>知识库 / 资产</h3>
          {assets.map((asset) => (
            <div className="wb-asset" key={asset.name}>
              <strong>{asset.name}</strong>
              <span>{asset.meta}</span>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <div className="wb-shell">
      <aside className="wb-side">
        <div className="wb-brand">
          <span className="wb-brand-mark">智</span>
          <div>
            <strong>智办</strong>
            <small>企业办公工作台</small>
          </div>
        </div>
        <nav className="wb-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeNav === item.id ? "active" : ""}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="wb-nav-ico">{item.label.slice(0, 1)}</span>
              <span>{item.label}</span>
              {item.badge ? <em>{item.badge}</em> : null}
            </button>
          ))}
        </nav>
        <div className="wb-side-foot">
          <button className={activeNav === "settings" ? "active" : ""} onClick={() => setActiveNav("settings")}>
            <span className="wb-nav-ico">设</span>
            <span>系统设置</span>
          </button>
          {user?.role === "admin" && (
            <NavLink to="/admin" className="wb-back">平台管理</NavLink>
          )}
          <NavLink to="/" className="wb-back">返回站点</NavLink>
        </div>
      </aside>

      <main className="wb-main">
        <header className="wb-topbar">
          <div>
            <h1>首页 · 工作台总览</h1>
            <p>
              {user
                ? `欢迎回来，${user.username}，今天也要高效推进。`
                : "欢迎使用智办工作台，登录后可保存会话与轨迹历史。"}
            </p>
          </div>
          <div className="wb-user">
            <div className="wb-user-avatar">{user ? user.username.slice(0, 1) : "访"}</div>
            <div>
              <strong>{user ? user.username : "访客"}</strong>
              <span>{today}</span>
            </div>
            {user ? (
              <button className="wb-login-btn" onClick={logout}>退出</button>
            ) : (
              <button className="wb-login-btn" onClick={() => setAuthOpen(true)}>登录 / 注册</button>
            )}
          </div>
        </header>

        {activeNav === "home" ? (
          <div className="wb-content">
            <div className="wb-stats">
              {stats.map((s) => (
                <div className={"wb-stat " + s.tone} key={s.label}>
                  <span className="wb-stat-ico">{s.label.slice(0, 1)}</span>
                  <div>
                    <strong>{s.value}<small>{s.unit}</small></strong>
                    <span>{s.label}</span>
                    <p>{s.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="wb-quick">
              {quickEntries.map((q) => (
                <button key={q.label} onClick={() => setActiveNav({ "日程管理": "schedule", "我的任务": "tasks", "文件中心": "files", "工作日志": "logs", "公司公告": "notice", "个人中心": "profile" }[q.label])}>
                  <span className="wb-quick-ico">{q.label.slice(0, 1)}</span>
                  <strong>{q.label}</strong>
                  <span>{q.desc}</span>
                </button>
              ))}
            </div>

            <div className="wb-charts">
              <div className="wb-chart-card">
                <h3>本周完成任务</h3>
                <div className="wb-bars">
                  {weekTasks.map((t) => (
                    <div className="wb-bar" key={t.day}>
                      <div style={{ height: `${t.count * 14}%` }}></div>
                      <span>{t.day}</span>
                      <em>{t.count}</em>
                    </div>
                  ))}
                </div>
              </div>
              <div className="wb-chart-card">
                <h3>工作完成率</h3>
                <div className="wb-progress">
                  <div className="wb-ring" style={{ "--p": "33%" }}>
                    <span>33%</span>
                  </div>
                  <div>
                    <strong>本周目标 12 项</strong>
                    <span>已完成 4 项，剩余 8 项</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="wb-ai-grid">
              {renderChat()}
              {renderAiSide()}
            </div>
          </div>
        ) : (
          <div className="wb-module">
            <h2>{activeNav === "settings" ? "系统设置" : moduleContent[activeNav].title}</h2>
            <p>{activeNav === "settings" ? "主题与偏好设置。" : moduleContent[activeNav].desc}</p>
            <div className="wb-module-list">
              {(activeNav === "settings"
                ? ["主题：亮色 / 暗色", "通知偏好", "快捷键"]
                : activeNav === "notice" && announcements.length
                  ? announcements
                  : moduleContent[activeNav].items
              ).map((item) => (
                <div className="wb-module-item" key={item.id ?? item}>
                  <span className="wb-quick-ico">{(item.title || item).slice(0, 1)}</span>
                  <div>
                    <strong>{item.title || item}</strong>
                    {item.content && <span>{item.content}</span>}
                  </div>
                </div>
              ))}
            </div>
            <p className="wb-muted">完整功能请返回首页工作台，使用 AI 助手快速处理。</p>
          </div>
        )}
      </main>
    </div>
  );
}
