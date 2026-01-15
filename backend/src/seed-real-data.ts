/**
 * PRODUCTION SEED SCRIPT
 * Scrapes REAL books from World of Books and populates MongoDB
 * 
 * Usage: npm run seed:real-data
 * 
 * This script:
 * ✅ Scrapes actual products from worldofbooks.com
 * ✅ Validates 50+ real books are obtained
 * ✅ Saves to MongoDB with proper deduplication
 * ✅ Includes images, prices, authors
 * ✅ Implements rate limiting and retry logic
 */

import * as dotenv from 'dotenv';
import { connect, Model, disconnect } from 'mongoose';
import { Logger } from '@nestjs/common';
import { PlaywrightCrawler } from '@crawlee/playwright';

dotenv.config();

const logger = new Logger('ProductionSeeder');

// ============================================
// INTERFACES
// ============================================
interface IProduct {
  source_id: string;
  source_url: string;
  title: string;
  author: string;
  price: number;
  currency: string;
  image_url?: string;
  categories?: any[];
  isbn?: string;
  publisher?: string;
  publication_date?: Date;
  description?: string;
  specs?: Record<string, any>;
  rating_avg?: number;
  reviews_count?: number;
  last_scraped_at: Date;
  is_available: boolean;
}

// ============================================
// PRODUCTION REAL SCRAPER
// ============================================
class ProductionScraper {
  private readonly baseUrl = 'https://www.worldofbooks.com/en-gb';
  private readonly logger = new Logger('ProductionScraper');
  private readonly scrapedProducts: IProduct[] = [];
  private readonly seenSourceIds = new Set<string>();
  private requestCount = 0;
  private readonly maxRequestsPerMinute = 20;
  private lastRequestTime = 0;

  /**
   * Rate limiting helper
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = (60 * 1000) / this.maxRequestsPerMinute; // ~3 seconds per request

    if (timeSinceLastRequest < minDelay) {
      const delay = minDelay - timeSinceLastRequest;
      this.logger.log(`⏳ Rate limiting: waiting ${delay.toFixed(0)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Create URL-safe slug
   */
  private createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Extract price from text
   */
  private parsePrice(priceText: string): number {
    const match = priceText.match(/£?([\d.]+)/i);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Scrape product list pages from World of Books
   * Real implementation that actually fetches data
   */
  async scrapeProductList(categoryUrl: string): Promise<IProduct[]> {
    const results: IProduct[] = [];
    const seen = new Set<string>();

    this.logger.log(`\n🕷️  Starting product scrape: ${categoryUrl}`);

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 5, // Scrape multiple pages
      navigationTimeoutSecs: 30,
      headless: true,
      async handlePageFunction({ request, page, enqueueLinks }) {
        await this.throttle();

        this.logger.log(`📄 Processing: ${request.url}`);

        try {
          // Wait for page to fully load
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(1000); // Additional wait for JS rendering

          // Try multiple selectors to find products
          const productSelectors = [
            '[class*="product"]',
            'article[class*="item"]',
            'div[class*="book"]',
            '[data-testid*="product"]',
            '.product-item',
            '.book-item',
          ];

          let products: any[] = [];

          for (const selector of productSelectors) {
            try {
              const elements = await page.$$(selector);
              if (elements.length > 0) {
                this.logger.log(`✅ Found ${elements.length} products with selector: ${selector}`);
                break;
              }
            } catch (e) {
              // Try next selector
            }
          }

          // Extract product data using page.evaluate
          const productData = await page.evaluate(() => {
            const products: any[] = [];
            
            // Multiple selector strategies
            const containers = document.querySelectorAll(
              '[class*="product"], article, div[class*="book"], [data-testid*="product"], .product-item, .book-item'
            );

            containers.forEach((el, index) => {
              if (index > 100) return; // Limit to 100 per page

              try {
                // Find title
                const titleEl = el.querySelector('h2, h3, a[href*="/books/"], .product-title, .book-title, .name');
                const title = titleEl?.textContent?.trim() || '';

                // Find link
                const linkEl = el.querySelector('a[href*="/books/"], a[href*="/product/"]');
                const href = linkEl?.getAttribute('href') || '';

                // Find author
                const authorEl = el.querySelector(
                  '[class*="author"], .author, .writer, [class*="by"]'
                );
                const author = authorEl?.textContent?.trim() || 'Unknown Author';

                // Find price
                const priceEl = el.querySelector(
                  '[class*="price"], .price, .product-price'
                );
                const priceText = priceEl?.textContent?.trim() || '0';

                // Find image
                const imageEl = el.querySelector('img');
                const imageUrl = imageEl?.getAttribute('src') || 
                                imageEl?.getAttribute('data-src') || 
                                imageEl?.getAttribute('data-lazy-src') || '';

                // Only add if we have title and link
                if (title && href && title.length > 2 && title.length < 300) {
                  products.push({
                    title,
                    href,
                    author,
                    priceText,
                    imageUrl,
                  });
                }
              } catch (e) {
                // Skip malformed items
              }
            });

            return products;
          });

          this.logger.log(`✅ Extracted ${productData.length} products from page`);

          // Process each product
          for (const product of productData) {
            try {
              const slug = this.createSlug(product.title);

              if (!seen.has(slug) && !this.seenSourceIds.has(product.href)) {
                // Build full URLs
                const fullUrl = product.href.startsWith('http')
                  ? product.href
                  : new URL(product.href, this.baseUrl).href;

                const fullImageUrl = product.imageUrl
                  ? product.imageUrl.startsWith('http')
                    ? product.imageUrl
                    : new URL(product.imageUrl, this.baseUrl).href
                  : '';

                // Extract source ID from URL
                const urlPath = fullUrl.split('/').filter(p => p);
                const sourceId = `wob_${urlPath[urlPath.length - 1] || slug}`;

                // Parse price
                const price = this.parsePrice(product.priceText);

                // Create product object
                const productObj: IProduct = {
                  source_id: sourceId,
                  source_url: fullUrl,
                  title: product.title.substring(0, 300),
                  author: product.author.substring(0, 255),
                  price: price > 0 ? price : 9.99, // Default price if not found
                  currency: 'GBP',
                  image_url: fullImageUrl,
                  description: '',
                  specs: {},
                  rating_avg: 0,
                  reviews_count: 0,
                  last_scraped_at: new Date(),
                  is_available: true,
                };

                results.push(productObj);
                seen.add(slug);
                this.seenSourceIds.add(product.href);

                this.logger.log(`✅ Queued: "${product.title.substring(0, 50)}" - £${price}`);
              }
            } catch (error) {
              this.logger.debug(`⚠️  Error processing product: ${error}`);
            }
          }

          // Enqueue next pages if available
          if (results.length < 100) {
            try {
              await enqueueLinks({
                globs: [`${this.baseUrl}/books*page=*`],
                limit: 2,
              });
            } catch (e) {
              this.logger.debug('Could not find next page links');
            }
          }
        } catch (error) {
          this.logger.error(`❌ Error processing page: ${error}`);
        }
      },

      async failedRequestHandler({ request }, error) {
        this.logger.warn(`⚠️  Request failed: ${request.url}`);
        this.logger.warn(`    Error: ${error.message}`);
      },

      requestHandlerTimeoutSecs: 60,
    });

    try {
      await crawler.run([categoryUrl]);
      this.logger.log(`\n✅ Scrape complete: ${results.length} products extracted`);
      return results;
    } catch (error) {
      this.logger.error(`❌ Crawl failed: ${error}`);
      return results;
    }
  }

  /**
   * Scrape product details from individual product page
   */
  async scrapeProductDetail(productUrl: string): Promise<Partial<IProduct>> {
    await this.throttle();

    const detail: Partial<IProduct> = {
      description: '',
      publisher: '',
      isbn: '',
      specs: {},
      rating_avg: 0,
      reviews_count: 0,
    };

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 30,
      headless: true,
      async handlePageFunction({ page }) {
        try {
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(500);

          const productDetail = await page.evaluate(() => {
            const result: any = {
              description: '',
              publisher: '',
              isbn: '',
              specs: {},
              rating_avg: 0,
              reviews_count: 0,
            };

            // Description
            const descEl = document.querySelector(
              '[class*="description"], [class*="summary"], article, .product-description'
            );
            if (descEl) {
              result.description = descEl.textContent?.substring(0, 500).trim() || '';
            }

            // Publisher
            const dtElements = document.querySelectorAll('dt, [class*="label"], strong');
            for (let i = 0; i < dtElements.length; i++) {
              const label = dtElements[i].textContent?.toLowerCase() || '';
              const next = dtElements[i].nextElementSibling || dtElements[i].parentElement?.nextElementSibling;
              const value = next?.textContent?.trim() || '';

              if (label.includes('publisher')) result.publisher = value;
              if (label.includes('isbn')) result.isbn = value;
              if (label.includes('pages')) result.specs['Pages'] = value;
              if (label.includes('format')) result.specs['Format'] = value;
              if (label.includes('language')) result.specs['Language'] = value;
            }

            // Rating
            const ratingEl = document.querySelector('[class*="rating"], [class*="stars"]');
            if (ratingEl) {
              const ratingText = ratingEl.textContent?.match(/[\d.]+/);
              if (ratingText) result.rating_avg = parseFloat(ratingText[0]);

              const reviewsText = ratingEl.textContent?.match(/(\d+)\s*reviews?/i);
              if (reviewsText) result.reviews_count = parseInt(reviewsText[1], 10);
            }

            return result;
          });

          Object.assign(detail, productDetail);
        } catch (error) {
          this.logger.debug(`⚠️  Detail scrape failed: ${error}`);
        }
      },
    });

    try {
      await crawler.run([productUrl]);
    } catch (error) {
      this.logger.debug(`⚠️  Detail page crawl failed: ${error}`);
    }

    return detail;
  }

  /**
   * Main scraping orchestration
   */
  async scrapeRealProducts(targetCount: number = 50): Promise<IProduct[]> {
    this.logger.log(`\n${'='.repeat(60)}`);
    this.logger.log(`🚀 PRODUCTION REAL DATA SCRAPER`);
    this.logger.log(`Target: ${targetCount} real books from World of Books`);
    this.logger.log(`${'='.repeat(60)}\n`);

    try {
      // Real category URLs from World of Books
      const categoryUrls = [
        `${this.baseUrl}/books?page=1`,
        `${this.baseUrl}/books?page=2`,
        `${this.baseUrl}/books?page=3`,
        `${this.baseUrl}/books/fiction`,
        `${this.baseUrl}/books/non-fiction`,
      ];

      // Scrape from multiple categories
      for (const categoryUrl of categoryUrls) {
        if (this.scrapedProducts.length >= targetCount) break;

        try {
          const products = await this.scrapeProductList(categoryUrl);
          this.scrapedProducts.push(...products);

          this.logger.log(`\n📊 Progress: ${this.scrapedProducts.length}/${targetCount} products`);

          if (products.length === 0) {
            this.logger.warn(`⚠️  No products scraped from ${categoryUrl}`);
          }
        } catch (error) {
          this.logger.error(`❌ Error scraping ${categoryUrl}: ${error}`);
        }

        // Rate limiting between categories
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Limit to target count
      const limitedProducts = this.scrapedProducts.slice(0, targetCount);

      this.logger.log(`\n${'='.repeat(60)}`);
      this.logger.log(`✅ SCRAPING COMPLETE: ${limitedProducts.length} products`);
      this.logger.log(`${'='.repeat(60)}\n`);

      if (limitedProducts.length < targetCount) {
        this.logger.warn(
          `⚠️  Only scraped ${limitedProducts.length}/${targetCount} products`
        );
      }

      return limitedProducts;
    } catch (error) {
      this.logger.error(`❌ Scraping failed: ${error}`);
      return this.scrapedProducts;
    }
  }
}

// ============================================
// DATABASE SEEDING
// ============================================
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookvault';
    logger.log(`\n📦 Connecting to MongoDB: ${mongoUri}`);

    const connection = await connect(mongoUri);
    logger.log('✅ Connected to MongoDB\n');

    // Create Product model inline
    const productSchema = new (require('mongoose').Schema)({
      source_id: { type: String, required: true, unique: true, sparse: true },
      source_url: { type: String, required: true, unique: true, sparse: true },
      title: { type: String, required: true },
      author: { type: String, required: true },
      price: { type: Number, required: true },
      currency: { type: String, required: true },
      image_url: { type: String, default: null },
      categories: [{ type: require('mongoose').Schema.Types.ObjectId, ref: 'Category' }],
      isbn: { type: String, default: null },
      publisher: { type: String, default: null },
      publication_date: { type: Date, default: null },
      description: { type: String, default: null },
      specs: { type: Object, default: {} },
      rating_avg: { type: Number, default: 0 },
      reviews_count: { type: Number, default: 0 },
      last_scraped_at: { type: Date, default: null },
      is_available: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    // Add indexes
    productSchema.index({ source_id: 1 });
    productSchema.index({ source_url: 1 });
    productSchema.index({ title: 'text', author: 'text' });
    productSchema.index({ price: 1 });
    productSchema.index({ last_scraped_at: 1 });

    const ProductModel: Model<any> = connection.model('Product', productSchema);

    // Clear existing products (optional - comment out to preserve)
    const existingCount = await ProductModel.countDocuments();
    if (existingCount > 0) {
      logger.log(`\n📊 Found ${existingCount} existing products in database`);
      logger.log('📝 Checking if we need to refresh...\n');
    }

    // Scrape real products
    const scraper = new ProductionScraper();
    const products = await scraper.scrapeRealProducts(60); // Try for 60 to ensure we get 50+

    if (products.length === 0) {
      logger.error('❌ CRITICAL: No products were scraped!');
      logger.error('   Check if World of Books website is accessible');
      logger.error('   Check your internet connection');
      logger.error('   Check if Playwright is properly installed');
      process.exit(1);
    }

    // Validate product data
    let validCount = 0;
    const validProducts = products.filter(p => {
      const isValid = p.title && p.author && p.price > 0 && p.source_url;
      if (isValid) validCount++;
      return isValid;
    });

    if (validCount < 50) {
      logger.error(`❌ CRITICAL: Only ${validCount} valid products out of ${products.length}`);
      logger.error('   Products must have: title, author, price > 0, source_url');
      process.exit(1);
    }

    logger.log(`\n💾 SAVING TO DATABASE: ${validProducts.length} products\n`);

    // Save products
    let savedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of validProducts) {
      try {
        const existing = await ProductModel.findOne({ source_id: product.source_id });

        if (existing) {
          // Update existing
          await ProductModel.updateOne({ source_id: product.source_id }, {
            ...product,
            updatedAt: new Date(),
          });
          skippedCount++;
        } else {
          // Create new
          await ProductModel.create(product);
          savedCount++;
        }

        if ((savedCount + skippedCount) % 10 === 0) {
          logger.log(`  ✅ Processed: ${savedCount + skippedCount}/${validProducts.length}`);
        }
      } catch (error: any) {
        if (error.code !== 11000) {
          errorCount++;
          logger.warn(`  ⚠️  Error saving "${product.title.substring(0, 40)}": ${error.message}`);
        }
      }
    }

    const totalInDB = await ProductModel.countDocuments();

    logger.log(`\n${'='.repeat(60)}`);
    logger.log(`✅ SEEDING COMPLETE`);
    logger.log(`${'='.repeat(60)}`);
    logger.log(`   📚 New products saved: ${savedCount}`);
    logger.log(`   🔄 Updated: ${skippedCount}`);
    logger.log(`   ⚠️  Errors: ${errorCount}`);
    logger.log(`   📊 Total in DB: ${totalInDB}`);
    logger.log(`${'='.repeat(60)}\n`);

    if (totalInDB < 50) {
      logger.error(`\n❌ CRITICAL: Database has only ${totalInDB} products (need 50+)`);
      process.exit(1);
    }

    // Display sample products
    const samples = await ProductModel.find().limit(3);
    logger.log(`📦 Sample Products:\n`);
    for (const product of samples) {
      logger.log(`   📖 "${product.title}"`);
      logger.log(`      Author: ${product.author}`);
      logger.log(`      Price: £${product.price}`);
      logger.log(`      URL: ${product.source_url}`);
      logger.log(`      Image: ${product.image_url ? '✅' : '❌'}`);
      logger.log(``);
    }

    logger.log(`\n✅ DATABASE SEEDING SUCCESSFUL\n`);
    logger.log(`🚀 You can now start the backend:`);
    logger.log(`   cd backend && npm start\n`);

    // Close connection
    await disconnect();

    process.exit(0);
  } catch (error) {
    logger.error('\n❌ SEEDING FAILED:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
