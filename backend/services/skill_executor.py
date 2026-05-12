"""技能执行器 - 执行多步骤流程"""
import re
import logging
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List, Tuple
from .skill_loader import Skill, SkillStep
from .tool_dispatcher import ToolDispatcher, ToolCall, ToolResult

logger = logging.getLogger(__name__)


@dataclass
class ExecutionContext:
    """技能执行上下文"""
    skill_id: str
    current_step_index: int = 0
    user_message: str = ""
    collected_data: Dict[str, Any] = field(default_factory=dict)  # 已收集的信息
    step_results: List[Dict[str, Any]] = field(default_factory=list)  # 每步执行结果
    requires_response: bool = False  # 是否在等待用户输入
    is_complete: bool = False
    reply: str = ""


@dataclass
class ExecutionResult:
    """技能执行结果"""
    reply: str
    is_complete: bool
    intent: str
    skill_id: str
    requires_response: bool = False
    next_skill_id: Optional[str] = None
    context_data: Optional[Dict[str, Any]] = None


class SkillExecutor:
    """技能执行器，处理多步骤流程"""

    def __init__(self, tool_dispatcher: ToolDispatcher):
        self.tool_dispatcher = tool_dispatcher

    async def execute(
        self,
        skill: Skill,
        context: ExecutionContext,
        user_message: str,
        llm_client
    ) -> ExecutionResult:
        """执行技能流程的主入口"""
        logger.info(f"SkillExecutor executing skill: {skill.id}, step: {context.current_step_index}")

        # 更新用户消息
        if user_message:
            context.user_message = user_message

        # 确定当前步骤
        current_step = self._get_current_step(skill, context.current_step_index)
        if not current_step:
            context.is_complete = True
            return self._create_result(context, skill, "无法确定执行步骤")

        # 根据 action_type 处理
        action_type = current_step.action_type

        if action_type == "ask_info":
            return await self._handle_ask_info(skill, context, current_step, user_message, llm_client)
        elif action_type == "call_tool":
            return await self._handle_call_tool(skill, context, current_step)
        elif action_type == "confirm":
            return await self._handle_confirm(skill, context, current_step, user_message, llm_client)
        elif action_type == "final_answer":
            return await self._handle_final_answer(skill, context, current_step)
        else:
            logger.warning(f"Unknown action_type: {action_type}, defaulting to ask_info")
            return await self._handle_ask_info(skill, context, current_step, user_message, llm_client)

    def _get_current_step(self, skill: Skill, step_index: int) -> Optional[SkillStep]:
        """获取当前步骤"""
        if 0 <= step_index < len(skill.steps):
            return skill.steps[step_index]
        return None

    def _create_result(
        self, context: ExecutionContext, skill: Skill, default_reply: str = ""
    ) -> ExecutionResult:
        """创建执行结果"""
        return ExecutionResult(
            reply=context.reply or default_reply,
            is_complete=context.is_complete,
            intent=skill.id,
            skill_id=skill.id,
            requires_response=context.requires_response,
            context_data={
                "step_index": context.current_step_index,
                "collected_data": context.collected_data
            }
        )

    async def _handle_ask_info(
        self,
        skill: Skill,
        context: ExecutionContext,
        step: SkillStep,
        user_message: str,
        llm_client
    ) -> ExecutionResult:
        """处理 ask_info 类型的步骤 - 收集信息"""
        # 从描述中提取需要的信息类型
        required_fields = self._extract_required_fields(step.description)

        # 检查是否已收集到信息
        newly_collected = self._extract_info_from_message(user_message, required_fields)
        context.collected_data.update(newly_collected)

        # 检查是否收集完整
        missing_fields = [f for f in required_fields if f not in context.collected_data]

        if missing_fields:
            # 生成追问提示
            context.requires_response = True
            context.reply = self._generate_ask_info_prompt(step, missing_fields)
            return self._create_result(context, skill)
        else:
            # 信息收集完整，进入下一步
            context.current_step_index += 1
            context.requires_response = False

            # 检查是否还有下一步
            if context.current_step_index >= len(skill.steps):
                context.is_complete = True
                context.reply = "信息已收集完毕。"
                return self._create_result(context, skill)
            else:
                # 继续执行下一步
                return await self.execute(skill, context, "", llm_client)

    async def _handle_call_tool(
        self,
        skill: Skill,
        context: ExecutionContext,
        step: SkillStep
    ) -> ExecutionResult:
        """处理 call_tool 类型的步骤 - 调用工具"""
        tool_name = step.tool_name

        if not tool_name:
            logger.warning(f"Step {step.id} has action_type call_tool but no tool_name")
            context.current_step_index += 1
            return await self.execute(skill, context, "", None)

        # 构建工具调用参数
        tool_params = step.tool_params or {}
        call_params = {}

        # 从 collected_data 中填充参数
        for param_name, param_desc in tool_params.items():
            if param_name in context.collected_data:
                call_params[param_name] = context.collected_data[param_name]

        # 执行工具调用
        tool_call = ToolCall(name=tool_name, params=call_params)
        result = await self.tool_dispatcher.execute(tool_call)

        context.step_results.append({
            "step": step.id,
            "tool": tool_name,
            "result": result.data if result.success else None,
            "error": result.error if not result.success else None
        })

        if result.success:
            # 工具调用成功，解析结果并生成回复
            context.reply = self._generate_tool_response(skill, step, result.data)
            context.current_step_index += 1

            if context.current_step_index >= len(skill.steps):
                context.is_complete = True
            else:
                # 继续下一步
                return await self.execute(skill, context, "", None)
        else:
            context.reply = f"抱歉，查询失败：{result.error}。请稍后重试。"
            context.requires_response = True

        return self._create_result(context, skill)

    async def _handle_confirm(
        self,
        skill: Skill,
        context: ExecutionContext,
        step: SkillStep,
        user_message: str,
        llm_client
    ) -> ExecutionResult:
        """处理 confirm 类型的步骤 - 请求确认"""
        context.requires_response = True

        # 检查用户是否确认
        affirmative_patterns = ["是", "对的", "确认", "好的", "ok", "yes", "是"]
        negative_patterns = ["不", "否", "取消", "算了", "no"]

        user_lower = user_message.lower()
        is_affirmative = any(p in user_lower for p in affirmative_patterns)
        is_negative = any(p in user_lower for p in negative_patterns)

        if is_affirmative:
            context.current_step_index += 1
            context.requires_response = False
            return await self.execute(skill, context, "", llm_client)
        elif is_negative and user_message:
            context.reply = "已取消。有其他需要帮助的吗？"
            context.is_complete = True
            return self._create_result(context, skill)
        else:
            # 继续等待确认
            context.reply = step.description + " 请确认是否继续。（是/否）"
            return self._create_result(context, skill)

    async def _handle_final_answer(
        self,
        skill: Skill,
        context: ExecutionContext,
        step: SkillStep
    ) -> ExecutionResult:
        """处理 final_answer 类型的步骤 - 生成最终回复"""
        context.is_complete = True

        # 如果有 response_table，根据 collected_data 生成回复
        if step.response_table:
            # 查找匹配的状态
            state_key = context.collected_data.get("status", "")
            if state_key in step.response_table:
                context.reply = step.response_table[state_key]
            else:
                # 遍历表格找匹配的key
                for key, response in step.response_table.items():
                    if key in context.user_message or key in str(context.step_results):
                        context.reply = response
                        break
                else:
                    context.reply = step.description
        else:
            context.reply = step.description

        # 添加上下文信息
        if context.step_results:
            last_result = context.step_results[-1]
            if last_result.get("result"):
                # 在回复中附加工具返回的数据
                data = last_result["result"]
                if isinstance(data, dict):
                    if "tracking_no" in data:
                        context.reply += f" 运单号：{data['tracking_no']}"
                    if "express" in data:
                        context.reply += f" 快递：{data['express']}"

        return self._create_result(context, skill)

    def _extract_required_fields(self, description: str) -> List[str]:
        """从步骤描述中提取需要的信息字段"""
        fields = []

        # 订单相关
        if "手机号" in description:
            fields.append("phone")
        if "订单号" in description:
            fields.append("order_no")

        # 产品相关
        if "产品" in description or "类别" in description:
            fields.append("product_keyword")
            fields.append("category")

        # 其他通用字段
        if "姓名" in description:
            fields.append("name")
        if "地址" in description:
            fields.append("address")

        return list(set(fields))

    def _extract_info_from_message(
        self, message: str, required_fields: List[str]
    ) -> Dict[str, str]:
        """从用户消息中提取信息"""
        extracted = {}

        if "phone" in required_fields:
            # 尝试提取手机号后4位
            phone_match = re.search(r'(\d{4})', message)
            if phone_match:
                extracted["phone"] = phone_match.group(1)

        if "order_no" in required_fields:
            # 尝试提取订单号
            order_match = re.search(r'(ORD\d+)', message.upper())
            if order_match:
                extracted["order_no"] = order_match.group(1)
            elif "订单" in message:
                # 如果用户提到订单但不完整，记录下来
                extracted["mentioned_order"] = True

        return extracted

    def _generate_ask_info_prompt(
        self, step: SkillStep, missing_fields: List[str]
    ) -> str:
        """生成信息收集提示词"""
        prompt_templates = {
            "phone": "请问您的手机号后4位是多少？",
            "order_no": "请问您的订单号是多少？",
            "product_keyword": "请问您想查询什么产品？",
            "category": "请问您想了解哪个品类？",
        }

        prompts = []
        for field in missing_fields:
            if field in prompt_templates:
                prompts.append(prompt_templates[field])

        if prompts:
            return " ".join(prompts) + " " + step.description[:50]
        else:
            return step.description[:100]

    def _generate_tool_response(
        self, skill: Skill, step: SkillStep, data: Any
    ) -> str:
        """根据工具返回数据生成回复"""
        if not data or isinstance(data, dict) and "error" in data:
            return f"抱歉，查询失败：{data.get('error', '未知错误')}"

        if isinstance(data, dict):
            if "order_no" in data:
                status = data.get("status", "未知")
                express = data.get("express", "")
                tracking = data.get("tracking_no", "")

                response = f"您的订单 {data['order_no']} 状态：{status}"
                if express:
                    response += f"，快递：{express}"
                if tracking:
                    response += f"，运单号：{tracking}"
                return response
            elif "tracking_no" in data:
                return f"物流信息：{data.get('current_location', '运输中')}，预计{data.get('eta', '稍后')}送达"
            elif "products" in data:
                products = data["products"]
                if products:
                    names = [p.get("name", "") for p in products[:3]]
                    return f"为您找到：{'、'.join(names)}"
                return "未找到相关产品"

        return str(data)

    def create_context(
        self,
        skill_id: str,
        user_message: str = "",
        existing_data: Dict[str, Any] = None,
        step_index: int = 0
    ) -> ExecutionContext:
        """创建新的执行上下文"""
        return ExecutionContext(
            skill_id=skill_id,
            current_step_index=step_index,
            user_message=user_message,
            collected_data=existing_data or {},
            requires_response=False,
            is_complete=False
        )

    def resume_context(
        self, skill_id: str, step_index: int, collected_data: Dict[str, Any]
    ) -> ExecutionContext:
        """从中断处恢复执行上下文"""
        return ExecutionContext(
            skill_id=skill_id,
            current_step_index=step_index,
            collected_data=collected_data,
            requires_response=False,
            is_complete=False
        )