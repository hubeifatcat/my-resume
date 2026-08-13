import { useEffect, useState } from "react";
import { getAuditLogs } from "../../api/adminApi.js";
import { fmtTime } from "./adminHelpers.js";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuditLogs()
      .then((data) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="ad-error">加载失败：{error}</div>;

  return (
    <div className="ad-content">
      <div className="ad-toolbar">
        <span className="ad-total">共 {total} 条操作日志</span>
      </div>
      {loading ? (
        <div className="ad-loading">加载中…</div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>操作人</th>
                <th>动作</th>
                <th>对象</th>
                <th>详情</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{fmtTime(log.created_at)}</td>
                  <td>{log.username || "-"}</td>
                  <td><span className="ad-tag">{log.action}</span></td>
                  <td>{log.target_type}{log.target_id ? ` · ${log.target_id}` : ""}</td>
                  <td className="ad-log-detail">{log.detail || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
