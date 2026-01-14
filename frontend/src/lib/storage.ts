// Local storage utilities for persistence

const STORAGE_KEYS = {
  VIEWED_PRODUCTS: 'viewed_products',
  LAST_CATEGORY: 'last_category',
  BROWSING_HISTORY: 'browsing_history',
};

interface ViewedProduct {
  id: string;
  title: string;
  timestamp: number;
}

interface BrowsingHistoryItem {
  id: string;
  type: 'product' | 'category';
  title: string;
  timestamp: number;
}

export const storageManager = {
  // Viewed Products
  addViewedProduct: (product: ViewedProduct) => {
    try {
      const viewed = storageManager.getViewedProducts();
      const filtered = viewed.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 20);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.VIEWED_PRODUCTS, JSON.stringify(updated));
      }
    } catch (error) {
      console.warn('Storage error:', error);
    }
  },

  getViewedProducts: (): ViewedProduct[] => {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.VIEWED_PRODUCTS);
        return data ? JSON.parse(data) : [];
      }
      return [];
    } catch {
      return [];
    }
  },

  // Last Category
  setLastCategory: (slug: string, title: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEYS.LAST_CATEGORY,
          JSON.stringify({ slug, title, timestamp: Date.now() })
        );
      }
    } catch (error) {
      console.warn('Storage error:', error);
    }
  },

  getLastCategory: () => {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.LAST_CATEGORY);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Browsing History
  addToHistory: (item: BrowsingHistoryItem) => {
    try {
      const history = storageManager.getHistory();
      const filtered = history.filter((h) => h.id !== item.id);
      const updated = [item, ...filtered].slice(0, 50);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.BROWSING_HISTORY, JSON.stringify(updated));
      }
    } catch (error) {
      console.warn('Storage error:', error);
    }
  },

  getHistory: (): BrowsingHistoryItem[] => {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.BROWSING_HISTORY);
        return data ? JSON.parse(data) : [];
      }
      return [];
    } catch {
      return [];
    }
  },

  clearAll: () => {
    try {
      if (typeof window !== 'undefined') {
        Object.values(STORAGE_KEYS).forEach((key) => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.warn('Storage error:', error);
    }
  },
};
