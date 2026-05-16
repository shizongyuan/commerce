"""
报告生成路由
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional
from core.database import get_db
from core.auth import get_current_user_id
from services.report_service import report_generator
from services.agent_service import agent_service
from core.ai_client import qwen_client

router = APIRouter()


class ReportRequest(BaseModel):
    period: str = Field(..., pattern="^(daily|weekly|monthly)$")
    include_ai_insights: bool = True


class ReportResponse(BaseModel):
    period: str
    content: str
    generated_at: str


@router.post("/generate", response_model=ReportResponse, dependencies=[Depends(get_current_user_id)])
async def generate_report(
    request: ReportRequest,
    db: AsyncSession = Depends(get_db),
):
    """生成数据报告"""

    # 获取数据（简化版，使用模拟数据）
    data = {
        "sales": {},
        "orders": _get_mock_orders(),
        "reviews": _get_mock_reviews(),
        "inventory": [],
        "alerts": [
            {"type": "inventory", "content": "部分商品库存偏低"},
        ],
    }

    # 生成报告（await 异步方法）
    content = await report_generator.generate_report(
        period=request.period,
        data=data,
        qwen_client=qwen_client,
    )

    return ReportResponse(
        period=request.period,
        content=content,
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )


@router.get("/latest", dependencies=[Depends(get_current_user_id)])
async def get_latest_report(db: AsyncSession = Depends(get_db)):
    """获取最新生成的几份报告"""
    return {
        "reports": [
            {
                "period": "daily",
                "generated_at": "2026-05-01 10:00:00",
                "summary": "今日销售额 ¥12,580，订单 49 单",
            },
            {
                "period": "weekly",
                "generated_at": "2026-04-28 10:00:00",
                "summary": "本周销售额 ¥87,230，订单 328 单",
            },
        ]
    }


def _get_mock_orders():
    """获取模拟订单数据"""
    from datetime import datetime, timedelta
    import random

    orders = []
    statuses = ["Delivered", "Shipped", "Paid", "Pending", "Cancelled"]
    products = [
        {"name": "Premium Skincare Set", "price": 299},
        {"name": "Luxury Makeup Palette", "price": 399},
        {"name": "Wireless Earbuds Pro", "price": 599},
    ]

    for i in range(50):
        product = random.choice(products)
        status = random.choice(statuses)
        order_date = datetime.now() - timedelta(days=random.randint(0, 30))

        orders.append({
            "order_id": f"ORD-202604{20+i:02d}-{'ABC123'[:6]}",
            "product_name": product["name"],
            "unit_price": product["price"],
            "quantity": random.randint(1, 3),
            "total_amount": product["price"] * random.randint(1, 3),
            "status": status,
            "order_date": order_date.isoformat(),
        })

    return orders


def _get_mock_reviews():
    """获取模拟评价数据"""
    from datetime import datetime, timedelta
    import random

    reviews = []
    asins = ["B09N5ZNWWX", "B09N5ZNWWY", "B09N5ZNWWZ"]

    for i in range(30):
        rating = random.choice([5, 5, 4, 4, 4, 3, 3, 2, 1])
        review_date = datetime.now() - timedelta(days=random.randint(0, 30))

        reviews.append({
            "review_id": f"REV-{random.randint(100000, 999999)}",
            "asin": random.choice(asins),
            "rating": rating,
            "title": "Great product!" if rating >= 4 else "Needs improvement",
            "review_date": review_date.isoformat(),
        })

    return reviews
