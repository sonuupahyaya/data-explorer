'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Filter, Star, Database, Smartphone, ArrowRight, Zap, MessageSquare, PoundSterling } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  author: string;
  price: number;
  currency: string;
  image_url?: string;
  rating_avg?: number;
  reviews_count?: number;
  source_url?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'http://localhost:3001/api/products?sample=true&limit=50'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.data || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white rounded-2xl p-16 text-center shadow-2xl">
        <h1 className="text-6xl font-bold mb-6 leading-tight">Discover Your Next Read</h1>
        <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed">
          Explore thousands of books from World of Books with powerful search, filtering, and intelligent recommendations
        </p>
        <a
          href="/search"
          className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold hover:bg-slate-50 transition shadow-lg hover:shadow-xl"
        >
          Start Searching
        </a>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="text-4xl font-bold mb-10">Featured Books</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gradient-to-b from-slate-200 to-slate-300 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50/80 backdrop-blur border border-red-200 rounded-xl p-8 text-red-900">
            <p className="font-semibold text-lg">Failed to load products</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-amber-50/80 backdrop-blur border border-amber-200 rounded-xl p-8 text-amber-900 text-center">
            <p className="font-semibold text-lg">No products available yet</p>
            <p className="text-sm mt-2">Run the seed script to populate sample data: npm run seed:sample-products</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 12).map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product._id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl overflow-hidden transition duration-300 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(product.title);
                        }}
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-slate-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2">by {product.author}</p>

                    {/* Rating */}
                    {product.rating_avg && product.rating_avg > 0 && (
                      <div className="flex items-center mt-3 gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                        <span className="text-xs text-slate-600">
                          {product.rating_avg.toFixed(1)} ({product.reviews_count})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <PoundSterling className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" aria-hidden="true" />
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {product.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{product.currency}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Products Button */}
            <div className="mt-10 text-center">
              <Link
                href="/search"
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-lg font-semibold hover:shadow-xl transition shadow-lg"
              >
                View All {pagination?.total || 0} Products
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Browse by Category */}
      <section>
        <h2 className="text-4xl font-bold mb-10">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/category/fiction"
            className="p-8 bg-white border border-slate-200 rounded-xl hover:shadow-xl hover:border-blue-400 transition block group hover:-translate-y-1"
          >
            <BookOpen className="w-8 h-8 mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition">
              Fiction
            </h3>
            <p className="text-slate-600 mb-5">Explore fiction novels and stories</p>
            <p className="text-blue-600 font-semibold flex items-center gap-1">Explore <ArrowRight className="w-4 h-4" /></p>
          </a>

          <a
            href="/category/non-fiction"
            className="p-8 bg-white border border-slate-200 rounded-xl hover:shadow-xl hover:border-blue-400 transition block group hover:-translate-y-1"
          >
            <Filter className="w-8 h-8 mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition">
              Non-Fiction
            </h3>
            <p className="text-slate-600 mb-5">Discover educational and informative books</p>
            <p className="text-blue-600 font-semibold flex items-center gap-1">Explore <ArrowRight className="w-4 h-4" /></p>
          </a>

          <a
            href="/search"
            className="p-8 bg-white border border-slate-200 rounded-xl hover:shadow-xl hover:border-blue-400 transition block group hover:-translate-y-1"
          >
            <Search className="w-8 h-8 mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition">
              All Categories
            </h3>
            <p className="text-slate-600 mb-5">Search across all books and categories</p>
            <p className="text-blue-600 font-semibold flex items-center gap-1">Browse <ArrowRight className="w-4 h-4" /></p>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-16 rounded-2xl text-white">
        <h2 className="text-4xl font-bold mb-12 text-center">Why Use Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/10 backdrop-blur rounded-xl border border-white/10 hover:border-blue-400/50 transition">
            <Search className="w-12 h-12 mb-4 mx-auto text-blue-400" />
            <h3 className="text-xl font-semibold mb-3">Advanced Search</h3>
            <p className="text-slate-200 leading-relaxed">
              Full-text search across thousands of books from World of Books with intelligent autocomplete
            </p>
          </div>
          <div className="text-center p-6 bg-white/10 backdrop-blur rounded-xl border border-white/10 hover:border-blue-400/50 transition">
            <Filter className="w-12 h-12 mb-4 mx-auto text-blue-400" />
            <h3 className="text-xl font-semibold mb-3">Smart Filtering</h3>
            <p className="text-slate-200 leading-relaxed">Filter by price, rating, author, and more to find exactly what you need</p>
          </div>
          <div className="text-center p-6 bg-white/10 backdrop-blur rounded-xl border border-white/10 hover:border-blue-400/50 transition">
            <Zap className="w-12 h-12 mb-4 mx-auto text-yellow-400" />
            <h3 className="text-xl font-semibold mb-3">Real-Time Data</h3>
            <p className="text-slate-200 leading-relaxed">
              Live scraping from World of Books keeps our data fresh and current
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-2xl p-16 text-center shadow-2xl">
        <h2 className="text-4xl font-bold mb-6">Ready to Find Your Next Read?</h2>
        <p className="text-lg opacity-95 mb-10">Start exploring thousands of books with our powerful discovery platform</p>
        <a
          href="/search"
          className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold hover:bg-slate-50 transition shadow-lg hover:shadow-xl"
        >
          Search Now
        </a>
      </section>
    </div>
  );
}
