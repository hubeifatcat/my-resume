import os
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .knowledge import SKILLS, MCP_TOOLS, answer_question
from .llm import llm_enabled, ask_llm
from .rag import rag_enabled, search

# FastAPI 应用入口：对外暴露聊天、工具列表、健康检查三个接口。
app = FastAPI(title="Wuxing Resume AI API", version="1.0.0")

# 允许跨域的前端来源：GitHub Pages 正式域名 + 本地开发地址。
# 浏览器跨域时，后端必须在响应头里放行来源，否则前端 fetch 会被拦截。
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
    # 请求结构要和前端 Chat.jsx 发送的内容对齐
    message: str
    conversation_id: str | None = None
    visitor_name: str | None = None
    skills: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    # 统一返回 answer，前端只解析这一个字段
    answer: str
    conversation_id: str
    mode: str


@app.get("/api/health")
def health():
    # 部署后先用这个接口确认服务存活
    return {"status": "ok"}


@app.get("/api/tools")
def tools():
    # 返回 SKILL / MCP 工具列表，前端侧栏可动态加载
    return {"skills": SKILLS, "mcp_tools": MCP_TOOLS}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # 会话 ID：前端没传就新开一个，传了就沿用，方便后续做多轮记忆
    conv_id = req.conversation_id or uuid.uuid4().hex
    # 优先走大模型；任何异常都回退到内置知识库，保证接口不挂
    if llm_enabled():
        try:
            context = ""
            if rag_enabled():
                try:
                    hits = await search(req.message, top_k=int(os.getenv("RAG_TOP_K", "5")))
                    context = "\n".join([f"- {text}" for text, _score in hits])
                except Exception:
                    # 检索失败不影响对话，继续走无上下文的 LLM
                    context = ""
            answer = await ask_llm(req.message, req.skills, req.tools, context)
            return ChatResponse(answer=answer, conversation_id=conv_id, mode="llm")
        except Exception:
            pass
    # 兜底：用武渭星简历知识库做关键词匹配
    return ChatResponse(
        answer=answer_question(req.message),
        conversation_id=conv_id,
        mode="knowledge",
    )
