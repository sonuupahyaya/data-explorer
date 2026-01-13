/**
 * Image URL Utility
 * 
 * Converts raw image URLs from external sources (e.g., WorldOfBooks.com)
 * into proxied URLs that bypass CORS and hotlink blocking.
 * 
 * This is essential for e-commerce platforms that protect their images.
 */

/**
 * Convert a raw external image URL to a proxied URL
 * 
 * Usage:
 * const proxyUrl = proxyImageUrl('https://www.worldofbooks.com/images/book.jpg');
 * // Returns: http://localhost:5000/api/image?url=https%3A%2F%2Fwww.worldofbooks.com%2Fimages%2Fbook.jpg
 * 
 * @param imageUrl - The original image URL from the external source
 * @param proxyHost - The proxy server host (defaults to current backend)
 * @returns The proxied image URL safe for frontend use
 */
export function proxyImageUrl(imageUrl: string, proxyHost: string = getProxyHost()): string {
  if (!imageUrl) {
    return '';
  }

  // If it's already a proxy URL, return as-is
  if (imageUrl.includes('/api/image?')) {
    return imageUrl;
  }

  // Encode the original URL
  const encodedUrl = encodeURIComponent(imageUrl);

  // Return the proxied URL
  return `${proxyHost}/api/image?url=${encodedUrl}`;
}

/**
 * Get the proxy host based on environment
 * 
 * In production, this should be the actual backend URL (e.g., https://api.example.com)
 * In development, this will be http://localhost:5000 or the configured port
 */
function getProxyHost(): string {
  // Check if we have an explicit proxy host in env
  if (process.env.IMAGE_PROXY_HOST) {
    return process.env.IMAGE_PROXY_HOST;
  }

  // In development, use localhost with API_PORT (matches backend)
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.API_PORT || process.env.BACKEND_PORT || 3001;
    return `http://localhost:${port}`;
  }

  // In production, use the backend URL from env or API_URL
  return process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3001';
}

/**
 * Convert a list of image URLs to proxied URLs
 * 
 * @param imageUrls - Array of image URLs
 * @returns Array of proxied image URLs
 */
export function proxyImageUrls(imageUrls: string[]): string[] {
  return imageUrls.map((url) => proxyImageUrl(url));
}

/**
 * Check if a URL is already proxied
 * 
 * @param imageUrl - The URL to check
 * @returns true if the URL is already proxied
 */
export function isProxiedUrl(imageUrl: string): boolean {
  return imageUrl.includes('/api/image?');
}

/**
 * Extract the original URL from a proxied URL
 * 
 * Usage:
 * const original = extractOriginalUrl('http://localhost:5000/api/image?url=https%3A%2F%2F...');
 * // Returns: https://www.worldofbooks.com/images/book.jpg
 * 
 * @param proxiedUrl - The proxied URL
 * @returns The original image URL, or empty string if invalid
 */
export function extractOriginalUrl(proxiedUrl: string): string {
  try {
    const url = new URL(proxiedUrl);
    const originalUrl = url.searchParams.get('url');
    return originalUrl ? decodeURIComponent(originalUrl) : '';
  } catch {
    return '';
  }
}

/**
 * Batch convert multiple image URLs in an object
 * 
 * Useful for converting entire product objects:
 * 
 * Usage:
 * const product = { title: 'Book', image_url: 'https://...' };
 * const proxied = proxyImageUrls(product, ['image_url']);
 * 
 * @param obj - The object containing image URLs
 * @param imageFields - Array of field names that contain image URLs
 * @returns A new object with proxied image URLs
 */
export function proxyImageFields<T extends Record<string, any>>(
  obj: T,
  imageFields: (keyof T)[],
): T {
  const result = { ...obj };

  for (const field of imageFields) {
    const value = result[field];
    if (typeof value === 'string') {
      result[field] = proxyImageUrl(value) as any;
    }
  }

  return result;
}

/**
 * Batch convert image URLs in an array of objects
 * 
 * Usage:
 * const products = [
 *   { title: 'Book 1', image: 'https://...' },
 *   { title: 'Book 2', image: 'https://...' },
 * ];
 * const proxied = proxyImageFieldsInArray(products, ['image']);
 * 
 * @param objects - Array of objects
 * @param imageFields - Array of field names that contain image URLs
 * @returns New array with proxied image URLs
 */
export function proxyImageFieldsInArray<T extends Record<string, any>>(
  objects: T[],
  imageFields: (keyof T)[],
): T[] {
  return objects.map((obj) => proxyImageFields(obj, imageFields));
}
