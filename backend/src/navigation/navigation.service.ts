import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Navigation, NavigationDocument } from '../schemas/navigation.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { ScraperService } from '../scraper/scraper.service';

@Injectable()
export class NavigationService {
  private readonly logger = new Logger(NavigationService.name);
  private readonly cacheTtl = parseInt(process.env.CACHE_TTL_SECONDS || '86400', 10); // 24 hours

  constructor(
    @InjectModel(Navigation.name) private navigationModel: Model<NavigationDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private scraperService: ScraperService,
  ) {}

  /**
   * Get all navigation headings from cache or scrape if expired
   */
  async getNavigation() {
    this.logger.log('📚 Fetching navigation headings from cache');

    // Try cached data first
    const cached = await this.navigationModel
      .find({ is_active: true })
      .select('title slug description category_count last_scraped_at -_id')
      .lean()
      .exec();

    if (cached.length > 0) {
      // Check if cache is still fresh
      const newestItem = cached.reduce((prev, current) =>
        new Date(prev.last_scraped_at || 0) > new Date(current.last_scraped_at || 0) ? prev : current,
      );

      const ageSeconds = (Date.now() - new Date(newestItem.last_scraped_at || 0).getTime()) / 1000;

      if (ageSeconds < this.cacheTtl) {
        this.logger.log(`✅ Returning ${cached.length} cached navigation items`);
        return cached;
      }

      this.logger.log('⏰ Cache expired, triggering background scrape');
      // Cache expired, trigger scrape in background
      this.refreshNavigationBackground();
      // Still return cached data while scraping in background
      return cached;
    }

    // No cached data, scrape immediately
    this.logger.log('📥 No cached data, scraping navigation now...');
    return this.refreshNavigation();
  }

  /**
   * Get categories for a navigation heading
   */
  async getCategoriesByNavigation(slug: string) {
    this.logger.log(`📚 Fetching categories for navigation: ${slug}`);

    const nav = await this.navigationModel.findOne({ slug }).exec();

    if (!nav) {
      this.logger.warn(`Navigation not found: ${slug}`);
      return [];
    }

    // Get main categories (not subcategories)
    const categories = await this.categoryModel
      .find({ navigation_id: nav._id, is_subcategory: false })
      .select('title slug description product_count last_scraped_at -_id')
      .lean()
      .exec();

    this.logger.log(`✅ Found ${categories.length} categories for ${slug}`);
    return categories;
  }

  /**
   * Refresh navigation data from World of Books (actual scrape)
   */
  async refreshNavigation() {
    this.logger.log('🕷️  Refreshing navigation from World of Books...');

    try {
      const scrapeResult = await this.scraperService.scrapeNavigation();

      if (!scrapeResult.headings || scrapeResult.headings.length === 0) {
        this.logger.warn('⚠️  No headings scraped');
        return [];
      }

      this.logger.log(`✅ Scraped ${scrapeResult.headings.length} navigation headings from World of Books`);

      const results = [];

      for (const heading of scrapeResult.headings) {
        try {
          const updated = await this.navigationModel
            .findOneAndUpdate(
              { slug: heading.slug },
              {
                title: heading.title,
                slug: heading.slug,
                last_scraped_at: new Date(),
                is_active: true,
              },
              { upsert: true, new: true },
            )
            .exec();

          results.push(updated);
          this.logger.log(`✅ Saved navigation: ${heading.title}`);
        } catch (error) {
          this.logger.error(`Error saving navigation ${heading.title}:`, error);
        }
      }

      this.logger.log(`🎉 Navigation refresh complete: ${results.length} items saved`);
      return results.map((nav) => ({
        title: nav.title,
        slug: nav.slug,
        description: nav.description,
        category_count: nav.category_count,
        last_scraped_at: nav.last_scraped_at,
      }));
    } catch (error) {
      this.logger.error('🚨 Navigation refresh failed:', error);
      throw error;
    }
  }

  /**
   * Background scrape (non-blocking)
   */
  private async refreshNavigationBackground() {
    setImmediate(async () => {
      try {
        await this.refreshNavigation();
      } catch (error) {
        this.logger.error('Background navigation refresh failed:', error);
      }
    });
  }

  /**
   * Check if cache is still valid
   */
  private async isCacheValid(lastScrapedAt: Date | null): Promise<boolean> {
    if (!lastScrapedAt) return false;
    const ageSeconds = (Date.now() - lastScrapedAt.getTime()) / 1000;
    return ageSeconds < this.cacheTtl;
  }
}
