"""
亚马逊模拟数据生成脚本
基于 SP-API 数据格式生成模拟数据
"""

import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any


# 产品品类配置
PRODUCT_CATEGORIES = {
    "Skincare": {
        "products": [
            {"name": "Premium Skincare Set", "price_range": (199, 499), "asin_prefix": "SK"},
            {"name": "Vitamin C Serum", "price_range": (89, 199), "asin_prefix": "SK"},
            {"name": "Moisturizing Cream", "price_range": (129, 299), "asin_prefix": "SK"},
            {"name": "Anti-Aging Cream", "price_range": (199, 599), "asin_prefix": "SK"},
            {"name": "Hydrating Face Mask", "price_range": (49, 129), "asin_prefix": "SK"},
            {"name": "Cleansing Foam", "price_range": (59, 149), "asin_prefix": "SK"},
            {"name": "Sunscreen SPF50+", "price_range": (99, 249), "asin_prefix": "SK"},
            {"name": "Essence Toner", "price_range": (79, 179), "asin_prefix": "SK"},
        ],
        "images": ["skincare_1.jpg", "skincare_2.jpg"],
    },
    "Makeup": {
        "products": [
            {"name": "Luxury Makeup Palette", "price_range": (299, 699), "asin_prefix": "MK"},
            {"name": "Lipstick Collection", "price_range": (89, 249), "asin_prefix": "MK"},
            {"name": "Foundation SPF20", "price_range": (129, 349), "asin_prefix": "MK"},
            {"name": "Eyeshadow Palette", "price_range": (149, 399), "asin_prefix": "MK"},
            {"name": "Mascara Waterproof", "price_range": (59, 129), "asin_prefix": "MK"},
            {"name": "Blush On", "price_range": (79, 199), "asin_prefix": "MK"},
            {"name": "Concealer", "price_range": (69, 169), "asin_prefix": "MK"},
            {"name": "Setting Spray", "price_range": (49, 99), "asin_prefix": "MK"},
        ],
        "images": ["makeup_1.jpg", "makeup_2.jpg"],
    },
    "Electronics": {
        "products": [
            {"name": "Wireless Earbuds Pro", "price_range": (399, 999), "asin_prefix": "EL"},
            {"name": "Bluetooth Speaker", "price_range": (199, 599), "asin_prefix": "EL"},
            {"name": "Smart Watch", "price_range": (699, 1999), "asin_prefix": "EL"},
            {"name": "USB-C Hub", "price_range": (99, 299), "asin_prefix": "EL"},
            {"name": "Wireless Charger", "price_range": (49, 149), "asin_prefix": "EL"},
            {"name": "Power Bank 20000mAh", "price_range": (99, 249), "asin_prefix": "EL"},
            {"name": "Mechanical Keyboard", "price_range": (299, 799), "asin_prefix": "EL"},
            {"name": "Gaming Mouse", "price_range": (149, 499), "asin_prefix": "EL"},
        ],
        "images": ["electronics_1.jpg", "electronics_2.jpg"],
    },
    "Home": {
        "products": [
            {"name": "Aroma Diffuser", "price_range": (99, 299), "asin_prefix": "HM"},
            {"name": "LED Desk Lamp", "price_range": (79, 199), "asin_prefix": "HM"},
            {"name": "Storage Box Set", "price_range": (59, 149), "asin_prefix": "HM"},
            {"name": "Cotton Towel Set", "price_range": (89, 229), "asin_prefix": "HM"},
            {"name": "Scented Candle Set", "price_range": (49, 129), "asin_prefix": "HM"},
            {"name": "Picture Frame", "price_range": (29, 99), "asin_prefix": "HM"},
        ],
        "images": ["home_1.jpg", "home_2.jpg"],
    },
}

# 评价模板
REVIEW_TEMPLATES = [
    {"rating": 5, "title": "Excellent product!", "body": "Very satisfied with the quality. Highly recommended!"},
    {"rating": 5, "title": "Great value for money", "body": "Better than expected. Will buy again."},
    {"rating": 4, "title": "Good product", "body": "Overall satisfied. Good quality for the price."},
    {"rating": 4, "title": "Nice purchase", "body": "Works well. Delivery was fast too."},
    {"rating": 3, "title": "Average", "body": "It's okay, but there are better options out there."},
    {"rating": 3, "title": "Decent product", "body": "Basic functionality. Expected a bit more for the price."},
    {"rating": 2, "title": "Not impressed", "body": "Quality could be better. Disappointed."},
    {"rating": 1, "title": "Poor quality", "body": "Not as described. Would not recommend."},
    {"rating": 5, "title": "Perfect gift", "body": "Bought this as a gift and they loved it!"},
    {"rating": 4, "title": "Pretty good", "body": "Does what it says. Good purchase."},
    {"rating": 5, "title": "Exceeded expectations", "body": "Amazing quality! Will definitely order again."},
    {"rating": 4, "title": "Fast delivery", "body": "Arrived quickly. Product looks nice."},
]

# 物流公司
CARRIERS = ["SF Express", "ZTO Express", "YTO Express", "JD Logistics", "Deppon"]


def generate_asin(category: str, index: int) -> str:
    """生成 ASIN"""
    prefix = PRODUCT_CATEGORIES[category]["products"][index]["asin_prefix"]
    return f"B09N5ZN{chr(65 + index)}{random.randint(100, 999)}"


def generate_product(category: str, product_info: dict, index: int) -> Dict[str, Any]:
    """生成单个产品数据"""
    price = random.randint(*product_info["price_range"])
    rating = round(random.uniform(3.5, 5.0), 1)
    review_count = random.randint(50, 1000)

    return {
        "asin": generate_asin(category, index),
        "title": product_info["name"],
        "price": price,
        "category": category,
        "stock": random.randint(10, 500),
        "rating": rating,
        "review_count": review_count,
        "description": f"High-quality {product_info['name']} from our premium collection.",
        "images": product_info.get("images", ["default.jpg"]),
        "status": "active",
    }


def generate_order(product: Dict[str, Any], days_ago: int = 0) -> Dict[str, Any]:
    """生成订单数据"""
    order_date = datetime.now() - timedelta(days=days_ago)
    status_options = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"]
    status_weights = [0.05, 0.15, 0.25, 0.50, 0.05]
    status = random.choices(status_options, weights=status_weights)[0]

    quantity = random.randint(1, 3)
    shipping_fee = random.choice([0, 10, 15, 20])
    total_amount = product["price"] * quantity + shipping_fee

    order = {
        "order_id": f"ORD-{order_date.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
        "asin": product["asin"],
        "product_name": product["title"],
        "quantity": quantity,
        "unit_price": product["price"],
        "shipping_fee": shipping_fee,
        "total_amount": total_amount,
        "status": status,
        "order_date": order_date.isoformat(),
        "customer_id": f"CUST-{random.randint(1000, 9999)}",
        "carrier": random.choice(CARRIERS) if status in ["Shipped", "Delivered"] else None,
        "tracking_number": f"{random.choice(['SF', 'YT', 'JD', 'ZT'])}{random.randint(100000000000, 999999999999)}" if status in ["Shipped", "Delivered"] else None,
        "shipped_date": (order_date + timedelta(days=random.randint(1, 3))).isoformat() if status in ["Shipped", "Delivered"] else None,
        "delivered_date": (order_date + timedelta(days=random.randint(3, 7))).isoformat() if status == "Delivered" else None,
    }
    return order


def generate_review(product: Dict[str, Any]) -> Dict[str, Any]:
    """生成评价数据"""
    template = random.choice(REVIEW_TEMPLATES)
    verified = random.random() > 0.2  # 80% 概率为已购买用户

    return {
        "review_id": f"REV-{uuid.uuid4().hex[:8].upper()}",
        "asin": product["asin"],
        "rating": template["rating"],
        "title": template["title"],
        "body": template["body"],
        "verified_purchase": verified,
        "review_date": (datetime.now() - timedelta(days=random.randint(0, 90))).isoformat(),
        "helpful_count": random.randint(0, 50),
    }


def generate_inventory(product: Dict[str, Any]) -> Dict[str, Any]:
    """生成库存数据"""
    total = product["stock"]
    return {
        "asin": product["asin"],
        "product_name": product["title"],
        "fulfillment_channel": random.choice(["FBM", "FBA"]),
        "total_quantity": total,
        "inbound_quantity": random.randint(0, 100),
        "outbound_quantity": random.randint(0, 50),
        "reserved_quantity": random.randint(0, 20),
        "available_quantity": total - random.randint(0, 30),
    }


def generate_mock_dataset(
    products_per_category: int = 3,
    orders_per_product: int = 20,
    reviews_per_product: int = 5,
) -> Dict[str, List[Dict[str, Any]]]:
    """生成完整模拟数据集"""

    dataset = {
        "products": [],
        "orders": [],
        "reviews": [],
        "inventory": [],
    }

    # 生成产品
    for category, config in PRODUCT_CATEGORIES.items():
        for i, product_info in enumerate(config["products"][:products_per_category]):
            product = generate_product(category, product_info, i)
            dataset["products"].append(product)

    # 生成订单和评价
    for product in dataset["products"]:
        # 订单
        for days_ago in range(random.randint(1, orders_per_product)):
            order = generate_order(product, days_ago)
            dataset["orders"].append(order)

        # 评价
        for _ in range(random.randint(1, reviews_per_product)):
            review = generate_review(product)
            dataset["reviews"].append(review)

        # 库存
        inventory = generate_inventory(product)
        dataset["inventory"].append(inventory)

    # 按日期排序
    dataset["orders"].sort(key=lambda x: x["order_date"], reverse=True)
    dataset["reviews"].sort(key=lambda x: x["review_date"], reverse=True)

    return dataset


def print_summary(dataset: Dict[str, List[Dict[str, Any]]]):
    """打印数据概要"""
    print("\n" + "=" * 50)
    print("亚马逊模拟数据生成完成")
    print("=" * 50)
    print(f"产品数量: {len(dataset['products'])}")
    print(f"订单数量: {len(dataset['orders'])}")
    print(f"评价数量: {len(dataset['reviews'])}")
    print(f"库存记录: {len(dataset['inventory'])}")
    print("=" * 50)

    # 按状态统计订单
    status_counts = {}
    for order in dataset["orders"]:
        status = order["status"]
        status_counts[status] = status_counts.get(status, 0) + 1

    print("\n订单状态分布:")
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")

    # 按评分统计评价
    rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in dataset["reviews"]:
        rating = review["rating"]
        rating_counts[rating] = rating_counts.get(rating, 0) + 1

    print("\n评价评分分布:")
    for rating, count in sorted(rating_counts.items()):
        pct = count / len(dataset["reviews"]) * 100
        print(f"  {rating}星: {count} ({pct:.1f}%)")

    print("=" * 50)


if __name__ == "__main__":
    # 生成模拟数据
    dataset = generate_mock_dataset(
        products_per_category=4,
        orders_per_product=25,
        reviews_per_product=8,
    )

    # 打印概要
    print_summary(dataset)

    # 保存为 JSON 文件
    import json
    import os

    output_dir = os.path.join(os.path.dirname(__file__), "..", "scripts")
    os.makedirs(output_dir, exist_ok=True)

    for name, data in dataset.items():
        filepath = os.path.join(output_dir, f"mock_{name}.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"已保存: {filepath}")

    print("\n模拟数据生成完成！")
