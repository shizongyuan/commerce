# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

> ⚠️ 2026-05-10 更新：Production Ready 阶段开始
> 存档版本见 `docs/Codex-ARCHIVE-2026-05-10.md`

---

## 项目概述

企业 AI 管理平台：电商一站式 AI 智能化管理，包含 AI 官网（销售+对话）、管理后台（数据洞察+运营）和 AI 员工矩阵。

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 + TypeScript + TailwindCSS |
| 后端 | Python FastAPI (异步) |
| 数据库 | PostgreSQL + Redis |
| AI 模型 | Qwen3.5 Plus (阿里通义) |

### 服务端口

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:3000 |
| AI 官网 | http://localhost:3001 |
| FastAPI | http://localhost:8004 |
| API 文档 | http://localhost:8004/docs |

---

## 常用命令

### 本地开发

```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8004

# 管理后台 (新开终端)
cd frontend/admin && npm install && npm run dev

# AI 官网 (新开终端)
cd frontend/website && npm install && npm run dev
```

### 初始化数据

```bash
# 初始化 Mock 数据
cd scripts && python init_data.py
```

---

## 架构说明

### 项目结构

```
commerce/
├── frontend/
│   ├── admin/            # 管理后台 (localhost:3000)
│   ├── website/           # AI 官网 (localhost:3001)
│   └── lib/               # API 封装
├── backend/
│   ├── apps/              # 业务模块 (products, agents, chat, knowledge, analytics)
│   ├── core/              # 核心模块 (config, ai_client, database, cache)
│   ├── models/             # SQLAlchemy 数据模型 (Production Ready)
│   ├── repositories/      # 数据访问层 (Repository 模式)
│   └── services/          # 公共服务 (chat_service, agent_service, report_service)
├── agents/                 # AI Agent 配置
├── scripts/               # 工具脚本
└── docs/                  # 项目文档
```

### 后端结构 (`backend/`)

```
backend/
├── main.py                   # FastAPI 入口，注册所有路由
├── requirements.txt          # 依赖列表
├── pyproject.toml           # Python 项目配置
├── core/                     # 核心模块
│   ├── config.py             # Pydantic Settings，环境变量管理
│   ├── ai_client.py          # Qwen API 客户端
│   ├── database.py           # PostgreSQL 异步连接
│   └── cache.py              # Redis 缓存服务
├── models/
│   └── entities.py          # SQLAlchemy 数据模型
├── repositories/
│   ├── base.py              # BaseRepository 基类
│   ├── product.py          # ProductRepository
│   └── agent.py             # AgentRepository
├── apps/                     # 业务应用模块
│   ├── products/
│   ├── agents/
│   ├── chat/
│   ├── knowledge/
│   └── analytics/
└── services/
```

### 前端结构 (`frontend/`)

```
frontend/
├── admin/                    # 管理后台 (localhost:3000)
│   └── app/
│       ├── dashboard/        # 首页看板
│       ├── products/         # 产品管理
│       ├── agents/           # AI 员工配置
│       ├── analytics/        # 数据洞察
│       ├── data-sources/     # 数据源管理
│       ├── layout.tsx         # 布局 (移动端 hamburger)
│       └── page.tsx          # 首页
└── website/                 # AI 官网 (localhost:3001)
    └── app/
        ├── page.tsx          # 首页
        ├── products/         # 产品展示
        │   └── [id]/         # 产品详情
        ├── chat/             # AI 多轮对话
        ├── about/            # 关于我们
        └── contact/          # 联系方式
```

### AI Agent 配置 (`agents/`)

```
agents/
├── profiles/                 # 员工身份配置
│   ├── agents.json          # 员工列表元数据
│   └── ai_customer_service.md
├── knowledge/                # 知识库
│   ├── enterprise/           # 企业知识
│   ├── products/            # 产品知识
│   └── operations/          # 运营知识
└── skills/                  # 技能配置
    ├── skill_order_query.md
    ├── skill_product_query.md
    ├── skill_complaint.md
    ├── skill_logistics.md
    ├── skill_after_sales.md
    └── skill_promotion.md
```

### 数据库 Schema (`docs/DATABASE-SCHEMA.md`)

设计文档：用户、产品、订单、AI 对话会话、知识库等表结构

---

## 设计系统

### 颜色（爱马仕橙 + 苹果灰）

| Token | 值 | 用途 |
|-------|-----|------|
| `hermes-orange` | `#E65C00` | 主色、按钮、强调 |
| `hermes-orange-light` | `#FF7A2F` | 渐变、hover |
| `hermes-orange-pale` | `#FFF4EE` | 图标背景、徽章 |
| `apple-gray-1` | `#1D1D1F` | 正文 |
| `apple-gray-2` | `#86868B` | 次要文字 |
| `apple-gray-3` | `#E5E5E7` | 边框、分割线 |
| `apple-gray-4` | `#FAFAFA` | 背景、hover |

### 阴影

```css
shadow-apple   /* 默认：橙色调柔和阴影 */
shadow-apple-lg/* 卡片 hover */
shadow-apple-xl/* 强烈阴影 */
```

---

## 环境变量

`backend/.env`（**不提交到 Git**，已在 `.gitignore`）：

```
QWEN_API_KEY=        # 阿里云 DashScope API Key
QWEN_MODEL=          # 模型名，默认 qwen3.5plus
DATABASE_URL=        # PostgreSQL 连接串
REDIS_URL=           # Redis 连接串
JWT_SECRET_KEY=      # JWT 密钥（生产环境需强随机值）
```

---

## 前后端交互约定

- 前端 API 调用：`http://localhost:8004/api/...`
- `NEXT_PUBLIC_API_URL` 环境变量控制前端请求的 API 地址
- 后端 CORS 已配置允许 `localhost:3000` 和 `localhost:3001`
- 所有 API 响应 JSON，错误格式：`{ "code": "...", "message": "..." }`

### 前端环境变量配置

```bash
# frontend/admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8004

# frontend/website/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8004
```

---

## 进化阶段

### 已完成 (Demo 阶段)
- ✅ 前后端基础框架
- ✅ AI 对话基础功能
- ✅ 管理后台页面
- ✅ 移动端响应式布局
- ✅ 基本安全修复 (路径遍历、XSS)

### 进行中 (Production Ready - 2026-05-10)
- 🔄 数据持久化 (PostgreSQL)
- 🔄 Repository 模式
- 🔄 Redis 缓存集成

### 待完成
- ⬜ 认证授权 (JWT + RBAC)
- ⬜ 测试覆盖 (>70%)
- ⬜ CI/CD 流水线
- ⬜ RAG 增强
- ⬜ Multi-Agent 编排