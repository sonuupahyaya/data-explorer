# Troubleshooting Image Proxy Issues

## Issue 1: "upstream image response failed" - 500 Error

### Symptoms
```
⨯ upstream image response failed for 
http://localhost:3001/api/image?url=https%3A%2F%2Fimages.worldofbooks.com%2Fsample-2.jpg 500
```

### Causes
1. **Fake/non-existent image URLs** (Most common)
   - Sample seed data has placeholder URLs
   - Solution: Reseed with real URLs

2. **Source website blocking requests**
   - Even with User-Agent, some sites block scrapers
   - Solution: Use different image source or contact site

3. **Network/timeout issue**
   - Image takes >30 seconds to download
   - Solution: Increase timeout or try again

### Quick Fix
```bash
# Check backend logs for actual error
npm run start:dev

# Reseed with real image URLs
npm run seed:sample-products

# Test with real image
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fcovers.openlibrary.org%2Fb%2Fid%2F7725249-M.jpg"
```

### Verify
```bash
# Get products
curl "http://localhost:3001/api/products?page=1&limit=1" | jq '.data[0].image_url'

# Should show proxied URL to REAL image source
```

---

## Issue 2: Images Show Broken Image Icon

### Symptoms
- Image element loads but shows X/broken icon
- Network tab shows 200 OK from proxy
- Image data appears to be returned

### Causes
1. **Wrong Content-Type header**
   - Proxy returning wrong MIME type
   - Solution: Check `detectMimeType()` function

2. **Corrupted image data**
   - Downloaded data isn't valid image
   - Solution: Validate image format

3. **Image too small**
   - Proxy validates minimum 100 bytes
   - Solution: Use larger images

### Debug
```bash
# Test proxy directly
curl "http://localhost:3001/api/image?url=https%3A%2F%2Fcovers.openlibrary.org%2Fb%2Fid%2F7725249-M.jpg" -o test.jpg

# Check file
file test.jpg
ls -lh test.jpg

# View headers
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fcovers.openlibrary.org%2Fb%2Fid%2F7725249-M.jpg"
```

### Fix
Ensure Content-Type header is correct:
- Should be: `image/jpeg`, `image/png`, etc.
- Check: `image-proxy.service.ts` `detectMimeType()` function

---

## Issue 3: Cache Not Working (All Requests Hitting Source)

### Symptoms
- Every request downloads fresh image
- Backend logs show "Downloaded" every time
- Same image requested multiple times takes same time

### Causes
1. **Cache not initialized**
   - NodeCache not created
   - Solution: Check service initialization

2. **Cache keys don't match**
   - Different URLs encoding treated as different
   - Solution: Normalize URLs before caching

3. **TTL expired**
   - If cache TTL is very short
   - Solution: Check `stdTTL` value (should be 86400 = 24 hours)

### Debug
```bash
# Check cache stats
curl http://localhost:3001/api/image/stats | jq .

# Should show:
# {
#   "cached_images": 5,
#   "cache_hits": 3,
#   "cache_misses": 2,
#   ...
# }

# Make same request twice
curl "http://localhost:3001/api/image?url=..." > /dev/null
curl "http://localhost:3001/api/image?url=..." > /dev/null

# Check stats again - cache_hits should increase
curl http://localhost:3001/api/image/stats | jq .cache_hits
```

### Fix
If cache_hits not increasing:
1. Check `image-proxy.service.ts` line 23: `stdTTL: 86400`
2. Check cache key generation matches request URL
3. Restart backend: `npm run start:dev`

---

## Issue 4: CORS Errors in Browser Console

### Symptoms
```
Access to XMLHttpRequest at 'https://images.worldofbooks.com/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

### Causes
1. **Frontend requesting original URL directly**
   - Frontend should use proxied URL
   - Solution: Verify API returns proxied URL

2. **Proxy endpoint not setting CORS headers**
   - Backend not allowing cross-origin
   - Solution: Check CORS config

### Debug
```bash
# 1. Check API response
curl "http://localhost:3001/api/products?page=1" | jq '.data[0].image_url'

# Should show: http://localhost:3001/api/image?url=...
# NOT: https://images.worldofbooks.com/...

# 2. Check proxy CORS headers
curl -I "http://localhost:3001/api/image?url=..."

# Should include:
# Access-Control-Allow-Origin: *
```

### Fix
1. Verify `ProductsService.getProxiedImageUrl()` is being called
2. Check `ImageProxyController` sets CORS headers (line 56-57)
3. Verify app.module.ts imports ImageProxyModule

---

## Issue 5: Timeout - Image Download Takes Too Long

### Symptoms
```
Error: timeout of 30000ms exceeded
```

### Causes
1. **Source server is slow**
   - Taking >30 seconds to respond
   - Solution: Increase timeout

2. **Network issue**
   - Connection is slow
   - Solution: Check network

3. **Large image file**
   - Image is very large, takes time to download
   - Solution: Increase timeout or optimize images

### Fix
Increase timeout in `image-proxy.service.ts` line 24:
```typescript
// Change from:
private readonly requestTimeout = 30000; // 30 seconds

// To:
private readonly requestTimeout = 60000; // 60 seconds
```

Then restart backend.

---

## Issue 6: Memory Growing Continuously

### Symptoms
- Process memory increases over time
- Eventually crashes with out-of-memory error

### Causes
1. **Cache not expiring**
   - Images staying in memory forever
   - Solution: Check TTL is set

2. **Memory leak in service**
   - Buffers not being garbage collected
   - Solution: Restart backend periodically or use Redis

### Debug
```bash
# Check cache size
curl http://localhost:3001/api/image/stats | jq '.cache_vsize'

# Should be reasonable (MB, not GB)

# Clear cache if needed
curl http://localhost:3001/api/image/cache/clear
```

### Fix
1. Verify `stdTTL: 86400` is set in service
2. Check cache is expiring old images
3. For large deployments, use Redis instead of NodeCache

---

## Issue 7: 404 - Image Proxy Endpoint Not Found

### Symptoms
```
GET /api/image?url=... 404 Not Found
```

### Causes
1. **ImageProxyModule not imported**
   - Controller not registered
   - Solution: Check app.module.ts

2. **Wrong endpoint path**
   - Requesting wrong path
   - Solution: Use `/api/image` not `/api/images`

3. **Backend not running**
   - Backend crashed or not started
   - Solution: `npm run start:dev`

### Debug
```bash
# Check backend is running
curl http://localhost:3001/api/image/health

# Should return:
# {"status":"healthy",...}
```

### Fix
1. Verify `ImageProxyModule` in `app.module.ts` imports
2. Check controller path: `@Controller('api/image')`
3. Restart backend

---

## General Debugging Steps

### 1. Check Backend Logs
```bash
# Run with logs visible
npm run start:dev

# Look for:
# ✅ Image Proxy Service initialized
# 📥 Downloading image...
# ✅ Downloaded X bytes
# ❌ Failed to download
```

### 2. Test Image Proxy Directly
```bash
# Test endpoint
curl http://localhost:3001/api/image/health

# Test download
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fcovers.openlibrary.org%2Fb%2Fid%2F7725249-M.jpg"

# Save image
curl "http://localhost:3001/api/image?url=..." -o test.jpg
file test.jpg
```

### 3. Check API Responses
```bash
# Get products
curl "http://localhost:3001/api/products?page=1&limit=1" | jq .data[0]

# Check image_url field - should be proxied
```

### 4. Check Browser DevTools
1. Open http://localhost:3000/search
2. Press F12 to open DevTools
3. Go to Network tab
4. Filter for "image"
5. Look for requests to `/api/image?url=...`
6. Check status and response

### 5. Check Cache Stats
```bash
curl http://localhost:3001/api/image/stats | jq .
```

---

## Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| `Image too small` | Downloaded file <100 bytes | Use real image, not placeholder |
| `Failed after 3 attempts` | All retries failed | Check source URL is valid |
| `timeout of 30000ms` | Download took >30 seconds | Increase timeout or check network |
| `Invalid image MIME type` | File not a valid image | Use real image format |
| `404 Not Found` | Endpoint doesn't exist | Restart backend, check module import |
| `CORS policy blocked` | Frontend can't access | Use proxied URL from API |

---

## Quick Checklist

- [ ] Backend running: `npm run start:dev`
- [ ] Frontend running: `npm run dev`
- [ ] `/api/image/health` returns 200
- [ ] `/api/products` returns proxied image URLs
- [ ] Images are from real source (not fake URLs)
- [ ] No errors in browser console
- [ ] Images load on /search page
- [ ] Cache stats show cache_hits > 0

All checked? **Images should work!** ✅

---

## Still Having Issues?

1. **Read**: FIX_IMAGE_URLS.md (most common issue)
2. **Check**: Backend logs with `npm run start:dev`
3. **Test**: Proxy directly with curl
4. **Reseed**: `npm run seed:sample-products`
5. **Restart**: Stop and restart both backend and frontend

**The image proxy system is production-ready - usually issues are with image sources, not the proxy itself.**
