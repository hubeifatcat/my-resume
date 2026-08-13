import asyncio

from .rag import ensure_collection, upsert_documents
from .seed import SEED_DOCUMENTS


def chunk_text(text: str, size: int = 500, overlap: int = 60) -> list[str]:
    """按固定窗口切块，带少量重叠，避免把语义切断。"""
    if len(text) <= size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start : start + size])
        start += size - overlap
    return chunks


async def main() -> None:
    count = await ingest_all()
    print(f"INGEST_OK docs={count}")


async def ingest_all() -> int:
    await ensure_collection()
    docs = []
    doc_id = 0
    for seed in SEED_DOCUMENTS:
        for chunk in chunk_text(seed["text"]):
            docs.append({"id": doc_id, "text": chunk, "source": seed["source"]})
            doc_id += 1
    await upsert_documents(docs)
    return len(docs)


if __name__ == "__main__":
    asyncio.run(main())
