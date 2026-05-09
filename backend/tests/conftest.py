"""测试 conftest - 共享 fixtures"""
import pytest
import sys
from pathlib import Path

# 添加 backend 目录到路径
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


@pytest.fixture
def mock_messages():
    """模拟对话消息"""
    return [
        {"role": "user", "content": "你好"},
        {"role": "assistant", "content": "您好！我是AI助手。"},
    ]


@pytest.fixture
def sample_agent_ids():
    """测试用 Agent ID 列表"""
    return ["xiaoxue", "xiaobing", "xiaoyu", "xiaohongshu"]
