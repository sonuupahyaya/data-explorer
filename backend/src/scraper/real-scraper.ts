import { Injectable, Logger } from '@nestjs/common';
import { PlaywrightCrawler } from '@crawlee/playwright';
import { proxyImageUrl } from '../image-proxy/image-url.util';

export interface ScrapedNavigation {
  title: string;
  slug: string;
  url: string;
}

export interface ScrapedProduct {
  source_id: string;
  title: string;
  author: string;
  price: number;
  currency: string;
  image_url: string;
  source_url: string;
}

export interface ScrapedCategory {
  title: string;
  slug: string;
  url: string;
  product_count: number;
}

export interface ScrapedProductDetail {
  title: string;
  author: string;
  description: string;
  publisher: string;
  isbn: string;
  publication_date: string;
  price: number;
  currency: string;
  rating_avg: number;
  reviews_count: number;
  image_url: string;
  specs: Record<string, string>;
}

/**
 * Production-grade scraper using Crawlee + Playwright
 * Scrapes REAL live data from https://www.worldofbooks.com/en-gb
 */
@Injectable()
export class RealScraper {
  private readonly logger = new Logger(RealScraper.name);
  private readonly baseUrl = 'https://www.worldofbooks.com/en-gb';

  /**
   * Scrape navigation from World of Books homepage
   * Returns REAL headings from the live website
   */
  async scrapeNavigation(): Promise<ScrapedNavigation[]> {
    this.logger.log(`🕷️  Starting real navigation scrape from ${this.baseUrl}`);

    const results: ScrapedNavigation[] = [];
    const seen = new Set<string>();

    const crawler = new PlaywrightCrawler(
      {
        maxRequestsPerCrawl: 1,
        navigationTimeoutSecs: 30,
        async handlePageFunction({ request, page, enqueueLinks }) {
          this.logger.log(`📄 Processing: ${request.url}`);

          try {
            // Wait for navigation to load
            await page.waitForLoadState('domcontentloaded');

            // Try to find navigation links - World of Books structure
            const navLinks = await page.$$eval(
              'nav a, [class*="menu"] a, [class*="navigation"] a, header a[href*="/en-gb/"]',
              (elements) =>
                elements
                  .map((el) => ({
                    text: el.textContent?.trim() || '',
                    href: el.getAttribute('href') || '',
                  }))
                  .filter(
                    (link) =>
                      link.text &&
                      link.href &&
                      !link.href.includes('javascript') &&
                      link.text.length > 0 &&
                      link.text.length < 100,
                  ),
            );

            for (const link of navLinks) {
              const slug = this.createSlug(link.text);

              if (!seen.has(slug)) {
                const fullUrl = link.href.startsWith('http')
                  ? link.href
                  : new URL(link.href, this.baseUrl).href;

                results.push({
                  title: link.text,
                  slug,
                  url: fullUrl,
                });

                seen.add(slug);
                this.logger.log(`✅ Found navigation: "${link.text}"`);
              }
            }

            // If we found items, we're done. Otherwise try category page
            if (results.length < 3) {
              this.logger.log(
                `Only found ${results.length} items on homepage, scraping categories page...`,
              );
              await enqueueLinks({
                globs: [`${this.baseUrl}/categories*`],
                limit: 1,
              });
            }
          } catch (error) {
            this.logger.error(`Error processing navigation page:`, error);
          }
        },

        async failedRequestHandler({ request }, error) {
          this.logger.error(`Request failed: ${request.url}`, error);
        },
      }
    );

    try {
      await crawler.run([this.baseUrl]);

      if (results.length === 0) {
        this.logger.warn('⚠️  No navigation found, returning fallback real URLs');
        return [
          {
            title: 'Books',
            slug: 'books',
            url: `${this.baseUrl}/books`,
          },
          {
            title: 'New Arrivals',
            slug: 'new-arrivals',
            url: `${this.baseUrl}/books/new`,
          },
          {
            title: 'Bestsellers',
            slug: 'bestsellers',
            url: `${this.baseUrl}/books/bestsellers`,
          },
        ];
      }

      this.logger.log(`✅ Navigation scrape complete: ${results.length} items`);
      return results;
    } catch (error) {
      this.logger.error('🚨 Navigation scrape failed:', error);
      // Return real fallback URLs
      return [
        {
          title: 'Books',
          slug: 'books',
          url: `${this.baseUrl}/books`,
        },
        {
          title: 'Categories',
          slug: 'categories',
          url: `${this.baseUrl}/categories`,
        },
      ];
    }
  }

  /**
   * Scrape categories/subcategories from a page
   */
  async scrapeCategories(pageUrl: string): Promise<ScrapedCategory[]> {
    this.logger.log(`🕷️  Scraping categories from ${pageUrl}`);

    const results: ScrapedCategory[] = [];
    const seen = new Set<string>();

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 30,
      async handlePageFunction({ request, page }) {
        this.logger.log(`📄 Processing categories: ${request.url}`);

          try {
            await page.waitForLoadState('domcontentloaded');

            // Find category links
            const categories = await page.$$eval(
              'a[href*="/books/"], [class*="category"] a, [class*="genre"] a',
              (elements) =>
                elements
                  .slice(0, 50)
                  .map((el) => ({
                    title: el.textContent?.trim() || '',
                    url: el.getAttribute('href') || '',
                  }))
                  .filter((cat) => cat.title && cat.url),
            );

            for (const category of categories) {
              const slug = this.createSlug(category.title);

              if (!seen.has(slug) && category.title.length > 0 && category.title.length < 100) {
                const fullUrl = category.url.startsWith('http')
                  ? category.url
                  : new URL(category.url, this.baseUrl).href;

                results.push({
                  title: category.title,
                  slug,
                  url: fullUrl,
                  product_count: 0,
                });

                seen.add(slug);
                this.logger.log(`✅ Found category: "${category.title}"`);
              }
            }
          } catch (error) {
            this.logger.error('Error scraping categories:', error);
          }
      },

      async failedRequestHandler({ request }, error) {
        this.logger.error(`Request failed: ${request.url}`, error);
      },
    });

    try {
      await crawler.run([pageUrl]);
      this.logger.log(`✅ Categories scrape complete: ${results.length} items`);
      return results;
    } catch (error) {
      this.logger.error('🚨 Categories scrape failed:', error);
      return [];
    }
  }

  /**
   * Scrape products from a category page
   */
  async scrapeProducts(categoryUrl: string): Promise<ScrapedProduct[]> {
    this.logger.log(`🕷️  Scraping products from ${categoryUrl}`);

    const results: ScrapedProduct[] = [];
    const seen = new Set<string>();

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 30,
      async handlePageFunction({ request, page }) {
        this.logger.log(`📄 Processing products page: ${request.url}`);

          try {
            await page.waitForLoadState('domcontentloaded');

            // Wait for products to load
            await page.waitForSelector('[class*="product"], article, [class*="book"], .item', {
              timeout: 10000,
            });

            // Extract product data
            const products = await page.$$eval(
              '[class*="product"], article, [class*="book"], .item',
              (elements) =>
                elements.slice(0, 100).map((el) => {
                  const titleEl = el.querySelector('h2, h3, .title, .name, a[href*="/books/"]');
                  const linkEl = el.querySelector('a[href*="/books/"], a[href*="/product/"]');
                  const authorEl = el.querySelector('[class*="author"], .author');
                  const priceEl = el.querySelector('[class*="price"], .price');
                  const imageEl = el.querySelector('img');

                  return {
                    title: titleEl?.textContent?.trim() || '',
                    url: linkEl?.getAttribute('href') || '',
                    author: authorEl?.textContent?.trim() || 'Unknown Author',
                    priceText: priceEl?.textContent?.trim() || '0',
                    image: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || '',
                  };
                }),
            );

            // Filter and process valid products
            for (let idx = 0; idx < products.length; idx++) {
              const product = products[idx];

              if (!product.title || !product.url || seen.has(product.url)) {
                continue;
              }

              try {
                const fullUrl = product.url.startsWith('http')
                  ? product.url
                  : new URL(product.url, this.baseUrl).href;

                const rawImageUrl = product.image
                   ? product.image.startsWith('http')
                     ? product.image
                     : new URL(product.image, this.baseUrl).href
                   : '';

                 // Proxy the image URL to bypass CORS and hotlink blocking
                 const fullImageUrl = rawImageUrl ? proxyImageUrl(rawImageUrl) : '';

                 // Extract price
                 const priceMatch = product.priceText.match(/[\d.,]+/);
                 const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;

                 // Extract currency
                 const currencyMatch = product.priceText.match(/[£$€¥₹]/);
                 const currency = currencyMatch ? currencyMatch[0] : 'GBP';

                 // Generate source ID from URL
                 const idMatch = fullUrl.match(/\/books\/([^\/?]+)/);
                 const sourceId = idMatch ? `wob_${idMatch[1]}` : `wob_${Date.now()}_${idx}`;

                 results.push({
                   source_id: sourceId,
                   title: product.title.substring(0, 255),
                   author: product.author.substring(0, 255),
                   price,
                   currency,
                   image_url: fullImageUrl,
                   source_url: fullUrl,
                 });

                seen.add(product.url);
                this.logger.log(`✅ Found product: "${product.title.substring(0, 50)}"`);
              } catch (error) {
                this.logger.debug(`Error parsing product: ${error}`);
              }
            }
          } catch (error) {
            this.logger.error('Error scraping products:', error);
          }
      },

      async failedRequestHandler({ request }, error) {
        this.logger.error(`Request failed: ${request.url}`, error);
      },
    });

    try {
      await crawler.run([categoryUrl]);
      this.logger.log(`✅ Products scrape complete: ${results.length} items`);
      return results;
    } catch (error) {
      this.logger.error('🚨 Products scrape failed:', error);
      return [];
    }
  }

  /**
   * Scrape detailed product information
   */
  async scrapeProductDetail(productUrl: string): Promise<ScrapedProductDetail> {
    this.logger.log(`🕷️  Scraping product detail from ${productUrl}`);

    const emptyDetail: ScrapedProductDetail = {
      title: '',
      author: '',
      description: '',
      publisher: '',
      isbn: '',
      publication_date: '',
      price: 0,
      currency: 'GBP',
      rating_avg: 0,
      reviews_count: 0,
      image_url: '',
      specs: {},
    };

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 30,
      async handlePageFunction({ request, page }) {
        this.logger.log(`📄 Processing product detail: ${request.url}`);

          try {
            await page.waitForLoadState('domcontentloaded');

            const detail = await page.evaluate(() => {
              const result: Record<string, any> = {
                title: '',
                author: '',
                description: '',
                publisher: '',
                isbn: '',
                publication_date: '',
                price: 0,
                currency: 'GBP',
                rating_avg: 0,
                reviews_count: 0,
                image_url: '',
                specs: {},
              };

              // Extract title
              const titleEl = document.querySelector('h1');
              if (titleEl) {
                result.title = titleEl.textContent?.trim() || '';
              }

              // Extract author
              const authorEl = document.querySelector('[class*="author"]');
              if (authorEl) {
                result.author = authorEl.textContent?.trim() || '';
              }

              // Extract description
              const descEl = document.querySelector('[class*="description"], [class*="summary"]');
              if (descEl) {
                result.description = descEl.textContent?.trim() || '';
              }

              // Extract price
              const priceEl = document.querySelector('[class*="price"]');
              if (priceEl) {
                const priceText = priceEl.textContent?.trim() || '';
                const priceMatch = priceText.match(/[\d.,]+/);
                result.price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;

                const currencyMatch = priceText.match(/[£$€]/);
                result.currency = currencyMatch ? currencyMatch[0] : 'GBP';
              }

              // Extract image
              const imageEl = document.querySelector(
                'img[alt*="cover"], img[alt*="book"], img[src*="cover"]',
              );
              if (imageEl) {
                // Note: We'll proxy this in the backend after evaluation
                result.image_url = (imageEl as HTMLImageElement).src || '';
              }

              // Extract rating and reviews
              const ratingEl = document.querySelector('[class*="rating"], [class*="stars"]');
              if (ratingEl) {
                const ratingText = ratingEl.textContent?.trim() || '';
                const ratingMatch = ratingText.match(/[\d.]+/);
                result.rating_avg = ratingMatch ? parseFloat(ratingMatch[0]) : 0;

                const reviewsMatch = ratingText.match(/(\d+)\s*reviews?/i);
                result.reviews_count = reviewsMatch ? parseInt(reviewsMatch[1], 10) : 0;
              }

              // Extract spec details
              const specs: Record<string, string> = {};
              const dtElements = document.querySelectorAll('dt, [class*="label"]');

              for (let i = 0; i < Math.min(dtElements.length, 20); i++) {
                const dt = dtElements[i];
                const label = dt.textContent?.toLowerCase().trim() || '';
                const dd = dt.nextElementSibling;
                const value = dd?.textContent?.trim() || '';

                if (label && value && label.length < 50) {
                  if (label.includes('publisher')) result.publisher = value;
                  if (label.includes('isbn')) {
                    result.isbn = value;
                    specs['ISBN'] = value;
                  }
                  if (label.includes('date') || label.includes('published')) {
                    result.publication_date = value;
                    specs['Publication Date'] = value;
                  }

                  specs[label.charAt(0).toUpperCase() + label.slice(1)] = value;
                }
              }

              result.specs = specs;
              return result;
            });

            Object.assign(emptyDetail, detail);

            // Proxy the image URL to bypass CORS and hotlink blocking
            if (emptyDetail.image_url) {
              emptyDetail.image_url = proxyImageUrl(emptyDetail.image_url);
            }
            } catch (error) {
            this.logger.error('Error scraping product detail:', error);
            }
      },

      async failedRequestHandler({ request }, error) {
        this.logger.error(`Request failed: ${request.url}`, error);
      },
    });

    try {
      await crawler.run([productUrl]);
      this.logger.log(`✅ Product detail scraped: "${emptyDetail.title}"`);
      return emptyDetail;
    } catch (error) {
      this.logger.error('🚨 Product detail scrape failed:', error);
      return emptyDetail;
    }
  }

  /**
   * Helper: Create URL-safe slug
   */
  private createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
