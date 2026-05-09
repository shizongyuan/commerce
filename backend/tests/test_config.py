"""测试配置模块"""
import pytest
from unittest.mock import patch


class TestConfig:
    """配置测试"""

    def test_settings_has_required_fields(self):
        """测试配置包含必要字段"""
        from core.config import settings

        # 必要配置字段
        required_fields = [
            "qwen_api_key",
            "qwen_model",
            "qwen_base_url",
        ]

        for field in required_fields:
            assert hasattr(settings, field), f"Settings missing: {field}"

    def test_database_url_has_default(self):
        """测试数据库 URL 有默认值"""
        from core.config import settings

        # 数据库 URL 应该有默认值或为空
        assert hasattr(settings, "database_url")

    def test_redis_url_has_default(self):
        """测试 Redis URL 有默认值"""
        from core.config import settings

        assert hasattr(settings, "redis_url")
