'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBarProducts } from '@/lib/api/bar-products';
import type { BarProduct } from '@/lib/api/types';

interface UseBarProductsReturn {
  products: BarProduct[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBarProducts(): UseBarProductsReturn {
  const [products, setProducts] = useState<BarProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBarProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar productos'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
