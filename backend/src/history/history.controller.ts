import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CreateViewHistoryDto } from './dto/create-view-history.dto';

@ApiTags('history')
@Controller('api/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Track product view' })
  @ApiResponse({ status: 201, description: 'View recorded' })
  async trackView(@Body() createViewDto: CreateViewHistoryDto) {
    return this.historyService.recordView(createViewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user view history' })
  @ApiQuery({ name: 'user_id', required: false, description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results' })
  @ApiResponse({ status: 200, description: 'View history' })
  async getHistory(
    @Query('user_id') userId?: string,
    @Query('limit') limit: string = '20',
  ) {
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    return this.historyService.getViewHistory(userId, limitNum);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular products' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results' })
  @ApiResponse({ status: 200, description: 'Popular products' })
  async getPopular(@Query('limit') limit: string = '10') {
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    return this.historyService.getPopularProducts(limitNum);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get analytics statistics' })
  @ApiResponse({ status: 200, description: 'Analytics stats' })
  async getStats() {
    return this.historyService.getAnalyticsStats();
  }
}
