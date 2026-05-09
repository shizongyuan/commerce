# 电商 AI 管理平台 - 编码规范

> 文档版本：v1.0
> 创建日期：2026-05-01
> 关联规划：电商AI管理平台规划方案 v1.0

---

## 一、整体原则

### 1.1 代码质量目标
- **可读性**：代码如同精心撰写的文档
- **可维护性**：未来任何人都能快速接手
- **一致性**：全团队统一风格，无个人偏好
- **可测试性**：每个函数/方法都可被测试
- **安全性**：默认安全，杜绝常见漏洞

### 1.2 技术栈对应规范

| 技术栈 | 规范文档 |
|--------|---------|
| Python (FastAPI) | Python 编码规范 |
| TypeScript (Next.js) | TypeScript 编码规范 |
| AI Agent (OpenClaw) | Agent 配置规范 |
| 数据库 | SQL/数据库规范 |
| Git | Git 工作流规范 |
| API | REST API 设计规范 |

---

## 二、Python 编码规范（后端）

### 2.1 项目结构

```
backend/
├── apps/                          # 业务应用模块
│   ├── __init__.py
│   ├── ai_website/               # 模块一：AI 官网
│   │   ├── __init__.py
│   │   ├── routers/              # 路由（与前端页面对应）
│   │   │   ├── __init__.py
│   │   │   ├── products.py       # 产品相关路由
│   │   │   ├── chat.py           # AI 对话路由
│   │   │   └── leads.py          # 留资路由
│   │   ├── schemas/              # Pydantic 请求/响应模型
│   │   │   ├── __init__.py
│   │   │   ├── product.py
│   │   │   ├── chat.py
│   │   │   └── lead.py
│   │   ├── services/            # 业务逻辑层
│   │   │   ├── __init__.py
│   │   │   ├── product_service.py
│   │   │   ├── chat_service.py
│   │   │   └── lead_service.py
│   │   └── models/               # ORM 模型（如使用 SQLAlchemy）
│   │       ├── __init__.py
│   │       └── product.py
│   ├── data_insight/             # 模块二：数据洞察
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── collector_service.py  # 数据采集
│   │   │   ├── processor_service.py  # 数据处理
│   │   │   └── analytics_service.py # 数据分析
│   │   └── models/
│   └── ai_agent/                 # 模块三：AI 员工
│       ├── routers/
│       ├── schemas/
│       ├── services/
│       │   ├── agent_service.py
│       │   ├── memory_service.py
│       │   ├── skill_service.py
│       │   └── workflow_service.py
│       └── models/
├── core/                          # 核心配置
│   ├── __init__.py
│   ├── config.py                  # 应用配置
│   ├── database.py               # 数据库连接
│   ├── security.py                # 安全相关（JWT、CORS等）
│   └── ai_client.py              # AI 模型客户端（Qwen）
├── agents/                        # AI Agent 配置（与前端共享）
│   ├── profiles/
│   ├── memories/
│   ├── skills/
│   └── workflows/
├── scripts/                        # 工具脚本
│   ├── init_db.py
│   ├── seed_data.py
│   └── test_ai.py
├── tests/                         # 测试
│   ├── __init__.py
│   ├── conftest.py               # pytest 配置
│   ├── apps/
│   │   ├── ai_website/
│   │   ├── data_insight/
│   │   └── ai_agent/
│   └── core/
├── pyproject.toml                 # Python 项目配置
└── requirements.txt
```

### 2.2 命名规范

#### 2.2.1 文件命名
```
# 模块文件夹：小写下划线分隔
ai_website/
data_insight/
ai_agent/

# Python 文件：小写下划线分隔
product_service.py
chat_service.py
agent_service.py

# 测试文件：test_ 前缀
test_product_service.py
test_chat_service.py

# 配置文件：小写下划线分隔
database.py
config.py
```

#### 2.2.2 代码命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块/包 | 小写下划线 | `ai_website`, `product_service` |
| 类名 | 大驼峰 PascalCase | `ProductService`, `ChatService` |
| 函数/方法 | 小写下划线 | `get_product`, `query_orders` |
| 变量 | 小写下划线 | `product_list`, `order_id` |
| 常量 | 全大写下划线 | `MAX_RETRY_COUNT`, `API_TIMEOUT` |
| 私有成员 | 单下划线前缀 | `_internal_method`, `_cache` |
| 类成员 | 小写下划线 | `self.user_id`, `self.access_token` |
| 类型别名 | 大驼峰末尾 Alias | `ProductDict`, `OrderList` |

#### 2.2.3 数据库命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 表名 | 小写下划线，复数形式 | `products`, `ai_agents`, `conversations` |
| 字段名 | 小写下划线 | `created_at`, `user_id`, `order_no` |
| 主键 | `id` 或 `{table}_id` | `id`, `product_id` |
| 外键 | `{related_table}_id` | `agent_id`, `enterprise_id` |
| 索引 | `idx_{table}_{column}` | `idx_products_category` |
| 唯一索引 | `uk_{table}_{column}` | `uk_ai_agents_code` |

### 2.3 代码格式

#### 2.3.1 格式化配置（pyproject.toml / setup.cfg）

```toml
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'
exclude = '''
/(
    \.git
  | \.venv
  | __pycache__
  | node_modules
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
line_length = 100
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true

[tool.ruff]
line-length = 100
target-version = "py311"
select = ["E", "F", "W", "I", "N", "UP", "B", "C4"]
ignore = ["E501"]  # 行长度由 black 管理
```

#### 2.3.2 导入顺序（Import Order）

```python
# 1. 标准库
import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

# 2. 第三方库
import httpx
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Integer

# 3. 本地应用（绝对导入）
from apps.ai_website.schemas import ProductSchema
from apps.ai_website.services import ProductService
from core.config import settings
from core.database import Base, get_db

# 4. 相对导入（仅在无法使用绝对导入时）
from ...core import security

# 分组之间空一行
# 不允许使用 import *
```

#### 2.3.3 函数/方法规范

```python
# ✅ 正确示例

async def get_product(
    product_id: str,
    include_images: bool = True,
    include_inventory: bool = False,
) -> Optional[ProductSchema]:
    """
    获取产品详情

    Args:
        product_id: 产品ID
        include_images: 是否包含图片
        include_inventory: 是否包含库存

    Returns:
        ProductSchema: 产品数据

    Raises:
        ProductNotFoundError: 产品不存在
    """
    product = await product_service.get_by_id(product_id)
    if not product:
        raise ProductNotFoundError(f"Product {product_id} not found")

    return ProductSchema.model_validate(product)


def process_order(order_data: Dict[str, Any]) -> OrderResult:
    """处理订单（同步函数示例）"""
    # 业务逻辑
    pass


class ProductService:
    """产品服务类"""

    def __init__(self, db: Session):
        self._db = db
        self._cache: Dict[str, Any] = {}

    async def get_by_id(self, product_id: str) -> Optional[Product]:
        """根据ID获取产品"""
        cache_key = f"product:{product_id}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        product = self._db.query(Product).filter(
            Product.id == product_id
        ).first()

        if product:
            self._cache[cache_key] = product

        return product
```

```python
# ❌ 错误示例

def getProduct(productId):  # 违反命名规范
    result = product_service.GET_BY_ID(productId)  # 链式调用
    if result != None:  # 使用 != None 而非 is not None
        return result
    else:
        return None
```

### 2.4 异步编程规范

```python
# ✅ 正确：清晰区分同步/异步函数

async def fetch_amazon_data(asin: str) -> Dict[str, Any]:
    """从亚马逊获取产品数据（异步IO）"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"https://api.amazon.com/products/{asin}",
            headers={"Authorization": f"Bearer {settings.AMAZON_TOKEN}"}
        )
        response.raise_for_status()
        return response.json()


async def batch_fetch_products(asins: List[str]) -> List[Dict[str, Any]]:
    """批量获取产品（使用 asyncio.gather 并发）"""
    tasks = [fetch_amazon_data(asin) for asin in asins]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 处理异常结果
    processed_results = []
    for asin, result in zip(asins, results):
        if isinstance(result, Exception):
            logger.error(f"Failed to fetch {asin}: {result}")
            processed_results.append({"asin": asin, "error": str(result)})
        else:
            processed_results.append(result)

    return processed_results
```

### 2.5 错误处理规范

```python
# ✅ 使用自定义异常类

class AppException(Exception):
    """应用基础异常类"""
    def __init__(self, message: str, code: str = "APP_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ProductNotFoundError(AppException):
    """产品不存在"""
    def __init__(self, product_id: str):
        super().__init__(
            message=f"Product {product_id} not found",
            code="PRODUCT_NOT_FOUND"
        )


class AIQuotaExceededError(AppException):
    """AI 调用配额超限"""
    def __init__(self, model: str):
        super().__init__(
            message=f"AI quota exceeded for model {model}",
            code="AI_QUOTA_EXCEEDED"
        )


class DataSourceError(AppException):
    """数据源连接异常"""
    def __init__(self, source: str, reason: str):
        super().__init__(
            message=f"Data source {source} error: {reason}",
            code="DATA_SOURCE_ERROR"
        )


# ✅ 全局异常处理器（FastAPI）

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(ProductNotFoundError)
async def product_not_found_handler(
    request: Request,
    exc: ProductNotFoundError
) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={
            "code": exc.code,
            "message": exc.message,
            "request_id": request.state.request_id
        }
    )


@app.exception_handler(AIQuotaExceededError)
async def ai_quota_handler(
    request: Request,
    exc: AIQuotaExceededError
) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={
            "code": exc.code,
            "message": exc.message,
            "request_id": request.state.request_id,
            "retry_after": 60  # 秒
        }
    )
```

### 2.6 日志规范

```python
# ✅ 日志配置与使用

import logging
from core.config import settings

logger = logging.getLogger(__name__)


class ProductService:
    """产品服务"""

    def __init__(self, db: Session):
        self._db = db
        self._logger = logging.getLogger(f"{__name__}.ProductService")

    async def get_product(self, product_id: str) -> Optional[Product]:
        self._logger.info(
            "Fetching product",
            extra={
                "product_id": product_id,
                "operation": "get_product"
            }
        )

        try:
            product = await self._fetch_from_db(product_id)
            self._logger.info(
                "Product fetched successfully",
                extra={"product_id": product_id}
            )
            return product

        except Exception as e:
            self._logger.error(
                "Failed to fetch product",
                extra={
                    "product_id": product_id,
                    "error": str(e)
                },
                exc_info=True  # 打印完整堆栈
            )
            raise
```

```python
# 日志等级使用规范
# DEBUG: 详细调试信息（开发环境）
# INFO: 正常业务流程（生产环境记录）
# WARNING: 异常但可处理（如 AI 重试）
# ERROR: 错误但需要人工介入
# CRITICAL: 系统级严重错误

# ✅ 正确
logger.debug(f"Cache miss for key: {cache_key}")
logger.info(f"User {user_id} logged in from {ip_address}")
logger.warning(f"AI API retry {retry_count}/3, error: {error}")
logger.error(f"Failed to send message: {message_id}", exc_info=True)

# ❌ 错误
print(f"Debug: {variable}")  # 禁止使用 print
logger.info(f"用户{user_id}登录")  # 中英文混用
```

---

## 三、TypeScript 编码规范（前端）

### 3.1 项目结构

```
fronted/
├── app/                           # Next.js App Router
│   ├── (admin)/                  # 管理后台路由组
│   │   ├── layout.tsx            # 管理后台布局
│   │   ├── dashboard/
│   │   │   └── page.tsx         # 仪表盘
│   │   ├── products/
│   │   │   ├── page.tsx          # 产品列表
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # 产品详情
│   │   │   └── new/
│   │   │       └── page.tsx      # 新增产品
│   │   ├── agents/               # AI 员工管理
│   │   │   ├── page.tsx          # 列表
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # 编辑
│   │   │   └── new/
│   │   │       └── page.tsx      # 新建
│   │   ├── analytics/             # 数据洞察
│   │   │   ├── sales/
│   │   │   │   └── page.tsx      # 销售看板
│   │   │   ├── sentiment/
│   │   │   │   └── page.tsx      # 舆情看板
│   │   │   └── market/
│   │   │       └── page.tsx      # 市场看板
│   │   └── settings/
│   │       └── page.tsx          # 系统设置
│   ├── (website)/                # 企业官网路由组
│   │   ├── layout.tsx            # 官网布局
│   │   ├── page.tsx              # 首页
│   │   ├── products/
│   │   │   ├── page.tsx          # 产品列表
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 产品详情
│   │   ├── about/
│   │   │   └── page.tsx          # 关于我们
│   │   └── contact/
│   │       └── page.tsx          # 联系我们
│   ├── api/                      # API 路由（后端代理）
│   │   ├── products/
│   │   │   └── route.ts
│   │   ├── agents/
│   │   │   └── route.ts
│   │   └── chat/
│   │       └── route.ts
│   ├── layout.tsx                # 根布局
│   └── globals.css               # 全局样式
├── components/                   # 组件
│   ├── ui/                       # 基础 UI 组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   └── table.tsx
│   ├── layout/                  # 布局组件
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── admin-layout.tsx
│   ├── features/                # 功能组件
│   │   ├── products/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-list.tsx
│   │   │   └── product-form.tsx
│   │   ├── chat/
│   │   │   ├── chat-window.tsx
│   │   │   ├── chat-message.tsx
│   │   │   └── chat-input.tsx
│   │   ├── analytics/
│   │   │   ├── sales-chart.tsx
│   │   │   ├── sentiment-chart.tsx
│   │   │   └── alert-list.tsx
│   │   └── agents/
│   │       ├── agent-card.tsx
│   │       ├── agent-form.tsx
│   │       ├── skill-editor.tsx
│   │       └── workflow-canvas.tsx
│   └── icons/                    # 图标组件
│       └── index.tsx
├── lib/                          # 工具库
│   ├── api.ts                    # API 请求封装
│   ├── utils.ts                  # 工具函数
│   ├── constants.ts              # 常量
│   └── validations.ts            # 验证函数
├── hooks/                        # React Hooks
│   ├── use-products.ts
│   ├── use-chat.ts
│   ├── use-agents.ts
│   └── use-analytics.ts
├── types/                        # TypeScript 类型
│   ├── api.ts                    # API 类型
│   ├── product.ts                # 产品类型
│   ├── agent.ts                  # AI 员工类型
│   ├── analytics.ts              # 数据洞察类型
│   └── user.ts                   # 用户类型
├── stores/                       # 状态管理（Zustand）
│   ├── chat-store.ts
│   ├── agent-store.ts
│   └── ui-store.ts
├── public/                       # 静态资源
│   ├── images/
│   └── fonts/
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

### 3.2 命名规范

#### 3.2.1 文件命名

```
# 组件文件：大驼峰 PascalCase
ProductCard.tsx
ChatWindow.tsx
SalesChart.tsx

# 工具/工具函数文件：小写下划线
api-client.ts
format-date.ts
validation.ts

# 测试文件：test 前缀或 .test.tsx 后缀
ProductCard.test.tsx
useProducts.test.ts

# 类型定义文件：小写 + .types.ts
product.types.ts
agent.types.ts

# 常量文件：小写下划线
api-endpoints.ts
page-routes.ts
```

#### 3.2.2 代码命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | 大驼峰 PascalCase | `ProductCard`, `ChatWindow` |
| 函数组件 | 大驼峰 PascalCase | `function ProductList()` |
| Hooks | 小写 use 前缀 camelCase | `useProducts`, `useChat` |
| 工具函数 | 小写 camelCase 或 动宾短语 | `formatDate`, `getProductById` |
| 事件处理 | handle 前缀 | `handleClick`, `handleSubmit` |
| 异步请求 | fetch/use 前缀 + 名词 | `fetchProducts`, `useProducts` |
| 状态变量 | 名词或 形容词/过去分词 | `products`, `isLoading` |
| 常量 | 全大写下划线 或 PascalCase | `MAX_RETRY_COUNT`, `ApiEndpoints` |
| 接口/类型 | 大驼峰 PascalCase | `Product`, `AgentConfig` |
| 枚举 | 大驼峰 PascalCase，成员全大写下划线 | `enum OrderStatus { PENDING = 'pending' }` |
| 文件夹（页面路由） | 小写下划线 | `products/`, `ai_agents/` |
| CSS 类名 | 小写下划线（Tailwind） | `flex items-center gap-4` |

### 3.3 代码格式

#### 3.3.1 TypeScript 配置（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### 3.3.2 组件规范

```tsx
// ✅ 正确示例

// types/product.ts
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  createdAt: Date;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// components/features/products/product-card.tsx
'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onViewDetail?: (id: string) => void;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({
  product,
  onViewDetail,
  onAddToCart,
}: ProductCardProps) {
  const handleViewClick = useCallback(() => {
    onViewDetail?.(product.id);
  }, [onViewDetail, product.id]);

  const handleAddToCart = useCallback(() => {
    onAddToCart?.(product);
  }, [onAddToCart, product]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="relative aspect-square mb-4">
        <Image
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <h3 className="font-medium text-gray-900 truncate">
        {product.name}
      </h3>
      <p className="text-lg font-bold text-blue-600 mt-2">
        ¥{product.price.toFixed(2)}
      </p>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleViewClick}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md
                     hover:bg-gray-50 transition-colors"
        >
          查看详情
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md
                     hover:bg-blue-700 transition-colors"
        >
          加入购物车
        </button>
      </div>
    </div>
  );
}
```

```tsx
// ❌ 错误示例

// 文件名不符规范
const Product_card = ({product}) => {
  // 使用 any 类型
  const handler = (e: any) => {
    // 内联样式
    return <div style={{marginTop: '10px'}}>...</div>
  }
  return <ProductCard product={product} onClick={handler} />
}
```

#### 3.3.3 API 调用规范

```typescript
// lib/api.ts
import type { ApiResponse, Product, ProductListParams, ProductListResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// lib/endpoints.ts
export const ApiEndpoints = {
  products: {
    list: '/api/products',
    detail: (id: string) => `/api/products/${id}`,
    create: '/api/products',
    update: (id: string) => `/api/products/${id}`,
    delete: (id: string) => `/api/products/${id}`,
  },
  agents: {
    list: '/api/agents',
    detail: (id: string) => `/api/agents/${id}`,
    skills: (id: string) => `/api/agents/${id}/skills`,
    workflows: (id: string) => `/api/agents/${id}/workflows`,
  },
  chat: {
    send: '/api/chat/send',
    history: (sessionId: string) => `/api/chat/history/${sessionId}`,
  },
} as const;

// hooks/use-products.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { ApiEndpoints } from '@/lib/endpoints';
import type { Product, ProductListParams, ProductListResponse } from '@/types/product';

interface UseProductsOptions {
  initialParams?: ProductListParams;
  onError?: (error: Error) => void;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { initialParams = {}, onError } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<ProductListParams>(initialParams);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params.category) searchParams.set('category', params.category);
      if (params.keyword) searchParams.set('keyword', params.keyword);

      const queryString = searchParams.toString();
      const endpoint = queryString
        ? `${ApiEndpoints.products.list}?${queryString}`
        : ApiEndpoints.products.list;

      const response = await apiClient.get<ProductListResponse>(endpoint);
      setProducts(response.data.items);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch products');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [params, onError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = useCallback((newParams: Partial<ProductListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return {
    products,
    isLoading,
    error,
    params,
    updateParams,
    refetch: fetchProducts,
  };
}
```

---

## 四、AI Agent 配置规范（OpenClaw + Qwen）

### 4.1 目录结构

```
agents/
├── profiles/                      # AI 员工身份配置
│   ├── README.md                  # 配置说明
│   ├── ai_customer_service.md     # AI 客服专员
│   ├── ai_xiaohongshu.md          # 小红书运营
│   ├── ai_sales.md                # 销售顾问
│   └── ai_data_officer.md         # 数据分析官
├── memories/                      # 记忆配置
│   ├── README.md
│   ├── enterprise_memory.md       # 企业记忆（通用）
│   ├── product_memory.md          # 产品知识库
│   └── customer_memory.md         # 客户画像模板
├── skills/                        # 技能配置
│   ├── README.md
│   ├── skill_order_query.md        # 订单查询
│   ├── skill_product_query.md      # 产品查询
│   ├── skill_complaint.md          # 投诉处理
│   ├── skill_refund.md             # 退款处理
│   ├── skill_product_recommend.md  # 产品推荐
│   └── skill_data_report.md        # 数据报告
├── workflows/                     # SOP 工作流
│   ├── README.md
│   ├── wf_customer_service.md      # 客服工作流
│   ├── wf_complaint.md             # 投诉处理工作流
│   ├── wf_order_follow.md          # 订单跟进工作流
│   └── wf_daily_report.md          # 日报生成工作流
└── tools/                         # 工具函数定义
    ├── README.md
    ├── query_order.py
    ├── query_product.py
    ├── get_logistics.py
    ├── apply_refund.py
    └── send_notification.py
```

### 4.2 身份配置规范（Profile）

```markdown
# AI 员工身份配置

## 基础信息
- **员工名称**: AI-小雪
- **员工编号**: AGENT-001
- **版本**: v1.0
- **最后更新**: 2026-05-01

## 角色定义
- **角色名称**: 智能客服专员
- **所属部门**: 客户服务中心
- **汇报对象**: 客服主管

## 性格特质
- **核心性格**: 热情、专业、耐心、细心
- **服务态度**: 客户至上，快速响应
- **沟通风格**: 亲切友善，专业但不冷漠

## 对外展示
- **头像**: /images/agents/ai_xiaoxue.png
- **昵称**: 小雪
- **签名**: 您的专属客服，随时为您服务
- **可用状态**: 在线/离线/忙碌

## 专业能力
- **核心技能**:
  - 产品咨询与推荐
  - 订单查询与跟踪
  - 投诉处理与升级
  - 退换货办理
- **禁止行为**:
  - 不承诺未经确认的优惠
  - 不透露内部敏感信息
  - 不代替客户做购买决定

## 接入渠道
- 官网在线客服
- 微信公众号
- 客服系统

## 模型配置
- **模型**: qwen3.5plus
- **温度参数**: 0.7（平衡专业与友好）
- **最大回复长度**: 500 tokens
- **系统提示词**: [见下方]
```

### 4.3 系统提示词模板

```markdown
# 系统提示词模板

## 角色设定
你是一位专业的电商智能客服专员"小雪"，隶属于xxx电商公司客户服务中心。
你的职责是帮助客户解决购物过程中的问题，提供优质的服务体验。

## 性格要求
- 回复要热情、友好、耐心
- 使用"您"称呼客户
- 适时使用表情符号增加亲和力（如😊、👍）
- 回答要简洁明了，避免过于技术化的术语

## 专业要求
- 熟悉公司产品知识
- 了解订单处理流程
- 清楚退换货政策
- 能够根据客户需求推荐合适的产品

## 禁止事项
- 不承诺具体优惠金额
- 不透露其他客户的订单信息
- 不代替客户确认收货或操作账户
- 不使用机器人口吻（如"亲，有什么可以帮您"）

## 上下文记忆
- 企业信息: {enterprise_info}
- 当前客户: {customer_info}
- 会话历史: {conversation_history}
- 进行中订单: {active_orders}

## 工具使用
当你需要查询订单、产品等信息时，请调用相应的工具函数。
当遇到无法处理的问题时，应及时转人工服务。
```

### 4.4 技能配置规范（Skill）

```markdown
# 技能文件：订单查询

## 技能基础信息
- **技能名称**: 订单查询
- **技能编号**: SKILL-ORDER-001
- **版本**: v1.0
- **状态**: 启用
- **最后更新**: 2026-05-01

## 触发条件

### 触发词（精确匹配）
- "查订单"、"我的订单"、"订单在哪"
- "发货了吗"、"什么时候发货"
- "订单状态"、"看看订单"

### 触发词（模糊匹配）
- 订单相关问题
- 物流相关问题
- 发货时间问题

### 排除词（不触发此技能）
- "取消订单" → 触发 skill_refund.md
- "修改地址" → 触发 skill_order_modify.md

## 技能描述
当客户咨询订单相关问题时触发此技能，提供订单查询、状态解读、物流追踪等服务。

## 执行流程

### 步骤1: 身份验证
```
要求客户提供以下任一信息进行身份验证：
- 手机号后4位
- 订单号
- 收件人姓名

验证通过后继续，验证失败则提示重新输入。
```

### 步骤2: 订单查询
```
调用工具: query_order
参数: phone 或 order_no

根据返回结果展示订单列表。
```

### 步骤3: 状态解读
```
根据订单状态提供对应的服务：

| 订单状态 | 用户可能的疑问 | 标准回复策略 |
|---------|--------------|-------------|
| 待付款 | 怎么付款/取消订单 | 提供支付链接，引导付款 |
| 已付款待发货 | 什么时候发货 | 告知预计发货时间 |
| 已发货运输中 | 查到物流了吗 | 查询并告知物流进度 |
| 已发货派送中 | 什么时候能收到 | 告知预计到达时间 |
| 已签收 | 确认收货了吗 | 引导确认收货+好评 |
| 退货退款中 | 退款什么时候到 | 告知退款流程+时间 |
| 已取消 | 订单取消了 | 确认后告知原因 |

```

### 步骤4: 后续服务
```
- 主动询问是否还有其他问题
- 如有异常订单，主动升级人工处理
- 更新客户记忆中的订单信息
```

## 工具定义

```json
{
  "tools": [
    {
      "name": "query_order",
      "description": "根据手机号或订单号查询订单列表",
      "parameters": {
        "type": "object",
        "properties": {
          "phone": {
            "type": "string",
            "description": "下单时的手机号（后4位或完整号）"
          },
          "order_no": {
            "type": "string",
            "description": "订单号"
          }
        },
        "required": []
      }
    },
    {
      "name": "get_logistics",
      "description": "获取物流轨迹信息",
      "parameters": {
        "type": "object",
        "properties": {
          "order_no": {
            "type": "string",
            "description": "订单号"
          },
          "carrier": {
            "type": "string",
            "description": "快递公司（可选，自动识别）"
          }
        },
        "required": ["order_no"]
      }
    }
  ]
}
```

## 常见问答库

| 客户问题 | 标准回复 |
|---------|---------|
| 订单什么时候发货？ | 您好！根据您购买的产品库存情况，付款后预计24小时内发货。如需加急，请在备注中说明。 |
| 怎么查物流？ | 请您提供订单号，我帮您查询最新的物流信息。 |
| 订单能改地址吗？ | 您好，付款后如需修改地址，请在发货前联系客服处理。 |
| 一直没收到货？ | 抱歉给您带来困扰，让我帮您核实一下物流情况... |

## 技能状态
- 启用状态: ✅ 启用
- 当前版本: v1.0
- 更新日志:
  - v1.0 (2026-05-01): 初始版本
```

### 4.5 工作流配置规范（Workflow）

```markdown
# SOP 工作流：客户投诉处理

## 工作流基础信息
- **工作流名称**: 投诉处理流程
- **工作流编号**: WF-COMPLAINT-001
- **版本**: v1.0
- **状态**: 启用
- **最后更新**: 2026-05-01

## 触发条件

### 自动触发
- 客户消息中包含"投诉"关键词
- 客户连续表达不满超过3轮
- 收到平台差评通知

### 手动触发
- 客服手动升级工单
- 系统检测到异常指标

## 告警级别

| 级别 | 定义 | 响应时间 | 升级条件 |
|------|------|---------|---------|
| P0 | 紧急（媒体曝光风险） | 立即 | 15分钟内未解决自动升级 |
| P1 | 高优（VIP/大额订单） | 30分钟 | 2小时内未解决自动升级 |
| P2 | 普通（常规投诉） | 2小时 | 8小时内未解决自动升级 |
| P3 | 低优（一般反馈） | 24小时 | 72小时内未解决自动升级 |

## 工作流节点

### 节点 1: 情绪安抚
```
类型: AI 对话
执行时间: 即时
动作:
  - 道歉表达歉意
  - 表示理解和共情
  - 承诺全力解决

话术示例:
"非常抱歉给您带来不好的体验，我完全理解您现在的心情。
 请您放心，我会全力为您解决这个问题。"
```

### 节点 2: 问题收集
```
类型: 信息收集
执行时间: 即时
必填信息:
  - 订单号 / 产品名称
  - 问题描述
  - 期望的解决方式

可选信息:
  - 图片证据
  - 购买时间
  - 历史沟通记录
```

### 节点 3: 问题分类
```
类型: AI 决策
分支逻辑:
  - 物流问题（延迟、丢件、破损）→ 节点 3.1
  - 产品质量问题 → 节点 3.2
  - 服务态度问题 → 节点 3.3
  - 虚假宣传/描述不符 → 节点 3.4
  - 其他问题 → 节点 3.5
```

#### 节点 3.1: 物流问题处理
```
处理动作:
  - 查询物流轨迹
  - 联系快递公司核实
  - 评估补偿方案

补偿标准:
  - 物流延迟: 补偿订单金额5%，最高50元
  - 丢件: 核实后重新发货或全额退款
  - 破损（签收前）: 可拒收或补偿
  - 破损（签收后）: 补偿订单金额10-30%

反馈时间: 即时反馈处理方案
```

#### 节点 3.2: 产品质量问题
```
处理动作:
  - 记录问题详情
  - 评估是否为质量原因
  - 申请退换货或补偿

处理方案:
  - 退换货: 承担往返运费，优先处理
  - 补偿: 根据损失程度申请

反馈时间: 24小时内给出最终方案
```

#### 节点 3.3: 服务态度问题
```
处理动作:
  - 记录具体问题
  - 内部反馈给相关部门
  - 道歉+优惠券补偿

补偿标准: 10-20元优惠券
反馈时间: 1个工作日内回访
```

#### 节点 3.4: 虚假宣传问题
```
处理动作:
  - 核实宣传内容与实际差异
  - 评估严重程度
  - 申请退换货或退款

补偿标准: 根据影响程度协商
反馈时间: 3个工作日内回复
```

#### 节点 3.5: 其他问题
```
处理动作:
  - 记录问题详情
  - 分类转至对应部门
  - 3个工作日内回复
```

### 节点 4: 方案确认
```
类型: 人工确认
执行条件: P0/P1 级投诉
动作:
  - 客服主管确认方案
  - 客户确认接受
  - 执行补偿/处理
```

### 节点 5: 满意度回访
```
类型: AI 自动跟进
执行时间: 解决后 24小时
动作:
  - 发送满意度调查
  - 收集客户反馈
  - 更新客户画像
  - 关闭工单
```

## 工作流变量

```yaml
complaint_level:
  P0:
    - 定义: 紧急（媒体曝光风险）
    - 响应时间: 立即
    - 升级条件: 15分钟未解决
  P1:
    - 定义: 高优（VIP客户/大额订单>1000元）
    - 响应时间: 30分钟
    - 升级条件: 2小时未解决
  P2:
    - 定义: 普通（常规投诉）
    - 响应时间: 2小时
    - 升级条件: 8小时未解决
  P3:
    - 定义: 低优（一般反馈）
    - 响应时间: 24小时
    - 升级条件: 72小时未解决

compensation_rules:
  物流延迟:
    补偿比例: 订单金额5%
    最高金额: 50元
  产品质量:
    补偿比例: 订单金额10-30%
    最高金额: 200元
  服务态度:
    补偿金额: 10-20元优惠券
  虚假宣传:
    补偿方式: 退换货或退款+补偿
```

## 监控指标

| 指标 | 目标值 | 告警阈值 |
|------|-------|---------|
| 平均处理时长 | < 4小时 | > 8小时 |
| 首次解决率 | > 80% | < 60% |
| 客户满意度 | > 90% | < 80% |
| 升级率 | < 20% | > 30% |
| 投诉解决率 | > 95% | < 90% |
```

---

## 五、REST API 设计规范

### 5.1 URL 设计

```
# 资源命名
GET    /products              # 获取产品列表
GET    /products/:id          # 获取单个产品
POST   /products              # 创建产品
PUT    /products/:id          # 更新产品
DELETE /products/:id          # 删除产品

# 动作（使用动词）
POST   /orders/:id/cancel     # 取消订单
POST   /orders/:id/refund     # 申请退款
POST   /products/:id/images   # 上传产品图片

# 过滤和分页
GET    /products?category=electronics&page=1&pageSize=20
GET    /products?sort=price&order=desc
GET    /products?status=active

# 搜索
GET    /products/search?q=keyword

# 关系资源
GET    /orders/:id/items      # 获取订单商品
GET    /orders/:id/logistics  # 获取物流信息
GET    /agents/:id/skills     # 获取员工技能
GET    /agents/:id/workflows  # 获取员工工作流

# 时间范围
GET    /analytics/sales?start_date=2026-01-01&end_date=2026-01-31
```

### 5.2 请求与响应格式

```typescript
// 请求格式 (Request)
// Content-Type: application/json

// GET 请求
GET /products?page=1&pageSize=20&category=electronics

// POST 请求 Body
{
  "name": "产品名称",
  "price": 299.00,
  "category": "electronics",
  "description": "产品描述"
}

// 响应格式 (Response)
{
  "code": 200,           // 业务状态码
  "message": "success",   // 状态描述
  "data": {},            // 响应数据
  "request_id": "uuid",  // 请求追踪ID
  "timestamp": "ISO8601" // 时间戳
}

// 分页响应
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],          // 数据列表
    "total": 100,         // 总数
    "page": 1,            // 当前页
    "page_size": 20,      // 每页数量
    "total_pages": 5      // 总页数
  },
  "request_id": "uuid",
  "timestamp": "2026-05-01T10:00:00Z"
}

// 错误响应
{
  "code": 404,
  "message": "Product not found",
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "details": "Product with id xxx not found"
  },
  "request_id": "uuid",
  "timestamp": "2026-05-01T10:00:00Z"
}
```

### 5.3 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 | OK | 成功获取/更新资源 |
| 201 | Created | 成功创建资源 |
| 204 | No Content | 成功删除（无返回体） |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 验证错误 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 外部服务错误 |
| 503 | Service Unavailable | 服务不可用 |

### 5.4 API 版本管理

```
# URL 版本控制
/v1/products
/v1/agents
/v1/chat

# 请求头版本（可选）
Accept: application/vnd.api+json;version=v1
```

---

## 六、Git 工作流规范

### 6.1 分支命名

```
# 格式: <类型>/< ticket编号>-<简短描述>

# 功能开发
feature/PROJ-123-add-product-search
feature/PROJ-124-ai-chat-widget

# Bug 修复
bugfix/PROJ-125-fix-order-query-error
bugfix/PROJ-126-chat-message-duplicate

# 优化改进
improvement/PROJ-127-optimize-database-query
improvement/PROJ-128-improve-chat-response-time

# 文档更新
docs/PROJ-129-update-api-documentation
docs/PROJ-130-add-user-guide

# 重构
refactor/PROJ-131-extract-base-service
refactor/PROJ-132-move-to-repository-pattern

# 发布
release/v1.0.0
release/v1.1.0-hotfix
```

### 6.2 Commit 规范

```
# 格式: <类型>(<范围>): <简短描述>

# 类型
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构（不是新功能或bug修复）
perf:     性能优化
test:     测试相关
chore:    构建/工具/依赖更新

# 范围（可选）
feat(products): 新增产品搜索功能
feat(chat): AI 客服对话功能
fix(orders): 修复订单查询空值问题

# 示例
feat(products): add product search with filters
fix(chat): resolve message duplication on rapid send
docs(api): update REST API specification
refactor(agent): extract common memory service
perf(database): add index on created_at column
test(skills): add unit tests for order query skill
chore(deps): upgrade pydantic to 2.0
```

### 6.3 Commit 模板

```bash
# .git/commit-template.txt
# <类型>(<范围>): <简短描述>
#
# <空行>
# <详细描述（可选）>
#
# <空行>
# <Breaking Changes（可选）>
# BREAKING CHANGE: <破坏性变更描述>
#
# <空行>
# <关闭的 Issue（可选）>
# Closes: #123
# Fixes: #456
```

### 6.4 PR 规范

```markdown
## PR 标题
feat(PROJ-123): 产品搜索功能

## PR 类型
- [ ] feat - 新功能
- [ ] fix - Bug 修复
- [ ] docs - 文档更新
- [ ] refactor - 重构
- [ ] test - 测试
- [ ] chore - 构建/工具/依赖

## 关联 Issue
Closes #123

## 变更描述
### 新增
- 产品搜索 API 接口
- 搜索结果分页
- 支持分类、价格区间筛选

### 修改
- 产品列表接口添加搜索参数

### 删除
- 旧的搜索实现（已废弃）

## 测试计划
- [ ] 单元测试覆盖率 > 80%
- [ ] 手动测试搜索功能正常
- [ ] 测试各筛选条件组合

## 截图/录屏（UI 变更）
[在此粘贴截图]

## 注意事项
- 依赖 Qwen3.5 Plus 模型 API
- 使用亚马逊产品数据测试
```

---

## 七、数据库规范

### 7.1 表命名

```sql
-- 通用规则
-- 1. 小写下划线分隔，复数形式
-- 2. 主键统一命名为 id
-- 3. 时间字段使用 created_at, updated_at

-- 企业相关
enterprises
products
orders
customers
leads

-- AI Agent 相关
ai_agents
agent_skills
agent_workflows
agent_memories
conversations
conversation_messages

-- 数据洞察相关
data_sources
data_records
alerts
reports

-- 系统相关
users
permissions
roles
audit_logs
```

### 7.2 字段命名

```sql
-- 通用字段
id              -- UUID 主键
created_at      -- 创建时间
updated_at      -- 更新时间
deleted_at      -- 软删除时间
status          -- 状态（如：active, inactive, pending）

-- 业务字段
-- 用户相关
user_id
username
email
phone
password_hash
last_login_at

-- 企业相关
enterprise_id
enterprise_name
contact_email
contact_phone

-- 产品相关
product_id
product_name
product_code
category
price
stock
description

-- 订单相关
order_id
order_no        -- 订单编号（唯一）
order_status
total_amount
paid_at
shipped_at
delivered_at

-- AI 对话相关
conversation_id
message_id
message_type    -- user, assistant, system
content
metadata       -- JSON 格式存储额外信息
```

### 7.3 索引规范

```sql
-- 基础索引命名
idx_<table>_<column>           -- 普通索引
uk_<table>_<column>           -- 唯一索引
fk_<table>_<column>            -- 外键

-- 常用索引示例
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_visitor_id ON conversations(visitor_id);
CREATE INDEX idx_messages_conversation_id ON conversation_messages(conversation_id);

-- 复合索引
CREATE INDEX idx_products_category_price ON products(category, price);
CREATE INDEX idx_orders_user_status ON orders(user_id, order_status);

-- 唯一索引
CREATE UNIQUE INDEX uk_agents_code ON ai_agents(code);
CREATE UNIQUE INDEX uk_products_code ON products(product_code);
CREATE UNIQUE INDEX uk_orders_no ON orders(order_no);
```

### 7.4 软删除规范

```sql
-- 所有业务表必须包含 deleted_at 字段
-- 0 或 NULL 表示未删除
-- 时间戳表示已删除

-- 正确查询（排除已删除）
SELECT * FROM products WHERE deleted_at IS NULL;

-- 软删除
UPDATE products SET deleted_at = NOW() WHERE id = 'xxx';

-- 硬删除（谨慎使用，需先备份）
DELETE FROM products WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '90 days';
```

---

## 八、安全规范

### 8.1 认证与授权

```python
# 后端 - JWT 认证

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = await get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


# 权限装饰器
from functools import wraps

def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get('current_user')
            if not user_has_permission(user, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {permission}"
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

### 8.2 输入验证

```python
# 后端 - Pydantic 验证

from pydantic import BaseModel, Field, validator
from typing import Optional
import re

class ProductCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0, le=999999.99)
    stock: int = Field(default=0, ge=0)
    description: Optional[str] = Field(None, max_length=2000)
    product_code: Optional[str] = Field(None, max_length=50)

    @validator('product_code')
    def validate_product_code(cls, v):
        if v and not re.match(r'^[A-Z0-9-]+$', v):
            raise ValueError('Product code must be uppercase letters, numbers and hyphens')
        return v

    @validator('name')
    def validate_name(cls, v):
        if v and v.strip() != v:
            raise ValueError('Name must not have leading/trailing spaces')
        return v.strip()


class OrderQuerySchema(BaseModel):
    order_no: Optional[str] = Field(None, regex=r'^ORD\d{10,20}$')
    phone: Optional[str] = Field(None, regex=r'^1[3-9]\d{9}$')

    @validator('phone')
    def validate_phone(cls, v):
        if v:
            return v[-4:]  # 只存储后4位用于验证
        return v
```

```typescript
// 前端 - 表单验证

import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .min(1, '产品名称不能为空')
    .max(255, '产品名称不能超过255个字符')
    .trim(),
  category: z.string()
    .min(1, '请选择产品分类'),
  price: z.number()
    .positive('价格必须大于0')
    .max(999999.99, '价格不能超过999999.99'),
  stock: z.number()
    .int('库存必须为整数')
    .min(0, '库存不能为负数')
    .default(0),
  description: z.string()
    .max(2000, '描述不能超过2000个字符')
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// 使用示例
const handleSubmit = async (data: ProductFormData) => {
  try {
    const validated = productSchema.parse(data);
    await apiClient.post('/products', validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 处理验证错误
      setErrors(error.errors);
    }
  }
};
```

### 8.3 SQL 注入防护

```python
# ✅ 正确使用参数化查询

# SQLAlchemy ORM（推荐）
result = db.query(Product).filter(
    Product.category == category,
    Product.deleted_at.is_(None)
).all()

# 参数化查询
from sqlalchemy import text
stmt = text("SELECT * FROM products WHERE category = :category AND deleted_at IS NULL")
result = db.execute(stmt, {"category": category})

# ❌ 危险：字符串拼接
# 禁止使用！
query = f"SELECT * FROM products WHERE category = '{category}'"  # NEVER DO THIS
```

### 8.4 XSS 防护

```typescript
// 前端 - React 自动转义，但需注意 dangerouslySetInnerHTML

// ✅ 安全：普通文本
<span>{userInput}</span>

// ❌ 危险：直接插入 HTML
<span dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 安全：净化后的 HTML
import DOMPurify from 'dompurify';
<span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## 九、测试规范

### 9.1 测试文件结构

```
tests/
├── conftest.py              # pytest 配置和 fixtures
├── apps/
│   ├── ai_website/
│   │   ├── __init__.py
│   │   ├── test_product_service.py
│   │   ├── test_chat_service.py
│   │   └── test_lead_service.py
│   ├── data_insight/
│   │   ├── test_collector_service.py
│   │   └── test_analytics_service.py
│   └── ai_agent/
│       ├── test_agent_service.py
│       ├── test_skill_service.py
│       └── test_memory_service.py
├── core/
│   ├── test_config.py
│   └── test_security.py
└── fixtures/
    ├── products.json
    ├── agents.json
    └── mock_responses.py
```

### 9.2 测试命名和结构

```python
# tests/apps/ai_website/test_product_service.py

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from apps.ai_website.services.product_service import ProductService
from apps.ai_website.schemas.product import ProductCreateSchema
from core.exceptions import ProductNotFoundError


class TestProductService:
    """产品服务测试"""

    @pytest.fixture
    def mock_db(self):
        """模拟数据库会话"""
        return MagicMock()

    @pytest.fixture
    def service(self, mock_db):
        """创建服务实例"""
        return ProductService(mock_db)

    @pytest.fixture
    def sample_product(self):
        """示例产品数据"""
        return {
            "id": "prod-123",
            "name": "测试产品",
            "category": "electronics",
            "price": 299.00,
            "stock": 100,
        }

    # ========== get_by_id 测试 ==========

    @pytest.mark.asyncio
    async def test_get_by_id_success(self, service, mock_db, sample_product):
        """测试成功获取产品"""
        # Arrange
        mock_db.query.return_value.filter.return_value.first.return_value = sample_product

        # Act
        result = await service.get_by_id("prod-123")

        # Assert
        assert result is not None
        assert result["id"] == "prod-123"
        assert result["name"] == "测试产品"

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self, service, mock_db):
        """测试产品不存在"""
        # Arrange
        mock_db.query.return_value.filter.return_value.first.return_value = None

        # Act & Assert
        with pytest.raises(ProductNotFoundError) as exc_info:
            await service.get_by_id("nonexistent")
        assert "prod-nonexistent" in str(exc_info.value)

    # ========== create 测试 ==========

    @pytest.mark.asyncio
    async def test_create_product_success(self, service, mock_db):
        """测试创建产品成功"""
        # Arrange
        product_data = ProductCreateSchema(
            name="新商品",
            category="electronics",
            price=199.00
        )

        with patch.object(service, '_generate_id', return_value="prod-new"):
            # Act
            result = await service.create(product_data)

        # Assert
        assert result["name"] == "新商品"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_product_with_invalid_price(self, service):
        """测试创建产品 - 无效价格"""
        # Arrange
        with pytest.raises(ValueError):
            ProductCreateSchema(
                name="商品",
                category="electronics",
                price=-10  # 无效价格
            )
```

### 9.3 覆盖率要求

| 模块 | 最低覆盖率 |
|------|-----------|
| 核心业务逻辑（services） | 80% |
| API 路由（routers） | 70% |
| 工具函数（utils） | 90% |
| AI Agent 配置解析 | 80% |

---

## 十、文档规范

### 10.1 代码文档

```python
# 函数/方法的文档字符串（Google 风格）

async def get_product(
    product_id: str,
    include_images: bool = True,
    include_inventory: bool = False,
) -> Optional[dict]:
    """
    获取产品详情

    根据产品ID获取完整的产品信息，支持可选字段的包含/排除。

    Args:
        product_id: 产品唯一标识符
        include_images: 是否包含产品图片列表，默认 True
        include_inventory: 是否包含实时库存信息，默认 False

    Returns:
        包含产品详情的字典，如有异常返回 None

    Raises:
        ProductNotFoundError: 产品不存在
        DatabaseConnectionError: 数据库连接失败

    Example:
        >>> product = await get_product("prod-123")
        >>> print(product["name"])
        '测试产品'
    """
    pass
```

### 10.2 README 文档

```markdown
# 模块名称

## 功能描述
简明扼要地描述模块的作用和职责。

## 主要组件

| 组件 | 说明 |
|------|------|
| `routers/` | API 路由定义 |
| `services/` | 业务逻辑 |
| `schemas/` | 数据模型 |

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接地址 | - |
| `API_KEY` | 第三方 API 密钥 | - |

## 使用示例

```python
from apps.ai_website.services import ProductService

service = ProductService(db)
product = await service.get_by_id("prod-123")
```
```

---

## 附录

### A. 工具链配置

| 工具 | 用途 | 配置 |
|------|------|------|
| Black | Python 格式化 | `line-length = 100` |
| isort | Python 导入排序 | 与 Black 兼容 |
| Ruff | Python Lint | 与 Black 兼容 |
| ESLint | JS/TS Lint | Next.js 14 默认配置 |
| Prettier | 代码格式化 | 集成于 ESLint |
| Husky | Git Hooks | pre-commit |
| Commitlint | Commit 格式检查 | 规范 commit |

### B. 速查卡

```
# Python
类名: PascalCase
函数/方法: snake_case
私有成员: _prefix
常量: UPPER_SNAKE_CASE

# TypeScript
组件: PascalCase
函数/变量: camelCase
常量: UPPER_SNAKE_CASE 或 PascalCase
类型/接口: PascalCase

# Git
分支: kebab-case (feature/xxx)
Commit: <type>(<scope>): <desc>

# API
GET: 获取资源
POST: 创建资源
PUT: 更新资源
DELETE: 删除资源
```

---

> 文档版本：v1.0
> 最后更新：2026-05-01
> 关联项目：电商 AI 管理平台规划方案 v1.0
