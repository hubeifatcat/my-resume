import { useEffect, useState } from "react";
import { deleteUser, getUsers, resetUserPassword, setUserRole } from "../../api/adminApi.js";
import { fmtDate, roleLabel } from "./adminHelpers.js";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers(search);
      setUsers(data.users || []);
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

  async function toggleRole(user) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`确认将 ${user.username} 的角色改为${roleLabel(nextRole)}？`)) return;
    try {
      await setUserRole(user.id, nextRole);
      load();
    } catch (e) {
      window.alert(e.message);
    }
  }

  async function resetPwd(user) {
    const password = window.prompt(`为 ${user.username} 设置新密码（至少 8 位，含字母和数字）`);
    if (!password) return;
    try {
      await resetUserPassword(user.id, password);
      window.alert("密码已重置");
    } catch (e) {
      window.alert(e.message);
    }
  }

  async function remove(user) {
    if (!window.confirm(`确认删除用户 ${user.username}？其会话记录也会一并删除。`)) return;
    try {
      await deleteUser(user.id);
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
          placeholder="搜索用户名或邮箱"
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button className="ad-btn" onClick={load}>查询</button>
        <span className="ad-total">共 {total} 个用户</span>
      </div>
      {error && <div className="ad-error">{error}</div>}
      {loading ? (
        <div className="ad-loading">加载中…</div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>会话数</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email || "-"}</td>
                  <td><span className={u.role === "admin" ? "ad-tag admin" : "ad-tag"}>{roleLabel(u.role)}</span></td>
                  <td>{u.conversation_count ?? 0}</td>
                  <td>{fmtDate(u.created_at)}</td>
                  <td className="ad-actions">
                    <button onClick={() => toggleRole(u)}>{u.role === "admin" ? "取消管理员" : "设为管理员"}</button>
                    <button onClick={() => resetPwd(u)}>重置密码</button>
                    <button className="danger" onClick={() => remove(u)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
