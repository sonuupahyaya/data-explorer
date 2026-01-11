import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * World of Books Scraper using Axios + Cheerio
 * Scrapes REAL live data from https://www.worldofbooks.com
 */
@Injectable()
export class WorldOfBooksScraper {
  private readonly logger = new Logger(WorldOfBooksScraper.name);
  private readonly baseUrl = 'https://www.worldofbooks.com';

  constructor() {
    // Set up axios with user agent to avoid blocks
    axios.defaults.headers.common[
      'User-Agent'
    ] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    axios.defaults.timeout = 30000;
  }

  /**
   * Scrape navigation headings from World of Books homepage
   * Returns REAL data from the live website
   */
  async scrapeNavigation(): Promise<Array<{ title: string; slug: string; url: string }>> {
    this.logger.log(`🕷️  SCRAPING REAL DATA from ${this.baseUrl}...`);

    try {
      const response = await axios.get(this.baseUrl);
      const $ = cheerio.load(response.data);

      const headings: any[] = [];
      const seen = new Set();

      // World of Books usually has navigation in various places
      // Try to find all links that look like category links
      const navSelectors = [
        'nav a[href*="/books"]',
        'nav a[href*="/categor"]',
        'header a[href*="/books"]',
        '.navbar a[href*="/books"]',
        '.navigation a[href*="/books"]',
        'a[href*="/books"]',
      ];

      let found = false;

      for (const selector of navSelectors) {
        const elements = $(selector);
        this.logger.log(`  Trying selector "${selector}": found ${elements.length} elements`);

        elements.each((_, el) => {
          const $el = $(el);
          const href = $el.attr('href');
          const text = $el.text()?.trim();

          if (
            href &&
            text &&
            href !== '#' &&
            !href.includes('javascript') &&
            text.length > 0 &&
            text.length < 100
          ) {
            const fullUrl = href.startsWith('http') ? href : new URL(href, this.baseUrl).href;
            const slug = text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');

            if (!seen.has(slug) && slug.length > 0) {
              headings.push({ title: text, slug, url: fullUrl });
              seen.add(slug);
              found = true;
              this.logger.log(`    ✅ Found navigation: "${text}"`);
            }
          }
        });

        if (found && headings.length >= 3) {
          this.logger.log(`✅ Navigation scrape successful: ${headings.length} items found`);
          break;
        }
      }

      if (!found) {
        this.logger.warn(`⚠️  No navigation items found from website, returning fallback data`);
        // If no navigation found, return real category URLs from worldofbooks.com
        return [
          {
            title: 'Books',
            slug: 'books',
            url: 'https://www.worldofbooks.com/books',
          },
          {
            title: 'Categories',
            slug: 'categories',
            url: 'https://www.worldofbooks.com/en/categories',
          },
          {
            title: 'New Arrivals',
            slug: 'new-arrivals',
            url: 'https://www.worldofbooks.com/en/books/new',
          },
        ];
      }

      this.logger.log(`✅ Navigation scrape complete: ${headings.length} REAL items`);
      return headings;
    } catch (error) {
      this.logger.error(`🚨 Navigation scrape failed: ${error}`);
      // Return real URLs as fallback
      return [
        { title: 'Books', slug: 'books', url: 'https://www.worldofbooks.com/books' },
        { title: 'Categories', slug: 'categories', url: 'https://www.worldofbooks.com/en/categories' },
        { title: 'New', slug: 'new', url: 'https://www.worldofbooks.com/en/books/new' },
      ];
    }
  }

  /**
   * Scrape categories from a URL
   * Returns REAL product categories
   */
  async scrapeCategories(headingUrl: string): Promise<
    Array<{
      title: string;
      slug: string;
      url: string;
      product_count: number;
    }>
  > {
    this.logger.log(`🕷️  Scraping REAL categories from ${headingUrl}`);

    try {
      const response = await axios.get(headingUrl);
      const $ = cheerio.load(response.data);

      const categories: any[] = [];

      // Try multiple selectors for World of Books structure
      const selectors = [
        'a[href*="/books"][href*="/"]',
        '.category-link',
        '.subcategory',
        'div a[href*="/books/"]',
      ];

      let found = false;

      for (const selector of selectors) {
        $(selector).each((_, el) => {
          const $el = $(el);
          const titleEl = $el.find('h3, h4, span').first() || $el;
          const title = titleEl.text()?.trim() || '';
          const url = $el.attr('href') || '';

          if (
            title &&
            url &&
            !url.includes('javascript') &&
            title.length > 0 &&
            title.length < 100
          ) {
            const fullUrl = url.startsWith('http') ? url : new URL(url, this.baseUrl).href;
            categories.push({
              title,
              slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              url: fullUrl,
              product_count: 0, // Would need another request to get count
            });
            found = true;
          }
        });

        if (found && categories.length >= 5) break;
      }

      // Remove duplicates
      const unique = Array.from(new Map(categories.map((c) => [c.slug, c])).values());

      this.logger.log(`✅ Categories scrape complete: ${unique.length} REAL items`);
      return unique;
    } catch (error) {
      this.logger.error(`🚨 Categories scrape failed: ${error}`);
      return [];
    }
  }

  /**
   * Scrape REAL products from a category URL
   */
  async scrapeProducts(
    categoryUrl: string,
    pageNum: number = 1,
  ): Promise<
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
    this.logger.log(`🕷️  Scraping REAL products from ${categoryUrl}`);

    try {
      // Add pagination if needed
      const url = new URL(categoryUrl);
      if (!categoryUrl.includes('?') && pageNum > 1) {
        url.searchParams.set('page', pageNum.toString());
      }

      const response = await axios.get(url.toString());
      const $ = cheerio.load(response.data);

      const products: any[] = [];

      // Target product containers - World of Books structure
      $('[class*="product"], [class*="book"], article, .item').each((idx, el) => {
        const $el = $(el);

        try {
          // Get product info
          const linkEl = $el.find('a[href*="/books/"], a[href*="/product"]').first();
          const titleEl = $el.find('h2, h3, .title').first();
          const authorEl = $el.find('[class*="author"], .author').first();
          const priceEl = $el.find('[class*="price"], .price').first();
          const imageEl = $el.find('img').first();

          if (linkEl.attr('href') && titleEl.text()) {
            const title = titleEl.text()?.trim() || '';
            const author = authorEl.text()?.trim() || 'Unknown Author';
            const priceText = priceEl.text()?.trim() || '0';
            const productUrl = linkEl.attr('href') || '';
            const imageUrl = imageEl.attr('src') || imageEl.attr('data-src') || '';

            const fullUrl = productUrl.startsWith('http')
              ? productUrl
              : new URL(productUrl, this.baseUrl).href;
            const fullImageUrl = imageUrl
              ? imageUrl.startsWith('http')
                ? imageUrl
                : new URL(imageUrl, this.baseUrl).href
              : '';

            const priceMatch = priceText.match(/[\d.,]+/);
            const price = priceMatch
              ? parseFloat(priceMatch[0].replace(/,/g, ''))
              : 0;

            const currencyMatch = priceText.match(/[£$€]/);
            const currency = currencyMatch ? currencyMatch[0] : 'GBP';

            const idMatch = fullUrl.match(/\/books\/([^\/?]+)/);
            const sourceId = idMatch ? `wob_${idMatch[1]}` : `wob_${Date.now()}_${idx}`;

            products.push({
              source_id: sourceId,
              title,
              author,
              price,
              currency,
              image_url: fullImageUrl,
              source_url: fullUrl,
            });
          }
        } catch (e) {
          this.logger.debug(`Error parsing product element: ${e}`);
        }
      });

      // Remove duplicates by URL
      const unique = Array.from(new Map(products.map((p) => [p.source_url, p])).values());

      this.logger.log(`✅ Products scrape complete: ${unique.length} REAL items found`);
      return unique;
    } catch (error) {
      this.logger.error(`🚨 Products scrape failed: ${error}`);
      return [];
    }
  }

  /**
   * Scrape REAL product detail
   */
  async scrapeProductDetail(productUrl: string): Promise<{
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
    this.logger.log(`🕷️  Scraping REAL product detail from ${productUrl}`);

    try {
      const response = await axios.get(productUrl);
      const $ = cheerio.load(response.data);

      const detail: any = {
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
      detail.title = $('h1, [class*="title"]').first().text()?.trim() || '';

      // Extract author
      detail.author = $('[class*="author"], .author').first().text()?.trim() || '';

      // Extract description
      detail.description = $('[class*="description"], .description').first().text()?.trim() || '';

      // Extract price
      const priceEl = $('[class*="price"]').first();
      if (priceEl.text()) {
        const priceText = priceEl.text();
        const priceMatch = priceText.match(/[\d.,]+/);
        detail.price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
        const currencyMatch = priceText.match(/[£$€]/);
        detail.currency = currencyMatch ? currencyMatch[0] : 'GBP';
      }

      // Extract image
      detail.image_url = $('img[alt*="cover"], img[src*="cover"]').first().attr('src') || '';

      // Extract other details from specs/table
      $('dt, [class*="label"]').each((_, el) => {
        const $el = $(el);
        const label = $el.text()?.toLowerCase() || '';
        const value = $el.next().text()?.trim() || '';

        if (label.includes('publisher')) detail.publisher = value;
        if (label.includes('isbn')) {
          detail.isbn = value;
          detail.specs['ISBN'] = value;
        }
        if (label.includes('date')) {
          detail.publication_date = value;
          detail.specs['Publication Date'] = value;
        }
      });

      this.logger.log(`✅ Product detail scraped: "${detail.title}"`);
      return detail;
    } catch (error) {
      this.logger.error(`🚨 Product detail scrape failed: ${error}`);
      return {
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
    }
  }
}
