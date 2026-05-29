"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Bot,
  AlertTriangle,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { analyticsApi } from "@/lib/api-client";
import { ErrorBoundary } from "@/components/ui";
import {
  SalesTrendChart,
  HourlySalesChart,
  OrderDistributionChart,
  ConversionFunnelChart,
  RegionRankingChart,
  PaymentMethodsChart,
  CategoryTop10Chart,
} from "@/components/charts";

interface Stats {
  todayRevenue: number;
  aiConversations: number;
  pendingOrders: number;
  activeAlerts: number;
  revenueChange: number;
  conversationsChange: number;
  ordersChange: number;
  alertsChange: number;
}

interface Alert {
  id: string;
  type: string;
  level: string;
  title: string;
  content: string;
  created_at: string;
}

interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

interface OrderDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface RegionRanking {
  rank: number;
  region: string;
  orders: number;
  revenue: number;
}

interface PaymentMethod {
  method: string;
  count: number;
  percentage: number;
}

interface ConversionFunnel {
  stage: string;
  count: number;
  rate: number;
}

interface HourlySales {
  hour: number;
  revenue: number;
  orders: number;
}

interface ExtendedTrend {
  items: SalesTrend[];
  total_revenue: number;
  total_orders: number;
  avg_daily_revenue: number;
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [orderDist, setOrderDist] = useState<OrderDistribution[]>([]);
  const [regionRanking, setRegionRanking] = useState<RegionRanking[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);
  const [extendedTrend, setExtendedTrend] = useState<ExtendedTrend | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Dashboard data
      const dashboard = await analyticsApi.dashboard();
      setStats({
        todayRevenue: dashboard.sales.today_revenue,
        aiConversations: 156,
        pendingOrders: 23,
        activeAlerts: dashboard.alerts?.length || 0,
        revenueChange: 12,
        conversationsChange: 8,
        ordersChange: -5,
        alertsChange: -2,
      });
      setAlerts(dashboard.alerts || []);
    } catch (err) {
      // Use mock data on error
      setStats({
        todayRevenue: 12580,
        aiConversations: 156,
        pendingOrders: 23,
        activeAlerts: 3,
        revenueChange: 12,
        conversationsChange: 8,
        ordersChange: -5,
        alertsChange: -2,
      });
    }

    // Additional data in parallel
    try {
      const [dist, region, payment, funnel, hourly, extended] = await Promise.all([
        analyticsApi.orderDistribution(),
        analyticsApi.orderRegion(),
        analyticsApi.paymentMethods(),
        analyticsApi.conversionFunnel(),
        analyticsApi.hourlySales(),
        analyticsApi.salesTrend(30),
      ]);
      setOrderDist(dist);
      setRegionRanking(region);
      setPaymentMethods(payment);
      setFunnelData(funnel);
      setHourlySales(hourly);
      setExtendedTrend(extended);
    } catch (err) {
      // Use mock data for charts
      setOrderDist([
        { status: "待支付", count: 23, percentage: 12.5 },
        { status: "已支付", count: 45, percentage: 24.5 },
        { status: "待发货", count: 67, percentage: 36.4 },
        { status: "已发货", count: 35, percentage: 19.0 },
        { status: "已完成", count: 580, percentage: 82.1 },
        { status: "已取消", count: 10, percentage: 5.4 },
      ]);
      setRegionRanking([
        { rank: 1, region: "广东", orders: 156, revenue: 45680 },
        { rank: 2, region: "浙江", orders: 123, revenue: 38920 },
        { rank: 3, region: "江苏", orders: 98, revenue: 31250 },
        { rank: 4, region: "上海", orders: 87, revenue: 28560 },
        { rank: 5, region: "北京", orders: 76, revenue: 25380 },
      ]);
      setPaymentMethods([
        { method: "微信支付", count: 412, percentage: 55.2 },
        { method: "支付宝", count: 298, percentage: 39.9 },
        { method: "银行卡", count: 36, percentage: 4.8 },
      ]);
      setFunnelData([
        { stage: "浏览商品", count: 12850, rate: 100 },
        { stage: "加入购物车", count: 3850, rate: 29.9 },
        { stage: "提交订单", count: 1920, rate: 14.9 },
        { stage: "完成支付", count: 1560, rate: 12.1 },
      ]);
      setHourlySales(
        Array.from({ length: 14 }, (_, i) => ({
          hour: i + 9,
          revenue: 800 + Math.random() * 2000,
          orders: Math.floor(20 + Math.random() * 30),
        }))
      );
      setExtendedTrend({
        items: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2026, 4, i + 1).toISOString().slice(0, 10),
          revenue: 8500 + Math.random() * 5000,
          orders: Math.floor(30 + Math.random() * 40),
        })),
        total_revenue: 285600,
        total_orders: 1250,
        avg_daily_revenue: 9520,
      });
    }

  };

  const statCards = stats
    ? [
        { label: "今日销售额", value: `¥${stats.todayRevenue.toLocaleString()}`, change: stats.revenueChange, icon: LayoutDashboard },
        { label: "AI 接待数", value: stats.aiConversations, change: stats.conversationsChange, icon: Bot },
        { label: "待处理工单", value: stats.pendingOrders, change: stats.ordersChange, icon: Package },
        { label: "异常告警", value: stats.activeAlerts, change: stats.alertsChange, icon: AlertTriangle, isNegativeGood: true },
      ]
    : [];

  const quickLinks = [
    { href: "/products", label: "产品管理", desc: "查看并管理产品列表" },
    { href: "/wiki", label: "知识库", desc: "企业文档知识库" },
    { href: "/agents", label: "AI 员工", desc: "配置 AI 员工参数" },
    { href: "/analytics", label: "数据看板", desc: "查看销售洞察" },
    { href: "/data-sources", label: "数据源", desc: "管理数据连接" },
  ];

  return (
    <div className="space-y-6 animate-fade-slide-in">
      {/* Page Title */}
      <div>
        <h1 className="text-4xl font-semibold text-apple-gray-1 tracking-tight">欢迎回来</h1>
        <p className="text-base text-apple-gray-2 mt-1">
          {new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const isNeutral = stat.change === 0;
          const displayChange = `${stat.isNegativeGood ? (isPositive ? "-" : "+") : isPositive ? "+" : ""}${Math.abs(stat.change)}%`;

          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift cursor-pointer group ring-1 ring-orange-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-hermes-orange-pale rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-hermes-orange" />
                </div>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  isNeutral ? "text-apple-gray-2" : stat.isNegativeGood ? (isPositive ? "text-red-500" : "text-green-500") : isPositive ? "text-green-500" : "text-red-500"
                }`}>
                  {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {displayChange}
                </span>
              </div>
              <div className="text-3xl font-bold text-hermes-orange mb-1">{stat.value}</div>
              <div className="text-xs text-apple-gray-2 font-normal">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 30天销售趋势 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-apple-gray-1">销售趋势</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-hermes-orange text-white rounded-full btn-press transition-all duration-150">30天</button>
              <button className="px-3 py-1.5 text-xs font-medium bg-apple-gray-4 text-apple-gray-2 rounded-full hover:bg-apple-gray-3 transition-colors btn-press">7天</button>
            </div>
          </div>
          <SalesTrendChart data={extendedTrend} days={30} />
        </div>

        {/* 今日分时销售 */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-apple-gray-1">今日分时</h2>
          </div>
          <HourlySalesChart data={hourlySales} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 订单状态分布 */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-apple-gray-1">订单状态</h2>
          </div>
          <OrderDistributionChart data={orderDist} />
        </div>

        {/* 转化漏斗 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift">
          <ConversionFunnelChart
            data={funnelData}
            title="转化漏斗"
            subtitle="近30天数据"
          />
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 地域分布 */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift">
          <RegionRankingChart data={regionRanking} />
        </div>

        {/* 支付方式 */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift">
          <PaymentMethodsChart data={paymentMethods} />
        </div>
      </div>

      {/* Quick Links & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift">
          <h2 className="text-xl font-semibold text-apple-gray-1 mb-4">快捷入口</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="p-4 border border-apple-gray-3 rounded-xl hover:border-hermes-orange hover:bg-hermes-orange-pale transition-all duration-200 group btn-press">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-apple-gray-1 group-hover:text-hermes-orange">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-apple-gray-2 group-hover:text-hermes-orange transition-transform duration-200 group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-apple-gray-2">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-apple-gray-1">告警中心</h2>
            <Link href="/analytics" className="text-sm text-hermes-orange hover:text-hermes-orange-light">查看全部</Link>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-apple-gray-2 text-center py-8">暂无告警</p>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`p-4 rounded-xl border ${alert.level === "warning" ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.level === "warning" ? "text-orange-500" : "text-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-apple-gray-1">{alert.title}</p>
                      <p className="text-xs text-apple-gray-2 mt-1 truncate">{alert.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 亚马逊品类 TOP 10 - 页面底部 */}
      <CategoryTop10Chart />
    </div>
  );
}