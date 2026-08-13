"""Trace：会话轨迹模型与内存存储。"""

import time
import uuid


class Trace:
    def __init__(self, conversation_id=None):
        self.conversation_id = conversation_id or uuid.uuid4().hex
        self.steps = []
        self.intent = None
        self.blackboard_keys = []
        self.mode = "multi-agent"
        self.created_at = time.time()

    def add_step(self, agent, action, input_text, output_text, status="ok", latency_ms=0):
        self.steps.append(
            {
                "seq": len(self.steps) + 1,
                "agent": agent,
                "action": action,
                "input": input_text,
                "output": output_text,
                "status": status,
                "latency_ms": latency_ms,
            }
        )

    def set_last_latency(self, latency_ms):
        if self.steps:
            self.steps[-1]["latency_ms"] = latency_ms

    def to_dict(self):
        return {
            "conversation_id": self.conversation_id,
            "intent": self.intent,
            "steps": self.steps,
            "blackboard_keys": self.blackboard_keys,
            "mode": self.mode,
            "created_at": self.created_at,
        }


class TraceStore:
    def __init__(self, ttl_seconds=86400):
        self._store = {}
        self._ttl = ttl_seconds

    def save(self, trace: Trace):
        self._store[trace.conversation_id] = trace.to_dict()

    def get(self, conversation_id: str):
        item = self._store.get(conversation_id)
        if not item:
            return None
        if self._ttl and time.time() - item.get("created_at", 0) > self._ttl:
            self._store.pop(conversation_id, None)
            return None
        return item

    def cleanup(self):
        now = time.time()
        expired = [k for k, v in self._store.items() if now - v.get("created_at", 0) > self._ttl]
        for k in expired:
            self._store.pop(k, None)


trace_store = TraceStore()
