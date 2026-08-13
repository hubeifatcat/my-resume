"""用户认证：bcrypt 密码哈希 + PyJWT，支持短时效 access token 与 refresh token。"""

import datetime
import hashlib
import os
import secrets

import bcrypt
import jwt
from fastapi import Header, HTTPException, Request

from .db import get_user_by_id


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def _expire(seconds: int) -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=seconds)


def create_token(
    user_id: int,
    username: str,
    role: str,
    token_type: str,
    version: int,
    expires_seconds: int,
) -> str:
    secret = os.getenv("JWT_SECRET", "change-me")
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "ver": version,
        "type": token_type,
        "exp": _expire(expires_seconds),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def create_access_token(user: dict) -> str:
    seconds = int(os.getenv("JWT_ACCESS_EXPIRE_SECONDS", "3600"))
    return create_token(
        user["id"],
        user["username"],
        user.get("role", "user"),
        "access",
        user.get("token_version", 0),
        seconds,
    )


def create_refresh_token(user: dict) -> tuple[str, str]:
    raw = secrets.token_urlsafe(48)
    return raw, hashlib.sha256(raw.encode("utf-8")).hexdigest()


def decode_token(token: str) -> dict:
    secret = os.getenv("JWT_SECRET", "change-me")
    return jwt.decode(token, secret, algorithms=["HS256"])


def _user_from_payload(payload: dict, expected_type: str) -> dict:
    if payload.get("type") != expected_type:
        raise HTTPException(status_code=401, detail="invalid token type")
    user = get_user_by_id(int(payload.get("sub", "0")))
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    if payload.get("ver") != user.get("token_version", 0):
        raise HTTPException(status_code=401, detail="token revoked")
    return user


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
        user = _user_from_payload(payload, "access")
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user.get("email", ""),
            "role": user.get("role", "user"),
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")


def get_current_user_optional(authorization: str | None = Header(default=None)) -> dict | None:
    try:
        return get_current_user(authorization)
    except Exception:
        return None


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""


def get_current_admin(request: Request, authorization: str | None = Header(default=None)) -> dict:
    user = get_current_user(authorization)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="admin required")
    allowed = [item.strip() for item in os.getenv("ADMIN_ALLOWED_IPS", "").split(",") if item.strip()]
    if allowed and _client_ip(request) not in allowed:
        raise HTTPException(status_code=403, detail="admin ip not allowed")
    return user
