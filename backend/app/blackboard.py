"""Blackboard：Agent 之间共享中间结果并记录写入序列。"""


class Blackboard:
    def __init__(self):
        self._data = {}
        self._sequence = []

    def set(self, key, value, agent_name="system"):
        self._data[key] = value
        self._sequence.append({"agent": agent_name, "key": key})

    def get(self, key, default=None):
        return self._data.get(key, default)

    def keys(self):
        return list(self._data.keys())

    def snapshot(self, max_len=240):
        out = {}
        for key, value in self._data.items():
            if isinstance(value, str) and len(value) > max_len:
                out[key] = value[:max_len] + "..."
            elif isinstance(value, list):
                out[key] = f"[{len(value)} items]"
            else:
                out[key] = value
        return out

    def sequence(self):
        return list(self._sequence)
