"use client";

import { useState } from "react";
import { Database, RefreshCw, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "syncing";
  lastSync: string;
  recordCount: number;
}

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([
    {
      id: "ds-001",
      name: "亚马逊模拟数据",
      type: "amazon_mock",
      status: "connected",
      lastSync: "2026-05-01 10:30:00",
      recordCount: 12580,
    },
    {
      id: "ds-002",
      name: "产品数据库",
      type: "product_db",
      status: "connected",
      lastSync: "2026-05-01 10:00:00",
      recordCount: 156,
    },
    {
      id: "ds-003",
      name: "小红书数据",
      type: "xiaohongshu",
      status: "disconnected",
      lastSync: "-",
      recordCount: 0,
    },
  ]);

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "syncing" } : s))
    );

    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "connected", lastSync: new Date().toISOString().replace("T", " ").slice(0, 19) }
          : s
      )
    );
    setSyncingId(null);
  };

  const getStatusIcon = (status: DataSource["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "syncing":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold text-apple-gray-1 tracking-tight">数据源管理</h1>
        <p className="text-apple-gray-2 mt-1">配置和管理外部数据源连接</p>
      </div>

      {/* Data Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300 hover:shadow-apple-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-hermes-orange-pale rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-hermes-orange" />
              </div>
              {getStatusIcon(source.status)}
            </div>

            <h3 className="text-base font-medium text-apple-gray-1 mb-1">
              {source.name}
            </h3>
            <p className="text-xs text-apple-gray-2 mb-4">
              类型：{source.type}
            </p>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-apple-gray-2">记录数</span>
                <span className="text-apple-gray-1 font-medium">
                  {source.recordCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-apple-gray-2">最后同步</span>
                <span className="text-apple-gray-1">{source.lastSync}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSync(source.id)}
                disabled={source.status === "syncing"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm bg-apple-gray-4 text-apple-gray-1 rounded-xl hover:bg-apple-gray-3 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${source.status === "syncing" ? "animate-spin" : ""}`} />
                同步
              </button>
              <button className="p-2 border border-apple-gray-3 rounded-xl hover:border-hermes-orange transition-colors">
                <ExternalLink className="w-4 h-4 text-apple-gray-2" />
              </button>
            </div>
          </div>
        ))}

        {/* Add New Source */}
        <div className="border-2 border-dashed border-apple-gray-3 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-hermes-orange transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-apple-gray-4 rounded-xl flex items-center justify-center mb-4">
            <span className="text-xl text-apple-gray-2">+</span>
          </div>
          <p className="text-sm text-apple-gray-2">添加数据源</p>
        </div>
      </div>

      {/* Amazon Mock Data Info */}
      <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
        <h3 className="text-xl font-semibold text-apple-gray-1 mb-4">亚马逊模拟数据说明</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-medium text-apple-gray-2 mb-2">数据格式</h4>
            <div className="bg-apple-gray-4 rounded-xl p-4">
              <pre className="text-xs text-apple-gray-1 font-mono whitespace-pre-wrap">
{`{
  "asin": "B09N5ZNWWX",
  "title": "Premium Skincare Set",
  "price": 299.00,
  "category": "Skincare",
  "stock": 156,
  "rating": 4.5,
  "reviewCount": 128
}`}
              </pre>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-apple-gray-2 mb-2">数据量统计</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-3 bg-apple-gray-4 rounded-lg">
                <span className="text-apple-gray-2">商品数据</span>
                <span className="text-apple-gray-1 font-medium">156 条</span>
              </div>
              <div className="flex justify-between p-3 bg-apple-gray-4 rounded-lg">
                <span className="text-apple-gray-2">订单数据</span>
                <span className="text-apple-gray-1 font-medium">12,000+ 条</span>
              </div>
              <div className="flex justify-between p-3 bg-apple-gray-4 rounded-lg">
                <span className="text-apple-gray-2">评价数据</span>
                <span className="text-apple-gray-1 font-medium">3,200+ 条</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
