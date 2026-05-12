"""Skill file loader - parse agents/skills/*.md into Skill objects"""
import re
import json
import logging
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


@dataclass
class SkillStep:
    id: str
    title: str
    action_type: str
    description: str
    tool_name: Optional[str] = None
    tool_params: Optional[Dict[str, str]] = None
    response_table: Optional[Dict[str, str]] = None


@dataclass
class Skill:
    id: str
    name: str
    code: str
    version: str = "v1.0"
    status: str = "enabled"
    trigger_keywords: List[str] = field(default_factory=list)
    exclude_keywords: Dict[str, str] = field(default_factory=dict)
    steps: List[SkillStep] = field(default_factory=list)
    tools: List[Dict[str, Any]] = field(default_factory=list)
    faq: List[Dict[str, str]] = field(default_factory=list)
    raw_content: str = ""


class SkillLoader:
    def __init__(self, skills_dir: str):
        self.skills_dir = Path(skills_dir)
        self._cache: Dict[str, Skill] = {}

    def load_all(self) -> Dict[str, Skill]:
        skills = {}
        if not self.skills_dir.exists():
            logger.warning(f"Skills directory not found: {self.skills_dir}")
            return skills

        for md_file in self.skills_dir.glob("skill_*.md"):
            skill = self.load(md_file.stem)
            if skill:
                skills[skill.id] = skill

        logger.info(f"Loaded {len(skills)} skills from {self.skills_dir}")
        return skills

    def load(self, skill_id: str) -> Optional[Skill]:
        if skill_id in self._cache:
            return self._cache[skill_id]

        file_path = self.skills_dir / f"{skill_id}.md"
        if not file_path.exists():
            logger.warning(f"Skill file not found: {file_path}")
            return None

        try:
            content = file_path.read_text(encoding="utf-8")
            skill = self._parse_skill_file(content, skill_id)
            self._cache[skill_id] = skill
            return skill
        except Exception as e:
            logger.error(f"Failed to parse skill {skill_id}: {e}")
            return None

    def _parse_skill_file(self, content: str, filename: str) -> Skill:
        skill = Skill(id=filename, name="", code="", raw_content=content)
        skill = self._parse_basic_info(content, skill)
        skill = self._parse_trigger_section(content, skill)
        skill = self._parse_execution_flow(content, skill)
        skill = self._parse_tools_section(content, skill)
        skill = self._parse_faq_section(content, skill)
        return skill

    def _parse_basic_info(self, content: str, skill: Skill) -> Skill:
        pattern = r"## 技能基础信息\s*\n((?:\s*[-*].+\n)+)"
        match = re.search(pattern, content)
        if not match:
            return skill

        lines = match.group(1).strip().split("\n")
        for line in lines:
            line = line.strip().lstrip("-*").strip()
            if ":" in line:
                key, value = line.split(":", 1)
                value = value.strip()
                if "技能名称" in key:
                    skill.name = value
                elif "技能编号" in key:
                    skill.code = value
                elif "版本" in key:
                    skill.version = value

        return skill

    def _parse_trigger_section(self, content: str, skill: Skill) -> Skill:
        # Try nested ## 触发条件 structure
        # Note: uses (?=\n## ) lookahead - newline, hash, space
        trigger_section = re.search(
            r"## 触发条件\n(.*?)(?=\n## )",
            content,
            re.DOTALL
        )

        if trigger_section:
            section = trigger_section.group(1)
            # Trigger keywords - use DOTALL so . matches newlines
            triggers_match = re.search(
                r"### 触发词\n(.*?)(?=\n###)",
                section,
                re.DOTALL
            )
            if triggers_match:
                keywords = re.findall(r'[-*]?\s*"([^"]+)"', triggers_match.group(1))
                skill.trigger_keywords = keywords
            # Exclude keywords
            exclude_match = re.search(
                r"排除词\n(.*?)(?=\n###|\Z)",
                section,
                re.DOTALL
            )
            if exclude_match:
                for line in exclude_match.group(1).strip().split("\n"):
                    if "→" in line:
                        parts = line.split("→")
                        if len(parts) == 2:
                            keyword = parts[0].strip().strip('"*')
                            target = parts[1].strip()
                            skill.exclude_keywords[keyword] = target
        else:
            # Direct ## 触发词
            triggers_match = re.search(
                r"## 触发词\n((?:\s*[-*\"]\.\+\n)+)",
                content
            )
            if triggers_match:
                keywords = re.findall(r'[-*]?\s*"([^"]+)"', triggers_match.group(1))
                skill.trigger_keywords = keywords

        return skill

    def _parse_execution_flow(self, content: str, skill: Skill) -> Skill:
        flow_match = re.search(
            r"## 执行流程\s*\n((?:.|\n)+?)(?=## 工具定义|## 常见问答|## 常见问答|$)",
            content,
            re.DOTALL
        )
        if not flow_match:
            return skill

        flow_content = flow_match.group(1)

        step_pattern = r"### 步骤(\d+):\s*([^\n]+)\n((?:(?!### 步骤)[^\n]|\n(?!### 步骤))+)"
        step_matches = re.findall(step_pattern, flow_content, re.DOTALL)

        for idx, step_match in enumerate(step_matches):
            step_num = step_match[0]
            step_title = step_match[1].strip()
            step_body = step_match[2].strip()

            action_type = self._determine_action_type(step_body)
            response_table = self._extract_table_from_body(step_body)

            step = SkillStep(
                id=f"step_{step_num}",
                title=step_title,
                action_type=action_type,
                description=step_body,
                response_table=response_table
            )
            skill.steps.append(step)

        return skill

    def _determine_action_type(self, body: str) -> str:
        if any(kw in body for kw in ["调用", "查询", "搜索"]):
            return "call_tool"
        elif "确认" in body or "核实" in body:
            return "confirm"
        elif any(kw in body for kw in ["完成", "结束", "返回"]):
            return "final_answer"
        elif any(kw in body for kw in ["提供", "输入", "告诉", "请提供", "请输入"]):
            return "ask_info"
        else:
            return "ask_info"

    def _extract_table_from_body(self, body: str) -> Optional[Dict[str, str]]:
        table_pattern = r"\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|"
        matches = re.findall(table_pattern, body)

        if not matches:
            return None

        table = {}
        for match in matches:
            key = match[0].strip()
            value = match[1].strip()
            if key and value:
                table[key] = value

        return table if table else None

    def _parse_tools_section(self, content: str, skill: Skill) -> Skill:
        tools_match = re.search(
            r"## 工具定义\s*\n```json\s*(\{[\s\S]+?\})\s*```",
            content
        )
        if tools_match:
            try:
                tools_data = json.loads(tools_match.group(1))
                if "tools" in tools_data:
                    skill.tools = tools_data["tools"]
                else:
                    skill.tools = [tools_data]
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse tools JSON in {skill.id}: {e}")

        for step in skill.steps:
            if step.action_type == "call_tool" and skill.tools:
                for tool in skill.tools:
                    tool_name = tool.get("name", "")
                    if any(keyword in step.description for keyword in ["查询", "搜索", "获取"]):
                        step.tool_name = tool_name
                        step.tool_params = tool.get("params", {})
                        break

        return skill

    def _parse_faq_section(self, content: str, skill: Skill) -> Skill:
        faq_match = re.search(
            r"## 常见问答\s*\n((?:\|.+\|\n)+)",
            content
        )
        if not faq_match:
            return skill

        faq_lines = faq_match.group(1).strip().split("\n")

        for line in faq_lines[1:]:
            if line.startswith("|"):
                parts = re.split(r'\s*\|\s*', line.strip().strip('|'))
                if len(parts) >= 2 and parts[0] and parts[1]:
                    skill.faq.append({
                        "question": parts[0].strip(),
                        "answer": parts[1].strip()
                    })

        return skill

    def reload(self) -> Dict[str, Skill]:
        self._cache.clear()
        return self.load_all()