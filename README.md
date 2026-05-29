# 焕美严选 AI 运营管理平台

> Huanmei Yanxuan AI-Powered E-Commerce Operations Platform

企业级 AI 驱动的电商一站式智能化管理平台。集成 AI 官网（智能销售 + 多轮对话）、管理后台（数据洞察 + 精细化运营）和 AI 员工矩阵（智能客服 + 知识库 + 数据管理）。

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [技术架构](#技术架构)
- [AI 员工系统](#ai-员工系统)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [API 文档](#api-文档)
- [设计系统](#设计系统)
- [数据库设计](#数据库设计)
- [部署指南](#部署指南)

---

## 项目简介

**焕美严选**是一个面向电商场景的企业 AI 管理平台，基于大语言模型（LLM），实现了从客户咨询、订单处理、售后服务到数据分析的全链路智能化。

平台核心价值：
- **降低人力成本**：AI 员工 7×24 小时在线，无需人工接待
- **提升转化效率**：智能推荐 + 即时响应，提高客户满意度
- **数据驱动运营**：多维度数据分析，辅助商业决策
- **敏捷扩展能力**：模块化架构，支持定制化业务场景

---

## 核心特性

### 1. AI 官网 (Port 3001)

| 功能 | 描述 |
|------|------|
| 品牌展示 | 企业简介、品牌故事、联系方式 |
| 产品目录 | 分类浏览、关键词搜索、分页加载 |
| 产品详情 | 图片画廊、价格促销、库存信息、AI 客服入口 |
| AI 智能客服 | 多轮对话、流式响应（Server-Sent Events）、意图识别 |
| 响应式布局 | 移动端优先设计，适配手机/平板/桌面 |

### 2. 管理后台 (Port 3000)

| 模块 | 功能 |
|------|------|
| 数据看板 | 销售趋势、订单分布、区域排行、转化漏斗、分时销量 |
| 产品管理 | CRUD 操作、图片上传、分类管理、库存预警 |
| AI 员工配置 | 身份设定、知识库绑定、技能授权、头像管理 |
| 知识库管理 | 文档上传、蚁群协作消化（Scout/Worker/Reviewer）、全文搜索 |
| 数据源管理 | 网页抓取任务管理、采集结果导出 |
| 移动端适配 | Hamburger 侧边栏、触控优化 |

### 3. AI 员工矩阵

平台内置 **6 名 AI 员工**，覆盖售前、售中、售后全场景：

| 工号 | 名称 | 角色 | 核心技能 |
|------|------|------|----------|
| AI-XIAOXUE | 小雪 | 智能客服专员 | 订单查询、商品咨询、投诉受理 |
| AI-XIAOBING | 小冰 | 物流售后专员 | 物流跟踪、售后服务 |
| AI-XIAOYU | 小雨 | 投诉建议专员 | 投诉处理、活动促销 |
| AI-XIAOHONGSHU | 小红 | 美妆护肤顾问 | 产品推荐、护肤咨询 |
| AI-KNOWLEDGE | 知识库管理 | 企业知识库管理员 | 文档消化、知识检索、质量审查 |
| AI-DATA | 数据管理 | 数据文件管理员 | 网页抓取、数据导出、查询分析 |

### 4. 知识库系统

基于 **LLM Wiki 蚁群协作框架**，实现文档自动化处理：

```
用户上传文档 → Lead 协调
    ↓
Scout（侦察）→ 分析文档结构，提取关键概念
    ↓
Worker（执行）→ 生成 Markdown 知识页面，更新索引
    ↓
Reviewer（审查）→ 质量检查，格式校验
    ↓
结果返回前端
```

**知识库分类**：
- `enterprise/` — 品牌介绍、企业政策、联系方式
- `products/` — 产品知识、护肤 FAQ
- `operations/` — 物流信息、退换货政策

### 5. 网页数据采集

基于 **multi-agent-universal-scraper** 框架，支持：
- 自动登录抓取（用户名/密码配置）
- 智能页面结构分析
- JSON/Excel 数据导出
- 任务状态实时跟踪

### 6. 数据分析看板

| 图表类型 | 数据指标 |
|----------|----------|
| 销售趋势图 | 日/周/月销售额走势 |
| 订单分布饼图 | 待支付/已支付/已发货/已完成/已取消 |
| 区域排行柱状图 | 各省份订单量排名 |
| 转化漏斗图 | 浏览→加购→下单→支付→完成 |
| 分时销量折线图 | 24 小时各时段销售额 |
| 支付方式分布 | 微信/支付宝/银行卡等 |

---

## 技术架构

### 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端框架** | Next.js 14 + TypeScript | App Router, Server Components |
| **后端框架** | Python FastAPI | 原生异步支持，类型安全 |
| **数据库** | PostgreSQL 15+ (asyncpg) | 关系型数据存储 |
| **缓存** | Redis 7+ (aioredis) | 热点数据缓存、会话管理 |
| **AI 模型** | LLM (通义千问/GPT/Claude 等) | 大语言模型，支持流式推理 |
| **状态管理** | Zustand + React Query | 前端全局状态 + 服务端状态 |
| **图表** | Recharts | 数据可视化 |
| **ORM** | SQLAlchemy 2.0 (async) | 异步数据库访问 |
| **认证** | JWT (python-jose) | 无状态身份认证 |

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          客户端层                                │
├─────────────────────────────┬───────────────────────────────────┤
│     管理后台 (Next.js)       │         AI 官网 (Next.js)          │
│      localhost:3000          │        localhost:3001              │
└─────────────────────────────┴───────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Nginx 反向代理 + 静态缓存                    │
│                   (work.muruai.cn / 宝塔面板)                      │
└─────────────────────────────┬───────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FastAPI 后端服务                           │
│                       localhost:8004                              │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│ Products │  Agents  │   Chat   │ Knowledge│Analytics │   Wiki   │
│  Router  │  Router  │  Router  │  Router  │  Router  │  Router  │
├──────────┴──────────┴──────────┴──────────┴──────────┴──────────┤
│                        Service 层                                │
│   chat_service  │  agent_service  │  report_service  │ skill_*   │
├─────────────────┴─────────────────┴──────────────────┴──────────┤
│                      Repository 层                               │
│              ProductRepo  │  AgentRepo  │  OrderRepo              │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (asyncpg)  │  Redis (aioredis)  │  LLM API (httpx)   │
└─────────────────────────────────────────────────────────────────┘
```

### 目录结构

```
commerce/
├── frontend/
│   ├── admin/                      # 管理后台（运营人员使用）
│   │   └── app/
│   │       ├── dashboard/          # 数据看板
│   │       ├── products/            # 产品管理
│   │       ├── agents/              # AI 员工配置
│   │       ├── analytics/           # 数据洞察
│   │       ├── data-sources/       # 数据源管理
│   │       ├── wiki/               # 知识库管理
│   │       └── login/              # 登录页
│   ├── website/                    # AI 官网（客户访问）
│   │   └── app/
│   │       ├── page.tsx             # 首页
│   │       ├── products/            # 产品列表 + 详情
│   │       ├── chat/               # AI 多轮对话
│   │       ├── about/              # 关于我们
│   │       └── contact/            # 联系方式
│   ├── lib/                        # API 封装
│   └── components/                 # 共享组件
│
├── backend/
│   ├── main.py                     # FastAPI 入口
│   ├── core/                       # 核心模块
│   │   ├── config.py                # Pydantic Settings
│   │   ├── ai_client.py            # AI 模型 API 客户端
│   │   ├── database.py             # PostgreSQL 异步连接
│   │   └── cache.py                # Redis 缓存服务
│   ├── models/                      # SQLAlchemy 实体（8 张表）
│   ├── repositories/                # Repository 数据访问层
│   ├── services/                    # 业务逻辑层
│   │   ├── chat_service.py         # 对话服务（流式 SSE）
│   │   ├── agent_service.py        # Agent 管理服务
│   │   ├── report_service.py       # 报表生成服务
│   │   ├── skill_executor.py       # 技能执行器
│   │   ├── skill_loader.py         # 技能加载器
│   │   └── skill_registry.py       # 技能注册表
│   ├── apps/                        # 业务路由模块
│   │   ├── products/               # 产品管理
│   │   ├── agents/                # AI 员工管理
│   │   ├── chat/                  # 对话路由
│   │   ├── knowledge/             # 知识库检索
│   │   ├── analytics/             # 数据分析
│   │   ├── auth/                  # 认证授权
│   │   ├── wiki/                  # LLM Wiki 知识库
│   │   ├── scraper/               # 网页数据采集
│   │   ├── context/               # 上下文记忆
│   │   └── contact/              # 联系表单
│   └── public/                    # 静态资源（产品图、头像）
│
├── agents/                         # AI Agent 配置
│   ├── profiles/
│   │   ├── agents.json            # AI 员工元数据
│   │   └── ai_customer_service.md # 客服角色定义
│   ├── knowledge/                 # Markdown 知识库
│   │   ├── enterprise/            # 企业知识
│   │   ├── products/             # 产品知识
│   │   └── operations/           # 运营知识
│   └── skills/                    # 技能工作流配置
│       ├── skill_order_query.md
│       ├── skill_product_query.md
│       ├── skill_complaint.md
│       ├── skill_logistics.md
│       ├── skill_after_sales.md
│       └── skill_promotion.md
│
├── scripts/                        # 工具脚本
│   └── init_data.py               # Mock 数据初始化
│
├── docs/                          # 设计文档
│   ├── DATABASE-SCHEMA.md         # 数据库 Schema
│   ├── DESIGN-SYSTEM.md           # 设计系统
│   └── DEPLOYMENT-NGINX.md        # 部署配置
│
└── ecosystem.config.js            # PM2 进程管理配置
```

---

## AI 员工系统

### 工作原理

```
用户消息 → 意图识别（Intent Detection）
    ↓
匹配 Agent（根据 agent_id 选择对应 AI 员工）
    ↓
加载 Agent 元数据（角色、技能、知识库）
    ↓
构建 System Prompt（动态注入知识 + 技能描述）
    ↓
调用 LLM API（流式响应）→ 返回用户
```

### 技能工作流

每个技能是一个可配置的 Markdown 文件，定义多步工具调用：

```markdown
# skill_order_query

## 描述
查询用户订单状态

## 触发条件
用户询问"我的订单到哪了"、"查一下订单"等

## 执行步骤
1. 提取订单号（正则匹配或 NLP）
2. 调用 tool: query_order_by_no
3. 格式化输出（订单状态、物流信息）
4. 如未找到订单，提示用户核对订单号

## 输出格式
- 订单号：[order_no]
- 状态：[status_text]
- 物流：[tracking_info]
```

### 知识库检索

当用户提问时，系统自动：
1. 加载 Agent 绑定的知识库文件列表
2. 对每个 Markdown 文件进行关键词匹配
3. 召回相关片段（BM25 + 向量检索）
4. 将召回内容注入 System Prompt
5. 大模型基于知识库内容生成回答

---

## 快速开始

### 环境要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | 20.x+ |
| Python | 3.8+ |
| PostgreSQL | 15+ |
| Redis | 7+ |

### 1. 克隆项目

```bash
git clone <repository-url>
cd commerce
```

### 2. 配置后端环境变量

```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env`：

```env
# 阿里云 DashScope API Key（必需）
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxx

# 数据库（可选，无数据库则使用 Mock 数据）
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ecommerce_ai

# Redis（可选，无 Redis 则使用内存缓存）
REDIS_URL=redis://localhost:6379/0

# JWT 密钥（生产环境需使用强随机值）
JWT_SECRET_KEY=your-super-secret-key-change-in-production

# 调试模式
DEBUG=true
```

### 3. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 4. 安装前端依赖

```bash
# 管理后台
cd frontend/admin && npm install

# AI 官网
cd frontend/website && npm install
```

### 5. 启动服务

```bash
# 后端（端口 8004）
cd backend
uvicorn main:app --reload --port 8004

# 管理后台（端口 3000，新终端）
cd frontend/admin && npm run dev

# AI 官网（端口 3001，新终端）
cd frontend/website && npm run dev
```

### 6. 访问地址

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:3000 |
| AI 官网 | http://localhost:3001 |
| FastAPI | http://localhost:8004 |
| API 文档 | http://localhost:8004/docs |

### 7. 初始化 Mock 数据（可选）

```bash
cd scripts
python init_data.py
```

---

## API 文档

所有 API 路由前缀为 `/api`。

### 产品管理

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/products` | 获取产品列表（分页、分类、关键词筛选） |
| POST | `/products` | 创建产品 |
| GET | `/products/{id}` | 获取产品详情 |
| PUT | `/products/{id}` | 更新产品 |
| DELETE | `/products/{id}` | 删除产品 |
| POST | `/products/upload-image` | 上传产品图片 |

### AI 员工

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/agents` | 获取 AI 员工列表 |
| POST | `/agents` | 创建 AI 员工 |
| GET | `/agents/{id}` | 获取员工详情 |
| PUT | `/agents/{id}` | 更新员工信息 |
| DELETE | `/agents/{id}` | 删除员工 |
| POST | `/agents/upload-avatar` | 上传员工头像 |

### AI 对话

| 方法 | 路由 | 描述 |
|------|------|------|
| POST | `/chat/send` | 发送消息（同步响应） |
| POST | `/chat/stream` | 发送消息（流式 SSE） |
| GET | `/chat/history/{agent_id}` | 获取对话历史 |
| GET | `/chat/intents` | 获取支持的意图类型 |

### 知识库

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/knowledge/search` | 检索知识库内容 |
| GET | `/knowledge/files` | 获取知识库文件列表 |

### 数据分析

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/analytics/dashboard` | 数据看板概览 |
| GET | `/analytics/sales/summary` | 销售汇总统计 |
| GET | `/analytics/sales/trend` | 销售趋势数据 |
| GET | `/analytics/orders/distribution` | 订单状态分布 |
| GET | `/analytics/orders/region` | 区域销售排行 |
| GET | `/analytics/orders/payment` | 支付方式分布 |
| GET | `/analytics/sales/funnel` | 转化漏斗数据 |
| GET | `/analytics/sales/hourly` | 分时销量数据 |

### 认证授权

| 方法 | 路由 | 描述 |
|------|------|------|
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/register` | 用户注册 |
| GET | `/auth/me` | 获取当前用户信息 |

### 知识库管理（Wiki）

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/wiki/documents` | 文档列表 |
| POST | `/wiki/ingest` | 消化文档（蚁群协作） |
| GET | `/wiki/documents/{id}` | 文档详情 |
| DELETE | `/wiki/documents/{id}` | 删除文档 |
| GET | `/wiki/search` | 搜索 Wiki 内容 |
| POST | `/wiki/lint` | 健康检查 |

### 数据采集（Scraper）

| 方法 | 路由 | 描述 |
|------|------|------|
| POST | `/scraper/scrape` | 创建抓取任务 |
| GET | `/scraper/tasks` | 获取任务列表 |
| GET | `/scraper/results` | 获取采集结果 |
| DELETE | `/scraper/tasks/{id}` | 删除任务 |

---

## 设计系统

### 色彩体系

平台采用 **爱马仕橙 + 苹果灰** 双色体系：

| Token | 色值 | 用途 |
|-------|------|------|
| `hermes-orange` | `#E65C00` | 主色、主按钮、强调元素 |
| `hermes-orange-light` | `#FF7A2F` | Hover 状态、渐变色 |
| `hermes-orange-pale` | `#FFF4EE` | 图标背景、徽章背景 |
| `apple-gray-1` | `#1D1D1F` | 正文、标题 |
| `apple-gray-2` | `#86868B` | 次要文字、占位符 |
| `apple-gray-3` | `#E5E5E7` | 边框、分割线 |
| `apple-gray-4` | `#FAFAFA` | 背景色、悬停状态 |

### 语义色彩

| 类型 | 色值 | 用途 |
|------|------|------|
| Success | `#10B981` | 成功状态 |
| Warning | `#F59E0B` | 警告状态 |
| Error | `#EF4444` | 错误状态 |
| Info | `#3B82F6` | 信息提示 |

### 阴影

| Token | 说明 |
|-------|------|
| `shadow-apple` | 默认卡片阴影 |
| `shadow-apple-lg` | 悬停卡片阴影 |
| `shadow-apple-xl` | Modal 阴影 |

---

## 数据库设计

8 张核心数据表（详见 `docs/DATABASE-SCHEMA.md`）：

### ER 关系图

```
users ─────┐
  │        │
  │        ├────< conversations >─────────────< conversation_messages
  │        │              │
orders     │              │
  │        │              │
order_items     agent_user_contexts
  │
products
```

### 表结构概览

| 表名 | 说明 | 主键 |
|------|------|------|
| `users` | 用户表（admin/operator/viewer 多角色） | UUID |
| `products` | 产品表（含图片 JSON、分类、库存） | UUID |
| `orders` | 订单表（含状态流转：pending→paid→shipped→delivered） | UUID |
| `order_items` | 订单商品关联表 | UUID |
| `conversations` | AI 对话会话表 | UUID |
| `conversation_messages` | 对话消息表（role: user/assistant/system） | UUID |
| `ai_agents` | AI 员工配置表 | UUID |
| `agent_user_contexts` | 上下文记忆表（跨会话记忆） | UUID |

---

## 部署指南

### PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
pm2 start ecosystem.config.js

# 查看状态
pm2 list

# 查看日志
pm2 logs backend

# 重启
pm2 restart backend
```

### Nginx 反向代理配置

详见 `docs/DEPLOYMENT-NGINX.md`。

核心代理规则：
- `/api/` → `http://127.0.0.1:8004/api/`（启用 12 小时缓存）
- `/admin/` → 静态文件 `C:/wwwroot/work.muruai.cn/admin/`
- `/` → 静态文件 `C:/wwwroot/work.muruai.cn/`

### 前端构建

```bash
# 管理后台
cd frontend/admin && npm run build
# 产物输出至 frontend/admin/out/

# AI 官网
cd frontend/website && npm run build
# 产物输出至 frontend/website/out/
```

### 生产环境变量

前端静态文件中的 API 地址硬编码在 `frontend/lib/config.ts`：

```typescript
const API_URL = "https://work.muruai.cn/api";
const WEBSITE_URL = "https://work.muruai.cn";
```

---

## 项目进度

### 已完成 ✅

- [x] 前后端基础框架（Next.js 14 + FastAPI 异步）
- [x] AI 多轮对话（流式 Server-Sent Events）
- [x] 管理后台完整页面（仪表盘、产品、AI员工、数据分析）
- [x] 移动端响应式布局（Hamburger 侧边栏）
- [x] 知识库检索（关键词 + BM25 混合检索）
- [x] 技能工作流引擎（多步工具调用）
- [x] LLM Wiki 蚁群协作文档消化
- [x] 网页数据采集（multi-agent-scraper）
- [x] Repository 数据访问层模式
- [x] Redis 缓存集成
- [x] 安全修复（XSS、SQL 注入、路径遍历）

### 进行中 🔄

- [ ] 认证授权（JWT + RBAC 完整实现）
- [ ] 测试覆盖（目标 >70%）
- [ ] RAG 增强搜索

### 待完成 ⬜

- [ ] CI/CD 流水线
- [ ] Multi-Agent 编排优化

---

## 许可证

MIT License

---

## 联系方式

- 项目维护：MuruAI Team
- 技术支持：如有问题请提交 Issue

---

*最后更新：2026-05-29*