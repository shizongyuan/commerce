"""
AI 对话服务 - 知识库注入 + 意图识别 + Skill 执行
"""
import logging

from .skill_loader import SkillLoader, Skill
from .skill_registry import SkillRegistry
from .skill_executor import SkillExecutor, ExecutionContext
from .tool_dispatcher import ToolDispatcher

logger = logging.getLogger(__name__)

import os
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class Intent:
    """意图识别结果"""
    name: str  # intent name: order_query, product_inquiry, complaint, etc.
    confidence: float
    entities: Dict[str, Any]
    response_strategy: str  # how to respond: answer, escalate, deflect


@dataclass
class Message:
    """对话消息"""
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = None


INTENT_PATTERNS = {
    "order_query": {
        "keywords": ["订单", "查订单", "发货", "物流", "到了吗", "什么时候", "order", "ship", "track"],
        "confidence_boost": 0.3,
    },
    "product_inquiry": {
        "keywords": ["产品", "怎么样", "好不好", "推荐", "适合", "product", "recommend"],
        "confidence_boost": 0.3,
    },
    "price_inquiry": {
        "keywords": ["价格", "多少钱", "优惠", "折扣", "price", "discount", "cheap"],
        "confidence_boost": 0.3,
    },
    "complaint": {
        "keywords": ["投诉", "差评", "太差", "不满", "问题", "complaint", "bad", "issue"],
        "confidence_boost": 0.4,
    },
    "refund": {
        "keywords": ["退款", "退货", "取消", "refund", "return", "cancel"],
        "confidence_boost": 0.3,
    },
    "greeting": {
        "keywords": ["你好", "hi", "hello", "在吗", "咨询"],
        "confidence_boost": 0.2,
    },
}


class KnowledgeBase:
    """知识库管理"""

    def __init__(self, knowledge_dir: str):
        self.knowledge_dir = knowledge_dir
        self._cache: Dict[str, str] = {}

    def load_all(self) -> Dict[str, str]:
        """加载所有知识库文件"""
        if self._cache:
            return self._cache

        for root, dirs, files in os.walk(self.knowledge_dir):
            for file in files:
                if file.endswith(".md"):
                    filepath = os.path.join(root, file)
                    relpath = os.path.relpath(filepath, self.knowledge_dir)
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            content = f.read()
                        self._cache[relpath] = content
                    except Exception as e:
                        logger.warning(f"Failed to read knowledge file {relpath}: {e}")
                        continue

        return self._cache

    def load_files(self, file_paths: List[str]) -> Dict[str, str]:
        """加载指定的知识库文件"""
        contents = {}
        base_dir = os.path.abspath(self.knowledge_dir)
        for path in file_paths:
            # 防止路径遍历
            normalized = os.path.normpath(path)
            if normalized.startswith(".."):
                continue

            filepath = os.path.join(self.knowledge_dir, normalized)
            # 确保文件在知识库目录内
            if not os.path.abspath(filepath).startswith(base_dir):
                continue

            if os.path.exists(filepath) and filepath.endswith(".md"):
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        contents[path] = f.read()
                except Exception as e:
                    logger.warning(f"Failed to load file {path}: {e}")
                    continue
        return contents

    def search(self, query: str, max_results: int = 3) -> List[Dict[str, str]]:
        """关键词搜索知识库"""
        results = []
        all_knowledge = self.load_all()
        query_lower = query.lower()

        for path, content in all_knowledge.items():
            title = path.replace(".md", "").replace("_", " ").title()
            content_lower = content.lower()

            # 简单关键词匹配
            if query_lower in title.lower() or query_lower in content_lower:
                # 提取相关段落
                lines = content.split("\n")
                matched_lines = []
                for line in lines:
                    if query_lower in line.lower():
                        matched_lines.append(line.strip())

                if matched_lines:
                    results.append({
                        "path": path,
                        "title": title,
                        "matched_content": "\n".join(matched_lines[:5]),
                        "full_content": content[:1000],  # 限制长度
                    })

        return results[:max_results]

    def get_context_for_intent(self, intent: Intent, query: str) -> str:
        """根据意图获取相关知识库上下文"""
        context_parts = []

        # 根据意图类型搜索相关知识
        if intent.name == "order_query":
            results = self.search("订单 发货 物流")
        elif intent.name == "product_inquiry":
            results = self.search("产品")
        elif intent.name == "complaint":
            results = self.search("投诉 售后")
        elif intent.name == "refund":
            results = self.search("退款 退货")
        elif intent.name == "price_inquiry":
            results = self.search("价格 优惠")
        else:
            results = self.search(query)

        for r in results:
            context_parts.append(f"【{r['title']}】\n{r['matched_content']}")

        return "\n\n".join(context_parts)


class IntentRecognizer:
    """意图识别器"""

    def __init__(self):
        self.patterns = INTENT_PATTERNS

    def recognize(self, message: str) -> Intent:
        """识别用户消息的意图"""
        message_lower = message.lower()
        intent_scores: Dict[str, float] = {}

        # 计算每个意图的得分
        for intent_name, config in self.patterns.items():
            score = 0.0
            for keyword in config["keywords"]:
                if keyword.lower() in message_lower:
                    score += 1.0

            if score > 0:
                score += config["confidence_boost"]

            intent_scores[intent_name] = score

        # 找出最高分的意图
        if not intent_scores or max(intent_scores.values()) == 0:
            return Intent(
                name="unknown",
                confidence=0.0,
                entities={},
                response_strategy="clarify",
            )

        best_intent = max(intent_scores.items(), key=lambda x: x[1])
        intent_name = best_intent[0]
        confidence = min(best_intent[1] / 3.0, 1.0)  # 归一化到 0-1

        # 提取实体
        entities = self._extract_entities(message, intent_name)

        # 确定响应策略
        strategy = self._determine_strategy(intent_name, confidence)

        return Intent(
            name=intent_name,
            confidence=confidence,
            entities=entities,
            response_strategy=strategy,
        )

    def _extract_entities(self, message: str, intent: str) -> Dict[str, Any]:
        """提取实体（订单号、手机号等）"""
        entities = {}

        # 订单号提取
        order_pattern = r"ORD[-\dA-Z]{8,}"
        orders = re.findall(order_pattern, message, re.IGNORECASE)
        if orders:
            entities["order_no"] = orders[0]

        # 手机号提取
        phone_pattern = r"1[3-9]\d{9}"
        phones = re.findall(phone_pattern, message)
        if phones:
            entities["phone"] = phones[0]

        return entities

    def _determine_strategy(self, intent: str, confidence: float) -> str:
        """确定响应策略"""
        if intent == "complaint":
            return "empathize"  # 先共情
        elif intent == "refund":
            return "process"  # 处理退款
        elif confidence < 0.5:
            return "clarify"  # 澄清问题
        else:
            return "answer"  # 直接回答


class ChatService:
    """聊天服务 - 整合知识库、意图识别和 Skill 执行"""

    def __init__(self, knowledge_dir: str, skills_dir: str = None):
        self.knowledge = KnowledgeBase(knowledge_dir)
        self.intent_recognizer = IntentRecognizer()

        # Skill 系统初始化
        self._skill_registry: Optional[SkillRegistry] = None
        self._skill_executor: Optional[SkillExecutor] = None
        self._tool_dispatcher: Optional[ToolDispatcher] = None
        self._agent_skills: Dict[str, Skill] = {}
        self._skill_contexts: Dict[str, ExecutionContext] = {}  # visitor_id -> context

        if skills_dir and os.path.exists(skills_dir):
            self._init_skill_system(skills_dir)

        # 系统提示词模板
        self.system_prompt_template = """你是一位专业的电商智能客服专员，隶属于某电商公司客户服务中心。
你的职责是帮助客户解决购物过程中的问题，提供优质的服务体验。

回复要求：
- 热情、友好、耐心，使用"您"称呼客户
- 回答简洁明了，不超过200字
- 遇到无法处理的问题时及时转人工

## 企业信息
- 企业名称: 某电商科技有限公司
- 客服热线: 400-xxx-xxxx
- 服务时间: 9:00-22:00

## 知识库上下文
{knowledge_context}

## 当前对话
{conversation_history}

请根据知识库上下文和对话历史，回答客户的问题。"""

    def _init_skill_system(self, skills_dir: str) -> None:
        """初始化 Skill 系统"""
        try:
            loader = SkillLoader(skills_dir)
            loader.load_all()

            self._skill_registry = SkillRegistry(loader)
            self._skill_registry.load_all()

            self._tool_dispatcher = ToolDispatcher()
            self._skill_executor = SkillExecutor(self._tool_dispatcher)

            logger.info(f"Skill system initialized with {len(self._skill_registry.get_all_skills())} skills")
        except Exception as e:
            logger.warning(f"Failed to initialize skill system: {e}")

    def bind_agent_skills(self, agent_skills: List[str]) -> None:
        """绑定 Agent 的 skills 配置"""
        if self._skill_registry and agent_skills:
            self._agent_skills = self._skill_registry.load_for_agent("current", agent_skills)
            logger.info(f"Bound {len(self._agent_skills)} skills to current agent")

    def bind_agent_skills_for_agent(self, agent_id: str, agent_skills: List[str]) -> None:
        """为指定 Agent 绑定 skills"""
        if self._skill_registry and agent_skills:
            self._agent_skills = self._skill_registry.load_for_agent(agent_id, agent_skills)
            logger.info(f"Bound {len(self._agent_skills)} skills to agent {agent_id}")

    def get_skill_context(self, visitor_id: str) -> Optional[ExecutionContext]:
        """获取访客的 Skill 执行上下文（用于多轮对话）"""
        return self._skill_contexts.get(visitor_id)

    def set_skill_context(self, visitor_id: str, context: ExecutionContext) -> None:
        """设置访客的 Skill 执行上下文"""
        self._skill_contexts[visitor_id] = context

    def clear_skill_context(self, visitor_id: str) -> None:
        """清除访客的 Skill 执行上下文"""
        if visitor_id in self._skill_contexts:
            del self._skill_contexts[visitor_id]

    def get_knowledge_context(self, knowledge_files: List[str] = None, intent: Intent = None, user_query: str = "") -> str:
        """获取知识库上下文"""
        context_parts = []

        # 如果指定了知识库文件，只加载这些文件
        if knowledge_files:
            files_content = self.knowledge.load_files(knowledge_files)
            for path, content in files_content.items():
                title = path.replace(".md", "").replace("_", " ").title()
                context_parts.append(f"【{title}】\n{content[:1500]}")
        else:
            # 否则使用通用搜索
            if intent:
                context_parts.append(self.knowledge.get_context_for_intent(intent, user_query))

        return "\n\n".join(context_parts) if context_parts else "（暂无相关知识库信息）"

    def build_system_prompt(
        self,
        conversation_history: List[Message],
        user_query: str,
        intent: Intent = None,
        knowledge_files: List[str] = None,
    ) -> List[Dict[str, str]]:
        """构建带知识库上下文的系统提示词"""

        if intent is None:
            intent = self.intent_recognizer.recognize(user_query)

        # 获取知识库上下文
        knowledge_context = self.get_knowledge_context(knowledge_files, intent, user_query)

        # 构建对话历史
        history_text = ""
        if conversation_history:
            history_lines = []
            for msg in conversation_history[-6:]:
                role = "用户" if msg.role == "user" else "客服"
                history_lines.append(f"{role}: {msg.content}")
            history_text = "\n".join(history_lines)
        else:
            history_text = "（首次对话）"

        # 填充模板
        system_prompt = self.system_prompt_template.format(
            knowledge_context=knowledge_context,
            conversation_history=history_text,
        )

        # 构建消息列表
        messages = [
            {"role": "system", "content": system_prompt},
        ]

        # 添加对话历史
        for msg in conversation_history[-10:]:  # 最近10轮
            messages.append({
                "role": msg.role,
                "content": msg.content,
            })

        # 添加用户最新问题
        messages.append({
            "role": "user",
            "content": user_query,
        })

        return messages

    async def generate_response(
        self,
        user_message: str,
        conversation_history: List[Message],
        qwen_client,
        knowledge_files: List[str] = None,
        visitor_id: str = None,
    ) -> Dict[str, Any]:
        """生成 AI 回复（异步版本）- 支持 Skill 执行"""
        # Step 0: 检查是否有进行中的 Skill 执行上下文
        if visitor_id and self._skill_executor and self._skill_registry:
            existing_context = self.get_skill_context(visitor_id)
            if existing_context:
                # 继续执行 Skill 流程
                skill = self._skill_registry.get_skill(existing_context.skill_id)
                if skill:
                    logger.info(f"Resuming skill {skill.id} at step {existing_context.current_step_index}")
                    result = await self._skill_executor.execute(
                        skill, existing_context, user_message, qwen_client
                    )
                    # 更新上下文
                    if not result.is_complete:
                        self.set_skill_context(visitor_id, existing_context)
                    else:
                        self.clear_skill_context(visitor_id)
                    return {
                        "reply": result.reply,
                        "intent": result.intent,
                        "skill_id": result.skill_id,
                        "requires_response": result.requires_response,
                        "is_complete": result.is_complete,
                    }

        # Step 1: 尝试 Skill 匹配
        if self._skill_registry and self._agent_skills:
            matched = self._skill_registry.match_skill(user_message, self._agent_skills)
            if matched:
                skill, confidence = matched
                logger.info(f"Matched skill: {skill.id} (confidence: {confidence:.2f})")

                # 创建执行上下文
                context = self._skill_executor.create_context(skill.id, user_message)

                # 执行 Skill
                result = await self._skill_executor.execute(
                    skill, context, user_message, qwen_client
                )

                # 如果需要继续对话，保存上下文
                if not result.is_complete and visitor_id:
                    self.set_skill_context(visitor_id, context)

                return {
                    "reply": result.reply,
                    "intent": result.intent,
                    "skill_id": result.skill_id,
                    "confidence": confidence,
                    "requires_response": result.requires_response,
                    "is_complete": result.is_complete,
                }

        # Step 2: Fallback - 使用原有意图识别
        intent = self.intent_recognizer.recognize(user_message)
        messages = self.build_system_prompt(conversation_history, user_message, intent, knowledge_files)

        return await self._do_chat(messages, intent, qwen_client)

    async def _do_chat(self, messages, intent, qwen_client) -> Dict[str, Any]:
        """执行聊天调用"""
        try:
            response = await qwen_client.chat(messages=messages)
        except Exception as e:
            response = {"error": str(e)}
        return self._process_response(response, intent)

    def _do_chat_sync(self, messages, intent, qwen_client) -> Dict[str, Any]:
        """同步执行聊天调用 - 使用线程池避免阻塞"""
        import httpx
        import concurrent.futures

        def _call_api():
            response = httpx.post(
                f"{qwen_client.base_url}/chat/completions",
                json={"model": qwen_client.model, "messages": messages},
                headers={"Authorization": f"Bearer {qwen_client.api_key}"},
                timeout=30.0,
            )
            return response.json()

        try:
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(_call_api)
                result = future.result(timeout=30)
        except Exception as e:
            result = {"choices": [{"message": {"content": f"Request failed: {e}"}}], "error": str(e)}
        return self._process_response(result, intent)

    def _process_response(self, response, intent) -> Dict[str, Any]:
        """处理 AI 响应"""
        if "error" in response:
            reply = f"抱歉，服务暂时不可用: {response['error']}"
            intent_name = "error"
        else:
            reply = response["choices"][0]["message"]["content"]
            intent_name = intent.name
        return {
            "reply": reply,
            "intent": intent_name,
            "confidence": intent.confidence,
            "entities": intent.entities,
        }
