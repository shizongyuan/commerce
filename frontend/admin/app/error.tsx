"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-b from-white to-apple-gray-4 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* Error Icon */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-full opacity-50" />
            <div className="absolute inset-4 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center animate-ping" />
          </div>

          <h1 className="text-2xl font-semibold text-apple-gray-1 mb-3">
            服务出现了一些问题
          </h1>
          <p className="text-apple-gray-2 mb-8 leading-relaxed">
            抱歉，页面加载时遇到了问题。
            <br />
            请稍后重试，或返回首页。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white font-medium rounded-full hover:shadow-xl hover:shadow-hermes-orange/30 hover:-translate-y-1 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-apple-gray-3 text-apple-gray-1 font-medium rounded-full hover:border-hermes-orange hover:text-hermes-orange transition-all"
            >
              <Home className="w-4 h-4" />
              返回首页
            </Link>
          </div>

          {error.digest && (
            <p className="text-xs text-apple-gray-3 mt-8">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}