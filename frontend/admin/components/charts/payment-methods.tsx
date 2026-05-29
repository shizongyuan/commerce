"use client";

import { CreditCard } from "lucide-react";
import { CHART_COLORS } from "@/components/ui";

interface PaymentMethod {
  method: string;
  count: number;
  percentage: number;
}

interface PaymentMethodsChartProps {
  data: PaymentMethod[];
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-apple-gray-2">暂无数据</p>
      </div>
    );
  }

  const colors = CHART_COLORS.paymentMethods;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-apple-gray-1">支付方式</h2>
        <CreditCard className="w-5 h-5 text-apple-gray-2" />
      </div>
      {data.map((item, idx) => (
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
      ))}
    </div>
  );
}