"use client";

import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, Star, ShoppingCart } from "lucide-react";
import { analyticsApi, CategoryTop10Item, getImageUrl } from "@/lib/api-client";
import { toast } from "@/components/ui";

const CATEGORIES = [
  { value: "skincare", label: "护肤" },
  { value: "makeup", label: "美妆" },
  { value: "electronics", label: "电子" },
  { value: "home", label: "家居" },
];

export function CategoryTop10Chart() {
  const [category, setCategory] = useState("skincare");
  const [data, setData] = useState<CategoryTop10Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await analyticsApi.categoryTop10(category);
      setData(result);
    } catch (err) {
      toast("加载失败", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
      toast("更新成功", "success");
    } catch (err) {
      toast("更新失败", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-hermes-orange-pale rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-hermes-orange" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-apple-gray-1">亚马逊品类 TOP 10</h3>
            <p className="text-xs text-apple-gray-2">同类商品热销排行</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Category Selector */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              category === cat.value
                ? "bg-hermes-orange text-white"
                : "bg-apple-gray-4 text-apple-gray-2 hover:text-apple-gray-1"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* TOP 10 List */}
      <div className="space-y-2">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-6 h-6 bg-apple-gray-3 rounded animate-pulse" />
              <div className="w-10 h-10 bg-apple-gray-3 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-apple-gray-3 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-apple-gray-3 rounded w-1/2 mt-1 animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          data.slice(0, 10).map((item) => (
            <div
              key={item.rank}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-apple-gray-4 transition-colors cursor-pointer group"
            >
              {/* Rank */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.rank <= 3
                    ? "bg-hermes-orange text-white"
                    : item.rank <= 6
                    ? "bg-hermes-orange-pale text-hermes-orange"
                    : "bg-apple-gray-4 text-apple-gray-2"
                }`}
              >
                {item.rank}
              </div>

              {/* Image */}
              <img
                src={getImageUrl(item.image_url)}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover bg-apple-gray-4 opacity-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23E5E5E7' width='40' height='40'/%3E%3Ctext fill='%2386868B' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='10'%3E图%3C/text%3E%3C/svg%3E";
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-apple-gray-1 truncate group-hover:text-hermes-orange transition-colors">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-apple-gray-2">
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </span>
                  <span>¥{item.price}</span>
                  <span>BSR #{item.bsr_rank.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-apple-gray-3 flex items-center justify-between text-xs text-apple-gray-2">
        <span>数据来源: Amazon.com</span>
        <span className="flex items-center gap-1">
          <ShoppingCart className="w-3 h-3" />
          手动刷新
        </span>
      </div>
    </div>
  );
}