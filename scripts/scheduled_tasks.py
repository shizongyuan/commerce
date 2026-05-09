"""
定时数据采集任务
用于定期生成和更新模拟数据
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any


class MockDataGenerator:
    """模拟数据生成器"""

    def __init__(self):
        self.products = []
        self.orders = []
        self.reviews = []
        self.inventory = []

    def generate_all(self):
        """生成完整数据集"""
        from scripts.mock_amazon_data import generate_mock_dataset, PRODUCT_CATEGORIES

        dataset = generate_mock_dataset(
            products_per_category=4,
            orders_per_product=25,
            reviews_per_product=8,
        )
        self.products = dataset["products"]
        self.orders = dataset["orders"]
        self.reviews = dataset["reviews"]
        self.inventory = dataset["inventory"]
        return dataset

    def generate_daily_update(self) -> Dict[str, List[Dict[str, Any]]]:
        """生成每日增量更新"""
        updates = {
            "new_orders": [],
            "new_reviews": [],
            "inventory_changes": [],
        }

        # 生成 5-15 个新订单
        num_new_orders = random.randint(5, 15)
        for _ in range(num_new_orders):
            if self.products:
                product = random.choice(self.products)
                order = self._generate_order(product)
                updates["new_orders"].append(order)
                self.orders.insert(0, order)

        # 生成 3-8 个新评价
        num_new_reviews = random.randint(3, 8)
        for _ in range(num_new_reviews):
            if self.products:
                product = random.choice(self.products)
                review = self._generate_review(product)
                updates["new_reviews"].append(review)
                self.reviews.insert(0, review)

        # 库存变化
        for inventory in random.sample(self.inventory, min(5, len(self.inventory))):
            change = random.randint(-10, 5)
            if change != 0:
                inventory["available_quantity"] = max(0, inventory["available_quantity"] + change)
                updates["inventory_changes"].append({
                    "asin": inventory["asin"],
                    "change": change,
                    "new_quantity": inventory["available_quantity"],
                })

        return updates

    def _generate_order(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """生成单个订单"""
        import uuid

        order_date = datetime.now()
        total_amount = product["price"] * random.randint(1, 3)

        return {
            "order_id": f"ORD-{order_date.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
            "asin": product["asin"],
            "product_name": product["title"],
            "quantity": random.randint(1, 3),
            "unit_price": product["price"],
            "shipping_fee": random.choice([0, 10, 15]),
            "total_amount": total_amount,
            "status": "Paid",
            "order_date": order_date.isoformat(),
            "customer_id": f"CUST-{random.randint(1000, 9999)}",
        }

    def _generate_review(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """生成单个评价"""
        import uuid

        ratings = [5, 5, 4, 4, 4, 3, 3, 2, 1]
        rating = random.choice(ratings)

        return {
            "review_id": f"REV-{uuid.uuid4().hex[:8].upper()}",
            "asin": product["asin"],
            "rating": rating,
            "title": random.choice([
                "Great product!",
                "Good value",
                "As described",
                "Not bad",
                "Excellent!",
            ]),
            "body": "Generated review content.",
            "verified_purchase": True,
            "review_date": datetime.now().isoformat(),
            "helpful_count": random.randint(0, 10),
        }


class ScheduledTasks:
    """定时任务调度器"""

    def __init__(self):
        self.generator = MockDataGenerator()
        self._last_run = {}

    def run_daily_collection(self) -> Dict[str, Any]:
        """执行每日数据采集任务"""
        print(f"[{datetime.now().isoformat()}] 开始执行每日数据采集...")

        # 初始化数据（如果为空）
        if not self.generator.products:
            print("初始化数据集...")
            self.generator.generate_all()

        # 生成每日更新
        updates = self.generator.generate_daily_update()

        print(f"  新增订单: {len(updates['new_orders'])}")
        print(f"  新增评价: {len(updates['new_reviews'])}")
        print(f"  库存变化: {len(updates['inventory_changes'])}")

        self._last_run["daily_collection"] = datetime.now()

        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "updates": updates,
        }

    def get_data_summary(self) -> Dict[str, Any]:
        """获取数据摘要"""
        total_revenue = sum(
            o["total_amount"] for o in self.generator.orders
            if o["status"] in ["Paid", "Shipped", "Delivered"]
        )

        avg_rating = (
            sum(r["rating"] for r in self.generator.reviews) /
            len(self.generator.reviews)
            if self.generator.reviews else 0
        )

        return {
            "products_count": len(self.generator.products),
            "orders_count": len(self.generator.orders),
            "reviews_count": len(self.generator.reviews),
            "total_revenue": total_revenue,
            "average_rating": round(avg_rating, 2),
            "active_orders": sum(
                1 for o in self.generator.orders
                if o["status"] in ["Paid", "Shipped"]
            ),
            "last_collection": self._last_run.get("daily_collection", None),
        }


if __name__ == "__main__":
    # 测试定时任务
    tasks = ScheduledTasks()
    tasks.generator.generate_all()

    result = tasks.run_daily_collection()
    print("\n数据摘要:")
    print(json.dumps(tasks.get_data_summary(), indent=2, default=str))
