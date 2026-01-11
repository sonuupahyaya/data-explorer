import { Controller, Get, Post, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';

@ApiTags('navigation')
@Controller('api/navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all navigation headings' })
  @ApiResponse({ status: 200, description: 'List of navigation headings' })
  async getNavigation() {
    return this.navigationService.getNavigation();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get categories by navigation slug' })
  @ApiResponse({ status: 200, description: 'Categories for the given navigation' })
  async getCategories(@Param('slug') slug: string) {
    if (!slug || slug.length === 0) {
      throw new BadRequestException('Slug is required');
    }
    return this.navigationService.getCategoriesByNavigation(slug);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh navigation data' })
  @ApiResponse({ status: 201, description: 'Navigation refreshed' })
  async refreshNavigation() {
    return this.navigationService.refreshNavigation();
  }
}
