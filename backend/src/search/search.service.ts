import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Full-text search for products
   */
  async search(query: string, limit: number = 20) {
    this.logger.log(`🔍 Searching for: "${query}"`);

    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const results = await this.productModel
        .find({ $text: { $search: query } })
        .select('title author price currency image_url rating_avg reviews_count source_url')
        .limit(limit)
        .lean()
        .exec();

      this.logger.log(`✅ Found ${results.length} products`);
      return results;
    } catch (error) {
      this.logger.error(`Search failed:`, error);
      // Fallback to regex search if text search fails
      return this.fallbackSearch(query, limit);
    }
  }

  /**
   * Fallback regex-based search
   */
  private async fallbackSearch(query: string, limit: number) {
    this.logger.log(`📚 Using fallback search for: "${query}"`);

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const results = await this.productModel
      .find({
        $or: [{ title: regex }, { author: regex }],
      })
      .select('title author price currency image_url rating_avg reviews_count source_url')
      .limit(limit)
      .lean()
      .exec();

    return results;
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocomplete(query: string, limit: number = 10) {
    this.logger.log(`💬 Autocomplete for: "${query}"`);

    if (!query || query.trim().length === 0) {
      return [];
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escaped}`, 'i');

    try {
      // Get unique titles that match
      const titles = await this.productModel
        .distinct('title', { title: regex })
        .limit(limit)
        .exec();

      // Get unique authors that match
      const authors = await this.productModel
        .distinct('author', { author: regex })
        .limit(limit / 2)
        .exec();

      return {
        titles: titles || [],
        authors: authors || [],
      };
    } catch (error) {
      this.logger.error(`Autocomplete failed:`, error);
      return { titles: [], authors: [] };
    }
  }

  /**
   * Get available filter options
   */
  async getAvailableFilters() {
    this.logger.log(`📊 Fetching available filters`);

    try {
      // Get price range
      const priceStats = await this.productModel.aggregate([
        {
          $group: {
            _id: null,
            min_price: { $min: '$price' },
            max_price: { $max: '$price' },
          },
        },
      ]);

      const { min_price, max_price } = priceStats[0] || { min_price: 0, max_price: 0 };

      // Get rating ranges
      const ratings = [
        { label: '5 Stars', min: 4.5, max: 5 },
        { label: '4+ Stars', min: 4, max: 4.5 },
        { label: '3+ Stars', min: 3, max: 4 },
      ];

      // Get popular categories (if populated)
      const categories = await this.productModel.distinct('categories').exec();

      return {
        price_range: {
          min: Math.floor(min_price),
          max: Math.ceil(max_price),
        },
        rating_filters: ratings,
        currencies: ['GBP', 'USD', 'EUR'],
        sort_options: [
          { value: 'newest', label: 'Newest First' },
          { value: 'price-asc', label: 'Price: Low to High' },
          { value: 'price-desc', label: 'Price: High to Low' },
          { value: 'rating', label: 'Highest Rated' },
        ],
      };
    } catch (error) {
      this.logger.error(`Filter fetch failed:`, error);
      return {
        price_range: { min: 0, max: 100 },
        rating_filters: [
          { label: '5 Stars', min: 4.5, max: 5 },
          { label: '4+ Stars', min: 4, max: 4.5 },
          { label: '3+ Stars', min: 3, max: 4 },
        ],
        currencies: ['GBP', 'USD', 'EUR'],
        sort_options: [],
      };
    }
  }
}
