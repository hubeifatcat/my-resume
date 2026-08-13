from ..agents.base import BaseAgent


DEMO_LOGS = [
    "2026-08-12 09:01:22 ERROR nacos-client: connection timeout to 10.0.0.8:8848",
    "2026-08-12 09:01:25 WARN nacos-client: retry connect, attempt 2",
    "2026-08-12 09:01:40 ERROR gateway: upstream request timeout /api/chat",
    "2026-08-12 09:02:01 INFO nginx: client closed connection before receiving response",
]


class LogAgent(BaseAgent):
    name = "log_agent"

    async def run(self, message, blackboard, trace):
        matched = [line for line in DEMO_LOGS if any(k in line.lower() for k in ["error", "timeout", "warn"])]
        if not matched:
            matched = DEMO_LOGS[:2]
        summary = (
            "演示日志摘要：\n"
            + "\n".join(f"- {line}" for line in matched)
            + "\n\n建议：先确认 Nacos/目标服务端口连通性，再看安全组；"
            "Timeout 通常指向地址/端口问题，Socket out 通常指向安全组问题。"
        )
        trace.add_step(self.name, "analyze_logs", message, f"解析 {len(matched)} 条日志", latency_ms=0)
        blackboard.set("log_analysis", summary, self.name)
        return summary
