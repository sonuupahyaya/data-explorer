# Verify Your Setup is Working

## Quick Verification (3 minutes)

After running the 3 startup commands, use these checks:

### Check 1: Backend is Running
```bash
curl http://localhost:3001/api/image/health
```

**Expected Response:**
```json
{"status":"healthy","service":"image-proxy","timestamp":"2024-01-13T10:00:00Z"}
```

✅ If you see this, backend is working!

---

### Check 2: Frontend is Running
Open http://localhost:3000 in your browser

**Expected**: Homepage loads

✅ If you see the homepage, frontend is working!

---

### Check 3: Images Are Proxied
Open http://localhost:3000/search in your browser

**Expected**: 
- Books display with images
- No CORS errors in DevTools console
- Images load from: `http://localhost:3001/api/image?url=...`

✅ If you see book images, the proxy is working!

---

### Check 4: Cache is Active
```bash
curl http://localhost:3001/api/image/stats | jq .
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-13T10:00:00Z",
  "cached_images": 1,
  "cache_hits": 0,
  "cache_misses": 1,
  "cache_ksize": 512,
  "cache_vsize": 50000
}
```

✅ If `cached_images` grows, caching is working!

---

### Check 5: Test Image Download
```bash
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg"
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 12345
Cache-Control: public, max-age=2592000
```

✅ If you see 200 OK with image headers, proxy is working!

---

## Full Verification Script

Run all checks at once:

```bash
#!/bin/bash
echo "🧪 Verifying Image Proxy Setup..."
echo "=================================="

# Check 1: Health
echo "1. Checking backend health..."
HEALTH=$(curl -s http://localhost:3001/api/image/health | jq .status 2>/dev/null)
if [ "$HEALTH" = '"healthy"' ]; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend is not responding"
  exit 1
fi

# Check 2: Cache
echo "2. Checking cache..."
CACHE=$(curl -s http://localhost:3001/api/image/stats | jq .cached_images 2>/dev/null)
if [ ! -z "$CACHE" ]; then
  echo "✅ Cache endpoint working (cached_images: $CACHE)"
else
  echo "❌ Cache endpoint not working"
  exit 1
fi

# Check 3: Product API
echo "3. Checking product API..."
PRODUCTS=$(curl -s "http://localhost:3001/api/products?page=1&limit=1" | jq .data[0].image_url 2>/dev/null)
if [[ "$PRODUCTS" == *"api/image"* ]]; then
  echo "✅ Products API returning proxied URLs"
  echo "   Sample: ${PRODUCTS:1:80}..."
else
  echo "❌ Products API not returning proxied URLs"
  exit 1
fi

# Check 4: Proxy download
echo "4. Testing image download..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg")
if [ "$STATUS" = "200" ]; then
  echo "✅ Image proxy working (HTTP $STATUS)"
else
  echo "❌ Image proxy returned HTTP $STATUS"
  exit 1
fi

echo ""
echo "🎉 All checks passed! Your image proxy system is working!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000/search in your browser"
echo "2. Verify book images load without CORS errors"
echo "3. Check DevTools Network tab for /api/image?url= requests"
```

Save as `verify.sh` and run:
```bash
bash verify.sh
```

---

## Troubleshooting Guide

### Backend Won't Start

**Error**: `Cannot find module 'node-cache'`
- **Fix**: Run `npm install` in backend directory

**Error**: `This expression is not constructable`
- **Fix**: Make sure import is `import NodeCache from 'node-cache';` (not `import * as`)
- **Status**: Already fixed in image-proxy.service.ts

**Error**: Port 3001 already in use
- **Fix**: Kill process: `lsof -ti:3001 | xargs kill -9`

### Frontend Won't Start

**Error**: `Port 3000 already in use`
- **Fix**: Kill process: `lsof -ti:3000 | xargs kill -9`

**Error**: Cannot connect to API
- **Fix**: Check `NEXT_PUBLIC_API_URL` in frontend environment

### Images Not Loading

**Symptom**: Blank images or "No Image Available"

**Checks**:
1. Are you seeing requests to `/api/image?url=...` in Network tab?
   - If YES: Proxy is being called, check cache stats
   - If NO: Check ProductsService.getProxiedImageUrl()

2. Check browser console for errors
   - CORS errors? Check backend CORS config
   - 500 errors? Check backend logs

3. Test proxy directly:
   ```bash
   curl http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg
   ```

### Cache Not Working

**Symptom**: `cache_hits` always 0

**Checks**:
1. Request same image twice
2. Check cache stats again
3. `cache_hits` should increase

If not:
- Check NodeCache is imported correctly
- Restart backend
- Clear cache: `curl http://localhost:3001/api/image/cache/clear`

---

## Performance Verification

### Response Times

**Test**: Request same image 10 times
```bash
for i in {1..10}; do
  curl -w "Request $i: %{time_total}s\n" -s "http://localhost:3001/api/image?url=..." > /dev/null
done
```

**Expected**:
- Request 1: 200-500ms (cache miss)
- Requests 2-10: <50ms (cache hits)

### Cache Hit Ratio

**Test**: Request 20 different images, then repeat
```bash
# First 20 requests (cache misses)
for i in {1..20}; do
  curl -s "http://localhost:3001/api/image?url=image$i.jpg" > /dev/null
done

# Check stats
curl http://localhost:3001/api/image/stats | jq .

# Repeat first 20 images (cache hits)
for i in {1..20}; do
  curl -s "http://localhost:3001/api/image?url=image$i.jpg" > /dev/null
done

# Check stats again
curl http://localhost:3001/api/image/stats | jq .
```

**Expected**: `cache_hits` should increase significantly on second run

---

## What Success Looks Like

✅ Backend starts without errors  
✅ Frontend loads at http://localhost:3000  
✅ `/api/image/health` returns healthy  
✅ `/api/image/stats` shows cache activity  
✅ Book images display on /search page  
✅ No CORS errors in console  
✅ Network tab shows requests to `/api/image?url=...`  

---

## Summary

| Check | Status | Action |
|-------|--------|--------|
| Backend runs | ✅ | Run `npm run start` |
| Frontend runs | ✅ | Run `npm run dev` |
| Images load | ✅ | Open /search page |
| Proxy works | ✅ | Check /api/image/health |
| Cache works | ✅ | Check /api/image/stats |
| No errors | ✅ | Check browser console |

All green? **You're ready for production!** 🚀

---

## Next Steps

1. Run verification checks above
2. Read `START_HERE.md` for next steps
3. Refer to `IMAGE_PROXY_TESTING.md` for full test suite
4. Deploy to production when ready

---

**Need help?** Check `QUICK_FIX.md` or `IMAGE_PROXY_SETUP.md`
