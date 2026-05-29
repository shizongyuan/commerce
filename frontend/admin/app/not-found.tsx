import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-apple-gray-4 flex items-center justify-center px-6">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-hermes-orange-pale to-apple-gray-3 rounded-full opacity-50" />
          <div className="absolute inset-4 bg-gradient-to-br from-hermes-orange to-hermes-orange-light rounded-full opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-white">404</span>
          </div>
          {/* Decorative dots */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-hermes-orange rounded-full animate-ping" />
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-hermes-orange-light rounded-full animate-pulse" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-semibold text-apple-gray-1 mb-3">
          页面不存在
        </h1>
        <p className="text-apple-gray-2 mb-8 max-w-sm mx-auto">
          抱歉，您访问的页面已消失或不存在。
          <br />
          让我们带您回到首页吧。
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-hermes-orange text-white font-medium rounded-full hover:bg-hermes-orange-light transition-colors"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-apple-gray-3 text-apple-gray-1 font-medium rounded-full hover:border-hermes-orange hover:text-hermes-orange transition-colors"
          >
            <Search className="w-4 h-4" />
            浏览商品
          </Link>
        </div>
      </div>
    </div>
  );
}