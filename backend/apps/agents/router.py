from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, Field
from core.database import get_db
from .store import load_agents, save_agents

router = APIRouter()


class AgentConfig(BaseModel):
    id: str
    code: str
    name: str
    role: str
    avatar: Optional[str] = None
    knowledge_files: List[str] = Field(default_factory=list)  # 知识库文件列表
    skills: List[str] = Field(default_factory=list)
    status: str = "active"
    greeting: Optional[str] = None


class AgentListResponse(BaseModel):
    items: List[AgentConfig]
    total: int


def get_agents():
    return load_agents()


@router.get("", response_model=AgentListResponse)
async def list_agents(db: AsyncSession = Depends(get_db)):
    agents = get_agents()
    return AgentListResponse(
        items=[AgentConfig(**a) for a in agents],
        total=len(agents),
    )


@router.get("/{agent_id}", response_model=AgentConfig)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    for a in get_agents():
        if a["id"] == agent_id:
            return AgentConfig(**a)
    raise HTTPException(status_code=404, detail="Agent not found")


@router.post("")
async def create_agent(agent: AgentConfig, db: AsyncSession = Depends(get_db)):
    agents = get_agents()
    # 检查 ID 是否已存在
    for a in agents:
        if a["id"] == agent.id:
            raise HTTPException(status_code=400, detail="Agent ID already exists")
    agents.append(agent.model_dump())
    save_agents(agents)
    return AgentConfig(**agent.model_dump())


@router.put("/{agent_id}")
async def update_agent(
    agent_id: str,
    agent: AgentConfig,
    db: AsyncSession = Depends(get_db),
):
    agents = get_agents()
    for i, a in enumerate(agents):
        if a["id"] == agent_id:
            agents[i] = agent.model_dump()
            save_agents(agents)
            return AgentConfig(**agents[i])
    raise HTTPException(status_code=404, detail="Agent not found")


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    agents = get_agents()
    for i, a in enumerate(agents):
        if a["id"] == agent_id:
            agents.pop(i)
            save_agents(agents)
            return {"message": "Agent deleted"}
    raise HTTPException(status_code=404, detail="Agent not found")


@router.get("/{agent_id}/skills")
async def get_agent_skills(agent_id: str, db: AsyncSession = Depends(get_db)):
    for a in get_agents():
        if a["id"] == agent_id:
            return {"agent_id": agent_id, "skills": a.get("skills", [])}
    raise HTTPException(status_code=404, detail="Agent not found")


@router.get("/knowledge/files")
async def list_knowledge_files(db: AsyncSession = Depends(get_db)):
    """获取所有可选的知识库文件"""
    from .store import get_all_knowledge_files
    return {"files": get_all_knowledge_files()}