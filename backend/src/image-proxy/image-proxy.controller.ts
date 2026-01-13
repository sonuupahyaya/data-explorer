import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ImageProxyService } from './image-proxy.service';

/**
 * Image Proxy Controller
 * 
 * Serves images from external URLs, bypassing CORS and hotlink blocking.
 * 
 * Endpoints:
 * - GET /api/image?url=<encoded-url> - Download and serve image
 * - GET /api/image/stats - Cache statistics
 * - POST /api/image/cache/clear - Clear cache
 */
@ApiTags('image-proxy')
@Controller('api/image')
export class ImageProxyController {
  private readonly logger = new Logger(ImageProxyController.name);

  constructor(private readonly imageProxyService: ImageProxyService) {}

  /**
   * GET /api/image?url=<encoded-url>
   * 
   * Serves an image from an external URL
   * 
   * Usage:
   * <img src="http://localhost:3001/api/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg" />
   * 
   * Or with encoded parameter:
   * const imageUrl = `http://localhost:3001/api/image?url=${encodeURIComponent(originalUrl)}`;
   */
  @Get()
  @ApiOperation({ summary: 'Proxy image from external URL' })
  @ApiQuery({ name: 'url', required: true, type: String, description: 'External image URL (URL encoded)' })
  @ApiResponse({ status: 200, description: 'Image data' })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  @ApiResponse({ status: 500, description: 'Failed to download image' })
  async getImage(@Query('url') imageUrl: string, @Res() res: Response) {
    try {
      // Decode URL
      const decodedUrl = decodeURIComponent(imageUrl);

      this.logger.log(`🖼️  Image request: ${decodedUrl.substring(0, 80)}...`);

      // Get image buffer and metadata
      const { buffer, mimeType, size } = await this.imageProxyService.getImageBuffer(decodedUrl);

      // Set response headers
      res.set({
        'Content-Type': mimeType,
        'Content-Length': size.toString(),
        'Cache-Control': 'public, max-age=2592000', // 30 days in browser cache
        'ETag': `"${Buffer.from(decodedUrl).toString('base64').substring(0, 16)}"`,
        'Access-Control-Allow-Origin': '*', // Allow CORS
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
      });

      // Send image
      res.send(buffer);

      this.logger.log(`✅ Served image: ${size} bytes, ${mimeType}`);
    } catch (error) {
      this.logger.error(`❌ Error serving image:`, error);
      
      // Send generic error response (don't expose internals)
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to load image',
        });
      }
    }
  }

  /**
   * GET /api/image/stats
   * 
   * Returns cache statistics for monitoring
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get image proxy cache statistics' })
  @ApiResponse({ status: 200, description: 'Cache statistics' })
  getStats() {
    const stats = this.imageProxyService.getStats();
    
    this.logger.log(`📊 Cache stats: ${stats.cached_images} images, ${stats.cache_hits} hits`);
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      ...stats,
    };
  }

  /**
   * POST /api/image/cache/clear
   * 
   * Clears the image cache (admin only)
   */
  @Get('cache/clear')
  @ApiOperation({ summary: 'Clear image cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared' })
  clearCache() {
    const count = this.imageProxyService.clearCache();
    
    return {
      status: 'ok',
      message: `Cache cleared`,
      images_removed: count,
    };
  }

  /**
   * GET /api/image/health
   * 
   * Health check endpoint
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return {
      status: 'healthy',
      service: 'image-proxy',
      timestamp: new Date().toISOString(),
    };
  }
}
