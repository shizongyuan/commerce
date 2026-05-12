"""工具调度器 - 将技能工具定义映射到实际实现"""
import logging
from dataclasses import dataclass
from typing import Optional, Dict, Any, Callable, Awaitable
from .skill_loader import Skill

logger = logging.getLogger(__name__)


@dataclass
class ToolCall:
    """工具调用请求"""
    name: str
    params: Dict[str, Any]


@dataclass
class ToolResult:
    """工具调用结果"""
    success: bool
    data: Any
    error: Optional[str] = None


ToolHandler = Callable[[], Awaitable[Any]]


class ToolDispatcher:
    """工具调度器 - 将技能工具名称映射到实际实现"""

    def __init__(self):
        self._handlers: Dict[str, Callable] = {}
        self._register_default_handlers()

    def _register_default_handlers(self) -> None:
        """注册默认工具处理器"""
        self.register_handler("query_order", self._handle_query_order)
        self.register_handler("get_logistics", self._handle_get_logistics)
        self.register_handler("query_product", self._handle_query_product)

    def register_handler(self, tool_name: str, handler: Callable) -> None:
        """注册工具处理器"""
        self._handlers[tool_name] = handler
        logger.debug(f"Registered handler for tool: {tool_name}")

    async def execute(self, tool_call: ToolCall) -> ToolResult:
        """执行工具调用"""
        handler = self._handlers.get(tool_call.name)
        if not handler:
            logger.warning(f"No handler found for tool: {tool_call.name}")
            return ToolResult(
                success=False,
                data=None,
                error=f"Unknown tool: {tool_call.name}"
            )

        try:
            result = await handler(**tool_call.params)
            return ToolResult(success=True, data=result)
        except Exception as e:
            logger.error(f"Tool execution failed: {tool_call.name}, error: {e}")
            return ToolResult(success=False, data=None, error=str(e))

    async def _handle_query_order(self, phone: str = None, order_no: str = None) -> Dict[str, Any]:
        """订单查询工具实现"""
        # 这里应该调用后端 API / 数据库查询订单
        # 目前返回 mock 数据用于测试
        logger.info(f"query_order called: phone={phone}, order_no={order_no}")

        # 模拟订单数据
        if order_no:
            return {
                "order_no": order_no,
                "status": "已发货",
                "create_time": "2026-05-08 10:30:00",
                "shipping_time": "2026-05-09 14:20:00",
                "express": "顺丰快递",
                "tracking_no": "SF1234567890",
                "amount": 299.00,
                "items": [
                    {"name": "焕美修护精华液", "quantity": 2, "price": 149.50}
                ]
            }
        elif phone:
            # 模拟根据手机号查到的订单
            return {
                "orders": [
                    {
                        "order_no": "ORD20260508001",
                        "status": "已发货",
                        "create_time": "2026-05-08 10:30:00",
                        "amount": 299.00
                    },
                    {
                        "order_no": "ORD20260506002",
                        "status": "已签收",
                        "create_time": "2026-05-06 15:20:00",
                        "amount": 159.00
                    }
                ]
            }
        else:
            return {"error": "请提供订单号或手机号后4位"}

    async def _handle_get_logistics(self, order_no: str) -> Dict[str, Any]:
        """物流查询工具实现"""
        logger.info(f"get_logistics called: order_no={order_no}")

        # 模拟物流数据
        return {
            "order_no": order_no,
            "status": "运输中",
            "express": "顺丰快递",
            "tracking_no": "SF1234567890",
            "current_location": "上海市浦东转运中心",
            "trace": [
                {"time": "2026-05-09 14:20:00", "location": "广州发货中心", "status": "已发出"},
                {"time": "2026-05-10 08:30:00", "location": "上海浦东转运中心", "status": "运输中"},
                {"time": "2026-05-10 12:00:00", "location": "上海浦东转运中心", "status": "派送中"},
            ],
            "eta": "2026-05-11 14:00前"
        }

    async def _handle_query_product(self, keyword: str = None, category: str = None) -> Dict[str, Any]:
        """产品查询工具实现"""
        logger.info(f"query_product called: keyword={keyword}, category={category}")

        # 模拟产品搜索
        products = [
            {"id": "P001", "name": "焕美修护精华液", "price": 149.50, "category": "精华"},
            {"id": "P002", "name": "焕美保湿面霜", "price": 199.00, "category": "面霜"},
            {"id": "P003", "name": "焕美洁面乳", "price": 89.00, "category": "洁面"},
        ]

        if keyword:
            filtered = [p for p in products if keyword in p["name"]]
            return {"products": filtered if filtered else products}
        return {"products": products}

    def get_tool_schemas(self, tools: list) -> list:
        """从技能工具定义生成 LLM tool schemas"""
        schemas = []
        for tool in tools:
            schema = {
                "type": "function",
                "function": {
                    "name": tool.get("name", ""),
                    "description": tool.get("description", ""),
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            }

            params = tool.get("params", {})
            for param_name, param_desc in params.items():
                schema["function"]["parameters"]["properties"][param_name] = {
                    "type": "string",
                    "description": param_desc
                }

            if params:
                schema["function"]["parameters"]["required"] = list(params.keys())

            schemas.append(schema)

        return schemas

    def has_handler(self, tool_name: str) -> bool:
        """检查是否有该工具的处理器"""
        return tool_name in self._handlers