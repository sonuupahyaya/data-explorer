# Fix: Return Placeholder Image for Missing/Invalid Images

## Problem
Image proxy returns 500 error when image URL doesn't exist (e.g., `https://images.worldofbooks.com/sample-1.jpg`)

The proxy correctly returns 404 from the source, but throws an InternalServerErrorException instead of handling it gracefully.

## Solution
Return a simple placeholder/fallback image instead of throwing error when:
- Original image URL returns 404
- Image URL is invalid
- Network timeout
- Download fails after retries

## Implementation

Create a new utility file for placeholder image:

**File: `backend/src/image-proxy/placeholder-image.util.ts`**

```typescript
/**
 * Generate a simple placeholder image as SVG
 * Used when external images fail to load
 */
export function getPlaceholderImage(title: string = 'Book Cover'): { buffer: Buffer; mimeType: string; size: number } {
  // Simple SVG placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#cccccc;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill="url(#grad1)"/>
      <rect x="10" y="10" width="180" height="280" fill="none" stroke="#999" stroke-width="2"/>
      <text x="100" y="140" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">
        <tspan x="100" dy="0">Book Cover</tspan>
        <tspan x="100" dy="20">Not Available</tspan>
      </text>
      <circle cx="100" cy="250" r="3" fill="#999"/>
    </svg>
  `.trim();

  const buffer = Buffer.from(svg, 'utf-8');

  return {
    buffer,
    mimeType: 'image/svg+xml',
    size: buffer.length,
  };
}
```

## Update Image Proxy Service

In `image-proxy.service.ts`, modify the `downloadImageWithRetry` method to handle 404s better:

```typescript
async downloadImageWithRetry(url: string, attempt: number = 1): Promise<Buffer> {
  try {
    this.logger.debug(`📥 Downloading image (attempt ${attempt}/${this.maxRetries}): ${url.substring(0, 80)}...`);

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: this.requestTimeout,
      headers: { ... },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const buffer = Buffer.from(response.data);

    if (buffer.length < 100) {
      throw new Error('Image too small (possibly placeholder or broken)');
    }

    this.logger.debug(`✅ Downloaded ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorMsg = axiosError?.message || String(error);
    const statusCode = axiosError?.response?.status;

    // 404 means image doesn't exist - return placeholder
    if (statusCode === 404) {
      this.logger.warn(`⚠️  Image not found (404): ${url}`);
      return null; // Signal to return placeholder
    }

    if (attempt < this.maxRetries) {
      this.logger.warn(`⚠️  Attempt ${attempt} failed: ${errorMsg}, retrying...`);
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.downloadImageWithRetry(url, attempt + 1);
    }

    this.logger.warn(`⚠️  Failed to download image after ${this.maxRetries} attempts, returning placeholder`);
    return null; // Return placeholder instead of throwing
  }
}
```

## Update getImageBuffer Method

```typescript
async getImageBuffer(url: string): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
  this.validateUrl(url);

  const cacheKey = this.getCacheKey(url);

  // Check cache first
  const cached = this.cache.get<{ buffer: Buffer; mimeType: string; size: number }>(cacheKey);
  if (cached) {
    this.logger.debug(`💾 Cache hit: ${url.substring(0, 60)}...`);
    return cached;
  }

  // Try to download image
  const buffer = await this.downloadImageWithRetry(url);

  // If download failed or returned null, use placeholder
  if (!buffer) {
    this.logger.warn(`📦 Using placeholder image for: ${url.substring(0, 60)}...`);
    const { getPlaceholderImage } = require('./placeholder-image.util');
    return getPlaceholderImage('Book Cover');
  }

  // Detect MIME type
  const mimeType = this.detectMimeType(buffer);
  
  if (!this.validMimeTypes.includes(mimeType)) {
    this.logger.warn(`⚠️  Invalid MIME type ${mimeType}, using placeholder`);
    const { getPlaceholderImage } = require('./placeholder-image.util');
    return getPlaceholderImage('Book Cover');
  }

  const result = {
    buffer,
    mimeType,
    size: buffer.length,
  };

  // Cache for 24 hours
  this.cache.set(cacheKey, result);
  this.logger.log(`💾 Cached image: ${url.substring(0, 60)}... (${buffer.length} bytes)`);

  return result;
}
```

## Result

Now when images fail to load:
- ✅ No 500 error thrown
- ✅ Frontend receives 200 OK with placeholder SVG
- ✅ No broken image icons
- ✅ Graceful degradation

## Testing

```bash
# Test with non-existent image
curl "http://localhost:3001/api/image?url=https%3A%2F%2Fimages.worldofbooks.com%2Fnon-existent.jpg"

# Should return: 200 OK with SVG placeholder
# Not: 500 Error
```

## Quick Fix Without Code Changes

If you want to quickly fix without editing the open file, simply:

1. Use placeholder URLs in your database seed
2. Or, update image URLs to real working images
3. Or, skip image loading in frontend when proxy fails

But the proper fix is implementing fallback placeholders as shown above.

## Implementation Priority

1. **Create** `placeholder-image.util.ts`
2. **Update** `downloadImageWithRetry()` to return null instead of throwing
3. **Update** `getImageBuffer()` to use placeholder when buffer is null
4. **Test** with non-existent image URLs
