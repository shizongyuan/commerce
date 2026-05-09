# WORKBUDDY.md

This file provides guidance to WorkBuddy AI when working with code in this repository.

## 项目概述

焕美严选 AI 运营管理平台：电商一站式 AI 智能化管理，包含 AI 官网（销售+对话）、管理后台（数据洞察+运营）和 AI 员工矩阵。

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
│   └── website/          # AI 官网 (localhost:3001)
├── backend/              # FastAPI 后端 (localhost:8004)
├── agents/               # AI Agent 配置
├── scripts/              # 工具脚本
└── docs/                 # 项目文档
```

### 前端结构 (`frontend/`)

```
frontend/
├── admin/                # 管理后台 (localhost:3000)
│   └── app/
│       ├── dashboard/         # 首页看板
│       ├── products/          # 产品管理
│       ├── agents/             # AI 员工配置
│       ├── analytics/          # 数据洞察
│       ├── data-sources/       # 数据源管理
│       ├── api/hello/          # API 测试
│       ├── layout.tsx          # 根布局
│       └── page.tsx            # 首页
└── website/              # AI 官网 (localhost:3001)
    └── app/
        ├── page.tsx           # 首页（产品列表+AI客服入口）
        ├── products/          # 产品展示
        │   └── [id]/          # 产品详情
        ├── chat/              # AI 多轮对话
        ├── about/             # 关于我们
        ├── contact/           # 联系方式
        └── layout.tsx         # 布局
```

### 后端结构 (`backend/`)

```
backend/
├── main.py                   # FastAPI 入口，注册所有路由
├── requirements.txt          # 依赖列表
├── core/                     # 核心模块
│   ├── config.py             # Pydantic Settings，环境变量管理
│   ├── ai_client.py          # Qwen API 客户端（chat/embeddings/stream）
│   └── database.py           # DB 连接配置
├── apps/                     # 业务应用模块
│   ├── products/             # 产品管理 API（内存 Mock 数据）
│   │   └── router.py
│   ├── agents/               # AI 员工 CRUD
│   │   ├── router.py
│   │   └── store.py
│   ├── chat/                 # AI 对话（调用 Qwen + 知识检索）
│   │   └── router.py
│   ├── knowledge/            # 知识库检索
│   │   └── router.py
│   └── analytics/            # 数据看板
│       ├── router.py
│       └── report_router.py
├── services/                  # 公共服务
│   ├── chat_service.py
│   ├── agent_service.py
│   └── report_service.py
└── models/                    # 数据模型（预留）
```

### AI Agent 配置 (`agents/`)

```
agents/
├── profiles/                  # 员工身份配置
│   ├── agents.json           # 员工列表元数据
│   └── ai_customer_service.md # 客服专员配置
├── knowledge/                 # 知识库（Markdown 文件，按主题分目录）
│   ├── enterprise/            # 企业知识：品牌、政策、联系方式
│   │   ├── brand.md
│   │   ├── policy.md
│   │   └── contact.md
│   ├── products/              # 产品知识：FAQ、品类说明
│   │   ├── skincare.md
│   │   └── faq.md
│   └── operations/            # 运营知识
│       ├── shipping.md
│       └── refund_policy.md
├── skills/                    # 技能配置
│   ├── skill_order_query.md
│   ├── skill_product_query.md
│   └── skill_complaint.md
└── workflows/                 # 工作流配置（暂未启用）
```

添加新知识：在 `agents/knowledge/` 对应目录下创建 `.md` 文件，文件名即检索关键词。

### API 路由 (`/api/`)

```
/api/products/*      产品管理
/api/agents/*       AI 员工配置
/api/chat/*         AI 对话（POST 流式返回）
/api/knowledge/*     知识库检索
/api/analytics/*     数据看板
/api/reports/*      数据报告
```

### Scripts 目录 (`scripts/`)

```
scripts/
├── init_data.py           # 初始化 Mock 数据
├── mock_products.json     # 产品 Mock 数据
├── mock_orders.json        # 订单 Mock 数据
├── mock_reviews.json       # 评论 Mock 数据
├── mock_inventory.json     # 库存 Mock 数据
├── mock_amazon_data.py     # 亚马逊数据采集
└── scheduled_tasks.py     # 定时任务
```

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
shadow-apple-xl/* 强烈阴影（管理后台升级版）*/
```

### 字体

- 正文：`SF Pro Text`, `Noto Sans SC`, `system-ui`
- 标题：`SF Pro Display`

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
- `NEXT_PUBLIC_API_URL` 环境变量控制前端请求的 API 地址（如：`http://localhost:8004`）
- 后端 CORS 已配置允许 `localhost:3000` 和 `localhost:3001`
- 所有 API 响应 JSON，错误格式：`{ "code": "...", "message": "..." }`

### 前端环境变量配置

```bash
# frontend/admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8004

# frontend/website/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8004
```

### 前端 API 封装

前端统一使用 `lib/api.ts` 或 `lib/api-admin.ts` 封装 API 调用，避免硬编码 URL：

```typescript
// frontend/website/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

// frontend/admin 的其他页面中也需要定义 API_BASE_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";
```
