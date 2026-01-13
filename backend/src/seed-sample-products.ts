import * as dotenv from 'dotenv';
import { connect, Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { PlaywrightCrawler } from '@crawlee/playwright';

dotenv.config();

const logger = new Logger('SampleProductSeeder');

// ============================================
// SCHEMAS (inline)
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
// REAL PRODUCT SCRAPER (Production-Grade)
// ============================================
class RealProductScraper {
  private readonly baseUrl = 'https://www.worldofbooks.com/en-gb';
  private readonly logger = new Logger('RealProductScraper');
  private readonly scrapedProducts: IProduct[] = [];
  private readonly seenSourceIds = new Set<string>();
  private retryCount = 0;
  private readonly maxRetries = 3;

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
   * Extract price from text (e.g., "£5.99" -> 5.99)
   */
  private parsePrice(priceText: string): number {
    const match = priceText.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  /**
   * Scrape product list pages - real CSS selectors for World of Books
   */
  async scrapeProductList(categoryUrl: string): Promise<IProduct[]> {
    const results: IProduct[] = [];
    const seen = new Set<string>();

    logger.log(`🕷️  Scraping product list: ${categoryUrl}`);

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 3, // 3 pages per category
      navigationTimeoutSecs: 30,
      async handlePageFunction({ request, page }) {
        logger.log(`📄 Processing: ${request.url}`);

        try {
          await page.waitForLoadState('domcontentloaded');

          // Wait for product containers to load
          const hasProducts = await page.locator('[class*="product"], article, [data-testid*="product"]').first().isVisible().catch(() => false);

          if (!hasProducts) {
            logger.warn('⚠️  No products found on page');
            return;
          }

          // Extract products using robust selectors
          const productLinks = await page.evaluate(() => {
            const products: any[] = [];
            // Try multiple selector strategies
            const containers = document.querySelectorAll(
              '[class*="product"], article[class*="item"], div[class*="book"], [data-testid*="product"]'
            );

            containers.forEach((el) => {
              try {
                const titleEl = el.querySelector('h2, h3, a[href*="/books/"], .product-title');
                const priceEl = el.querySelector('[class*="price"], .product-price, span:has-text("£")');
                const linkEl = el.querySelector('a[href*="/books/"]');

                if (titleEl && linkEl) {
                  const title = titleEl.textContent?.trim() || '';
                  const href = linkEl.getAttribute('href') || '';
                  const price = priceEl?.textContent?.trim() || '0';
                  const imageEl = el.querySelector('img');
                  const imageUrl = imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || '';

                  if (title && href && title.length > 0 && title.length < 200) {
                    products.push({
                      title,
                      href,
                      price,
                      imageUrl,
                    });
                  }
                }
              } catch (e) {
                // Skip malformed items
              }
            });

            return products;
          });

          logger.log(`✅ Found ${productLinks.length} products on page`);

          // Process each product
          for (const product of productLinks) {
            try {
              const slug = this.createSlug(product.title);

              if (!seen.has(slug) && !this.seenSourceIds.has(product.href)) {
                const fullUrl = product.href.startsWith('http')
                  ? product.href
                  : new URL(product.href, this.baseUrl).href;

                // Extract product ID from URL
                const sourceId = fullUrl.split('/').filter(p => p).pop() || slug;

                // Create basic product object
                const productObj: IProduct = {
                  source_id: sourceId,
                  source_url: fullUrl,
                  title: product.title,
                  author: 'Unknown', // Will be scraped from detail page
                  price: this.parsePrice(product.price),
                  currency: 'GBP',
                  image_url: product.imageUrl,
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
                logger.log(`✅ Queued: ${product.title.substring(0, 50)}`);
              }
            } catch (error) {
              logger.error(`Error processing product: ${error}`);
            }
          }
        } catch (error) {
          logger.error(`Error scraping page: ${error}`);
        }
      },

      async failedRequestHandler({ request }, error) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          logger.warn(`⚠️  Request failed (retry ${this.retryCount}/${this.maxRetries}): ${request.url}`);
        } else {
          logger.error(`❌ Request failed after retries: ${request.url}`, error);
        }
      },
    });

    try {
      await crawler.run([categoryUrl]);
      logger.log(`✅ Scrape complete: ${results.length} products found`);
      return results;
    } catch (error) {
      logger.error('Crawl failed:', error);
      return results;
    }
  }

  /**
   * Scrape product detail page
   */
  async scrapeProductDetail(productUrl: string): Promise<Partial<IProduct>> {
    const detail: Partial<IProduct> = {
      author: 'Unknown',
      description: '',
      publisher: '',
      isbn: '',
      specs: {},
    };

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 30,
      async handlePageFunction({ page }) {
        try {
          await page.waitForLoadState('domcontentloaded');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting

          const productDetail = await page.evaluate(() => {
            const result: Record<string, any> = {
              author: 'Unknown',
              description: '',
              publisher: '',
              isbn: '',
              specs: {},
            };

            // Try to find author
            const authorEl = document.querySelector('[class*="author"], [class*="by"]');
            if (authorEl) {
              result.author = authorEl.textContent?.trim() || 'Unknown';
            }

            // Try to find description
            const descEl = document.querySelector(
              '[class*="description"], [class*="summary"], [class*="synopsis"], article'
            );
            if (descEl) {
              result.description = descEl.textContent?.substring(0, 500).trim() || '';
            }

            // Try to find publisher
            const publisherEl = Array.from(document.querySelectorAll('*')).find(el =>
              el.textContent?.toLowerCase().includes('publisher')
            );
            if (publisherEl) {
              const next = publisherEl.nextElementSibling || publisherEl.parentElement?.nextElementSibling;
              result.publisher = next?.textContent?.trim() || '';
            }

            // Try to find ISBN
            const isbnEl = Array.from(document.querySelectorAll('*')).find(el =>
              el.textContent?.toLowerCase().includes('isbn')
            );
            if (isbnEl) {
              const match = isbnEl.textContent?.match(/[\d-]{10,}/);
              result.isbn = match ? match[0] : '';
            }

            return result;
          });

          Object.assign(detail, productDetail);
        } catch (error) {
          logger.warn(`Detail scrape error for ${productUrl}: ${error}`);
        }
      },
    });

    try {
      await crawler.run([productUrl]);
    } catch (error) {
      logger.warn(`Detail page crawl failed: ${error}`);
    }

    return detail;
  }

  /**
   * Main scrape method
   */
  async scrapeRealProducts(targetCount: number = 50): Promise<IProduct[]> {
    logger.log(`🚀 Starting real product scrape (target: ${targetCount})`);

    try {
      // Real category URLs from World of Books
      const categoryUrls = [
        `${this.baseUrl}/books?page=1`,
        `${this.baseUrl}/books?page=2`,
        `${this.baseUrl}/books?page=3`,
      ];

      // Scrape product lists from categories
      for (const categoryUrl of categoryUrls) {
        if (this.scrapedProducts.length >= targetCount) break;

        const products = await this.scrapeProductList(categoryUrl);
        this.scrapedProducts.push(...products);

        logger.log(`📊 Progress: ${this.scrapedProducts.length}/${targetCount} products`);

        // Rate limiting between category pages
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Limit to target count
      const limitedProducts = this.scrapedProducts.slice(0, targetCount);

      logger.log(`✅ Scrape complete: ${limitedProducts.length} products`);
      return limitedProducts;
    } catch (error) {
      logger.error('Scrape failed:', error);
      return this.scrapedProducts;
    }
  }
}

// ============================================
// DATABASE OPERATIONS
// ============================================
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/world_of_books';
    logger.log(`📦 Connecting to MongoDB: ${mongoUri}`);

    const connection = await connect(mongoUri);
    logger.log('✅ Connected to MongoDB');

    // Get Product model
    const productSchema = new (require('mongoose').Schema)({
      source_id: { type: String, required: true, unique: true },
      source_url: { type: String, required: true, unique: true },
      title: { type: String, required: true },
      author: { type: String, required: true },
      price: { type: Number, required: true },
      currency: { type: String, required: true },
      image_url: { type: String, default: null },
      categories: [{ type: require('mongoose').Schema.Types.ObjectId, ref: 'Category', default: [] }],
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

    const ProductModel: Model<any> = connection.model('Product', productSchema);

    // Clear existing products (optional)
    const existingCount = await ProductModel.countDocuments();
    logger.log(`📊 Existing products in DB: ${existingCount}`);

    // Scrape products
    const scraper = new RealProductScraper();
    const products = await scraper.scrapeRealProducts(50);

    if (products.length === 0) {
      logger.warn('⚠️  No products scraped. Using fallback sample data.');
      // Fallback sample data
      const sampleProducts: IProduct[] = [
        {
          source_id: 'wob-sample-1',
          source_url: 'https://www.worldofbooks.com/en-gb/books/sample-1',
          title: 'The Midnight Library',
          author: 'Matt Haig',
          price: 8.99,
          currency: 'GBP',
          image_url: 'https://covers.openlibrary.org/b/id/7725249-M.jpg',
          description: 'A dazzling novel about all the choices that go into a life well lived.',
          publisher: 'Canongate Books',
          isbn: '978-1786892435',
          specs: { Pages: '320', Format: 'Paperback', Language: 'English' },
          rating_avg: 4.5,
          reviews_count: 1200,
          last_scraped_at: new Date(),
          is_available: true,
        },
        {
          source_id: 'wob-sample-2',
          source_url: 'https://www.worldofbooks.com/en-gb/books/sample-2',
          title: 'Project Hail Mary',
          author: 'Andy Weir',
          price: 9.99,
          currency: 'GBP',
          image_url: 'https://covers.openlibrary.org/b/id/8406143-M.jpg',
          description: 'A lone astronaut must save Earth from extinction.',
          publisher: 'Ballantine Books',
          isbn: '978-0593135204',
          specs: { Pages: '496', Format: 'Paperback', Language: 'English' },
          rating_avg: 4.7,
          reviews_count: 950,
          last_scraped_at: new Date(),
          is_available: true,
        },
      ];

      // Generate 50 sample products dynamically
      for (let i = 0; i < 50; i++) {
        const baseProduct = sampleProducts[i % sampleProducts.length];
        const newProduct: IProduct = {
          ...baseProduct,
          source_id: `wob-sample-${i + 1}`,
          source_url: `https://www.worldofbooks.com/en-gb/books/sample-${i + 1}`,
          title: `${baseProduct.title} (Copy ${Math.floor(i / 2) + 1})`,
          price: baseProduct.price + (i % 5) * 0.5,
        };
        products.push(newProduct);
      }
    }

    logger.log(`📚 Seeding ${products.length} products...`);

    // Save products to database
    let savedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Check if product already exists
        const existing = await ProductModel.findOne({ source_id: product.source_id });

        if (existing) {
          // Update existing
          await ProductModel.updateOne({ source_id: product.source_id }, product);
        } else {
          // Create new
          await ProductModel.create(product);
        }

        savedCount++;
        if (savedCount % 10 === 0) {
          logger.log(`✅ Saved ${savedCount}/${products.length} products`);
        }
      } catch (error: any) {
        // Handle duplicate key errors gracefully
        if (error.code !== 11000) {
          errorCount++;
          logger.warn(`⚠️  Error saving ${product.title}: ${error.message}`);
        }
      }
    }

    logger.log(`\n✅ SEEDING COMPLETE:`);
    logger.log(`   ✓ Products seeded: ${savedCount}`);
    logger.log(`   ✓ Errors: ${errorCount}`);
    logger.log(`   ✓ Total in DB: ${await ProductModel.countDocuments()}`);

    if (products.length > 0) {
      const firstProduct = products[0];
      logger.log(`\n📦 Sample Product:`);
      logger.log(`   Title: ${firstProduct.title}`);
      logger.log(`   Author: ${firstProduct.author}`);
      logger.log(`   Price: £${firstProduct.price}`);
      logger.log(`   URL: ${firstProduct.source_url}`);
    }

    // Close connection
    await connection.disconnect();
    logger.log('✅ Database connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
