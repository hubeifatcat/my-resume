import { CHAT_URL, HEALTH_URL } from "../config.js";
import { apiFetch } from "./client.js";

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
