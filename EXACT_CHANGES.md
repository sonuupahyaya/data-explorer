# EXACT CODE CHANGES - LINE BY LINE

## File: `backend/src/scraper/real-scraper.ts`

### Change 1: scrapeNavigation() - Configuration (Lines 62-66)

**Before (Lines 62-66):**
```typescript
const crawler = new PlaywrightCrawler(
  {
    maxRequestsPerCrawl: 1,
    navigationTimeoutSecs: 30,
    async handlePageFunction({ request, page, enqueueLinks }) {
      this.logger.log(`📄 Processing: ${request.url}`);
```

**After (Lines 62-66):**
```typescript
const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 20,
  navigationTimeoutSecs: 30,
  async requestHandler({ request, page, enqueueLinks, log }) {
    log.info(`📄 Processing: ${request.url}`);
```

**Changes**:
- Line 64: `1` → `20` (process more pages)
- Line 66: `handlePageFunction` → `requestHandler` (fix API)
- Line 66: Added `log` parameter
- Line 67: `this.logger.log` → `log.info`

---

### Change 2: scrapeNavigation() - Logging (Lines 107, 113, 122)

**Before:**
```typescript
107:                 log.info(`✅ Found navigation: "${link.text}"`);  // Already fixed above
113:              log.info(
114:                `Only found ${results.length} items on homepage, scraping categories page...`,
115:              );
122:            log.error(`Error processing navigation page:`, error);
```

**After:**
```typescript
107:                log.info(`✅ Found navigation: "${link.text}"`);
113:              log.info(
114:                `Only found ${results.length} items on homepage, scraping categories page...`,
115:              );
122:            log.error(`Error processing navigation page:`, error);
```

**Changes**: Already done in Change 1 (all `this.logger` → `log`)

---

### Change 3: scrapeCategories() - Configuration (Lines 185-189)

**Before:**
```typescript
185:   const crawler = new PlaywrightCrawler({
186:     maxRequestsPerCrawl: 1,
187:     navigationTimeoutSecs: 30,
188:     async handlePageFunction({ request, page }) {
189:       this.logger.log(`📄 Processing categories: ${request.url}`);
```

**After:**
```typescript
185:   const crawler = new PlaywrightCrawler({
186:     maxRequestsPerCrawl: 50,
187:     maxConcurrency: 3,
188:     navigationTimeoutSecs: 30,
189:     async requestHandler({ request, page, log }) {
190:       log.info(`📄 Processing categories: ${request.url}`);
```

**Changes**:
- Line 186: `1` → `50` (process more categories)
- Line 187: **NEW** `maxConcurrency: 3` (parallel processing)
- Line 188: `handlePageFunction` → `requestHandler` (fix API)
- Line 188: Removed unused parameters, added `log`
- Line 190: `this.logger.log` → `log.info`

---

### Change 4: scrapeCategories() - Logging (Lines 223, 227)

**Before:**
```typescript
223:                this.logger.log(`✅ Found category: "${category.title}"`);
...
227:            this.logger.error('Error scraping categories:', error);
```

**After:**
```typescript
223:              log.info(`✅ Found category: "${category.title}"`);
...
227:          log.error('Error scraping categories:', error);
```

**Changes**: `this.logger` → `log`

---

### Change 5: scrapeProducts() - Configuration (Lines 256-259) ⭐ MOST CRITICAL

**Before:**
```typescript
256:   const crawler = new PlaywrightCrawler({
257:     maxRequestsPerCrawl: 1,
258:     navigationTimeoutSecs: 30,
259:     async handlePageFunction({ request, page }) {
260:       this.logger.log(`📄 Processing products page: ${request.url}`);
```

**After:**
```typescript
256:   const crawler = new PlaywrightCrawler({
257:     maxRequestsPerCrawl: 200,
258:     maxConcurrency: 3,
259:     navigationTimeoutSecs: 30,
260:     async requestHandler({ request, page, enqueueLinks, log }) {
261:       log.info(`📄 Processing products page: ${request.url}`);
```

**Changes**:
- Line 257: `1` → `200` (process many product pages)
- Line 258: **NEW** `maxConcurrency: 3` (3 pages in parallel)
- Line 260: `handlePageFunction` → `requestHandler` (fix API)
- Line 260: Added `enqueueLinks, log` parameters
- Line 261: `this.logger.log` → `log.info`

---

### Change 6: scrapeProducts() - Logging (Lines 336, 338, 342)

**Before:**
```typescript
335:                seen.add(product.url);
336:                this.logger.log(`✅ Found product: "${product.title.substring(0, 50)}"`);
...
338:                this.logger.debug(`Error parsing product: ${error}`);
...
342:            this.logger.error('Error scraping products:', error);
```

**After:**
```typescript
334:              seen.add(product.url);
335:              log.info(`✅ Found product: "${product.title.substring(0, 50)}"`);
...
337:              log.debug(`Error parsing product: ${error}`);
...
348:          log.error('Error scraping products:', error);
```

**Changes**: `this.logger` → `log`

---

### Change 7: scrapeProducts() - NEW PAGINATION (Lines 343-348) ⭐ NEW CODE!

**Before:**
```typescript
343:          } catch (error) {
344:            this.logger.error('Error scraping products:', error);
345:          }
346:      },
```

**After:**
```typescript
341:          }

342:          // Enqueue pagination
343:          await enqueueLinks({
344:            selector: 'a[href*="page"], a.next, .pagination a',
345:            strategy: 'same-domain',
346:          });
347:        } catch (error) {
348:          log.error('Error scraping products:', error);
349:        }
350:      },
```

**Changes**: **NEW 5 lines added!**
```typescript
// NEW: Enqueue pagination links
await enqueueLinks({
  selector: 'a[href*="page"], a.next, .pagination a',
  strategy: 'same-domain',
});
```

This is the most important change - enables following pagination links!

---

### Change 8: scrapeProductDetail() - Configuration (Lines 384-385)

**Before:**
```typescript
384:   const crawler = new PlaywrightCrawler({
385:     maxRequestsPerCrawl: 1,
386:     navigationTimeoutSecs: 30,
387:     async handlePageFunction({ request, page }) {
388:       this.logger.log(`📄 Processing product detail: ${request.url}`);
```

**After:**
```typescript
388:   const crawler = new PlaywrightCrawler({
389:     maxRequestsPerCrawl: 1,
390:     navigationTimeoutSecs: 30,
391:     async requestHandler({ request, page, log }) {
392:       log.info(`📄 Processing product detail: ${request.url}`);
```

**Changes**:
- Line 391: `handlePageFunction` → `requestHandler` (fix API)
- Line 391: Removed unused parameters, added `log`
- Line 392: `this.logger.log` → `log.info`

---

### Change 9: scrapeProductDetail() - Logging (Line 491)

**Before:**
```typescript
491:            this.logger.error('Error scraping product detail:', error);
```

**After:**
```typescript
498:          log.error('Error scraping product detail:', error);
```

**Changes**: `this.logger` → `log`

---

## Summary of Changes

| Change # | Type | Lines | What | Impact |
|----------|------|-------|------|--------|
| 1 | Config | 64, 66 | Fix API, add log, increase to 20 | Processes navigation |
| 2 | Logging | 107, 113, 122 | this.logger → log | No crashes |
| 3 | Config | 186-189 | Fix API, add concurrency, increase to 50 | Processes categories in parallel |
| 4 | Logging | 223, 227 | this.logger → log | No crashes |
| 5 | Config | 257-260 | Fix API, add pagination param, increase to 200, add concurrency | **CRITICAL** |
| 6 | Logging | 336, 338, 342 | this.logger → log | No crashes |
| 7 | NEW CODE | 343-346 | **Add pagination enqueuing** | **Gets all products!** |
| 8 | Config | 391-392 | Fix API, add log | Processes detail pages |
| 9 | Logging | 498 | this.logger → log | No crashes |

---

## Key Insights

### Why These Specific Changes?

1. **handlePageFunction → requestHandler**
   - Crawlee v3 changed the API
   - Old code uses non-existent method name
   - New code uses correct method

2. **this.logger → log parameter**
   - Inside handlers, `this` is undefined
   - `log` is passed as parameter
   - Must use parameter instead of class method

3. **maxRequestsPerCrawl: 1 → 200**
   - World of Books has 20-50 products per page
   - With limit 1, only first page processed
   - Need 200 to capture multiple pages

4. **maxConcurrency: 3**
   - Allows parallel processing
   - 3x faster without overloading target
   - Respectful rate limiting

5. **await enqueueLinks(...)**
   - Crawlee doesn't follow pagination by default
   - Must explicitly enqueue pagination links
   - Finds next page buttons and processes them

---

## Verification

To verify changes were applied correctly:

```bash
# Check line 66
grep -n "async requestHandler" backend/src/scraper/real-scraper.ts
# Should show: 66:    async requestHandler({ request, page, enqueueLinks, log }) {

# Check line 257
grep -n "maxRequestsPerCrawl: 200" backend/src/scraper/real-scraper.ts
# Should show: 257:      maxRequestsPerCrawl: 200,

# Check pagination code
grep -A 3 "await enqueueLinks" backend/src/scraper/real-scraper.ts
# Should show the pagination enqueuing code

# Compile check
npm run build
# Should succeed with no errors
```

---

## Testing the Changes

```bash
# 1. Start backend
npm start

# 2. Force scrape (triggers scrapers)
curl -X POST http://localhost:3001/api/products/scrape/force-all

# 3. Check logs in console
# Should see:
# - ✅ Found product: "..." (multiple times)
# - ✅ Inserted 50+ products into MongoDB

# 4. Query products
curl http://localhost:3001/api/products?limit=5

# 5. Verify result
# Should return 5 products with all fields
```

---

## Rollback

If needed, revert with:
```bash
git checkout backend/src/scraper/real-scraper.ts
npm start
```

This reverts to the broken state, confirming the fix works.

Done! ✅
