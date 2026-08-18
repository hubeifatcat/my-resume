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

        # 相关性过滤：keyword 模式带 score，命中词数过少（≤1）视为弱相关，丢弃
        min_score = int(os.getenv("RAG_MIN_SCORE", "2"))
        filtered = [h for h in hits if h.get("score", min_score) >= min_score]

        context = "\n".join([f"- [来源：{h.get('source', '')}] {h.get('text', '')}" for h in filtered])
        trace.add_step(
            self.name,
            "rag_search",
            message,
            f"命中 {len(hits)} 条，过滤后保留 {len(filtered)} 条",
            latency_ms=0,
        )
        blackboard.set("knowledge_hits", filtered, self.name)
        blackboard.set("context", context, self.name)
        return context
