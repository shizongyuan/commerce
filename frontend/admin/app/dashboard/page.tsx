"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Bot,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Truck,
  MapPin,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [orderDist, setOrderDist] = useState<OrderDistribution[]>([]);
  const [regionRanking, setRegionRanking] = useState<RegionRanking[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);
  const [extendedTrend, setExtendedTrend] = useState<ExtendedTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

  useEffect(() => {
    // 获取仪表盘基础数据
    fetch(`${API_BASE_URL}/api/analytics/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setStats({
          todayRevenue: data.sales.today_revenue,
          aiConversations: 156,
          pendingOrders: 23,
          activeAlerts: 3,
          revenueChange: 12,
          conversationsChange: 8,
          ordersChange: -5,
          alertsChange: -2,
        });
        setSalesTrend(data.sales_trend || []);
        setAlerts(data.alerts || []);
      })
      .catch(() => {
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
      });

    // 获取新增数据
    Promise.all([
      fetch(`${API_BASE_URL}/api/analytics/orders/distribution`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/analytics/orders/region`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/analytics/orders/payment`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/analytics/sales/funnel`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/analytics/sales/hourly`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/analytics/sales/trend/extended?days=30`).then((r) => r.json()),
    ])
      .then(([dist, region, payment, funnel, hourly, extended]) => {
        setOrderDist(dist);
        setRegionRanking(region);
        setPaymentMethods(payment);
        setFunnelData(funnel);
        setHourlySales(hourly);
        setExtendedTrend(extended);
      })
      .catch(() => {
        // 使用默认模拟数据
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
      })
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "今日销售额",
          value: `¥${stats.todayRevenue.toLocaleString()}`,
          change: stats.revenueChange,
          icon: LayoutDashboard,
        },
        {
          label: "AI 接待数",
          value: stats.aiConversations,
          change: stats.conversationsChange,
          icon: Bot,
        },
        {
          label: "待处理工单",
          value: stats.pendingOrders,
          change: stats.ordersChange,
          icon: Package,
        },
        {
          label: "异常告警",
          value: stats.activeAlerts,
          change: stats.alertsChange,
          icon: AlertTriangle,
          isNegativeGood: true,
        },
      ]
    : [];

  const quickLinks = [
    { href: "/products", label: "产品管理", desc: "查看并管理产品列表" },
    { href: "/agents", label: "AI 员工", desc: "配置 AI 员工参数" },
    { href: "/analytics", label: "数据看板", desc: "查看销售洞察" },
    { href: "/data-sources", label: "数据源", desc: "管理数据连接" },
  ];

  // 计算漏斗最大值
  const maxFunnelValue = funnelData.length > 0 ? funnelData[0].count : 1;

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const isNeutral = stat.change === 0;
          const displayChange = `${stat.isNegativeGood ? (isPositive ? "-" : "+") : isPositive ? "+" : ""}${Math.abs(stat.change)}%`;

          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300 cursor-pointer group ring-1 ring-orange-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-hermes-orange-pale rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-hermes-orange" />
                </div>
                <span
                  className={`text-sm font-medium flex items-center gap-1 ${
                    isNeutral
                      ? "text-apple-gray-2"
                      : stat.isNegativeGood
                      ? isPositive
                        ? "text-red-500"
                        : "text-green-500"
                      : isPositive
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {displayChange}
                </span>
              </div>
              <div className="text-3xl font-bold text-hermes-orange mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-apple-gray-2 font-normal">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Sales Trend + Hourly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 30天销售趋势 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-apple-gray-1">销售趋势</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-hermes-orange text-white rounded-full">
                30天
              </button>
              <button className="px-3 py-1.5 text-xs font-medium bg-apple-gray-4 text-apple-gray-2 rounded-full hover:bg-apple-gray-3 transition-colors">
                7天
              </button>
            </div>
          </div>
          {extendedTrend && extendedTrend.items ? (
            <div className="space-y-4">
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-apple-gray-2 mb-1">30天总收入</p>
                  <p className="text-xl font-bold text-hermes-orange">
                    ¥{(extendedTrend.total_revenue || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-apple-gray-2 mb-1">30天订单</p>
                  <p className="text-xl font-semibold text-apple-gray-1">
                    {extendedTrend.total_orders || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-apple-gray-2 mb-1">日均销售额</p>
                  <p className="text-xl font-semibold text-apple-gray-1">
                    ¥{(extendedTrend.avg_daily_revenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {/* 简化趋势图 */}
              <div className="h-32 flex items-end gap-2">
                {(extendedTrend.items || []).slice(-14).map((item, idx) => {
                  const items = extendedTrend.items || [];
                  const maxRev = Math.max(...items.slice(-14).map((i) => i.revenue));
                  const height = (item.revenue / maxRev) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-0 border border-hermes-orange/60 rounded-t transition-all hover:border-hermes-orange"
                      style={{ height: `${height}%` }}
                      title={`${item.date}: ¥${item.revenue.toFixed(0)}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-apple-gray-2">
                <span>近14天</span>
                <span>单位：元</span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-apple-gray-3 border-t-hermes-orange rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* 今日分时销售 */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-apple-gray-1">今日分时</h2>
            <Clock className="w-5 h-5 text-apple-gray-2" />
          </div>
          {hourlySales.length > 0 ? (
            <div className="space-y-3">
              <div className="h-28 flex items-end gap-1">
                {hourlySales.map((item, idx) => {
                  const maxRev = Math.max(...hourlySales.map((i) => i.revenue));
                  const height = (item.revenue / maxRev) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-0 border border-hermes-orange/60 rounded-t transition-all hover:border-hermes-orange"
                      style={{ height: `${height}%` }}
                      title={`${item.hour}:00: ¥${item.revenue.toFixed(0)}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-apple-gray-2">
                <span>9:00</span>
                <span>22:00</span>
              </div>
              <div className="mt-4 pt-4 border-t border-apple-gray-3">
                <div className="flex justify-between text-sm">
                  <span className="text-apple-gray-2">当前订单</span>
                  <span className="font-medium text-apple-gray-1">
                    {hourlySales.reduce((sum, h) => sum + h.orders, 0)} 单
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center">
              <p className="text-sm text-apple-gray-2">暂无数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Order Distribution + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 订单状态分布 */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-apple-gray-1">订单状态</h2>
            <ShoppingCart className="w-5 h-5 text-apple-gray-2" />
          </div>
          {orderDist.length > 0 ? (
            <div className="space-y-4">
              {/* 简化环形进度 */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {orderDist.slice(0, 4).reduce<{ elements: React.ReactNode[]; sum: number }>((acc, item, idx) => {
                      const radius = 40;
                      const circumference = 2 * Math.PI * radius;
                      const offset = acc.sum;
                      const dashLength = (item.percentage / 100) * circumference;
                      acc.elements.push(
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="none"
                          stroke={["#E65C00", "#FF8533", "#D4AF37", "#86868B"][idx]}
                          strokeWidth="8"
                          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-500"
                        />
                      );
                      acc.sum += dashLength;
                      return acc;
                    }, { elements: [], sum: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-apple-gray-1">
                      {orderDist.find((o) => o.status === "已完成")?.percentage || 0}%
                    </span>
                    <span className="text-xs text-apple-gray-2">完成率</span>
                  </div>
                </div>
              </div>
              {/* 图例 */}
              <div className="grid grid-cols-2 gap-2">
                {orderDist.slice(0, 4).map((item, idx) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ["#E65C00", "#FF8533", "#D4AF37", "#86868B"][idx] }}
                    />
                    <span className="text-xs text-apple-gray-2">{item.status}</span>
                    <span className="text-xs font-medium text-apple-gray-1 ml-auto">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-apple-gray-2">暂无数据</p>
            </div>
          )}
        </div>

        {/* 转化漏斗 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-apple-gray-1">转化漏斗</h2>
            <span className="text-xs text-apple-gray-2">近30天数据</span>
          </div>
          {funnelData.length > 0 ? (
            <div className="space-y-4">
              {funnelData.map((item, idx) => {
                const width = (item.count / maxFunnelValue) * 100;
                return (
                  <div key={item.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-apple-gray-2">{item.stage}</span>
                      <span className="text-sm font-medium text-apple-gray-1">
                        {item.count.toLocaleString()} <span className="text-xs text-apple-gray-2">({item.rate}%)</span>
                      </span>
                    </div>
                    <div className="h-8 bg-apple-gray-4 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-hermes-orange/20 border border-hermes-orange/70 rounded-lg transition-all duration-700 flex items-center justify-end pr-3"
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-xs text-white font-medium">{item.rate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-apple-gray-2">暂无数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 3: Region + Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 地域分布 */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-apple-gray-1">地域分布 TOP5</h2>
            <MapPin className="w-5 h-5 text-apple-gray-2" />
          </div>
          {regionRanking.length > 0 ? (
            <div className="space-y-4">
              {regionRanking.map((item) => {
                const maxOrders = regionRanking[0].orders;
                const width = (item.orders / maxOrders) * 100;
                return (
                  <div key={item.region} className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-hermes-orange/10 text-hermes-orange text-xs font-medium rounded-full flex items-center justify-center">
                      {item.rank}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-apple-gray-1">{item.region}</span>
                        <span className="text-sm text-apple-gray-2">{item.orders} 单 · ¥{item.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-apple-gray-4 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-hermes-orange/20 border border-hermes-orange/70 rounded-full transition-all duration-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-apple-gray-2">暂无数据</p>
            </div>
          )}
        </div>

        {/* 支付方式 */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-apple-gray-1">支付方式</h2>
            <CreditCard className="w-5 h-5 text-apple-gray-2" />
          </div>
          {paymentMethods.length > 0 ? (
            <div className="space-y-6">
              {paymentMethods.map((item, idx) => {
                const colors = ["#07C160", "#1677FF", "#86909C"];
                return (
                  <div key={item.method} className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${colors[idx]}15` }}
                    >
                      <span className="text-lg font-bold" style={{ color: colors[idx] }}>
                        {item.method[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-apple-gray-1">{item.method}</span>
                        <span className="text-sm font-medium text-apple-gray-1">{item.count} 笔</span>
                      </div>
                      <div className="h-3 bg-apple-gray-4 rounded-full overflow-hidden">
                        <div
                          className="h-full border border-hermes-orange/70 rounded-full transition-all duration-700"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-apple-gray-1 w-16 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-apple-gray-2">暂无数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
          <h2 className="text-xl font-semibold text-apple-gray-1 mb-4">快捷入口</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-4 border border-apple-gray-3 rounded-xl hover:border-hermes-orange hover:bg-hermes-orange-pale transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-apple-gray-1 group-hover:text-hermes-orange">
                    {link.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-apple-gray-2 group-hover:text-hermes-orange" />
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
            <Link
              href="/analytics"
              className="text-sm text-hermes-orange hover:text-hermes-orange-light"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-apple-gray-2 text-center py-8">
                暂无告警
              </p>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.level === "warning"
                      ? "border-orange-200 bg-orange-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 ${
                        alert.level === "warning"
                          ? "text-orange-500"
                          : "text-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-apple-gray-1">
                        {alert.title}
                      </p>
                      <p className="text-xs text-apple-gray-2 mt-1 truncate">
                        {alert.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
