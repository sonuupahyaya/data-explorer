'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent">
                BookVault
              </h2>
              <p className="text-sm text-primary-600 dark:text-neutral-400 leading-relaxed">
                Your gateway to luxury reading. Explore thousands of premium books from our curated collection.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary-900 dark:text-neutral-100">Navigation</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-primary-600 dark:text-neutral-400 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-primary-600 dark:text-neutral-400 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-primary-600 dark:text-neutral-400 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary-900 dark:text-neutral-100">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="text-primary-600 dark:text-neutral-400 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-600 dark:text-neutral-400 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary-900 dark:text-neutral-100">Premium Quality</h3>
            <p className="text-sm text-primary-600 dark:text-neutral-400 leading-relaxed">
              Crafted with premium design principles. Every book chosen for quality, every detail designed for elegance.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 border-t border-neutral-200 dark:border-neutral-800" />

        {/* Copyright */}
        <div className="text-center text-sm text-primary-600 dark:text-neutral-400">
          <p>&copy; {currentYear} BookVault. All rights reserved. Premium book discovery, refined.</p>
        </div>
      </div>
    </footer>
  );
}
