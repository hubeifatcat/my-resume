import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client.js";
import {
  clearRefreshToken,
  clearToken,
  clearUser,
  getRefreshToken,
  getToken,
  getUser,
  setRefreshToken,
  setToken,
  setUser,
} from "../lib/storage.js";

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

    function onExpired() {
      setUserState(null);
    }
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
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
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setUser(data.user);
    setUserState(data.user);
    setAuthOpen(false);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await apiFetch("auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (e) {
        /* token 无效也继续本地登出 */
      }
    }
    clearToken();
    clearRefreshToken();
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
