"use client";

import { Clock } from "lucide-react";

interface HourlySales {
  hour: number;
  revenue: number;
  orders: number;
}

interface HourlySalesChartProps {
  data: HourlySales[];
}

export function HourlySalesChart({ data }: HourlySalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center">
        <p className="text-sm text-apple-gray-2">暂无数据</p>
      </div>
    );
  }

  const maxRev = Math.max(...data.map((i) => i.revenue), 1);
  const totalOrders = data.reduce((sum, h) => sum + h.orders, 0);

  return (
    <div className="space-y-3">
      <div className="h-28 flex items-end gap-1">
        {data.map((item, idx) => {
          const height = (item.revenue / maxRev) * 100;
          return (
            <div
              key={idx}
              className="flex-1 min-w-0 border border-hermes-orange/60 rounded-t chart-bar"
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
          <span className="font-medium text-apple-gray-1">{totalOrders} 单</span>
        </div>
      </div>
    </div>
  );
}