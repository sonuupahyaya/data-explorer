import { Injectable, Logger } from '@nestjs/common';
import * as axios from 'axios';
import * as cheerio from 'cheerio';

export interface RealBook {
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
export class RealWorldOfBooksScraperService {
  private readonly logger = new Logger(RealWorldOfBooksScraperService.name);
  private readonly baseUrl = 'https://www.worldofbooks.com/en-gb';

  /**
   * Extract product ID from URL
   */
  private extractProductId(url: string): string {
    const matches = url.match(/\/en-gb\/books\/([^/?]+)/);
    return matches ? matches[1] : url.split('/').pop() || 'unknown';
  }

  /**
   * Parse price from text
   */
  private parsePrice(priceText: string): number {
    const match = priceText.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  /**
   * Fetch a page and extract books
   */
  async scrapePageWithAxios(pageUrl: string): Promise<RealBook[]> {
    const books: RealBook[] = [];

    try {
      this.logger.log(`🕷️  Fetching: ${pageUrl}`);

      const response = await axios.default.get(pageUrl, {
        timeout: 30000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Get all book containers - try multiple selectors
      const selectors = ['div[data-testid*="product"]', 'article.product', 'div.book-item', 'li.product'];

      let bookElements: any = null;
      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          bookElements = elements;
          this.logger.log(`✅ Found ${elements.length} books using selector: ${selector}`);
          break;
        }
      }

      if (!bookElements || bookElements.length === 0) {
        // Fallback: look for any product links
        bookElements = $('a[href*="/en-gb/books/"]').closest('div, article, li');
        this.logger.log(`⚠️  Using fallback selector - found ${bookElements.length} items`);
      }

      // Extract book data
      bookElements.each((index, element) => {
        try {
          const $element = $(element);

          // Get product link
          const linkEl = $element.find('a[href*="/en-gb/books/"]').first();
          const url = linkEl.attr('href');

          if (!url) return;

          const fullUrl = url.startsWith('http') ? url : new URL(url, this.baseUrl).href;

          // Get title
          const titleEl = $element.find('h2, h3, a[href*="/books/"]').first();
          const title = titleEl.text().trim();

          if (!title || title.length === 0) return;

          // Get author - look for "by Author Name" or author field
          let author = 'Unknown';
          const authorText = $element.text();
          const authorMatch = authorText.match(/by\s+([^,\n]+)/i) || authorText.match(/author[:\s]+([^,\n]+)/i);
          if (authorMatch) {
            author = authorMatch[1].trim().substring(0, 100);
          }

          // Get price
          const priceEl = $element.find('[class*="price"]').first();
          const priceText = priceEl.text().trim() || '0';
          const price = this.parsePrice(priceText);

          // Get image - multiple strategies
          let imageUrl = '';

          // Strategy 1: Find image in element
          const imgEl = $element.find('img[src*=""], img[data-src*=""]').first();
          if (imgEl.length > 0) {
            imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
          }

          // Strategy 2: Look for picture tag
          if (!imageUrl) {
            const pictureImg = $element.find('picture img').first();
            if (pictureImg.length > 0) {
              imageUrl = pictureImg.attr('src') || '';
            }
          }

          // Strategy 3: Look for srcset
          if (!imageUrl) {
            const imgWithSrcset = $element.find('img[srcset]').first();
            if (imgWithSrcset.length > 0) {
              const srcset = imgWithSrcset.attr('srcset') || '';
              const srcsetMatch = srcset.match(/([^\s]+)\s+/);
              if (srcsetMatch) {
                imageUrl = srcsetMatch[1];
              }
            }
          }

          // Strategy 4: First image in element
          if (!imageUrl) {
            const firstImg = $element.find('img').first();
            if (firstImg.length > 0) {
              imageUrl = firstImg.attr('src') || firstImg.attr('data-src') || '';
            }
          }

          // Make absolute URL if needed
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, this.baseUrl).href;
          }

          // Create book object
          if (title && fullUrl) {
            const sourceId = this.extractProductId(fullUrl);

            const book: RealBook = {
              source_id: sourceId,
              source_url: fullUrl,
              title: title.substring(0, 200),
              author,
              price,
              currency: 'GBP',
              image_url: imageUrl,
            };

            books.push(book);
            this.logger.log(
              `✅ Extracted: "${title.substring(0, 40)}" by ${author.substring(0, 20)} - Image: ${imageUrl ? '✅' : '❌'}`
            );
          }
        } catch (e) {
          this.logger.debug(`Skipped malformed item: ${e}`);
        }
      });

      this.logger.log(`✅ Page complete: ${books.length} books extracted`);
      return books;
    } catch (error) {
      this.logger.error(`Error fetching page: ${error}`);
      return [];
    }
  }

  /**
   * Scrape book detail page
   */
  async scrapeBookDetail(bookUrl: string): Promise<Partial<RealBook>> {
    const detail: Partial<RealBook> = {
      description: '',
      publisher: '',
      isbn: '',
    };

    try {
      const response = await axios.default.get(bookUrl, {
        timeout: 30000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      // Get description
      const descSelector = [
        '[class*="description"]',
        '[class*="summary"]',
        '[class*="synopsis"]',
        'article',
        'div.details',
      ];

      for (const selector of descSelector) {
        const descEl = $(selector).first();
        if (descEl.length > 0) {
          const text = descEl.text().trim();
          if (text && text.length > 20 && text.length < 2000) {
            detail.description = text.substring(0, 500);
            break;
          }
        }
      }

      // Get specs from table or list
      const rows = $('tr, dt, [class*="spec"]');
      rows.each((i, el) => {
        const $row = $(el);
        const text = $row.text().toLowerCase();

        if (text.includes('publisher')) {
          const next = $row.next();
          detail.publisher = next.text().trim().substring(0, 100);
        }

        if (text.includes('isbn')) {
          const isbnMatch = text.match(/[\d\-]{10,}/);
          if (isbnMatch) {
            detail.isbn = isbnMatch[0];
          }
        }
      });

      return detail;
    } catch (error) {
      this.logger.warn(`Detail scrape error: ${error}`);
      return detail;
    }
  }

  /**
   * Main scrape - get 50 real books from World of Books
   */
  async scrapeRealBooks(targetCount: number = 50): Promise<RealBook[]> {
    this.logger.log(`🚀 Starting real World of Books scraper - targeting ${targetCount} books`);

    const allBooks: RealBook[] = [];
    const seenUrls = new Set<string>();

    // Scrape multiple pages
    const pageUrls = [
      `${this.baseUrl}/books`,
      `${this.baseUrl}/books?page=2`,
      `${this.baseUrl}/books?page=3`,
      `${this.baseUrl}/books?page=4`,
    ];

    for (const pageUrl of pageUrls) {
      if (allBooks.length >= targetCount) break;

      const books = await this.scrapePageWithAxios(pageUrl);

      for (const book of books) {
        if (!seenUrls.has(book.source_url)) {
          allBooks.push(book);
          seenUrls.add(book.source_url);
        }
      }

      this.logger.log(`📊 Progress: ${allBooks.length}/${targetCount} books`);

      if (allBooks.length < targetCount) {
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Scrape details for better data
    this.logger.log(`📚 Scraping details for ${Math.min(allBooks.length, targetCount)} books...`);
    const booksToReturn = allBooks.slice(0, targetCount);

    for (let i = 0; i < booksToReturn.length; i++) {
      const detail = await this.scrapeBookDetail(booksToReturn[i].source_url);

      if (detail.description) {
        booksToReturn[i].description = detail.description;
      }
      if (detail.publisher) {
        booksToReturn[i].publisher = detail.publisher;
      }
      if (detail.isbn) {
        booksToReturn[i].isbn = detail.isbn;
      }

      if ((i + 1) % 10 === 0) {
        this.logger.log(`✅ Scraped details for ${i + 1}/${booksToReturn.length}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    this.logger.log(`✅ Scrape complete: ${booksToReturn.length} real books from worldofbooks.com`);
    return booksToReturn;
  }

  /**
   * Validate books have images
   */
  validateBooks(books: RealBook[]): { valid: number; invalid: number; booksWithImages: RealBook[] } {
    const booksWithImages = books.filter(b => b.image_url && b.image_url.length > 10);
    const invalid = books.length - booksWithImages.length;

    this.logger.log(`📸 Image validation: ${booksWithImages.length}/${books.length} books have images`);

    if (invalid > 0) {
      this.logger.warn(`⚠️  ${invalid} books missing images`);
    }

    return {
      valid: booksWithImages.length,
      invalid,
      booksWithImages,
    };
  }
}
