'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">About</h3>
            <p className="text-gray-600 text-sm">
              World of Books Discovery Platform provides powerful search and discovery tools for browsing books from World of Books.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-blue-600 transition">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Documentation */}
          <div>
            <h3 className="font-bold text-lg mb-4">Documentation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/readme" className="text-gray-600 hover:text-blue-600 transition">
                  README
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:3001/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p className="text-gray-600 text-sm">
              Have questions? Get in touch with us!
            </p>
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm mt-2 inline-block flex items-center gap-1"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-8 text-center text-gray-600 text-sm">
          <p>&copy; 2024 World of Books Discovery Platform. All rights reserved.</p>
          <p>Books sourced from <a href="https://www.worldofbooks.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">worldofbooks.com</a></p>
        </div>
      </div>
    </footer>
  );
}
