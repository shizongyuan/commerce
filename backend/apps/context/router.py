"""
AI 员工上下文路由 - 内存存储版本
提供对话历史记录和用户记忆管理
"""

from typing import Optional, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4

router = APIRouter()


# ========== 内存存储 ==========
_contexts: Dict[str, dict] = {}  # context_id -> context data


class MemoryUpdate(BaseModel):
    """记忆更新请求"""
    key: str
    value: str


class MemoryUpdateBatch(BaseModel):
    """批量记忆更新"""
    memory: dict


class ContextResponse(BaseModel):
    """上下文响应"""
    id: str
    agent_id: str
    visitor_id: str
    status: str
    memory: dict
    context_summary: Optional[str]
    message_count: int
    created_at: datetime
    updated_at: datetime


class HistoryItem(BaseModel):
    """历史记录项"""
    id: str
    agent_id: str
    visitor_id: str
    status: str
    memory: dict
    context_summary: Optional[str]
    message_count: int
    created_at: datetime
    updated_at: datetime


class HistoryResponse(BaseModel):
    """历史记录响应"""
    items: List[HistoryItem]
    total: int


def _make_key(agent_id: str, visitor_id: str) -> str:
    """生成上下文键"""
    return f"{agent_id}:{visitor_id}"


def _get_or_create_context_id(agent_id: str, visitor_id: str) -> tuple[str, bool]:
    """获取或创建上下文ID"""
    key = _make_key(agent_id, visitor_id)
    
    # 查找现有活跃上下文
    for ctx_id, ctx in _contexts.items():
        if ctx.get("agent_id") == agent_id and ctx.get("visitor_id") == visitor_id and ctx.get("status") == "active":
            return ctx_id, False
    
    # 创建新上下文
    now = datetime.utcnow()
    ctx_id = str(uuid4())
    _contexts[ctx_id] = {
        "id": ctx_id,
        "agent_id": agent_id,
        "visitor_id": visitor_id,
        "status": "active",
        "memory": {},
        "context_summary": None,
        "message_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    return ctx_id, True


@router.get("/context/{agent_id}", response_model=HistoryResponse)
async def get_agent_contexts(
    agent_id: str,
    visitor_id: str = None,
    skip: int = 0,
    limit: int = 20,
):
    """获取员工的上下文记录"""
    if visitor_id:
        # 获取指定访客的上下文
        key = _make_key(agent_id, visitor_id)
        for ctx in _contexts.values():
            if ctx.get("agent_id") == agent_id and ctx.get("visitor_id") == visitor_id:
                return HistoryResponse(
                    items=[
                        HistoryItem(
                            id=ctx["id"],
                            agent_id=ctx["agent_id"],
                            visitor_id=ctx["visitor_id"],
                            status=ctx["status"],
                            memory=ctx["memory"],
                            context_summary=ctx["context_summary"],
                            message_count=ctx["message_count"],
                            created_at=ctx["created_at"],
                            updated_at=ctx["updated_at"],
                        )
                    ],
                    total=1,
                )
        return HistoryResponse(items=[], total=0)
    else:
        # 获取该���工的所有上下文
        contexts = [
            ctx for ctx in _contexts.values()
            if ctx.get("agent_id") == agent_id
        ]
        contexts.sort(key=lambda x: x["updated_at"], reverse=True)
        contexts = contexts[skip:skip + limit]
        
        return HistoryResponse(
            items=[
                HistoryItem(
                    id=ctx["id"],
                    agent_id=ctx["agent_id"],
                    visitor_id=ctx["visitor_id"],
                    status=ctx["status"],
                    memory=ctx["memory"],
                    context_summary=ctx["context_summary"],
                    message_count=ctx["message_count"],
                    created_at=ctx["created_at"],
                    updated_at=ctx["updated_at"],
                )
                for ctx in contexts
            ],
            total=len(contexts),
        )


@router.post("/context/{agent_id}")
async def create_context(
    agent_id: str,
    visitor_id: str,
):
    """创建新的对话上下文"""
    ctx_id, is_new = _get_or_create_context_id(agent_id, visitor_id)
    context = _contexts[ctx_id]
    
    return {
        "id": context["id"],
        "agent_id": context["agent_id"],
        "visitor_id": context["visitor_id"],
        "status": context["status"],
        "memory": context["memory"],
        "message_count": context["message_count"],
        "is_new": is_new,
    }


@router.get("/context/{agent_id}/{context_id}", response_model=ContextResponse)
async def get_context(
    agent_id: str,
    context_id: str,
):
    """获取指定上下文详情"""
    context = _contexts.get(context_id)
    
    if not context or context["agent_id"] != agent_id:
        raise HTTPException(status_code=404, detail="Context not found")
    
    return ContextResponse(
        id=context["id"],
        agent_id=context["agent_id"],
        visitor_id=context["visitor_id"],
        status=context["status"],
        memory=context["memory"],
        context_summary=context["context_summary"],
        message_count=context["message_count"],
        created_at=context["created_at"],
        updated_at=context["updated_at"],
    )


@router.put("/context/{agent_id}/{context_id}/memory")
async def update_context_memory(
    agent_id: str,
    context_id: str,
    data: MemoryUpdate,
):
    """更新单条记忆"""
    context = _contexts.get(context_id)
    
    if not context or context["agent_id"] != agent_id:
        raise HTTPException(status_code=404, detail="Context not found")
    
    # 追加记忆
    context["memory"][data.key] = data.value
    context["updated_at"] = datetime.utcnow()
    context["message_count"] += 1
    
    return {"memory": context["memory"]}


@router.put("/context/{agent_id}/{context_id}/memory/batch")
async def update_context_memory_batch(
    agent_id: str,
    context_id: str,
    data: MemoryUpdateBatch,
):
    """批量更新记忆"""
    context = _contexts.get(context_id)
    
    if not context or context["agent_id"] != agent_id:
        raise HTTPException(status_code=404, detail="Context not found")
    
    # 批量更新记忆
    context["memory"].update(data.memory)
    context["updated_at"] = datetime.utcnow()
    
    return {"memory": context["memory"]}


@router.put("/context/{agent_id}/{context_id}/summary")
async def update_context_summary(
    agent_id: str,
    context_id: str,
    summary: str,
):
    """更新上下文摘要"""
    context = _contexts.get(context_id)
    
    if not context or context["agent_id"] != agent_id:
        raise HTTPException(status_code=404, detail="Context not found")
    
    context["context_summary"] = summary
    context["updated_at"] = datetime.utcnow()
    
    return {"context_summary": context["context_summary"]}


@router.post("/context/{agent_id}/{context_id}/end")
async def end_context(
    agent_id: str,
    context_id: str,
):
    """结束对话上下文"""
    context = _contexts.get(context_id)
    
    if not context or context["agent_id"] != agent_id:
        raise HTTPException(status_code=404, detail="Context not found")
    
    context["status"] = "ended"
    context["ended_at"] = datetime.utcnow().isoformat()
    context["updated_at"] = datetime.utcnow()
    
    return {"message": "Context ended", "status": "ended"}


@router.delete("/context/{agent_id}/{context_id}")
async def delete_context(
    agent_id: str,
    context_id: str,
):
    """删除上下文"""
    context = _contexts.get(context_id)
    
    if not context or context["agent_id"] != agent_id:
        raise HTTPException(status_code=404, detail="Context not found")
    
    del _contexts[context_id]
    return {"message": "Context deleted"}