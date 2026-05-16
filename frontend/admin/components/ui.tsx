"use client";

import { Component, ReactNode, useState, useEffect, useRef } from "react";

// Toast notification system
interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function emitChange() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function toast(message: string, type: "success" | "error" | "info" = "info") {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message }];
  emitChange();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  }, 4000);
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {currentToasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-slide-in ${
            t.type === "success" ? "bg-green-50 border border-green-200 text-green-800" :
            t.type === "error" ? "bg-red-50 border border-red-200 text-red-800" :
            "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          {t.type === "success" && (
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {t.type === "error" && (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {t.type === "info" && (
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// Animation CSS Variables
export const motion = {
  instant: "100ms",
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  "ease-out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
  "ease-out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
  "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const transitions = {
  default: "transition-all duration-300 ease-out-quart",
  fast: "transition-all duration-150 ease-out-quart",
  slow: "transition-all duration-500 ease-out-quart",
  color: "transition-colors duration-200",
  transform: "transition-transform duration-200 ease-out-quart",
} as const;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">页面加载失败</h3>
              <p className="text-sm text-gray-500 mb-4">发生了意外错误，请尝试刷新页面</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-hermes-orange text-white text-sm font-medium rounded-lg hover:bg-hermes-orange-light transition-colors"
              >
                刷新页面
              </button>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-left overflow-auto max-w-[400px]">
                  {this.state.error.message}
                </pre>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Skeleton loader components
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-4 rounded" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
      <td className="px-6 py-4"><Skeleton className="h-8 w-20 rounded" /></td>
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="h-32 flex items-end gap-2 mb-4">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex-1 bg-gray-200 animate-pulse rounded-t" style={{ height: `${30 + (i * 17) % 70}%` }} />
        ))}
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

// Color constants for charts
export const CHART_COLORS = {
  orderStatus: ["#E65C00", "#FF8533", "#D4AF37", "#86868B"],
  paymentMethods: ["#07C160", "#1677FF", "#86909C"],
  default: ["#E65C00", "#FF8533", "#D4AF37", "#86868B", "#0070F3"],
} as const;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

// Lazy Image Component with loading and error states
interface LazyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

function getFullImageSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  return `${API_URL}${src}`;
}

export function LazyImage({ src, alt, className = "", skeletonClassName = "" }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert relative paths to full URLs
  const fullSrc = getFullImageSrc(src);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!fullSrc || hasError) {
    return (
      <div ref={containerRef} className={`bg-apple-gray-4 flex items-center justify-center ${className}`}>
        <svg
          className="w-12 h-12 text-apple-gray-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className={`absolute inset-0 bg-apple-gray-3 animate-pulse ${skeletonClassName}`} />
      )}
      {isInView && (
        <img
          src={fullSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}