import { Injectable, Logger } from '@nestjs/common';
import { PlaywrightCrawler } from '@crawlee/playwright';
import * as fs from 'fs';
import * as path from 'path';

export interface WorldBook {
  source_id: string;
  source_url: string;
  title: string;
  author: string;
  price: number;
  currency: string;
  image_url: string; // Must be https://images.worldofbooks.com/...
  description?: string;
  publisher?: string;
  isbn?: string;
}

@Injectable()
export class WorldBooksImageScraperService {
  private readonly logger = new Logger(WorldBooksImageScraperService.name);
  private readonly baseUrl = 'https://www.worldofbooks.com/en-gb';
  private readonly validImageDomain = 'https://images.worldofbooks.com';
  private scrapedBooks: WorldBook[] = [];
  private seenUrls = new Set<string>();

  /**
   * Validate image URL is real
   */
  private isValidImage(imageUrl: string): boolean {
    if (!imageUrl) return false;
    if (imageUrl.includes('placeholder') || imageUrl.includes('blank') || imageUrl.includes('loading')) {
      return false;
    }
    // Must be from the real CDN
    return imageUrl.startsWith('https://images.worldofbooks.com') || imageUrl.startsWith('http://images.worldofbooks.com');
  }

  /**
   * Extract product ID from URL
   */
  private extractProductId(url: string): string {
    const matches = url.match(/\/en-gb\/books\/([^/?]+)/);
    return matches ? matches[1] : url.split('/').pop() || 'unknown';
  }

  /**
   * Parse price
   */
  private parsePrice(priceText: string): number {
    const match = priceText.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  /**
   * Scrape book listing pages with proper lazy-load image handling
   */
  async scrapeBookListingsWithImages(pageUrl: string, pageNum: number): Promise<WorldBook[]> {
    const books: WorldBook[] = [];

    this.logger.log(`🕷️  Scraping listing page ${pageNum}: ${pageUrl}`);

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 60,
      async handlePageFunction({ page, request }) {
        try {
          this.logger.log(`📄 Processing: ${request.url}`);

          // Wait for page to load
          await page.waitForLoadState('networkidle');

          // Get all product containers
          const bookElements = await page.evaluate(() => {
            const books: any[] = [];

            // Find all product containers
            const containers = Array.from(
              document.querySelectorAll(
                'div[class*="product"], article, div[class*="book"], li[class*="product"]'
              )
            );

            this.logger.log(`Found ${containers.length} containers`);

            for (const container of containers) {
              try {
                // Get product link
                const linkEl = (container as HTMLElement).querySelector(
                  'a[href*="/en-gb/books/"]'
                ) as HTMLAnchorElement;
                if (!linkEl?.href) continue;

                // Get title
                const titleEl = (container as HTMLElement).querySelector('h2, h3, a');
                const title = titleEl?.textContent?.trim() || '';
                if (!title || title.length === 0) continue;

                // Get price
                const priceEl = (container as HTMLElement).querySelector('[class*="price"]');
                const priceText = priceEl?.textContent?.trim() || '0';

                // GET IMAGE - Critical: Check data-src first, then data-lazy-src, then srcset, then src
                let imageUrl = '';
                const imgEl = (container as HTMLElement).querySelector('img');

                if (imgEl) {
                  // Try data-src (lazy loading)
                  imageUrl =
                    imgEl.getAttribute('data-src') ||
                    imgEl.getAttribute('data-lazy-src') ||
                    imgEl.getAttribute('data-image-url') ||
                    '';

                  // If no data-src, try srcset
                  if (!imageUrl) {
                    const srcset = imgEl.getAttribute('srcset');
                    if (srcset) {
                      const srcsetMatch = srcset.match(/([^\s]+)\s+/);
                      imageUrl = srcsetMatch ? srcsetMatch[1] : '';
                    }
                  }

                  // Finally try src
                  if (!imageUrl) {
                    imageUrl = imgEl.getAttribute('src') || '';
                  }

                  // Reject placeholders
                  if (
                    imageUrl.includes('placeholder') ||
                    imageUrl.includes('blank') ||
                    imageUrl.includes('/blank') ||
                    imageUrl.includes('loading')
                  ) {
                    imageUrl = '';
                  }
                }

                // Get author - look for "by Author"
                let author = 'Unknown';
                const containerText = (container as HTMLElement).textContent || '';
                const authorMatch = containerText.match(/by\s+([^,\n]+)/i);
                if (authorMatch) {
                  author = authorMatch[1].trim().substring(0, 100);
                }

                // Only add if we have title, URL, and REAL image
                if (title && linkEl.href && imageUrl && imageUrl.includes('images.worldofbooks.com')) {
                  books.push({
                    title: title.substring(0, 200),
                    author,
                    price: priceText,
                    url: linkEl.href,
                    image: imageUrl,
                  });
                }
              } catch (e) {
                // Skip malformed items
              }
            }

            return books;
          });

          this.logger.log(`✅ Extracted ${bookElements.length} books from page`);

          // Process each book
          for (const book of bookElements) {
            if (this.seenUrls.has(book.url)) {
              continue;
            }

            const sourceId = this.extractProductId(book.url);

            // Validate image one more time
            if (!this.isValidImage(book.image)) {
              this.logger.warn(`⚠️  Rejecting ${book.title} - image is placeholder: ${book.image}`);
              continue;
            }

            const scrapedBook: WorldBook = {
              source_id: sourceId,
              source_url: book.url,
              title: book.title,
              author: book.author,
              price: this.parsePrice(book.price),
              currency: 'GBP',
              image_url: book.image,
            };

            books.push(scrapedBook);
            this.seenUrls.add(book.url);
            this.logger.log(`✅ ${book.title.substring(0, 40)} - Image: ✅`);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          this.logger.error(`Error on page: ${error}`);
        }
      },

      async failedRequestHandler({ request }, error) {
        this.logger.error(`Request failed: ${request.url}`, error);
      },
    });

    try {
      await crawler.run([pageUrl]);
    } catch (error) {
      this.logger.error(`Crawler error: ${error}`);
    }

    return books;
  }

  /**
   * Scrape product detail pages for images
   */
  async scrapeProductDetail(bookUrl: string): Promise<Partial<WorldBook>> {
    const detail: Partial<WorldBook> = {
      description: '',
      publisher: '',
      isbn: '',
      image_url: '', // May find better image on detail page
    };

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 45,
      async handlePageFunction({ page }) {
        try {
          await page.waitForLoadState('networkidle');

          // Look for high-res product image
          const detailImage = await page.evaluate(() => {
            // Try to find product image container
            const productImageDiv = document.querySelector('div[class*="product-image"]');
            if (productImageDiv) {
              const img = productImageDiv.querySelector('img');
              if (img) {
                // Check data-src first
                let src =
                  img.getAttribute('data-src') ||
                  img.getAttribute('data-lazy-src') ||
                  img.getAttribute('data-image-url') ||
                  '';

                // Try srcset
                if (!src) {
                  const srcset = img.getAttribute('srcset');
                  if (srcset) {
                    const match = srcset.match(/([^\s]+)\s+/);
                    src = match ? match[1] : '';
                  }
                }

                // Try src
                if (!src) {
                  src = img.getAttribute('src') || '';
                }

                // Reject placeholders
                if (src && !src.includes('placeholder') && !src.includes('blank')) {
                  return src;
                }
              }
            }

            return '';
          });

          if (detailImage && this.isValidImage(detailImage)) {
            detail.image_url = detailImage;
          }

          // Get description
          const descText = await page.evaluate(() => {
            const descEl = document.querySelector('[class*="description"], [class*="synopsis"], article');
            return descEl?.textContent?.substring(0, 500).trim() || '';
          });

          if (descText) {
            detail.description = descText;
          }

          // Get specs
          const specs = await page.evaluate(() => {
            const specs: Record<string, string> = {};
            const rows = document.querySelectorAll('tr, dt, [class*="spec"]');

            for (const row of rows) {
              const text = row.textContent?.toLowerCase() || '';

              if (text.includes('publisher')) {
                const next = (row as any).nextElementSibling;
                const val = next?.textContent?.trim();
                if (val) specs['Publisher'] = val.substring(0, 100);
              }

              if (text.includes('isbn')) {
                const match = text.match(/[\d\-]{10,}/);
                if (match) specs['ISBN'] = match[0];
              }
            }

            return specs;
          });

          if (specs['Publisher']) detail.publisher = specs['Publisher'];
          if (specs['ISBN']) detail.isbn = specs['ISBN'];
        } catch (error) {
          this.logger.warn(`Detail scrape error: ${error}`);
        }
      },
    });

    try {
      await crawler.run([bookUrl]);
    } catch (error) {
      this.logger.warn(`Detail crawler error: ${error}`);
    }

    return detail;
  }

  /**
   * Main scrape - 50 real books with verified images
   */
  async scrapeWorldBooks(targetCount: number = 50): Promise<{ books: WorldBook[]; stats: any }> {
    this.logger.log(`🚀 Scraping World of Books - 50 real books with REAL images`);

    const pageUrls = [
      `${this.baseUrl}/books`,
      `${this.baseUrl}/books?page=2`,
      `${this.baseUrl}/books?page=3`,
      `${this.baseUrl}/books?page=4`,
    ];

    for (let i = 0; i < pageUrls.length && this.scrapedBooks.length < targetCount; i++) {
      const books = await this.scrapeBookListingsWithImages(pageUrls[i], i + 1);
      this.scrapedBooks.push(...books);

      this.logger.log(`📊 Progress: ${this.scrapedBooks.length}/${targetCount}`);

      if (this.scrapedBooks.length >= targetCount) {
        break;
      }

      // Rate limiting between pages
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const booksToReturn = this.scrapedBooks.slice(0, targetCount);

    // Scrape detail pages for enhanced data
    this.logger.log(`📚 Scraping details for ${booksToReturn.length} books...`);

    for (let i = 0; i < booksToReturn.length; i++) {
      const detail = await this.scrapeProductDetail(booksToReturn[i].source_url);

      if (detail.description) {
        booksToReturn[i].description = detail.description;
      }
      if (detail.publisher) {
        booksToReturn[i].publisher = detail.publisher;
      }
      if (detail.isbn) {
        booksToReturn[i].isbn = detail.isbn;
      }
      // Update with detail image if found
      if (detail.image_url && this.isValidImage(detail.image_url)) {
        booksToReturn[i].image_url = detail.image_url;
      }

      if ((i + 1) % 10 === 0) {
        this.logger.log(`✅ Details: ${i + 1}/${booksToReturn.length}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Validate all books have real images
    const booksWithImages = booksToReturn.filter(b => this.isValidImage(b.image_url));
    const brokenCount = booksToReturn.length - booksWithImages.length;

    this.logger.log(`\n📸 IMAGE VALIDATION:`);
    this.logger.log(`   ✓ Books with real images: ${booksWithImages.length}/${booksToReturn.length}`);
    this.logger.log(`   ✗ Broken/placeholder images: ${brokenCount}`);

    if (brokenCount > 0) {
      this.logger.warn(`⚠️  ${brokenCount} books have broken images - removing them`);
      const validBooks = booksWithImages;
      return {
        books: validBooks,
        stats: {
          scraped: booksToReturn.length,
          valid: validBooks.length,
          broken: brokenCount,
        },
      };
    }

    return {
      books: booksWithImages,
      stats: {
        scraped: booksToReturn.length,
        valid: booksWithImages.length,
        broken: 0,
      },
    };
  }

  /**
   * Validate books before saving
   */
  validateBooksForSaving(books: WorldBook[]): { valid: WorldBook[]; invalid: number } {
    const valid = books.filter(b => {
      // Must have real image from worldofbooks CDN
      if (!b.image_url.startsWith('https://images.worldofbooks.com')) {
        this.logger.warn(`❌ Rejecting ${b.title} - image not from CDN: ${b.image_url}`);
        return false;
      }

      // Must have all required fields
      if (!b.title || !b.author || b.price === 0 || !b.source_url) {
        this.logger.warn(`❌ Rejecting ${b.title} - missing required fields`);
        return false;
      }

      return true;
    });

    return {
      valid,
      invalid: books.length - valid.length,
    };
  }
}
