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
        if not settings.redis_url:
            return
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
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Cache.get called with key: {key}, client exists: {self._client is not None}")
        if not self._client:
            logger.debug("Cache._client is None, returning None")
            return None
        try:
            value = await self._client.get(key)
            if value:
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return None  # Invalid cache data, treat as miss
            return None
        except Exception as e:
            logger.warning(f"Cache.get failed: {e}")
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


# 缓存 TTL 常量（秒）
class CacheTTL:
    """统一管理缓存过期时间"""
    # 产品相关 - 5分钟
    PRODUCT = 300
    PRODUCT_LIST = 300

    # AI Agent 相关 - 10分钟
    AGENT = 600
    AGENT_CONFIG = 600

    # 对话相关 - 30分钟
    CONVERSATION = 1800
    CONVERSATION_HISTORY = 1800

    # 知识库 - 1小时
    KNOWLEDGE = 3600

    # 分析数据 - 5分钟
    DASHBOARD_STATS = 300
    ANALYTICS = 300

    # 默认值
    DEFAULT = 3600


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

    @staticmethod
    def analytics(category: str = None) -> str:
        if category:
            return f"analytics:{category}"
        return "analytics:all"