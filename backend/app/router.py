"""IntentRouter：先规则分类，后续可切 LLM 分类。

路由设计（2026-08-18 优化）：
- 个人简历问题 → knowledge_agent + summary_agent（强制依据知识库，防编造）
- 脚本/日志/故障类 → 专用 agent + summary
- 其他通用/技术问题 → 直接 summary_agent（DeepSeek 自由回答，跳过知识检索，效果更好）
"""

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

# 问武渭星本人的问题：必须依据知识库回答，防止编造个人信息
PERSONAL_KEYWORDS = [
    "武渭星",
    "你的经历",
    "你的项目",
    "你的简历",
    "你的技能",
    "你的工作",
    "你的联系方式",
    "你的电话",
    "你的邮箱",
    "你的微信",
    "你是谁",
    "你做过什么",
    "你做过哪些",
    "你的背景",
    "你叫什么",
    "介绍一下你",
    "你的公司",
    "你负责",
    "你的优势",
    "你的证书",
    "你的教育",
    "你的学校",
    "你的github",
    "github",
]


def route(message: str) -> dict:
    text = message.lower()
    # 脚本类优先（"生成一个脚本" 里同时含个人关键词时以明确指令为准）
    if any(k in text for k in SCRIPT_KEYWORDS):
        return {"intent": "script", "chain": ["script_agent", "summary_agent"]}
    if any(k in text for k in LOG_KEYWORDS):
        return {"intent": "log", "chain": ["log_agent", "summary_agent"]}
    if any(k in text for k in PERSONAL_KEYWORDS):
        return {"intent": "personal", "chain": ["knowledge_agent", "summary_agent"]}
    # 通用/技术问题：直接问 DeepSeek，不检索知识库
    return {"intent": "general", "chain": ["summary_agent"]}
