import { useEffect, useState } from "react";
import { createAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from "../../api/adminApi.js";
import { fmtTime } from "./adminHelpers.js";

const EMPTY = { title: "", content: "", status: "published" };

export default function AdminAnnouncements() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    try {
      const data = await getAnnouncements();
      setRows(data.announcements || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setBusy(true);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, form);
      } else {
        await createAnnouncement(form);
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  function edit(row) {
    setEditingId(row.id);
    setForm({ title: row.title, content: row.content, status: row.status });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function remove(row) {
    if (!window.confirm(`确认删除公告「${row.title}」？`)) return;
    try {
      await deleteAnnouncement(row.id);
      if (editingId === row.id) cancelEdit();
      load();
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <div className="ad-content">
      {error && <div className="ad-error">{error}</div>}
      <form className="ad-form" onSubmit={submit}>
        <div className="ad-form-head">
          <h3>{editingId ? "编辑公告" : "新建公告"}</h3>
          <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
            <option value="published">发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
        <input
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="公告标题"
          required
        />
        <textarea
          value={form.content}
          onChange={(e) => setField("content", e.target.value)}
          placeholder="公告内容"
          rows="4"
          required
        />
        <div className="ad-form-foot">
          <button className="ad-btn" type="submit" disabled={busy}>{busy ? "保存中…" : editingId ? "保存修改" : "发布公告"}</button>
          {editingId && <button className="ad-btn" type="button" onClick={cancelEdit}>取消编辑</button>}
        </div>
      </form>

      <div className="ad-list">
        {rows.map((row) => (
          <div className="ad-list-item" key={row.id}>
            <div>
              <span className={row.status === "published" ? "ad-tag" : "ad-tag draft"}>{row.status === "published" ? "已发布" : "草稿"}</span>
              <h3>{row.title}</h3>
              <p>{row.content}</p>
              <small>{fmtTime(row.updated_at)}</small>
            </div>
            <div className="ad-actions">
              <button onClick={() => edit(row)}>编辑</button>
              <button className="danger" onClick={() => remove(row)}>删除</button>
            </div>
          </div>
        ))}
        {!rows.length && <p className="ad-muted">暂无公告。</p>}
      </div>
    </div>
  );
}
