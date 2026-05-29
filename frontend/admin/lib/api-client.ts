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
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    ),

  me: () =>
    apiRequest<{ id: string; name: string; email: string; role: string }>(
      "/auth/me"
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
      `/products${query ? `?${query}` : ""}`
    );
  },

  get: (id: string) =>
    apiRequest<Product>(`/products/${id}`),

  create: (product: Partial<Product>) =>
    apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),

  update: (id: string, product: Partial<Product>) =>
    apiRequest<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    }),

  uploadImage: async (file: File): Promise<{ success: boolean; filename: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getCookie("token");
    const response = await fetch(`${API_URL}/products/upload-image`, {
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
    apiRequest<{ items: Agent[]; total: number }>("/agents"),

  get: (id: string) =>
    apiRequest<Agent>(`/agents/${id}`),

  create: (agent: Partial<Agent>) =>
    apiRequest<Agent>("/agents", {
      method: "POST",
      body: JSON.stringify(agent),
    }),

  update: (id: string, agent: Partial<Agent>) =>
    apiRequest<Agent>(`/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(agent),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/agents/${id}`, {
      method: "DELETE",
    }),
};

// Analytics API
export const analyticsApi = {
  dashboard: () =>
    apiRequest<DashboardData>("/analytics/dashboard"),

  salesTrend: (days: number = 30) =>
    apiRequest<{ items: SalesTrend[]; total_revenue: number; total_orders: number; avg_daily_revenue: number }>(
      `/analytics/sales/trend/extended?days=${days}`
    ),

  orderDistribution: () =>
    apiRequest<OrderDistribution[]>(`/analytics/orders/distribution`),

  orderRegion: () =>
    apiRequest<RegionRanking[]>(`/analytics/orders/region`),

  paymentMethods: () =>
    apiRequest<PaymentMethod[]>(`/analytics/orders/payment`),

  conversionFunnel: () =>
    apiRequest<ConversionFunnel[]>(`/analytics/sales/funnel`),

  hourlySales: (date?: string) =>
    apiRequest<HourlySales[]>(`/analytics/sales/hourly${date ? `?date=${date}` : ""}`),

  categoryTop10: (category: string = "skincare") =>
    apiRequest<CategoryTop10Item[]>(`/analytics/category-top10?category=${category}`),
};

// Types
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

// Wiki API
export const wikiApi = {
  list: (params?: { page?: number; page_size?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.page_size) searchParams.set("page_size", params.page_size.toString());
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();
    return apiRequest<{ items: WikiDocument[]; total: number; page: number; page_size: number }>(
      `/wiki/documents${query ? `?${query}` : ""}`
    );
  },

  get: (id: string) =>
    apiRequest<WikiDocument>(`/wiki/documents/${id}`),

  create: (doc: { title: string; source_type: string; source_path: string; content?: string }) =>
    apiRequest<{ id: string }>("/wiki/documents", {
      method: "POST",
      body: JSON.stringify(doc),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/wiki/documents/${id}`, {
      method: "DELETE",
    }),

  ingest: (id: string) =>
    apiRequest<{ message: string; concepts: string[]; pages_created: number; review: any }>(
      `/wiki/ingest/${id}`,
      { method: "POST" }
    ),

  search: (q: string) =>
    apiRequest<{ results: WikiDocument[]; total: number }>(`/wiki/search?q=${encodeURIComponent(q)}`),

  index: () =>
    apiRequest<{ pages: WikiPage[]; total: number }>("/wiki/index"),

  lint: () =>
    apiRequest<{ document_count: number; page_count: number; stale_documents: number; issues: any[] }>(
      "/wiki/lint",
      { method: "POST" }
    ),

  uploadAndProcess: async (file: File, title: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    const token = getCookie("token");
    const response = await fetch(`${API_URL}/wiki/process-upload`, {
      method: "POST",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "处理失败" }));
      throw new Error(error.detail || "处理失败");
    }

    return response.json();
  },
};

export interface WikiDocument {
  id: string;
  title: string;
  source_type: string;
  source_path: string;
  status: string;
  concepts: string[];
  summary: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface WikiPage {
  id: string;
  document_id: string;
  title: string;
  file_path: string;
  concepts: string[];
  created_at: string;
}

// Scraper API
export const scraperApi = {
  scrape: (req: { url: string; username: string; password: string; description?: string }) =>
    apiRequest<{ task_id: string; message: string }>("/scraper/scrape", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  listTasks: () =>
    apiRequest<{ items: ScraperTask[]; total: number }>("/scraper/scrape/tasks"),

  getTask: (task_id: string) =>
    apiRequest<ScraperTask>(`/scraper/scrape/tasks/${task_id}`),

  listResults: () =>
    apiRequest<{ items: ScraperResult[]; total: number }>("/scraper/scrape/results"),

  downloadResult: (filename: string) =>
    `${API_URL}/scraper/scrape/results/${filename}`,

  deleteTask: (task_id: string) =>
    apiRequest<{ message: string }>(`/scraper/scrape/tasks/${task_id}`, {
      method: "DELETE",
    }),
};

export interface ScraperTask {
  task_id: string;
  url: string;
  status: "pending" | "running" | "done" | "failed";
  message: string;
  created_at: string;
  completed_at?: string;
  result_file?: string;
  record_count: number;
}

export interface ScraperResult {
  filename: string;
  path: string;
  size: number;
  created_at: string;
}

// Image URL helper
export function getImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // 图片路径如 /products/xxx.webp，直接使用 WEBSITE_URL + path
  return `${API_CONFIG.WEBSITE_URL}${path}`;
}