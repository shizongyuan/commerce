/**
 * 后台 API 客户端
 * 统一管理所有 API 调用，自动附加认证 Token，统一错误处理
 */

import { getCookie } from "./cookies";

import { API_CONFIG } from "@/lib/config";

export const API_URL = API_CONFIG.API_URL;

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// API Response type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}

// Generic API request
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getCookie("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "请求失败";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ access_token: string; user: { id: string; name: string; email: string; role: string } }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    ),

  me: () =>
    apiRequest<{ id: string; name: string; email: string; role: string }>(
      "/api/auth/me"
    ),
};

// Products API
export const productsApi = {
  list: (params?: { page?: number; page_size?: number; category?: string; keyword?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.page_size) searchParams.set("page_size", params.page_size.toString());
    if (params?.category) searchParams.set("category", params.category);
    if (params?.keyword) searchParams.set("keyword", params.keyword);
    const query = searchParams.toString();
    return apiRequest<{ items: Product[]; total: number; page: number; page_size: number }>(
      `/api/products${query ? `?${query}` : ""}`
    );
  },

  get: (id: string) =>
    apiRequest<Product>(`/api/products/${id}`),

  create: (product: Partial<Product>) =>
    apiRequest<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),

  update: (id: string, product: Partial<Product>) =>
    apiRequest<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/api/products/${id}`, {
      method: "DELETE",
    }),

  uploadImage: async (file: File): Promise<{ success: boolean; filename: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = getCookie("token");
    const response = await fetch(`${API_URL}/api/products/upload-image`, {
      method: "POST",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "上传失败" }));
      throw new Error(error.message || "上传失败");
    }
    
    return response.json();
  },
};

// Agents API
export const agentsApi = {
  list: () =>
    apiRequest<{ items: Agent[]; total: number }>("/api/agents"),

  get: (id: string) =>
    apiRequest<Agent>(`/api/agents/${id}`),

  create: (agent: Partial<Agent>) =>
    apiRequest<Agent>("/api/agents", {
      method: "POST",
      body: JSON.stringify(agent),
    }),

  update: (id: string, agent: Partial<Agent>) =>
    apiRequest<Agent>(`/api/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(agent),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/api/agents/${id}`, {
      method: "DELETE",
    }),
};

// Analytics API
export const analyticsApi = {
  dashboard: () =>
    apiRequest<DashboardData>("/api/analytics/dashboard"),

  salesTrend: (days: number = 30) =>
    apiRequest<{ items: SalesTrend[]; total_revenue: number; total_orders: number; avg_daily_revenue: number }>(
      `/api/analytics/sales/trend/extended?days=${days}`
    ),

  orderDistribution: () =>
    apiRequest<OrderDistribution[]>(`/api/analytics/orders/distribution`),

  orderRegion: () =>
    apiRequest<RegionRanking[]>(`/api/analytics/orders/region`),

  paymentMethods: () =>
    apiRequest<PaymentMethod[]>(`/api/analytics/orders/payment`),

  conversionFunnel: () =>
    apiRequest<ConversionFunnel[]>(`/api/analytics/sales/funnel`),

  hourlySales: (date?: string) =>
    apiRequest<HourlySales[]>(`/api/analytics/sales/hourly${date ? `?date=${date}` : ""}`),

  categoryTop10: (category: string = "skincare") =>
    apiRequest<CategoryTop10Item[]>(`/api/analytics/category-top10?category=${category}`),
};

// --- Types from admin/api-client.ts ---
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
  asin?: string;
  description?: string;
}

export interface Agent {
  id: string;
  code: string;
  name: string;
  role: string;
  avatar?: string;
  knowledge_files: string[];
  skills: string[];
  status: string;
  greeting?: string;
}

export interface DashboardData {
  sales: {
    today_revenue: number;
    month_revenue: number;
    avg_order_value: number;
    conversion_rate: number;
    total_orders: number;
  };
  sales_trend: SalesTrend[];
  product_ranking: ProductRanking[];
  alerts: Alert[];
}

export interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductRanking {
  rank: number;
  product_name: string;
  revenue: number;
  quantity: number;
}

export interface Alert {
  id: string;
  type: string;
  level: string;
  title: string;
  content: string;
  created_at: string;
}

export interface OrderDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface RegionRanking {
  rank: number;
  region: string;
  orders: number;
  revenue: number;
}

export interface PaymentMethod {
  method: string;
  count: number;
  percentage: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  rate: number;
}

export interface HourlySales {
  hour: number;
  revenue: number;
  orders: number;
}

export interface CategoryTop10Item {
  rank: number;
  asin: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  bsr_rank: number;
  image_url: string;
}

// --- From website/lib/api.ts: getImageUrl + Product type ---
export function getImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_CONFIG.API_URL}${path}`;
}

// Re-export ProductListResponse from website
export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}