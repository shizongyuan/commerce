"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Star,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle,
  ShoppingBag,
  Heart,
  Share2,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { apiClient, getImageUrl, type Product } from "@/lib/api";
import { AnimatedSection } from "@/components/animated-section";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (params.id) {
      apiClient
        .getProduct(params.id as string)
        .then(setProduct)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray-4 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-apple-gray-3 border-t-hermes-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-apple-gray-4 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-apple-gray-3" />
          </div>
          <h2 className="text-xl font-medium text-apple-gray-1 mb-3">商品不存在或已下架</h2>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-hermes-orange text-white font-medium rounded-full hover:bg-hermes-orange-light transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            返回全部好物
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Shield, label: "正品保证", desc: "假一赔十" },
    { icon: Truck, label: "极速发货", desc: "下单即发" },
    { icon: RotateCcw, label: "7天退换", desc: "无理由退换" },
  ];

  const images = product.images?.length ? product.images : [];

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
                <Link href="/products" className="text-sm text-apple-gray-2 hover:text-apple-gray-1 transition-colors">全部好物</Link>
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
          <Link href="/products" className="text-apple-gray-2 hover:text-hermes-orange transition-colors">全部好物</Link>
          <ChevronRight className="w-4 h-4 text-apple-gray-3" />
          <span className="text-apple-gray-1 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Product Detail Card */}
        <AnimatedSection>
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-apple-gray-3/30 shadow-sm mb-8">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <AnimatedSection direction="fade">
                  <div className="aspect-square bg-gradient-to-br from-apple-gray-4 to-apple-gray-3 rounded-2xl overflow-hidden relative group">
                    {images.length > 0 ? (
                      <img
                        src={getImageUrl(images[selectedImage])}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-20 h-20 text-apple-gray-3" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-4 py-2 bg-hermes-orange text-white text-sm font-medium rounded-full shadow-lg">
                        {product.category}
                      </span>
                      {product.stock > 0 && (
                        <span className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-1">
                          <Check className="w-4 h-4" /> 有货
                        </span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                          isFavorite
                            ? "bg-red-500 text-white"
                            : "bg-white/90 text-apple-gray-2 hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                      </button>
                      <button className="w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-apple-gray-2 hover:text-hermes-orange transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                          selectedImage === idx
                            ? "border-hermes-orange shadow-lg"
                            : "border-transparent hover:border-apple-gray-3"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <AnimatedSection delay={100}>
                  <h1 className="text-3xl md:text-4xl font-semibold text-apple-gray-1 tracking-tight mb-6 leading-tight">
                    {product.name}
                  </h1>
                </AnimatedSection>

                <AnimatedSection delay={150}>
                  {product.rating && (
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(product.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-apple-gray-3"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-apple-gray-2">
                        <span className="text-hermes-orange font-medium">{product.rating}</span>
                        <span className="mx-1">·</span>
                        {product.review_count} 条评价
                      </span>
                    </div>
                  )}
                </AnimatedSection>

                <AnimatedSection delay={200}>
                  <div className="text-5xl font-bold bg-gradient-to-r from-hermes-orange to-hermes-orange-light bg-clip-text text-transparent mb-8">
                    ¥{product.price}
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={250}>
                  {product.description && (
                    <p className="text-apple-gray-2 leading-relaxed mb-8 p-6 bg-apple-gray-4 rounded-2xl">
                      {product.description}
                    </p>
                  )}
                </AnimatedSection>

                {/* Stock Status */}
                <AnimatedSection delay={300}>
                  <div className="flex items-center gap-3 mb-8">
                    {product.stock > 0 ? (
                      <>
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-green-600 font-medium">
                          有货 · 剩余 {product.stock} 件
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-red-500 font-medium">暂时缺货</span>
                      </>
                    )}
                  </div>
                </AnimatedSection>

                {/* Quantity Selector */}
                <AnimatedSection delay={350}>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-sm text-apple-gray-2 font-medium">数量：</span>
                    <div className="flex items-center border-2 border-apple-gray-3 rounded-full overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center text-apple-gray-1 hover:bg-apple-gray-4 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-16 text-center font-medium text-apple-gray-1">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-12 h-12 flex items-center justify-center text-apple-gray-1 hover:bg-apple-gray-4 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Actions */}
                <AnimatedSection delay={400}>
                  <div className="flex gap-4 mb-10">
                    <button className="flex-1 py-5 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white font-semibold rounded-full hover:shadow-xl hover:shadow-hermes-orange/30 hover:-translate-y-1 transition-all text-base flex items-center justify-center gap-3">
                      <ShoppingBag className="w-5 h-5" />
                      立即购买
                    </button>
                    <button className="flex-1 py-5 border-2 border-hermes-orange text-hermes-orange font-semibold rounded-full hover:bg-hermes-orange-pale transition-all text-base flex items-center justify-center gap-3">
                      <MessageCircle className="w-5 h-5" />
                      咨询客服
                    </button>
                  </div>
                </AnimatedSection>

                {/* Features */}
                <AnimatedSection delay={450}>
                  <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-apple-gray-4 to-white rounded-2xl border border-apple-gray-3/30">
                    {features.map(({ icon: Icon, label, desc }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-2 text-center"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-hermes-orange to-hermes-orange-light rounded-xl flex items-center justify-center shadow-lg shadow-hermes-orange/20">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-apple-gray-1">{label}</span>
                        <span className="text-xs text-apple-gray-2">{desc}</span>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Related Products Placeholder */}
        <AnimatedSection delay={500} direction="fade">
          <div className="text-center py-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-hermes-orange hover:text-hermes-orange-light transition-colors font-medium"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              返回全部好物
            </Link>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}