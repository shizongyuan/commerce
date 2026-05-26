# 焕美严选 AI 运营管理平台

> Huanmei Yanxuan AI Operations Management Platform

企业级 AI 驱动的电商一站式智能化管理平台，集成 AI 官网（销售 + 智能对话）、管理后台（数据洞察 + 运营管理）和 AI 员工矩阵。

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 平台特性

### AI 官网 (Port 3001)

- 品牌展示与产品目录浏览
- AI 智能客服多轮对话（流式响应）
- 产品详情与分类搜索
- 访客联系表单
- 响应式移动端布局

### 管理后台 (Port 3000)

- 数据看板（销售趋势、订单分布、区域排行、转化漏斗）
- 产品管理（CRUD + 图片上传）
- AI 员工配置（身份、知识库、技能）
- 数据源管理
- 移动端 hamburger 菜单

### AI 员工矩阵

- 4 种专属角色（客服、售后、投诉、顾问）
- 意图识别（订单查询、商品咨询、投诉、物流、售后、促销）
- Markdown 知识库（关键词检索，3 大分类）
- 可配置技能工作流（多步工具调用）
- 动态系统提示词构建

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Next.js 14 + TypeScript + TailwindCSS |
| **后端框架** | Python FastAPI（异步） |
| **数据库** | PostgreSQL 15+ (asyncpg) + Redis 7+ |
| **AI 模型** | Qwen3.5 Plus（阿里云通义千问） |
| **状态管理** | Zustand + React Query |
| **图表** | Recharts |
| **ORM** | SQLAlchemy 2.0（异步） |
| **认证** | JWT (python-jose + passlib) |
| **API 客户端** | httpx（异步） |

---

## 系统架构

```
commerce/
├── frontend/
│   ├── admin/                   # 管理后台 (localhost:3000)
│   │   └── app/                 # dashboard / products / agents / analytics / data-sources / login
│   └── website/                 # AI 官网 (localhost:3001)
│       └── app/                 # page / products/[id] / chat / about / contact
│
├── backend/                     # FastAPI 后端 (localhost:8004)
│   ├── main.py                  # 应用入口
│   ├── core/                    # config / ai_client / database / cache / auth
│   ├── models/                  # SQLAlchemy 实体（8 张表）
│   ├── repositories/            # Repository 数据访问层
│   ├── services/                # chat_service / agent_service / report_service / skill_*/
│   ├── apps/                    # products / agents / chat / knowledge / analytics / auth / context / contact
│   └── public/                  # 静态文件（产品图、头像）
│
├── agents/                      # AI Agent 配置
│   ├── profiles/               # agents.json + 员工身份 Markdown
│   ├── knowledge/              # enterprise / products / operations（Markdown 知识库）
│   └── skills/                  # 6 个可配置技能文件
│
├── scripts/                     # init_data.py / mock 数据
└── docs/                        # DATABASE-SCHEMA / DESIGN-SYSTEM
```

---

## 快速开始

### 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | 20.x+ |
| Python | 3.8+ |
| PostgreSQL | 15+ |
| Redis | 7+ |

### 1. 克隆项目

```bash
git clone <repository-url>
cd commerce
```

### 2. 配置环境变量

```bash
# 后端
cp backend/.env.example backend/.env
# 编辑 backend/.env:
# QWEN_API_KEY=<你的阿里云 DashScope API Key>
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ecommerce_ai
# REDIS_URL=redis://localhost:6379/0
# JWT_SECRET_KEY=<生产环境使用强随机值>

# 前端
echo "NEXT_PUBLIC_API_URL=http://localhost:8004" > frontend/admin/.env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8004" > frontend/website/.env.local
```

### 3. 启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8004
# API 文档: http://localhost:8004/docs
```

### 4. 启动前端

```bash
# 管理后台（新终端）
cd frontend/admin && npm install && npm run dev

# AI 官网（新终端）
cd frontend/website && npm install && npm run dev
```

### 5. 访问地址

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

### 知识库结构

```bash
agents/knowledge/
├── enterprise/    # 品牌介绍、政策、联系方式
├── products/      # 产品知识、护肤 FAQ
└── operations/    # 物流信息、退换货政策
```

在 `agents/knowledge/` 下添加 `.md` 文件，AI 员工自动检索匹配内容。

### 技能系统

| 技能文件 | 功能 |
|----------|------|
| `skill_order_query.md` | 订单状态查询 |
| `skill_product_query.md` | 商品信息查询 |
| `skill_complaint.md` | 投诉处理 |
| `skill_logistics.md` | 物流跟踪 |
| `skill_after_sales.md` | 售后服务 |
| `skill_promotion.md` | 优惠活动查询 |

---

## API 路由

所有路由前缀 `/api`：

| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/products` | GET, POST | 产品列表 / 创建 |
| `/api/products/{id}` | GET, PUT, DELETE | 产品详情 / 更新 / 删除 |
| `/api/products/upload-image` | POST | 上传产品图片 |
| `/api/products/images/{filename}` | GET | 获取产品图片 |
| `/api/agents` | GET, POST | AI 员工列表 / 创建 |
| `/api/agents/{id}` | GET, PUT, DELETE | AI 员工详情 / 更新 / 删除 |
| `/api/agents/upload-avatar` | POST | 上传员工头像 |
| `/api/agents/avatars/{filename}` | GET | 获取头像图片 |
| `/api/chat/send` | POST | AI 对话 |
| `/api/chat/stream` | POST | AI 对话（流式 SSE） |
| `/api/chat/history/{agent_id}` | GET | 对话历史 |
| `/api/chat/intents` | GET | 支持的意图类型 |
| `/api/knowledge/search` | GET | 知识库检索 |
| `/api/knowledge/files` | GET | 知识库文件列表 |
| `/api/analytics/dashboard` | GET | 数据看板 |
| `/api/analytics/sales/summary` | GET | 销售汇总 |
| `/api/analytics/sales/trend` | GET | 销售趋势 |
| `/api/analytics/orders/distribution` | GET | 订单状态分布 |
| `/api/analytics/orders/region` | GET | 区域销售排行 |
| `/api/analytics/orders/payment` | GET | 支付方式分布 |
| `/api/analytics/sales/funnel` | GET | 转化漏斗 |
| `/api/analytics/sales/hourly` | GET | 分时销量 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/me` | GET | 当前用户信息 |
| `/api/contact` | POST | 提交联系表单 |
| `/api/context/{agent_id}` | GET, POST | 上下文记录 |
| `/api/reports/generate` | POST | 生成 AI 报表 |

---

## 设计系统

### 色彩体系（爱马仕橙 + 苹果灰）

| Token | 色值 | 用途 |
|-------|------|------|
| `hermes-orange` | `#E65C00` | 主色、主按钮、强调 |
| `hermes-orange-light` | `#FF7A2F` | Hover 状态、渐变 |
| `hermes-orange-pale` | `#FFF4EE` | 图标背景、徽章 |
| `apple-gray-1` | `#1D1D1F` | 正文、标题 |
| `apple-gray-2` | `#86868B` | 次要文字 |
| `apple-gray-3` | `#E5E5E7` | 边框、分割线 |
| `apple-gray-4` | `#FAFAFA` | 背景、hover |

### 语义色彩

| 类型 | 主色 | 浅色背景 |
|------|------|---------|
| Success | `#10B981` | `#D1FAE5` |
| Warning | `#F59E0B` | `#FEF3C7` |
| Error | `#EF4444` | `#FEE2E2` |
| Info | `#3B82F6` | `#DBEAFE` |

### 阴影

| Token | 用途 |
|-------|------|
| `shadow-apple` | 默认卡片阴影 |
| `shadow-apple-lg` | 卡片悬停阴影 |
| `shadow-apple-xl` | 强阴影 |

---

## 数据库 Schema

8 张 SQLAlchemy 实体表（详见 `docs/DATABASE-SCHEMA.md`）：

| 表名 | 描述 |
|------|------|
| `users` | 用户表（admin / operator / viewer 多角色） |
| `products` | 产品表 |
| `orders` | 订单表 |
| `order_items` | 订单商品关联表 |
| `conversations` | AI 对话会话表 |
| `conversation_messages` | 对话消息表 |
| `ai_agents` | AI 员工配置表 |
| `agent_user_contexts` | 上下文记忆表 |

---

## 项目进度

### 已完成 ✅

- 前后端基础框架（Next.js 14 + FastAPI 异步）
- AI 多轮对话（流式 SSE）
- 管理后台完整页面
- 移动端响应式布局
- 安全修复（路径遍历、XSS、SQL 注入）
- Repository 数据访问层模式
- Redis 缓存集成
- 知识库检索
- 技能工作流引擎

### 进行中 🔄

- 认证授权（JWT + RBAC）
- 测试覆盖（目标 >70%）

### 待完成 ⬜

- CI/CD 流水线
- RAG 增强搜索
- Multi-Agent 编排

---

## 许可证

MIT License