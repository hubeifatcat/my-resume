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

export function getWorkbench() {
  return apiFetch("workbench").then(read);
}

export function createWorkbenchItem(payload) {
  return apiFetch("workbench", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(read);
}

export function updateWorkbenchItem(itemId, payload) {
  return apiFetch(`workbench/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then(read);
}

export function deleteWorkbenchItem(itemId) {
  return apiFetch(`workbench/${itemId}`, { method: "DELETE" }).then(read);
}
