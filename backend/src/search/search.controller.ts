import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search products by title or author' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Query('q') query: string, @Query('limit') limit: string = '20') {
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    return this.searchService.search(query, limitNum);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Get autocomplete suggestions' })
  @ApiQuery({ name: 'q', required: true, description: 'Partial query' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Autocomplete suggestions' })
  async autocomplete(@Query('q') query: string, @Query('limit') limit: string = '10') {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    return this.searchService.getAutocomplete(query, limitNum);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get available filters' })
  @ApiResponse({ status: 200, description: 'Available filter options' })
  async getFilters() {
    return this.searchService.getAvailableFilters();
  }
}
