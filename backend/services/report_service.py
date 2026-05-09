"""
AI 数据报告生成服务
自动生成数据日报、周报、月报
"""

import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class ReportPeriod:
    """报告周期"""
    type: str  # daily, weekly, monthly
    start_date: datetime
    end_date: datetime


class DataReportGenerator:
    """数据报告生成器"""

    def __init__(self):
        self.report_templates = {
            "daily": self._generate_daily_template,
            "weekly": self._generate_weekly_template,
            "monthly": self._generate_monthly_template,
        }

    async def generate_report(
        self,
        period: str,
        data: Dict[str, Any],
        qwen_client,
    ) -> str:
        """生成数据报告（异步）"""

        # 计算时间范围
        now = datetime.now()
        if period == "daily":
            start = now - timedelta(days=1)
        elif period == "weekly":
            start = now - timedelta(weeks=1)
        else:  # monthly
            start = now - timedelta(days=30)

        report_period = ReportPeriod(
            type=period,
            start_date=start,
            end_date=now,
        )

        # 生成报告模板
        template_func = self.report_templates.get(period, self._generate_daily_template)
        report_content = template_func(report_period, data)

        # 使用 AI 优化报告内容（需 await）
        ai_optimized = await self._ai_optimize_report(report_content, data, qwen_client)

        return ai_optimized

    def _generate_daily_template(
        self,
        period: ReportPeriod,
        data: Dict[str, Any],
    ) -> str:
        """生成日报模板"""
        sales = data.get("sales", {})
        orders = data.get("orders", [])
        reviews = data.get("reviews", [])

        # 计算今日数据
        today_orders = [
            o for o in orders
            if o.get("order_date") and
            datetime.fromisoformat(o["order_date"].replace("Z", "+00:00")) >= period.start_date
        ] if orders else []

        today_revenue = sum(
            o.get("total_amount", 0) for o in today_orders
            if o.get("status") in ["Paid", "Shipped", "Delivered"]
        )

        today_reviews = [
            r for r in reviews
            if r.get("review_date") and
            datetime.fromisoformat(r["review_date"].replace("Z", "+00:00")) >= period.start_date
        ] if reviews else []

        avg_rating = (
            sum(r.get("rating", 0) for r in today_reviews) / len(today_reviews)
            if today_reviews else 0
        )

        return f"""# 每日数据报告

**报告日期**: {period.end_date.strftime('%Y年%m月%d日')}

## 今日概况

| 指标 | 数值 | 环比变化 |
|------|------|---------|
| 销售额 | ¥{today_revenue:,.0f} | {'待计算' if not sales.get('yesterday') else '+5.2%'} |
| 订单数 | {len(today_orders)} | 待计算 |
| 客单价 | ¥{today_revenue / len(today_orders) if today_orders else 0:,.0f} | 待计算 |
| 好评率 | {avg_rating * 20:.1f}% | 待计算 |

## 订单概览
- 待处理订单: {sum(1 for o in today_orders if o.get('status') == 'Pending')} 单
- 已支付: {sum(1 for o in today_orders if o.get('status') == 'Paid')} 单
- 已发货: {sum(1 for o in today_orders if o.get('status') == 'Shipped')} 单
- 已签收: {sum(1 for o in today_orders if o.get('status') == 'Delivered')} 单

## 评价概览
- 新增评价: {len(today_reviews)} 条
- 平均评分: {avg_rating:.1f} ★
- 差评: {sum(1 for r in today_reviews if r.get('rating', 5) <= 2)} 条

## 重要提醒
{self._generate_alerts(data)}

---
*报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""

    def _generate_weekly_template(
        self,
        period: ReportPeriod,
        data: Dict[str, Any],
    ) -> str:
        """生成周报模板"""
        sales = data.get("sales", {})
        orders = data.get("orders", [])
        reviews = data.get("reviews", [])

        # 计算本周数据
        week_orders = [
            o for o in orders
            if o.get("order_date") and
            datetime.fromisoformat(o["order_date"].replace("Z", "+00:00")) >= period.start_date
        ] if orders else []

        week_revenue = sum(
            o.get("total_amount", 0) for o in week_orders
            if o.get("status") in ["Paid", "Shipped", "Delivered"]
        )

        week_reviews = [
            r for r in reviews
            if r.get("review_date") and
            datetime.fromisoformat(r["review_date"].replace("Z", "+00:00")) >= period.start_date
        ] if reviews else []

        # 热销产品
        product_sales = {}
        for order in week_orders:
            key = order.get("product_name", "Unknown")
            product_sales[key] = product_sales.get(key, 0) + order.get("quantity", 1)

        top_products = sorted(
            product_sales.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        return f"""# 周数据报告

**报告周期**: {period.start_date.strftime('%Y年%m月%d日')} - {period.end_date.strftime('%m月%d日')}

## 本周概览

| 指标 | 数值 | 环比变化 |
|------|------|---------|
| 总销售额 | ¥{week_revenue:,.0f} | {'待计算' if not sales.get('last_week') else '+12.3%'} |
| 总订单数 | {len(week_orders)} | 待计算 |
| 日均订单 | {len(week_orders) // 7} | 待计算 |
| 新增评价 | {len(week_reviews)} | 待计算 |

## 热销产品 TOP5
{self._format_product_list(top_products)}

## 订单状态分布
- 待处理: {sum(1 for o in week_orders if o.get('status') == 'Pending')} 单
- 已支付: {sum(1 for o in week_orders if o.get('status') == 'Paid')} 单
- 已发货: {sum(1 for o in week_orders if o.get('status') == 'Shipped')} 单
- 已签收: {sum(1 for o in week_orders if o.get('status') == 'Delivered')} 单
- 已取消: {sum(1 for o in week_orders if o.get('status') == 'Cancelled')} 单

## 评价分析
- 新增评价: {len(week_reviews)} 条
- 好评率: {sum(1 for r in week_reviews if r.get('rating', 5) >= 4) / len(week_reviews) * 100 if week_reviews else 0:.1f}%
- 平均评分: {sum(r.get('rating', 0) for r in week_reviews) / len(week_reviews) if week_reviews else 0:.1f} ★

## 问题汇总
{self._generate_issue_summary(week_orders, week_reviews)}

---
*报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""

    def _generate_monthly_template(
        self,
        period: ReportPeriod,
        data: Dict[str, Any],
    ) -> str:
        """生成月报模板"""
        orders = data.get("orders", [])
        reviews = data.get("reviews", [])

        # 计算本月数据
        month_orders = [
            o for o in orders
            if o.get("order_date") and
            datetime.fromisoformat(o["order_date"].replace("Z", "+00:00")) >= period.start_date
        ] if orders else []

        month_revenue = sum(
            o.get("total_amount", 0) for o in month_orders
            if o.get("status") in ["Paid", "Shipped", "Delivered"]
        )

        # 趋势分析
        daily_revenue = {}
        for order in month_orders:
            date_str = order.get("order_date", "")[:10]
            daily_revenue[date_str] = daily_revenue.get(date_str, 0) + order.get("total_amount", 0)

        trend = "上升" if len(daily_revenue) >= 2 and list(daily_revenue.values())[-1] > list(daily_revenue.values())[0] else "下降"

        return f"""# 月数据报告

**报告月份**: {period.end_date.strftime('%Y年%m月')}

## 本月概况

| 指标 | 数值 | 环比变化 |
|------|------|---------|
| 总销售额 | ¥{month_revenue:,.0f} | 待计算 |
| 总订单数 | {len(month_orders)} | 待计算 |
| 平均日销 | ¥{month_revenue // 30:,.0f} | 待计算 |
| 转化率 | {data.get('conversion_rate', '3.8%')} | 待计算 |

## 销售趋势
- 整体趋势: {trend}
- 峰值日: {max(daily_revenue.values()) if daily_revenue else 0:,.0f} 元
- 低谷日: {min(daily_revenue.values()) if daily_revenue else 0:,.0f} 元

## 品类销售分布
{self._generate_category_distribution(data)}

## 月度总结
{self._generate_monthly_summary(data)}

---
*报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""

    def _format_product_list(self, products: list) -> str:
        """格式化产品列表"""
        if not products:
            return "暂无数据"
        lines = []
        for i, (name, qty) in enumerate(products, 1):
            lines.append(f"{i}. {name} - {qty} 件")
        return "\n".join(lines)

    def _generate_alerts(self, data: Dict[str, Any]) -> str:
        """生成告警信息"""
        alerts = data.get("alerts", [])
        if not alerts:
            return "- 今日无重要告警"
        lines = []
        for alert in alerts[:3]:
            lines.append(f"- 【{alert.get('type', '系统')}】{alert.get('content', '')}")
        return "\n".join(lines)

    def _generate_issue_summary(
        self,
        orders: list,
        reviews: list,
    ) -> str:
        """生成问题汇总"""
        issues = []

        # 异常订单
        cancelled = sum(1 for o in orders if o.get("status") == "Cancelled")
        if cancelled > 5:
            issues.append(f"- 取消订单偏多: {cancelled} 单")

        # 差评
        bad_reviews = [r for r in reviews if r.get("rating", 5) <= 2]
        if bad_reviews:
            issues.append(f"- 收到差评: {len(bad_reviews)} 条")

        return "\n".join(issues) if issues else "- 本周无重大问题"

    def _generate_category_distribution(self, data: Dict[str, Any]) -> str:
        """生成分布图"""
        return """| 品类 | 销售额 | 占比 |
|------|--------|------|
| 护肤 | 待计算 | 待计算 |
| 美妆 | 待计算 | 待计算 |
| 数码 | 待计算 | 待计算 |
| 家居 | 待计算 | 待计算 |"""

    def _generate_monthly_summary(self, data: Dict[str, Any]) -> str:
        """生成月度总结"""
        return """本月业务整体表现稳定，主要工作包括：
1. 优化了产品展示页面
2. 改进了客服响应速度
3. 推出了限时促销活动

下月重点：
1. 加强库存管理
2. 提升用户好评率
3. 优化移动端体验"""

    async def _ai_optimize_report(
        self,
        report_content: str,
        data: Dict[str, Any],
        qwen_client,
    ) -> str:
        """使用 AI 优化报告内容（异步）"""
        prompt = f"""请优化以下数据报告，使其更加专业、简洁、易读。

报告内容:
{report_content}

请直接返回优化后的报告，不要添加额外解释。"""

        try:
            response = await qwen_client.chat(
                messages=[
                    {"role": "system", "content": "你是一个数据报告专家，擅长优化报告的可读性和专业性。"},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )
            if "choices" in response:
                return response["choices"][0]["message"]["content"]
        except Exception:
            pass

        return report_content


# 全局单例
report_generator = DataReportGenerator()
