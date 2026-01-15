# QUICK TEST - SCRAPER IS NOW FIXED

## 🚀 Quick Start (3 Commands)

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

Wait for:
```
NestJS Server running on port 3001...
```

### 2. Force Scrape All (Copy & Paste)
```bash
curl -X POST http://localhost:3001/api/products/scrape/force-all
```

Expected:
```json
{
  "status": "completed",
  "message": "Force scrape completed! 50+ products now in database",
  "totalProducts": 50
}
```

### 3. Get Products
```bash
curl http://localhost:3001/api/products?limit=10
```

Should return:
- ✅ data array with 10 products
- ✅ Each has: title, author, price, currency, image_url
- ✅ Pagination shows total > 50

---

## 📊 Full Verification Checklist

### ✅ Backend
- [ ] No errors on startup
- [ ] force-all returns status: "completed"
- [ ] Total products > 50
- [ ] Products have all required fields

### ✅ MongoDB
```bash
# In MongoDB Atlas -> bookvault -> products collection
# Should have 50+ documents like:
{
  "_id": ObjectId(...),
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "price": 12.99,
  "currency": "GBP",
  "image_url": "https://...",
  "source_url": "https://www.worldofbooks.com/...",
  "categories": [ObjectId(...)],
  "is_available": true,
  "createdAt": ISODate(...),
  "last_scraped_at": ISODate(...)
}
```

### ✅ Frontend
- [ ] Start frontend: `npm start`
- [ ] Homepage loads products
- [ ] Book images visible
- [ ] Prices show correctly
- [ ] No console errors

### ✅ API Endpoints
- [ ] `GET /api/products` - Returns paginated list
- [ ] `GET /api/products?category=fiction` - Filter by category
- [ ] `GET /api/:id` - Get single product
- [ ] `POST /api/scrape/force-all` - Trigger scraping

---

## 🐛 Debugging

### If products = 0:
1. Check backend logs for errors
2. Verify MongoDB connection string in `.env`
3. Run: `curl -X POST http://localhost:3001/api/products/scrape/force-all`
4. Check logs for "Error scraping products:"

### If products found but images broken:
1. Images are proxied via `/image-proxy`
2. Check that image URLs are HTTPS
3. Some sites block proxying - may need fallback images

### If API returns 500:
1. Check MongoDB is running
2. Verify `.env` has valid MONGODB_URI
3. Check backend console for stack trace

### If crawler hangs:
1. May be timing out on page load
2. Check `navigationTimeoutSecs: 30` in real-scraper.ts
3. World of Books may be slow - increase to 60 secs

---

## 📈 Expected Numbers

### Categories: 3
- Fiction
- Non-Fiction  
- Children

### Products: 50-150
- Per category: 15-50 books
- Each with title, author, price, image

### Performance:
- Script time: 5-15 minutes (Playwright is slow)
- Concurrent: 3 pages at a time

---

## 🎯 Success Criteria

✅ Backend starts without errors
✅ Force scrape returns status: "completed"
✅ Total products > 50
✅ GET /api/products returns books with images
✅ Frontend loads and displays books
✅ MongoDB has bookvault.products with 50+ docs

---

## 📝 Files Modified

Only one file changed:
- ✅ `backend/src/scraper/real-scraper.ts`

Changes made:
1. `handlePageFunction` → `requestHandler`
2. `this.logger` → `log` (parameter)
3. `maxRequestsPerCrawl: 1` → `200`
4. Added `maxConcurrency: 3`
5. Added pagination enqueuing
6. All handler methods updated

No schema changes, no service changes, no dependencies added.

---

## 💡 What's Fixed

| Issue | Line | Before | After |
|-------|------|--------|-------|
| Handler name | 66 | `handlePageFunction` | `requestHandler` |
| Logger access | 259 | `this.log` (❌) | `log` param (✅) |
| Logger access | 346 | `this.log` (❌) | `log` param (✅) |
| Max requests | 64 | 1 | 200 |
| Concurrency | N/A | None | 3 |
| Pagination | 343 | Not queued | Enqueued |

---

## ⏱️ Timing

- **Startup**: 5-10 seconds
- **First scrape**: 5-15 minutes (depends on internet)
- **Subsequent calls**: Instant (from DB cache)

---

## 🆘 Emergency Commands

If stuck, clear data and restart:

```bash
# Clear MongoDB
db.products.deleteMany({})
db.categories.deleteMany({})
db.navigations.deleteMany({})

# Restart backend
npm start

# Force new scrape
curl -X POST http://localhost:3001/api/products/scrape/force-all
```

Done! ✅
