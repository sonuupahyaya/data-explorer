'use client';

interface SkeletonLoaderProps {
  height?: string;
  width?: string;
  count?: number;
  rounded?: boolean;
}

export default function SkeletonLoader({
  height = 'h-12',
  width = 'w-full',
  count = 1,
  rounded = true,
}: SkeletonLoaderProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`${width} ${height} ${rounded ? 'rounded-lg' : ''} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse`}
        />
      ))}
    </>
  );
}
