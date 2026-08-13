import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/adminApi.js";

const CARDS = [
  { key: "users", label: "注册用户", tone: "blue" },
  { key: "conversations", label: "会话记录", tone: "cyan" },
  { key: "announcements", label: "平台公告", tone: "amber" },
  { key: "knowledge_sources", label: "知识库来源", tone: "green" },
];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="ad-error">加载失败：{error}</div>;
  if (!stats) return <div className="ad-loading">加载中…</div>;

  return (
    <div className="ad-content">
      <div className="ad-stats">
        {CARDS.map((c) => (
          <div className={`ad-stat ${c.tone}`} key={c.key}>
            <span>{stats[c.key] ?? 0}</span>
            <strong>{c.label}</strong>
          </div>
        ))}
        <div className="ad-stat gray">
          <span>{stats.audit_logs ?? 0}</span>
          <strong>操作日志</strong>
        </div>
      </div>

      <div className="ad-panel">
        <h3>平台管理说明</h3>
        <p>
          左侧导航覆盖用户、会话、知识库、公告、操作日志与系统信息。所有写操作都会自动记录到操作日志，便于追溯。
        </p>
      </div>
    </div>
  );
}
