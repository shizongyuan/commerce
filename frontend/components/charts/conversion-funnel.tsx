"use client";

interface ConversionFunnel {
  stage: string;
  count: number;
  rate: number;
}

interface ConversionFunnelChartProps {
  data: ConversionFunnel[];
  title?: string;
  subtitle?: string;
}

export function ConversionFunnelChart({
  data,
  title = "转化漏斗",
  subtitle,
}: ConversionFunnelChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-apple-gray-2">暂无数据</p>
      </div>
    );
  }

  const maxValue = data[0]?.count || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-apple-gray-1">{title}</h2>
        {subtitle && <span className="text-xs text-apple-gray-2">{subtitle}</span>}
      </div>
      {data.map((item) => {
        const width = (item.count / maxValue) * 100;
        return (
          <div key={item.stage} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-apple-gray-2">{item.stage}</span>
              <span className="text-sm font-medium text-apple-gray-1">
                {item.count.toLocaleString()}{" "}
                <span className="text-xs text-apple-gray-2">({item.rate}%)</span>
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
  );
}