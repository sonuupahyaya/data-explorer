'use client';

import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useSaved } from '@/hooks';
import { ProductGrid } from '@/components';
import { useToasts } from '@/components/Toast';

interface SavedItem {
  _id: string;
  productId: {
    _id: string;
    title: string;
    image_url?: string;
    price?: number;
    rating?: number;
    author?: string;
  };
}

export default function SavedPage() {
  const { items, isLoading, clear } = useSaved();
  const { success } = useToasts();

  const handleClear = async () => {
    if (window.confirm('Clear all saved items?')) {
      const result = await clear();
      if (result.success) {
        success('Saved items cleared');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-6">
            <Heart size={32} className="text-neutral-300" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-3">No Saved Items Yet</h1>
          <p className="text-lg text-primary-600 mb-8 max-w-md mx-auto">
            Save your favorite books to access them anytime
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 transition-all duration-250 hover:shadow-elevated shadow-soft"
          >
            Browse Books
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    );
  }

  const products = items.map((item: SavedItem) => ({
    _id: item.productId._id,
    title: item.productId.title,
    image_url: item.productId.image_url,
    price: item.productId.price,
    rating: item.productId.rating,
    author: item.productId.author,
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-100">
                  <Heart size={20} className="text-accent-600" strokeWidth={2} />
                </div>
                <h1 className="text-3xl font-bold text-primary-900">Saved Books</h1>
              </div>
              <p className="text-primary-600">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClear}
                className="text-sm font-medium text-primary-600 hover:text-accent-600 transition-colors duration-250"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <ProductGrid products={products} isLoading={false} columns={4} />

        <div className="mt-12 pt-12 border-t border-neutral-200 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-accent-600 text-accent-600 font-semibold rounded-lg hover:bg-accent-50 transition-all duration-250"
          >
            Continue Shopping
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
