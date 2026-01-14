'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks';
import { getProxiedImage } from '@/lib/api';
import { useToasts } from '@/components/Toast';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clear, isLoading } = useCart();
  const { success, error } = useToasts();

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }

    const result = await updateQuantity(productId, newQuantity);
    if (!result.success) {
      error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const result = await removeItem(productId);
    if (result.success) {
      success('Item removed');
    } else {
      error('Failed to remove item');
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear entire cart?')) {
      const result = await clear();
      if (result.success) {
        success('Cart cleared');
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
          <ShoppingBag size={56} className="mx-auto mb-6 text-neutral-300" strokeWidth={1.5} />
          <h1 className="text-3xl font-bold text-primary-900 mb-3">Your Cart is Empty</h1>
          <p className="text-lg text-primary-600 mb-8 max-w-md mx-auto">
            Explore our collection and add some books to your cart
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 transition-all duration-250 hover:shadow-elevated shadow-soft"
          >
            Continue Shopping
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </div>
    );
  }

  const shipping = 0;
  const tax = Math.round(total * 8.5) / 100;
  const finalTotal = total + shipping + tax;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary-900">Shopping Cart</h1>
            <p className="text-primary-600">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-3">
              {items.map((item: any) => {
                const product = item.productId;
                const imageUrl = product.image_url
                  ? getProxiedImage(product.image_url)
                  : '/images/placeholder-book.svg';

                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card hover:shadow-soft transition-shadow duration-250"
                  >
                    <div className="flex gap-5">
                      {/* Product Image */}
                      <Link href={`/product/${product._id}`} className="flex-shrink-0">
                        <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-neutral-100">
                          <Image
                            src={imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link href={`/product/${product._id}`}>
                            <h3 className="font-semibold text-primary-900 hover:text-accent-600 transition-colors duration-250 line-clamp-2">
                              {product.title}
                            </h3>
                          </Link>
                          {product.author && (
                            <p className="text-sm text-primary-600 mt-1">
                              by {product.author}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-accent-600 mt-2">
                          ${product.price?.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => handleRemoveItem(product._id)}
                          className="p-2 text-primary-600 hover:text-accent-600 hover:bg-neutral-50 rounded-lg transition-colors duration-250"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} strokeWidth={1.5} />
                        </button>

                        <div className="flex items-center gap-1 rounded-lg border border-neutral-200">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(product._id, item.quantity - 1)
                            }
                            className="p-2 hover:bg-neutral-50 transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} strokeWidth={1.5} />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm text-primary-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(product._id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-neutral-50 transition-colors duration-250"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} strokeWidth={1.5} />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-primary-900">
                          ${(product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <button
                  onClick={handleClear}
                  className="text-sm font-medium text-primary-600 hover:text-accent-600 transition-colors duration-250"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-card h-fit lg:sticky lg:top-28">
            <h2 className="mb-6 text-xl font-bold text-primary-900">Order Summary</h2>

            <div className="space-y-4 border-b border-neutral-200 pb-6">
              <div className="flex justify-between">
                <span className="text-primary-600">Subtotal</span>
                <span className="font-semibold text-primary-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-600">Shipping</span>
                <span className="font-semibold text-primary-900">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-600">Estimated Tax</span>
                <span className="font-semibold text-primary-900">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200 flex justify-between items-baseline">
              <span className="text-primary-600">Total</span>
              <span className="text-2xl font-bold text-accent-600">${finalTotal.toFixed(2)}</span>
            </div>

            <button className="mt-8 w-full rounded-lg bg-accent-600 py-3.5 font-semibold text-white transition-all duration-250 hover:bg-accent-700 hover:shadow-elevated shadow-soft">
              Proceed to Checkout
            </button>

            <Link
              href="/"
              className="mt-4 block text-center text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors duration-250"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
