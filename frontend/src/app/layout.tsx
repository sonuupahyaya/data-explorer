import type { Metadata } from 'next';
import { Header, Footer } from '@/components';
import { ThemeProvider } from '@/components/ThemeProvider';
import { QueryProvider } from '@/components/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookVault - Premium Book Discovery',
  description: 'Discover an amazing collection of premium books from the world\'s finest publishers. Luxury reading at your fingertips.',
  keywords: 'books, reading, bookstore, premium books, rare books',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white dark:bg-neutral-950 text-primary-900 dark:text-neutral-50 transition-colors duration-300">
        <ThemeProvider>
          <QueryProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
