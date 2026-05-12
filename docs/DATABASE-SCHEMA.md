"""
数据库 Schema 设计
Production Ready 阶段 - 2026-05-10
"""

# ============================================================
# 表结构设计
# ============================================================

# users                  # 用户表
# - id (UUID, PK)
# - email (唯一索引)
# - password_hash
# - name
# - role (admin/operator/viewer)
# - status (active/inactive)
# - created_at
# - updated_at

# products               # 产品表
# - id (UUID, PK)
# - name
# - asin (唯一)
# - category
# - price
# - stock
# - rating
# - review_count
# - description
# - images (JSON)
# - status
# - created_at
# - updated_at

# orders                 # 订单表
# - id (UUID, PK)
# - order_no (唯一索引)
# - user_id (FK -> users)
# - status (pending/paid/shipped/delivered/cancelled)
# - total_amount
# - paid_at
# - shipped_at
# - delivered_at
# - created_at
# - updated_at

# order_items            # 订单商品表
# - id (UUID, PK)
# - order_id (FK -> orders)
# - product_id (FK -> products)
# - quantity
# - price

# conversations         # AI 对话会话表
# - id (UUID, PK)
# - user_id (FK -> users, nullable for anonymous)
# - agent_id
# - status (active/ended)
# - created_at
# - ended_at

# conversation_messages # AI 对话消息表
# - id (UUID, PK)
# - conversation_id (FK -> conversations)
# - role (user/assistant/system)
# - content
# - metadata (JSON)
# - created_at

# ai_agents             # AI 员工表
# - id (UUID, PK)
# - code (唯一)
# - name
# - role
# - avatar
# - knowledge_files (JSON)
# - skills (JSON)
# - status
# - greeting
# - created_at
# - updated_at

# knowledge_base        # 知识库表
# - id (UUID, PK)
# - path (唯一)
# - title
# - content
# - category (enterprise/products/operations)
# - word_count
# - created_at
# - updated_at

# ============================================================
# 索引设计
# ============================================================

# products: category索引, status索引, created_at索引
# orders: user_id索引, status索引, created_at索引
# conversations: user_id索引, agent_id索引, status索引
# conversation_messages: conversation_id索引, created_at索引

# ============================================================
# 外键关系
# ============================================================

# orders.user_id -> users.id
# order_items.order_id -> orders.id
# order_items.product_id -> products.id
# conversations.user_id -> users.id (nullable)
# conversation_messages.conversation_id -> conversations.id