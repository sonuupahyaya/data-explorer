'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  showHomeLink?: boolean;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading the content.',
  showHomeLink = true,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
        <AlertCircle size={32} className="text-red-600" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-primary-900 mb-2">
        {title}
      </h2>
      <p className="text-center text-primary-600 mb-8 max-w-md">
        {message}
      </p>
      {showHomeLink && (
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 transition-all duration-250 hover:shadow-elevated shadow-soft"
        >
          Back to Home
          <ArrowRight size={18} strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}
