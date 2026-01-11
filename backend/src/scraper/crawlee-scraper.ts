import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Advanced World of Books Scraper using Crawlee patterns
 * This is a high-quality scraper optimized for worldofbooks.com
 */
@Injectable()
export class CrawleeScraperService {
  private readonly logger = new Logger(CrawleeScraperService.name);
  private readonly baseUrl = 'https://www.worldofbooks.com';
  private readonly userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  constructor() {
    axios.defaults.headers.common['User-Agent'] = this.userAgent;
    axios.defaults.timeout = 30000;
  }

  /**
   * Scrape navigation with improved selectors
   */
  async scrapeNavigationAdvanced(): Promise<
    Array<{ title: string; slug: string; url: string }>
  > {
    this.logger.log('🕷️  Advanced navigation scraping...');

    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        },
      });

      const $ = cheerio.load(response.data);
      const items: any[] = [];
      const seen = new Set<string>();

      // Try to find main navigation
      const navElements = $('nav ul li a, [class*="menu"] a, [class*="nav"] a');

      navElements.each((_, el) => {
        const $el = $(el);
        const text = $el.text()?.trim();
        let href = $el.attr('href');

        if (!href || !text || seen.has(text)) return;

        // Ensure absolute URL
        if (href && !href.startsWith('http')) {
          href = new URL(href, this.baseUrl).href;
        }

        const slug = this.createSlug(text);

        if (slug && text.length > 2 && text.length < 100) {
          items.push({ title: text, slug, url: href });
          seen.add(text);
          this.logger.log(`  ✅ Found: ${text}`);
        }
      });

      // If not enough items, return fallback with real world of books URLs
      if (items.length < 2) {
        this.logger.warn(`  ⚠️  Only found ${items.length} items, using fallback`);
        return [
          {
            title: 'Browse Books',
            slug: 'books',
            url: `${this.baseUrl}/books`,
          },
          {
            title: 'Categories',
            slug: 'categories',
            url: `${this.baseUrl}/en/categories`,
          },
        ];
      }

      this.logger.log(`✅ Navigation scrape complete: ${items.length} items`);
      return items;
    } catch (error) {
      this.logger.error(`Navigation scrape failed:`, error);
      return [];
    }
  }

  /**
   * Scrape books from a category page
   */
  async scrapeCategoryBooks(categoryUrl: string, pageNum: number = 1): Promise<
    Array<{
      source_id: string;
      title: string;
      author: string;
      price: number;
      currency: string;
      image_url: string;
      source_url: string;
    }>
  > {
    this.logger.log(`🕷️  Scraping books from ${categoryUrl}`);

    try {
      // Add pagination if needed
      let url = new URL(categoryUrl);
      if (pageNum > 1) {
        url.searchParams.set('page', pageNum.toString());
      }

      const response = await axios.get(url.toString(), {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const $ = cheerio.load(response.data);
      const books: any[] = [];
      const seen = new Set<string>();

      // Common book container selectors
      const bookSelectors = [
        '[class*="product"]',
        '[class*="book"]',
        'article',
        '[class*="item"]',
        '.book-item',
        '.product-item',
      ];

      let foundBooks = 0;

      for (const selector of bookSelectors) {
        $(selector).each((_, el) => {
          const $item = $(el);

          // Get essential data
          const titleEl = $item.find('h2, h3, .title, .name').first();
          const linkEl = $item.find('a[href*="/books"], a[href*="/product"]').first();
          const authorEl = $item.find('[class*="author"], .author').first();
          const priceEl = $item.find('[class*="price"], .price').first();
          const imageEl = $item.find('img').first();

          const title = titleEl.text()?.trim();
          const href = linkEl.attr('href');
          const author = authorEl.text()?.trim() || 'Unknown';
          const priceText = priceEl.text()?.trim() || '';
          const image = imageEl.attr('src') || imageEl.attr('data-src') || '';

          if (!title || !href || seen.has(href)) return;

          try {
            const fullUrl = href.startsWith('http') ? href : new URL(href, this.baseUrl).href;
            const fullImageUrl = image
              ? image.startsWith('http')
                ? image
                : new URL(image, this.baseUrl).href
              : '';

            const priceMatch = priceText.match(/[\d.,]+/);
            const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;

            const currencyMatch = priceText.match(/[£$€¥₹]/);
            const currency = currencyMatch ? currencyMatch[0] : 'GBP';

            const idMatch = fullUrl.match(/\/books\/([^\/?]+)/);
            const sourceId = idMatch ? `wob_${idMatch[1]}` : `wob_${Date.now()}_${foundBooks}`;

            books.push({
              source_id: sourceId,
              title: title.substring(0, 255),
              author: author.substring(0, 255),
              price,
              currency,
              image_url: fullImageUrl,
              source_url: fullUrl,
            });

            seen.add(href);
            foundBooks++;
            this.logger.log(`  ✅ Found book: ${title.substring(0, 50)}`);
          } catch (e) {
            this.logger.debug(`  Error parsing book: ${e}`);
          }
        });

        if (foundBooks >= 10) break;
      }

      this.logger.log(`✅ Books scrape complete: ${foundBooks} items found`);
      return books;
    } catch (error) {
      this.logger.error(`Books scrape failed:`, error);
      return [];
    }
  }

  /**
   * Scrape detailed product information
   */
  async scrapeProductDetailAdvanced(productUrl: string): Promise<{
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
  }> {
    this.logger.log(`🕷️  Scraping product detail: ${productUrl}`);

    const emptyDetail = {
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

    try {
      const response = await axios.get(productUrl);
      const $ = cheerio.load(response.data);

      const detail = { ...emptyDetail };

      // Extract title
      detail.title = $('h1').first().text()?.trim() || $('[class*="title"]').first().text()?.trim() || '';

      // Extract author
      detail.author =
        $('[class*="author"]').first().text()?.trim() || $('[class*="by"]').first().text()?.trim() || '';

      // Extract description
      detail.description =
        $('[class*="description"], [class*="summary"]')
          .first()
          .text()
          ?.trim() || '';

      // Extract price
      const priceText = $('[class*="price"]').first().text()?.trim() || '';
      const priceMatch = priceText.match(/[\d.,]+/);
      detail.price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
      const currencyMatch = priceText.match(/[£$€]/);
      detail.currency = currencyMatch ? currencyMatch[0] : 'GBP';

      // Extract rating
      const ratingText = $('[class*="rating"], [class*="stars"]').first().text()?.trim() || '';
      const ratingMatch = ratingText.match(/[\d.]+/);
      detail.rating_avg = ratingMatch ? parseFloat(ratingMatch[0]) : 0;

      // Extract reviews count
      const reviewsMatch = ratingText.match(/(\d+)\s*reviews?/i);
      detail.reviews_count = reviewsMatch ? parseInt(reviewsMatch[1], 10) : 0;

      // Extract image
      detail.image_url =
        $('img[alt*="cover"], img[src*="cover"]').first().attr('src') || '';

      // Extract specs from definition lists or tables
      $('dt, [class*="label"]').each((i, el) => {
        const $el = $(el);
        const label = $el.text()?.toLowerCase().trim() || '';
        const value = $el.next().text()?.trim() || '';

        if (label.includes('publisher')) detail.publisher = value;
        if (label.includes('isbn')) {
          detail.isbn = value;
          detail.specs['ISBN'] = value;
        }
        if (label.includes('date') || label.includes('published')) {
          detail.publication_date = value;
          detail.specs['Publication Date'] = value;
        }
        if (label && value && label.length < 50) {
          detail.specs[this.capitalizeFirstLetter(label)] = value;
        }
      });

      this.logger.log(`✅ Product detail scraped: "${detail.title}"`);
      return detail;
    } catch (error) {
      this.logger.error(`Product detail scrape failed:`, error);
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

  /**
   * Helper: Capitalize first letter
   */
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
