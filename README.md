# 焕美严选 AI 运营管理平台

> Huanmei Yanxuan AI Operations Management Platform

企业级 AI 驱动的电商一站式智能化管理平台，集成 AI 官网（销售 + 智能对话）、管理后台（数据洞察 + 运营管理）和 AI 员工矩阵。

---

## 平台特性

### AI 官网
- 品牌展示与产品列表
- AI 智能客服多轮对话
- 文件 / 图片上传
- 中英双语支持
- 访客留资表单

### 管理后台
- 数据看板（销售、舆情、告警）
- 产品管理（增删改查）
- AI 员工配置（身份、知识库、技能）
- 数据源管理

### AI 员工矩阵
- 4 种专属角色（客服、售后、投诉、顾问）
- Markdown 知识库（关键词检索）
- 可配置技能（查单、查产品、投诉、物流、售后、促销）
- 动态工作流编排

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Next.js 14 + TypeScript + TailwindCSS |
| **后端框架** | Python FastAPI（异步） |
| **数据库** | PostgreSQL + Redis |
| **AI 模型** | Qwen3.5 Plus（阿里云通义千问） |
| **状态管理** | Zustand + React Query |
| **图表** | Recharts |

---

## 系统架构

```
commerce/
├── frontend/                    # Next.js 前端
│   ├── admin/                   # 管理后台 (http://localhost:3000)
│   │   ├── app/                 # App Router 页面
│   │   │   ├── dashboard/        # 数据看板
│   │   │   ├── products/        # 产品管理
│   │   │   ├── agents/          # AI 员工配置
│   │   │   └── analytics/       # 数据洞察
│   │   ├── components/          # 可复用组件
│   │   └── lib/                 # API 客户端
│   │
│   ├── website/                 # AI 官网 (http://localhost:3001)
│   │   ├── app/                 # App Router 页面
│   │   │   ├── page.tsx         # 首页
│   │   │   ├── products/        # 产品展示
│   │   │   ├── chat/            # AI 多轮对话
│   │   │   ├── about/           # 关于我们
│   │   │   └── contact/         # 联系方式
│   │   ├── components/          # 可复用组件
│   │   └── lib/                 # API 客户端
│   │
│   └── lib/                     # 共享前端工具
│
├── backend/                     # FastAPI 后端 (http://localhost:8004)
│   ├── main.py                  # 应用入口，注册所有路由
│   ├── pyproject.toml           # Python 项目配置
│   │
│   ├── core/                    # 核心模块
│   │   ├── config.py            # Pydantic Settings，环境变量
│   │   ├── ai_client.py         # Qwen API 客户端
│   │   ├── database.py          # PostgreSQL 异步连接
│   │   ├── cache.py             # Redis 缓存服务
│   │   └── auth.py              # JWT 认证
│   │
│   ├── models/                  # SQLAlchemy 数据模型
│   │   └── entities.py          # 数据库实体
│   │
│   ├── repositories/           # 数据访问层（Repository 模式）
│   │   ├── base.py              # BaseRepository 基类
│   │   ├── product.py           # ProductRepository
│   │   └── agent.py             # AgentRepository
│   │
│   ├── services/                # 业务服务层
│   │   ├── chat_service.py      # 对话服务
│   │   ├── agent_service.py     # AI 员工服务
│   │   └── report_service.py    # 报表服务
│   │
│   ├── apps/                    # 业务应用模块
│   │   ├── products/           # 产品管理 API
│   │   ├── agents/             # AI 员工 CRUD
│   │   ├── chat/               # AI 对话（含知识检索）
│   │   ├── knowledge/          # 知识库检索
│   │   ├── analytics/          # 数据看板
│   │   ├── auth/               # 身份认证
│   │   └── context/            # 上下文管理
│   │
│   ├── public/                 # 静态文件（产品图、头像）
│   ├── data/                   # 数据文件（Mock 数据）
│   └── tests/                  # 单元测试
│
├── agents/                     # AI Agent 配置
│   ├── profiles/              # 员工身份配置
│   │   ├── agents.json        # AI 员工元数据
│   │   └── ai_customer_service.md
│   ├── knowledge/             # 知识库（Markdown 文件）
│   │   ├── enterprise/       # 企业知识（品牌、政策、联系方式）
│   │   ├── products/         # 产品知识（护肤 FAQ）
│   │   └── operations/       # 运营知识（物流、售后政策）
│   ├── skills/               # 技能配置
│   │   ├── skill_order_query.md
│   │   ├── skill_product_query.md
│   │   ├── skill_complaint.md
│   │   ├── skill_logistics.md
│   │   ├── skill_after_sales.md
│   │   └── skill_promotion.md
│   └── workflows/            # 工作流配置（开发中）
│
├── scripts/                   # 工具脚本
│   ├── init_data.py          # 初始化 Mock 数据
│   ├── mock_*.json          # Mock 数据文件
│   └── download_top10_images.py
│
└── docs/                     # 项目文档
    ├── DATABASE-SCHEMA.md   # 数据库 Schema 设计
    ├── DESIGN-SYSTEM.md     # 设计系统规范
    └── CLAUDE-ARCHIVE-*.md   # 历史存档
```

---

## 快速开始

### 前置要求

| 工具 | 版本要求 |
|------|---------|
| Docker Desktop | 最新版 |
| Node.js | 20.x+ |
| Python | 3.11+ |
| PostgreSQL | 15+ |
| Redis | 7+ |

### 1. 克隆项目

```bash
git clone <repository-url>
cd commerce
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑 backend/.env，填入以下配置：
# QWEN_API_KEY=<你的阿里云 DashScope API Key>
# QWEN_MODEL=qwen3.5plus
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ecommerce_ai
# REDIS_URL=redis://localhost:6379/0
# JWT_SECRET_KEY=<生产环境请使用强随机值>
```

### 3. 启动后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn main:app --reload --port 8004
```

API 文档：http://localhost:8004/docs

### 4. 启动前端

```bash
# 管理后台（新终端）
cd frontend/admin && npm install && npm run dev

# AI 官网（新终端）
cd frontend/website && npm install && npm run dev
```

### 5. 初始化数据（可选）

```bash
cd scripts && python init_data.py
```

### 6. 访问地址

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:3000 |
| AI 官网 | http://localhost:3001 |
| FastAPI | http://localhost:8004 |
| API 文档 | http://localhost:8004/docs |

---

## AI 员工矩阵

| 工号 | 名称 | 角色 | 核心技能 |
|------|------|------|----------|
| xiaoxue | 小雪 | 智能客服专员 | 订单查询、商品咨询、投诉受理 |
| xiaobing | 小冰 | 物流售后专员 | 物流跟踪、售后服务 |
| xiaoyu | 小雨 | 投诉建议专员 | 投诉处理、活动促销 |
| xiaohongshu | 小红 | 美妆护肤顾问 | 产品推荐、护肤咨询 |

### 添加新知识库

在 `agents/knowledge/` 下创建 `.md` 文件，AI 员工将自动检索匹配的内容。

```bash
agents/knowledge/
├── enterprise/    # 企业知识
├── products/      # 产品知识
└── operations/   # 运营知识
```

---

## API 路由

所有路由前缀 `/api`：

| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/products` | GET, POST | 产品列表 / 创建产品 |
| `/api/products/{id}` | GET, PUT, DELETE | 产品详情 / 更新 / 删除 |
| `/api/agents` | GET, POST | AI 员工列表 / 创建 |
| `/api/agents/{id}` | GET, PUT, DELETE | AI 员工详情 / 更新 / 删除 |
| `/api/chat` | POST | AI 对话（流式响应） |
| `/api/knowledge/search` | GET | 知识库检索 |
| `/api/analytics/dashboard` | GET | 数据看板 |
| `/api/auth/login` | POST | 登录认证 |
| `/api/context/{conversation_id}` | GET | 获取对话上下文 |

---

## 设计系统

### 色彩体系（爱马仕橙 + 苹果灰）

| Token | 色值 | 用途 |
|-------|------|------|
| `--hermes-orange` | `#E65C00` | 主色、主按钮、强调 |
| `--hermes-orange-light` | `#FF7A2F` | Hover 状态、渐变 |
| `--hermes-orange-pale` | `#FFF4EE` | 图标背景、徽章 |
| `--apple-gray-1` | `#1D1D1F` | 正文、标题 |
| `--apple-gray-2` | `#86868B` | 次要文字 |
| `--apple-gray-3` | `#E5E5E7` | 边框、分割线 |
| `--apple-gray-4` | `#FAFAFA` | 背景、hover |

### 语义色彩

| 类型 | 主色 | 浅色背景 | 用途 |
|------|------|---------|------|
| 成功 | `#10B981` | `#D1FAE5` | 成功状态 |
| 警告 | `#F59E0B` | `#FEF3C7` | 警示提示 |
| 错误 | `#EF4444` | `#FEE2E2` | 错误提示 |
| 信息 | `#3B82F6` | `#DBEAFE` | 一般信息 |

### 字体

```css
--font-family-primary: "SF Pro Text", "Noto Sans SC", system-ui, sans-serif;
--font-family-mono: "SF Mono", "JetBrains Mono", monospace;
```

### 阴影

| Token | 用途 |
|-------|------|
| `shadow-apple` | 品牌卡片默认阴影 |
| `shadow-apple-lg` | 卡片悬停阴影 |

---

## 数据库 Schema

核心表结构：

| 表名 | 描述 |
|------|------|
| `users` | 用户表（支持多角色） |
| `products` | 产品表（含 ASIN） |
| `orders` | 订单表 |
| `order_items` | 订单商品关联表 |
| `conversations` | AI 对话会话表 |
| `conversation_messages` | 对话消息表 |
| `ai_agents` | AI 员工配置表 |
| `knowledge_base` | 知识库表 |

详见 [docs/DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md)

---

## 开发指南

### 添加新 API 路由

1. 在 `backend/apps/` 下创建新模块
2. 定义路由并注册到 `backend/main.py`
3. 使用 Repository 模式访问数据

### 添加新 AI 员工

1. 在 `agents/profiles/` 下创建 Profile Markdown
2. 在 `agents/knowledge/` 下添加知识库文件
3. 在 `agents/skills/` 下配置技能

### 样式规范

遵循 [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md)：

- 使用 CSS 变量而非硬编码值
- 组件支持 `hover`、`focus`、`disabled` 状态
- 动画需支持 `prefers-reduced-motion`
- 焦点可访问性（键盘导航）

---

## 项目进度

### 已完成 ✅

- 前后端基础框架
- AI 对话基础功能
- 管理后台页面
- 移动端响应式布局
- 基础安全修复（路径遍历、XSS）
- Repository 模式
- Redis 缓存集成

### 进行中 🔄

- 认证授权（JWT + RBAC）
- 测试覆盖（目标 >80%）

### 待完成 ⬜

- CI/CD 流水线
- RAG 增强搜索
- Multi-Agent 编排

---

## 许可证

MIT License