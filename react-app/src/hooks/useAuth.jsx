import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client.js";
import { clearToken, clearUser, getToken, getUser, setToken, setUser } from "../lib/storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    async function validate() {
      if (!getToken() || !getUser()) return;
      try {
        const resp = await apiFetch("auth/me");
        if (resp.ok) {
          setUserState(await resp.json());
        } else {
          clearToken();
          clearUser();
          setUserState(null);
        }
      } catch (e) {
        // 网络异常时保留本地会话，避免打断浏览
      }
    }
    validate();
  }, []);

  const authenticate = useCallback(async (mode, payload) => {
    const path = mode === "register" ? "auth/register" : "auth/login";
    const resp = await apiFetch(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.detail || "操作失败");
    }
    setToken(data.token);
    setUser(data.user);
    setUserState(data.user);
    setAuthOpen(false);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearUser();
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, authOpen, setAuthOpen, login: authenticate, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
