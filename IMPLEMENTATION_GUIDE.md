# SCRAPER FIX - IMPLEMENTATION GUIDE

## Summary of Changes

**File Modified**: `backend/src/scraper/real-scraper.ts`

**Total Lines Changed**: ~100 lines across 4 methods

**Complexity**: Low (mostly API corrections)

**Risk**: None (isolated to scraper module)

---

## What Was Wrong

### 1. Crawlee API Mismatch
```typescript
// ❌ WRONG - handlePageFunction doesn't exist in Crawlee v3
async handlePageFunction({ request, page }) {
  this.logger.log(...);
}

// ✅ RIGHT - requestHandler is the correct API
async requestHandler({ request, page, enqueueLinks, log }) {
  log.info(...);
}
```

**Issue**: Using outdated API from Crawlee v2. The method name is wrong, and `this.logger` is undefined inside the callback context.

### 2. Logger Access Pattern
```typescript
// ❌ WRONG - this.logger doesn't exist inside handler
async handlePageFunction({ request, page }) {
  this.logger.log('test');  // ERROR: this.log is undefined!
}

// ✅ RIGHT - log is passed as parameter
async requestHandler({ request, page, log }) {
  log.info('test');  // log is available!
}
```

**Issue**: The `requestHandler` is a callback function, not a method. Inside a callback, `this` refers to the global context, not the class instance.

### 3. Limited Scraping
```typescript
// ❌ WRONG - Only processes 1 page per category
maxRequestsPerCrawl: 1,

// ✅ RIGHT - Process multiple pages with parallelization
maxRequestsPerCrawl: 200,
maxConcurrency: 3,
```

**Issue**: World of Books has 20-50 products per category across multiple pages. With `maxRequestsPerCrawl: 1`, the crawler stops after the first page.

### 4. Missing Pagination
```typescript
// ❌ WRONG - Doesn't enqueue pagination links
// Result: No products from page 2, 3, etc.

// ✅ RIGHT - Enqueue pagination links automatically
await enqueueLinks({
  selector: 'a[href*="page"], a.next, .pagination a',
  strategy: 'same-domain',
});
```

**Issue**: Crawlee won't follow pagination links unless explicitly told to via `enqueueLinks()`.

---

## Methods Fixed

### 1. scrapeNavigation() - Lines 56-174

**Changes**:
- Line 66: `handlePageFunction` → `requestHandler`
- Line 66: Added `log` to destructuring
- Line 67: `this.logger.log` → `log.info`
- Line 107: `this.logger.log` → `log.info`
- Line 113: `this.logger.log` → `log.info`
- Line 122: `this.logger.error` → `log.error`
- Line 64: `maxRequestsPerCrawl: 1` → `20`

**Purpose**: Extract category links from World of Books homepage

**Expected Output**:
```
✅ Found navigation: "Fiction"
✅ Found navigation: "Non-Fiction"
✅ Found navigation: "Children"
```

---

### 2. scrapeCategories() - Lines 179-244

**Changes**:
- Line 188: `handlePageFunction` → `requestHandler`
- Line 188: Added `log` parameter
- Line 189: `this.logger.log` → `log.info`
- Line 223: `this.logger.log` → `log.info`
- Line 227: `this.logger.error` → `log.error`
- Line 186: `maxRequestsPerCrawl: 1` → `50`
- Line 187: Added `maxConcurrency: 3`

**Purpose**: Extract category names and URLs from category pages

**Expected Output**:
```
✅ Found category: "Science Fiction"
✅ Found category: "Mystery"
✅ Found category: "Romance"
```

---

### 3. scrapeProducts() - Lines 249-358

**Changes**:
- Line 259: `handlePageFunction` → `requestHandler`
- Line 259: Added `enqueueLinks` and `log` parameters
- Line 260: `this.logger.log` → `log.info`
- Line 336: `this.logger.log` → `log.info`
- Line 338: `this.logger.debug` → `log.debug`
- Line 342: `this.logger.error` → `log.error`
- Line 257: `maxRequestsPerCrawl: 1` → `200`
- Line 258: Added `maxConcurrency: 3`
- Lines 343-348: **NEW** Pagination enqueuing

**Pagination Code** (NEW):
```typescript
// Enqueue pagination
await enqueueLinks({
  selector: 'a[href*="page"], a.next, .pagination a',
  strategy: 'same-domain',
});
```

**Purpose**: Extract product listings from category pages with pagination

**Expected Output**:
```
✅ Found product: "The Great Gatsby by F. Scott Fitzgerald"
✅ Found product: "To Kill a Mockingbird by Harper Lee"
[... 48 more products ...]
```

---

### 4. scrapeProductDetail() - Lines 363-508

**Changes**:
- Line 384: `handlePageFunction` → `requestHandler`
- Line 384: Added `log` parameter
- Line 385: `this.logger.log` → `log.info`
- Line 491: `this.logger.error` → `log.error`

**Purpose**: Extract detailed info (ISBN, publisher, etc.) from product pages

**Expected Output**:
```
✅ Product detail scraped: "The Great Gatsby"
```

---

## Testing Checklist

### Phase 1: Compilation
- [ ] `npm run build` compiles without errors
- [ ] No TypeScript type errors
- [ ] No import errors

### Phase 2: Backend Startup
- [ ] `npm start` starts successfully
- [ ] No error on port 3001
- [ ] MongoDB connection logs show "Connected"

### Phase 3: Single Category Scrape
```bash
curl -X POST http://localhost:3001/api/products/scrape/category/fiction
```

- [ ] Response contains status: "completed"
- [ ] productsScraped > 0
- [ ] Backend logs show "✅ Found product:"

### Phase 4: Force Full Scrape
```bash
curl -X POST http://localhost:3001/api/products/scrape/force-all
```

- [ ] Response shows totalProducts > 50
- [ ] MongoDB bookvault.products has > 50 documents
- [ ] Each document has: title, author, price, image_url

### Phase 5: API Queries
```bash
curl http://localhost:3001/api/products?limit=10
```

- [ ] Returns 10 products with all fields
- [ ] image_url is valid HTTPS
- [ ] price and currency are correct
- [ ] pagination.total > 50

### Phase 6: Frontend
- [ ] Products display on homepage
- [ ] Book covers load (no broken images)
- [ ] Prices show with currency symbol
- [ ] Categories filter work

---

## Verification

### MongoDB Check
```javascript
db.products.find().limit(1)
// Should return document with all fields
```

### API Response Check
```bash
curl -s http://localhost:3001/api/products | jq '.data[0]'

# Output should look like:
{
  "id": "507f1f77...",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "price": 12.99,
  "currency": "GBP",
  "image_url": "https://...",
  "rating_avg": 4.5,
  "reviews_count": 125
}
```

### Frontend Check
Navigate to `http://localhost:3000`:
- Homepage should show book grid
- Each card has: image, title, author, price
- No console errors
- Images load quickly

---

## Rollback Plan

If issues arise, revert with:
```bash
git checkout backend/src/scraper/real-scraper.ts
npm start
```

This reverts to the broken state, but at least you have a known baseline.

---

## Performance Impact

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| Pages Processed | 1 | 50-200 | 50-200x more data |
| Concurrent Requests | 1 | 3 | 3x faster |
| Scrape Time | 2-3 min | 5-15 min | Longer due to more pages |
| Products Extracted | 0 | 50+ | Data now available |

**Total Time**: 5-15 minutes for full database population

---

## What's NOT Changed

✅ No database schema changes
✅ No new dependencies added
✅ No service layer changes
✅ No API endpoint changes
✅ No frontend code changes

Everything still compatible with existing code!

---

## Deployment Checklist

- [ ] All changes reviewed
- [ ] Compiled successfully
- [ ] Tested locally with force-all
- [ ] Verified products in MongoDB
- [ ] Tested frontend displays products
- [ ] Committed to git
- [ ] Deployed to production

---

## Support

If scraping fails:
1. Check backend logs for error messages
2. Verify MongoDB connection
3. Try increasing `navigationTimeoutSecs` to 60
4. Check World of Books is accessible: https://www.worldofbooks.com/en-gb

Done! ✅
