import { useEffect, useState } from "react";
import { deleteConversation, getConversation, getConversations } from "../../api/adminApi.js";
import { fmtTime } from "./adminHelpers.js";

export default function AdminConversations() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getConversations(search);
      setRows(data.conversations || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDetail(conversationId) {
    setDetailLoading(true);
    try {
      setDetail(await getConversation(conversationId));
    } catch (e) {
      window.alert(e.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function remove(row) {
    if (!window.confirm(`确认删除会话「${row.title || row.conversation_id}」？`)) return;
    try {
      await deleteConversation(row.conversation_id);
      if (detail && detail.conversation_id === row.conversation_id) setDetail(null);
      load();
    } catch (e) {
      window.alert(e.message);
    }
  }

  return (
    <div className="ad-content">
      <div className="ad-toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索标题或用户名"
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button className="ad-btn" onClick={load}>查询</button>
        <span className="ad-total">共 {total} 条会话</span>
      </div>
      {error && <div className="ad-error">{error}</div>}
      {loading ? (
        <div className="ad-loading">加载中…</div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>用户</th>
                <th>消息数</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.conversation_id}>
                  <td><button className="ad-link" onClick={() => openDetail(c.conversation_id)}>{c.title || c.conversation_id}</button></td>
                  <td>{c.username || "匿名"}</td>
                  <td>{c.message_count}</td>
                  <td>{fmtTime(c.updated_at)}</td>
                  <td className="ad-actions">
                    <button onClick={() => openDetail(c.conversation_id)}>查看</button>
                    <button className="danger" onClick={() => remove(c)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="ad-modal-mask" onClick={() => setDetail(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head">
              <div>
                <h3>{detail.title || detail.conversation_id}</h3>
                <p>{detail.username || "匿名"} · {fmtTime(detail.updated_at)}</p>
              </div>
              <button className="ad-modal-close" onClick={() => setDetail(null)}>×</button>
            </div>
            <div className="ad-modal-body">
              {detailLoading ? (
                <div className="ad-loading">加载中…</div>
              ) : (
                <>
                  <div className="ad-msg-list">
                    {(detail.messages || []).map((m, i) => (
                      <div className={`ad-msg ${m.role}`} key={i}>
                        <span>{m.role === "bot" ? "AI" : "用户"}</span>
                        <p>{m.text}</p>
                      </div>
                    ))}
                  </div>
                  <details className="ad-trace">
                    <summary>查看轨迹数据</summary>
                    <pre>{JSON.stringify(detail.trace || {}, null, 2)}</pre>
                  </details>
                </>
              )}
            </div>
            <div className="ad-modal-foot">
              <button className="ad-btn danger" onClick={() => remove(detail)}>删除此会话</button>
              <button className="ad-btn" onClick={() => setDetail(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
