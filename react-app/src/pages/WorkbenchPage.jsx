import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import useChat from "../hooks/useChat.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { createWorkbenchItem, deleteWorkbenchItem, getWorkbench, updateWorkbenchItem } from "../api/workbenchApi.js";
import { renderMessage } from "../lib/text.jsx";

const navItems = [
  { id: "home", label: "首页" },
  { id: "tasks", label: "任务" },
  { id: "schedule", label: "日程" },
  { id: "files", label: "文件" },
  { id: "logs", label: "日志" },
  { id: "notice", label: "公告" },
  { id: "profile", label: "我的" },
];

// 游客 / 未登录时的默认展示数据（与后端种子一致）
const DEFAULT_MODULES = {
  quick: [
    { key: "q1", title: "日程管理", meta: "查看今日安排与会议" },
    { key: "q2", title: "我的任务", meta: "管理工作任务与进度" },
    { key: "q3", title: "文件中心", meta: "管理办公文件资料" },
    { key: "q4", title: "工作日志", meta: "记录每日工作情况" },
    { key: "q5", title: "公司公告", meta: "查看企业最新通知" },
    { key: "q6", title: "个人中心", meta: "管理个人信息资料" },
  ],
  week: [
    { key: "w1", day: "周一", count: 4 },
    { key: "w2", day: "周二", count: 6 },
    { key: "w3", day: "周三", count: 3 },
    { key: "w4", day: "周四", count: 5 },
    { key: "w5", day: "周五", count: 2 },
    { key: "w6", day: "周六", count: 1 },
  ],
  roles: [
    { key: "r1", title: "项目经理助手" },
    { key: "r2", title: "运维分析助手" },
    { key: "r3", title: "文档写作助手" },
    { key: "r4", title: "脚本生成助手" },
  ],
  assets: [
    { key: "a1", title: "项目知识库", meta: "RAG 检索 · 12 篇" },
    { key: "a2", title: "运维案例", meta: "故障排查 · 36 条" },
    { key: "a3", title: "文件资产", meta: "部署手册 · 8 份" },
  ],
  tasks: [
    { key: "t1", title: "梳理今日待办清单", status: "todo" },
    { key: "t2", title: "跟进项目交付验收", status: "doing" },
    { key: "t3", title: "生成周报草稿", status: "done" },
  ],
  schedule: [
    { key: "s1", title: "10:00 项目周会", meta: "会议室 A" },
    { key: "s2", title: "14:00 需求评审", meta: "线上会议" },
    { key: "s3", title: "16:30 交付复盘", meta: "会议室 B" },
  ],
  files: [
    { key: "f1", title: "部署方案.pdf", meta: "PDF · 2.4MB" },
    { key: "f2", title: "用户操作手册.docx", meta: "DOCX · 1.8MB" },
    { key: "f3", title: "故障案例库.md", meta: "Markdown · 36 条" },
  ],
  logs: [
    { key: "l1", title: "今日完成部署验收", meta: "08-13" },
    { key: "l2", title: "处理客户反馈 3 条", meta: "08-13" },
    { key: "l3", title: "更新巡检记录", meta: "08-12" },
  ],
  profile: [
    { key: "p1", title: "账号信息", meta: "用户名 / 邮箱" },
    { key: "p2", title: "系统设置", meta: "主题 / 通知" },
    { key: "p3", title: "偏好与主题", meta: "亮色 / 暗色" },
  ],
};

// 快捷入口点击 → 跳转模块映射（title 约定）
const QUICK_TARGET = {
  "日程管理": "schedule",
  "我的任务": "tasks",
  "文件中心": "files",
  "工作日志": "logs",
  "公司公告": "notice",
  "个人中心": "profile",
};

const MODULE_TITLES = {
  tasks: "任务",
  schedule: "日程",
  files: "文件",
  logs: "日志",
  notice: "公告",
  profile: "我的",
};

const STATUS_LABEL = { todo: "待办", doing: "进行中", done: "已完成" };
const STATUS_TONE = { todo: "blue", doing: "amber", done: "green" };

const EMPTY_EDIT = { module: "", id: null, title: "", meta: "", status: "" };

export default function WorkbenchPage() {
  const { user, setAuthOpen, logout } = useAuth();
  const chat = useChat(user);
  const [activeNav, setActiveNav] = useState("home");
  const [activeRole, setActiveRole] = useState("项目经理助手");
  const [temperature, setTemperature] = useState(0.4);
  const [announcements, setAnnouncements] = useState([]);

  // 工作台数据：登录用户从 API 加载，游客用默认数据
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [dataReady, setDataReady] = useState(false);
  const [edit, setEdit] = useState(EMPTY_EDIT);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const canEdit = !!user;

  const loadWorkbench = useCallback(async () => {
    if (!user) {
      setModules(DEFAULT_MODULES);
      setDataReady(true);
      return;
    }
    try {
      const data = await getWorkbench();
      const grouped = data.modules || {};
      setModules({
        quick: grouped.quick || [],
        week: (grouped.week || []).map((w) => ({ ...w, day: w.title, count: Number(w.meta) || 0 })),
        roles: grouped.roles || [],
        assets: grouped.assets || [],
        tasks: grouped.tasks || [],
        schedule: grouped.schedule || [],
        files: grouped.files || [],
        logs: grouped.logs || [],
        profile: grouped.profile || [],
      });
    } catch (e) {
      setNotice("工作台数据加载失败：" + (e.message || "网络错误"));
    } finally {
      setDataReady(true);
    }
  }, [user]);

  useEffect(() => {
    loadWorkbench();
  }, [loadWorkbench]);

  useEffect(() => {
    fetch(API_BASE_URL + "announcements")
      .then((resp) => resp.json())
      .then((data) => setAnnouncements(data.announcements || []))
      .catch(() => setAnnouncements([]));
  }, []);

  // 统计卡：从任务/日程数据动态推导
  const stats = useMemo(() => {
    const tasks = modules.tasks || [];
    const todo = tasks.filter((t) => t.status === "todo").length;
    const doing = tasks.filter((t) => t.status === "doing").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const total = tasks.length;
    const rate = total ? Math.round((done / total) * 100) : 0;
    return [
      { label: "今日待办", value: String(todo), unit: "个", note: "待处理任务待完成", tone: "blue", target: "tasks" },
      { label: "进行中", value: String(doing), unit: "个", note: "正在推进的任务", tone: "cyan", target: "tasks" },
      { label: "今日会议", value: String((modules.schedule || []).length), unit: "场", note: "当天日程安排", tone: "amber", target: "schedule" },
      { label: "工作完成率", value: String(rate), unit: "%", note: "整体任务完成情况", tone: "green", target: "tasks" },
    ];
  }, [modules]);

  const weekTasks = useMemo(() => modules.week || [], [modules]);

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  function runPrompt(prompt) {
    chat.sendMessage(prompt);
  }

  // ---------- 增删改 ----------
  function startCreate(module) {
    setEdit({ module, id: null, title: "", meta: "", status: module === "tasks" ? "todo" : "" });
  }

  function startEdit(item, module) {
    setEdit({ module, id: item.id, title: item.title || "", meta: item.meta || "", status: item.status || "" });
  }

  function cancelEdit() {
    setEdit(EMPTY_EDIT);
  }

  async function saveItem(e) {
    e.preventDefault();
    if (!edit.title.trim() || !canEdit || busy) return;
    setBusy(true);
    try {
      if (edit.id) {
        await updateWorkbenchItem(edit.id, {
          title: edit.title.trim(),
          meta: edit.meta.trim(),
          status: edit.status,
        });
      } else {
        await createWorkbenchItem({
          module: edit.module,
          title: edit.title.trim(),
          meta: edit.meta.trim(),
          status: edit.status,
        });
      }
      setEdit(EMPTY_EDIT);
      await loadWorkbench();
    } catch (err) {
      window.alert(err.message || "保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(item) {
    if (!canEdit || !item.id) return;
    if (!window.confirm(`确认删除「${item.title}」？`)) return;
    setBusy(true);
    try {
      await deleteWorkbenchItem(item.id);
      await loadWorkbench();
    } catch (err) {
      window.alert(err.message || "删除失败");
    } finally {
      setBusy(false);
    }
  }

  // ---------- 任务闭环：开始处理 / 确认完成 / 重新打开 ----------
  async function startTask(item) {
    if (!canEdit || !item.id) return;
    setBusy(true);
    try {
      await updateWorkbenchItem(item.id, {
        title: item.title,
        meta: item.meta || "",
        status: "doing",
      });
      await loadWorkbench();
    } catch (err) {
      window.alert(err.message || "更新失败");
    } finally {
      setBusy(false);
    }
  }

  async function completeTask(item) {
    if (!canEdit || !item.id) return;
    const note = window.prompt(`确认完成「${item.title}」？\n可填写完成备注（可选，留空直接完成）：`, "");
    if (note === null) return;
    setBusy(true);
    try {
      const metaParts = [];
      if (item.meta) metaParts.push(item.meta);
      if (note.trim()) metaParts.push("完成备注：" + note.trim());
      await updateWorkbenchItem(item.id, {
        title: item.title,
        meta: metaParts.join(" · "),
        status: "done",
      });
      await loadWorkbench();
    } catch (err) {
      window.alert(err.message || "更新失败");
    } finally {
      setBusy(false);
    }
  }

  async function reopenTask(item) {
    if (!canEdit || !item.id) return;
    if (!window.confirm(`重新打开「${item.title}」？将移回待办列表。`)) return;
    setBusy(true);
    try {
      await updateWorkbenchItem(item.id, {
        title: item.title,
        meta: item.meta || "",
        status: "todo",
      });
      await loadWorkbench();
    } catch (err) {
      window.alert(err.message || "更新失败");
    } finally {
      setBusy(false);
    }
  }

  // ---------- 渲染 ----------
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
                <div className="wb-msg-text">{renderMessage(m.text)}</div>
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
            {(modules.roles || []).map((role) => (
              <div className="wb-role-item" key={role.id ?? role.key}>
                <button
                  className={activeRole === role.title ? "active" : ""}
                  onClick={() => setActiveRole(role.title)}
                >
                  {role.title}
                </button>
                {canEdit && role.id && (
                  <div className="wb-item-actions">
                    <button className="wb-mini-btn" onClick={() => startEdit(role, "roles")}>编辑</button>
                    <button className="wb-mini-btn danger" onClick={() => removeItem(role)}>删除</button>
                  </div>
                )}
              </div>
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
          {canEdit && (
            <div className="wb-side-edit">
              <button className="wb-mini-btn" onClick={() => startCreate("roles")}>+ 添加角色</button>
            </div>
          )}
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
          {(modules.assets || []).map((asset) => (
            <div className="wb-asset" key={asset.id ?? asset.key}>
              <div className="wb-asset-head">
                <strong>{asset.title}</strong>
                {canEdit && asset.id && (
                  <div className="wb-item-actions">
                    <button className="wb-mini-btn" onClick={() => startEdit(asset, "assets")}>编辑</button>
                    <button className="wb-mini-btn danger" onClick={() => removeItem(asset)}>删除</button>
                  </div>
                )}
              </div>
              <span>{asset.meta}</span>
            </div>
          ))}
          {canEdit && (
            <div className="wb-side-edit">
              <button className="wb-mini-btn" onClick={() => startCreate("assets")}>+ 添加资产</button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // 通用模块条目渲染（可编辑）
  function renderModuleItems(module, items) {
    if (module === "tasks") {
      return renderTaskGroups(items);
    }
    return (
      <div className="wb-module-list">
        {items.map((item) => (
          <div className="wb-module-item" key={item.id ?? item.key}>
            <span className="wb-quick-ico">{(item.title || "").slice(0, 1)}</span>
            <div>
              <strong>{item.title}</strong>
              {item.meta && <span>{item.meta}</span>}
            </div>
            {canEdit && item.id && (
              <div className="wb-item-actions">
                <button className="wb-mini-btn" onClick={() => startEdit(item, module)}>编辑</button>
                <button className="wb-mini-btn danger" onClick={() => removeItem(item)}>删除</button>
              </div>
            )}
          </div>
        ))}
        {!items.length && <p className="wb-muted">暂无内容，点击下方按钮添加。</p>}
        {canEdit && (
          <button className="wb-add-btn" onClick={() => startCreate(module)}>+ 添加{MODULE_TITLES[module] || "内容"}</button>
        )}
      </div>
    );
  }

  // 任务模块：按状态分组（待办 / 进行中 / 已完成），闭环操作
  function renderTaskGroups(items) {
    const groups = [
      { key: "todo", label: "待办", items: items.filter((t) => t.status === "todo") },
      { key: "doing", label: "进行中", items: items.filter((t) => t.status === "doing") },
      { key: "done", label: "已完成", items: items.filter((t) => t.status === "done") },
    ];
    return (
      <div className="wb-module-list">
        {groups.map((g) => (
          <div className="wb-task-group" key={g.key}>
            <div className="wb-task-group-head">
              <span className={"wb-task-status " + STATUS_TONE[g.key]}>{STATUS_LABEL[g.key]}</span>
              <em>{g.items.length} 项</em>
            </div>
            {g.items.length ? (
              g.items.map((item) => (
                <div className="wb-module-item" key={item.id ?? item.key}>
                  <span className="wb-quick-ico">{(item.title || "").slice(0, 1)}</span>
                  <div>
                    <strong>{item.title}</strong>
                    {item.meta && <span>{item.meta}</span>}
                  </div>
                  {canEdit && item.id && (
                    <div className="wb-item-actions">
                      {item.status === "todo" && (
                        <button className="wb-mini-btn primary" onClick={() => startTask(item)}>开始处理</button>
                      )}
                      {item.status === "doing" && (
                        <button className="wb-mini-btn primary" onClick={() => completeTask(item)}>确认完成</button>
                      )}
                      {item.status === "done" && (
                        <button className="wb-mini-btn" onClick={() => reopenTask(item)}>重新打开</button>
                      )}
                      <button className="wb-mini-btn" onClick={() => startEdit(item, "tasks")}>编辑</button>
                      <button className="wb-mini-btn danger" onClick={() => removeItem(item)}>删除</button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="wb-muted">暂无{g.label}任务。</p>
            )}
          </div>
        ))}
        {canEdit && (
          <button className="wb-add-btn" onClick={() => startCreate("tasks")}>+ 添加任务</button>
        )}
      </div>
    );
  }

  // 行内编辑表单
  function renderEditForm() {
    if (!edit.module) return null;
    const isTask = edit.module === "tasks";
    return (
      <form className="wb-edit-form" onSubmit={saveItem}>
        <input
          autoFocus
          value={edit.title}
          onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))}
          placeholder={isTask ? "任务名称" : "标题"}
          required
        />
        <input
          value={edit.meta}
          onChange={(e) => setEdit((p) => ({ ...p, meta: e.target.value }))}
          placeholder={isTask ? "备注（可选）" : "描述 / 备注（可选）"}
        />
        {isTask && (
          <select value={edit.status} onChange={(e) => setEdit((p) => ({ ...p, status: e.target.value }))}>
            <option value="todo">待办</option>
            <option value="doing">进行中</option>
            <option value="done">已完成</option>
          </select>
        )}
        <button className="wb-mini-btn primary" type="submit" disabled={busy || !edit.title.trim()}>
          {busy ? "保存中…" : edit.id ? "保存" : "添加"}
        </button>
        <button className="wb-mini-btn" type="button" onClick={cancelEdit}>取消</button>
      </form>
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

        {notice && <div className="wb-notice">{notice}</div>}

        {activeNav === "home" ? (
          <div className="wb-content">
            <div className="wb-stats">
              {stats.map((s) => (
                <div
                  className={"wb-stat " + s.tone + (s.target ? " wb-stat-link" : "")}
                  key={s.label}
                  onClick={() => s.target && setActiveNav(s.target)}
                  title={s.target ? `点击查看${MODULE_TITLES[s.target]}` : ""}
                >
                  <span className="wb-stat-ico">{s.label.slice(0, 1)}</span>
                  <div>
                    <strong>{s.value}<small>{s.unit}</small></strong>
                    <span>{s.label}</span>
                    <p>{s.note}</p>
                  </div>
                  {s.target && <span className="wb-stat-go">查看 →</span>}
                </div>
              ))}
            </div>

            <div className="wb-quick">
              {(modules.quick || []).map((q) => (
                <button key={q.id ?? q.key} onClick={() => setActiveNav(QUICK_TARGET[q.title] || "home")}>
                  <span className="wb-quick-ico">{(q.title || "").slice(0, 1)}</span>
                  <strong>{q.title}</strong>
                  <span>{q.meta}</span>
                </button>
              ))}
              {canEdit && (
                <button className="wb-quick wb-quick-add" onClick={() => startCreate("quick")}>
                  <span className="wb-quick-ico">+</span>
                  <strong>添加入口</strong>
                  <span>新增快捷入口</span>
                </button>
              )}
            </div>

            {edit.module === "quick" && renderEditForm()}

            <div className="wb-charts">
              <div className="wb-chart-card">
                <h3>本周完成任务</h3>
                <div className="wb-bars">
                  {weekTasks.map((t) => (
                    <div className="wb-bar" key={t.id ?? t.key}>
                      <div style={{ height: `${Math.min(100, (t.count || 0) * 14)}%` }}></div>
                      <span>{t.day}</span>
                      <em>{t.count}</em>
                    </div>
                  ))}
                </div>
              </div>
              <div className="wb-chart-card">
                <h3>工作完成率</h3>
                <div className="wb-progress">
                  <div className="wb-ring" style={{ "--p": `${stats[3].value}%` }}>
                    <span>{stats[3].value}%</span>
                  </div>
                  <div>
                    <strong>共 {(modules.tasks || []).length} 项任务</strong>
                    <span>已完成 {(modules.tasks || []).filter((t) => t.status === "done").length} 项</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="wb-ai-grid">
              {renderChat()}
              {renderAiSide()}
            </div>
          </div>
        ) : activeNav === "settings" ? (
          <div className="wb-module">
            <h2>系统设置</h2>
            <p>主题与偏好设置。</p>
            <div className="wb-module-list">
              {["主题：亮色 / 暗色", "通知偏好", "快捷键"].map((item) => (
                <div className="wb-module-item" key={item}>
                  <span className="wb-quick-ico">{item.slice(0, 1)}</span>
                  <div>
                    <strong>{item}</strong>
                  </div>
                </div>
              ))}
            </div>
            <p className="wb-muted">完整功能请返回首页工作台，使用 AI 助手快速处理。</p>
          </div>
        ) : (
          <div className="wb-module">
            <div className="wb-module-head">
              <div>
                <h2>{activeNav === "notice" ? "公告" : MODULE_TITLES[activeNav]}</h2>
                <p>
                  {activeNav === "notice"
                    ? "查看企业最新通知，AI 可提取公告要点。"
                    : activeNav === "tasks"
                      ? "任务闭环管理：待办 → 开始处理 → 确认完成，统计卡自动更新。"
                      : activeNav === "schedule"
                        ? "今日日程安排，登录后可增删改。"
                        : activeNav === "files"
                          ? "文件中心已接入知识库资产，登录后可增删改。"
                          : activeNav === "logs"
                            ? "记录每日工作情况，登录后可增删改。"
                            : "个人资料与偏好设置，登录后可增删改。"}
                </p>
              </div>
              {canEdit && activeNav !== "notice" && !edit.module && (
                <button className="wb-add-btn" onClick={() => startCreate(activeNav)}>+ 添加</button>
              )}
            </div>
            {edit.module === activeNav && renderEditForm()}
            <div className="wb-module-list">
              {activeNav === "notice" ? (
                announcements.length ? (
                  announcements.map((ann) => (
                    <div className="wb-module-item" key={ann.id}>
                      <span className="wb-quick-ico">{(ann.title || "").slice(0, 1)}</span>
                      <div>
                        <strong>{ann.title}</strong>
                        {ann.content && <span>{ann.content}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="wb-muted">暂无公告。</p>
                )
              ) : (
                renderModuleItems(activeNav, modules[activeNav] || [])
              )}
            </div>
            <p className="wb-muted">
              {canEdit
                ? "内容已保存到你的账号，仅自己可见，可在本页直接增删改。"
                : "登录后可管理工作台内容（任务 / 日程 / 文件 / 日志 / 快捷入口等）。"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
