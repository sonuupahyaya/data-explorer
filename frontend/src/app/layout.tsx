import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'World of Books Discovery Platform',
  description: 'Discover, explore, and find books from World of Books with powerful search and recommendations.',
  keywords:
    'books, discovery, world of books, search, recommendations, fiction, bestsellers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <a href="/" className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001c0 5.591 3.824 10.29 9 11.622m0-13c5.5 0 10 4.745 10 10.748 0 5.592-3.824 10.29-9 11.623" />
                  </svg>
                  <span className="hidden sm:inline">World of Books</span>
                </a>

                <nav className="hidden lg:flex items-center gap-8">
                   <a href="/" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
                     Home
                   </a>
                   <a href="/search" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
                     Search
                   </a>
                   <a href="/about" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
                     About
                   </a>
                   <a href="/contact" className="text-slate-600 hover:text-blue-600 transition font-medium text-sm">
                     Contact
                   </a>
                 </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-br from-slate-900 to-slate-800 border-t border-slate-700/50 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-white">About</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    World of Books Discovery Platform provides powerful search and discovery tools.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4 text-white">Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="/" className="text-slate-300 hover:text-blue-400 transition">
                        Home
                      </a>
                    </li>
                    <li>
                      <a href="/search" className="text-slate-300 hover:text-blue-400 transition">
                        Search
                      </a>
                    </li>
                    <li>
                      <a href="/about" className="text-slate-300 hover:text-blue-400 transition">
                        About
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                   <h3 className="font-bold text-lg mb-4 text-white">Documentation</h3>
                   <ul className="space-y-2 text-sm">
                     <li>
                       <a
                         href="http://localhost:3001/api/docs"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-slate-300 hover:text-blue-400 transition"
                       >
                         API Docs
                       </a>
                     </li>
                   </ul>
                 </div>
                <div>
                  <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
                  <p className="text-slate-300 text-sm">Have questions?</p>
                  <a
                    href="/contact"
                    className="text-blue-400 hover:text-blue-300 transition font-semibold text-sm mt-2 inline-block flex items-center gap-1"
                  >
                    Contact Us
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400 text-sm">
                <p>&copy; 2024 World of Books Discovery Platform. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
