import os

# 从 backend/apps/agents/ 往回数4层到项目根目录 E:/claude/commerce/
_project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
AGENTS_FILE = os.path.join(_project_root, "agents", "profiles", "agents.json")
KNOWLEDGE_BASE = os.path.join(_project_root, "agents", "knowledge")


def load_agents():
    """从文件加载员工配置"""
    if not os.path.exists(AGENTS_FILE):
        return get_default_agents()
    try:
        import json
        with open(AGENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("agents", get_default_agents())
    except Exception:
        return get_default_agents()


def save_agents(agents):
    """保存员工配置到文件"""
    os.makedirs(os.path.dirname(AGENTS_FILE), exist_ok=True)
    import json
    with open(AGENTS_FILE, "w", encoding="utf-8") as f:
        json.dump({"agents": agents, "updated_at": "2026-05-07"}, f, ensure_ascii=False, indent=2)


def get_all_knowledge_files():
    """获取所有知识库文件"""
    files = []
    if os.path.exists(KNOWLEDGE_BASE):
        for root, dirs, files_list in os.walk(KNOWLEDGE_BASE):
            for file in files_list:
                if file.endswith(".md"):
                    relpath = os.path.relpath(os.path.join(root, file), KNOWLEDGE_BASE)
                    files.append(relpath)
    return files


def get_default_agents():
    """默认员工配置"""
    return [
        {
            "id": "xiaoxue",
            "code": "AI-XIAOXUE",
            "name": "小雪",
            "role": "智能客服专员",
            "knowledge_files": ["products/skincare.md", "products/faq.md", "enterprise/policy.md"],
            "skills": ["skill_order_query", "skill_product_query", "skill_complaint"],
            "status": "active",
            "greeting": "您好！我是小雪，您的专属客服。有什么可以帮您？",
        },
        {
            "id": "xiaobing",
            "code": "AI-XIAOBING",
            "name": "小冰",
            "role": "物流售后专员",
            "knowledge_files": ["operations/shipping.md", "operations/refund_policy.md"],
            "skills": ["skill_logistics", "skill_after_sales"],
            "status": "active",
            "greeting": "您好！我是小冰，负责物流和售后。您的包裹到哪了？",
        },
        {
            "id": "xiaoyu",
            "code": "AI-XIAOYU",
            "name": "小雨",
            "role": "投诉建议专员",
            "knowledge_files": ["enterprise/contact.md", "enterprise/brand.md"],
            "skills": ["skill_complaint", "skill_promotion"],
            "status": "active",
            "greeting": "您好！我是小雨，负责投诉建议和优惠活动。",
        },
    ]