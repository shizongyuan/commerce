"""测试 AI 客户端"""
import pytest
from unittest.mock import patch, AsyncMock


class TestQwenClient:
    """Qwen 客户端测试"""

    def test_client_initialization(self):
        """测试客户端初始化"""
        from core.ai_client import QwenClient

        client = QwenClient(api_key="test-key")
        assert client.api_key == "test-key"
        assert client.model is not None
        assert client.base_url is not None

    def test_client_without_api_key(self):
        """测试无 API Key 时的处理"""
        from core.ai_client import QwenClient

        client = QwenClient(api_key=None)

        # 应该返回友好的错误消息而非抛出异常
        result = client.chat_sync([])
        assert "not configured" in result["choices"][0]["message"]["content"]

    @pytest.mark.asyncio
    async def test_chat_without_api_key(self):
        """测试异步调用无 API Key"""
        from core.ai_client import QwenClient

        client = QwenClient(api_key=None)
        result = await client.chat([])

        assert "choices" in result
        assert "error" in result
        assert "not configured" in result["error"]

    @pytest.mark.asyncio
    async def test_embeddings_returns_list(self):
        """测试嵌入向量返回"""
        from core.ai_client import QwenClient

        client = QwenClient(api_key=None)  # 无 key 时返回默认值
        result = await client.embeddings(["测试文本"])

        assert isinstance(result, list)
        assert len(result) == 1
        assert isinstance(result[0], list)

    def test_chat_sync_returns_format(self):
        """测试同步 chat 返回格式"""
        from core.ai_client import QwenClient

        client = QwenClient(api_key=None)
        result = client.chat_sync([{"role": "user", "content": "hi"}])

        assert "choices" in result
        assert len(result["choices"]) > 0
        assert "message" in result["choices"][0]
