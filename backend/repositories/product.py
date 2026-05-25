"""
产品 Repository
"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models.entities import Product
from repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """产品数据访问层"""

    def __init__(self, session: AsyncSession):
        super().__init__(Product, session)

    async def get_by_asin(self, asin: str) -> Optional[Product]:
        """根据 ASIN 获取产品"""
        result = await self.session.execute(
            select(Product).where(Product.asin == asin)
        )
        return result.scalar_one_or_none()

    async def get_by_category(
        self,
        category: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[Product]:
        """根据分类获取产品列表"""
        result = await self.session.execute(
            select(Product)
            .where(and_(Product.category == category, Product.status == "active"))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def search(
        self,
        keyword: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[Product]:
        """搜索产品（按名称）"""
        result = await self.session.execute(
            select(Product)
            .where(
                and_(
                    Product.status == "active",
                    Product.name.ilike(f"%{keyword}%")
                )
            )
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update_stock(self, id: UUID, delta: int) -> Optional[Product]:
        """更新库存（增减）- 使用原子更新避免竞态"""
        from sqlalchemy import update
        from models.entities import Product as ProductModel

        # 原子更新：直接在数据库层面计算新库存值
        stmt = (
            update(ProductModel)
            .where(ProductModel.id == id)
            .values(stock=ProductModel.stock + delta)  # 数据库层面计算
        )
        result = await self.session.execute(stmt)
        await self.session.flush()

        # 如果有行被更新，重新读取最新数据
        if result.rowcount > 0:
            return await self.get_by_id(id)
        return None