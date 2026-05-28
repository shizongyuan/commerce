"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft, Grid, LayoutGrid, SlidersHorizontal, X, Sparkles, Palette, Smartphone } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { getImageUrl } from "@/lib/api";
import { AnimatedSection } from "@/components/animated-section";

const categories = [
  { value: "", label: "全部", icon: Grid },
  { value: "Skincare", label: "护肤", icon: Sparkles },
  { value: "Makeup", label: "美妆", icon: Palette },
  { value: "Electronics", label: "数码", icon: Smartphone },
];

export default function ProductsPage() {
  const { products, isLoading, params, updateParams, total } = useProducts();
  const [keyword, setKeyword] = useState(params.keyword || "");
  const [showFilters, setShowFilters] = useState(false);
  const page = params.page || 1;
  const pageSize = params.page_size || 12;
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ keyword, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    updateParams({ category, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setKeyword("");
    updateParams({ keyword: "", category: "", page: 1 });
  };

  const hasActiveFilters = params.keyword || params.category;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray-4">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-apple-gray-3/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-semibold text-apple-gray-1 tracking-tight hover:text-hermes-orange transition-colors">
                焕美严选
              </Link>
              <nav className="hidden md:flex items-center gap-6 ml-8">
                <Link href="/" className="text-sm text-apple-gray-2 hover:text-apple-gray-1 transition-colors">首页</Link>
                <Link href="/products" className="text-sm text-hermes-orange font-medium">全部好物</Link>
                <Link href="/chat" className="text-sm text-apple-gray-2 hover:text-apple-gray-1 transition-colors">在线咨询</Link>
              </nav>
            </div>
            <Link
              href="/chat"
              className="px-5 py-2.5 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-hermes-orange/25 transition-all"
            >
              咨询客服
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-apple-gray-2 hover:text-hermes-orange transition-colors">首页</Link>
          <ChevronRight className="w-4 h-4 text-apple-gray-3" />
          <span className="text-apple-gray-1 font-medium">全部好物</span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Page Header */}
        <AnimatedSection>
          <div className="mb-10">
            <h1 className="text-4xl font-semibold text-apple-gray-1 tracking-tight mb-2">
              全部好物
            </h1>
            <p className="text-apple-gray-2 text-lg">
              共 <span className="text-hermes-orange font-medium">{total}</span> 件精选好物
            </p>
          </div>
        </AnimatedSection>

        {/* Search & Filter */}
        <AnimatedSection delay={100}>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-10 border border-apple-gray-3/50 shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索您心仪的好物..."
                  className="w-full pl-14 pr-4 py-4 bg-apple-gray-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hermes-orange/50 transition-all border-2 border-transparent focus:border-hermes-orange"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white text-sm font-semibold rounded-2xl hover:shadow-lg hover:shadow-hermes-orange/25 hover:-translate-y-0.5 transition-all"
              >
                搜索
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-4 text-apple-gray-2 hover:text-hermes-orange transition-colors flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </form>

            {/* Categories */}
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <span className="text-sm text-apple-gray-2 mr-2">分类：</span>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-5 py-2.5 text-sm rounded-full transition-all duration-300 flex items-center gap-2 ${
                    params.category === cat.value
                      ? "bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white shadow-lg shadow-hermes-orange/25"
                      : "bg-apple-gray-4 text-apple-gray-1 hover:bg-apple-gray-3 hover:-translate-y-0.5"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-apple-gray-4 to-apple-gray-3 rounded-2xl mb-4" />
                <div className="h-4 bg-apple-gray-3 rounded w-3/4 mb-2" />
                <div className="h-4 bg-apple-gray-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <AnimatedSection>
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-apple-gray-4 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-apple-gray-3" />
              </div>
              <h3 className="text-xl font-medium text-apple-gray-1 mb-2">未找到相关商品</h3>
              <p className="text-apple-gray-2 mb-6">换个关键词试试，或者浏览全部商品</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-hermes-orange text-white text-sm font-medium rounded-full hover:bg-hermes-orange-light transition-colors"
              >
                查看全部商品
              </button>
            </div>
          </AnimatedSection>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <AnimatedSection key={product.id} delay={i * 60} direction="up">
                  <Link
                    href={`/products/${product.id}`}
                    className="group bg-white rounded-2xl p-4 border border-apple-gray-3/30 hover:border-hermes-orange/30 hover:shadow-2xl hover:shadow-hermes-orange/10 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-square bg-gradient-to-br from-apple-gray-4 to-apple-gray-3 rounded-xl mb-4 overflow-hidden relative isolate">
                      {product.images && product.images[0] ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-apple-gray-3 text-lg">暂无图片</span>
                        </div>
                      )}
                      {/* Category badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-hermes-orange font-medium shadow-sm">
                        {product.category}
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-apple-gray-1 line-clamp-2 group-hover:text-hermes-orange transition-colors min-h-[2.5rem] mb-3">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-hermes-orange">
                        ¥{product.price}
                      </p>
                      {product.rating && (
                        <span className="text-xs text-apple-gray-2 flex items-center gap-0.5 bg-apple-gray-4 px-2 py-1 rounded-full">
                          <span className="text-yellow-400">★</span> {product.rating}
                        </span>
                      )}
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <AnimatedSection delay={300} direction="fade">
                <div className="flex justify-center items-center gap-3 mt-16">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="w-12 h-12 rounded-full border border-apple-gray-3 hover:border-hermes-orange hover:text-hermes-orange disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (page > 3) pageNum = page - 2 + i;
                        if (page > totalPages - 2) pageNum = totalPages - 4 + i;
                      }
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-12 h-12 text-sm rounded-full transition-all ${
                            page === pageNum
                              ? "bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white shadow-lg shadow-hermes-orange/25 font-medium"
                              : "bg-white text-apple-gray-1 hover:bg-apple-gray-4 border border-apple-gray-3 hover:border-hermes-orange/30"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="w-12 h-12 rounded-full border border-apple-gray-3 hover:border-hermes-orange hover:text-hermes-orange disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-center text-sm text-apple-gray-2 mt-4">
                  第 {page} / {totalPages} 页
                </p>
              </AnimatedSection>
            )}
          </>
        )}
      </main>
    </div>
  );
}