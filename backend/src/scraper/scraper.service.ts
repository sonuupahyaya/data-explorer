import { Injectable, Logger } from '@nestjs/common';
import { RealScraper, ScrapedNavigation, ScrapedCategory, ScrapedProduct, ScrapedProductDetail } from './real-scraper';
import { BulletproofScraper, BulletproofProduct } from './bulletproof-scraper';

/**
 * Scraper Service - Main orchestration for all scraping operations
 */
@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly scraper: RealScraper;
  private readonly bulletproof: BulletproofScraper;

  constructor() {
    this.scraper = new RealScraper();
    this.bulletproof = new BulletproofScraper();
  }

  /**
   * Scrape navigation headings from World of Books
   */
  async scrapeNavigation(): Promise<{ success: boolean; headings: ScrapedNavigation[]; count: number; timestamp: Date }> {
    this.logger.log('Starting navigation scrape...');
    try {
      const headings = await this.scraper.scrapeNavigation();
      return {
        success: true,
        headings,
        count: headings.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Navigation scrape failed:', error);
      throw error;
    }
  }

  /**
   * Scrape categories from a URL
   */
  async scrapeCategories(pageUrl: string): Promise<{ success: boolean; categories: ScrapedCategory[]; count: number; timestamp: Date }> {
    this.logger.log(`Scraping categories from ${pageUrl}`);
    try {
      const categories = await this.scraper.scrapeCategories(pageUrl);
      return {
        success: true,
        categories,
        count: categories.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Categories scrape failed:', error);
      throw error;
    }
  }

  /**
   * Scrape products from a category page
   */
  async scrapeProducts(categoryUrl: string): Promise<{ success: boolean; products: ScrapedProduct[]; count: number; timestamp: Date }> {
    this.logger.log(`Scraping products from ${categoryUrl}`);
    try {
      const products = await this.scraper.scrapeProducts(categoryUrl);
      return {
        success: true,
        products,
        count: products.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Products scrape failed:', error);
      throw error;
    }
  }

  /**
   * Scrape product detail
   */
  async scrapeProductDetail(productUrl: string): Promise<{ success: boolean; detail: ScrapedProductDetail; timestamp: Date }> {
    this.logger.log(`Scraping product detail from ${productUrl}`);
    try {
      const detail = await this.scraper.scrapeProductDetail(productUrl);
      return {
        success: true,
        detail,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Product detail scrape failed:', error);
      throw error;
    }
  }

  /**
   * Bulletproof scrape - guaranteed to work
   */
  async bulletproofScrapeProducts(categoryUrl: string): Promise<{ success: boolean; products: BulletproofProduct[]; count: number; timestamp: Date }> {
    this.logger.log(`🚀 Bulletproof scraping: ${categoryUrl}`);
    try {
      const products = await this.bulletproof.scrapeCategory(categoryUrl);
      return {
        success: true,
        products,
        count: products.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Bulletproof scrape failed:', error);
      return {
        success: false,
        products: [],
        count: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Bulletproof scrape multiple categories
   */
  async bulletproofScrapeMultiple(categoryUrls: string[]): Promise<{ success: boolean; products: BulletproofProduct[]; count: number; timestamp: Date }> {
    this.logger.log(`🚀 Bulletproof scraping ${categoryUrls.length} categories`);
    try {
      const products = await this.bulletproof.scrapeMultipleCategories(categoryUrls);
      return {
        success: true,
        products,
        count: products.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Bulletproof multi-scrape failed:', error);
      return {
        success: false,
        products: [],
        count: 0,
        timestamp: new Date(),
      };
    }
  }
}
