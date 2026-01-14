'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import useSWR from 'swr';
import { getBooks, getCategories } from '@/lib/api';
import { ProductGrid, ErrorState } from '@/components';
import { storageManager } from '@/lib/storage';

interface Product {
  _id?: string;
  id?: string;
  title: string;
  image?: string;
  image_url?: string;
  price?: number;
  rating?: number;
  author?: string;
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [limit, setLimit] = useState(12);
  const offset = 0;

  // Fetch categories to find category name
  const { data: categoriesData } = useSWR('categories', getCategories);

  // Fetch books for this category
  const { data: booksData, isLoading } = useSWR(
    params.slug !== 'all'
      ? `books-category-${params.slug}-${limit}`
      : `books-all-${limit}`,
    () =>
      getBooks({
        category: params.slug === 'all' ? undefined : params.slug,
        limit,
        offset,
      })
  );

  const category = (Array.isArray(categoriesData) ? categoriesData : [])?.find(
    (c: any) => c.slug === params.slug
  );
  const products: Product[] = booksData?.data || [];

  useEffect(() => {
    if (category) {
      storageManager.addToHistory({
        id: params.slug,
        type: 'category',
        title: category.name,
        timestamp: Date.now(),
      });
      storageManager.setLastCategory(params.slug, category.name);
    }
  }, [category, params.slug]);

  const categoryTitle =
    params.slug === 'all'
      ? 'All Books'
      : category?.name || 'Category';

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h1 className="mb-12 text-4xl font-bold text-primary-900">
            {categoryTitle}
          </h1>
          <ProductGrid products={[]} isLoading={true} columns={4} />
        </div>
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h1 className="mb-12 text-4xl font-bold text-primary-900">
            {categoryTitle}
          </h1>
          <ErrorState
            title="No books found"
            message="Try adjusting your search or browsing a different category."
            showHomeLink={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-primary-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-4xl font-bold text-primary-900">
            {categoryTitle}
          </h1>
          <p className="mt-2 text-primary-600">
            {products.length} books available
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Filters/Controls */}
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-primary-600">
              Showing {products.length} results
            </div>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            >
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
          </div>

          {/* Grid */}
          <ProductGrid products={products} isLoading={isLoading} columns={4} />

          {/* Load More */}
          {products.length >= limit && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setLimit(limit + 12)}
                className="rounded-lg border-2 border-accent-600 px-8 py-3 font-semibold text-accent-600 transition-colors hover:bg-accent-50"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
