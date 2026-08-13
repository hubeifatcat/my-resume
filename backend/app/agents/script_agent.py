from ..agents.base import BaseAgent
from ..llm import chat_completion


class ScriptAgent(BaseAgent):
    name = "script_agent"

    async def run(self, message, blackboard, trace):
        system = (
            "你是一个资深运维脚本生成器。只输出可直接运行的脚本，包含必要的注释和参数校验。"
            "如果需求不明确，给出一个通用安全的默认实现。"
        )
        script = None
        try:
            script = await chat_completion(system, message, max_tokens=1200)
        except Exception:
            script = (
                "#!/bin/bash\n"
                "# 通用磁盘巡检脚本（演示）\n"
                "df -h\n"
                "echo '---'\n"
                "top -bn1 | head -15\n"
            )
        trace.add_step(self.name, "generate_script", message, "已生成脚本", latency_ms=0)
        blackboard.set("script_output", script, self.name)
        return script
