'use client';

import { useProductDetail, useHistory } from '@/lib/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useEffect } from 'react';
import { ChevronLeft, Star, BookOpen, PoundSterling, ExternalLink } from 'lucide-react';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { product, isLoading } = useProductDetail(params.id);
  const { recordView } = useHistory();

  useEffect(() => {
    if (product) {
      recordView(params.id, {
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? document.referrer : '',
      });
    }
  }, [product, params.id, recordView]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-96 w-full rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          <div className="h-6 w-1/2 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gray-100 p-12 rounded-lg text-center">
        <p className="text-gray-600 text-lg">Product not found</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back home
        </Link>
      </div>
    );
  }

  const prod = product as any;

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span> / {prod?.title || 'Product'}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {prod?.image_url ? (
            <Image
              src={prod.image_url}
              alt={prod.title}
              width={300}
              height={400}
              className="w-full rounded-lg shadow-lg object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No Image Available</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{prod.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {prod.author}</p>

            {prod?.rating_avg && prod.rating_avg > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                <span className="text-lg font-semibold">{prod.rating_avg.toFixed(1)}</span>
                <span className="text-gray-600">({prod.reviews_count} reviews)</span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <p className="text-gray-600 mb-2">Price</p>
            <p className="text-4xl font-bold text-blue-600">
              {formatPrice(prod.price, prod.currency)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a
              href={prod?.source_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center flex items-center justify-center gap-2"
            >
              View on World of Books
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <Star className="w-5 h-5" aria-hidden="true" />
              Save
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            {prod?.publisher && (
              <div>
                <p className="text-gray-600 font-semibold">Publisher</p>
                <p>{prod.publisher}</p>
              </div>
            )}
            {prod?.isbn && (
              <div>
                <p className="text-gray-600 font-semibold">ISBN</p>
                <p className="font-mono">{prod.isbn}</p>
              </div>
            )}
            {prod?.publication_date && (
              <div>
                <p className="text-gray-600 font-semibold">Publication Date</p>
                <p>{prod.publication_date}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {prod?.description && (
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed">{prod.description}</p>
        </div>
      )}

      {prod?.specs && Object.keys(prod.specs).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(prod.specs).map(([key, value]) => (
              <div key={key} className="border border-gray-200 p-4 rounded-lg">
                <p className="font-semibold text-gray-700">{key}</p>
                <p className="text-gray-600">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6">Similar Books</h2>
        <p className="text-gray-600">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            Browse more books
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </Link>
        </p>
      </div>
    </div>
  );
}
