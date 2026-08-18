"""RuntimeHarness：统一编排多智能体会话生命周期。"""

import time
import uuid

from .agents import AGENT_REGISTRY, AGENT_META
from .blackboard import Blackboard
from .router import route
from .trace import Trace, trace_store


class RuntimeHarness:
    async def handle(self, message, skills=None, tools=None, conversation_id=None, on_step=None):
        conv_id = conversation_id or uuid.uuid4().hex
        trace = Trace(conversation_id=conv_id)
        blackboard = Blackboard()

        start = time.time()
        decision = route(message)
        latency = int((time.time() - start) * 1000)
        trace.intent = decision["intent"]
        blackboard.set("mode", decision["intent"], "router")
        trace.add_step(
            "router",
            "intent_route",
            message,
            decision["intent"],
            latency_ms=latency,
        )
        if on_step:
            await on_step(trace.steps[-1])

        agents = []
        for agent_id in decision["chain"]:
            agent = AGENT_REGISTRY.get(agent_id)
            if not agent:
                continue
            t0 = time.time()
            result = await agent.run(message, blackboard, trace)
            trace.set_last_latency(int((time.time() - t0) * 1000))
            agents.append(agent.name)
            if on_step:
                await on_step(trace.steps[-1])
            _ = result

        final_answer = blackboard.get("final_answer") or "多智能体链路已执行，但没有生成回答。"
        trace.blackboard_keys = blackboard.keys()
        trace_store.save(trace)

        return {
            "answer": final_answer,
            "conversation_id": conv_id,
            "mode": "multi-agent",
            "agents": ["router"] + agents,
            "trace": trace.to_dict(),
            "blackboard": blackboard.snapshot(),
        }


harness = RuntimeHarness()
