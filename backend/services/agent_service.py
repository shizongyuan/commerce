"""
AI 员工服务 - 管理工作台调用
"""

import os
from typing import List, Dict, Any, Optional
from services.chat_service import ChatService, Message
from core.ai_client import qwen_client


class AgentService:
    """AI 员工服务"""

    def __init__(self):
        # 知识库路径
        knowledge_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "agents",
            "knowledge",
        )
        self.chat_service = ChatService(knowledge_dir)

    async def chat(
        self,
        agent_id: str,
        messages: List[Dict[str, str]],
        stream: bool = False,
    ) -> Dict[str, Any]:
        """处理对话请求（异步，使用全局 qwen_client）"""
        from apps.agents.store import load_agents

        # 从 store 获取员工配置和知识库
        agents = load_agents()
        agent_config = next((a for a in agents if a["id"] == agent_id), None)
        knowledge_files = agent_config.get("knowledge_files", []) if agent_config else []

        message_objects = [
            Message(role=m["role"], content=m["content"])
            for m in messages
        ]

        user_message = messages[-1]["content"] if messages else ""
        intent = self.chat_service.intent_recognizer.recognize(user_message)
        system_messages = self.chat_service.build_system_prompt(
            message_objects[:-1], user_message, intent, knowledge_files
        )

        # 使用全局 async qwen_client，避免同步阻塞
        response = await qwen_client.chat(messages=system_messages)

        if "choices" in response:
            reply = response["choices"][0]["message"]["content"]
        else:
            reply = f"服务暂时不可用: {response.get('error', 'Unknown error')}"

        return {
            "agent_id": agent_id,
            "reply": reply,
            "intent": intent.name,
            "confidence": intent.confidence,
            "entities": intent.entities,
        }

    def get_agent_config(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """获取 AI 员工配置（从 store 读取，保持 ID 一致）"""
        from apps.agents.store import load_agents
        agents = load_agents()
        return next((a for a in agents if a["id"] == agent_id), None)

    def list_agents(self) -> List[Dict[str, Any]]:
        """列出所有 AI 员工（从 store 读取，保持 ID 一致）"""
        from apps.agents.store import load_agents
        agents = load_agents()
        return [
            {
                "id": a["id"],
                "code": a.get("code", ""),
                "name": a.get("name", ""),
                "role": a.get("role", ""),
                "status": a.get("status", "active"),
                "skills": a.get("skills", []),
            }
            for a in agents
        ]


# 全局单例
agent_service = AgentService()
