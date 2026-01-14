import { Controller, Get, Post, Param, Query, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('api/products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products with pagination and filtering' })
  @ApiQuery({ name: 'sample', required: false, type: Boolean, description: 'Get sample seeded products' })
  @ApiQuery({ name: 'category', required: false, description: 'Category slug' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-indexed)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or author' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field (price, rating, newest)' })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  async getProducts(
    @Query('sample') sample?: string,
    @Query('category') category?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '24',
    @Query('search') search?: string,
    @Query('sort') sort: string = 'newest',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const isSample = sample === 'true';

    return this.productsService.getProducts({
      category,
      page: pageNum,
      limit: limitNum,
      search,
      sort,
      sample: isSample,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  @ApiResponse({ status: 200, description: 'Product detail with reviews' })
  async getProductDetail(@Param('id') id: string) {
    if (!id || id.length === 0 || id === 'undefined') {
      throw new BadRequestException('Product ID is required');
    }
    return this.productsService.getProductDetail(id);
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: 'Refresh product data' })
  @ApiResponse({ status: 200, description: 'Product refreshed' })
  async refreshProduct(@Param('id') id: string) {
    if (!id || id.length === 0 || id === 'undefined') {
      throw new BadRequestException('Product ID is required');
    }
    return this.productsService.refreshProduct(id);
  }

  @Post('scrape/category/:slug')
  @ApiOperation({ summary: 'Trigger scraping for a category' })
  @ApiResponse({ status: 202, description: 'Scraping job queued' })
  async scrapeCategory(@Param('slug') slug: string) {
    if (!slug || slug.length === 0) {
      throw new BadRequestException('Category slug is required');
    }
    
    this.logger.log(`📡 Scrape request for category: ${slug}`);
    
    return this.productsService.queueCategoryScrape(slug);
  }

  @Post('scrape/refresh-stale')
  @ApiOperation({ summary: 'Refresh stale products (older than cache TTL)' })
  @ApiResponse({ status: 202, description: 'Refresh job queued' })
  async refreshStaleProducts() {
    this.logger.log(`📡 Refresh stale products request`);
    
    return this.productsService.queueRefreshStale();
  }

  @Get('scrape/status')
  @ApiOperation({ summary: 'Get scraping status' })
  @ApiResponse({ status: 200, description: 'Current scraping jobs' })
  async getScrapeStatus() {
    return this.productsService.getScrapingStatus();
  }
}
