import { Controller, Get, Post, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'navigation', required: false, description: 'Filter by navigation slug' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories(@Query('navigation') navigation?: string) {
    if (navigation) {
      return this.categoriesService.getCategoriesByNavigation(navigation);
    }
    return this.categoriesService.getAllCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category detail with subcategories' })
  @ApiResponse({ status: 200, description: 'Category with subcategories' })
  async getCategory(@Param('slug') slug: string) {
    if (!slug || slug.length === 0) {
      throw new BadRequestException('Category slug is required');
    }
    return this.categoriesService.getCategoryBySlug(slug);
  }

  @Get(':slug/subcategories')
  @ApiOperation({ summary: 'Get subcategories for a category' })
  @ApiResponse({ status: 200, description: 'List of subcategories' })
  async getSubcategories(@Param('slug') slug: string) {
    if (!slug || slug.length === 0) {
      throw new BadRequestException('Category slug is required');
    }
    return this.categoriesService.getSubcategories(slug);
  }

  @Post(':slug/refresh')
  @ApiOperation({ summary: 'Refresh category data' })
  @ApiResponse({ status: 201, description: 'Category refreshed' })
  async refreshCategory(@Param('slug') slug: string) {
    if (!slug || slug.length === 0) {
      throw new BadRequestException('Category slug is required');
    }
    return this.categoriesService.refreshCategory(slug);
  }
}
