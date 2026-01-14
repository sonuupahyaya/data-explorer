'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { getBooks } from '@/lib/api';
import { ProductGrid, ErrorState } from '@/components';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: resultsData, isLoading } = useSWR(
    query ? `search-${query}` : null,
    query ? () => getBooks({ search: query, limit: 24 }) : null
  );

  const products: Product[] = resultsData?.data || [];

  if (!query) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <ErrorState
            title="No search query"
            message="Please enter a search query to find books."
            showHomeLink={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <section className="border-b border-gray-200 bg-primary-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-4xl font-bold text-primary-900">
            Search Results
          </h1>
          <p className="mt-2 text-primary-600">
            {isLoading ? 'Searching...' : `${products.length} results for "${query}"`}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <ProductGrid products={[]} isLoading={true} columns={4} />
          ) : products.length === 0 ? (
            <ErrorState
              title="No results found"
              message={`No books match your search for "${query}". Try different keywords.`}
              showHomeLink={true}
            />
          ) : (
            <ProductGrid products={products} columns={4} />
          )}
        </div>
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SearchContent />
    </Suspense>
  );
}
