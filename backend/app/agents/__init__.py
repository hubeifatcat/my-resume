from .knowledge_agent import KnowledgeAgent
from .log_agent import LogAgent
from .script_agent import ScriptAgent
from .summary_agent import SummaryAgent

knowledge_agent = KnowledgeAgent()
log_agent = LogAgent()
script_agent = ScriptAgent()
summary_agent = SummaryAgent()

AGENT_REGISTRY = {
    "knowledge_agent": knowledge_agent,
    "log_agent": log_agent,
    "script_agent": script_agent,
    "summary_agent": summary_agent,
}

AGENT_META = [
    {"id": "knowledge_agent", "name": "知识检索 Agent", "desc": "检索简历与运维知识库，返回带来源的参考片段"},
    {"id": "log_agent", "name": "日志分析 Agent", "desc": "解析故障/日志类问题，输出演示日志摘要与定位建议"},
    {"id": "script_agent", "name": "脚本生成 Agent", "desc": "生成 Shell/Python 巡检与运维脚本"},
    {"id": "summary_agent", "name": "汇总回答 Agent", "desc": "汇总黑板结果，生成最终中文回答"},
]
