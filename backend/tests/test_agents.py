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
        config = service.get_agent_config("nonexistent_agent_12345")

        assert config is None

    def test_list_agents_count(self):
        """测试 Agent 数量"""
        from services.agent_service import AgentService

        service = AgentService()
        agents = service.list_agents()

        # 应该有至少4个Agent: xiaoxue, xiaobing, xiaoyu, xiaohongshu
        assert len(agents) >= 4

    def test_agent_ids_are_unique(self):
        """测试 Agent ID 唯一性"""
        from services.agent_service import AgentService

        service = AgentService()
        agents = service.list_agents()
        ids = [a["id"] for a in agents]

        assert len(ids) == len(set(ids)), "Agent IDs should be unique"
