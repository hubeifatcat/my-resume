"""SQLite 用户与会话历史存储，预留切换 MySQL 的 Repository 边界。"""

import json
import os
import sqlite3
import threading
import time
from pathlib import Path


DB_LOCK = threading.Lock()


def _db_path() -> str:
    url = os.getenv("DATABASE_URL", "sqlite:///data/wuxing.db")
    if url.startswith("sqlite:///"):
        path = url[len("sqlite:///"):]
    else:
        path = url
    if not os.path.isabs(path):
        base = Path(os.getenv("APP_DATA_DIR", Path(__file__).resolve().parent.parent))
        path = str(base / path)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    return path


def _connect():
    conn = sqlite3.connect(_db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    with DB_LOCK:
        conn = _connect()
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                failed_attempts INTEGER NOT NULL DEFAULT 0,
                locked_until REAL,
                token_version INTEGER NOT NULL DEFAULT 0,
                created_at REAL NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                conversation_id TEXT NOT NULL UNIQUE,
                title TEXT,
                messages TEXT NOT NULL,
                trace TEXT NOT NULL,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS announcements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'published',
                created_by INTEGER,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                action TEXT NOT NULL,
                target_type TEXT,
                target_id TEXT,
                detail TEXT,
                created_at REAL NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at REAL NOT NULL,
                revoked INTEGER NOT NULL DEFAULT 0,
                created_at REAL NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS workbench_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                module TEXT NOT NULL,
                title TEXT NOT NULL,
                meta TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )
        cols = [row["name"] for row in conn.execute("PRAGMA table_info(users)")]
        if "role" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")
        if "failed_attempts" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0")
        if "locked_until" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN locked_until REAL")
        if "token_version" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0")
        conn.commit()
        conn.close()


def create_user(username: str, email: str, password_hash: str, role: str = "user") -> dict:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
                (username, email or None, password_hash, role, time.time()),
            )
            conn.commit()
            return {"id": cur.lastrowid, "username": username, "email": email or "", "role": role}
        except sqlite3.IntegrityError:
            raise ValueError("username already exists")
        finally:
            conn.close()


def get_user_by_username(username: str):
    conn = _connect()
    try:
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_user_by_id(user_id: int):
    conn = _connect()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def save_conversation(user_id: int, conversation_id: str, title: str, messages: list, trace: dict):
    now = time.time()
    with DB_LOCK:
        conn = _connect()
        try:
            row = conn.execute(
                "SELECT id FROM conversations WHERE conversation_id = ?",
                (conversation_id,),
            ).fetchone()
            if row:
                conn.execute(
                    "UPDATE conversations SET messages = ?, trace = ?, updated_at = ? WHERE conversation_id = ?",
                    (json.dumps(messages, ensure_ascii=False), json.dumps(trace, ensure_ascii=False), now, conversation_id),
                )
            else:
                conn.execute(
                    "INSERT INTO conversations (user_id, conversation_id, title, messages, trace, created_at, updated_at) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (user_id, conversation_id, title, json.dumps(messages, ensure_ascii=False), json.dumps(trace, ensure_ascii=False), now, now),
                )
            conn.commit()
        finally:
            conn.close()


def list_conversations(user_id: int) -> list:
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT conversation_id, title, created_at, updated_at, messages FROM conversations "
            "WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100",
            (user_id,),
        ).fetchall()
        out = []
        for row in rows:
            messages = json.loads(row["messages"] or "[]")
            out.append(
                {
                    "conversation_id": row["conversation_id"],
                    "title": row["title"],
                    "created_at": row["created_at"],
                    "updated_at": row["updated_at"],
                    "message_count": len(messages),
                }
            )
        return out
    finally:
        conn.close()


def get_conversation(user_id: int, conversation_id: str):
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT * FROM conversations WHERE user_id = ? AND conversation_id = ?",
            (user_id, conversation_id),
        ).fetchone()
        if not row:
            return None
        return {
            "conversation_id": row["conversation_id"],
            "title": row["title"],
            "messages": json.loads(row["messages"] or "[]"),
            "trace": json.loads(row["trace"] or "{}"),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
    finally:
        conn.close()


def delete_conversation(user_id: int, conversation_id: str) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "DELETE FROM conversations WHERE user_id = ? AND conversation_id = ?",
                (user_id, conversation_id),
            )
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def ensure_admin(username: str) -> None:
    if not username:
        return
    with DB_LOCK:
        conn = _connect()
        try:
            row = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
            if row:
                conn.execute("UPDATE users SET role = 'admin' WHERE id = ?", (row["id"],))
                conn.commit()
        finally:
            conn.close()


def count_users(search: str = "") -> int:
    conn = _connect()
    try:
        if search:
            row = conn.execute(
                "SELECT COUNT(*) AS n FROM users WHERE username LIKE ? OR email LIKE ?",
                (f"%{search}%", f"%{search}%"),
            ).fetchone()
        else:
            row = conn.execute("SELECT COUNT(*) AS n FROM users").fetchone()
        return row["n"]
    finally:
        conn.close()


def list_users(search: str = "", limit: int = 50, offset: int = 0) -> list:
    conn = _connect()
    try:
        base = """
            SELECT u.*,
                   (SELECT COUNT(*) FROM conversations c WHERE c.user_id = u.id) AS conversation_count,
                   (SELECT MAX(c.updated_at) FROM conversations c WHERE c.user_id = u.id) AS last_active
            FROM users u
        """
        if search:
            rows = conn.execute(
                base + " WHERE u.username LIKE ? OR u.email LIKE ? ORDER BY u.created_at DESC LIMIT ? OFFSET ?",
                (f"%{search}%", f"%{search}%", limit, offset),
            ).fetchall()
        else:
            rows = conn.execute(base + " ORDER BY u.created_at DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def update_user_role(user_id: int, role: str) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def reset_user_password(user_id: int, password_hash: str) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def delete_user(user_id: int) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            conn.execute("DELETE FROM conversations WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM workbench_items WHERE user_id = ?", (user_id,))
            cur = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def count_all_conversations(search: str = "") -> int:
    conn = _connect()
    try:
        if search:
            row = conn.execute(
                """
                SELECT COUNT(*) AS n FROM conversations c
                LEFT JOIN users u ON u.id = c.user_id
                WHERE c.title LIKE ? OR u.username LIKE ?
                """,
                (f"%{search}%", f"%{search}%"),
            ).fetchone()
        else:
            row = conn.execute("SELECT COUNT(*) AS n FROM conversations").fetchone()
        return row["n"]
    finally:
        conn.close()


def list_all_conversations(search: str = "", limit: int = 50, offset: int = 0) -> list:
    conn = _connect()
    try:
        base = """
            SELECT c.conversation_id, c.title, c.messages, c.created_at, c.updated_at, u.username
            FROM conversations c LEFT JOIN users u ON u.id = c.user_id
        """
        if search:
            rows = conn.execute(
                base + " WHERE c.title LIKE ? OR u.username LIKE ? ORDER BY c.updated_at DESC LIMIT ? OFFSET ?",
                (f"%{search}%", f"%{search}%", limit, offset),
            ).fetchall()
        else:
            rows = conn.execute(base + " ORDER BY c.updated_at DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
        out = []
        for r in rows:
            item = dict(r)
            item["messages"] = json.loads(item["messages"] or "[]")
            item["message_count"] = len(item["messages"])
            out.append(item)
        return out
    finally:
        conn.close()


def get_any_conversation(conversation_id: str):
    conn = _connect()
    try:
        row = conn.execute(
            """
            SELECT c.*, u.username
            FROM conversations c LEFT JOIN users u ON u.id = c.user_id
            WHERE c.conversation_id = ?
            """,
            (conversation_id,),
        ).fetchone()
        if not row:
            return None
        item = dict(row)
        item["messages"] = json.loads(item["messages"] or "[]")
        item["trace"] = json.loads(item["trace"] or "{}")
        return item
    finally:
        conn.close()


def delete_any_conversation(conversation_id: str) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute("DELETE FROM conversations WHERE conversation_id = ?", (conversation_id,))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def create_announcement(title: str, content: str, status: str, created_by: int) -> dict:
    now = time.time()
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "INSERT INTO announcements (title, content, status, created_by, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (title, content, status, created_by, now, now),
            )
            conn.commit()
            ann_id = cur.lastrowid
        finally:
            conn.close()
    return get_announcement(ann_id)


def get_announcement(ann_id: int):
    conn = _connect()
    try:
        row = conn.execute("SELECT * FROM announcements WHERE id = ?", (ann_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def list_announcements(status: str | None = None) -> list:
    conn = _connect()
    try:
        if status:
            rows = conn.execute(
                "SELECT * FROM announcements WHERE status = ? ORDER BY updated_at DESC",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM announcements ORDER BY updated_at DESC").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def update_announcement(ann_id: int, title: str, content: str, status: str) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "UPDATE announcements SET title = ?, content = ?, status = ?, updated_at = ? WHERE id = ?",
                (title, content, status, time.time(), ann_id),
            )
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def delete_announcement(ann_id: int) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute("DELETE FROM announcements WHERE id = ?", (ann_id,))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def count_announcements() -> int:
    conn = _connect()
    try:
        row = conn.execute("SELECT COUNT(*) AS n FROM announcements").fetchone()
        return row["n"]
    finally:
        conn.close()


def add_audit_log(user_id, username: str, action: str, target_type: str = "", target_id: str = "", detail: str | None = None) -> None:
    with DB_LOCK:
        conn = _connect()
        try:
            conn.execute(
                "INSERT INTO audit_logs (user_id, username, action, target_type, target_id, detail, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, username, action, target_type, target_id, detail, time.time()),
            )
            conn.commit()
        finally:
            conn.close()


def list_audit_logs(limit: int = 100, offset: int = 0) -> list:
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def count_audit_logs() -> int:
    conn = _connect()
    try:
        row = conn.execute("SELECT COUNT(*) AS n FROM audit_logs").fetchone()
        return row["n"]
    finally:
        conn.close()


def update_login_failure(user_id: int) -> int:
    with DB_LOCK:
        conn = _connect()
        try:
            conn.execute("UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ?", (user_id,))
            row = conn.execute("SELECT failed_attempts FROM users WHERE id = ?", (user_id,)).fetchone()
            conn.commit()
            return row["failed_attempts"] if row else 0
        finally:
            conn.close()


def reset_login_failures(user_id: int) -> None:
    with DB_LOCK:
        conn = _connect()
        try:
            conn.execute(
                "UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?",
                (user_id,),
            )
            conn.commit()
        finally:
            conn.close()


def lock_user(user_id: int, until: float) -> None:
    with DB_LOCK:
        conn = _connect()
        try:
            conn.execute(
                "UPDATE users SET locked_until = ?, failed_attempts = 0 WHERE id = ?",
                (until, user_id),
            )
            conn.commit()
        finally:
            conn.close()


def bump_token_version(user_id: int) -> None:
    with DB_LOCK:
        conn = _connect()
        try:
            conn.execute(
                "UPDATE users SET token_version = token_version + 1 WHERE id = ?",
                (user_id,),
            )
            conn.commit()
        finally:
            conn.close()


def save_refresh_token(user_id: int, token_hash: str, expires_at: float) -> None:
    with DB_LOCK:
        conn = _connect()
        try:
            conn.execute(
                "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked, created_at) "
                "VALUES (?, ?, ?, 0, ?)",
                (user_id, token_hash, expires_at, time.time()),
            )
            conn.commit()
        finally:
            conn.close()


def get_refresh_token(token_hash: str):
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT * FROM refresh_tokens WHERE token_hash = ?",
            (token_hash,),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def revoke_refresh_token(token_hash: str) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ? AND revoked = 0",
                (token_hash,),
            )
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def revoke_user_refresh_tokens(user_id: int) -> int:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ? AND revoked = 0",
                (user_id,),
            )
            conn.commit()
            return cur.rowcount
        finally:
            conn.close()


# ---------- Workbench（工作台数据，按用户隔离） ----------

WORKBENCH_MODULES = [
    "stats_note", "quick", "week", "roles", "assets",
    "tasks", "schedule", "files", "logs", "profile",
]

# 默认种子：与工作台初始展示一致，用户首次访问时自动写入
DEFAULT_WORKBENCH = {
    "quick": [
        {"title": "日程管理", "meta": "查看今日安排与会议"},
        {"title": "我的任务", "meta": "管理工作任务与进度"},
        {"title": "文件中心", "meta": "管理办公文件资料"},
        {"title": "工作日志", "meta": "记录每日工作情况"},
        {"title": "公司公告", "meta": "查看企业最新通知"},
        {"title": "个人中心", "meta": "管理个人信息资料"},
    ],
    "week": [
        {"title": "周一", "meta": "4"},
        {"title": "周二", "meta": "6"},
        {"title": "周三", "meta": "3"},
        {"title": "周四", "meta": "5"},
        {"title": "周五", "meta": "2"},
        {"title": "周六", "meta": "1"},
    ],
    "roles": [
        {"title": "项目经理助手"},
        {"title": "运维分析助手"},
        {"title": "文档写作助手"},
        {"title": "脚本生成助手"},
    ],
    "assets": [
        {"title": "项目知识库", "meta": "RAG 检索 · 12 篇"},
        {"title": "运维案例", "meta": "故障排查 · 36 条"},
        {"title": "文件资产", "meta": "部署手册 · 8 份"},
    ],
    "tasks": [
        {"title": "梳理今日待办清单", "meta": "", "status": "todo"},
        {"title": "跟进项目交付验收", "meta": "", "status": "doing"},
        {"title": "生成周报草稿", "meta": "", "status": "done"},
    ],
    "schedule": [
        {"title": "10:00 项目周会", "meta": "会议室 A"},
        {"title": "14:00 需求评审", "meta": "线上会议"},
        {"title": "16:30 交付复盘", "meta": "会议室 B"},
    ],
    "files": [
        {"title": "部署方案.pdf", "meta": "PDF · 2.4MB"},
        {"title": "用户操作手册.docx", "meta": "DOCX · 1.8MB"},
        {"title": "故障案例库.md", "meta": "Markdown · 36 条"},
    ],
    "logs": [
        {"title": "今日完成部署验收", "meta": "08-13"},
        {"title": "处理客户反馈 3 条", "meta": "08-13"},
        {"title": "更新巡检记录", "meta": "08-12"},
    ],
    "profile": [
        {"title": "账号信息", "meta": "用户名 / 邮箱"},
        {"title": "系统设置", "meta": "主题 / 通知"},
        {"title": "偏好与主题", "meta": "亮色 / 暗色"},
    ],
}


def seed_workbench(user_id: int) -> None:
    """首次访问时写入默认工作台数据。"""
    with DB_LOCK:
        conn = _connect()
        try:
            now = time.time()
            for module, items in DEFAULT_WORKBENCH.items():
                for order, item in enumerate(items):
                    conn.execute(
                        "INSERT INTO workbench_items (user_id, module, title, meta, status, sort_order, created_at, updated_at) "
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (
                            user_id,
                            module,
                            item["title"],
                            item.get("meta", ""),
                            item.get("status", ""),
                            order,
                            now,
                            now,
                        ),
                    )
            conn.commit()
        finally:
            conn.close()


def list_workbench(user_id: int) -> list:
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT * FROM workbench_items WHERE user_id = ? ORDER BY sort_order, id",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_workbench_item(item_id: int, user_id: int):
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT * FROM workbench_items WHERE id = ? AND user_id = ?",
            (item_id, user_id),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def create_workbench_item(user_id: int, module: str, title: str, meta: str = "", status: str = "", sort_order: int = 0) -> dict:
    now = time.time()
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "INSERT INTO workbench_items (user_id, module, title, meta, status, sort_order, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, module, title, meta, status, sort_order, now, now),
            )
            conn.commit()
            item_id = cur.lastrowid
        finally:
            conn.close()
    return get_workbench_item(item_id, user_id)


def update_workbench_item(item_id: int, user_id: int, title: str, meta: str = "", status: str = "", sort_order: int = 0) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "UPDATE workbench_items SET title = ?, meta = ?, status = ?, sort_order = ?, updated_at = ? "
                "WHERE id = ? AND user_id = ?",
                (title, meta, status, sort_order, time.time(), item_id, user_id),
            )
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()


def delete_workbench_item(item_id: int, user_id: int) -> bool:
    with DB_LOCK:
        conn = _connect()
        try:
            cur = conn.execute(
                "DELETE FROM workbench_items WHERE id = ? AND user_id = ?",
                (item_id, user_id),
            )
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()
