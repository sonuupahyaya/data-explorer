# Fix: Image Proxy 500 Error

## Problem
Getting 500 error: `upstream image response failed for http://localhost:3001/api/image?url=https%3A%2F%2Fimages.worldofbooks.com%2Fsample-2.jpg`

## Root Cause
Sample seed data contains fake image URLs that don't actually exist:
- `https://images.worldofbooks.com/sample-1.jpg`
- `https://images.worldofbooks.com/sample-2.jpg`

## Solution Applied
Changed sample URLs to real, working book cover images from Open Library:
- ✅ Changed `sample-1.jpg` → `https://covers.openlibrary.org/b/id/7725249-M.jpg`
- ✅ Changed `sample-2.jpg` → `https://covers.openlibrary.org/b/id/8406143-M.jpg`

## What to Do Now

### Option 1: Reseed Database (Recommended)
```bash
# Terminal - Backend directory
npm run seed:sample-products

# This will clear and reseed with REAL working image URLs
```

### Option 2: Clear Database Manually
```bash
# Connect to MongoDB and delete products
db.products.deleteMany({})

# Then reseed
npm run seed:sample-products
```

### Option 3: Test Immediately
If you don't want to reseed, just test with a real image:

```bash
# Test with a real Open Library image
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fcovers.openlibrary.org%2Fb%2Fid%2F7725249-M.jpg"

# Expected: 200 OK with image headers
```

## Why This Happens
- Seed data had placeholder URLs pointing to non-existent images
- Image proxy correctly attempts to download and fails with 500
- After fix, proxy downloads from real source successfully

## Verification

After reseeding:

```bash
# 1. Get products
curl "http://localhost:3001/api/products?page=1&limit=1" | jq '.data[0].image_url'

# 2. Should show a proxied URL like:
# http://localhost:3001/api/image?url=https%3A%2F%2Fcovers.openlibrary.org%2Fb%2Fid%2F7725249-M.jpg

# 3. Test the proxy
curl -I "http://localhost:3001/api/image?url=https%3A%2F%2Fcovers.openlibrary.org%2Fb%2Fid%2F7725249-M.jpg"

# Expected: 200 OK
```

## Images Now Used
The seed data now uses real book covers from Open Library:
- Open Library is free and doesn't have CORS/hotlink blocking
- Perfect for testing the image proxy
- Real-world similar URLs that would come from scrapers

## Backend Logs

When you reseed, you should see:
```
✅ Downloaded 12345 bytes
💾 Cached image: ...
```

Instead of:
```
❌ Failed to download image after 3 attempts
```

---

## Quick Summary

| Before | After |
|--------|-------|
| Fake URLs → 500 error | Real URLs → 200 OK |
| No images displayed | Images display properly |
| Proxy failing | Proxy working perfectly |

**Just reseed and you're done!** ✅
