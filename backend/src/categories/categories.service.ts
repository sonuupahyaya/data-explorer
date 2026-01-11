import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Navigation, NavigationDocument } from '../schemas/navigation.schema';
import { ScraperService } from '../scraper/scraper.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly cacheTtl = parseInt(process.env.CACHE_TTL_SECONDS || '86400', 10);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Navigation.name) private navigationModel: Model<NavigationDocument>,
    private scraperService: ScraperService,
  ) {}

  /**
   * Get all categories
   */
  async getAllCategories() {
    this.logger.log('📚 Fetching all categories');

    const categories = await this.categoryModel
      .find({ is_subcategory: false })
      .select('title slug description product_count last_scraped_at')
      .lean()
      .exec();

    this.logger.log(`✅ Found ${categories.length} categories`);
    return categories;
  }

  /**
   * Get categories by navigation slug
   */
  async getCategoriesByNavigation(navigationSlug: string) {
    this.logger.log(`📚 Fetching categories for navigation: ${navigationSlug}`);

    const nav = await this.navigationModel.findOne({ slug: navigationSlug }).exec();

    if (!nav) {
      this.logger.warn(`Navigation not found: ${navigationSlug}`);
      throw new NotFoundException(`Navigation "${navigationSlug}" not found`);
    }

    const categories = await this.categoryModel
      .find({
        navigation_id: nav._id,
        is_subcategory: false,
      })
      .select('title slug description product_count last_scraped_at')
      .lean()
      .exec();

    this.logger.log(`✅ Found ${categories.length} categories for ${navigationSlug}`);
    return categories;
  }

  /**
   * Get category by slug with relationships
   */
  async getCategoryBySlug(slug: string) {
    this.logger.log(`📚 Fetching category: ${slug}`);

    const category = await this.categoryModel
      .findOne({ slug })
      .populate('navigation_id', 'title slug')
      .exec();

    if (!category) {
      this.logger.warn(`Category not found: ${slug}`);
      throw new NotFoundException(`Category "${slug}" not found`);
    }

    // Check cache freshness
    const isCacheFresh = await this.isCacheValid(category.last_scraped_at);
    if (!isCacheFresh) {
      this.logger.log(`⏰ Cache expired for category ${slug}, triggering background scrape`);
      this.refreshCategoryBackground(slug);
    }

    return category;
  }

  /**
   * Get subcategories for a category
   */
  async getSubcategories(slug: string) {
    this.logger.log(`📚 Fetching subcategories for: ${slug}`);

    const parent = await this.categoryModel.findOne({ slug }).exec();

    if (!parent) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }

    const subcategories = await this.categoryModel
      .find({
        parent_id: parent._id,
        is_subcategory: true,
      })
      .select('title slug description product_count')
      .lean()
      .exec();

    this.logger.log(`✅ Found ${subcategories.length} subcategories`);
    return subcategories;
  }

  /**
   * Refresh category data from World of Books
   */
  async refreshCategory(slug: string) {
    this.logger.log(`🕷️  Refreshing category: ${slug}`);

    try {
      const category = await this.categoryModel.findOne({ slug }).exec();

      if (!category) {
        throw new NotFoundException(`Category "${slug}" not found`);
      }

      // Mark as refreshed
      const updated = await this.categoryModel
        .findByIdAndUpdate(
          category._id,
          {
            last_scraped_at: new Date(),
          },
          { new: true },
        )
        .exec();

      this.logger.log(`✅ Category refreshed: ${slug}`);
      return updated;
    } catch (error) {
      this.logger.error(`Category refresh failed for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Create or update category
   */
  async createOrUpdateCategory(data: any, navigationId: any) {
    try {
      const existing = await this.categoryModel
        .findOne({
          slug: data.slug,
          navigation_id: navigationId,
        })
        .exec();

      if (existing) {
        // Update
        return await this.categoryModel
          .findByIdAndUpdate(
            existing._id,
            {
              ...data,
              last_scraped_at: new Date(),
            },
            { new: true },
          )
          .exec();
      }

      // Create
      const category = new this.categoryModel({
        ...data,
        navigation_id: navigationId,
        last_scraped_at: new Date(),
      });

      return await category.save();
    } catch (error) {
      this.logger.error(`Error saving category ${data.title}:`, error);
      throw error;
    }
  }

  /**
   * Check if cache is still valid
   */
  private async isCacheValid(lastScrapedAt: Date | null): Promise<boolean> {
    if (!lastScrapedAt) return false;
    const ageSeconds = (Date.now() - lastScrapedAt.getTime()) / 1000;
    return ageSeconds < this.cacheTtl;
  }

  /**
   * Background refresh (non-blocking)
   */
  private async refreshCategoryBackground(slug: string) {
    setImmediate(async () => {
      try {
        await this.refreshCategory(slug);
      } catch (error) {
        this.logger.error(`Background category refresh failed for ${slug}:`, error);
      }
    });
  }
}
