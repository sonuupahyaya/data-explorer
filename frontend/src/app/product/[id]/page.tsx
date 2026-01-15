'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { getBook, getProxiedImage, getBooks } from '@/lib/api';
import { ProductGrid, ErrorState } from '@/components';
import { useCart, useSaved } from '@/hooks';
import { useToasts } from '@/components/Toast';
import { storageManager } from '@/lib/storage';
import { Star, ChevronLeft, ShoppingCart, Heart, ExternalLink, Check } from 'lucide-react';

interface ProductDetail {
  _id?: string;
  id?: string;
  title: string;
  author?: string;
  description?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  image_url?: string;
  image?: string;
  publisher?: string;
  year?: number;
  pages?: number;
  isbn?: string;
  category?: string;
  categories?: string[];
}

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [isMounted, setIsMounted] = useState(false);
  const { addItem, isLoading: cartLoading } = useCart();
  const { save, remove, items: savedItems } = useSaved();
  const { success, error: toastError } = useToasts();

  if (!id || id === 'undefined') {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium"
          >
            <ChevronLeft size={18} strokeWidth={2} />
            Back
          </Link>
          <ErrorState
            title="Product not found"
            message="The book you're looking for doesn't exist or has been removed."
          />
        </div>
      </div>
    );
  }

  const { data: productData, isLoading: productLoading, error: fetchError } = useSWR(
    `product-${id}`,
    () => getBook(id)
  );

  const { data: recommendationsData } = useSWR(
    productData?.categories ? `recommendations-${productData.categories[0]}` : null,
    () =>
      productData?.categories
        ? getBooks({
            category: productData.categories[0],
            limit: 4,
          })
        : null
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && productData) {
      const product = productData;
      const productId = product._id || product.id;
      storageManager.addViewedProduct({
        id: productId,
        title: product.title,
        timestamp: Date.now(),
      });
      storageManager.addToHistory({
        id: productId,
        type: 'product',
        title: product.title,
        timestamp: Date.now(),
      });
    }
  }, [productData, isMounted]);

  if (fetchError) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium"
          >
            <ChevronLeft size={18} strokeWidth={2} />
            Back
          </Link>
          <ErrorState
            title="Product not found"
            message="The book you're looking for doesn't exist or has been removed."
          />
        </div>
      </div>
    );
  }

  const product: ProductDetail | undefined = productData;
  const recommendations = recommendationsData?.data || [];

  const FALLBACK = '/images/placeholder-book.svg';

  if (productLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-32 rounded-lg bg-gray-200" />
            <div className="grid gap-12 md:grid-cols-2">
              <div className="aspect-[3/4] rounded-2xl bg-gray-200" />
              <div className="space-y-4">
                <div className="h-8 rounded-lg bg-gray-200" />
                <div className="h-6 w-1/2 rounded-lg bg-gray-200" />
                <div className="space-y-3 pt-4">
                  <div className="h-4 rounded-lg bg-gray-200" />
                  <div className="h-4 rounded-lg bg-gray-200" />
                  <div className="h-4 w-5/6 rounded-lg bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <ErrorState />
        </div>
      </div>
    );
  }

  const imageUrl = product.image_url ? getProxiedImage(product.image_url) : product.image ? getProxiedImage(product.image) : FALLBACK;
  const productId: string = product._id || product.id || '';
  const isProductSaved = savedItems.some((item: any) => (item._id || item.id) === productId);

  const generateWorldOfBooksUrl = () => {
    if (product.isbn) {
      const slug = product.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return `https://www.worldofbooks.com/en-gb/products/${slug}/${product.isbn}`;
    }
    return 'https://www.worldofbooks.com';
  };

  const externalUrl = generateWorldOfBooksUrl();

  const handleAddToCart = async () => {
    try {
      const result = await addItem(productId, 1);
      if (result.success) {
        success('Added to cart');
      } else {
        toastError('Failed to add to cart');
      }
    } catch (err) {
      console.error('Error:', err);
      toastError('Failed to add to cart');
    }
  };

  const handleSave = async () => {
    try {
      if (isProductSaved) {
        const result = await remove(productId);
        if (result.success) {
          success('Removed from saved');
        } else {
          toastError('Failed to remove from saved');
        }
      } else {
        const result = await save(productId);
        if (result.success) {
          success('Saved for later');
        } else {
          toastError('Failed to save for later');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      toastError('Failed to update saved items');
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Navigation */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium transition-colors duration-250"
          >
            <ChevronLeft size={18} strokeWidth={2} />
            Back to Books
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Image */}
            <div className="md:col-span-1">
              <div className="sticky top-24">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-elevated">
                  <div className="relative aspect-[3/4] w-full bg-neutral-100">
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      className="h-full w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-1">
              <div className="space-y-8">
                {/* Title & Author */}
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold text-primary-900 leading-tight">
                    {product.title}
                  </h1>
                  {product.author && (
                    <p className="text-lg text-primary-600">
                      by {product.author}
                    </p>
                  )}
                </div>

                {/* Rating */}
                {product.rating !== undefined && (
                  <div className="flex items-center gap-4 pb-6 border-b border-neutral-200">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={
                              i < Math.round(product.rating!)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-neutral-300'
                            }
                            strokeWidth={0}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-primary-900">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    {product.reviews && (
                      <p className="text-sm text-primary-600">
                        ({product.reviews} reviews)
                      </p>
                    )}
                  </div>
                )}

                {/* Price */}
                {product.price !== undefined && (
                  <div>
                    <p className="text-5xl font-bold text-accent-600">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent-600 py-3.5 px-6 font-semibold text-white transition-all duration-250 hover:bg-accent-700 hover:shadow-elevated shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} strokeWidth={2} />
                    Add to Cart
                  </button>

                  {/* Save for Later */}
                  <button
                    onClick={handleSave}
                    className={`w-full flex items-center justify-center gap-2 rounded-lg py-3.5 px-6 font-semibold transition-all duration-250 ${
                      isProductSaved
                        ? 'bg-accent-50 border-2 border-accent-300 text-accent-700 hover:bg-accent-100'
                        : 'border-2 border-primary-200 text-primary-700 hover:bg-primary-50'
                    }`}
                  >
                    <Heart
                      size={20}
                      strokeWidth={2}
                      className={isProductSaved ? 'fill-current' : ''}
                    />
                    {isProductSaved ? 'Saved' : 'Save for Later'}
                  </button>

                  {/* Buy from WorldOfBooks */}
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-primary-200 py-3.5 px-6 font-semibold text-primary-700 transition-all duration-250 hover:bg-primary-50"
                  >
                    <ExternalLink size={20} strokeWidth={2} />
                    Buy from World of Books
                  </a>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="pt-6 border-t border-neutral-200">
                    <h3 className="text-lg font-semibold text-primary-900 mb-3">
                      About This Book
                    </h3>
                    <p className="text-primary-700 leading-relaxed line-clamp-6">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metadata */}
      {(product.publisher || product.year || product.pages || product.isbn) && (
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-8">
              Book Details
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {product.publisher && (
                <div className="rounded-2xl border border-neutral-200 p-6 bg-neutral-50">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary-600 mb-2">
                    Publisher
                  </p>
                  <p className="text-lg font-semibold text-primary-900">
                    {product.publisher}
                  </p>
                </div>
              )}
              {product.year && (
                <div className="rounded-2xl border border-neutral-200 p-6 bg-neutral-50">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary-600 mb-2">
                    Publication Year
                  </p>
                  <p className="text-lg font-semibold text-primary-900">
                    {product.year}
                  </p>
                </div>
              )}
              {product.pages && (
                <div className="rounded-2xl border border-neutral-200 p-6 bg-neutral-50">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary-600 mb-2">
                    Pages
                  </p>
                  <p className="text-lg font-semibold text-primary-900">
                    {product.pages}
                  </p>
                </div>
              )}
              {product.isbn && (
                <div className="rounded-2xl border border-neutral-200 p-6 bg-neutral-50">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary-600 mb-2">
                    ISBN
                  </p>
                  <p className="text-lg font-semibold text-primary-900 font-mono">
                    {product.isbn}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="py-16 bg-neutral-50 border-t border-neutral-200">
          <div className="mx-auto max-w-6xl px-6">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-primary-900">
                  Similar Books
                </h2>
                <p className="text-lg text-primary-600">
                  You might also like
                </p>
              </div>
              <ProductGrid products={recommendations} columns={4} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
