from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from core.database import get_db
from core.auth import get_current_user_id
from data.mock_analytics import MOCK_TOP10_DATA
import random
from datetime import datetime, timedelta

router = APIRouter()


class SalesSummary(BaseModel):
    today_revenue: float
    month_revenue: float
    avg_order_value: float
    conversion_rate: float
    total_orders: int


class SalesTrend(BaseModel):
    date: str
    revenue: float
    orders: int


class ProductRanking(BaseModel):
    rank: int
    product_name: str
    revenue: float
    quantity: int


class AlertItem(BaseModel):
    id: str
    type: str
    level: str
    title: str
    content: str
    created_at: str


class AnalyticsDashboard(BaseModel):
    sales: SalesSummary
    sales_trend: List[SalesTrend]
    product_ranking: List[ProductRanking]
    alerts: List[AlertItem]


def generate_mock_data():
    """Generate mock analytics data"""
    today = datetime.now()

    # Sales summary
    sales = SalesSummary(
        today_revenue=12580 + random.uniform(-500, 500),
        month_revenue=328500 + random.uniform(-10000, 10000),
        avg_order_value=256 + random.uniform(-20, 20),
        conversion_rate=3.8 + random.uniform(-0.5, 0.5),
        total_orders=49,
    )

    # Sales trend (7 days)
    sales_trend = []
    for i in range(7):
        date = today - timedelta(days=6-i)
        sales_trend.append(
            SalesTrend(
                date=date.strftime("%Y-%m-%d"),
                revenue=8000 + random.uniform(3000, 5000),
                orders=30 + random.randint(10, 20),
            )
        )

    # Product ranking
    product_ranking = [
        ProductRanking(rank=1, product_name="Premium Skincare Set", revenue=8970, quantity=30),
        ProductRanking(rank=2, product_name="Luxury Makeup Palette", revenue=5985, quantity=15),
        ProductRanking(rank=3, product_name="Wireless Earbuds Pro", revenue=4792, quantity=8),
        ProductRanking(rank=4, product_name="Vitamin C Serum", revenue=3196, quantity=22),
        ProductRanking(rank=5, product_name="Moisturizing Cream", revenue=2590, quantity=18),
    ]

    # Alerts
    alerts = [
        AlertItem(
            id="alert-001",
            type="price",
            level="warning",
            title="竞品降价提醒",
            content="竞争对手A同款产品降价15%，建议关注",
            created_at=(today - timedelta(hours=2)).isoformat(),
        ),
        AlertItem(
            id="alert-002",
            type="review",
            level="info",
            title="差评预警",
            content="收到1条差评：产品破损，已自动创建工单",
            created_at=(today - timedelta(hours=5)).isoformat(),
        ),
        AlertItem(
            id="alert-003",
            type="inventory",
            level="warning",
            title="库存不足",
            content="Wireless Earbuds Pro 库存仅剩15件，低于阈值",
            created_at=(today - timedelta(hours=8)).isoformat(),
        ),
    ]

    return AnalyticsDashboard(
        sales=sales,
        sales_trend=sales_trend,
        product_ranking=product_ranking,
        alerts=alerts,
    )


@router.get("/dashboard", response_model=AnalyticsDashboard)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    return generate_mock_data()


@router.get("/sales/summary", response_model=SalesSummary)
async def get_sales_summary(db: AsyncSession = Depends(get_db)):
    data = generate_mock_data()
    return data.sales


@router.get("/sales/trend", response_model=List[SalesTrend])
async def get_sales_trend(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
):
    data = generate_mock_data()
    return data.sales_trend


@router.get("/products/ranking", response_model=List[ProductRanking])
async def get_product_ranking(db: AsyncSession = Depends(get_db)):
    data = generate_mock_data()
    return data.product_ranking


@router.get("/alerts", response_model=List[AlertItem])
async def get_alerts(db: AsyncSession = Depends(get_db)):
    data = generate_mock_data()
    return data.alerts


# ============ 新增端点 ============

class OrderStatusDistribution(BaseModel):
    status: str
    count: int
    percentage: float


class RegionRanking(BaseModel):
    rank: int
    region: str
    orders: int
    revenue: float


class PaymentMethodDistribution(BaseModel):
    method: str
    count: int
    percentage: float


class ConversionFunnel(BaseModel):
    stage: str
    count: int
    rate: float


class SalesHourly(BaseModel):
    hour: int
    revenue: float
    orders: int


@router.get("/orders/distribution", response_model=List[OrderStatusDistribution])
async def get_order_distribution(db: AsyncSession = Depends(get_db)):
    """订单状态分布"""
    return [
        OrderStatusDistribution(status="待支付", count=23, percentage=12.5),
        OrderStatusDistribution(status="已支付", count=45, percentage=24.5),
        OrderStatusDistribution(status="待发货", count=67, percentage=36.4),
        OrderStatusDistribution(status="已发货", count=35, percentage=19.0),
        OrderStatusDistribution(status="已完成", count=580, percentage=82.1),
        OrderStatusDistribution(status="已取消", count=10, percentage=5.4),
    ]


@router.get("/orders/region", response_model=List[RegionRanking])
async def get_order_region(db: AsyncSession = Depends(get_db)):
    """订单地域分布 TOP5"""
    return [
        RegionRanking(rank=1, region="广东", orders=156, revenue=45680),
        RegionRanking(rank=2, region="浙江", orders=123, revenue=38920),
        RegionRanking(rank=3, region="江苏", orders=98, revenue=31250),
        RegionRanking(rank=4, region="上海", orders=87, revenue=28560),
        RegionRanking(rank=5, region="北京", orders=76, revenue=25380),
    ]


@router.get("/orders/payment", response_model=List[PaymentMethodDistribution])
async def get_payment_distribution(db: AsyncSession = Depends(get_db)):
    """支付方式分布"""
    return [
        PaymentMethodDistribution(method="微信支付", count=412, percentage=55.2),
        PaymentMethodDistribution(method="支付宝", count=298, percentage=39.9),
        PaymentMethodDistribution(method="银行卡", count=36, percentage=4.8),
    ]


@router.get("/sales/funnel", response_model=List[ConversionFunnel])
async def get_conversion_funnel(db: AsyncSession = Depends(get_db)):
    """转化率漏斗"""
    return [
        ConversionFunnel(stage="浏览商品", count=12850, rate=100.0),
        ConversionFunnel(stage="加入购物车", count=3850, rate=29.9),
        ConversionFunnel(stage="提交订单", count=1920, rate=14.9),
        ConversionFunnel(stage="完成支付", count=1560, rate=12.1),
    ]


@router.get("/sales/hourly", response_model=List[SalesHourly])
async def get_sales_hourly(
    date: str = None,
    db: AsyncSession = Depends(get_db),
):
    """今日每小时销售额"""
    import random
    data = []
    for hour in range(9, 23):
        base_revenue = 800 + hour * 120
        data.append(SalesHourly(
            hour=hour,
            revenue=base_revenue + random.uniform(-200, 300),
            orders=random.randint(15, 45)
        ))
    return data


# ============ 亚马逊品类 TOP 10 ============

class AmazonTop10Item(BaseModel):
    rank: int
    asin: str
    name: str
    price: float
    rating: float
    reviews: int
    category: str
    bsr_rank: int
    image_url: str


@router.get("/category-top10", response_model=List[AmazonTop10Item])
async def get_category_top10(
    category: str = "skincare",
    db: AsyncSession = Depends(get_db),
):
    """获取亚马逊指定品类 TOP 10 产品"""
    import random

    # 获取品类数据
    items = MOCK_TOP10_DATA.get(category, MOCK_TOP10_DATA["skincare"])

    result = []
    for i, item in enumerate(items, 1):
        bsr_rank = random.randint(1, 5000) if i <= 5 else random.randint(5000, 50000)

        # 使用本地图片路径 (PNG格式)
        image_url = f"/static/top10/{category}-{i:02d}.png"

        result.append(AmazonTop10Item(
            rank=i,
            asin=item["asin"],
            name=item["name"],
            price=item["price"],
            rating=item["rating"],
            reviews=item["reviews"],
            category=category,
            bsr_rank=bsr_rank,
            image_url=image_url,
        ))

    return result


@router.get("/sales/trend/extended", response_model=Dict[str, Any])
async def get_extended_sales_trend(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
):
    """近N天销售趋势（扩展）"""
    from datetime import datetime, timedelta
    import random

    data = []
    today = datetime.now()
    for i in range(days):
        date = today - timedelta(days=days - 1 - i)
        revenue = 8500 + random.uniform(-1500, 3500)
        orders = int(35 + random.uniform(-10, 20))
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "revenue": round(revenue, 2),
            "orders": orders,
            "avg_order_value": round(revenue / orders, 2) if orders > 0 else 0,
        })
    return {
        "items": data,
        "total_revenue": sum(d["revenue"] for d in data),
        "total_orders": sum(d["orders"] for d in data),
        "avg_daily_revenue": round(sum(d["revenue"] for d in data) / days, 2),
    }
