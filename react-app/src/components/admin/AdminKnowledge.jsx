import { useEffect, useState } from "react";
import { getKnowledge, refreshKnowledge } from "../../api/adminApi.js";

export default function AdminKnowledge() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    try {
      setData(await getKnowledge());
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function refresh() {
    if (!window.confirm("确认重新灌入知识库？会把种子文档重新写入 Qdrant 向量库。")) return;
    setBusy(true);
    try {
      const result = await refreshKnowledge();
      window.alert(`知识库已刷新，共 ${result.docs} 个分块`);
      load();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="ad-error">加载失败：{error}</div>;
  if (!data) return <div className="ad-loading">加载中…</div>;

  const qdrant = data.qdrant || {};

  return (
    <div className="ad-content">
      <div className="ad-toolbar">
        <span className="ad-total">静态知识条目 {data.static_entries ?? 0} · Qdrant 分块 {qdrant.points_count ?? 0}</span>
        <button className="ad-btn" onClick={refresh} disabled={busy}>{busy ? "刷新中…" : "重新灌入知识库"}</button>
      </div>

      <div className="ad-panel">
        <h3>知识来源</h3>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr><th>来源</th><th>种子文档数</th></tr>
            </thead>
            <tbody>
              {Object.entries(data.sources || {}).map(([source, count]) => (
                <tr key={source}>
                  <td>{source}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ad-panel">
        <h3>向量库分块</h3>
        {qdrant.error ? (
          <p className="ad-muted">Qdrant 暂不可用：{qdrant.error}</p>
        ) : (
          <div className="ad-chunk-list">
            {(qdrant.points || []).map((p) => (
              <div className="ad-chunk" key={p.id}>
                <span className="ad-tag">{p.source || "未知来源"}</span>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
