"""测试 Chat 服务"""
import pytest
from unittest.mock import patch, MagicMock


class TestChatService:
    """Chat 服务测试"""

    def test_intent_recognizer_initialization(self):
        """测试意图识别器初始化"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()
        assert recognizer is not None

    def test_recognize_order_query(self):
        """测试订单查询意图识别"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()
        result = recognizer.recognize("帮我查一下订单")

        assert result.name == "order_query"
        assert result.confidence >= 0
        assert result.response_strategy in ["answer", "clarify"]

    def test_recognize_product_inquiry(self):
        """测试产品咨询意图识别"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()
        result = recognizer.recognize("有什么护肤品推荐")

        assert result.name == "product_inquiry"
        assert result.confidence >= 0

    def test_recognize_complaint(self):
        """测试投诉意图识别"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()
        result = recognizer.recognize("我要投诉你们的服务")

        assert result.name == "complaint"
        assert result.response_strategy == "empathize"

    def test_recognize_refund(self):
        """测试退款意图识别"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()
        result = recognizer.recognize("申请退款退货")

        assert result.name == "refund"
        assert result.response_strategy == "process"

    def test_recognize_greeting(self):
        """测试问候语意图识别"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()
        result = recognizer.recognize("你好，在吗")

        assert result.name == "greeting"

    def test_recognize_unknown(self):
        """测试未知意图"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()
        result = recognizer.recognize("asdfghjkl12345")

        # 未知意图应返回 unknown 或最低分意图
        assert result is not None
        assert hasattr(result, 'name')
        assert hasattr(result, 'confidence')


class TestMessageFormat:
    """消息格式测试"""

    def test_message_creation(self):
        """测试消息对象创建"""
        from services.chat_service import Message

        msg = Message(role="user", content="你好")
        assert msg.role == "user"
        assert msg.content == "你好"

    def test_message_with_metadata(self):
        """测试带元数据的消息"""
        from services.chat_service import Message

        msg = Message(role="assistant", content="有什么可以帮助您", metadata={"source": "ai"})
        assert msg.metadata["source"] == "ai"


class TestKnowledgeBase:
    """知识库测试"""

    def test_knowledge_base_initialization(self):
        """测试知识库初始化"""
        from services.chat_service import KnowledgeBase
        import tempfile
        import os

        with tempfile.TemporaryDirectory() as tmpdir:
            kb = KnowledgeBase(tmpdir)
            assert kb.knowledge_dir == tmpdir
            assert kb._cache == {}

    def test_load_files_empty_dir(self):
        """测试加载空目录"""
        from services.chat_service import KnowledgeBase
        import tempfile

        with tempfile.TemporaryDirectory() as tmpdir:
            kb = KnowledgeBase(tmpdir)
            result = kb.load_files([])
            assert result == {}

    def test_search_no_results(self):
        """测试搜索无结果"""
        from services.chat_service import KnowledgeBase
        import tempfile

        with tempfile.TemporaryDirectory() as tmpdir:
            kb = KnowledgeBase(tmpdir)
            result = kb.search("nonexistent_query_12345")
            assert result == []
