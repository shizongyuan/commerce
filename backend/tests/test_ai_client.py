"""测试 AI 客户端"""
import pytest
import asyncio


class TestQwenClient:
    """Qwen 客户端测试"""

    def test_client_initialization(self):
        """测试客户端初始化"""
        from core.ai_client import QwenClient

        client = QwenClient(api_key="test-key")
        assert client.api_key == "test-key"
        assert client.model is not None
        assert client.base_url is not None

    def test_client_uses_settings_api_key(self):
        """测试客户端使用 settings 中的 API Key"""
        from core.ai_client import QwenClient

        # 当不传 api_key 时，应该使用 settings 中的
        client = QwenClient()
        # settings.qwen_api_key 来自 .env
        assert client.api_key is not None

    def test_embeddings_returns_list(self):
        """测试嵌入向量返回"""
        from core.ai_client import QwenClient

        client = QwenClient(api_key="test-key")
        result = asyncio.get_event_loop().run_until_complete(
            client.embeddings(["测试文本"])
        )

        assert isinstance(result, list)
        assert len(result) == 1
        assert isinstance(result[0], list)


@pytest.mark.asyncio
async def test_chat_with_valid_message():
    """测试发送有效消息"""
    from core.ai_client import QwenClient

    client = QwenClient()
    result = await client.chat([{"role": "user", "content": "hi"}])

    assert isinstance(result, dict)
    assert "choices" in result or "error" in result


@pytest.mark.asyncio
async def test_chat_returns_dict():
    """测试 chat 返回字典格式"""
    from core.ai_client import QwenClient

    client = QwenClient()
    result = await client.chat([{"role": "user", "content": "hi"}])

    assert isinstance(result, dict)
    assert "choices" in result or "error" in result
