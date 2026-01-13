import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { ScraperService } from '../scraper/scraper.service';
import { ImageProxyService } from '../image-proxy/image-proxy.service';

interface GetProductsOptions {
  category?: string;
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  sample?: boolean;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly cacheTtl = parseInt(process.env.CACHE_TTL_SECONDS || '86400', 10);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private scraperService: ScraperService,
    private imageProxyService: ImageProxyService,
  ) {}

  /**
   * Convert original image URL to proxied URL
   * This prevents CORS and hotlink blocking issues
   */
  private getProxiedImageUrl(originalUrl: string | null): string | null {
    if (!originalUrl) return null;
    
    try {
      const apiUrl = process.env.API_URL || 'http://localhost:3001';
      return `${apiUrl}/api/image?url=${encodeURIComponent(originalUrl)}`;
    } catch (error) {
      this.logger.warn(`Failed to create proxied URL for: ${originalUrl}`);
      return originalUrl; // Fallback to original
    }
  }

  /**
   * Get paginated products
   */
  async getProducts(options: GetProductsOptions) {
    const { category, page, limit, search, sort, sample } = options;
    const skip = (page - 1) * limit;

    this.logger.log(`📚 Fetching products: sample=${sample}, category=${category}, page=${page}, search=${search}`);

    let query: any = { is_available: true };
    
    // If sample is true, only get first 50 products
    if (sample) {
      this.logger.log('📦 Returning sample seeded products');
    }

    // Filter by category
    if (category) {
      const cat = await this.categoryModel.findOne({ slug: category }).exec();
      if (cat) {
        query.categories = cat._id;
      }
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortField: any = { createdAt: -1 }; // newest by default
    if (sort === 'price-asc') {
      sortField = { price: 1 };
    } else if (sort === 'price-desc') {
      sortField = { price: -1 };
    } else if (sort === 'rating') {
      sortField = { rating_avg: -1 };
    }

    const total = await this.productModel.countDocuments(query).exec();
    const products = await this.productModel
      .find(query)
      .select('title author price currency image_url rating_avg reviews_count source_url')
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Convert image URLs to proxied URLs
    const productsWithProxiedImages = products.map(product => ({
      ...product,
      image_url: this.getProxiedImageUrl(product.image_url),
    }));

    this.logger.log(`✅ Found ${products.length} products (total: ${total})`);

    return {
      data: productsWithProxiedImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product detail with reviews
   */
  async getProductDetail(id: string) {
    this.logger.log(`📖 Fetching product detail: ${id}`);

    const product = await this.productModel.findById(id).exec();

    if (!product) {
      this.logger.warn(`Product not found: ${id}`);
      throw new NotFoundException('Product not found');
    }

    const reviews = await this.reviewModel
      .find({ product_id: product._id })
      .sort({ created_at: -1 })
      .limit(10)
      .lean()
      .exec();

    this.logger.log(`✅ Product found: ${product.title} with ${reviews.length} reviews`);

    const productObj = product.toObject();
    return {
      ...productObj,
      image_url: this.getProxiedImageUrl(productObj.image_url),
      reviews,
    };
  }

  /**
   * Create or update product
   */
  async createOrUpdateProduct(data: any) {
    try {
      const existing = await this.productModel.findOne({ source_url: data.source_url }).exec();

      if (existing) {
        // Update
        return await this.productModel
          .findByIdAndUpdate(existing._id, { ...data, last_scraped_at: new Date() }, { new: true })
          .exec();
      }

      // Create
      const product = new this.productModel({
        ...data,
        last_scraped_at: new Date(),
      });

      return await product.save();
    } catch (error) {
      this.logger.error(`Error saving product ${data.title}:`, error);
      throw error;
    }
  }

  /**
   * Refresh product data from World of Books
   */
  async refreshProduct(id: string) {
    this.logger.log(`🕷️  Refreshing product: ${id}`);

    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      const detail = await this.scraperService.scrapeProductDetail(product.source_url);

      const updated = await this.productModel
        .findByIdAndUpdate(
          id,
          {
            ...detail,
            last_scraped_at: new Date(),
          },
          { new: true },
        )
        .exec();

      this.logger.log(`✅ Product refreshed: ${product.title}`);
      return updated;
    } catch (error) {
      this.logger.error(`Product refresh failed for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Scrape and save products from a category
   */
  async scrapeAndSaveProductsFromCategory(categoryUrl: string) {
    this.logger.log(`🕷️  Scraping products from ${categoryUrl}`);

    try {
      const scrapeResult = await this.scraperService.scrapeProducts(categoryUrl);

      if (!scrapeResult.products || scrapeResult.products.length === 0) {
        this.logger.warn('⚠️  No products scraped');
        return [];
      }

      this.logger.log(`✅ Scraped ${scrapeResult.products.length} products`);

      const savedProducts = [];

      for (const productData of scrapeResult.products) {
        try {
          const saved = await this.createOrUpdateProduct(productData);
          savedProducts.push(saved);
        } catch (error) {
          this.logger.error(`Error saving product ${productData.title}:`, error);
        }
      }

      this.logger.log(`🎉 Saved ${savedProducts.length} products to database`);
      return savedProducts;
    } catch (error) {
      this.logger.error('Product scraping failed:', error);
      throw error;
    }
  }

  /**
   * Check if cache is valid
   */
  private async isCacheValid(lastScrapedAt: Date | null): Promise<boolean> {
    if (!lastScrapedAt) return false;
    const ageSeconds = (Date.now() - lastScrapedAt.getTime()) / 1000;
    return ageSeconds < this.cacheTtl;
  }

  /**
   * Queue a category for scraping
   * (Placeholder for bull queue implementation)
   */
  async queueCategoryScrape(slug: string) {
    this.logger.log(`📡 Queuing category scrape: ${slug}`);
    
    // TODO: Implement Bull queue integration
    // For now, return pending status
    return {
      status: 'queued',
      message: `Category '${slug}' queued for scraping`,
      jobId: `job_${Date.now()}`,
    };
  }

  /**
   * Queue refresh of stale products
   */
  async queueRefreshStale() {
    this.logger.log(`📡 Queuing refresh of stale products`);
    
    const staleProducts = await this.productModel
      .find({
        $or: [
          { last_scraped_at: null },
          { last_scraped_at: { $lt: new Date(Date.now() - this.cacheTtl * 1000) } },
        ],
      })
      .select('_id source_url')
      .limit(50)
      .exec();

    this.logger.log(`✅ Found ${staleProducts.length} stale products to refresh`);

    // TODO: Queue each for scraping
    return {
      status: 'queued',
      message: `${staleProducts.length} stale products queued for refresh`,
      jobId: `job_${Date.now()}`,
    };
  }

  /**
   * Get scraping status
   */
  async getScrapingStatus() {
    const totalProducts = await this.productModel.countDocuments();
    
    const staleCount = await this.productModel.countDocuments({
      $or: [
        { last_scraped_at: null },
        { last_scraped_at: { $lt: new Date(Date.now() - this.cacheTtl * 1000) } },
      ],
    });

    const withImages = await this.productModel.countDocuments({
      image_url: { $exists: true, $ne: null },
    });

    return {
      totalProducts,
      staleProducts: staleCount,
      productsWithImages: withImages,
      cacheValidity: {
        ttlSeconds: this.cacheTtl,
        ttlHours: Math.round(this.cacheTtl / 3600),
      },
    };
  }
}
