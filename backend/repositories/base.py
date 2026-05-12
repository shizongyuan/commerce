"""
Repository 基类
提供通用的 CRUD 操作
"""

from typing import TypeVar, Generic, Type, Optional, List, Any
from uuid import UUID
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar('T')


class BaseRepository(Generic[T]):
    """基础 Repository 类"""

    def __init__(self, model: Type[T], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: UUID) -> Optional[T]:
        """根据 ID 获取单条记录"""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """获取所有记录（分页）"""
        result = await self.session.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, data: dict) -> T:
        """创建新记录"""
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, id: UUID, data: dict) -> Optional[T]:
        """更新记录"""
        await self.session.execute(
            update(self.model).where(self.model.id == id).values(**data)
        )
        await self.session.flush()
        return await self.get_by_id(id)

    async def delete(self, id: UUID) -> bool:
        """删除记录"""
        result = await self.session.execute(
            delete(self.model).where(self.model.id == id)
        )
        return result.rowcount > 0

    async def exists(self, id: UUID) -> bool:
        """检查记录是否存在"""
        result = await self.session.execute(
            select(self.model.id).where(self.model.id == id)
        )
        return result.scalar_one_or_none() is not None