'use client';

export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card">
      {/* Image Skeleton */}
      <div className="aspect-[3/4] w-full bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />

      {/* Content Skeleton */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-3 w-1/2 rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
        </div>

        {/* Author */}
        <div className="h-3 w-2/5 rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />

        {/* Rating */}
        <div className="h-3 w-1/3 rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />

        {/* Price */}
        <div className="pt-2 h-5 w-1/4 rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />

        {/* Button */}
        <div className="mt-3 h-9 w-full rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}
