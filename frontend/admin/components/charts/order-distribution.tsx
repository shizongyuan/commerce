"use client";

import { CHART_COLORS } from "@/components/ui";

interface OrderDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface OrderDistributionChartProps {
  data: OrderDistribution[];
}

export function OrderDistributionChart({ data }: OrderDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-apple-gray-2">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {data.slice(0, 4).reduce<{ elements: React.ReactNode[]; sum: number }>((acc, item, idx) => {
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
                  stroke={CHART_COLORS.orderStatus[idx]}
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
              {data.find((o) => o.status === "已完成")?.percentage || 0}%
            </span>
            <span className="text-xs text-apple-gray-2">完成率</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.slice(0, 4).map((item, idx) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CHART_COLORS.orderStatus[idx] }}
            />
            <span className="text-xs text-apple-gray-2">{item.status}</span>
            <span className="text-xs font-medium text-apple-gray-1 ml-auto">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}