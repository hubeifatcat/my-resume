import asyncio
import hashlib
import json
import logging
import os
import re
import time
import uuid

from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .agents import AGENT_META
from .auth import (
    create_access_token,
    create_refresh_token,
    get_current_admin,
    get_current_user,
    get_current_user_optional,
    hash_password,
    verify_password,
)
from .db import (
    WORKBENCH_MODULES,
    add_audit_log,
    bump_token_version,
    count_all_conversations,
    count_announcements,
    count_audit_logs,
    count_users,
    create_announcement,
    create_user,
    create_workbench_item,
    delete_announcement,
    delete_any_conversation,
    delete_conversation,
    delete_user,
    delete_workbench_item,
    ensure_admin,
    get_announcement,
    get_any_conversation,
    get_conversation,
    get_guest_chat_usage,
    get_refresh_token,
    get_user_by_id,
    get_user_by_username,
    get_user_chat_usage,
    get_workbench_item,
    hard_delete_user,
    increment_guest_chat_usage,
    increment_user_chat_usage,
    init_db,
    list_all_conversations,
    list_announcements,
    list_audit_logs,
    list_conversations,
    list_users,
    list_workbench,
    lock_user,
    reset_login_failures,
    reset_user_password,
    reset_user_chat_usage,
    revoke_refresh_token,
    revoke_user_refresh_tokens,
    save_conversation,
    save_refresh_token,
    seed_workbench,
    update_announcement,
    update_login_failure,
    update_user_role,
    update_workbench_item,
)
from .harness import harness
from .ingest import ingest_all
from .knowledge import MCP_TOOLS, SKILLS, answer_question
from .models import (
    ChatRequest,
    ChatResponse,
    LoginRequest,
    RegisterRequest,
    UserOut,
)
from .rag import COLLECTION, get_client
from .ratelimit import limiter
from .safety import SAFETY_ANSWER, check_input
from .seed import SEED_DOCUMENTS
from .trace import trace_store

init_db()
ensure_admin(os.getenv("ADMIN_USERNAME", ""))

app = FastAPI(
    title="Wuxing Multi-Agent API",
    version="2.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
access_logger = logging.getLogger("wuxing.access")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; connect-src 'self' https://api.liumingqing.com; "
            "font-src 'self' data:; frame-ancestors 'none'"
        )
        return response


class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.time()
        response = await call_next(request)
        latency_ms = int((time.time() - start) * 1000)
        ip = (
            request.headers.get("x-forwarded-for", "").split(",")[0].strip()
            or (request.client.host if request.client else "")
        )
        access_logger.info(
            json.dumps(
                {
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "ip": ip,
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "latency_ms": latency_ms,
                },
                ensure_ascii=False,
            )
        )
        return response

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
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLogMiddleware)


def _rate_limit(key: str, limit: int, window: int = 60):
    if not limiter.check(key, limit, window):
        raise HTTPException(status_code=429, detail="too many requests")


def _validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="password must be at least 8 characters")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="password must contain both letters and digits")


@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "multi-agent"}


@app.get("/api/tools")
def tools():
    return {"skills": SKILLS, "mcp_tools": MCP_TOOLS}


@app.get("/api/agents")
def agents():
    return {"agents": AGENT_META}


@app.post("/api/auth/register")
def register(req: RegisterRequest):
    _rate_limit("register:" + req.username, limit=10)
    username = req.username.strip()
    if not username.isalnum() and "_" not in username:
        raise HTTPException(status_code=400, detail="username only allows letters, digits and underscore")
    _validate_password(req.password)
    if get_user_by_username(username):
        raise HTTPException(status_code=400, detail="username already exists")
    user = create_user(username, req.email, hash_password(req.password))
    access_token = create_access_token(user)
    refresh_token, refresh_hash = create_refresh_token(user)
    expires_in = int(os.getenv("JWT_ACCESS_EXPIRE_SECONDS", "3600"))
    save_refresh_token(
        user["id"],
        refresh_hash,
        time.time() + int(os.getenv("JWT_EXPIRE_SECONDS", "604800")),
    )
    _audit(user, "register", "users", str(user["id"]), {"username": username})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": expires_in,
        "user": UserOut(**user),
    }


@app.post("/api/auth/login")
def login(req: LoginRequest):
    _rate_limit("login:" + req.username, limit=10)
    user = get_user_by_username(req.username.strip())
    if user and user.get("deleted"):
        raise HTTPException(status_code=401, detail="account deleted")
    if user and user.get("locked_until") and time.time() < user["locked_until"]:
        remain = int(user["locked_until"] - time.time())
        raise HTTPException(status_code=429, detail=f"account locked, retry in {remain}s")
    if not user or not verify_password(req.password, user["password_hash"]):
        if user:
            attempts = update_login_failure(user["id"])
            if attempts >= int(os.getenv("LOGIN_MAX_ATTEMPTS", "5")):
                lock_user(user["id"], time.time() + int(os.getenv("LOGIN_LOCK_SECONDS", "900")))
                _audit(user, "login_locked", "users", str(user["id"]))
        _audit(user or {"id": None, "username": req.username}, "login_failed", "users")
        raise HTTPException(status_code=401, detail="invalid username or password")
    reset_login_failures(user["id"])
    access_token = create_access_token(user)
    refresh_token, refresh_hash = create_refresh_token(user)
    expires_in = int(os.getenv("JWT_ACCESS_EXPIRE_SECONDS", "3600"))
    save_refresh_token(
        user["id"],
        refresh_hash,
        time.time() + int(os.getenv("JWT_EXPIRE_SECONDS", "604800")),
    )
    _audit(user, "login", "users", str(user["id"]))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": expires_in,
        "user": {"id": user["id"], "username": user["username"], "email": user["email"] or "", "role": user.get("role", "user")},
    }


@app.get("/api/auth/me", response_model=UserOut)
def me(user: dict = Depends(get_current_user)):
    return UserOut(
        id=user["id"],
        username=user["username"],
        role=user.get("role", "user"),
    )


@app.post("/api/auth/refresh")
def refresh(body: dict):
    raw = (body.get("refresh_token") or "").strip()
    if not raw:
        raise HTTPException(status_code=401, detail="refresh token required")
    token_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    stored = get_refresh_token(token_hash)
    if not stored or stored.get("revoked") or stored.get("expires_at", 0) < time.time():
        raise HTTPException(status_code=401, detail="invalid refresh token")
    user = get_user_by_id(stored["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    revoke_refresh_token(token_hash)
    new_access = create_access_token(user)
    new_refresh, new_hash = create_refresh_token(user)
    save_refresh_token(
        user["id"],
        new_hash,
        time.time() + int(os.getenv("JWT_EXPIRE_SECONDS", "604800")),
    )
    _audit(user, "refresh", "users", str(user["id"]))
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "expires_in": int(os.getenv("JWT_ACCESS_EXPIRE_SECONDS", "3600")),
    }


@app.post("/api/auth/logout")
def logout(body: dict):
    raw = (body.get("refresh_token") or "").strip()
    if raw:
        token_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        revoke_refresh_token(token_hash)
    return {"ok": True}


@app.get("/api/trace/{conversation_id}")
def get_trace(conversation_id: str):
    trace = trace_store.get(conversation_id)
    if not trace:
        raise HTTPException(status_code=404, detail="trace not found")
    return trace


@app.get("/api/conversations")
def conversations(user: dict = Depends(get_current_user)):
    return {"conversations": list_conversations(user["id"])}


@app.get("/api/conversations/{conversation_id}")
def conversation_detail(conversation_id: str, user: dict = Depends(get_current_user)):
    item = get_conversation(user["id"], conversation_id)
    if not item:
        raise HTTPException(status_code=404, detail="conversation not found")
    return item


@app.delete("/api/conversations/{conversation_id}")
def conversation_delete(conversation_id: str, user: dict = Depends(get_current_user)):
    ok = delete_conversation(user["id"], conversation_id)
    if not ok:
        raise HTTPException(status_code=404, detail="conversation not found")
    return {"deleted": True}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request, user: dict | None = Depends(get_current_user_optional)):
    ok = await asyncio.to_thread(limiter.check, f"chat:{user.get('id') if user else 'anonymous'}", 20, 60)
    if not ok:
        raise HTTPException(status_code=429, detail="too many requests")
    ip = _client_ip(request)
    quota = _quota_info(user, ip)
    if _quota_exceeded(quota):
        raise HTTPException(status_code=403, detail="提问次数已用完，请登录后继续（游客 2 次 / 注册用户 5 次）")
    conv_id = req.conversation_id or uuid.uuid4().hex
    if check_input(req.message):
        result = {
            "answer": SAFETY_ANSWER,
            "conversation_id": conv_id,
            "mode": "safety",
            "agents": [],
            "trace": {},
            "blackboard": {},
        }
        _audit(user or {"id": None, "username": "anonymous"}, "chat_blocked", "chat", conv_id)
    else:
        task_parsed = _parse_task_add(req.message)
        if task_parsed is not None:
            matched, task_title = task_parsed
            if matched and not user:
                result = {
                    "answer": "添加任务需要先登录账号。请登录后再对我说『添加任务：任务内容』，我会把它记入你的工作台。",
                    "conversation_id": conv_id,
                    "mode": "task_login_required",
                    "agents": [],
                    "trace": {},
                    "blackboard": {},
                }
            elif matched and not task_title:
                result = {
                    "answer": "收到，你想添加什么任务？请说『添加任务：任务内容』，例如『添加任务：明天上午部署验收』。",
                    "conversation_id": conv_id,
                    "mode": "task_ask_title",
                    "agents": [],
                    "trace": {},
                    "blackboard": {},
                }
            elif matched:
                item = create_workbench_item(user["id"], "tasks", task_title, "", "todo")
                _audit(user, "task_add_via_chat", "workbench", str(item["id"]), {"title": task_title})
                result = {
                    "answer": (
                        f"✅ 已把任务「{task_title}」添加到你的工作台（待办状态）。\n"
                        "可以到工作台的「任务」模块查看；对我说『开始处理』或到工作台点击「开始处理」推进进度。"
                    ),
                    "conversation_id": conv_id,
                    "mode": "task_add",
                    "agents": [],
                    "trace": {},
                    "blackboard": {},
                }
            else:
                result = await _run_harness(req.message, req.skills, req.tools, conv_id)
        else:
            result = await _run_harness(req.message, req.skills, req.tools, conv_id)

    if user:
        existing = get_conversation(user["id"], conv_id)
        messages = existing["messages"] if existing else []
        messages.append({"role": "user", "text": req.message})
        messages.append({"role": "bot", "text": result["answer"]})
        title = (existing or {}).get("title") or req.message[:24]
        save_conversation(
            user["id"],
            conv_id,
            title,
            messages,
            result.get("trace", {}),
        )

    _audit(
        user or {"id": None, "username": "anonymous"},
        "chat",
        "chat",
        conv_id,
        {"mode": result.get("mode", "")},
    )

    # 安全拦截/登录引导类回复不消耗配额
    if result.get("mode") not in ("safety", "task_login_required", "task_ask_title"):
        _consume_quota(user, ip)
        quota = _quota_info(user, ip)

    return ChatResponse(
        answer=result["answer"],
        conversation_id=conv_id,
        mode=result.get("mode", "multi-agent"),
        agents=result.get("agents", []),
        trace=result.get("trace", {}),
        blackboard=result.get("blackboard", {}),
        quota_remaining=quota["remaining"],
        quota_limit=quota["quota"],
        quota_used=quota["used"],
    )


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest, request: Request, user: dict | None = Depends(get_current_user_optional)):
    """SSE 流式对话：先推 Agent 执行步骤（stage），再逐块推回答（chunk），最后 done。"""
    ok = await asyncio.to_thread(limiter.check, f"chat:{user.get('id') if user else 'anonymous'}", 20, 60)
    if not ok:
        raise HTTPException(status_code=429, detail="too many requests")
    ip = _client_ip(request)
    quota = _quota_info(user, ip)
    if _quota_exceeded(quota):
        raise HTTPException(status_code=403, detail="提问次数已用完，请登录后继续（游客 2 次 / 注册用户 5 次）")
    conv_id = req.conversation_id or uuid.uuid4().hex

    async def event_stream():
        # 1. 安全检测
        if check_input(req.message):
            answer = SAFETY_ANSWER
            mode = "safety"
            agents: list = []
            trace: dict = {}
            blackboard: dict = {}
            _audit(user or {"id": None, "username": "anonymous"}, "chat_blocked", "chat", conv_id)
            yield {"type": "stage", "stage": {"seq": 1, "agent": "safety", "action": "input_check", "input": req.message, "output": "blocked", "status": "blocked", "latency_ms": 0}}
        else:
            task_parsed = _parse_task_add(req.message)
            if task_parsed is not None:
                matched, task_title = task_parsed
                if matched and not user:
                    answer = "添加任务需要先登录账号。请登录后再对我说『添加任务：任务内容』，我会把它记入你的工作台。"
                    mode = "task_login_required"
                    agents, trace, blackboard = [], {}, {}
                elif matched and not task_title:
                    answer = "收到，你想添加什么任务？请说『添加任务：任务内容』，例如『添加任务：明天上午部署验收』。"
                    mode = "task_ask_title"
                    agents, trace, blackboard = [], {}, {}
                elif matched:
                    item = create_workbench_item(user["id"], "tasks", task_title, "", "todo")
                    _audit(user, "task_add_via_chat", "workbench", str(item["id"]), {"title": task_title})
                    answer = (
                        f"✅ 已把任务「{task_title}」添加到你的工作台（待办状态）。\n"
                        "可以到工作台的「任务」模块查看；对我说『开始处理』或到工作台点击「开始处理」推进进度。"
                    )
                    mode = "task_add"
                    agents, trace, blackboard = [], {}, {}
                    yield {"type": "stage", "stage": {"seq": 1, "agent": "task_agent", "action": "create_task", "input": req.message, "output": f"created #{item['id']}", "status": "ok", "latency_ms": 0}}
                else:
                    result = await _run_harness(req.message, req.skills, req.tools, conv_id)
                    answer = result["answer"]
                    mode = result["mode"]
                    agents = result["agents"]
                    trace = result["trace"]
                    blackboard = result["blackboard"]
            else:
                # 多智能体链路：步骤通过回调逐步推送
                steps_queue = []
                async def on_step(step):
                    steps_queue.append(step)

                result = await harness.handle(req.message, req.skills, req.tools, conv_id, on_step=on_step)
                for step in steps_queue:
                    yield {"type": "stage", "stage": step}
                answer = result["answer"]
                mode = result["mode"]
                agents = result["agents"]
                trace = result["trace"]
                blackboard = result["blackboard"]

        # 2. 回答逐块推送（打字机效果）
        chunk_size = 12
        for i in range(0, len(answer), chunk_size):
            yield {"type": "chunk", "text": answer[i : i + chunk_size]}
            await asyncio.sleep(0.015)

        # 3. 结束事件（含完整元数据 + 配额）
        if mode not in ("safety", "task_login_required", "task_ask_title"):
            _consume_quota(user, ip)
            quota = _quota_info(user, ip)
        yield {
            "type": "done",
            "conversation_id": conv_id,
            "mode": mode,
            "agents": agents,
            "trace": trace,
            "blackboard": blackboard,
            "quota_remaining": quota["remaining"],
            "quota_limit": quota["quota"],
            "quota_used": quota["used"],
        }

        # 4. 登录用户保存会话
        if user:
            existing = get_conversation(user["id"], conv_id)
            messages = existing["messages"] if existing else []
            messages.append({"role": "user", "text": req.message})
            messages.append({"role": "bot", "text": answer})
            title = (existing or {}).get("title") or req.message[:24]
            save_conversation(user["id"], conv_id, title, messages, trace)

        _audit(
            user or {"id": None, "username": "anonymous"},
            "chat",
            "chat",
            conv_id,
            {"mode": mode},
        )

    async def sse():
        async for event in event_stream():
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        sse(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.get("/api/announcements")
def public_announcements():
    return {"announcements": list_announcements("published")}


@app.get("/api/quota")
def quota_info(request: Request, user: dict | None = Depends(get_current_user_optional)):
    """查询当前会话（游客按 IP / 登录用户）的提问配额。"""
    quota = _quota_info(user, _client_ip(request))
    return {
        "used": quota["used"],
        "limit": quota["quota"],
        "remaining": quota["remaining"],
        "is_admin": bool(user and user.get("role") == "admin"),
    }


@app.get("/api/workbench")
def workbench(user: dict = Depends(get_current_user)):
    items = list_workbench(user["id"])
    if not items:
        seed_workbench(user["id"])
        items = list_workbench(user["id"])
    grouped: dict[str, list] = {m: [] for m in WORKBENCH_MODULES}
    for item in items:
        grouped.setdefault(item["module"], []).append(item)
    return {"modules": grouped}


@app.post("/api/workbench")
def workbench_create(body: dict, user: dict = Depends(get_current_user)):
    module = (body.get("module") or "").strip()
    title = (body.get("title") or "").strip()
    if module not in WORKBENCH_MODULES:
        raise HTTPException(status_code=400, detail="invalid module")
    if not title:
        raise HTTPException(status_code=400, detail="title is required")
    meta = (body.get("meta") or "").strip()
    status = (body.get("status") or "").strip()
    sort_order = int(body.get("sort_order") or 0)
    item = create_workbench_item(user["id"], module, title, meta, status, sort_order)
    _audit(user, "workbench_create", "workbench", str(item["id"]), {"module": module, "title": title})
    return item


@app.patch("/api/workbench/{item_id}")
def workbench_update(item_id: int, body: dict, user: dict = Depends(get_current_user)):
    existing = get_workbench_item(item_id, user["id"])
    if not existing:
        raise HTTPException(status_code=404, detail="workbench item not found")
    title = (body.get("title") or existing["title"]).strip()
    if not title:
        raise HTTPException(status_code=400, detail="title is required")
    meta = (body.get("meta") if body.get("meta") is not None else existing["meta"]).strip()
    status = (body.get("status") if body.get("status") is not None else existing["status"]).strip()
    sort_order = int(body.get("sort_order") if body.get("sort_order") is not None else existing["sort_order"])
    if not update_workbench_item(item_id, user["id"], title, meta, status, sort_order):
        raise HTTPException(status_code=404, detail="workbench item not found")
    _audit(user, "workbench_update", "workbench", str(item_id), {"module": existing["module"], "title": title})
    return get_workbench_item(item_id, user["id"])


@app.delete("/api/workbench/{item_id}")
def workbench_delete(item_id: int, user: dict = Depends(get_current_user)):
    existing = get_workbench_item(item_id, user["id"])
    if not existing:
        raise HTTPException(status_code=404, detail="workbench item not found")
    delete_workbench_item(item_id, user["id"])
    _audit(user, "workbench_delete", "workbench", str(item_id), {"module": existing["module"]})
    return {"deleted": True, "id": item_id}


def _audit(user: dict, action: str, target_type: str = "", target_id: str = "", detail=None):
    add_audit_log(
        user.get("id"),
        user.get("username", ""),
        action,
        target_type,
        target_id,
        json.dumps(detail, ensure_ascii=False) if detail is not None else None,
    )


# ---------- 提问配额 ----------
GUEST_QUOTA = 2
USER_QUOTA = 5


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _quota_info(user: dict | None, ip: str) -> dict:
    """返回 {used, quota, remaining}；管理员不限制。"""
    if user and user.get("role") == "admin":
        return {"used": 0, "quota": -1, "remaining": -1}
    if user:
        usage = get_user_chat_usage(user["id"])
        used = usage["used"]
        quota = usage.get("quota") or USER_QUOTA
        return {"used": used, "quota": quota, "remaining": max(0, quota - used)}
    usage = get_guest_chat_usage(ip)
    used = usage["used"]
    return {"used": used, "quota": GUEST_QUOTA, "remaining": max(0, GUEST_QUOTA - used)}


def _quota_exceeded(quota: dict) -> bool:
    return quota["quota"] >= 0 and quota["remaining"] <= 0


def _consume_quota(user: dict | None, ip: str) -> None:
    if user:
        increment_user_chat_usage(user["id"])
    else:
        increment_guest_chat_usage(ip)


# 对话添加任务：识别「添加任务 / 新建任务 / 记个任务 / 加个待办」等表达
TASK_ADD_PATTERNS = [
    r"添加任务[：:\s]*([^\n]{0,80})",
    r"新建任务[：:\s]*([^\n]{0,80})",
    r"创建任务[：:\s]*([^\n]{0,80})",
    r"记(?:一个|个|一)?任务[：:\s]*([^\n]{0,80})",
    r"加(?:一个|个|一)?任务[：:\s]*([^\n]{0,80})",
    r"添加待办[：:\s]*([^\n]{0,80})",
    r"新建待办[：:\s]*([^\n]{0,80})",
    r"记(?:一个|个|一)?待办[：:\s]*([^\n]{0,80})",
]


def _parse_task_add(message: str) -> tuple | None:
    """返回 (matched, title)；matched=False 表示未命中任务添加意图。"""
    for pattern in TASK_ADD_PATTERNS:
        m = re.search(pattern, message.strip())
        if m:
            title = m.group(1).strip().strip("，。！？!?、,. ")
            return True, title
    return None


async def _run_harness(message: str, skills, tools, conv_id: str) -> dict:
    try:
        return await harness.handle(message, skills, tools, conv_id)
    except Exception:
        return {
            "answer": answer_question(message),
            "conversation_id": conv_id,
            "mode": "knowledge",
            "agents": [],
            "trace": {},
            "blackboard": {},
        }


@app.get("/api/admin/stats")
def admin_stats(admin: dict = Depends(get_current_admin)):
    _audit(admin, "view_stats", "platform", "stats")
    return {
        "users": count_users(),
        "conversations": count_all_conversations(),
        "announcements": count_announcements(),
        "knowledge_sources": len(SEED_DOCUMENTS),
        "audit_logs": count_audit_logs(),
    }


@app.get("/api/admin/users")
def admin_users(search: str = "", limit: int = 50, offset: int = 0, admin: dict = Depends(get_current_admin)):
    _audit(admin, "view_users", "users")
    return {
        "total": count_users(search),
        "users": list_users(search, min(limit, 200), max(offset, 0)),
    }


@app.patch("/api/admin/users/{user_id}/role")
def admin_user_role(user_id: int, body: dict, admin: dict = Depends(get_current_admin)):
    role = (body.get("role") or "").strip()
    if role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="role must be user or admin")
    if user_id == admin["id"] and role != "admin":
        raise HTTPException(status_code=400, detail="cannot demote yourself")
    if not update_user_role(user_id, role):
        raise HTTPException(status_code=404, detail="user not found")
    _audit(admin, "update_user_role", "users", str(user_id), {"role": role})
    return {"ok": True, "user_id": user_id, "role": role}


@app.post("/api/admin/users/{user_id}/reset-password")
def admin_reset_password(user_id: int, body: dict, admin: dict = Depends(get_current_admin)):
    password = (body.get("password") or "").strip()
    _validate_password(password)
    if not reset_user_password(user_id, hash_password(password)):
        raise HTTPException(status_code=404, detail="user not found")
    bump_token_version(user_id)
    revoke_user_refresh_tokens(user_id)
    _audit(admin, "reset_user_password", "users", str(user_id))
    return {"ok": True, "user_id": user_id}


@app.post("/api/admin/users/{user_id}/reset-chat-quota")
def admin_reset_chat_quota(user_id: int, admin: dict = Depends(get_current_admin)):
    if not reset_user_chat_usage(user_id):
        raise HTTPException(status_code=404, detail="user not found")
    _audit(admin, "reset_chat_quota", "users", str(user_id))
    return {"ok": True, "user_id": user_id}


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, admin: dict = Depends(get_current_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="cannot delete yourself")
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    revoke_user_refresh_tokens(user_id)
    delete_user(user_id)
    _audit(admin, "delete_user", "users", str(user_id), {"soft": True})
    return {"deleted": True, "soft": True, "user_id": user_id}


@app.delete("/api/admin/users/{user_id}/hard")
def admin_hard_delete_user(user_id: int, admin: dict = Depends(get_current_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="cannot delete yourself")
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    if not hard_delete_user(user_id):
        raise HTTPException(status_code=404, detail="user not found")
    _audit(admin, "delete_user", "users", str(user_id), {"soft": False})
    return {"deleted": True, "soft": False, "user_id": user_id}


@app.get("/api/admin/conversations")
def admin_conversations(search: str = "", limit: int = 50, offset: int = 0, admin: dict = Depends(get_current_admin)):
    _audit(admin, "view_conversations", "conversations")
    return {
        "total": count_all_conversations(search),
        "conversations": list_all_conversations(search, min(limit, 200), max(offset, 0)),
    }


@app.get("/api/admin/conversations/{conversation_id}")
def admin_conversation_detail(conversation_id: str, admin: dict = Depends(get_current_admin)):
    item = get_any_conversation(conversation_id)
    if not item:
        raise HTTPException(status_code=404, detail="conversation not found")
    _audit(admin, "view_conversation", "conversations", conversation_id)
    return item


@app.delete("/api/admin/conversations/{conversation_id}")
def admin_conversation_delete(conversation_id: str, admin: dict = Depends(get_current_admin)):
    if not delete_any_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="conversation not found")
    _audit(admin, "delete_conversation", "conversations", conversation_id)
    return {"deleted": True, "conversation_id": conversation_id}


@app.get("/api/admin/knowledge")
async def admin_knowledge(admin: dict = Depends(get_current_admin)):
    _audit(admin, "view_knowledge", "knowledge")
    sources = {}
    for seed in SEED_DOCUMENTS:
        sources[seed["source"]] = sources.get(seed["source"], 0) + 1
    qdrant = None
    try:
        client = await get_client()
        info = await client.get_collection(COLLECTION)
        scroll = await client.scroll(
            collection_name=COLLECTION,
            limit=200,
            with_payload=True,
            with_vectors=False,
        )
        qdrant = {
            "points_count": info.points_count,
            "points": [
                {
                    "id": p.id,
                    "text": p.payload.get("text", ""),
                    "source": p.payload.get("source", ""),
                }
                for p in scroll[0]
            ],
        }
        await client.close()
    except Exception as exc:
        qdrant = {"error": str(exc)}
    return {
        "sources": sources,
        "static_entries": len(KNOWLEDGE),
        "qdrant": qdrant,
    }


@app.post("/api/admin/knowledge/refresh")
async def admin_knowledge_refresh(admin: dict = Depends(get_current_admin)):
    try:
        count = await ingest_all()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"knowledge refresh failed: {exc}")
    _audit(admin, "refresh_knowledge", "knowledge", "ingest", {"docs": count})
    return {"refreshed": True, "docs": count}


@app.get("/api/admin/announcements")
def admin_announcements(status: str = "", admin: dict = Depends(get_current_admin)):
    _audit(admin, "view_announcements", "announcements")
    return {"announcements": list_announcements(status or None)}


@app.post("/api/admin/announcements")
def admin_create_announcement(body: dict, admin: dict = Depends(get_current_admin)):
    title = (body.get("title") or "").strip()
    content = (body.get("content") or "").strip()
    status = (body.get("status") or "published").strip()
    if not title or not content:
        raise HTTPException(status_code=400, detail="title and content are required")
    if status not in ("draft", "published"):
        raise HTTPException(status_code=400, detail="status must be draft or published")
    ann = create_announcement(title, content, status, admin["id"])
    _audit(admin, "create_announcement", "announcements", str(ann["id"]), {"title": title, "status": status})
    return ann


@app.patch("/api/admin/announcements/{ann_id}")
def admin_update_announcement(ann_id: int, body: dict, admin: dict = Depends(get_current_admin)):
    existing = get_announcement(ann_id)
    if not existing:
        raise HTTPException(status_code=404, detail="announcement not found")
    title = (body.get("title") or existing["title"]).strip()
    content = (body.get("content") or existing["content"]).strip()
    status = (body.get("status") or existing["status"]).strip()
    if not title or not content:
        raise HTTPException(status_code=400, detail="title and content are required")
    if status not in ("draft", "published"):
        raise HTTPException(status_code=400, detail="status must be draft or published")
    update_announcement(ann_id, title, content, status)
    _audit(admin, "update_announcement", "announcements", str(ann_id), {"title": title, "status": status})
    return get_announcement(ann_id)


@app.delete("/api/admin/announcements/{ann_id}")
def admin_delete_announcement(ann_id: int, admin: dict = Depends(get_current_admin)):
    if not delete_announcement(ann_id):
        raise HTTPException(status_code=404, detail="announcement not found")
    _audit(admin, "delete_announcement", "announcements", str(ann_id))
    return {"deleted": True, "announcement_id": ann_id}


@app.get("/api/admin/logs")
def admin_logs(limit: int = 100, offset: int = 0, admin: dict = Depends(get_current_admin)):
    _audit(admin, "view_logs", "audit_logs")
    return {
        "total": count_audit_logs(),
        "logs": list_audit_logs(min(limit, 300), max(offset, 0)),
    }


@app.get("/api/admin/system")
def admin_system(admin: dict = Depends(get_current_admin)):
    keys = [
        "LLM_PROVIDER",
        "MULTI_AGENT_ENABLED",
        "INTENT_USE_LLM",
        "TOOL_EXECUTION_MODE",
        "RAG_ENABLED",
        "EMBEDDING_PROVIDER",
        "JWT_EXPIRE_SECONDS",
        "JWT_ACCESS_EXPIRE_SECONDS",
        "LOGIN_MAX_ATTEMPTS",
        "LOGIN_LOCK_SECONDS",
        "ADMIN_ALLOWED_IPS",
        "REDIS_URL",
        "ALLOWED_ORIGINS",
    ]
    _audit(admin, "view_system", "system")
    return {"config": {key: os.getenv(key, "") for key in keys}}
