import { API_BASE_URL } from "../config.js";
import {
  clearRefreshToken,
  clearToken,
  clearUser,
  getRefreshToken,
  getToken,
  setRefreshToken,
  setToken,
} from "../lib/storage.js";

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("no refresh token");
  const resp = await fetch(API_BASE_URL + "auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!resp.ok) throw new Error("refresh failed");
  const data = await resp.json();
  setToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);
  return data.access_token;
}

function doFetch(path, options, token) {
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(API_BASE_URL + path, { ...options, headers });
}

export async function apiFetch(path, options = {}) {
  let resp = await doFetch(path, options, getToken());

  if (resp.status === 401 && !path.startsWith("auth/refresh")) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      resp = await doFetch(path, options, newToken);
    } catch (e) {
      clearToken();
      clearRefreshToken();
      clearUser();
      window.dispatchEvent(new Event("auth:expired"));
    }
  }
  return resp;
}
