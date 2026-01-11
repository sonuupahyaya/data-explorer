/**
 * Custom React Hooks for API data fetching
 * Uses SWR for caching, revalidation, and optimistic updates
 */

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import api from './api';

/**
 * Hook to fetch and cache navigation
 */
export function useNavigation() {
  const { data, error, isLoading, mutate } = useSWR('navigation', () => api.navigation.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    navigation: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch categories for a navigation heading
 */
export function useCategories(navigationSlug?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    navigationSlug ? `categories-${navigationSlug}` : null,
    navigationSlug ? () => api.navigation.getCategories(navigationSlug) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  return {
    categories: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch paginated products
 */
export function useProducts(params: Record<string, any> = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const cacheKey = `products-${searchParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => api.products.list(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    },
  );

  return {
    products: (data as any)?.data || [],
    pagination: (data as any)?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch product details
 */
export function useProductDetail(productId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `product-${productId}` : null,
    productId ? () => api.products.getDetail(productId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    },
  );

  return {
    product: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook for full-text search
 */
export function useSearch(query: string, limit: number = 20) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async () => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.search.query(query, limit);
      setResults(data as any[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [search]);

  return {
    results,
    isLoading: loading,
    error,
  };
}

/**
 * Hook for search autocomplete
 */
export function useSearchAutocomplete(query: string) {
  const { data, error, isLoading } = useSWR(
    query && query.length > 1 ? `autocomplete-${query}` : null,
    query && query.length > 1 ? () => api.search.autocomplete(query) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    },
  );

  return {
    suggestions: data || { titles: [], authors: [] },
    isLoading,
    error,
  };
}

/**
 * Hook to fetch available filters
 */
export function useSearchFilters() {
  const { data, error, isLoading } = useSWR('search-filters', () => api.search.filters(), {
    revalidateOnFocus: false,
    dedupingInterval: 3600000, // 1 hour
  });

  return {
    filters: data,
    isLoading,
    error,
  };
}

/**
 * Hook to record and fetch view history
 */
export function useHistory(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `history-${userId}` : 'history',
    () => api.history.get(userId, 20),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  const recordView = useCallback(
    async (productId: string, metadata: Record<string, any> = {}) => {
      try {
        await api.history.record({
          product_id: productId,
          user_id: userId,
          ...metadata,
        });
        mutate(); // Refresh history
      } catch (err) {
        console.error('Failed to record view:', err);
      }
    },
    [userId, mutate],
  );

  return {
    history: data,
    isLoading,
    error,
    recordView,
    refresh: mutate,
  };
}

/**
 * Hook to fetch popular products
 */
export function usePopularProducts() {
  const { data, error, isLoading } = useSWR('popular-products', () => api.history.popular(), {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });

  return {
    products: data,
    isLoading,
    error,
  };
}
