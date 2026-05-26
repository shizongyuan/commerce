from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import Optional
from core.config import settings

# 如果没有配置数据库 URL，使用空引擎（仅 Mock 模式）
if settings.database_url:
    engine = create_async_engine(settings.database_url, echo=settings.debug, pool_pre_ping=True)
else:
    engine = None

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
) if engine else None

Base = declarative_base()

# 数据库是否可用
DB_AVAILABLE = engine is not None


async def get_db():
    """获取数据库会话 - 如果数据库未配置则返回 None"""
    if not AsyncSessionLocal:
        yield None
        return
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """初始化数据库表"""
    if not engine:
        return
    from models.entities import Base as EntitiesBase
    async with engine.begin() as conn:
        await conn.run_sync(EntitiesBase.metadata.create_all)


async def close_db():
    """关闭数据库连接"""
    if engine:
        await engine.dispose()
