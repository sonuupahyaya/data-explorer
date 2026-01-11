'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      // In a real app, this would call the backend API
      // For now, show loading state
      setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 1000);
    }
  }, [query]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Search Results</h1>
        {query && <p className="text-gray-600">Results for "{query}"</p>}
      </div>

      {/* Search Form */}
      <form className="relative w-full max-w-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books by title, author..."
            defaultValue={query}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            aria-label="Search"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-96 w-full rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : results && results.length > 0 ? (
        <>
          <p className="text-gray-600">Found {results.length} books</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product: any) => (
              <a
                key={product._id}
                href={`/product/${product._id}`}
                className="group"
              >
                <div className="bg-gray-100 rounded-lg overflow-hidden h-64 relative mb-4 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
                <h3 className="font-semibold group-hover:text-blue-600 transition line-clamp-2 mb-1">
                  {product.title}
                </h3>
              </a>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-gray-100 p-12 rounded-lg text-center text-gray-600">
          <p className="text-lg">
            {query ? 'No books found matching your search' : 'Enter a search term to find books'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
