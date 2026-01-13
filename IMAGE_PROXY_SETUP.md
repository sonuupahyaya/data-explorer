# Production-Grade Image Proxy System - Complete Setup Guide

## Overview

Your project has a **production-ready image proxy system** already implemented. This document shows you how to verify it's working and troubleshoot issues.

## Architecture Diagram

```
Frontend (React/Next.js)
    ↓
Product API: GET /api/products
    ↓
Backend (NestJS)
    ├── ProductsService
    │   └── Converts image_url to proxied URL
    │       Example: http://localhost:3001/api/image?url=<encoded-external-url>
    │
    └── ImageProxyController & Service
        ├── Receives request for /api/image?url=<encoded-url>
        ├── Validates URL (security checks)
        ├── Downloads image from source with real User-Agent
        ├── Caches image for 24 hours (NodeCache)
        ├── Sets proper Content-Type headers
        └── Returns image buffer to client
```

## Current Implementation Status

✅ **Already Implemented:**
- `ImageProxyService` - Image download, caching, MIME type detection
- `ImageProxyController` - REST endpoints for image proxying
- `ImageProxyModule` - Integrated into main app
- `ProductsService.getProxiedImageUrl()` - Converts URLs automatically
- Real browser User-Agents rotation
- 24-hour cache with NodeCache
- Timeout protection (30 seconds)
- Retry logic with exponential backoff (3 retries)
- CORS headers on response

✅ **Frontend Already Setup:**
- `ProductCard.tsx` - Uses `image_url` directly
- `product/[id]/page.tsx` - Uses `image_url` directly
- Next.js Image component with fallback

## API Endpoints

### 1. Get Image (Main Endpoint)
```
GET /api/image?url=<encoded-url>
```

**Request:**
```bash
curl "http://localhost:3001/api/image?url=https%3A%2F%2Fcdn.example.com%2Fbook.jpg"
```

**Response:**
- Status: 200
- Headers: `Content-Type: image/jpeg`, `Cache-Control: public, max-age=2592000`
- Body: Image binary data

**Error Responses:**
- 400: Invalid URL format
- 400: Local/internal URL detected
- 500: Failed to download image (after 3 retries)

---

### 2. Cache Statistics
```
GET /api/image/stats
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-13T10:00:00Z",
  "cached_images": 42,
  "cache_hits": 156,
  "cache_misses": 8,
  "cache_ksize": 2048,
  "cache_vsize": 10485760
}
```

---

### 3. Clear Cache
```
GET /api/image/cache/clear
```

**Response:**
```json
{
  "status": "ok",
  "message": "Cache cleared",
  "images_removed": 42
}
```

---

### 4. Health Check
```
GET /api/image/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "image-proxy",
  "timestamp": "2024-01-13T10:00:00Z"
}
```

---

## How It Works

### 1. **Scraping Flow**
```
RealWorldOfBooksScraperService.scrapePageWithAxios()
    └── Extracts image_url from HTML
        └── Returns: "https://cdn.worldofbooks.com/images/book123.jpg"
```

### 2. **API Response Flow**
```
GET /api/products?page=1
    └── ProductsService.getProducts()
        └── For each product, call: getProxiedImageUrl(original_url)
            └── Convert to: "http://localhost:3001/api/image?url=<encoded>"
            └── Return in response
```

### 3. **Frontend Render Flow**
```
ProductCard component
    └── Receives: { image_url: "http://localhost:3001/api/image?url=..." }
        └── <Image src={image_url} /> - Next.js handles the rest
            └── Browser makes request to proxy endpoint
                └── ImageProxyController validates & downloads
                    └── ImageProxyService checks cache
                        └── If cached: return immediately
                        └── If not: download with retry logic
                            └── Detect MIME type
                            └── Cache for 24 hours
                            └── Return to browser
```

---

## Configuration

### Environment Variables (`.env`)

```env
# Image Proxy
IMAGE_PROXY_CACHE_TTL=86400           # 24 hours in seconds
IMAGE_PROXY_TIMEOUT=30000             # 30 seconds timeout
IMAGE_PROXY_MAX_RETRIES=3             # Retry 3 times
IMAGE_PROXY_RETRY_DELAY=1000          # 1 second between retries

# API URL for client
API_URL=http://localhost:3001         # Used in ProductsService.getProxiedImageUrl()

# CORS
CORS_ORIGIN=http://localhost:3000     # Frontend origin
```

### Cache Behavior

- **TTL**: 24 hours (`stdTTL: 86400`)
- **Storage**: In-memory (NodeCache)
- **Key**: MD5 hash of image URL
- **Size**: Limited by Node.js memory

**Production Upgrade**: For larger deployments, switch to Redis:

```typescript
// In image-proxy.service.ts
import * as redis from 'redis';

const redisClient = redis.createClient();

// Replace NodeCache with Redis
// const cached = await redisClient.get(cacheKey);
// await redisClient.setEx(cacheKey, 86400, JSON.stringify(result));
```

---

## Testing & Verification

### 1. **Verify Backend is Running**

```bash
# Check if API is responding
curl http://localhost:3001/api/image/health

# Expected response:
# {"status":"healthy","service":"image-proxy","timestamp":"..."}
```

### 2. **Test Image Proxy with Real URL**

```bash
# Test with a public image URL
curl -i "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.example.com%2Fimage.jpg"

# Should return:
# HTTP/1.1 200 OK
# Content-Type: image/jpeg
# Cache-Control: public, max-age=2592000
# [binary image data]
```

### 3. **Check Cache Statistics**

```bash
curl http://localhost:3001/api/image/stats

# After a few image requests, you should see hits > 0
```

### 4. **Full Integration Test**

```bash
# 1. Get products from API
curl "http://localhost:3001/api/products?page=1&limit=5"

# 2. Check image_url in response - should look like:
# "image_url": "http://localhost:3001/api/image?url=https%3A%2F%2Fcdn.worldofbooks.com%2F..."

# 3. In browser, visit:
# http://localhost:3000/search  (or any page showing books)
# Images should load via the proxy endpoint
```

---

## Security Features

### URL Validation
✅ Only HTTP/HTTPS allowed
✅ Blocks localhost/127.0.0.1 requests
✅ Blocks private IP ranges (192.168.x.x, 10.x.x.x)
✅ Blocks IPv6 loopback (::1)

### Headers
✅ Real browser User-Agent rotation
✅ Accept, Accept-Language, Referer headers
✅ CORS headers on response
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: SAMEORIGIN

### Error Handling
✅ No internal error details exposed
✅ Validates image MIME type
✅ Minimum image size check (100 bytes)
✅ Timeout protection (30 seconds)
✅ Retry with exponential backoff

---

## Troubleshooting

### Issue: Images not loading in frontend

**Check 1: Verify proxy URL format**
```bash
# In browser DevTools, check Network tab
# Image requests should go to: http://localhost:3001/api/image?url=...
```

**Check 2: Health check endpoint**
```bash
curl http://localhost:3001/api/image/health
# Should return 200 OK
```

**Check 3: Cache statistics**
```bash
curl http://localhost:3001/api/image/stats
# Should show cache_misses > 0 if images are being downloaded
```

---

### Issue: 400 Bad Request errors

**Likely cause**: URL encoding issue

**Fix**: Ensure URL is properly encoded:
```javascript
// JavaScript
const imageUrl = `http://localhost:3001/api/image?url=${encodeURIComponent(originalUrl)}`;
```

This is already handled in `ProductsService.getProxiedImageUrl()`.

---

### Issue: 500 errors - "Failed to download image"

**Causes to check:**
1. Source website is blocking requests
2. URL is no longer valid
3. Network timeout (30 seconds exceeded)
4. Downloaded data is not a valid image (<100 bytes)

**Fix**: Clear cache and check source
```bash
curl http://localhost:3001/api/image/cache/clear
# Then try accessing the image again to force re-download
```

---

### Issue: CORS errors in browser console

**Should NOT happen** if proxy is working, because:
- Browser requests go to `localhost:3001` (same as API)
- CORS is configured in `main.ts`
- Image proxy endpoint sets `Access-Control-Allow-Origin: *`

**If you see CORS errors:**
1. Check `CORS_ORIGIN` in `.env`
2. Restart backend: `npm run start:dev`
3. Clear browser cache

---

## Performance Optimization

### Current Setup
- In-memory cache (NodeCache)
- 24-hour TTL
- Automatic MIME type detection
- Streaming download

### For Production Scale

**Option 1: Redis Cache** (Recommended)
```typescript
// Replace NodeCache with Redis
// Survives server restarts
// Can be shared across instances
// Supports larger datasets
```

**Option 2: Disk-based Caching**
```typescript
// Cache images to /storage/image-cache/
// Use file names as cache keys
// Implement LRU eviction
```

**Option 3: CDN Integration**
```
External Image → Proxy → CDN → Browser
```
Route proxy responses through a CDN for global distribution.

---

## File Locations

| File | Purpose |
|------|---------|
| `backend/src/image-proxy/image-proxy.service.ts` | Core proxy logic |
| `backend/src/image-proxy/image-proxy.controller.ts` | REST endpoints |
| `backend/src/image-proxy/image-proxy.module.ts` | NestJS module |
| `backend/src/products/products.service.ts` | URL conversion logic |
| `frontend/src/components/ProductCard.tsx` | Image rendering |
| `frontend/src/app/product/[id]/page.tsx` | Detail page image |

---

## Production Checklist

- [ ] Test with real World of Books images
- [ ] Verify cache statistics endpoint
- [ ] Load test with multiple concurrent image requests
- [ ] Monitor memory usage with loaded cache
- [ ] Set up Redis for distributed cache (if scaling)
- [ ] Add image CDN fallback (optional)
- [ ] Monitor image proxy error rates
- [ ] Implement cache warming on startup (optional)
- [ ] Set up image proxy metrics/logging
- [ ] Document API for external integrations

---

## Next Steps

1. **Start Backend**: `cd backend && npm run start:dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Verify**: http://localhost:3000/search
4. **Monitor**: `curl http://localhost:3001/api/image/stats`
5. **Troubleshoot**: Check backend logs for errors

---

## Additional Resources

- [Axios Documentation](https://axios-http.com/)
- [NodeCache Documentation](https://www.npmjs.com/package/node-cache)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)

---

**System Status**: ✅ Ready for Production
