# Test Image Proxy Fix

## Quick Test (1 Minute)

### Step 1: Restart Backend
```bash
cd backend
npm run dev
```

Look for these messages:
```
✅ Image Proxy Service initialized (24-hour cache enabled)
✓ Backend running on port 3001
```

### Step 2: Check Health Endpoint
```bash
curl http://localhost:3001/api/image/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "image-proxy",
  "timestamp": "2026-01-14T..."
}
```

### Step 3: Test in Browser
1. Start frontend: `cd frontend && npm run dev`
2. Open http://localhost:3000
3. Press **F12** to open DevTools
4. Go to **Network** tab
5. Reload the page
6. Filter by **"image"**

**Expected Results:**
- ✅ Image URLs contain: `/api/image?url=...`
- ✅ Status code: **200 OK** (not 500)
- ✅ Content-Type: `image/jpeg` or `image/png`
- ✅ No CORS errors in Console tab

## Detailed Test

### Test Image Proxy Directly

```bash
# Get a sample image via proxy
curl -v "http://localhost:3001/api/image?url=https%3A%2F%2Fimages.worldofbooks.com%2Fsample-1.jpg" \
  -o test-image.jpg

# Check file was created
ls -lh test-image.jpg
```

Expected:
- File size > 0 bytes
- No error messages
- HTTP status 200

### Check Cache Stats

```bash
curl http://localhost:3001/api/image/stats
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-14T...",
  "cached_images": 1,
  "cache_hits": 0,
  "cache_misses": 1,
  "cache_ksize": 64,
  "cache_vsize": 12345
}
```

### Test Cache Hit

Request the same image again:
```bash
curl -v "http://localhost:3001/api/image?url=https%3A%2F%2Fimages.worldofbooks.com%2Fsample-1.jpg"
```

Should be instant (< 50ms)

Check stats again:
```bash
curl http://localhost:3001/api/image/stats
```

Expected: `cache_hits` increased by 1

## Troubleshooting

### Still Getting 500 Error?

1. **Check backend logs** for the actual error message
2. **Verify port 3001 is in use:**
   ```bash
   curl http://localhost:3001/api/image/health
   ```
   
3. **Verify image URL is accessible:**
   ```bash
   # Test original URL in browser or curl
   curl -v "https://images.worldofbooks.com/sample-1.jpg"
   ```

4. **Check environment variables:**
   ```bash
   echo $API_PORT        # Should be 3001
   echo $NODE_ENV        # Should be development
   ```

### Images Still Not Showing in Browser?

1. **Check DevTools Network tab** for actual requests
2. **Look at Network response** - any error message?
3. **Check Console tab** for JavaScript errors
4. **Verify frontend API_URL:**
   - Open DevTools Console
   - Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
   - Should output: `http://localhost:3001`

## Success Checklist

- [ ] Backend starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Images download correctly via curl
- [ ] Browser shows images in Network tab
- [ ] Status codes are 200, not 500
- [ ] Cache stats show hits after second request
- [ ] No CORS errors in Console

## Before/After

**BEFORE FIX:**
```
❌ http://localhost:3001/api/image?url=... → 500 Error
   Backend trying to use port 5000 instead of 3001
```

**AFTER FIX:**
```
✅ http://localhost:3001/api/image?url=... → 200 OK
   Backend correctly uses port 3001
   Image loads instantly (cached)
```

## Next Steps if Test Passes

1. ✅ Test in production with real data
2. ✅ Update `.env` with production API_URL
3. ✅ Monitor cache statistics
4. ✅ Deploy to production

---

**Time Required:** 1-5 minutes
**Difficulty:** Easy
**Success Rate:** Should be 100% after fix
