import { API_CONFIG } from "@/lib/config";

interface Product {
  id: string;
  asin?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating?: number;
  review_count?: number;
  description?: string;
  images: string[];
  status: string;
}

interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export function getImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_CONFIG.API_URL}${path}`;
}

export const apiClient = {
  async getProducts(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    keyword?: string;
  }): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.page_size) searchParams.set("page_size", String(params.page_size));
    if (params?.category) searchParams.set("category", params.category);
    if (params?.keyword) searchParams.set("keyword", params.keyword);

    const query = searchParams.toString();
    return request<ProductListResponse>(
      `/api/products${query ? `?${query}` : ""}`
    );
  },

  async getProduct(id: string): Promise<Product> {
    return request<Product>(`/api/products/${id}`);
  },

  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    reason: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export type { Product, ProductListResponse };
