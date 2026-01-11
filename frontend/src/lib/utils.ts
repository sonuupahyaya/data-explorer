/**
 * Utility functions for the frontend
 */

/**
 * Format currency for display
 */
export function formatPrice(price: number, currency: string = 'GBP'): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    INR: '₹',
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${price.toFixed(2)}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(d);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse slug to readable text
 */
export function deslugify(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0) ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Local storage helper
 */
export const storage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Silently fail (quota exceeded, private mode, etc)
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },

  getJSON: <T = any>(key: string): T | null => {
    const value = storage.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  setJSON: <T = any>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },
};

/**
 * Get user ID for tracking (from localStorage or generate)
 */
export function getUserId(): string {
  let userId = storage.get('wob_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    storage.set('wob_user_id', userId);
  }
  return userId;
}

/**
 * Get browsing history from localStorage
 */
export function getBrowsingHistory(): string[] {
  return storage.getJSON('wob_browsing_history') || [];
}

/**
 * Add to browsing history
 */
export function addToBrowsingHistory(productId: string): void {
  let history = getBrowsingHistory();
  history = history.filter((id) => id !== productId); // Remove if exists
  history.unshift(productId); // Add to front
  history = history.slice(0, 50); // Keep last 50
  storage.setJSON('wob_browsing_history', history);
}

/**
 * Clear browsing history
 */
export function clearBrowsingHistory(): void {
  storage.remove('wob_browsing_history');
}
