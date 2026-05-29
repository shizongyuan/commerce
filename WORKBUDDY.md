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
| AI 模型 | 通义大模型（阿里云 DashScope） |

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

### 完整部署

```bash
# 一键部署（包含前端构建 + 静态资源复制）
cd scripts && ./deploy.sh
```

---

## 架构说明

### 项目结构

```
projeck/work/
├── frontend/
│   ├── admin/            # 管理后台 (localhost:3000)
│   └── website/          # AI 官网 (localhost:3001)
├── backend/              # FastAPI 后端 (localhost:8004)
├── agents/               # AI Agent 配置
├── scripts/             # 工具脚本
└── .gitignore           # 已排除 docs/ 目录
```

### 前端结构 (`frontend/`)

```
frontend/
├── admin/                # 管理后台 (localhost:3000)
│   └── app/
│       ├── dashboard/         # 首页看板
│       ├── products/        # 产品管理
│       ├── agents/           # AI 员工配置
│       ├── analytics/       # 数据洞察
│       ├── wiki/             # 知识库管理
│       ├── data-sources/     # 数据源管理
│       ├── layout.tsx        # 根布局
│       └── page.tsx          # 首页
└── website/              # AI 官网 (localhost:3001)
    └── app/
        ├── page.tsx          # 首页（产品列表+AI客服入口）
        ├── products/         # 产品展示
        │   └── [id]/         # 产品详情
        ├── chat/             # AI 多轮对话
        ├── about/            # 关于我们
        └── contact/          # 焕美会员
```

### 后端结构 (`backend/`)

```
backend/
├── main.py                   # FastAPI 入口，注册所有路由
├── requirements.txt          # 依赖列表
├── core/                     # 核心模块
│   ├── config.py             # Pydantic Settings，环境变量管理
│   ├── ai_client.py         # 大模型 API 客户端
│   ├── database.py           # PostgreSQL 异步连接
│   └── cache.py              # Redis 缓存服务
├── models/                   # SQLAlchemy 数据模型
├── repositories/             # 数据访问层（Repository 模式）
├── apps/                     # 业务应用模块
│   ├── products/             # 产品管理 API
│   ├── agents/               # AI 员工 CRUD
│   ├── chat/                 # AI 对话
│   ├── knowledge/            # 知识库检索
│   ├── wiki/                 # 企业 Wiki 知识库
│   ├── scraper/              # 多 Agent 网页爬虫
│   ├── analytics/            # 数据看板
│   ├── context/              # 上下文管理
│   └── auth/                 # 认证授权
├── services/                 # 公共服务
└── public/                   # 静态资源
    ├── products/             # 产品图片
    └── agents/               # AI 员工头像
```

### AI 员工（6位数字员工）

| 工号 | 名称 | 职责 |
|------|------|------|
| 001 | 小雪 | 智能客服、产品咨询 |
| 002 | 小冰 | 物流跟踪、售后服务 |
| 003 | 小雨 | 投诉建议、优惠活动 |
| 004 | 小红 | 美妆顾问 |
| 005 | 知识库管理 | 企业知识库运营 |
| 006 | 数据管理 | 数据采集与分析 |

### API 路由 (`/api/`)

```
/api/auth/*           认证授权
/api/products/*       产品管理
/api/agents/*         AI 员工配置
/api/chat/*          AI 对话（POST 流式返回）
/api/knowledge/*     知识库检索
/api/wiki/*          企业 Wiki 知识库
/api/scraper/*       网页数据采集
/api/analytics/*      数据看板
/api/reports/*       数据报告
/api/context/*        上下文管理
```

### Scripts 目录 (`scripts/`)

```
scripts/
├── init_data.py            # 初始化 Mock 数据
├── deploy.sh               # 完整部署脚本（一键部署）
├── mock_products.json      # 产品 Mock 数据
├── mock_orders.json        # 订单 Mock 数据
├── mock_reviews.json       # 评论 Mock 数据
├── mock_inventory.json     # 库存 Mock 数据
└── verify-build.ps1        # 构建验证脚本
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
- API 地址硬编码在 `frontend/lib/config.ts`
- 后端 CORS 已配置允许 `localhost:3000` 和 `localhost:3001`
- 所有 API 响应 JSON，错误格式：`{ "code": "...", "message": "..." }`

---

## 部署说明

### 前端构建

```bash
cd frontend/admin && npm run build   # 管理后台
cd frontend/website && npm run build # AI 官网
```

构建产物在 `out/` 目录。

### 静态部署目录

```
C:/wwwroot/work.muruai.cn/
├── index.html          # AI 官网首页
├── admin/              # 管理后台
└── images/             # 静态图片
    ├── products/       # 产品图片（20张 *.webp）
    └── agents/         # AI 员工头像（4张 *.webp）
```

### Nginx 配置要点

- 管理后台：`/admin/` 路径指向 `C:/wwwroot/work.muruai.cn/admin/`
- AI 官网：`/` 路径指向 `C:/wwwroot/work.muruai.cn/`
- 产品图片：`/products/*.webp` 使用 `location ^~` 优先匹配

---

## 进化阶段

### 已完成
- 前后端基础框架
- AI 对话基础功能
- 管理后台页面（含 Wiki 知识库、数据源管理）
- 移动端响应式布局
- 基本安全修复

### 进行中 (Production Ready)
- 数据持久化 (PostgreSQL)
- Repository 模式
- Redis 缓存集成

### 待完成
- 认证授权 (JWT + RBAC)
- 测试覆盖
- CI/CD 流水线
- RAG 增强
- Multi-Agent 编排