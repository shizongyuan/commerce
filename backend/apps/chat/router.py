"""
AI 对话路由 - 使用知识库注入和意图识别
"""

import os
import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import List, Optional, AsyncGenerator
from core.database import get_db
from core.ai_client import qwen_client
from core.auth import get_current_user_id
from services.chat_service import ChatService, Message as ServiceMessage

router = APIRouter()


class ChatMessage(BaseModel):
    """HTTP 请求/响应用的消息模型（避免与 service 层的 dataclass Message 冲突）"""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    agent_id: str = "xiaoxue"
    messages: List[ChatMessage] = Field(..., max_length=50)
    stream: bool = False


class ChatResponse(BaseModel):
    agent_id: str
    reply: str
    intent: str
    confidence: float
    messages: List[ChatMessage]


# 知识库路径
KNOWLEDGE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "agents",
    "knowledge",
)

# Skills 路径
SKILLS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "..",
    "agents",
    "skills",
)


@router.post("/send", dependencies=[Depends(get_current_user_id)])
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """发送消息并获取 AI 回复（带知识库注入和意图识别 + Skill 执行）"""

    # 流式输出模式
    if request.stream:
        return await chat_stream_response(request, db)

    # 获取员工的知识库配置和 skills 配置
    from apps.agents.store import load_agents
    agents = load_agents()
    agent_config = next((a for a in agents if a["id"] == request.agent_id), None)
    knowledge_files = agent_config.get("knowledge_files", []) if agent_config else []
    agent_skills = agent_config.get("skills", []) if agent_config else []

    # 初始化聊天服务（带 Skill 支持）
    chat_service = ChatService(KNOWLEDGE_DIR, SKILLS_DIR)

    # 绑定 Agent 的 skills
    if agent_skills:
        chat_service.bind_agent_skills_for_agent(request.agent_id, agent_skills)

    # 转换消息
    message_objects = [
        ServiceMessage(role=m.role, content=m.content)
        for m in request.messages[:-1]
    ]

    # 用户最新消息
    user_message = request.messages[-1].content

    # 生成回复（带 visitor_id 用于多轮 Skill 执行）
    result = await chat_service.generate_response(
        user_message=user_message,
        conversation_history=message_objects,
        qwen_client=qwen_client,
        knowledge_files=knowledge_files,
        visitor_id=request.agent_id,  # 使用 agent_id 作为 visitor_id
    )

    reply = result["reply"]
    intent = result["intent"]
    confidence = result.get("confidence", 0.0)
    skill_id = result.get("skill_id")

    # 更新消息历史
    messages = [m.model_dump() for m in request.messages]
    messages.append(ChatMessage(role="assistant", content=reply).model_dump())

    response = ChatResponse(
        agent_id=request.agent_id,
        reply=reply,
        intent=intent,
        confidence=confidence,
        messages=messages,
    )

    # 如果有 skill_id，附加到响应中
    if skill_id:
        response.intent = skill_id  # 用 skill_id 覆盖 intent 表示使用了技能

    return response


async def chat_stream_response(request: ChatRequest, db: AsyncSession) -> StreamingResponse:
    """流式输出 AI 回复（支持 Skill）"""

    from apps.agents.store import load_agents
    chat_service = ChatService(KNOWLEDGE_DIR, SKILLS_DIR)

    agents = load_agents()
    agent_config = next((a for a in agents if a["id"] == request.agent_id), None)
    knowledge_files = agent_config.get("knowledge_files", []) if agent_config else []
    agent_skills = agent_config.get("skills", []) if agent_config else []

    if agent_skills:
        chat_service.bind_agent_skills_for_agent(request.agent_id, agent_skills)

    message_objects = [
        ServiceMessage(role=m.role, content=m.content)
        for m in request.messages[:-1]
    ]

    user_message = request.messages[-1].content

    async def stream_response() -> AsyncGenerator[str, None]:
        try:
            # 发送开始事件
            yield f"data: {json.dumps({'type': 'start'}, ensure_ascii=False)}\n\n"

            # 尝试 Skill 匹配
            skill_id = None
            if chat_service._skill_registry and chat_service._agent_skills:
                matched = chat_service._skill_registry.match_skill(user_message, chat_service._agent_skills)
                if matched:
                    skill, confidence = matched
                    skill_id = skill.id
                    # 流式执行 Skill
                    result = await chat_service.generate_response(
                        user_message=user_message,
                        conversation_history=message_objects,
                        qwen_client=qwen_client,
                        knowledge_files=knowledge_files,
                        visitor_id=request.agent_id,
                    )
                    reply = result.get("reply", "")
                    intent = result.get("intent", "")
                    confidence = result.get("confidence", 0.0)

                    # 流式发送回复
                    for char in reply:
                        yield f"data: {json.dumps({'type': 'chunk', 'content': char}, ensure_ascii=False)}\n\n"
                        await asyncio.sleep(0.01)  # 模拟打字效果

                    yield f"data: {json.dumps({'type': 'done', 'intent': intent, 'confidence': confidence, 'skill_id': skill_id}, ensure_ascii=False)}\n\n"
                    return

            # Fallback: 使用意图识别 + 直接流式输出
            intent_obj = chat_service.intent_recognizer.recognize(user_message)
            messages = chat_service.build_system_prompt(
                message_objects, user_message, intent_obj, knowledge_files
            )

            full_reply = ""
            async for chunk in qwen_client.chat_stream(messages=messages):
                full_reply += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk}, ensure_ascii=False)}\n\n"

            yield f"data: {json.dumps({'type': 'done', 'intent': intent_obj.name, 'confidence': intent_obj.confidence}, ensure_ascii=False)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': '服务暂时不可用'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/stream", dependencies=[Depends(get_current_user_id)])
async def chat_stream(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """流式输出 AI 回复（Server-Sent Events）"""

    chat_service = ChatService(KNOWLEDGE_DIR)

    message_objects = [
        ServiceMessage(role=m.role, content=m.content)
        for m in request.messages[:-1]
    ]

    user_message = request.messages[-1].content

    # 获取员工知识库配置
    from apps.agents.store import load_agents
    agents = load_agents()
    agent_config = next((a for a in agents if a["id"] == request.agent_id), None)
    knowledge_files = agent_config.get("knowledge_files", []) if agent_config else []

    async def stream_response() -> AsyncGenerator[str, None]:
        intent = chat_service.intent_recognizer.recognize(user_message)
        messages = chat_service.build_system_prompt(
            message_objects, user_message, intent, knowledge_files
        )

        try:
            # 发送开始事件
            yield f"data: {json.dumps({'type': 'start'}, ensure_ascii=False)}\n\n"

            async for chunk in qwen_client.chat_stream(messages=messages):
                payload = json.dumps({"type": "chunk", "content": chunk}, ensure_ascii=False)
                yield f"data: {payload}\n\n"

            # 发送完成事件
            done_payload = json.dumps(
                {"type": "done", "intent": intent.name, "confidence": intent.confidence},
                ensure_ascii=False,
            )
            yield f"data: {done_payload}\n\n"
        except Exception as e:
            error_payload = json.dumps({"type": "error", "content": "服务暂时不可用"}, ensure_ascii=False)
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/history/{agent_id}", dependencies=[Depends(get_current_user_id)])
async def get_history(
    agent_id: str,
    visitor_id: str = "visitor-001",
    db: AsyncSession = Depends(get_db),
):
    """获取对话历史"""
    # 简化实现，实际应从数据库读取
    return {"items": [], "total": 0}


@router.post("/clear", dependencies=[Depends(get_current_user_id)])
async def clear_conversation(
    agent_id: str = "xiaoxue",
    visitor_id: str = "visitor-001",
    db: AsyncSession = Depends(get_db),
):
    """清除对话历史"""
    return {"message": "Conversation cleared"}


@router.get("/intents")
async def list_intents():
    """列出支持的意图类型"""
    return {
        "intents": [
            {"name": "order_query", "description": "订单查询", "keywords": ["订单", "发货", "物流"]},
            {"name": "product_inquiry", "description": "产品咨询", "keywords": ["产品", "推荐", "适合"]},
            {"name": "price_inquiry", "description": "价格咨询", "keywords": ["价格", "优惠", "折扣"]},
            {"name": "complaint", "description": "投诉建议", "keywords": ["投诉", "差评", "问题"]},
            {"name": "refund", "description": "退款退货", "keywords": ["退款", "退货", "取消"]},
            {"name": "greeting", "description": "问候", "keywords": ["你好", "hello", "在吗"]},
        ]
    }
