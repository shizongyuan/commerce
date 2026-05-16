"""
AI 员工-用户上下文 Repository
"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from models.entities import AgentUserContext


class AgentContextRepository:
    """AI 员工-用户上下文 Repository"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, id: UUID) -> Optional[AgentUserContext]:
        """根据 ID 获取"""
        result = await self.session.execute(
            select(AgentUserContext).where(AgentUserContext.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_agent_visitor(
        self, agent_id: str, visitor_id: str, status: str = "active"
    ) -> Optional[AgentUserContext]:
        """根据 agent_id + visitor_id 获取活跃上下文"""
        result = await self.session.execute(
            select(AgentUserContext).where(
                AgentUserContext.agent_id == agent_id,
                AgentUserContext.visitor_id == visitor_id,
                AgentUserContext.status == status,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_agent(
        self, agent_id: str, skip: int = 0, limit: int = 20
    ) -> List[AgentUserContext]:
        """获取指定员工的所有上下文"""
        result = await self.session.execute(
            select(AgentUserContext)
            .where(AgentUserContext.agent_id == agent_id)
            .order_by(AgentUserContext.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, data: dict) -> AgentUserContext:
        """创建新上下文"""
        instance = AgentUserContext(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update_memory(self, id: UUID, memory: dict) -> Optional[AgentUserContext]:
        """更新用户记忆"""
        await self.session.execute(
            update(AgentUserContext)
            .where(AgentUserContext.id == id)
            .values(
                memory=memory,
                updated_at=func.now(),
                message_count=AgentUserContext.message_count + 1,
            )
        )
        await self.session.flush()
        return await self.get_by_id(id)

    async def append_memory(self, id: UUID, key: str, value: str) -> Optional[AgentUserContext]:
        """追加用户记忆"""
        context = await self.get_by_id(id)
        if not context:
            return None

        current_memory = context.memory or {}
        current_memory[key] = value

        await self.session.execute(
            update(AgentUserContext)
            .where(AgentUserContext.id == id)
            .values(
                memory=current_memory,
                updated_at=func.now(),
            )
        )
        await self.session.flush()
        return await self.get_by_id(id)

    async def update_summary(self, id: UUID, summary: str) -> Optional[AgentUserContext]:
        """更新上下文摘要"""
        await self.session.execute(
            update(AgentUserContext)
            .where(AgentUserContext.id == id)
            .values(
                context_summary=summary,
                updated_at=func.now(),
            )
        )
        await self.session.flush()
        return await self.get_by_id(id)

    async def increment_message(self, id: UUID) -> Optional[AgentUserContext]:
        """增加消息计数"""
        await self.session.execute(
            update(AgentUserContext)
            .where(AgentUserContext.id == id)
            .values(
                message_count=AgentUserContext.message_count + 1,
                updated_at=func.now(),
            )
        )
        await self.session.flush()
        return await self.get_by_id(id)

    async def end_context(self, id: UUID) -> Optional[AgentUserContext]:
        """结束上下文"""
        await self.session.execute(
            update(AgentUserContext)
            .where(AgentUserContext.id == id)
            .values(
                status="ended",
                ended_at=func.now(),
            )
        )
        await self.session.flush()
        return await self.get_by_id(id)

    async def get_or_create(
        self, agent_id: str, visitor_id: str
    ) -> tuple[AgentUserContext, bool]:
        """获取或创建上下文"""
        existing = await self.get_by_agent_visitor(agent_id, visitor_id)
        if existing:
            return existing, False

        new_context = await self.create({
            "agent_id": agent_id,
            "visitor_id": visitor_id,
            "status": "active",
            "memory": {},
            "message_count": 0,
        })
        return new_context, True