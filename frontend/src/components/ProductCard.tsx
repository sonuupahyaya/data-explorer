import Link from 'next/link';
import Image from 'next/image';

interface ProductProps {
  id: string;
  title: string;
  author: string;
  price: number;
  currency: string;
  image_url: string;
  rating_avg?: number;
  reviews_count?: number;
}

export default function ProductCard({
  id,
  title,
  author,
  price,
  currency,
  image_url,
  rating_avg = 0,
  reviews_count = 0,
}: ProductProps) {
  return (
    <Link href={`/product/${id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
        <div className="relative h-48 w-full bg-gray-200">
          {image_url && (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23ddd" width="200" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo image%3C/text%3E%3C/svg%3E';
              }}
            />
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg line-clamp-2 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm mb-2">{author}</p>

          <div className="flex justify-between items-center mb-3">
            <span className="text-xl font-bold text-secondary">
              {currency} {price.toFixed(2)}
            </span>
            {rating_avg > 0 && (
              <div className="text-sm">
                <span className="text-yellow-500">★ {rating_avg.toFixed(1)}</span>
                <span className="text-gray-500"> ({reviews_count})</span>
              </div>
            )}
          </div>

          <button className="w-full bg-secondary text-white py-2 rounded hover:bg-green-700 transition">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
