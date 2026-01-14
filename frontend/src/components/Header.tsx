'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { useCart, useSaved } from '@/hooks';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: savedCount } = useSaved();

  const badgeCount = (count: number) => (
    count > 0 && (
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white">
        {Math.min(count, 99)}
      </span>
    )
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 transition-colors duration-300">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-300">
              BookVault
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden flex-1 max-w-md lg:block">
            <SearchBar />
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              href="/about"
              className="text-sm font-medium text-primary-600 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-primary-600 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250"
            >
              Contact
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              title="Shopping cart"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {badgeCount(itemCount)}
            </Link>

            {/* Saved Icon */}
            <Link
              href="/saved"
              className="relative p-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              title="Saved items"
            >
              <Heart size={20} strokeWidth={1.5} />
              {badgeCount(savedCount)}
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/cart" className="relative p-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white">
                  {Math.min(itemCount, 9)}
                </span>
              )}
            </Link>
            <Link href="/saved" className="relative p-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors">
              <Heart size={20} strokeWidth={1.5} />
              {savedCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white">
                  {Math.min(savedCount, 9)}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-4 lg:hidden">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 space-y-2 border-t border-neutral-200 dark:border-neutral-800 pt-4 lg:hidden animate-slide-up">
            <Link
              href="/about"
              className="block px-4 py-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
