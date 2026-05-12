"""技能注册表 - 管理已加载的技能，提供匹配和查找"""
import logging
from typing import Optional, List, Dict, Tuple
from .skill_loader import Skill, SkillLoader

logger = logging.getLogger(__name__)


class SkillRegistry:
    """技能注册表，管理所有已加载技能"""

    def __init__(self, loader: SkillLoader):
        self._loader = loader
        self._skills: Dict[str, Skill] = {}
        self._keyword_index: Dict[str, str] = {}  # trigger_word → skill_id
        self._loaded_for_agent: Dict[str, Dict[str, Skill]] = {}  # agent_id → {skill_id → skill}

    def load_all(self) -> Dict[str, Skill]:
        """加载所有技能并构建关键词索引"""
        self._skills = self._loader.load_all()
        self._build_keyword_index()
        logger.info(f"SkillRegistry loaded {len(self._skills)} skills")
        return self._skills

    def _build_keyword_index(self) -> None:
        """构建关键词到技能ID的映射"""
        self._keyword_index.clear()
        for skill_id, skill in self._skills.items():
            for keyword in skill.trigger_keywords:
                # 支持精确匹配和模糊匹配
                self._keyword_index[keyword] = skill_id
                # 也索引关键词的前缀（至少4字以上）
                if len(keyword) >= 4:
                    for i in range(2, len(keyword)):
                        prefix = keyword[:i]
                        if prefix not in self._keyword_index:
                            self._keyword_index[prefix] = skill_id

    def load_for_agent(self, agent_id: str, agent_skills: List[str]) -> Dict[str, Skill]:
        """根据 agent 配置的 skills [] 加载对应技能"""
        if agent_id in self._loaded_for_agent:
            return self._loaded_for_agent[agent_id]

        loaded = {}
        for skill_id in agent_skills:
            skill = self._skills.get(skill_id)
            if skill:
                loaded[skill_id] = skill
            else:
                # 尝试从loader加载
                skill = self._loader.load(skill_id)
                if skill:
                    loaded[skill_id] = skill
                    self._skills[skill_id] = skill

        self._loaded_for_agent[agent_id] = loaded
        logger.info(f"Loaded {len(loaded)} skills for agent {agent_id}")
        return loaded

    def get_skill(self, skill_id: str) -> Optional[Skill]:
        """通过 skill_id 获取技能"""
        return self._skills.get(skill_id)

    def get_all_skills(self) -> Dict[str, Skill]:
        """获取所有已加载技能"""
        return self._skills

    def match_skill(
        self, message: str, agent_skills: Optional[Dict[str, Skill]] = None
    ) -> Optional[Tuple[Skill, float]]:
        """根据用户消息匹配技能，返回 (skill, confidence)"""
        search_in = agent_skills if agent_skills else self._skills

        if not search_in:
            return None

        message_lower = message.lower()
        scores: Dict[str, float] = {}

        for skill_id, skill in search_in.items():
            # 先检查排除词
            for exclude_kw, target_skill in skill.exclude_keywords.items():
                if exclude_kw.lower() in message_lower:
                    # 排除词命中，但不一定完全排除，继续检查其他技能
                    pass

            # 计算触发词匹配得分
            matched = 0
            total = len(skill.trigger_keywords)
            for keyword in skill.trigger_keywords:
                if keyword.lower() in message_lower:
                    matched += 1
                else:
                    # 检查关键词的任何一个字/词是否在消息中
                    for kw_part in keyword:
                        if len(kw_part) >= 2 and kw_part in message_lower:
                            matched += 0.5
                            break

            if total > 0:
                confidence = matched / total
                if matched > 0:
                    scores[skill_id] = confidence

        if not scores:
            return None

        # 返回得分最高的技能
        best_skill_id = max(scores, key=scores.get)
        best_confidence = scores[best_skill_id]

        if best_confidence >= 0.15:  # Lowered threshold to allow 1-match detection
            return (search_in[best_skill_id], best_confidence)

        return None

    def find_skill_by_intent(self, intent: str) -> Optional[Skill]:
        """根据意图名称查找对应技能"""
        # intent 可能是 "order_query" -> skill_order_query
        possible_ids = [
            f"skill_{intent}",
            intent,
            f"skill_{intent.replace('_', '')}",
        ]
        for pid in possible_ids:
            if pid in self._skills:
                return self._skills[pid]
        return None

    def reload(self) -> None:
        """重新加载所有技能"""
        self._loader.reload()
        self._skills = self._loader.load_all()
        self._build_keyword_index()
        self._loaded_for_agent.clear()