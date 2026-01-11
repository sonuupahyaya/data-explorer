/**
 * API Client Library
 * Centralized API communication for the frontend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_TIMEOUT = process.env.NEXT_PUBLIC_API_TIMEOUT || 30000;

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body = undefined,
    headers = {},
    timeout = Number(API_TIMEOUT),
  } = options;

  const url = `${API_URL}${endpoint}`;
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `API Error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('API request timeout');
    }
    throw error;
  }
}

export const api = {
  // Navigation
  navigation: {
    getAll: () => apiRequest('/api/navigation'),
    getCategories: (slug: string) => apiRequest(`/api/navigation/${slug}`),
    refresh: () => apiRequest('/api/navigation/refresh', { method: 'POST' }),
  },

  // Products
  products: {
    list: (params: Record<string, any>) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return apiRequest(`/api/products?${searchParams.toString()}`);
    },
    getDetail: (id: string) => apiRequest(`/api/products/${id}`),
    refresh: (id: string) => apiRequest(`/api/products/${id}/refresh`, { method: 'POST' }),
  },

  // Search
  search: {
    query: (q: string, limit?: number) =>
      apiRequest(`/api/search?query=${encodeURIComponent(q)}&limit=${limit || 20}`),
    autocomplete: (q: string) =>
      apiRequest(`/api/search/autocomplete?query=${encodeURIComponent(q)}`),
    filters: () => apiRequest('/api/search/filters'),
  },

  // History
  history: {
    record: (data: Record<string, any>) =>
      apiRequest('/api/history', { method: 'POST', body: data }),
    get: (userId?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (limit) params.append('limit', String(limit));
      return apiRequest(`/api/history?${params.toString()}`);
    },
    popular: () => apiRequest('/api/history/popular'),
    analytics: () => apiRequest('/api/history/analytics'),
  },
};

export default api;
