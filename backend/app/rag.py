import os

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from .embedding import embed_query, embed_texts

COLLECTION = "wuxing_kb"
DIM = int(os.getenv("EMBEDDING_DIM", "1024"))


async def get_client() -> AsyncQdrantClient:
    return AsyncQdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))


async def ensure_collection() -> None:
    """向量库不存在时自动创建。"""
    client = await get_client()
    exists = await client.collection_exists(COLLECTION)
    if not exists:
        await client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=DIM, distance=Distance.COSINE),
        )
    await client.close()


async def upsert_documents(docs: list[dict]) -> None:
    """docs: [{id, text, source}]，先向量化再写入 Qdrant。"""
    client = await get_client()
    vectors = await embed_texts([d["text"] for d in docs])
    points = [
        PointStruct(
            id=d["id"],
            vector=v,
            payload={"text": d["text"], "source": d.get("source", "")},
        )
        for d, v in zip(docs, vectors)
    ]
    await client.upsert(collection_name=COLLECTION, points=points)
    await client.close()


async def search(query: str, top_k: int = 5) -> list[tuple[str, float]]:
    """把问题向量化后在向量库检索，返回 (文本, 分数) 列表。"""
    client = await get_client()
    vector = await embed_query(query)
    result = await client.search(
        collection_name=COLLECTION,
        query_vector=vector,
        limit=top_k,
    )
    await client.close()
    return [(p.payload.get("text", ""), p.score) for p in result]


def rag_enabled() -> bool:
    return os.getenv("RAG_ENABLED", "false").lower() in ("1", "true", "yes")
