"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient, type Product } from "@/lib/api";

interface UseProductsOptions {
  initialParams?: {
    page?: number;
    page_size?: number;
    category?: string;
    keyword?: string;
  };
}

export function useProducts(options: UseProductsOptions = {}) {
  const { initialParams = {} } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState(initialParams);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.getProducts(params);
      setProducts(result.items);
      setTotal(result.total);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch products");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = useCallback((newParams: typeof params) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return {
    products,
    isLoading,
    error,
    params,
    total,
    updateParams,
    refetch: fetchProducts,
  };
}
