'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { getProxiedImage } from '@/lib/api';
import { useCart, useSaved } from '@/hooks';
import { useToasts } from './Toast';

interface ProductCardProps {
  _id?: string;
  id?: string;
  title: string;
  image?: string;
  image_url?: string;
  price?: number;
  rating?: number;
  author?: string;
}

export default function ProductCard({ _id, id, title, image, image_url, price, rating, author }: ProductCardProps) {
  const FALLBACK = '/images/placeholder-book.svg';
  const imageUrl = image_url ? getProxiedImage(image_url) : image ? getProxiedImage(image) : FALLBACK;

  const productId = _id || id;

  if (!productId || productId === 'undefined') {
    return null;
  }

  const { addItem, isLoading: cartLoading } = useCart();
  const { save, remove, items: savedItems } = useSaved();
  const { success, error: toastError } = useToasts();
  const [isSaving, setIsSaving] = useState(false);

  const isSaved = savedItems.some((item: any) => (item._id || item.id) === productId);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isSaved) {
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Link href={`/product/${productId}`}>
      <div className="group h-full flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/30 shadow-card hover:shadow-float-lg dark:shadow-2xl dark:hover:shadow-2xl transition-all duration-350 ease-smooth hover:-translate-y-2 dark:hover:-translate-y-3">
        {/* Image Container */}
        <div
          className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900"
          style={{ background: 'linear-gradient(180deg, #2A2F45, #1A1D28)' }}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-100 group-hover:brightness-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = FALLBACK;
            }}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Save Button Overlay */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`absolute top-3 right-3 rounded-full p-2.5 transition-all duration-250 backdrop-blur-lg transform group-hover:scale-110 ${
              isSaved
                ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg hover:shadow-xl'
                : 'bg-black/30 dark:bg-neutral-900/70 text-white dark:text-neutral-200 hover:bg-black/50 dark:hover:bg-neutral-800 shadow-lg hover:shadow-xl hover:shadow-cyan-500/30'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save for later'}
            aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
          >
            <Heart size={18} strokeWidth={2} className={isSaved ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 p-5 flex-1 bg-white dark:bg-neutral-900/50 backdrop-blur-sm">
          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-semibold text-primary-900 dark:text-neutral-50 group-hover:text-accent-600 dark:group-hover:text-cyan-400 transition-colors duration-250">
            {title}
          </h3>

          {/* Author */}
          {author && <p className="text-xs text-primary-600 dark:text-neutral-400 truncate font-medium">by {author}</p>}

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-neutral-300 dark:text-neutral-600'
                    }
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-xs text-primary-600 dark:text-neutral-400 font-semibold">{rating.toFixed(1)}</span>
            </div>
          )}

          {/* Price */}
          {price !== undefined && (
            <div className="mt-auto pt-3">
              <span className="text-lg font-bold text-cyan-500 dark:text-emerald-400 drop-shadow-lg dark:drop-shadow-glow">
                ${price.toFixed(2)}
              </span>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 dark:from-blue-700 dark:to-cyan-600 dark:hover:from-blue-800 dark:hover:to-cyan-700 py-3 px-4 text-xs font-semibold text-white transition-all duration-250 shadow-lg hover:shadow-xl hover:shadow-cyan-500/40 dark:shadow-lg dark:hover:shadow-cyan-500/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <ShoppingCart size={16} strokeWidth={2} />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
