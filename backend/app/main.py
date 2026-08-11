import os
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .knowledge import SKILLS, MCP_TOOLS, answer_question
from .llm import llm_enabled, ask_llm

app = FastAPI(title="Wuxing Resume AI API", version="1.0.0")

origins = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "https://hubeifatcat.github.io,http://localhost:5173,http://127.0.0.1:4173",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    visitor_name: str | None = None
    skills: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    mode: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/tools")
def tools():
    return {"skills": SKILLS, "mcp_tools": MCP_TOOLS}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    conv_id = req.conversation_id or uuid.uuid4().hex
    if llm_enabled():
        try:
            answer = await ask_llm(req.message, req.skills, req.tools)
            return ChatResponse(answer=answer, conversation_id=conv_id, mode="llm")
        except Exception:
            pass
    return ChatResponse(
        answer=answer_question(req.message),
        conversation_id=conv_id,
        mode="knowledge",
    )
