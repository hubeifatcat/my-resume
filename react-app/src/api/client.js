import { API_BASE_URL } from "../config.js";
import { getToken } from "../lib/storage.js";

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(API_BASE_URL + path, { ...options, headers });
}
