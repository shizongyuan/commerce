"""测试 Agent 服务"""
import pytest
from unittest.mock import patch, AsyncMock


class TestAgentService:
    """Agent 服务测试"""

    def test_list_agents_returns_list(self):
        """测试列出所有 Agent"""
        from services.agent_service import AgentService

        service = AgentService()
        agents = service.list_agents()

        assert isinstance(agents, list)
        assert len(agents) > 0

    def test_agent_has_required_fields(self, sample_agent_ids):
        """测试 Agent 包含必要字段"""
        from services.agent_service import AgentService

        service = AgentService()
        agents = service.list_agents()

        required_fields = ["id", "code", "name", "role", "status"]
        for agent in agents:
            for field in required_fields:
                assert field in agent, f"Agent missing field: {field}"

    def test_get_agent_config_valid_id(self):
        """测试获取有效 Agent 配置"""
        from services.agent_service import AgentService

        service = AgentService()
        config = service.get_agent_config("xiaoxue")

        assert config is not None
        assert config["id"] == "xiaoxue"
        assert "name" in config
        assert "role" in config

    def test_get_agent_config_invalid_id(self):
        """测试获取无效 Agent 配置"""
        from services.agent_service import AgentService

        service = AgentService()
        config = service.get_agent_config("nonexistent_agent")

        assert config is None

    @pytest.mark.asyncio
    async def test_chat_returns_response_format(self, mock_messages):
        """测试对话返回正确格式"""
        from services.agent_service import AgentService

        service = AgentService()

        # Mock qwen_client
        with patch("services.agent_service.qwen_client") as mock_client:
            mock_client.chat = AsyncMock(
                return_value={
                    "choices": [{"message": {"content": "测试回复"}}]
                }
            )

            result = await service.chat("xiaoxue", mock_messages)

            assert isinstance(result, dict)
            assert "agent_id" in result
            assert "reply" in result
            assert "intent" in result
            assert result["agent_id"] == "xiaoxue"

    @pytest.mark.asyncio
    async def test_chat_handles_api_error(self, mock_messages):
        """测试对话处理 API 错误"""
        from services.agent_service import AgentService

        service = AgentService()

        # Mock qwen_client 返回错误
        with patch("services.agent_service.qwen_client") as mock_client:
            mock_client.chat = AsyncMock(
                return_value={"error": "API Error", "choices": []}
            )

            result = await service.chat("xiaoxue", mock_messages)

            assert "reply" in result
            assert result["reply"] is not None
