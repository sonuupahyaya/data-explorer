'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Search books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800/80 backdrop-blur-sm px-4 py-3 pl-10 text-sm text-primary-900 dark:text-neutral-100 placeholder-primary-500 dark:placeholder-neutral-400 transition-all duration-250 focus:border-accent-600 dark:focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-accent-600/30 dark:focus:ring-cyan-500/40 dark:focus:bg-neutral-800 dark:focus:shadow-lg dark:focus:shadow-cyan-500/10"
        />
        <Search
          size={18}
          strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 dark:text-neutral-400 pointer-events-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary-500 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-neutral-200 transition-colors duration-250"
            aria-label="Clear search"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </form>
  );
}
