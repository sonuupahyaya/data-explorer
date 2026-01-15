import { Injectable, Logger } from '@nestjs/common';
import { PlaywrightCrawler } from '@crawlee/playwright';

export interface BulletproofProduct {
  title: string;
  author: string;
  price: number;
  currency: string;
  image_url: string;
  source_url: string;
  source_id: string;
}

/**
 * Bulletproof scraper with zero URL corruption
 * Uses Crawlee v3 correctly with requestHandler
 */
@Injectable()
export class BulletproofScraper {
  private readonly logger = new Logger(BulletproofScraper.name);

  /**
   * Scrape books from a single category URL
   */
  async scrapeCategory(categoryUrl: string): Promise<BulletproofProduct[]> {
    // Validate URL is not corrupted
    if (!categoryUrl || !categoryUrl.startsWith('https://www.worldofbooks.com')) {
      this.logger.error(`❌ Invalid URL: ${categoryUrl}`);
      return [];
    }

    this.logger.log(`🕷️  Starting scrape of: ${categoryUrl}`);

    const products: BulletproofProduct[] = [];
    let pageCount = 0;
    const seenUrls = new Set<string>();

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 50, // Process up to 50 pages
      maxConcurrency: 2, // 2 concurrent pages
      navigationTimeoutSecs: 30,
      requestHandler: async ({ page, request, enqueueLinks, log }) => {
        pageCount++;
        log.info(`📄 Page ${pageCount}: ${request.url}`);

        try {
          await page.waitForLoadState('domcontentloaded');

          // Extract products from this page
          const pageProducts = await page.evaluate(() => {
            const items: any[] = [];

            // Target product containers
            const selectors = [
              '[class*="product"]',
              'article[class*="book"]',
              '[class*="item"]',
              '.product-card',
              '[class*="listing"]',
            ];

            for (const selector of selectors) {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                elements.forEach((el) => {
                  // Extract all possible title elements
                  const titleEl =
                    el.querySelector('h2') ||
                    el.querySelector('h3') ||
                    el.querySelector('a[href*="/books/"]') ||
                    el.querySelector('[class*="title"]') ||
                    el.querySelector('[class*="name"]');

                  const title = titleEl?.textContent?.trim() || '';
                  if (!title || title.length < 3 || title.length > 255) return;

                  // Extract all possible link elements
                  const linkEl =
                    el.querySelector('a[href*="/books/"]') ||
                    el.querySelector('a[href*="/product"]');

                  const url = linkEl?.getAttribute('href') || '';
                  if (!url) return;

                  // Extract author
                  const authorEl =
                    el.querySelector('[class*="author"]') ||
                    el.querySelector('[class*="by"]');

                  const author = authorEl?.textContent?.trim() || 'Unknown Author';

                  // Extract price
                  const priceEl =
                    el.querySelector('[class*="price"]') ||
                    el.querySelector('[class*="cost"]');

                  const priceText = priceEl?.textContent?.trim() || '0';
                  const priceMatch = priceText.match(/[\d.]+/);
                  const price = priceMatch ? parseFloat(priceMatch[0]) : 0;

                  // Extract currency
                  const currencyMatch = priceText.match(/[£$€]/);
                  const currency = currencyMatch ? currencyMatch[0] : 'GBP';

                  // Extract image
                  const imgEl =
                    el.querySelector('img[alt*="cover"]') ||
                    el.querySelector('img[alt*="book"]') ||
                    el.querySelector('img');

                  const image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';

                  items.push({
                    title,
                    url,
                    author,
                    price,
                    currency,
                    image,
                  });
                });

                if (items.length > 0) break; // Found products, stop searching
              }
            }

            return items;
          });

          // Process products
          for (const product of pageProducts) {
            if (seenUrls.has(product.url)) continue;

            const fullUrl = product.url.startsWith('http')
              ? product.url
              : new URL(product.url, 'https://www.worldofbooks.com').href;

            const fullImageUrl = product.image.startsWith('http')
              ? product.image
              : product.image
                ? new URL(product.image, 'https://www.worldofbooks.com').href
                : '';

            const sourceId = `wob_${fullUrl.split('/').pop()}`;

            products.push({
              title: product.title.substring(0, 255),
              author: product.author.substring(0, 255),
              price: product.price || 0,
              currency: product.currency,
              image_url: fullImageUrl,
              source_url: fullUrl,
              source_id: sourceId,
            });

            seenUrls.add(product.url);
            log.info(`✅ Found: ${product.title.substring(0, 40)}`);
          }

          // Enqueue next pages
          await enqueueLinks({
            selector: 'a[href*="page"], a.next, .pagination a, [class*="next"]',
            strategy: 'same-domain',
          });
        } catch (error) {
          log.error(`Error on page ${pageCount}:`, error);
        }
      },

      failedRequestHandler: async ({ request }, error) => {
        this.logger.error(`❌ Failed: ${request.url}`, error);
      },
    });

    try {
      await crawler.run([categoryUrl]);
      this.logger.log(`✅ Scrape complete: ${products.length} products from ${pageCount} pages`);
      return products;
    } catch (error) {
      this.logger.error(`🚨 Scraper crashed:`, error);
      return products; // Return what we got
    }
  }

  /**
   * Scrape multiple categories
   */
  async scrapeMultipleCategories(categoryUrls: string[]): Promise<BulletproofProduct[]> {
    const allProducts: BulletproofProduct[] = [];
    const seenUrls = new Set<string>();

    for (const url of categoryUrls) {
      try {
        const products = await this.scrapeCategory(url);
        for (const p of products) {
          if (!seenUrls.has(p.source_url)) {
            allProducts.push(p);
            seenUrls.add(p.source_url);
          }
        }
      } catch (error) {
        this.logger.error(`Error scraping ${url}:`, error);
      }
    }

    return allProducts;
  }
}
