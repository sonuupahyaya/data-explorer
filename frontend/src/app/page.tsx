'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { getBooks, getCategories } from '@/lib/api';
import { ProductGrid } from '@/components';
import { storageManager } from '@/lib/storage';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

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

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useSWR('categories', getCategories, {
    dedupingInterval: 0,
    revalidateOnFocus: false,
  });

  const { data: booksData, isLoading: booksLoading } = useSWR('featured-books', () => getBooks({ limit: 12 }), {
    dedupingInterval: 0,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : [];
  const products: Product[] = booksData?.data || [];

  return (
    <div className="w-full">
      {/* ========== HERO SECTION ========== */}
      <section className="bg-gradient-hero relative overflow-hidden py-20 md:py-32 lg:py-40">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr from-teal-300 to-transparent blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="container-narrow relative z-10">
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex justify-center">
              <div className="badge-primary">
                <Sparkles size={16} />
                Discover thousands of books
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-hero">
              Your Gateway to
              <span className="block text-gradient">Endless Reading</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto">
              Explore thousands of carefully curated books from World of Books. Find your next favorite read with
              advanced search and discover hidden literary treasures.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/category/all" className="btn-primary">
                Browse All Books
                <ArrowRight size={18} strokeWidth={2} />
              </Link>
              <Link href="/about" className="btn-secondary">
                Learn Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES SECTION ========== */}
      {categories.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="container-narrow">
            <div className="space-y-16">
              {/* Section Header */}
              <div className="space-y-4 text-center max-w-2xl mx-auto">
                <h2 className="text-section-title">Browse by Category</h2>
                <p className="text-muted">Explore our collection organized by genre and literary interest</p>
              </div>

              {/* Categories Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categories.slice(0, 4).map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`}>
                    <div className="card-premium p-8 h-full flex flex-col justify-between hover-lift">
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-950 dark:to-teal-950 flex items-center justify-center text-lg">
                          {['📚', '🔍', '✨', '🌟'][0]}
                        </div>
                        <h3 className="text-card-title text-accent hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                          {category.name}
                        </h3>
                      </div>
                      <p className="text-subtle flex items-center gap-2 group">
                        Explore
                        <ArrowRight
                          size={16}
                          strokeWidth={2}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* View All Link */}
              {categories.length > 4 && (
                <div className="pt-4 text-center">
                  <Link href="/category/all" className="btn-ghost">
                    View All Categories
                    <ArrowRight size={18} strokeWidth={2} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========== FEATURED BOOKS SECTION ========== */}
      <section
        className="py-20 md:py-32 relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at top left, #1A1F2B, #0B0D10 70%)' }}
      >
        <div className="container-narrow">
          <div className="space-y-16 relative z-10">
            {/* Section Header */}
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <h2
                className="text-section-title text-white"
                style={{ textShadow: '0 2px 16px rgba(59, 164, 255, 0.15)' }}
              >
                Featured Collection
              </h2>
              <p className="text-muted">Handpicked selections from our carefully curated library</p>
            </div>

            {/* Products Grid */}
            <ProductGrid products={products} isLoading={booksLoading} columns={4} />

            {/* View All Button */}
            <div className="pt-8 text-center">
              <Link href="/category/all" className="btn-secondary">
                View All Books
                <ArrowRight size={18} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== VIEWING HISTORY SECTION ========== */}
      {isMounted && <ViewingHistory />}

      {/* ========== FINAL CTA SECTION ========== */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-700 dark:to-teal-700 py-16 md:py-24">
        <div className="container-narrow text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Start Reading?</h2>
          <p className="text-lg text-blue-50 max-w-2xl mx-auto">
            Join thousands of readers discovering their next favorite book. Our collection spans every genre imaginable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/category/all" className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
              Start Exploring
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white text-white font-semibold px-8 py-3 hover:bg-white hover:bg-opacity-10 transition-all duration-250"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ViewingHistory() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(storageManager.getHistory().slice(0, 4));
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="py-20 md:py-32">
      <div className="container-narrow">
        <div className="space-y-16">
          {/* Section Header */}
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <h2 className="text-section-title">Continue Browsing</h2>
            <p className="text-muted">Recently viewed items</p>
          </div>

          {/* History Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {history.map((item) => (
              <Link key={item.id} href={item.type === 'product' ? `/product/${item.id}` : `/category/${item.id}`}>
                <div className="card-premium p-8 h-full flex flex-col justify-between hover-lift">
                  <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">{item.type}</p>
                  <h3 className="line-clamp-2 text-card-title text-accent hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-3">
                    {item.title}
                  </h3>
                  <p className="text-subtle flex items-center gap-2 group">
                    View
                    <ArrowRight
                      size={14}
                      strokeWidth={2}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
