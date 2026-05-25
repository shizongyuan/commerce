from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, Field
import os
import uuid
import asyncio
import aiofiles
from pathlib import Path
from core.database import get_db
from core.auth import get_current_user_id
from .store import load_agents, save_agents, get_agents_dict

router = APIRouter()

# 头像存储目录 - 使用动态路径
AVATARS_DIR = Path(__file__).parent.parent.parent / "public" / "avatars"
AVATARS_DIR.mkdir(parents=True, exist_ok=True)


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


def _build_avatar_url(avatar_path: str) -> str:
    """构建头像的完整 URL - 使用相对路径避免硬编码"""
    if not avatar_path:
        return ""
    # 动态获取当前服务器配置
    from core.config import settings
    base_url = f"http://{settings.server_host}:{settings.server_port}"

    if avatar_path.startswith("/avatars/"):
        return f"{base_url}{avatar_path}"
    elif avatar_path.startswith("/images/agents/"):
        # 前端默认头像使用 website 端口
        website_port = 3001 if settings.server_port == 8004 else 3000
        return f"http://{settings.server_host}:{website_port}{avatar_path}"
    return avatar_path


def _enrich_agent_avatar(agent: dict) -> dict:
    """为 agent 添加完整的头像 URL（不修改原始数据）"""
    if agent.get("avatar"):
        enriched = {**agent, "avatar": _build_avatar_url(agent["avatar"])}
        return enriched
    return agent


# 上传头像和获取头像需要放在 {agent_id} 之前，避免被路由匹配冲突
@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...)):
    """上传员工头像 - 转换为 webp 格式"""
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="只支持 JPG/PNG/GIF/WEBP 图片")

    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="图片大小不能超过 2MB")

    # 转换为 webp 格式 - 使用线程池避免阻塞
    from PIL import Image
    import io

    def convert_to_webp(contents: bytes) -> bytes:
        img = Image.open(io.BytesIO(contents))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        webp_buffer = io.BytesIO()
        img.save(webp_buffer, format="WEBP", quality=85)
        return webp_buffer.getvalue()

    webp_contents = await asyncio.to_thread(convert_to_webp, contents)

    # 生成文件名
    filename = f"{uuid.uuid4()}.webp"
    filepath = os.path.join(AVATARS_DIR, filename)

    # 异步保存文件
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(webp_contents)

    # 返回完整 URL
    return {
        "filename": filename,
        "url": f"/avatars/{filename}",
        "full_url": f"http://localhost:8004/avatars/{filename}",
    }


@router.get("/avatars/{filename}")
async def get_avatar(filename: str):
    """获取头像图片"""
    # 防止路径遍历攻击
    if ".." in filename or filename.startswith("/") or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    filepath = os.path.join(AVATARS_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Avatar not found")
    return FileResponse(filepath)


@router.get("", response_model=AgentListResponse, dependencies=[Depends(get_current_user_id)])
async def list_agents(db: AsyncSession = Depends(get_db)):
    agents = get_agents()
    # 补全 avatar URL
    agents = [_enrich_agent_avatar(a) for a in agents]
    return AgentListResponse(
        items=[AgentConfig(**a) for a in agents],
        total=len(agents),
    )


@router.get("/{agent_id}", response_model=AgentConfig, dependencies=[Depends(get_current_user_id)])
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    agents_dict = get_agents_dict()
    agent = agents_dict.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent = _enrich_agent_avatar(agent)
    return AgentConfig(**agent)


@router.post("", dependencies=[Depends(get_current_user_id)])
async def create_agent(agent: AgentConfig, db: AsyncSession = Depends(get_db)):
    agents = get_agents()
    # 检查 ID 是否已存在
    for a in agents:
        if a["id"] == agent.id:
            raise HTTPException(status_code=400, detail="Agent ID already exists")
    agents.append(agent.model_dump())
    save_agents(agents)
    return AgentConfig(**agent.model_dump())


@router.put("/{agent_id}", dependencies=[Depends(get_current_user_id)])
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


@router.delete("/{agent_id}", dependencies=[Depends(get_current_user_id)])
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    agents = get_agents()
    for i, a in enumerate(agents):
        if a["id"] == agent_id:
            agents.pop(i)
            save_agents(agents)
            return {"message": "Agent deleted"}
    raise HTTPException(status_code=404, detail="Agent not found")


@router.get("/{agent_id}/skills", dependencies=[Depends(get_current_user_id)])
async def get_agent_skills(agent_id: str, db: AsyncSession = Depends(get_db)):
    for a in get_agents():
        if a["id"] == agent_id:
            return {"agent_id": agent_id, "skills": a.get("skills", [])}
    raise HTTPException(status_code=404, detail="Agent not found")


@router.get("/knowledge/files", dependencies=[Depends(get_current_user_id)])
async def list_knowledge_files(db: AsyncSession = Depends(get_db)):
    """获取所有可选的知识库文件"""
    from .store import get_all_knowledge_files
    return {"files": get_all_knowledge_files()}