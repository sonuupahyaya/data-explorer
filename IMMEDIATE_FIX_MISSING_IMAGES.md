# Immediate Fix: Missing Image URLs (500 Error)

## Problem
The database has sample image URLs that don't actually exist:
```
❌ https://images.worldofbooks.com/sample-1.jpg
❌ https://images.worldofbooks.com/sample-2.jpg
```

These return 404 from the source, and the image proxy throws a 500 error instead of handling it.

## Solution 1: Use Real Image URLs (Recommended)

### Option A: Rescrape Real Data
```bash
cd backend
npm run build
npm run start:scrape  # If available
# Or manually run seed with real WorldOfBooks data
```

This will fetch actual books with real image URLs from `images.worldofbooks.com`

### Option B: Manually Update Database
If you have MongoDB running, update the image URLs:

```javascript
// In MongoDB Compass or mongosh
db.products.updateMany(
  { image_url: { $regex: "sample-[0-9]" } },
  { $unset: { image_url: "" } }  // Remove fake URLs
)

// Or set to empty string to skip images
db.products.updateMany(
  { image_url: { $regex: "sample-[0-9]" } },
  { $set: { image_url: "" } }
)
```

## Solution 2: Add Fallback Image Handler (Code Fix)

### Quick Fix in Image Proxy Service

Modify `backend/src/image-proxy/image-proxy.service.ts`:

In the `downloadImageWithRetry` catch block, instead of throwing on 404:

```typescript
catch (error) {
  const axiosError = error as AxiosError;
  const statusCode = axiosError?.response?.status;
  
  // ✅ NEW: Handle 404 gracefully
  if (statusCode === 404) {
    this.logger.warn(`⚠️  Image not found (404): ${url}`);
    // Return null or a placeholder instead of throwing
    return Buffer.from(''); // Will be caught above
  }
  
  // ... rest of error handling
}
```

Then in `getImageBuffer`:

```typescript
const buffer = await this.downloadImageWithRetry(url);

// ✅ NEW: Check for empty buffer (404 case)
if (!buffer || buffer.length === 0) {
  this.logger.warn(`📦 Image unavailable, returning placeholder`);
  // Return a simple SVG placeholder
  const placeholderSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300">
      <rect width="200" height="300" fill="#ddd"/>
      <text x="100" y="150" text-anchor="middle" font-size="14" fill="#666">
        No Image Available
      </text>
    </svg>`;
  return {
    buffer: Buffer.from(placeholderSvg),
    mimeType: 'image/svg+xml',
    size: placeholderSvg.length,
  };
}
```

## Solution 3: Skip Missing Images in Frontend (Simplest)

Update the React component to skip rendering images with broken proxy URLs:

In `frontend/src/components/ProductCard.tsx`:

```typescript
{image_url && !image_url.includes('sample') && (
  <Image
    src={image_url}
    alt={title}
    fill
    className="object-cover"
    onError={(e) => {
      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23ddd" width="200" height="300"/%3E%3C/svg%3E';
    }}
  />
)}
```

## Recommended Approach

**Best:** Solution 1 (Rescrape with real data)
- Get actual book images
- Verify they're downloadable
- Test the full flow

**Good:** Solution 2 (Add fallback handler)
- Graceful error handling
- Returns placeholder
- No 500 errors
- Production-ready

**Quick:** Solution 3 (Skip missing images)
- Temporary workaround
- Doesn't require code changes to backend
- Just update frontend

## Detailed Steps for Solution 2

### Step 1: Close image-proxy.service.ts in editor
Save and close the file first

### Step 2: Update the service

The key change is in `downloadImageWithRetry` method (around line 104-150):

```typescript
async downloadImageWithRetry(url: string, attempt: number = 1): Promise<Buffer> {
  try {
    this.logger.debug(`📥 Downloading image (attempt ${attempt}/${this.maxRetries}): ${url.substring(0, 80)}...`);

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: this.requestTimeout,
      headers: { /* ... */ },
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

    // ✅ ADD THIS: Handle 404 and other errors gracefully
    if (statusCode === 404 || statusCode === 403) {
      this.logger.warn(`⚠️  Image not accessible (${statusCode}): ${url.substring(0, 60)}...`);
      return Buffer.alloc(0); // Return empty buffer to trigger placeholder
    }

    if (attempt < this.maxRetries) {
      this.logger.warn(`⚠️  Attempt ${attempt} failed: ${errorMsg}, retrying...`);
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.downloadImageWithRetry(url, attempt + 1);
    }

    this.logger.warn(`❌ Failed after ${this.maxRetries} attempts, returning empty buffer`);
    return Buffer.alloc(0); // Return empty buffer instead of throwing
  }
}
```

### Step 3: Update getImageBuffer

Add placeholder handling:

```typescript
async getImageBuffer(url: string): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
  this.validateUrl(url);
  const cacheKey = this.getCacheKey(url);

  const cached = this.cache.get<{ buffer: Buffer; mimeType: string; size: number }>(cacheKey);
  if (cached) {
    this.logger.debug(`💾 Cache hit: ${url.substring(0, 60)}...`);
    return cached;
  }

  const buffer = await this.downloadImageWithRetry(url);

  // ✅ NEW: Handle empty buffer (image not found)
  if (!buffer || buffer.length === 0) {
    this.logger.warn(`📦 Using placeholder for unavailable image: ${url.substring(0, 60)}...`);
    const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect fill="#e8e8e8" width="200" height="300"/><text x="100" y="150" text-anchor="middle" font-size="12" fill="#999">No Image</text></svg>`;
    const placeholderBuffer = Buffer.from(placeholder, 'utf-8');
    const result = {
      buffer: placeholderBuffer,
      mimeType: 'image/svg+xml',
      size: placeholderBuffer.length,
    };
    this.cache.set(cacheKey, result);
    return result;
  }

  // Rest of existing code...
  const mimeType = this.detectMimeType(buffer);
  
  if (!this.validMimeTypes.includes(mimeType)) {
    throw new InternalServerErrorException(
      `Invalid image MIME type: ${mimeType}`
    );
  }

  const result = { buffer, mimeType, size: buffer.length };
  this.cache.set(cacheKey, result);
  this.logger.log(`💾 Cached image: ${url.substring(0, 60)}... (${buffer.length} bytes)`);

  return result;
}
```

## Quick Validation

After applying fix, test:

```bash
# Test with fake image URL (should return placeholder)
curl http://localhost:3001/api/image?url=https%3A%2F%2Fimages.worldofbooks.com%2Fsample-1.jpg

# Should now return:
# - Status: 200 OK (not 500)
# - Type: image/svg+xml
# - Body: SVG placeholder
```

## Summary

| Approach | Time | Difficulty | Result |
|----------|------|-----------|--------|
| Rescrape Real Data | 5-10 min | Easy | Real images, no placeholders |
| Add Fallback Handler | 10 min | Medium | Placeholder SVG, no 500 errors |
| Skip Missing Images | 2 min | Easy | No broken icons, no placeholders |

**Recommendation:** Use **Solution 2** for robustness, or **Solution 1** for real images.
