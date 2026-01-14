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
     let decodedUrl = decodeURIComponent(imageUrl);

     // CRITICAL: Prevent infinite loop - strip recursive proxy calls
     // If the decoded URL contains /api/image or localhost, it's a recursive call
     if (decodedUrl.includes('/api/image?url=') || decodedUrl.includes('localhost') || decodedUrl.includes('127.0.0.1')) {
       this.logger.warn(`⚠️  Blocked recursive proxy call: ${decodedUrl.substring(0, 80)}...`);
       
       // Try to extract the original URL from the recursive call
       const urlMatch = decodedUrl.match(/url=([^&]+)/);
       if (urlMatch) {
         try {
           decodedUrl = decodeURIComponent(urlMatch[1]);
           this.logger.log(`🔄 Extracted original URL from recursive call: ${decodedUrl.substring(0, 80)}...`);
         } catch (e) {
           // If extraction fails, return error
           return res.status(400).json({ error: 'Recursive proxy URL detected' });
         }
       } else {
         return res.status(400).json({ error: 'Recursive proxy URL detected' });
       }
     }

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
     
     // Return fallback placeholder SVG
     if (!res.headersSent) {
       const fallbackSvg = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
         <defs>
           <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" style="stop-color:#e0e7ff;stop-opacity:1" />
             <stop offset="100%" style="stop-color:#c7d2fe;stop-opacity:1" />
           </linearGradient>
         </defs>
         <rect width="300" height="400" fill="url(#grad)"/>
         <text x="150" y="190" font-size="32" text-anchor="middle" fill="#4f46e5" font-family="Arial">📚</text>
         <text x="150" y="240" font-size="14" text-anchor="middle" fill="#6366f1" font-family="Arial">Image Unavailable</text>
       </svg>`;

       const buffer = Buffer.from(fallbackSvg);
       res.set({
         'Content-Type': 'image/svg+xml',
         'Content-Length': buffer.length.toString(),
         'Cache-Control': 'public, max-age=3600',
         'Access-Control-Allow-Origin': '*',
       });

       res.send(buffer);
       this.logger.warn(`⚠️  Served fallback image for failed request`);
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
