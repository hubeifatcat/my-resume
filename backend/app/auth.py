"""用户认证：bcrypt 密码哈希 + PyJWT。"""

import datetime
import os

import bcrypt
import jwt
from fastapi import HTTPException, Header


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_token(user_id: int, username: str, role: str = "user") -> str:
    secret = os.getenv("JWT_SECRET", "change-me")
    expire = int(os.getenv("JWT_EXPIRE_SECONDS", "604800"))
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=expire),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_token(token: str) -> dict:
    secret = os.getenv("JWT_SECRET", "change-me")
    return jwt.decode(token, secret, algorithms=["HS256"])


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
        return {
            "id": int(payload.get("sub", "0")),
            "username": payload.get("username", ""),
            "role": payload.get("role", "user"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")


def get_current_user_optional(authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
        return {
            "id": int(payload.get("sub", "0")),
            "username": payload.get("username", ""),
            "role": payload.get("role", "user"),
        }
    except Exception:
        return None


def get_current_admin(authorization: str | None = Header(default=None)) -> dict:
    user = get_current_user(authorization)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="admin required")
    return user
