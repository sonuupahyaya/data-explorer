'use client';

import { ReactNode } from 'react';

/**
 * Providers wrapper for client-side contexts
 * Using minimal setup to avoid Next.js App Router issues
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
