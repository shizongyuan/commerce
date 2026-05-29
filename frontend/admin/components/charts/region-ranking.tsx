"use client";

import { MapPin } from "lucide-react";

interface RegionRanking {
  rank: number;
  region: string;
  orders: number;
  revenue: number;
}

interface RegionRankingChartProps {
  data: RegionRanking[];
}

export function RegionRankingChart({ data }: RegionRankingChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-apple-gray-2">暂无数据</p>
      </div>
    );
  }

  const maxOrders = data[0]?.orders || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-apple-gray-1">地域分布 TOP5</h2>
        <MapPin className="w-5 h-5 text-apple-gray-2" />
      </div>
      {data.map((item) => {
        const width = (item.orders / maxOrders) * 100;
        return (
          <div key={item.region} className="flex items-center gap-4">
            <span className="w-6 h-6 bg-hermes-orange/10 text-hermes-orange text-xs font-medium rounded-full flex items-center justify-center">
              {item.rank}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-apple-gray-1">{item.region}</span>
                <span className="text-sm text-apple-gray-2">
                  {item.orders} 单 · ¥{item.revenue.toLocaleString()}
                </span>
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
  );
}