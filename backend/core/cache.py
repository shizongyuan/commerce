"""
Redis 缓存服务
"""

import json
from typing import Optional, Any
import redis.asyncio as redis
from core.config import settings


class RedisCache:
    """Redis 缓存客户端"""

    def __init__(self):
        self._client: Optional[redis.Redis] = None

    async def connect(self):
        """连接 Redis"""
        self._client = redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True
        )

    async def close(self):
        """关闭连接"""
        if self._client:
            await self._client.close()

    async def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        if not self._client:
            return None
        try:
            value = await self._client.get(key)
            if value:
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value
            return None
        except Exception:
            return None

    async def set(
        self,
        key: str,
        value: Any,
        expire: int = 3600
    ) -> bool:
        """设置缓存值（默认1小时过期）"""
        if not self._client:
            return False
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            await self._client.set(key, value, ex=expire)
            return True
        except Exception:
            return False

    async def delete(self, key: str) -> bool:
        """删除缓存"""
        if not self._client:
            return False
        try:
            await self._client.delete(key)
            return True
        except Exception:
            return False

    async def exists(self, key: str) -> bool:
        """检查键是否存在"""
        if not self._client:
            return False
        try:
            return await self._client.exists(key) > 0
        except Exception:
            return False

    async def incr(self, key: str, amount: int = 1) -> int:
        """递增计数器"""
        if not self._client:
            return 0
        try:
            return await self._client.incr(key, amount)
        except Exception:
            return 0

    async def expire(self, key: str, seconds: int) -> bool:
        """设置过期时间"""
        if not self._client:
            return False
        try:
            return await self._client.expire(key, seconds)
        except Exception:
            return False


# 全局缓存实例
cache = RedisCache()


# 缓存 key 模板
class CacheKeys:
    """缓存键命名规范"""

    @staticmethod
    def product(product_id: str) -> str:
        return f"product:{product_id}"

    @staticmethod
    def agent(agent_id: str) -> str:
        return f"agent:{agent_id}"

    @staticmethod
    def conversation(conversation_id: str) -> str:
        return f"conversation:{conversation_id}"

    @staticmethod
    def knowledge(path: str) -> str:
        return f"knowledge:{path.replace('/', ':')}"

    @staticmethod
    def dashboard_stats() -> str:
        return "dashboard:stats"

    @staticmethod
    def product_list(category: str = None, page: int = 1) -> str:
        if category:
            return f"products:list:{category}:{page}"
        return f"products:list:all:{page}"