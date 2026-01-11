'use client';

import { useCategories, useProducts } from '@/lib/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { categories } = useCategories(params.slug);
  const [page, setPage] = useState(1);
  const { products, pagination, isLoading } = useProducts({
    category: params.slug,
    page,
    limit: 24,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 capitalize">{params.slug.replace(/-/g, ' ')}</h1>
        <p className="text-gray-600">Browsing books in this category</p>
      </div>

      {Array.isArray(categories) && categories.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="font-semibold mb-4">Subcategories</h2>
          <div className="flex flex-wrap gap-2">
            {(categories as any[]).map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:border-blue-500 hover:text-blue-600 transition text-sm"
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-96 w-full rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="group"
              >
                <div className="bg-gray-100 rounded-lg overflow-hidden h-64 relative mb-4 flex items-center justify-center">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold group-hover:text-blue-600 transition line-clamp-2 mb-1">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{product.author}</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold">{formatPrice(product.price, product.currency)}</p>
                  {product.rating_avg > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                      <span>{product.rating_avg.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
            </div>

            {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Previous
              </button>
              <div className="flex gap-1">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-2 rounded ${
                      page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
                aria-label="Next page"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-100 p-12 rounded-lg text-center text-gray-600">
          <p>No products found in this category</p>
        </div>
      )}
    </div>
  );
}
