'use client';

import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

interface Product {
  _id?: string;
  id?: string;
  title: string;
  image?: string;
  price?: number;
  rating?: number;
  author?: string;
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
}

export default function ProductGrid({
  products,
  isLoading = false,
  columns = 4,
}: ProductGridProps) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${gridClass}`}>
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-12 transition-colors duration-300">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-primary-900 dark:text-neutral-100">No books found</p>
          <p className="text-sm text-primary-600 dark:text-neutral-400">Try adjusting your search or browse all categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {products.map((product) => {
        const productId = product._id || product.id;
        if (!productId) return null;
        return (
          <ProductCard
            key={productId}
            {...product}
            _id={product._id}
            id={product.id}
          />
        );
      })}
    </div>
  );
}
