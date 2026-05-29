"use client";

interface SalesTrendItem {
  date: string;
  revenue: number;
  orders: number;
}

interface ExtendedTrend {
  items: SalesTrendItem[];
  total_revenue: number;
  total_orders: number;
  avg_daily_revenue: number;
}

interface SalesTrendChartProps {
  data: ExtendedTrend | null;
  days?: number;
}

export function SalesTrendChart({ data, days = 30 }: SalesTrendChartProps) {
  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-apple-gray-3 border-t-hermes-orange rounded-full animate-spin" />
      </div>
    );
  }

  const displayItems = data.items.slice(-14);
  const maxRev = Math.max(...displayItems.map((i) => i.revenue), 1);

  return (
    <div className="space-y-4">
      <div className="flex gap-8">
        <div>
          <p className="text-xs text-apple-gray-2 mb-1">{days}天总收入</p>
          <p className="text-xl font-bold text-hermes-orange">
            ¥{(data.total_revenue || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-apple-gray-2 mb-1">{days}天订单</p>
          <p className="text-xl font-semibold text-apple-gray-1">
            {data.total_orders || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-apple-gray-2 mb-1">日均销售额</p>
          <p className="text-xl font-semibold text-apple-gray-1">
            ¥{(data.avg_daily_revenue || 0).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="h-32 flex items-end gap-2">
        {displayItems.map((item, idx) => {
          const height = (item.revenue / maxRev) * 100;
          return (
            <div
              key={idx}
              className="flex-1 min-w-0 border border-hermes-orange/60 rounded-t chart-bar"
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
  );
}