# Image Proxy System - Testing & Verification Guide

## Quick Start Tests

### Test 1: Backend Health Check
```bash
# Terminal
curl http://localhost:3001/api/image/health

# Expected output:
# {"status":"healthy","service":"image-proxy","timestamp":"2024-01-13T..."}
```

---

### Test 2: Proxy a Real Image
```bash
# Test with public image
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg"

# Expected headers:
# HTTP/1.1 200 OK
# Content-Type: image/jpeg
# Cache-Control: public, max-age=2592000
# Content-Length: [size]
```

---

### Test 3: Check Cache Statistics
```bash
# After running Test 2, check cache
curl http://localhost:3001/api/image/stats

# Expected output:
# {
#   "status": "ok",
#   "timestamp": "2024-01-13T...",
#   "cached_images": 1,
#   "cache_hits": 0,
#   "cache_misses": 1,
#   "cache_ksize": 512,
#   "cache_vsize": 50000
# }
```

---

### Test 4: Test Cache Hit
```bash
# Request same image again
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg"

# Check stats again
curl http://localhost:3001/api/image/stats

# Expected: cache_hits should increase to 1
```

---

### Test 5: Full Product API Integration
```bash
# Get products from API
curl "http://localhost:3001/api/products?page=1&limit=2" | jq '.data[0]'

# You should see image_url like:
# {
#   "image_url": "http://localhost:3001/api/image?url=https%3A%2F%2Fcdn.worldofbooks.com%2F..."
# }

# The image_url is already proxied!
```

---

### Test 6: Frontend Integration
```
1. Open http://localhost:3000/search in browser
2. Open DevTools → Network tab
3. Filter by "image" 
4. Book images should load via proxy endpoints:
   - Requests to: http://localhost:3001/api/image?url=...
   - Status: 200 OK
5. Images should display properly (no broken images)
```

---

## Advanced Testing

### Test 7: Error Handling - Invalid URL
```bash
# Test with invalid URL format
curl "http://localhost:3001/api/image?url=not-a-valid-url"

# Expected: 400 Bad Request
# Response: {"status":"error","message":"Failed to load image"}
```

---

### Test 8: Error Handling - Local URL Blocking
```bash
# Try to access localhost
curl "http://localhost:3001/api/image?url=http%3A%2F%2Flocalhost%3A3000%2Fimage.jpg"

# Expected: 400 Bad Request
# Prevents SSRF attacks
```

---

### Test 9: Error Handling - Private IP Blocking
```bash
# Try to access private IP
curl "http://localhost:3001/api/image?url=http%3A%2F%2F192.168.1.1%2Fimage.jpg"

# Expected: 400 Bad Request
# Prevents internal network scanning
```

---

### Test 10: Timeout Behavior
```bash
# Create a test with a slow server
# (This would require a test server that delays response)
# Expected behavior: 30 second timeout, then error

curl -v "http://localhost:3001/api/image?url=http%3A%2F%2Fstaging.example.com%2Fslow-image.jpg"
# Should timeout after 30 seconds
```

---

### Test 11: Retry Logic
```bash
# The service automatically retries 3 times with exponential backoff:
# - Attempt 1: immediate
# - Attempt 2: after 1 second
# - Attempt 3: after 2 seconds
# - Attempt 4: after 4 seconds (then fails)

# Monitor backend logs to see:
# "⚠️ Attempt 1 failed: [error], retrying..."
# "⚠️ Attempt 2 failed: [error], retrying..."
# "❌ Failed to download image after 3 attempts"
```

---

### Test 12: MIME Type Detection
```bash
# Test with different image formats

# JPEG
curl -i "http://localhost:3001/api/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg" | grep Content-Type

# PNG
curl -i "http://localhost:3001/api/image?url=https%3A%2F%2Fexample.com%2Fimage.png" | grep Content-Type

# GIF
curl -i "http://localhost:3001/api/image?url=https%3A%2F%2Fexample.com%2Fimage.gif" | grep Content-Type

# WebP
curl -i "http://localhost:3001/api/image?url=https%3A%2F%2Fexample.com%2Fimage.webp" | grep Content-Type

# All should return correct Content-Type header
```

---

### Test 13: Clear Cache
```bash
# Before clear
curl http://localhost:3001/api/image/stats
# Shows: "cached_images": 5

# Clear cache
curl http://localhost:3001/api/image/cache/clear
# Response: {"status":"ok","message":"Cache cleared","images_removed":5}

# After clear
curl http://localhost:3001/api/image/stats
# Shows: "cached_images": 0
```

---

## Performance Testing

### Test 14: Concurrent Requests
```bash
# Test 10 concurrent requests to same image
for i in {1..10}; do
  curl -s "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg" > /dev/null &
done
wait

# Check stats - should show 1 cache miss and 9 cache hits
curl http://localhost:3001/api/image/stats
```

---

### Test 15: Different Images
```bash
# Test with 5 different images
curl -s "http://localhost:3001/api/image?url=image1.jpg" > /dev/null
curl -s "http://localhost:3001/api/image?url=image2.jpg" > /dev/null
curl -s "http://localhost:3001/api/image?url=image3.jpg" > /dev/null
curl -s "http://localhost:3001/api/image?url=image4.jpg" > /dev/null
curl -s "http://localhost:3001/api/image?url=image5.jpg" > /dev/null

# Check cache - should show 5 cached images
curl http://localhost:3001/api/image/stats
```

---

### Test 16: Memory Usage Monitoring
```bash
# In backend logs, watch memory usage
npm run start:dev

# While running tests, monitor with:
# Linux/Mac:
# ps aux | grep node

# Windows PowerShell:
# Get-Process node | Select-Object ProcessName, @{Name="Memory(MB)"; Expression={[math]::Round($_.WorkingSet/1MB)}}

# Expected: Cache should be efficient for 100-1000 images
```

---

## Browser Testing

### Test 17: Image Load Performance
```
1. Open http://localhost:3000/search in browser
2. DevTools → Performance tab
3. Record page load
4. Check timeline - image proxy requests should be fast (<500ms)
5. Images should display immediately after load
```

---

### Test 18: Error Fallback
```
1. Stop the backend: Ctrl+C on backend terminal
2. Refresh http://localhost:3000/search
3. Check browser console - should see helpful error message
4. Images should show fallback placeholder
5. Restart backend - images should load normally
```

---

### Test 19: CORS Verification
```
1. Open DevTools → Console
2. Check for any CORS errors
3. Should be NONE - proxy handles CORS
4. All image requests should show:
   - Status: 200 OK
   - From: http://localhost:3001/api/image?url=...
   - No CORS errors
```

---

### Test 20: Multiple Pages
```
1. Navigate through different pages:
   - http://localhost:3000/search
   - http://localhost:3000/search?category=fiction
   - http://localhost:3000/product/[id]
2. All images should load via proxy
3. Monitor cache stats - should grow with unique images
4. Repeated images should use cache (fast load)
```

---

## Scraper Testing

### Test 21: Verify Scraper Returns Unproxied URLs
```bash
# In backend code, add debug log to scraper:
// real-world-books-scraper.ts - Line 163
console.log('Original image URL:', book.image_url);

# Expected: 
# https://cdn.worldofbooks.com/images/book123.jpg

# (NOT the proxied version - proxying happens in ProductsService)
```

---

### Test 22: End-to-End Scraping Flow
```
1. Start backend with: npm run start:dev
2. Check logs for scraper messages:
   ✅ "Original image URL: https://..."
   ✅ "Proxied image URL: http://localhost:3001/api/image?url=..."
3. Images should be cached as products are viewed
4. Performance improves on repeated views
```

---

## Production Simulation

### Test 23: High Load Test
```bash
# Simulate 100 concurrent requests
ab -n 100 -c 10 "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg"

# Expected:
# Time per request: < 100ms (after cache warm)
# Requests per second: > 100
# Failed requests: 0
```

---

### Test 24: Large Image Handling
```bash
# Test with large image file
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fexample.com%2Flarge-image.jpg" 

# Monitor memory usage
# Large images should not cause memory leaks
# Cache should manage size appropriately
```

---

### Test 25: Cache Expiration
```bash
# Cache TTL is 24 hours
# To test expiration in development:

# 1. Edit image-proxy.service.ts
// Change: private readonly cache = new NodeCache({ stdTTL: 86400 });
// To:     private readonly cache = new NodeCache({ stdTTL: 10 }); // 10 seconds

# 2. Request image
curl "http://localhost:3001/api/image?url=..."

# 3. Check cache
curl http://localhost:3001/api/image/stats
# Shows: cache_hits: 0

# 4. Wait 10 seconds, request same image
curl "http://localhost:3001/api/image?url=..."

# 5. Check cache
curl http://localhost:3001/api/image/stats
# Shows: cache_hits: still 0 (expired)
```

---

## Logging & Debugging

### Enable Debug Logs
```bash
# In backend, set environment variable:
# Linux/Mac:
export DEBUG=*

npm run start:dev

# Windows:
set DEBUG=*
npm run start:dev

# You'll see detailed logs for every image request
```

---

### Check Application Logs
```bash
# Backend logs during image proxy operations
tail -f logs/debug.log

# Look for:
# ✅ Cache hit/miss messages
# ⚠️ Retry attempts
# ❌ Errors with details
# 📊 Cache statistics
```

---

## Troubleshooting Test Failures

| Error | Cause | Solution |
|-------|-------|----------|
| "Connection refused" | Backend not running | `cd backend && npm run start:dev` |
| "ECONNREFUSED" on product API | API not on 3001 | Check `NEXT_PUBLIC_API_URL` in frontend |
| "400 Bad Request" | URL not encoded | Use `encodeURIComponent()` in JavaScript |
| "500 Failed to download" | Source URL invalid | Check source website is accessible |
| "Images not loading in browser" | Proxy URL not returned | Check ProductsService.getProxiedImageUrl() |
| "Memory usage growing" | Cache not expiring | Check NodeCache TTL configuration |
| "Timeout errors" | Slow source server | Increase timeout from 30s (not recommended) |

---

## Automated Test Script

```bash
#!/bin/bash
# test-image-proxy.sh

echo "🧪 Image Proxy System Test Suite"
echo "=================================="

# Test 1: Health
echo "1. Testing health endpoint..."
curl -s http://localhost:3001/api/image/health | jq .

# Test 2: Sample image
echo -e "\n2. Testing image download..."
curl -s -o /tmp/test-image.jpg "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg"
echo "✅ Image downloaded: $(ls -lh /tmp/test-image.jpg)"

# Test 3: Cache stats
echo -e "\n3. Checking cache..."
curl -s http://localhost:3001/api/image/stats | jq '.cached_images, .cache_hits'

# Test 4: Same image again (should hit cache)
echo -e "\n4. Testing cache hit..."
curl -s -o /tmp/test-image2.jpg "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg"

# Test 5: Final stats
echo -e "\n5. Final cache stats..."
curl -s http://localhost:3001/api/image/stats | jq '.cached_images, .cache_hits'

# Test 6: Product API integration
echo -e "\n6. Testing product API..."
curl -s "http://localhost:3001/api/products?page=1&limit=1" | jq '.data[0].image_url' | head -c 100

echo -e "\n\n✅ All tests completed!"
```

Save as `test-image-proxy.sh` and run: `bash test-image-proxy.sh`

---

## Summary

- ✅ Health check tests: Basic connectivity
- ✅ Proxy tests: Core functionality
- ✅ Cache tests: Performance & optimization
- ✅ Error tests: Security & validation
- ✅ Integration tests: End-to-end flow
- ✅ Performance tests: Load & scaling
- ✅ Production tests: Real-world scenarios

All tests should pass before deploying to production.
