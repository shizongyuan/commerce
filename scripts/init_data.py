"""
数据初始化脚本
用于导入模拟数据到 PostgreSQL
"""
import asyncio
import json
import os
from pathlib import Path

import asyncpg


async def init_database():
    """初始化数据库表结构和数据"""
    # 连接数据库
    conn = await asyncpg.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="postgres",
        database="ecommerce_ai",
    )

    try:
        # 创建表
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2),
                category VARCHAR(100),
                stock INTEGER DEFAULT 0,
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_no VARCHAR(50) UNIQUE NOT NULL,
                customer_name VARCHAR(100),
                phone VARCHAR(20),
                address TEXT,
                total_amount DECIMAL(10, 2),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id),
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER DEFAULT 1,
                price DECIMAL(10, 2)
            );

            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id),
                customer_name VARCHAR(100),
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("数据库表创建成功")

        # 导入产品数据
        products_file = Path(__file__).parent / "mock_products.json"
        if products_file.exists():
            with open(products_file, "r", encoding="utf-8") as f:
                products = json.load(f)
            for product in products:
                await conn.execute(
                    """
                    INSERT INTO products (name, description, price, category, stock, image_url)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT DO NOTHING
                    """,
                    product["name"],
                    product.get("description"),
                    product.get("price"),
                    product.get("category"),
                    product.get("stock", 0),
                    product.get("image_url"),
                )
            print(f"导入了 {len(products)} 个产品")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(init_database())