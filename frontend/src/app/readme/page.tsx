'use client';

export default function ReadmePage() {
  return (
    <div className="w-full">
      <section className="border-b border-gray-200 bg-primary-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-4xl font-bold text-primary-900">Technical Information</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-base max-w-none">
            <h2 className="text-2xl font-bold text-primary-900">
              How This Works
            </h2>

            <h3 className="mt-8 text-xl font-bold text-primary-900">
              Data Source
            </h3>
            <p className="mt-4 text-primary-700">
              This platform aggregates book data from the World of Books international charity
              bookshops. The collection includes millions of books across all genres and
              categories.
            </p>

            <h3 className="mt-8 text-xl font-bold text-primary-900">
              Technology Stack
            </h3>
            <div className="mt-4 space-y-2 text-primary-700">
              <p>
                <strong>Frontend:</strong> Next.js 14 with React 18, TypeScript, and Tailwind CSS
              </p>
              <p>
                <strong>Backend:</strong> NestJS with Node.js
              </p>
              <p>
                <strong>Data Fetching:</strong> SWR for client-side caching and revalidation
              </p>
              <p>
                <strong>Images:</strong> Proxied through backend for optimization
              </p>
            </div>

            <h3 className="mt-8 text-xl font-bold text-primary-900">
              Core Features
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 text-primary-700">
              <li>Browse books by category</li>
              <li>Search functionality across the collection</li>
              <li>Detailed product pages with metadata</li>
              <li>Rating and review system</li>
              <li>Local storage for browsing history</li>
              <li>Responsive design for mobile and desktop</li>
              <li>WCAG AA compliant accessibility</li>
            </ul>

            <h3 className="mt-8 text-xl font-bold text-primary-900">
              API Endpoints
            </h3>
            <div className="mt-4 space-y-4 rounded-lg bg-gray-50 p-6 font-mono text-sm text-primary-700">
              <div>
                <p className="font-bold">GET /api/categories</p>
                <p className="mt-1">Fetch all available book categories</p>
              </div>
              <div>
                <p className="font-bold">GET /api/books</p>
                <p className="mt-1">Fetch books with optional filters (category, search, limit, offset)</p>
              </div>
              <div>
                <p className="font-bold">GET /api/book/:id</p>
                <p className="mt-1">Fetch a specific book's details</p>
              </div>
              <div>
                <p className="font-bold">GET /api/image</p>
                <p className="mt-1">Proxy and optimize book cover images</p>
              </div>
            </div>

            <h3 className="mt-8 text-xl font-bold text-primary-900">
              User Experience
            </h3>
            <p className="mt-4 text-primary-700">
              The platform is designed with user experience in mind:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-primary-700">
              <li>Persistent browsing history across sessions</li>
              <li>Fast page transitions and loading states</li>
              <li>Clean, intuitive navigation</li>
              <li>Skeleton loaders during data fetching</li>
              <li>Optimized images for fast loading</li>
            </ul>

            <h3 className="mt-8 text-xl font-bold text-primary-900">
              Accessibility
            </h3>
            <p className="mt-4 text-primary-700">
              We're committed to making this platform accessible to everyone:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-primary-700">
              <li>Semantic HTML structure</li>
              <li>ARIA labels and attributes</li>
              <li>Keyboard navigation support</li>
              <li>Color contrast compliance</li>
              <li>Responsive design for all devices</li>
            </ul>

            <h3 className="mt-8 text-xl font-bold text-primary-900">
              Getting Started
            </h3>
            <p className="mt-4 text-primary-700">
              Start by browsing our collection:
            </p>
            <ol className="mt-4 list-inside list-decimal space-y-2 text-primary-700">
              <li>Explore books by category</li>
              <li>Use search to find specific titles</li>
              <li>Click on any book to see detailed information</li>
              <li>Keep track of your browsing history</li>
            </ol>

            <div className="mt-12 rounded-lg border-2 border-accent-600 p-8 bg-accent-50">
              <p className="text-lg font-semibold text-accent-900">
                Have questions? Visit our{' '}
                <a href="/contact" className="underline hover:text-accent-700">
                  contact page
                </a>
                {' '}or check out the{' '}
                <a href="/about" className="underline hover:text-accent-700">
                  about section
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
