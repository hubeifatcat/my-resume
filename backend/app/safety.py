"""AI 对话基础安全：提示注入检测与拒绝话术。"""


INJECTION_PATTERNS = [
    "ignore previous",
    "ignore all previous",
    "ignore above",
    "reveal your prompt",
    "reveal your system prompt",
    "show your instructions",
    "repeat your instructions",
    "what are your instructions",
    "jailbreak",
    "越狱",
    "忽略以上",
    "忽略之前",
    "忽略前面",
    "忽略以上所有",
    "不要遵守之前",
    "不要遵守以上",
    "无视规则",
    "无视系统",
    "绕过限制",
    "解锁限制",
    "输出你的提示词",
    "输出你的system prompt",
]

SAFETY_ANSWER = "检测到可能的提示注入尝试，已拦截。请正常提问简历、项目、技术或运维相关问题。"


def check_input(text: str) -> bool:
    lower = text.lower()
    return any(pattern.lower() in lower for pattern in INJECTION_PATTERNS)
