import os

import httpx

from .knowledge import SKILLS, MCP_TOOLS


# 通过环境变量决定是否启用大模型；默认 knowledge 表示只用内置知识库
def llm_enabled() -> bool:
    return os.getenv("LLM_PROVIDER", "knowledge").lower() in ("ollama", "dashscope", "deepseek")


def build_system_prompt(skills, tools, context: str = "") -> str:
    # system prompt 用来约束“人设”：回答只基于武渭星的真实经历
    skill_names = ", ".join(skills) if skills else "全部"
    tool_names = ", ".join(tools) if tools else "全部"
    prompt = (
        "你是武渭星个人简历网站的 AI 运维助手。只能基于武渭星的真实经历回答，不要编造。\n"
        "武渭星：3 年政企 SaaS 实施交付与运维经验，驻场国网信产项目，熟悉阿里云、Docker/K8s、"
        "Nacos/Redis/Nginx、DataWorks、Oracle/MySQL；AI 辅助运维已落地（故障定位 10min→1min，"
        "脚本效率 +40%，报告效率 +50%）；电话 19054750791，邮箱 18335357090@163.com，微信 wwx-_-168。\n"
        f"本次对话允许使用的 Skill：{skill_names}\n"
        f"本次对话允许使用的 MCP 工具：{tool_names}\n"
    )
    if context:
        prompt += "\n以下是检索到的参考资料，优先依据它们回答：\n" + context
    prompt += "\n回答保持简洁、用中文，不确定的内容明确说明。"
    return prompt


async def ask_llm(message: str, skills, tools, context: str = "") -> str:
    provider = os.getenv("LLM_PROVIDER", "knowledge").lower()
    # Ollama / DashScope / DeepSeek 都兼容 OpenAI 的 chat/completions 格式，只差地址和鉴权头
    if provider == "ollama":
        base = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434").rstrip("/")
        url = base + "/v1/chat/completions"
        model = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
        headers = {"Content-Type": "application/json"}
    elif provider == "dashscope":
        url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
        model = os.getenv("DASHSCOPE_MODEL", "qwen-plus")
        api_key = os.getenv("DASHSCOPE_API_KEY", "")
        if not api_key:
            raise RuntimeError("DASHSCOPE_API_KEY not set")
        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}
    else:
        base = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
        url = base + "/chat/completions"
        model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        if not api_key:
            raise RuntimeError("DEEPSEEK_API_KEY not set")
        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": build_system_prompt(skills, tools, context)},
            {"role": "user", "content": message},
        ],
        "temperature": 0.4,
        "max_tokens": 800,
    }
    # 30 秒超时；调用失败会抛异常，由 main.py 统一回退到知识库
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        # OpenAI 兼容响应结构：choices[0].message.content
        return data["choices"][0]["message"]["content"].strip()
