"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, ShoppingCart, MessageCircle, AlertTriangle, Clock, MapPin, CreditCard } from "lucide-react";
import { API_CONFIG } from "@/lib/config";

interface SalesData {
  today_revenue: number;
  month_revenue: number;
  avg_order_value: number;
  conversion_rate: number;
  total_orders: number;
}

interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductRanking {
  rank: number;
  product_name: string;
  revenue: number;
  quantity: number;
}

interface Alert {
  id: string;
  type: string;
  level: string;
  title: string;
  content: string;
  created_at: string;
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

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string>("sales");
  const [sales, setSales] = useState<SalesData | null>(null);
  const [trend, setTrend] = useState<SalesTrend[]>([]);
  const [ranking, setRanking] = useState<ProductRanking[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [orderDist, setOrderDist] = useState<OrderDistribution[]>([]);
  const [regionRanking, setRegionRanking] = useState<RegionRanking[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);
  const [extendedTrend, setExtendedTrend] = useState<ExtendedTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: "sales", label: "销售洞察", icon: TrendingUp },
    { id: "orders", label: "订单分析", icon: ShoppingCart },
    { id: "ai", label: "舆情看板", icon: MessageCircle },
  ];

  const maxFunnelValue = (funnelData || []).length > 0 ? (funnelData[0]?.count || 1) : 1;

  useEffect(() => {
    Promise.all([
      // 获取销售数据
      fetch(`${API_CONFIG.API_URL}/analytics/dashboard`).then((r) => r.json()),
      // 获取其他数据
      fetch(`${API_CONFIG.API_URL}/analytics/orders/distribution`).then((r) => r.json()),
      fetch(`${API_CONFIG.API_URL}/analytics/orders/region`).then((r) => r.json()),
      fetch(`${API_CONFIG.API_URL}/analytics/orders/payment`).then((r) => r.json()),
      fetch(`${API_CONFIG.API_URL}/analytics/sales/funnel`).then((r) => r.json()),
      fetch(`${API_CONFIG.API_URL}/analytics/sales/hourly`).then((r) => r.json()),
      fetch(`${API_CONFIG.API_URL}/analytics/sales/trend/extended?days=30`).then((r) => r.json()),
    ])
      .then(([dashboard, dist, region, payment, funnel, hourly, extended]) => {
        setSales(dashboard.sales);
        setTrend(dashboard.sales_trend || []);
        setRanking(dashboard.product_ranking || []);
        setAlerts(dashboard.alerts || []);
        setOrderDist(dist || []);
        setRegionRanking(region || []);
        setPaymentMethods(payment || []);
        setFunnelData(funnel || []);
        setHourlySales(hourly || []);
        setExtendedTrend(extended);
      })
      .catch((err) => console.warn("Failed to fetch analytics:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold text-apple-gray-1 tracking-tight">数据洞察</h1>
        <p className="text-apple-gray-2 mt-1">监控业务数据，获取 AI 驱动的洞察</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-apple-gray-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-hermes-orange text-hermes-orange"
                  : "border-transparent text-apple-gray-2 hover:text-apple-gray-1"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-apple-gray-3 border-t-hermes-orange rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {activeTab === "sales" && sales && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <p className="text-xs text-apple-gray-2 font-normal mb-1">今日销售额</p>
                  <p className="text-3xl font-bold text-hermes-orange">
                    ¥{sales.today_revenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <p className="text-xs text-apple-gray-2 font-normal mb-1">本月销售额</p>
                  <p className="text-3xl font-bold text-apple-gray-1">
                    ¥{(sales.month_revenue / 10000).toFixed(2)}万
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <p className="text-xs text-apple-gray-2 font-normal mb-1">客单价</p>
                  <p className="text-2xl font-semibold text-apple-gray-1">
                    ¥{sales.avg_order_value.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <p className="text-xs text-apple-gray-2 font-normal mb-1">转化率</p>
                  <p className="text-2xl font-semibold text-apple-gray-1">
                    {sales.conversion_rate.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <p className="text-xs text-apple-gray-2 font-normal mb-1">本月订单</p>
                  <p className="text-2xl font-semibold text-apple-gray-1">
                    {sales.total_orders}
                  </p>
                </div>
              </div>

              {/* 30天趋势 */}
              {extendedTrend && (
                <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-apple-gray-1">30天销售趋势</h3>
                    <div className="flex gap-6 text-sm">
                      <span className="text-apple-gray-2">总收入: <span className="font-medium text-hermes-orange">¥{(extendedTrend.total_revenue || 0).toFixed(2)}</span></span>
                      <span className="text-apple-gray-2">总订单: <span className="font-medium text-apple-gray-1">{extendedTrend.total_orders || 0}</span></span>
                      <span className="text-apple-gray-2">日均: <span className="font-medium text-apple-gray-1">¥{(extendedTrend.avg_daily_revenue || 0).toFixed(2)}</span></span>
                    </div>
                  </div>
                  <div className="h-48 flex items-end gap-1">
                    {(extendedTrend.items || []).map((item, idx) => {
                      const maxRev = (extendedTrend.items || []).reduce((max, i) => Math.max(max, i.revenue), 0);
                      const height = maxRev > 0 ? (item.revenue / maxRev) * 100 : 0;
                      return (
                        <div
                          key={idx}
                          className="flex-1 mx-px border border-hermes-orange/60 rounded-t transition-all hover:border-hermes-orange"
                          style={{ height: `${height}%` }}
                          title={`${item.date}: ¥${item.revenue.toFixed(2)}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-apple-gray-2 mt-2">
                    <span>{(extendedTrend.items || [])[0]?.date?.slice(5) || '--'}</span>
                    <span>{(extendedTrend.items || [])[(extendedTrend.items || []).length - 1]?.date?.slice(5) || '--'}</span>
                  </div>
                </div>
              )}

              {/* 今日分时 + 热卖 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 今日分时 */}
                <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-apple-gray-1">今日分时销售</h3>
                    <Clock className="w-5 h-5 text-apple-gray-2" />
                  </div>
                  {hourlySales && hourlySales.length > 0 ? (
                    <div className="space-y-4">
                      <div className="h-32 flex items-end gap-0.5">
                        {(() => {
                          const maxRev = hourlySales.reduce((max, i) => Math.max(max, i.revenue), 0);
                          return hourlySales.map((item, idx) => {
                            const height = maxRev > 0 ? (item.revenue / maxRev) * 100 : 0;
                          return (
                            <div
                              key={idx}
                              className="flex-1 mx-px border border-hermes-orange/60 rounded-t transition-all hover:border-hermes-orange"
                              style={{ height: `${height}%` }}
                              title={`${item.hour}:00: ¥${item.revenue.toFixed(2)}`}
                            />
                          );
                        });
                        })()}
                      </div>
                      <div className="flex justify-between text-xs text-apple-gray-2">
                        <span>9:00</span>
                        <span>22:00</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* 热卖产品 */}
                <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <h3 className="text-xl font-semibold text-apple-gray-1 mb-4">热卖产品 TOP5</h3>
                  <div className="space-y-3">
                    {(ranking || []).map((item: any) => (
                      <div
                        key={item.rank}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-apple-gray-4 transition-colors"
                      >
                        <span className="w-6 h-6 bg-hermes-orange text-white text-xs font-medium rounded-full flex items-center justify-center">
                          {item.rank}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-apple-gray-1">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-apple-gray-2">
                            销量 {item.quantity} 件
                          </p>
                        </div>
                        <p className="text-sm font-medium text-hermes-orange">
                          ¥{item.revenue.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* 转化漏斗 */}
              <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                <h3 className="text-xl font-semibold text-apple-gray-1 mb-6">转化漏斗</h3>
                <div className="space-y-6">
                  {(funnelData || []).map((item: any, idx: number) => {
                    const width = (item.count / maxFunnelValue) * 100;
                    return (
                      <div key={item.stage} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-apple-gray-2">{item.stage}</span>
                          <span className="text-sm font-medium text-apple-gray-1">
                            {item.count.toLocaleString()} <span className="text-xs text-apple-gray-2">({item.rate.toFixed(2)}%)</span>
                          </span>
                        </div>
                        <div className="h-10 bg-apple-gray-4 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-hermes-orange/20 border border-hermes-orange/70 rounded-lg transition-all duration-700 flex items-center justify-end pr-3"
                            style={{ width: `${width}%` }}
                          >
                            <span className="text-xs text-white font-medium">{item.rate.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 订单状态 + 支付方式 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 订单状态 */}
                <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-apple-gray-1">订单状态分布</h3>
                    <ShoppingCart className="w-5 h-5 text-apple-gray-2" />
                  </div>
                  <div className="flex justify-center mb-6">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {(orderDist || []).slice(0, 4).reduce<{ elements: React.ReactNode[]; sum: number }>((acc, item, idx) => {
                          const radius = 38;
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
                              strokeWidth="10"
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
                        <span className="text-xl font-bold text-apple-gray-1">
                          {(orderDist || []).find((o: any) => o.status === "已完成")?.percentage.toFixed(2) || 0}%
                        </span>
                        <span className="text-xs text-apple-gray-2">完成率</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* eslint-disable @typescript-eslint/no-explicit-any */}
                        {(orderDist || []).slice(0, 4).map((item: any, idx: number) => (
                          <div key={item.status} className="flex items-center gap-2 p-2 bg-apple-gray-4 rounded-lg">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#E65C00", "#FF8533", "#D4AF37", "#86868B"][idx] }} />
                            <span className="text-xs text-apple-gray-2">{item.status}</span>
                            <span className="text-xs font-medium text-apple-gray-1 ml-auto">{item.percentage.toFixed(2)}%</span>
                          </div>
                        ))}
                  </div>
                </div>

                {/* 支付方式 */}
                <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-apple-gray-1">支付方式分布</h3>
                    <CreditCard className="w-5 h-5 text-apple-gray-2" />
                  </div>
                  <div className="space-y-5">
                    {(paymentMethods || []).map((item: any, idx: number) => {
                      const colors = ["#07C160", "#1677FF", "#86909C"];
                      return (
                        <div key={item.method} className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors[idx]}15` }}>
                            <span className="text-lg font-bold" style={{ color: colors[idx] }}>{item.method[0]}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-apple-gray-1">{item.method}</span>
                              <span className="text-sm font-medium text-apple-gray-1">{item.count} 笔</span>
                            </div>
                            <div className="h-3 bg-apple-gray-4 rounded-full overflow-hidden">
                              <div className="h-full border border-hermes-orange/70 rounded-full transition-all duration-700" style={{ width: `${item.percentage}%` }} />
                            </div>
                          </div>
                          <span className="text-lg font-bold text-apple-gray-1 w-16 text-right">{item.percentage.toFixed(2)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 地域分布 */}
              <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-apple-gray-1">地域分布 TOP5</h3>
                  <MapPin className="w-5 h-5 text-apple-gray-2" />
                </div>
                <div className="space-y-4">
                  {(regionRanking || []).map((item: any) => {
                    const maxOrders = (regionRanking || [])[0]?.orders || 1;
                    const width = (item.orders / maxOrders) * 100;
                    return (
                      <div key={item.region} className="flex items-center gap-4">
                        <span className="w-6 h-6 bg-hermes-orange/10 text-hermes-orange text-xs font-medium rounded-full flex items-center justify-center">
                          {item.rank}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-apple-gray-1">{item.region}</span>
                            <span className="text-sm text-apple-gray-2">{item.orders} 单 · ¥{item.revenue.toFixed(2)}</span>
                          </div>
                          <div className="h-2.5 bg-apple-gray-4 rounded-full overflow-hidden">
                            <div className="h-full bg-hermes-orange/20 border border-hermes-orange/70 rounded-full transition-all duration-500" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
              <h3 className="text-xl font-semibold text-apple-gray-1 mb-4">舆情总览</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-2xl font-semibold text-green-600">92.5%</p>
                  <p className="text-sm text-apple-gray-2">好评率</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-semibold text-apple-gray-1">5.2%</p>
                  <p className="text-sm text-apple-gray-2">中评率</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-2xl font-semibold text-red-500">2.3%</p>
                  <p className="text-sm text-apple-gray-2">差评率</p>
                </div>
              </div>

              {/* Alerts */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-apple-gray-2">最新差评/投诉</h4>
                {(!alerts || alerts.length === 0) ? (
                  <p className="text-sm text-apple-gray-2 text-center py-4">暂无投诉</p>
                ) : (
                  (alerts || []).map((alert: any) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl"
                    >
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-apple-gray-1">{alert.title}</p>
                        <p className="text-xs text-apple-gray-2 mt-1">{alert.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
