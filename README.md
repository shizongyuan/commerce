# 焕美严选 AI 运营管理平台

> Huanmei Yanxuan AI Operations Management Platform

电商企业一站式 AI 智能化管理平台，实现 AI 驱动的企业官网、数据洞察和 AI 员工矩阵。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 + TypeScript + TailwindCSS |
| 后端 | Python FastAPI |
| 数据库 | PostgreSQL + Redis |
| AI 模型 | Qwen3.5 Plus |

## 项目结构

```
e-commerce-ai-platform/
├── fronted/
│   ├── admin/          # 管理后台 (localhost:3000)
│   └── website/        # AI 官网 (localhost:3001)
├── backend/            # FastAPI 后端 (localhost:8000)
├── agents/             # AI Agent 配置 (MD 文件)
│   ├── profiles/       # 身份配置
│   ├── knowledge/      # 知识库
│   ├── skills/        # 技能配置
│   └── workflows/     # 工作流
└── docs/              # 项目文档
```

## 快速开始

### 前置要求
- Docker Desktop
- Node.js 20+
- Python 3.11+

### 1. 克隆项目
```bash
git clone <repo-url>
cd e-commerce-ai-platform
```

### 2. 配置文件
```bash
# 复制环境变量文件
cp backend/.env.example backend/.env
# 编辑 backend/.env 填入 Qwen API Key
```

### 3. 启动服务

```bash
# 后端
cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# 管理后台（新开终端）
cd fronted/admin && npm install && npm run dev

# AI 官网（新开终端）
cd fronted/website && npm install && npm run dev
```

### 4. 访问地址
| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:3000 |
| AI 官网 | http://localhost:3001 |
| API 文档 | http://localhost:8000/docs |

## 核心功能

### 模块一：AI 官网
- 品牌展示 + 产品列表
- AI 客服多轮对话
- 文件/图片上传
- 中英双语支持
- 留资表单

### 模块二：数据洞察
- 销售看板（模拟数据）
- 舆情看板
- 告警中心

### 模块三：AI 员工矩阵
- 身份配置（Profile MD）
- 知识库（Knowledge MD，关键词检索）
- 技能配置（Skill MD）
- 工作流配置（Workflow MD）

## 开发指南

### 后端路由
```
/api/products    - 产品管理
/api/agents     - AI 员工配置
/api/chat       - AI 对话
/api/knowledge  - 知识库检索
/api/analytics  - 数据看板
```

### 添加新知识库
在 `agents/knowledge/` 下创建 `.md` 文件，AI 员工将自动检索。

### AI 对接
使用 Qwen3.5 Plus API，配置 `QWEN_API_KEY` 环境变量。

## 设计风格

- **风格**：苹果风 + 爱马仕橙点缀
- **主色**：#E65C00（爱马仕橙）
- **字体**：SF Pro Display / 思源黑体
- **圆角**：8px
- **阴影**：柔和淡影

## 许可证

MIT License
