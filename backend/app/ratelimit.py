"""限流：优先 Redis 分布式限流，Redis 不可用时回退到进程内内存限流。"""

import os
import threading
import time

try:
    import redis as redis_lib
except ImportError:
    redis_lib = None


_CLIENT = None
_CLIENT_LOCK = threading.Lock()
_MEM = {}
_MEM_LOCK = threading.Lock()


def _get_redis():
    global _CLIENT
    if _CLIENT is not None:
        return _CLIENT
    url = os.getenv("REDIS_URL", "")
    if not url or redis_lib is None:
        return None
    with _CLIENT_LOCK:
        if _CLIENT is None:
            try:
                _CLIENT = redis_lib.Redis.from_url(
                    url,
                    socket_connect_timeout=2,
                    socket_timeout=2,
                    decode_responses=True,
                )
            except Exception:
                _CLIENT = None
    return _CLIENT


class RateLimiter:
    def _redis_allowed(self, key: str, limit: int, window: int):
        client = _get_redis()
        if client is None:
            return None
        try:
            now = int(time.time())
            member = f"{now}-{time.time_ns()}"
            pipe = client.pipeline()
            pipe.zremrangebyscore(key, 0, now - window)
            pipe.zcard(key)
            pipe.zadd(key, {member: now})
            pipe.expire(key, window)
            results = pipe.execute()
            return results[1] <= limit
        except Exception:
            return None

    def _memory_allowed(self, key: str, limit: int, window: int) -> bool:
        with _MEM_LOCK:
            now = time.time()
            bucket = _MEM.setdefault(key, [])
            bucket[:] = [t for t in bucket if now - t < window]
            if len(bucket) >= limit:
                return False
            bucket.append(now)
            return True

    def check(self, key: str, limit: int, window: int = 60) -> bool:
        result = self._redis_allowed(key, limit, window)
        if result is not None:
            return result
        return self._memory_allowed(key, limit, window)


limiter = RateLimiter()
