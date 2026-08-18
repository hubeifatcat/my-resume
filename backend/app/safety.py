"""AI 对话基础安全：提示注入检测与拒绝话术。

2026-08-18 加固：
- 黑名单扩充（覆盖同义改写/口语化提取等漏网词）
- check_input 改为规范化匹配：去空格/标点/大小写后再查，堵住"忽 略 以 上"、引号混淆等变体
"""

import re

INJECTION_PATTERNS = [
    # 英文：忽略/越狱
    "ignore previous",
    "ignore all previous",
    "ignore above",
    "ignore earlier",
    "ignore your instructions",
    "ignore the instructions",
    "ignore prior",
    "disregard previous",
    "forget previous",
    "forget your instructions",
    "forget your system",
    "forget all instructions",
    "jailbreak",
    "jail break",
    "you are now",
    "act as if",
    "do anything now",
    "unlimited mode",
    "dan mode",
    # 英文：提取系统提示
    "reveal your prompt",
    "reveal your system prompt",
    "reveal your instructions",
    "reveal system prompt",
    "show your prompt",
    "show your instructions",
    "show your system",
    "show system prompt",
    "repeat your instructions",
    "repeat your system prompt",
    "repeat your prompt",
    "repeat the instructions",
    "repeat the system prompt",
    "repeat your system",
    "repeat your rules",
    "say your prompt",
    "say your system prompt",
    "say your instructions",
    "tell me your prompt",
    "tell me your system prompt",
    "tell me your instructions",
    "tell me your system",
    "tell me your rules",
    "what are your instructions",
    "what is your system prompt",
    "whats your system prompt",
    "what are your rules",
    "what is your prompt",
    "print your prompt",
    "print your system prompt",
    "print your instructions",
    "output your prompt",
    "output your system prompt",
    "output your instructions",
    "your system prompt is",
    "your instructions are",
    "your rules are",
    "initial prompt",
    "initial instructions",
    "original instructions",
    "original prompt",
    "system prompt",
    "你的提示词",
    "你的指令",
    "你的规则",
    "系统提示",
    "系统提示词",
    "底层指令",
    "初始化内容",
    "复述你的",
    "复述你的规则",
    "复述你的指令",
    "复述你的提示",
    "输出你的提示词",
    "输出你的system prompt",
    "输出你的系统提示",
    "告诉我你的提示词",
    "告诉我你的系统提示",
    "告诉我你的指令",
    "你的system prompt",
    # 中文：忽略/越狱
    "越狱",
    "忽略以上",
    "忽略之前",
    "忽略前面",
    "忽略以上所有",
    "忽略之前所有",
    "忽略之前指令",
    "忽略以上指令",
    "忽略所有指令",
    "忽略之前设定",
    "忽略以上设定",
    "不要遵守之前",
    "不要遵守以上",
    "不要遵守前面",
    "不要理会之前",
    "不要理会以上",
    "不要理会前面的",
    "无视规则",
    "无视系统",
    "无视以上",
    "无视之前",
    "无视你的指令",
    "无视你的规则",
    "绕过限制",
    "解锁限制",
    "摆脱限制",
    "解除限制",
    "忘掉之前",
    "忘掉你之前",
    "忘记之前",
    "忘记你之前",
    "忘记你的指令",
    "忘记你的规则",
    "忘记你的设定",
    "忘掉你的设定",
    "忘掉你的指令",
    "忘掉你的规则",
    "无视你之前的",
    "不要管之前",
    "不要管你的",
    "清除之前",
    "清除所有指令",
    "重新设定",
    "重置你的指令",
    "你现在是",
    "假装你是",
    "扮演一个",
    "你是没有限制",
    "没有任何限制",
    "不受任何限制",
    "没有规则的",
    "允许做任何事",
    "可以调用任何工具",
    "执行任意命令",
    "渗透测试",
    "授权测试",
    "安全测试请",
    # 提取：中文口语化
    "复述系统",
    "复述系统提示",
    "复述系统指令",
    "背给我听",
    "原封不动",
    "一字不差",
    "逐字输出",
    "逐字复述",
    # 深层语义绕过（尽力覆盖）
    "初始化时",
    "初始化内容",
    "初始设置",
    "底层配置",
    "调用任意工具",
    "执行任意命令",
    "执行任意操作",
    "查看你的系统配置",
    "查看系统配置",
    "访问你的配置",
]

SAFETY_ANSWER = "检测到可能的提示注入尝试，已拦截。请正常提问简历、项目、技术或运维相关问题。"

# 规范化：小写 + 去所有空白/标点/引号，堵住变体
_NORMALIZE_RE = re.compile(r"[\s\u200b\u00a0，。、；：！？「」『』“”‘’\"'`.,;:!?()\[\]{}<>|/\\\-—_=+*&^%$#@~]+")


def _normalize(text: str) -> str:
    return _NORMALIZE_RE.sub("", text.lower())


def check_input(text: str) -> bool:
    """规范化后做子串匹配；同时保留原文直接匹配（覆盖原文即可命中的情况）。"""
    lower = text.lower()
    normalized = _normalize(text)
    for pattern in INJECTION_PATTERNS:
        p_lower = pattern.lower()
        if p_lower in lower:
            return True
        if _normalize(pattern) in normalized:
            return True
    return False
