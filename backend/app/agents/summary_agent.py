from ..agents.base import BaseAgent
from ..llm import chat_completion


class SummaryAgent(BaseAgent):
    name = "summary_agent"

    async def run(self, message, blackboard, trace):
        parts = []
        knowledge = blackboard.get("knowledge_hits", [])
        if knowledge:
            ctx = "\n".join([f"- [来源：{h.get('source', '')}] {h.get('text', '')}" for h in knowledge[:5]])
            parts.append(f"知识库资料：\n{ctx}")
        log_analysis = blackboard.get("log_analysis")
        if log_analysis:
            parts.append(f"日志分析：\n{log_analysis}")
        script = blackboard.get("script_output")
        if script:
            parts.append(f"生成脚本：\n{script}")

        context = "\n\n".join(parts) if parts else "没有检索到相关资料。"
        system = (
            "你是多智能体系统中的汇总回答 Agent。请综合黑板中的资料，给出结构清晰、中文、"
            "不编造的回答。涉及武渭星本人的经历时只依据资料回答。"
        )
        final_answer = None
        try:
            final_answer = await chat_completion(system, f"用户问题：{message}\n\n{context}", max_tokens=1200)
        except Exception:
            final_answer = "多智能体链路已执行完成，但大模型暂不可用，以下是中间结果：\n\n" + context[:800]
        trace.add_step(self.name, "summarize", message, "已生成最终回答", latency_ms=0)
        blackboard.set("final_answer", final_answer, self.name)
        return final_answer
