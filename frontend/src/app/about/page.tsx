'use client';

import {
  BookOpen,
  Search,
  Filter,
  Star,
  Database,
  Smartphone,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="space-y-6">
        <div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About Us
          </h1>
          <p className="text-2xl text-slate-600 font-light max-w-3xl">
            World of Books Discovery Platform
          </p>
        </div>
        <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
          Welcome to the World of Books Discovery Platform, a modern web application designed to make discovering books simple, fast, and enjoyable.
        </p>
        <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
          Our platform connects readers to real, live book listings from World of Books, allowing users to explore titles, authors, prices, and availability in one clean, easy-to-use interface.
        </p>
      </section>

      {/* Mission Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-200">
        <h2 className="text-4xl font-bold mb-6 text-slate-900">Our Mission</h2>
        <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
          We aim to remove friction from book discovery.
        </p>
        <p className="text-lg text-slate-700 leading-relaxed max-w-3xl mt-4">
          Instead of manually browsing multiple pages, our system uses intelligent web scraping, search, and caching to deliver up-to-date book data instantly, helping readers find what they want faster.
        </p>
      </section>

      {/* What We Offer */}
      <section className="space-y-8">
        <h2 className="text-4xl font-bold">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Globe, text: 'Live book data from worldofbooks.com' },
            { icon: Search, text: 'Advanced search across all scraped books' },
            { icon: Filter, text: 'Filters by price, rating, and author' },
            { icon: Star, text: 'Product pages with real cover images and metadata' },
            { icon: Database, text: 'Intelligent caching for fast performance' },
            { icon: Smartphone, text: 'Fully responsive design for mobile & desktop' },
            { icon: CheckCircle, text: 'WCAG AA–compliant accessibility' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition">
                <Icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <p className="text-slate-700 font-medium">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-4xl font-bold">How It Works</h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          When you browse a category or search for a book:
        </p>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Smart Caching', desc: 'Our backend checks whether fresh data already exists' },
            { step: '2', title: 'On-Demand Scraping', desc: 'If data is expired or missing, it triggers a live scrape' },
            { step: '3', title: 'Data Extraction', desc: 'Crawlee + Playwright extract books directly from World of Books' },
            { step: '4', title: 'Data Processing', desc: 'Results are validated, deduplicated, and stored in MongoDB' },
            { step: '5', title: 'Fast Delivery', desc: 'The frontend displays real products in milliseconds' },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {item.step}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-slate-600 mt-8 italic">
          This ensures accuracy without overloading the source website.
        </p>
      </section>

      {/* Performance */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-12 text-white">
        <h2 className="text-4xl font-bold mb-8">⚡ Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { metric: 'Cached API responses', value: '< 200ms' },
            { metric: 'Search results', value: '< 1 second' },
            { metric: 'Cache hit rate', value: '90%+' },
            { metric: 'Mobile optimization', value: '100%' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10">
              <p className="text-slate-300 text-sm mb-2">{item.metric}</p>
              <p className="text-3xl font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Source & Ethics */}
      <section className="bg-amber-50 rounded-2xl p-12 border border-amber-200">
        <h2 className="text-4xl font-bold mb-6 text-slate-900">Data Source & Ethics</h2>
        <p className="text-lg text-slate-700 mb-6 leading-relaxed">
          All data is sourced directly from{' '}
          <a
            href="https://www.worldofbooks.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-semibold hover:underline"
          >
            World of Books
          </a>
          . We follow responsible scraping practices including:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Rate limiting', 'Caching', 'Retry & backoff', 'Respect for robots.txt'].map((practice, idx) => (
            <li key={idx} className="flex items-center gap-3 text-slate-700">
              <span className="text-amber-600 text-xl">•</span>
              {practice}
            </li>
          ))}
        </ul>
        <p className="text-lg text-slate-700 mt-8">
          Our goal is to provide a great user experience without harming the source website.
        </p>
      </section>
    </div>
  );
}
