import { useEffect, useState } from "react";
import { getSystemInfo } from "../../api/adminApi.js";

export default function AdminSystem() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSystemInfo()
      .then((data) => setConfig(data.config || {}))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="ad-error">加载失败：{error}</div>;
  if (!config) return <div className="ad-loading">加载中…</div>;

  return (
    <div className="ad-content">
      <div className="ad-panel">
        <h3>系统运行配置</h3>
        <p className="ad-muted">此处仅展示非敏感配置，密钥类变量不会对外返回。</p>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr><th>配置项</th><th>当前值</th></tr>
            </thead>
            <tbody>
              {Object.entries(config).map(([key, value]) => (
                <tr key={key}>
                  <td><code>{key}</code></td>
                  <td>{value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
