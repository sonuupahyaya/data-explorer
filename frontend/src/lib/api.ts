import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Generate or retrieve a persistent userId from localStorage
 */
function getUserId(): string {
  if (typeof window === 'undefined') return 'server';

  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true, // Enable sending cookies
});

// Add userId to every request header as fallback
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.headers['X-User-Id'] = getUserId();
  }
  return config;
});

// Categories API
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Books/Products API
export const getBooks = async (params?: { category?: string; limit?: number; offset?: number; search?: string }) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Single Book/Product API
export const getBook = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Cart API
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  const response = await api.post('/cart/add', {
    productId,
    quantity,
  });
  return response.data;
};

export const updateCartQuantity = async (productId: string, quantity: number) => {
  const response = await api.post(`/cart/${productId}/quantity`, {
    quantity,
  });
  return response.data;
};

export const removeFromCart = async (productId: string) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

// SavedForLater API
export const getSavedItems = async () => {
  const response = await api.get('/saved');
  return response.data;
};

export const saveForLater = async (productId: string) => {
  const response = await api.post('/saved/add', {
    productId,
  });
  return response.data;
};

export const checkIfSaved = async (productId: string) => {
  const response = await api.get(`/saved/${productId}/is-saved`);
  return response.data;
};

export const removeFromSaved = async (productId: string) => {
  const response = await api.delete(`/saved/${productId}`);
  return response.data;
};

export const clearSavedItems = async () => {
  const response = await api.delete('/saved');
  return response.data;
};

// Image proxy
// CRITICAL: Only proxy external URLs, not already-proxied URLs
export const getProxiedImage = (url: string) => {
  if (!url) return '/images/placeholder-book.svg';

  // If the URL is already a proxied URL or a local static file, return as-is
  if (url.includes('/api/image') || url.startsWith('/')) {
    return url;
  }

  // Only proxy external URLs (http/https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const encoded = encodeURIComponent(url);
    return `${API_BASE}/image?url=${encoded}`;
  }

  // Fallback
  return '/images/placeholder-book.svg';
};

export default api;
