import re

from .seed import SEED_DOCUMENTS


def _tokenize(text: str) -> list[str]:
    # 英文/数字按词切，中文按单个汉字切，避免整串中文被当成一个词
    return re.findall(r"[a-z0-9_]+|[\u4e00-\u9fff]", text.lower())


def chunk_text(text: str, size: int = 500, overlap: int = 60) -> list[str]:
    if len(text) <= size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start : start + size])
        start += size - overlap
    return chunks


# 模块启动时把种子文档切成块，关键词检索直接在这里查，不依赖向量库
CHUNKS = []
for _i, seed in enumerate(SEED_DOCUMENTS):
    for chunk in chunk_text(seed["text"]):
        CHUNKS.append({"text": chunk, "source": seed["source"]})


def keyword_search(query: str, top_k: int = 5) -> list[dict]:
    """简单 BM25 风格的关键词检索：按词重叠打分，返回最相关的文本块（含来源与得分）。"""
    q_tokens = set(_tokenize(query))
    scored = []
    for item in CHUNKS:
        tokens = _tokenize(item["text"])
        score = sum(1 for t in q_tokens if t in tokens)
        if score > 0:
            scored.append((score, item))
    scored.sort(key=lambda x: -x[0])
    out = []
    for score, item in scored[:top_k]:
        out.append({"text": item["text"], "source": item["source"], "score": score})
    return out
