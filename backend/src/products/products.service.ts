import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Navigation, NavigationDocument } from '../schemas/navigation.schema';
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
  
  // Safety lock to prevent concurrent scraping
  private isScrapingInProgress = false;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Navigation.name) private navigationModel: Model<NavigationDocument>,
    private scraperService: ScraperService,
    private imageProxyService: ImageProxyService,
  ) {}

  /**
   * Return original image URL without proxying at backend level
   * The frontend will proxy via getProxiedImage() which prevents double-proxying
   */
  private getProxiedImageUrl(originalUrl: string | null): string | null {
    if (!originalUrl) return null;
    
    // Return the original URL - let frontend handle proxying
    // This prevents the double-proxy infinite loop issue
    return originalUrl;
  }

  /**
   * Find all products - auto-scrapes if DB is empty
   * This is the main entry point for data retrieval
   */
  async findAll() {
    this.logger.log('📚 findAll() called - checking if DB needs auto-scraping');
    
    // Count products in MongoDB
    const totalCount = await this.productModel.countDocuments().exec();
    
    if (totalCount === 0) {
      this.logger.log('Auto-scrape triggered');
      
      // Safety lock: prevent concurrent scrapes from multiple requests
      if (!this.isScrapingInProgress) {
        this.isScrapingInProgress = true;
        try {
          // Scrape all categories
          await this.scrapeAndSaveDefaultCategories();
          this.logger.log('✅ Auto-scrape completed successfully');
        } catch (error) {
          this.logger.error('❌ Auto-scrape failed:', error);
          // Continue anyway - return results if available
        } finally {
          this.isScrapingInProgress = false;
        }
      } else {
        this.logger.log('⏳ Scrape already in progress, waiting...');
        // Wait for ongoing scrape to complete (max 30 seconds)
        let attempts = 0;
        while (this.isScrapingInProgress && attempts < 300) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        this.logger.log('✅ Previous scrape completed, proceeding with query');
      }
    }

    // After auto-scrape check, query MongoDB and return all products
    const products = await this.productModel
      .find({ is_available: true })
      .select('_id title author price currency image_url rating_avg reviews_count source_url')
      .lean()
      .exec();

    this.logger.log(`✅ findAll() returned ${products.length} products`);

    // Map _id to id and apply image URL transformation
    return products.map(product => ({
      ...product,
      id: product._id?.toString(),
      image_url: this.getProxiedImageUrl(product.image_url),
    }));
  }

  /**
   * Get paginated products
   */
  async getProducts(options: GetProductsOptions) {
    const { category, page, limit, search, sort, sample } = options;
    const skip = (page - 1) * limit;

    this.logger.log(`📚 Fetching products: sample=${sample}, category=${category}, page=${page}, search=${search}`);

    // Always check if DB is empty and auto-scrape if needed
    const totalCount = await this.productModel.countDocuments().exec();
    if (totalCount === 0) {
      // Safety lock: prevent concurrent scrapes from multiple requests
      if (!this.isScrapingInProgress) {
        this.isScrapingInProgress = true;
        this.logger.log('Auto-scrape triggered');
        try {
          await this.scrapeAndSaveDefaultCategories();
          this.logger.log('✅ Auto-scrape completed successfully');
        } catch (error) {
          this.logger.error('❌ Auto-scrape failed:', error);
          // Continue anyway - return empty results if scraping fails
        } finally {
          this.isScrapingInProgress = false;
        }
      } else {
        this.logger.log('⏳ Scrape already in progress, waiting...');
        // Wait for ongoing scrape to complete
        let attempts = 0;
        while (this.isScrapingInProgress && attempts < 300) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        this.logger.log('✅ Previous scrape completed, proceeding with query');
      }
    }

    let query: any = { is_available: true };

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
      .select('_id title author price currency image_url rating_avg reviews_count source_url')
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Convert image URLs to proxied URLs and map _id to id
    const productsWithProxiedImages = products.map(product => ({
      ...product,
      id: product._id?.toString(),
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
      id: productObj._id?.toString(),
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
   * CRITICAL: This is the main data persistence pipeline
   * FIXED: Now accepts categoryId and links products to category
   */
  async scrapeAndSaveProductsFromCategory(categoryUrl: string, categoryId?: any) {
    this.logger.log(`🕷️  Scraping products from ${categoryUrl}`);

    try {
      const scrapeResult = await this.scraperService.scrapeProducts(categoryUrl);

      if (!scrapeResult.products || scrapeResult.products.length === 0) {
        this.logger.warn(`⚠️  No products scraped from ${categoryUrl}`);
        return [];
      }

      this.logger.log(`✅ Scraped ${scrapeResult.products.length} products from World of Books`);

      const savedProducts = [];
      const failedProducts = [];

      for (const productData of scrapeResult.products) {
        try {
          // Add category to product data if categoryId provided
          const dataWithCategory = categoryId 
            ? { ...productData, categories: [categoryId] }
            : productData;
          
          const saved = await this.createOrUpdateProduct(dataWithCategory);
          savedProducts.push(saved);
          this.logger.debug(`✅ Saved product: ${productData.title}`);
        } catch (error) {
          this.logger.error(`❌ Error saving product ${productData.title}:`, error);
          failedProducts.push({ title: productData.title, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      this.logger.log(`🎉 Saved ${savedProducts.length}/${scrapeResult.products.length} products to MongoDB`);
      this.logger.log(`✅ Inserted ${savedProducts.length} products into MongoDB`);
      if (failedProducts.length > 0) {
        this.logger.warn(`⚠️  Failed to save ${failedProducts.length} products`);
      }
      
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
   * Scrape and save default categories (World of Books Fiction, Non-Fiction, etc.)
   * FIXED: Uses bulletproof scraper for reliability
   */
  private async scrapeAndSaveDefaultCategories() {
    this.logger.log('🌱 Scraping default categories from World of Books...');
    
    // Define default categories to scrape
    const defaultCategories = [
      { title: 'Fiction', slug: 'fiction', url: 'https://www.worldofbooks.com/en-gb/fiction' },
      { title: 'Non-Fiction', slug: 'non-fiction', url: 'https://www.worldofbooks.com/en-gb/non-fiction' },
      { title: 'Children', slug: 'children', url: 'https://www.worldofbooks.com/en-gb/children' },
    ];

    let totalProductsInserted = 0;
    
    // Create or get the default navigation
    let navigation = await this.navigationModel.findOne({ slug: 'books' }).exec();
    if (!navigation) {
      this.logger.log('📚 Creating default navigation...');
      navigation = await this.navigationModel.create({
        slug: 'books',
        title: 'Books',
        description: 'All Books',
        is_active: true,
      });
      this.logger.log(`✅ Navigation created: ${navigation._id}`);
    }
    
    for (const cat of defaultCategories) {
      try {
        this.logger.log(`📖 Scraping category: ${cat.title}...`);
        
        // Properly create or update category with navigation_id
        const category = await this.categoryModel.findOneAndUpdate(
          { slug: cat.slug },
          {
            title: cat.title,
            slug: cat.slug,
            navigation_id: navigation._id,
            is_subcategory: false,
            last_scraped_at: new Date(),
            depth: 0,
          },
          { upsert: true, new: true },
        ).exec();

        this.logger.log(`✅ Category saved: ${cat.title} (ID: ${category._id})`);

        // Use bulletproof scraper instead
        const scrapeResult = await this.scraperService.bulletproofScrapeProducts(cat.url);
        
        if (scrapeResult.success && scrapeResult.products.length > 0) {
          // Save each product
          for (const productData of scrapeResult.products) {
            try {
              const dataWithCategory = { 
                title: productData.title,
                author: productData.author,
                price: productData.price,
                currency: productData.currency,
                image_url: productData.image_url,
                source_url: productData.source_url,
                source_id: productData.source_id,
                categories: [category._id] 
              };
              await this.createOrUpdateProduct(dataWithCategory);
            } catch (error) {
              this.logger.debug(`Error saving product: ${productData.title}`);
            }
          }
          
          totalProductsInserted += scrapeResult.products.length;
          this.logger.log(`✅ Saved ${scrapeResult.products.length} products for ${cat.title}`);
        } else {
          this.logger.warn(`⚠️  No products scraped for ${cat.title}`);
        }
      } catch (error) {
        this.logger.error(`Error scraping category ${cat.title}:`, error);
      }
    }

    this.logger.log(`🎉 All categories scraping complete - Total products inserted: ${totalProductsInserted}`);
  }

  /**
   * Queue a category for scraping
   * FIXED: Now properly links products to category
   */
  async queueCategoryScrape(slug: string) {
    this.logger.log(`📡 Scraping category: ${slug}`);
    
    try {
      // Find the category by slug
      let category = await this.categoryModel.findOne({ slug }).exec();
      if (!category) {
        this.logger.warn(`Category not found: ${slug} - creating it...`);
        
        // Get default navigation
        let navigation = await this.navigationModel.findOne({ slug: 'books' }).exec();
        if (!navigation) {
          navigation = await this.navigationModel.create({
            slug: 'books',
            title: 'Books',
            description: 'All Books',
            is_active: true,
          });
        }
        
        // Create the category
        category = await this.categoryModel.create({
          slug: slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          navigation_id: navigation._id,
          is_subcategory: false,
          depth: 0,
        });
        
        this.logger.log(`✅ Category created: ${slug}`);
      }

      // Map slug to World of Books URL (for now, assume standard format)
      const categoryUrl = `https://www.worldofbooks.com/en-gb/${slug}`;
      
      this.logger.log(`🕷️  Scraping from: ${categoryUrl}`);
      
      // Actually scrape and save with category ID!
      const savedProducts = await this.scrapeAndSaveProductsFromCategory(categoryUrl, category._id);
      
      // Update category's last_scraped_at
      await this.categoryModel.findByIdAndUpdate(
        category._id,
        {
          last_scraped_at: new Date(),
          product_count: savedProducts.length,
        },
      ).exec();

      this.logger.log(`✅ Scraped and saved ${savedProducts.length} products for ${slug}`);

      return {
        status: 'completed',
        message: `Successfully scraped ${savedProducts.length} products for category '${slug}'`,
        productsScraped: savedProducts.length,
      };
    } catch (error) {
      this.logger.error(`Scraping failed for category ${slug}:`, error);
      return {
        status: 'error',
        message: `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * FORCE SCRAPE ALL CATEGORIES
   * Clears the database and scrapes everything from scratch
   */
  async forceScrapeAll() {
    this.logger.log('🔥 FORCE SCRAPE: Starting forced scrape of ALL categories');
    
    try {
      // Clear existing data
      this.logger.log('🗑️  Clearing existing products and categories...');
      await this.productModel.deleteMany({}).exec();
      await this.categoryModel.deleteMany({}).exec();
      this.logger.log('✅ Database cleared');
      
      // Reset the safety lock
      this.isScrapingInProgress = false;
      
      // Scrape all default categories
      await this.scrapeAndSaveDefaultCategories();
      
      // Get final count
      const finalCount = await this.productModel.countDocuments().exec();
      this.logger.log(`✅ FORCE SCRAPE COMPLETE - ${finalCount} products in database`);
      
      return {
        status: 'completed',
        message: `Force scrape completed! ${finalCount} products now in database`,
        totalProducts: finalCount,
      };
    } catch (error) {
      this.logger.error('🔥 FORCE SCRAPE FAILED:', error);
      return {
        status: 'error',
        message: `Force scrape failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    } finally {
      this.isScrapingInProgress = false;
    }
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
