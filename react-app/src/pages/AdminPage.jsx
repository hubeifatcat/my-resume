import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import AdminOverview from "../components/admin/AdminOverview.jsx";
import AdminUsers from "../components/admin/AdminUsers.jsx";
import AdminConversations from "../components/admin/AdminConversations.jsx";
import AdminKnowledge from "../components/admin/AdminKnowledge.jsx";
import AdminAnnouncements from "../components/admin/AdminAnnouncements.jsx";
import AdminLogs from "../components/admin/AdminLogs.jsx";
import AdminSystem from "../components/admin/AdminSystem.jsx";

const NAV = [
  { id: "overview", label: "平台概览", icon: "概" },
  { id: "users", label: "用户管理", icon: "用" },
  { id: "conversations", label: "会话管理", icon: "话" },
  { id: "knowledge", label: "知识库", icon: "知" },
  { id: "announcements", label: "公告管理", icon: "告" },
  { id: "logs", label: "操作日志", icon: "日" },
  { id: "system", label: "系统信息", icon: "系" },
];

export default function AdminPage() {
  const { user, setAuthOpen, logout } = useAuth();
  const [active, setActive] = useState("overview");

  if (!user) {
    return (
      <div className="ad-gate">
        <div className="ad-gate-card">
          <h2>平台管理后台</h2>
          <p>请先登录管理员账号，登录后进入管理页面。</p>
          <button className="btn btn-primary" onClick={() => setAuthOpen(true)}>登录 / 注册</button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="ad-gate">
        <div className="ad-gate-card">
          <h2>无访问权限</h2>
          <p>当前账号不是管理员，无法进入管理后台。</p>
          <NavLink className="btn btn-outline" to="/">返回站点</NavLink>
        </div>
      </div>
    );
  }

  const current = NAV.find((n) => n.id === active) || NAV[0];

  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <div className="ad-brand">
          <span className="ad-brand-mark">管</span>
          <div>
            <strong>智办管理台</strong>
            <small>Platform Admin</small>
          </div>
        </div>
        <nav className="ad-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={active === item.id ? "active" : ""}
              onClick={() => setActive(item.id)}
            >
              <span className="ad-nav-ico">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="ad-side-foot">
          <NavLink to="/workbench" className="ad-back">返回工作台</NavLink>
          <button onClick={logout}>退出登录</button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div>
            <h1>{current.label}</h1>
            <p>平台数据与系统管理</p>
          </div>
          <div className="ad-user">
            <span className="ad-user-avatar">{user.username.slice(0, 1)}</span>
            <div>
              <strong>{user.username}</strong>
              <small>管理员</small>
            </div>
          </div>
        </header>

        {active === "overview" && <AdminOverview />}
        {active === "users" && <AdminUsers />}
        {active === "conversations" && <AdminConversations />}
        {active === "knowledge" && <AdminKnowledge />}
        {active === "announcements" && <AdminAnnouncements />}
        {active === "logs" && <AdminLogs />}
        {active === "system" && <AdminSystem />}
      </main>
    </div>
  );
}
