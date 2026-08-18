import { API_BASE_URL, CHAT_URL, HEALTH_URL } from "../config.js";
import { apiFetch } from "./client.js";
import { getToken } from "../lib/storage.js";

export async function checkHealth() {
  const resp = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(4000) });
  return resp.ok;
}

export async function getAgents() {
  const resp = await apiFetch("agents");
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.agents || [];
}

export async function getTools() {
  const resp = await apiFetch("tools");
  if (!resp.ok) return { skills: [], mcpTools: [] };
  const data = await resp.json();
  return {
    skills: data.skills || [],
    mcpTools: data.mcp_tools || [],
  };
}

export async function sendChat(payload) {
  return apiFetch("chat", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
}

/** 查询当前会话（游客按 IP / 登录用户）的提问配额 */
export async function getQuota() {
  const resp = await apiFetch("quota");
  if (!resp.ok) return null;
  return resp.json();
}

/** SSE 流式对话：onEvent 接收 {type: stage|chunk|done, ...} 事件 */
export async function streamChat(payload, onEvent, signal) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const resp = await fetch(API_BASE_URL + "chat/stream", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });
  if (!resp.ok || !resp.body) {
    throw new Error("stream failed: " + resp.status);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop();
    for (const evt of events) {
      for (const line of evt.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            onEvent(JSON.parse(line.slice(6)));
          } catch (e) {
            /* ignore malformed event */
          }
        }
      }
    }
  }
}

export async function listConversations() {
  const resp = await apiFetch("conversations");
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.conversations || [];
}

export async function getConversation(conversationId) {
  const resp = await apiFetch(`conversations/${conversationId}`);
  if (!resp.ok) return null;
  return resp.json();
}

export async function deleteConversation(conversationId) {
  return apiFetch(`conversations/${conversationId}`, { method: "DELETE" });
}

export { CHAT_URL };
