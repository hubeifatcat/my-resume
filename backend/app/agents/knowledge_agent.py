import os

from ..agents.base import BaseAgent
from ..rag import rag_enabled, search
from ..retrieval import keyword_search


class KnowledgeAgent(BaseAgent):
    name = "knowledge_agent"

    async def run(self, message, blackboard, trace):
        top_k = int(os.getenv("RAG_TOP_K", "5"))
        provider = os.getenv("EMBEDDING_PROVIDER", "keyword").lower()
        hits = []
        try:
            if rag_enabled() and provider in ("dashscope", "fastembed"):
                hits = await search(message, top_k=top_k)
            else:
                hits = keyword_search(message, top_k)
        except Exception:
            hits = keyword_search(message, top_k)
        context = "\n".join([f"- [来源：{h.get('source', '')}] {h.get('text', '')}" for h in hits])
        trace.add_step(
            self.name,
            "rag_search",
            message,
            f"命中 {len(hits)} 条资料",
            latency_ms=0,
        )
        blackboard.set("knowledge_hits", hits, self.name)
        blackboard.set("context", context, self.name)
        return context
