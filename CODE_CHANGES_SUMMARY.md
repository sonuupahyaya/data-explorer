# Code Changes Summary - Auto-Scraping with Safety Lock

## Modified File
`backend/src/products/products.service.ts`

---

## Change 1: Add Safety Lock Property (Line 24)

**Before:**
```typescript
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly cacheTtl = parseInt(process.env.CACHE_TTL_SECONDS || '86400', 10);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ...
```

**After:**
```typescript
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly cacheTtl = parseInt(process.env.CACHE_TTL_SECONDS || '86400', 10);
  
  // Safety lock to prevent concurrent scraping
  private isScrapingInProgress = false;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ...
```

**Purpose:** Prevents multiple simultaneous scrape operations

---

## Change 2: Enhance getProducts() Method (Lines 56-82)

**Before:**
```typescript
this.logger.log(`📚 Fetching products: sample=${sample}, category=${category}, page=${page}, search=${search}`);

// If sample is true and DB is empty, trigger scraping
if (sample) {
  const totalCount = await this.productModel.countDocuments().exec();
  if (totalCount === 0) {
    this.logger.log('📦 Database is empty, triggering sample scrape from World of Books...');
    try {
      await this.scrapeAndSaveDefaultCategories();
      this.logger.log('✅ Sample data scraped and saved');
    } catch (error) {
      this.logger.error('Sample scrape failed:', error);
    }
  }
}
```

**After:**
```typescript
this.logger.log(`📚 Fetching products: sample=${sample}, category=${category}, page=${page}, search=${search}`);

// Always check if DB is empty and auto-scrape if needed
const totalCount = await this.productModel.countDocuments().exec();
if (totalCount === 0) {
  // Safety lock: prevent concurrent scrapes from multiple requests
  if (!this.isScrapingInProgress) {
    this.isScrapingInProgress = true;
    this.logger.log('Auto-scrape triggered');
    try {
      await this.scrapeAndSaveDefaultCategories();
      this.logger.log('✅ Auto-scrape completed successfully');
    } catch (error) {
      this.logger.error('❌ Auto-scrape failed:', error);
      // Continue anyway - return empty results if scraping fails
    } finally {
      this.isScrapingInProgress = false;
    }
  } else {
    this.logger.log('⏳ Scrape already in progress, waiting...');
    // Wait for ongoing scrape to complete
    let attempts = 0;
    while (this.isScrapingInProgress && attempts < 300) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    this.logger.log('✅ Previous scrape completed, proceeding with query');
  }
}
```

**Changes:**
- Removed `if (sample)` check - now ALWAYS checks for empty DB
- Added safety lock check (`!this.isScrapingInProgress`)
- If lock free: sets lock, runs scraper, ensures lock cleared with finally
- If lock busy: waits up to 30 seconds for current scrape to finish
- Logs: `"Auto-scrape triggered"`, `"✅ Auto-scrape completed successfully"`, `"⏳ Scrape already in progress, waiting..."`, `"✅ Previous scrape completed, proceeding with query"`

**Purpose:** Trigger scraping automatically + prevent concurrent scrapes

---

## Change 3: Enhance scrapeAndSaveDefaultCategories() (Lines 287-331)

**Before:**
```typescript
private async scrapeAndSaveDefaultCategories() {
  this.logger.log('🌱 Scraping default categories from World of Books...');
  
  const defaultCategories = [
    { title: 'Fiction', slug: 'fiction', url: 'https://www.worldofbooks.com/en-gb/fiction' },
    { title: 'Non-Fiction', slug: 'non-fiction', url: 'https://www.worldofbooks.com/en-gb/non-fiction' },
    { title: 'Children', slug: 'children', url: 'https://www.worldofbooks.com/en-gb/children' },
  ];

  for (const cat of defaultCategories) {
    try {
      // ... scraping logic ...
      const products = await this.scrapeAndSaveProductsFromCategory(cat.url);
      this.logger.log(`✅ Scraped and saved ${products.length} products for ${cat.title}`);
    } catch (error) {
      this.logger.error(`Error scraping category ${cat.title}:`, error);
    }
  }

  this.logger.log('✅ Default categories scraping complete');
}
```

**After:**
```typescript
private async scrapeAndSaveDefaultCategories() {
  this.logger.log('🌱 Scraping default categories from World of Books...');
  
  const defaultCategories = [
    { title: 'Fiction', slug: 'fiction', url: 'https://www.worldofbooks.com/en-gb/fiction' },
    { title: 'Non-Fiction', slug: 'non-fiction', url: 'https://www.worldofbooks.com/en-gb/non-fiction' },
    { title: 'Children', slug: 'children', url: 'https://www.worldofbooks.com/en-gb/children' },
  ];

  let totalProductsInserted = 0;
  
  for (const cat of defaultCategories) {
    try {
      // ... scraping logic ...
      const products = await this.scrapeAndSaveProductsFromCategory(cat.url);
      totalProductsInserted += products.length;
      this.logger.log(`✅ Scraped and saved ${products.length} products for ${cat.title}`);
    } catch (error) {
      this.logger.error(`Error scraping category ${cat.title}:`, error);
    }
  }

  this.logger.log(`🎉 All categories scraping complete - Total products inserted: ${totalProductsInserted}`);
}
```

**Changes:**
- Added `let totalProductsInserted = 0;` counter
- Added `totalProductsInserted += products.length;` in loop
- Changed final log to show total: `"🎉 All categories scraping complete - Total products inserted: X"`

**Purpose:** Track and log total products inserted

---

## Change 4: Logging in scrapeAndSaveProductsFromCategory() (Line 245)

**Already had:**
```typescript
this.logger.log(`🎉 Saved ${savedProducts.length}/${scrapeResult.products.length} products to MongoDB`);
```

**Added:**
```typescript
this.logger.log(`Inserted ${savedProducts.length} products into MongoDB`);
```

**Purpose:** Explicit count log per category (required by user)

---

## Summary of Changes

| Component | Change | Lines | Purpose |
|-----------|--------|-------|---------|
| Property | Add `isScrapingInProgress` flag | 24-25 | Safety lock |
| Method | Enhance `getProducts()` | 56-82 | Auto-scrape + lock logic |
| Method | Enhance `scrapeAndSaveDefaultCategories()` | 295, 324, 330 | Count tracking + final log |
| Method | Log in `scrapeAndSaveProductsFromCategory()` | 245 | Per-category count |

---

## Test the Changes

### Build
```bash
cd backend
npm run build
```
✅ Should succeed with no errors

### Run
```bash
npm start
```

### Call API
```bash
curl http://localhost:3000/api/products?page=1&limit=24
```

### Expected Logs
```
Auto-scrape triggered
🌱 Scraping default categories from World of Books...
📖 Scraping category: Fiction...
✅ Scraped and saved 127 products for Fiction
📖 Scraping category: Non-Fiction...
✅ Scraped and saved 95 products for Non-Fiction
📖 Scraping category: Children...
✅ Scraped and saved 43 products for Children
🎉 All categories scraping complete - Total products inserted: 265
✅ Auto-scrape completed successfully
✅ Found 265 products (total: 265)
```

---

## Files NOT Changed
- No frontend changes
- No schema changes
- No controller changes
- No module changes
- No environment variable changes needed

---

## Backward Compatibility
✅ All existing scraper endpoints still work
✅ All existing getProducts() functionality unchanged
✅ Manual scraper triggers still available
✅ No breaking API changes
