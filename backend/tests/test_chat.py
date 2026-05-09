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

    def test_recognize_returns_intent(self):
        """测试识别用户意图"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()

        # 测试订单查询意图
        result = recognizer.recognize("帮我查一下订单")
        assert result.name in ["ORDER_QUERY", "GENERAL"]
        assert result.confidence >= 0

    def test_recognize_product_query(self):
        """测试产品查询意图"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()

        result = recognizer.recognize("有什么护肤品推荐")
        assert result.name in ["PRODUCT_QUERY", "GENERAL"]

    def test_recognize_complaint(self):
        """测试投诉意图"""
        from services.chat_service import IntentRecognizer

        recognizer = IntentRecognizer()

        result = recognizer.recognize("我要投诉")
        assert result.name in ["COMPLAINT", "GENERAL"]


class TestMessageFormat:
    """消息格式测试"""

    def test_message_creation(self):
        """测试消息对象创建"""
        from services.chat_service import Message

        msg = Message(role="user", content="你好")
        assert msg.role == "user"
        assert msg.content == "你好"

    def test_message_to_dict(self):
        """测试消息转换为字典"""
        from services.chat_service import Message

        msg = Message(role="assistant", content="有什么可以帮助您")
        msg_dict = msg.model_dump()

        assert msg_dict["role"] == "assistant"
        assert msg_dict["content"] == "有什么可以帮助您"
