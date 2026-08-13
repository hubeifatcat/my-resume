import { apiFetch } from "./client.js";

async function read(resp) {
  if (!resp.ok) {
    let detail = resp.statusText;
    try {
      const data = await resp.json();
      detail = data.detail || detail;
    } catch (e) {
      /* keep statusText */
    }
    throw new Error(detail || "请求失败");
  }
  return resp.json();
}

export function getAdminStats() {
  return apiFetch("admin/stats").then(read);
}

export function getUsers(search = "", offset = 0, limit = 50) {
  const params = new URLSearchParams({ search, offset: String(offset), limit: String(limit) });
  return apiFetch(`admin/users?${params}`).then(read);
}

export function setUserRole(userId, role) {
  return apiFetch(`admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  }).then(read);
}

export function resetUserPassword(userId, password) {
  return apiFetch(`admin/users/${userId}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  }).then(read);
}

export function deleteUser(userId) {
  return apiFetch(`admin/users/${userId}`, { method: "DELETE" }).then(read);
}

export function getConversations(search = "", offset = 0, limit = 50) {
  const params = new URLSearchParams({ search, offset: String(offset), limit: String(limit) });
  return apiFetch(`admin/conversations?${params}`).then(read);
}

export function getConversation(conversationId) {
  return apiFetch(`admin/conversations/${conversationId}`).then(read);
}

export function deleteConversation(conversationId) {
  return apiFetch(`admin/conversations/${conversationId}`, { method: "DELETE" }).then(read);
}

export function getKnowledge() {
  return apiFetch("admin/knowledge").then(read);
}

export function refreshKnowledge() {
  return apiFetch("admin/knowledge/refresh", { method: "POST" }).then(read);
}

export function getAnnouncements(status = "") {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const qs = params.toString();
  return apiFetch(`admin/announcements${qs ? `?${qs}` : ""}`).then(read);
}

export function createAnnouncement(payload) {
  return apiFetch("admin/announcements", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(read);
}

export function updateAnnouncement(annId, payload) {
  return apiFetch(`admin/announcements/${annId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then(read);
}

export function deleteAnnouncement(annId) {
  return apiFetch(`admin/announcements/${annId}`, { method: "DELETE" }).then(read);
}

export function getAuditLogs(offset = 0, limit = 100) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  return apiFetch(`admin/logs?${params}`).then(read);
}

export function getSystemInfo() {
  return apiFetch("admin/system").then(read);
}
