class BaseAgent:
    name = "base"
    description = ""

    async def run(self, message, blackboard, trace):
        raise NotImplementedError
