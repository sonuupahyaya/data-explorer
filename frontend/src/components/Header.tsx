'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="hidden sm:inline">World of Books</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 mx-4 max-w-2xl hidden md:block">
            <SearchBar />
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
              Home
            </Link>
            <Link href="/search" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
              Search
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
              About
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
              Contact
            </Link>
            <Link href="/readme" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
              README
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-slate-200 py-4 space-y-3">
            <Link
              href="/"
              className="block text-slate-600 hover:text-blue-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/search"
              className="block text-slate-600 hover:text-blue-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <Link
              href="/about"
              className="block text-slate-600 hover:text-blue-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-slate-600 hover:text-blue-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/readme"
              className="block text-slate-600 hover:text-blue-600 transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              README
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
