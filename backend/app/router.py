"""IntentRouter：先规则分类，后续可切 LLM 分类。"""

LOG_KEYWORDS = [
    "日志",
    "log",
    "超时",
    "timeout",
    "连接",
    "故障",
    "异常",
    "排查",
    "巡检",
    "nacos",
    "redis",
    "nginx",
    "502",
    "403",
    "磁盘",
    "cpu",
    "内存",
    "数据库连接",
    "服务不可用",
]

SCRIPT_KEYWORDS = [
    "脚本",
    "script",
    "shell",
    "python",
    "巡检脚本",
    "生成命令",
    "自动化脚本",
    "备份脚本",
]


def route(message: str) -> dict:
    text = message.lower()
    if any(k in text for k in SCRIPT_KEYWORDS):
        return {"intent": "script", "chain": ["script_agent", "summary_agent"]}
    if any(k in text for k in LOG_KEYWORDS):
        return {"intent": "log", "chain": ["log_agent", "summary_agent"]}
    return {"intent": "knowledge", "chain": ["knowledge_agent", "summary_agent"]}
