# 电商 AI 管理平台 - 规划方案

> 文档版本：v2.0
> 创建日期：2026-05-01
> 状态：**已确认**
> 确认日期：2026-05-01

---

## 一、项目概述

### 1.1 项目名称
**企业 AI 管理平台**（Enterprise AI Management Platform）

### 1.2 核心定位
面向电商企业的一站式 AI 智能化管理平台，实现：
- **对外**：AI 驱动的企业官网，智能接待客户（多轮对话 + 文件图片上传）
- **对内**：AI 驱动的数据洞察，辅助经营决策
- **运营**：AI 员工矩阵，自动化业务流程（知识库 MD 文件驱动）

### 1.3 模块划分

| 模块 | 主要功能 |
|------|---------|
| 模块一：企业 AI 官网 | 品牌展示、产品系统、AI 员工实时接待、留资转化 |
| 模块二：企业数据洞察 | 数据采集（模拟）、AI 整合分析、监控告警、销售/舆情/市场洞察 |
| 模块三：AI 员工矩阵 | 角色配置、知识库、记忆系统、技能加载、工作流引擎 |

### 1.4 域名拆分

| 平台 | 域名 | 端口 |
|------|------|------|
| 管理后台 | admin.xxx.com | 3000 |
| AI 官网 | www.xxx.com | 3001 |
| API 服务 | api.xxx.com | 8000 |

### 1.5 技术栈确认

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **前端** | Next.js 14 + TypeScript + TailwindCSS | App Router，中英双语 |
| **后端** | Python FastAPI | AI 集成友好，高性能 |
| **数据库** | PostgreSQL + Redis | 结构化数据 + 缓存/会话 |
| **AI 模型** | Qwen3.5 Plus | 主力对话模型 |
| **知识库** | MD 文件轻量模式 | 无向量库，关键词检索 |
| **数据源** | 模拟数据（亚马逊格式） | 后期可切换真实 API |

---

## 二、设计风格

### 2.1 风格定义
**苹果风格（Apple） + 爱马仕橙（Hermès Orange）点缀**

### 2.2 设计规范

```
核心特征：
- 大量留白，呼吸感强
- 圆角轻盈（6-8px）
- 柔和淡影（Apple 风格多层阴影）
- 动效微交互（300-500ms ease-out）
- 线性图标为主，线条极细
- 高质量产品图

配色系统：
┌────────────────────────────────────────────┐
│ 主色                                      │
│   --hermes-orange: #E65C00                │
│   --orange-light: #FF7A2F                 │
│   --orange-pale: #FFF4EE                  │
├────────────────────────────────────────────┤
│ 背景色                                    │
│   --bg-primary: #FFFFFF                   │
│   --bg-secondary: #FAFAFA                 │
│   --bg-dark: #1D1D1F                     │
│   --bg-dark-secondary: #2D2D2F           │
├────────────────────────────────────────────┤
│ 文字色                                    │
│   --text-primary: #1D1D1F                 │
│   --text-secondary: #86868B               │
│   --text-inverse: #FFFFFF                 │
├────────────────────────────────────────────┤
│ 边框/分隔                                 │
│   --border: #E5E5E7                      │
│   --border-dark: #424245                  │
└────────────────────────────────────────────┘

字体：
- 标题：SF Pro Display / Source Han Sans CN (思源黑体)
- 正文：SF Pro Text / Noto Sans SC
- 数据/代码：JetBrains Mono

爱马仕橙使用边界：
- CTA 按钮（主要操作）
- 导航高亮（当前选中）
- 重要提示/徽标
- 不用于：大面积背景、大段正文
```

### 2.3 移动端适配
- 响应式布局（TailwindCSS breakpoints）
- 移动端优先导航（汉堡菜单）
- 手势交互支持（聊天滑动撤回）
- 图片自适应（Next.js Image 组件）

---

## 三、技术架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                  admin.xxx.com (3000)                   │
│                    Next.js 管理后台                     │
│  产品管理 | AI员工配置 | 数据看板 | 知识库 | 数据源     │
├─────────────────────────────────────────────────────────┤
│                  www.xxx.com (3001)                    │
│                    Next.js AI 官网                     │
│  首页 | 产品列表 | 产品详情 | AI接待 | 留资表单          │
├─────────────────────────────────────────────────────────┤
│                   api.xxx.com (8000)                   │
│                   Python FastAPI                       │
│  /api/products  /api/agents  /api/chat                 │
│  /api/knowledge /api/analytics /api/amazon (mock)      │
├─────────────────────────────────────────────────────────┤
│                      数据层                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│   │ PostgreSQL  │  │   Redis     │  │  文件存储   │    │
│   │  (主数据库)  │  │ (缓存/会话) │  │  (本地/MinIO)│   │
│   └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│                      AI 层                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│   │ Qwen3.5 Plus│  │ MD 知识库   │  │  会话引擎   │    │
│   │  (对话模型)  │  │ (文件检索)  │  │ (上下文)    │    │
│   └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│                      采集层                              │
│   ┌─────────────┐  ┌─────────────┐                      │
│   │ 亚马逊模拟  │  │ 定时任务    │                      │
│   │ 数据 (Mock) │  │ (APScheduler)│                      │
│   └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 目录结构

```
e-commerce-ai-platform/
├── docs/
│   ├── 规划方案.md           # 本文档
│   ├── 编码规范.md           # 开发规范
│   └── 接口文档.md           # API 文档
├── fronted/
│   ├── admin/               # 管理后台 (Next.js 3000)
│   │   └── app/
│   ├── website/             # AI 官网 (Next.js 3001)
│   │   └── app/
│   └── packages/            # 共享组件
│       └── ui/
├── backend/
│   ├── apps/
│   │   ├── products/        # 产品管理
│   │   ├── agents/          # AI 员工
│   │   ├── chat/            # 对话服务
│   │   ├── knowledge/       # 知识库
│   │   └── analytics/       # 数据洞察
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── ai_client.py     # Qwen API
│   ├── models/
│   └── services/
├── agents/                   # AI Agent 配置（MD 文件）
│   ├── profiles/
│   │   ├── ai_customer_service.md
│   │   └── ai_sales.md
│   ├── knowledge/           # 知识库 MD 文件
│   │   ├── enterprise/
│   │   │   ├── brand.md
│   │   │   ├── policy.md
│   │   │   └── contact.md
│   │   ├── products/
│   │   │   ├── skincare.md
│   │   │   ├── makeup.md
│   │   │   └── faq.md
│   │   └── operations/
│   │       ├── refund_policy.md
│   │       └── shipping.md
│   ├── skills/
│   │   ├── skill_order_query.md
│   │   ├── skill_product_query.md
│   │   └── skill_complaint.md
│   └── workflows/
│       ├── wf_customer_service.md
│       └── wf_complaint.md
├── scripts/
│   ├── mock_amazon_data.py   # 亚马逊模拟数据
│   └── seed_data.py
└── docs/                      # 项目文档
```

---

## 四、模块一：企业 AI 官网

### 4.1 页面列表

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` 或 `/zh` | 品牌 Hero 区、核心卖点、CTA |
| 产品列表 | `/products` | 分类筛选、搜索分页 |
| 产品详情 | `/products/[id]` | 详细信息、相关推荐 |
| AI 接待 | `/chat` | AI 客服对话页（全屏模式） |
| 留资表单 | `/contact` | 访客信息收集 |

### 4.2 AI 对话核心功能

```
对话能力：
┌──────────────────────────────────────────────────────────┐
│  ✓ 多轮对话（上下文工程）                                │
│  ✓ 文件上传（PDF/Word/Excel，最大 10MB）                 │
│  ✓ 图片上传（JPG/PNG/GIF/WebP，最大 5MB）               │
│  ✓ 知识库检索（MD 文件关键词匹配）                       │
│  ✓ 意图识别 + 技能路由                                   │
│  ✓ 中英双语支持                                         │
│  ✓ 流式输出（Streaming）                                 │
└──────────────────────────────────────────────────────────┘

上下文工程模式：
┌──────────────────────────────────────────────────────────┐
│  会话记忆分层                                            │
│  ─────────────────────────────────────────────────────   │
│  短期记忆（每轮对话）                                    │
│    · 用户当前问题                                        │
│    · 本轮已提供信息                                       │
│    · 未解决事项                                          │
│                                                          │
│  中期记忆（客户维度）                                    │
│    · 客户基本信息                                       │
│    · 历史订单                                           │
│    · 偏好/标签                                          │
│                                                          │
│  长期记忆（企业知识库）                                  │
│    · MD 知识库文件                                       │
│    · 产品知识                                           │
│    · 政策/FAQ                                           │
└──────────────────────────────────────────────────────────┘
```

### 4.3 界面设计（苹果风 + 爱马仕橙）

```
官网首页（移动端适配）：

┌─────────────────────────────────────┐
│  ☰  Logo          [🌐 EN/中文]     │  ← 移动端汉堡菜单
├─────────────────────────────────────┤
│                                     │
│        企业 AI 管理平台              │
│                                     │
│   让 AI 成为你最强的员工             │
│                                     │
│   [深入了解]  [立即体验 →]         │  ← 爱马仕橙 CTA
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  产品A  │  │  产品B  │          │
│  │  ¥299   │  │  ¥199   │          │
│  └─────────┘  └─────────┘          │
│  ┌─────────┐  ┌─────────┐          │
│  │  产品C  │  │  产品D  │          │
│  │  ¥399   │  │  ¥159   │          │
│  └─────────┘  └─────────┘          │
│                                     │
│           [查看全部 →]              │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  💬 遇到问题？AI-小雪为您服务        │
│  [开始对话]                         │  ← 橙色按钮
│                                     │
├─────────────────────────────────────┤
│  产品  AI接待  关于我们  联系        │
└─────────────────────────────────────┘
```

---

## 五、模块二：企业数据洞察

### 5.1 功能列表

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 数据源管理 | 配置亚马逊模拟数据源 | P0 |
| 数据采集 | 定时生成模拟订单/销售数据 | P0 |
| 销售看板 | 订单趋势、成交额、客单价 | P0 |
| 舆情看板 | 评价分析、投诉统计 | P1 |
| 市场看板 | 行业趋势、竞品监控 | P1 |
| 告警中心 | 数据异常、差评预警 | P1 |

### 5.2 模拟数据方案

```
亚马逊模拟数据结构（基于 SP-API 格式）：

products（商品）
{
  "asin": "B09N5ZNWWX",
  "title": "Premium Skincare Set",
  "price": 299.00,
  "category": "Skincare",
  "stock": 156,
  "rating": 4.5,
  "reviewCount": 128,
  "images": ["url1", "url2"],
  "description": "..."
}

orders（订单）
{
  "orderId": "ORDER-20260501-001",
  "status": "Shipped",
  "items": [...],
  "totalAmount": 299.00,
  "customerId": "CUST-001",
  "orderDate": "2026-05-01T10:00:00Z",
  "shipmentId": "SF1234567890"
}

inventory（库存）
{
  "asin": "B09N5ZNWWX",
  "fulfillmentChannel": "FBM",
  "totalQuantity": 156,
  "inboundQuantity": 0,
  "outboundQuantity": 23
}

reviews（评价）
{
  "reviewId": "REV-001",
  "asin": "B09N5ZNWWX",
  "rating": 4,
  "title": "Great product!",
  "body": "...",
  "verifiedPurchase": true,
  "reviewDate": "2026-05-01"
}
```

---

## 六、模块三：AI 员工矩阵

### 6.1 核心功能

```
┌──────────────────────────────────────────────────────────┐
│  ✓ 身份配置（Profile MD）                                │
│  ✓ 知识库管理（Knowledge MD）                            │
│  ✓ 技能配置（Skill MD）                                 │
│  ✓ 工作流配置（Workflow MD）                             │
│  ✓ 工具集（Tools）                                      │
│  ✓ 多渠道接入                                           │
│  ✓ 中英双语                                             │
└──────────────────────────────────────────────────────────┘
```

### 6.2 知识库管理（MD 文件模式）

```
知识库目录结构：
agents/
└── knowledge/
    ├── enterprise/
    │   ├── brand.md           # 企业介绍、品牌故事
    │   ├── policy.md          # 售前政策、售后政策
    │   └── contact.md         # 联系方式、地址
    ├── products/
    │   ├── skincare.md        # 护肤产品知识库
    │   ├── makeup.md          # 美妆产品知识库
    │   ├── electronics.md     # 数码产品知识库
    │   └── faq.md             # 常见问题解答
    └── operations/
        ├── refund_policy.md   # 退款流程详解
        ├── shipping.md        # 发货说明、物流合作
        └── coupon.md          # 优惠券使用规则

知识库检索流程：
用户问题 → 关键词提取 → MD 文件标题/首行匹配 → 提取相关段落 → 注入 System Prompt

无向量数据库依赖，零额外成本，即时更新
```

### 6.3 AI 员工类型

| 员工 | 角色 | 核心技能 | 渠道 |
|------|------|---------|------|
| AI-小雪 | 智能客服 | 咨询解答、订单查询、投诉处理 | 官网 |
| AI-销冠 | 销售顾问 | 产品推荐、优惠推送、催单转化 | 官网 |
| AI-数据官 | 数据分析 | 数据解读、报告生成、策略建议 | 内部 |

---

## 七、数据库设计

### 7.1 核心表结构

```sql
-- 企业信息
CREATE TABLE enterprise (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    logo VARCHAR(500),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 产品表
CREATE TABLE products (
    id UUID PRIMARY KEY,
    asin VARCHAR(20),              -- 亚马逊 ASIN（模拟）
    name VARCHAR(255),
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock INT,
    rating DECIMAL(2,1),
    review_count INT,
    images JSON,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI 员工配置
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    role VARCHAR(50),
    profile_md TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 技能配置
CREATE TABLE skills (
    id UUID PRIMARY KEY,
    agent_id UUID,
    name VARCHAR(100),
    trigger_keywords JSON,
    skill_md TEXT,
    workflow_md TEXT,
    status VARCHAR(20) DEFAULT 'active'
);

-- 对话记录
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    agent_id UUID,
    visitor_id VARCHAR(100),
    messages JSON,
    visitor_info JSON,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    status VARCHAR(20)
);

-- 访客信息
CREATE TABLE visitors (
    id UUID PRIMARY KEY,
    visitor_id VARCHAR(100) UNIQUE,
    name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    tags JSON,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 留资记录
CREATE TABLE leads (
    id UUID PRIMARY KEY,
    visitor_id VARCHAR(100),
    name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    intent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 亚马逊模拟数据
CREATE TABLE amazon_products (
    asin VARCHAR(20) PRIMARY KEY,
    data JSON,
    synced_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE amazon_orders (
    order_id VARCHAR(50) PRIMARY KEY,
    data JSON,
    synced_at TIMESTAMP DEFAULT NOW()
);

-- 告警记录
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    type VARCHAR(50),
    level VARCHAR(20),
    title VARCHAR(255),
    content TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 系统配置
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSON,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 八、开发计划

### 8.1 阶段划分

| 阶段 | 内容 | 周期 | 优先级 |
|------|------|------|--------|
| **Phase 0** | 项目初始化、技术架构搭建 | 1周 | P0 |
| **Phase 1** | 模块一：AI 官网基础功能 | 2周 | P0 |
| **Phase 2** | 模块三：AI 员工矩阵（基础） | 2周 | P0 |
| **Phase 3** | 模块二：数据洞察（基础） | 2周 | P1 |
| **Phase 4** | 模块间集成、优化 | 1周 | P1 |
| **Phase 5** | 高级功能、扩展渠道 | 待定 | P2 |

### 8.2 Phase 0 工作项

- [x] 项目目录结构创建
- [x] Git 仓库初始化
- [x] 前端：Next.js 项目初始化（admin + website 双项目）
- [x] 后端：FastAPI 项目初始化
- [x] 数据库：PostgreSQL 配置
- [x] AI：Qwen3.5 Plus API 接入
- [x] 文档：项目 README 编写

### 8.3 Phase 1 工作项（AI 官网）

- [ ] 首页开发（苹果风 + 爱马仕橙）
- [ ] 产品列表页（移动端适配）
- [ ] 产品详情页
- [ ] AI 客服浮窗组件
- [ ] AI 对话页（全屏多轮对话）
- [ ] 文件/图片上传功能
- [ ] 留资表单
- [ ] 中英双语切换

### 8.4 Phase 2 工作项（AI 员工矩阵）

- [ ] AI 员工管理后台
- [ ] 身份配置 MD 编辑器
- [ ] 知识库 MD 文件管理
- [ ] 技能文件管理
- [ ] 工作流可视化配置
- [ ] 工具集开发
- [ ] 多渠道接入框架

### 8.5 Phase 3 工作项（数据洞察）

- [ ] 数据源管理配置
- [ ] 亚马逊模拟数据生成
- [ ] 销售看板开发
- [ ] 舆情看板开发
- [ ] 告警系统

---

## 九、环境变量配置

```bash
# .env 文件
# 后端
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce_ai
REDIS_URL=redis://localhost:6379/0
QWEN_API_KEY=your_qwen_api_key
QWEN_MODEL=qwen3.5plus
JWT_SECRET_KEY=your_secret_key

# 前端（管理后台）
NEXT_PUBLIC_API_URL=http://localhost:8000

# 前端（官网）
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3001

# Nginx
ADMIN_DOMAIN=admin.xxx.com
WEBSITE_DOMAIN=www.xxx.com
API_DOMAIN=api.xxx.com
```

---

## 十、Nginx 配置

```nginx
# nginx.conf
upstream admin_backend {
    server localhost:3000;
}

upstream website_backend {
    server localhost:3001;
}

upstream api_backend {
    server localhost:8000;
}

server {
    listen 80;
    server_name admin.xxx.com;

    location / {
        proxy_pass http://admin_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name www.xxx.com;

    location / {
        proxy_pass http://website_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.xxx.com;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 十一、风险评估

| 风险项 | 影响 | 应对措施 |
|--------|------|---------|
| Qwen API 限流 | 对话响应失败 | 降级返回 + 重试机制 |
| 模拟数据质量 | 看板数据不真实 | 标注"模拟数据"标签 |
| 移动端兼容性 | 某些组件显示异常 | 响应式测试覆盖 |
| 多语言维护成本 | 中英切换遗漏 | i18n 统一管理 |

---

## 十二、待确认/待完成

- [x] 技术栈选择：Next.js + FastAPI
- [x] 数据库方案：PostgreSQL + Redis
- [x] AI 模型：Qwen3.5 Plus
- [x] 知识库：MD 文件轻量模式
- [x] 域名拆分：admin.xxx.com + www.xxx.com
- [x] 数据源：亚马逊模拟数据
- [x] 开发优先级：Phase 0→1→2→3
- [ ] 正式环境域名确认
- [ ] 亚马逊真实 API 接入时间计划

---

> 方案版本：v2.0 已确认
> 确认后请回复"确认 Phase 0"，我将开始项目初始化工作。
