import os

import httpx

# DashScope 兼容 OpenAI 的 /embeddings 接口；可自定义工作空间 Base URL
DEFAULT_BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1"


def _base_url() -> str:
    return os.getenv("DASHSCOPE_BASE_URL", DEFAULT_BASE).rstrip("/")


def _api_key() -> str:
    key = os.getenv("DASHSCOPE_API_KEY", "")
    if not key:
        raise RuntimeError("DASHSCOPE_API_KEY not set")
    return key


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """批量向量化，返回和输入顺序一致的向量列表。"""
    url = _base_url() + "/embeddings"
    headers = {
        "Authorization": f"Bearer {_api_key()}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": os.getenv("DASHSCOPE_EMBEDDING_MODEL", "text-embedding-v4"),
        "input": texts,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        data["data"].sort(key=lambda x: x["index"])
        return [item["embedding"] for item in data["data"]]


async def embed_query(text: str) -> list[float]:
    return (await embed_texts([text]))[0]
