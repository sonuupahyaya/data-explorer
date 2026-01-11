'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useSearchAutocomplete } from '@/lib/hooks';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const { suggestions } = useSearchAutocomplete(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowAutocomplete(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowAutocomplete(false);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Search books by title, author..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAutocomplete(true);
          }}
          onFocus={() => query && setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur transition"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {showAutocomplete && suggestions && ((suggestions as any)?.titles?.length > 0 || (suggestions as any)?.authors?.length > 0) && (
          <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-xl mt-2 shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-sm">
            {(suggestions as any).titles && (suggestions as any).titles.length > 0 && (
              <>
                <div className="px-4 py-3 font-semibold text-sm text-slate-600 bg-slate-50/80 border-b border-slate-200">
                  Titles
                </div>
                {(suggestions as any).titles.slice(0, 5).map((title: string) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleSelectSuggestion(title)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition text-slate-700 flex items-center gap-2"
                  >
                    <BookOpenIcon className="w-4 h-4 text-slate-400" />
                    {title}
                  </button>
                ))}
              </>
            )}
            {(suggestions as any).authors && (suggestions as any).authors.length > 0 && (
              <>
                <div className="px-4 py-3 font-semibold text-sm text-slate-600 bg-slate-50/80 border-b border-slate-200">
                  Authors
                </div>
                {(suggestions as any).authors.slice(0, 5).map((author: string) => (
                  <button
                    key={author}
                    type="button"
                    onClick={() => handleSelectSuggestion(author)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition text-slate-700 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {author}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
