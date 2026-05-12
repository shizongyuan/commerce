"""
AI Agent Repository
"""

from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models.entities import AIAgent
from repositories.base import BaseRepository


class AgentRepository(BaseRepository[AIAgent]):
    """AI 员工数据访问层"""

    def __init__(self, session: AsyncSession):
        super().__init__(AIAgent, session)

    async def get_by_code(self, code: str) -> Optional[AIAgent]:
        """根据编号获取 Agent"""
        result = await self.session.execute(
            select(AIAgent).where(AIAgent.code == code)
        )
        return result.scalar_one_or_none()

    async def get_active_agents(self) -> List[AIAgent]:
        """获取所有活跃的 Agent"""
        result = await self.session.execute(
            select(AIAgent).where(AIAgent.status == "active")
        )
        return list(result.scalars().all())

    async def get_by_skill(self, skill: str) -> List[AIAgent]:
        """根据技能获取 Agent"""
        result = await self.session.execute(
            select(AIAgent).where(
                and_(
                    AIAgent.status == "active",
                    AIAgent.skills.contains(skill)
                )
            )
        )
        return list(result.scalars().all())