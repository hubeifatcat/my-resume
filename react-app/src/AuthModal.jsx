import { useState } from "react";
import { apiFetch, setToken, setUser } from "./auth.js";

export default function AuthModal({ open, onClose, onAuthed }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const path = mode === "register" ? "auth/register" : "auth/login";
      const body = { username, password };
      if (mode === "register") body.email = email;
      const resp = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.detail || "操作失败");
        return;
      }
      setToken(data.token);
      setUser(data.user);
      onAuthed(data.user);
      onClose();
      setPassword("");
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ma-modal-mask" onClick={onClose}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-head">
          <h3>{mode === "login" ? "登录" : "注册"}</h3>
          <button className="ma-modal-close" onClick={onClose} aria-label="关闭">×</button>
        </div>
        <div className="ma-modal-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>登录</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>注册</button>
        </div>
        <form onSubmit={submit}>
          <label>
            用户名
            <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength="3" maxLength="32" placeholder="3-32 位字母数字下划线" />
          </label>
          {mode === "register" && (
            <label>
              邮箱（可选）
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
            </label>
          )}
          <label>
            密码
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength="8" placeholder="至少 8 位" />
          </label>
          {error && <div className="ma-modal-error">{error}</div>}
          <button className="ma-btn-primary" disabled={busy} type="submit">
            {busy ? "处理中…" : mode === "login" ? "登录" : "注册并登录"}
          </button>
        </form>
        <p className="ma-modal-note">游客可直接体验 Demo，登录后可保存会话与轨迹历史。</p>
      </div>
    </div>
  );
}
