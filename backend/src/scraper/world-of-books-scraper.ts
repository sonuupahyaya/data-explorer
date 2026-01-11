import { Injectable, Logger } from '@nestjs/common';
import { PlaywrightCrawler } from '@crawlee/playwright';

export interface ScrapedBook {
  source_id: string;
  source_url: string;
  title: string;
  author: string;
  price: number;
  currency: string;
  image_url: string;
  description?: string;
  publisher?: string;
  isbn?: string;
}

@Injectable()
export class WorldOfBooksScraperService {
  private readonly logger = new Logger(WorldOfBooksScraperService.name);
  private readonly baseUrl = 'https://www.worldofbooks.com/en-gb';
  private readonly scrapedBooks: ScrapedBook[] = [];
  private readonly seenUrls = new Set<string>();

  /**
   * Extract product ID from World of Books URL
   */
  private extractProductId(url: string): string {
    const matches = url.match(/\/en-gb\/books\/([^/]+)/);
    return matches ? matches[1] : url.split('/').pop() || 'unknown';
  }

  /**
   * Parse price text (e.g., "£5.99" -> 5.99)
   */
  private parsePrice(priceText: string): number {
    const match = priceText.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  /**
   * Scrape books from list page
   */
  async scrapeBooksList(pageUrl: string, pageNumber: number = 1): Promise<ScrapedBook[]> {
    const books: ScrapedBook[] = [];

    this.logger.log(`🕷️  Scraping page ${pageNumber}: ${pageUrl}`);

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 45,
      async handlePageFunction({ page }) {
        try {
          this.logger.log(`📄 Processing page: ${pageUrl}`);
          await page.waitForLoadState('networkidle');

          // Wait for books to load - try multiple selectors
          const bookSelectors = [
            'div[data-testid*="product"]',
            'article[class*="book"]',
            'div[class*="product-card"]',
            'div[class*="book-item"]',
            'li[class*="product"]',
            'div[class*="item"]',
          ];

          let hasBooks = false;
          for (const selector of bookSelectors) {
            const count = await page.locator(selector).count();
            if (count > 0) {
              hasBooks = true;
              this.logger.log(`✅ Found ${count} books using selector: ${selector}`);
              break;
            }
          }

          if (!hasBooks) {
            this.logger.warn('⚠️  No books found on page');
            return;
          }

          // Extract book data using page.evaluate for better performance
          const pageBooks = await page.evaluate(() => {
            const books: any[] = [];

            // Try multiple selector strategies
            const containers = Array.from(
              document.querySelectorAll(
                'div[data-testid*="product"], article, li[class*="product"], div[class*="book-item"], div[class*="product-card"]'
              )
            );

            containers.forEach((container) => {
              try {
                // Find product link
                const linkEl = container.querySelector('a[href*="/en-gb/books/"]') as HTMLAnchorElement;
                if (!linkEl || !linkEl.href) return;

                // Find title
                const titleEl = container.querySelector('h2, h3, a[href*="/books/"]');
                const title = titleEl?.textContent?.trim() || '';

                // Find author
                const authorEl = Array.from(container.querySelectorAll('*')).find(el =>
                  el.textContent?.toLowerCase().includes('by ') || el.textContent?.toLowerCase().includes('author')
                );
                let author = 'Unknown';
                if (authorEl) {
                  const text = authorEl.textContent || '';
                  const byMatch = text.match(/by\s+([^,\n]+)/i) || text.match(/author[:\s]+([^,\n]+)/i);
                  author = byMatch ? byMatch[1].trim() : 'Unknown';
                }

                // Find price
                const priceEl = container.querySelector('[class*="price"]');
                const priceText = priceEl?.textContent?.trim() || '0';

                // Find image - multiple strategies
                let imageUrl = '';
                const imgEl = container.querySelector('img[src*=""], img[data-src*=""]');
                if (imgEl) {
                  imageUrl = (imgEl as HTMLImageElement).src || (imgEl as any).dataset.src || '';
                }

                if (!imageUrl) {
                  const pictureEl = container.querySelector('picture img');
                  if (pictureEl) {
                    imageUrl = (pictureEl as HTMLImageElement).src || '';
                  }
                }

                if (!imageUrl) {
                  const allImages = Array.from(container.querySelectorAll('img'));
                  for (const img of allImages) {
                    const src = (img as HTMLImageElement).src || (img as any).dataset.src || '';
                    if (src && (src.includes('cover') || src.includes('image') || src.includes('book'))) {
                      imageUrl = src;
                      break;
                    }
                  }
                }

                // Use first image if no cover found
                if (!imageUrl && container.querySelector('img')) {
                  imageUrl = (container.querySelector('img') as HTMLImageElement).src || '';
                }

                if (title && linkEl.href && imageUrl) {
                  books.push({
                    title: title.substring(0, 200),
                    author: author.substring(0, 100),
                    price: priceText,
                    url: linkEl.href,
                    image: imageUrl,
                  });
                }
              } catch (e) {
                // Skip malformed items
              }
            });

            return books;
          });

          this.logger.log(`✅ Extracted ${pageBooks.length} books from page`);

          // Process each book
          for (const book of pageBooks) {
            if (this.seenUrls.has(book.url)) {
              continue;
            }

            const sourceId = this.extractProductId(book.url);

            const scrapedBook: ScrapedBook = {
              source_id: sourceId,
              source_url: book.url,
              title: book.title,
              author: book.author,
              price: this.parsePrice(book.price),
              currency: 'GBP',
              image_url: book.image.startsWith('http')
                ? book.image
                : new URL(book.image, this.baseUrl).href,
            };

            books.push(scrapedBook);
            this.seenUrls.add(book.url);
            this.logger.log(`✅ Queued: ${book.title.substring(0, 50)}`);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          this.logger.error(`Error scraping page: ${error}`);
        }
      },

      async failedRequestHandler({ request }, error) {
        this.logger.error(`Request failed: ${request.url}`, error);
      },
    });

    try {
      await crawler.run([pageUrl]);
    } catch (error) {
      this.logger.error('Crawler failed:', error);
    }

    return books;
  }

  /**
   * Scrape detailed product information
   */
  async scrapeBookDetail(bookUrl: string): Promise<Partial<ScrapedBook>> {
    const detail: Partial<ScrapedBook> = {
      description: '',
      publisher: '',
      isbn: '',
    };

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      navigationTimeoutSecs: 45,
      async handlePageFunction({ page }) {
        try {
          await page.waitForLoadState('networkidle');

          const detailData = await page.evaluate(() => {
            const data: Record<string, any> = {
              description: '',
              publisher: '',
              isbn: '',
            };

            // Get description
            const descSelectors = [
              '[class*="description"]',
              '[class*="summary"]',
              '[class*="synopsis"]',
              'article',
              'div[class*="details"]',
            ];

            for (const selector of descSelectors) {
              const el = document.querySelector(selector);
              if (el) {
                const text = el.textContent?.trim() || '';
                if (text && text.length > 20 && text.length < 2000) {
                  data.description = text.substring(0, 500);
                  break;
                }
              }
            }

            // Get specs/details table
            const rows = Array.from(document.querySelectorAll('tr, dt, [class*="spec"]'));
            for (const row of rows) {
              const text = row.textContent?.toLowerCase() || '';

              if (text.includes('publisher')) {
                const next = (row as any).nextElementSibling;
                data.publisher = next?.textContent?.trim()?.substring(0, 100) || '';
              }

              if (text.includes('isbn')) {
                const isbnMatch = text.match(/[\d\-]{10,}/);
                if (isbnMatch) {
                  data.isbn = isbnMatch[0];
                }
              }
            }

            return data;
          });

          Object.assign(detail, detailData);
        } catch (error) {
          this.logger.warn(`Detail scrape error for ${bookUrl}: ${error}`);
        }
      },
    });

    try {
      await crawler.run([bookUrl]);
    } catch (error) {
      this.logger.warn(`Detail crawler failed for ${bookUrl}: ${error}`);
    }

    return detail;
  }

  /**
   * Main scrape method - scrapes 50 books from World of Books
   */
  async scrape50Books(): Promise<ScrapedBook[]> {
    this.logger.log('🚀 Starting World of Books scraper - targeting 50 real books');

    try {
      // Start from books listing pages
      const pageUrls = [
        `${this.baseUrl}/books`,
        `${this.baseUrl}/books?page=2`,
        `${this.baseUrl}/books?page=3`,
      ];

      for (let i = 0; i < pageUrls.length && this.scrapedBooks.length < 50; i++) {
        const books = await this.scrapeBooksList(pageUrls[i], i + 1);
        this.scrapedBooks.push(...books);

        this.logger.log(`📊 Progress: ${this.scrapedBooks.length}/50 books`);

        if (this.scrapedBooks.length >= 50) {
          break;
        }

        // Rate limiting between pages
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // If we have enough books, scrape details
      const booksToScrape = this.scrapedBooks.slice(0, 50);
      this.logger.log(`📚 Scraping details for ${booksToScrape.length} books...`);

      for (let i = 0; i < booksToScrape.length; i++) {
        const book = booksToScrape[i];
        const detail = await this.scrapeBookDetail(book.source_url);

        if (detail.description) {
          book.description = detail.description;
        }
        if (detail.publisher) {
          book.publisher = detail.publisher;
        }
        if (detail.isbn) {
          book.isbn = detail.isbn;
        }

        if ((i + 1) % 5 === 0) {
          this.logger.log(`✅ Scraped details for ${i + 1}/${booksToScrape.length} books`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logger.log(`✅ Scrape complete: ${booksToScrape.length} books with real data and images`);
      return booksToScrape;
    } catch (error) {
      this.logger.error('Scrape failed:', error);
      throw error;
    }
  }

  /**
   * Validate that books have images
   */
  validateBooks(books: ScrapedBook[]): boolean {
    const booksWithImages = books.filter(b => b.image_url && b.image_url.length > 0);

    this.logger.log(`📸 Image validation: ${booksWithImages.length}/${books.length} books have images`);

    if (booksWithImages.length < books.length) {
      const booksWithoutImages = books.filter(b => !b.image_url || b.image_url.length === 0);
      this.logger.warn(`⚠️  ${booksWithoutImages.length} books missing images:`);
      booksWithoutImages.slice(0, 5).forEach(b => {
        this.logger.warn(`   - ${b.title}`);
      });
    }

    return booksWithImages.length > 0;
  }
}
