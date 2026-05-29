import os

# 从 backend/apps/agents/ 往回数4层到项目根目录 E:/claude/commerce/
_project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
AGENTS_FILE = os.path.join(_project_root, "agents", "profiles", "agents.json")
KNOWLEDGE_BASE = os.path.join(_project_root, "agents", "knowledge")

# 内存缓存 - 避免每次请求都读磁盘
_agents_cache: dict = {}
_agents_cache_time: float = 0
_CACHE_TTL = 10.0  # 缓存10秒


def load_agents():
    """从文件加载员工配置 - 带内存缓存"""
    import time
    global _agents_cache, _agents_cache_time

    now = time.time()
    if _agents_cache and (now - _agents_cache_time) < _CACHE_TTL:
        return _agents_cache

    if not os.path.exists(AGENTS_FILE):
        agents = get_default_agents()
        _agents_cache = agents
        _agents_cache_time = now
        return agents
    try:
        import json
        with open(AGENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            agents = data.get("agents", get_default_agents())
            _agents_cache = agents
            _agents_cache_time = now
            return agents
    except Exception:
        agents = get_default_agents()
        _agents_cache = agents
        _agents_cache_time = now
        return agents


def save_agents(agents):
    """保存员工配置到文件"""
    global _agents_cache, _agents_cache_time
    os.makedirs(os.path.dirname(AGENTS_FILE), exist_ok=True)
    import json
    with open(AGENTS_FILE, "w", encoding="utf-8") as f:
        json.dump({"agents": agents, "updated_at": "2026-05-07"}, f, ensure_ascii=False, indent=2)
    # Invalidate cache on save
    _agents_cache = {}
    _agents_cache_time = 0


def get_agents_dict():
    """获取 agents 的 dict 格式 - O(1) 查找"""
    agents = load_agents()
    return {a["id"]: a for a in agents}


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
        {
            "id": "knowledge_manager",
            "code": "AI-KNOWLEDGE",
            "name": "知识库管理",
            "role": "企业知识库管理员",
            "knowledge_files": ["wiki/concepts/index.md", "wiki/log.md"],
            "skills": ["skill_wiki_ingest", "skill_wiki_search", "skill_wiki_lint"],
            "status": "active",
            "greeting": "您好！我是知识库管理员，帮助您管理和查询企业知识库文档。",
        },
        {
            "id": "data_manager",
            "code": "AI-DATA",
            "name": "数据管理",
            "role": "数据文件管理员",
            "knowledge_files": ["data/scrapes/amazon_products.md", "data/scrapes/jd_products.md", "data/scrapes/taobao_products.md"],
            "skills": ["skill_data_scrape", "skill_data_export", "skill_data_query"],
            "status": "active",
            "greeting": "您好！我是数据管理员，协助您管理爬取的数据文件和进行数据分析。",
        },
    ]