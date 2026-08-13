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
            "你是多智能体系统中的汇总回答 Agent，请给出结构清晰、中文、不编造的回答。\n"
            "规则：\n"
            "1. 只有用户明确询问武渭星个人（工作经历、项目、技能、联系方式）时，才以个人资料为主回答。\n"
            "2. 如果问题与技术、通用知识相关，即使检索结果里包含个人简历片段，也不要反复引用简历内容，优先使用与问题直接相关的资料。\n"
            "3. 检索结果与问题无关时，直接忽略，不要硬套。\n"
            "4. 检索不到相关资料时，可以结合自身知识给出通用回答，不要只说“找不到资料”。\n"
            "5. 涉及武渭星本人信息时，必须依据资料，不编造。"
        )
        final_answer = None
        try:
            final_answer = await chat_completion(system, f"用户问题：{message}\n\n{context}", max_tokens=1200)
        except Exception:
            final_answer = "多智能体链路已执行完成，但大模型暂不可用，以下是中间结果：\n\n" + context[:800]
        trace.add_step(self.name, "summarize", message, "已生成最终回答", latency_ms=0)
        blackboard.set("final_answer", final_answer, self.name)
        return final_answer
