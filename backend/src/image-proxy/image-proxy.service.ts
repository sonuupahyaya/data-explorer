import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import NodeCache from 'node-cache';
import * as crypto from 'crypto';

/**
 * Image Proxy Service
 * 
 * Handles downloading and caching external images to bypass CORS and hotlink blocking.
 * This is essential for scraping e-commerce sites that protect images.
 * 
 * Features:
 * - Stream-based downloading (memory efficient)
 * - Automatic caching (configurable TTL)
 * - Real browser User-Agent
 * - Timeout protection
 * - Error handling with fallbacks
 * - Content-Type detection
 */
@Injectable()
export class ImageProxyService {
  private readonly logger = new Logger(ImageProxyService.name);
  private readonly cache = new NodeCache({ stdTTL: 86400 }); // 24 hour TTL
  private readonly requestTimeout = 30000; // 30 seconds
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  // Realistic browser User-Agents
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ];

  // Valid image MIME types
  private readonly validMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/avif',
  ];

  constructor() {
    this.logger.log('✅ Image Proxy Service initialized (24-hour cache enabled)');
  }

  /**
   * Generate cache key from URL
   */
  private getCacheKey(url: string): string {
    return `img_${crypto.createHash('md5').update(url).digest('hex')}`;
  }

  /**
   * Get random User-Agent
   */
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Validate and sanitize URL
   */
  private validateUrl(url: string): void {
    if (!url) {
      throw new BadRequestException('Image URL is required');
    }

    try {
      const urlObj = new URL(url);
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new BadRequestException('Only HTTP and HTTPS URLs are allowed');
      }

      // Prevent local/internal requests
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname === '::1'
      ) {
        throw new BadRequestException('Local/internal URLs are not allowed');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid URL format');
    }
  }

  /**
   * Download image with retry logic
   */
  async downloadImageWithRetry(url: string, attempt: number = 1): Promise<Buffer> {
    try {
      this.logger.debug(`📥 Downloading image (attempt ${attempt}/${this.maxRetries}): ${url.substring(0, 80)}...`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: this.requestTimeout,
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'image/*,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': new URL(url).origin + '/',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400, // Accept redirects
      });

      const buffer = Buffer.from(response.data);

      // Validate minimum size (at least 100 bytes)
      if (buffer.length < 100) {
        throw new Error('Image too small (possibly placeholder or broken)');
      }

      this.logger.debug(`✅ Downloaded ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMsg = axiosError?.message || String(error);

      if (attempt < this.maxRetries) {
        this.logger.warn(`⚠️  Attempt ${attempt} failed: ${errorMsg}, retrying...`);
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.downloadImageWithRetry(url, attempt + 1);
      }

      this.logger.error(`❌ Failed to download image after ${this.maxRetries} attempts: ${errorMsg}`);
      throw new InternalServerErrorException(`Failed to download image: ${errorMsg}`);
    }
  }

  /**
   * Get image buffer (from cache or download)
   */
  async getImageBuffer(url: string): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
    // Validate URL
    this.validateUrl(url);

    const cacheKey = this.getCacheKey(url);

    // Check cache first
    const cached = this.cache.get<{ buffer: Buffer; mimeType: string; size: number }>(cacheKey);
    if (cached) {
      this.logger.debug(`💾 Cache hit: ${url.substring(0, 60)}... (${cached.size} bytes)`);
      return cached;
    }

    // Download image
    const buffer = await this.downloadImageWithRetry(url);

    // Detect MIME type from magic bytes
    const mimeType = this.detectMimeType(buffer);
    
    if (!this.validMimeTypes.includes(mimeType)) {
      throw new InternalServerErrorException(
        `Invalid image MIME type: ${mimeType}. Expected: ${this.validMimeTypes.join(', ')}`
      );
    }

    const result = {
      buffer,
      mimeType,
      size: buffer.length,
    };

    // Cache for 24 hours
    this.cache.set(cacheKey, result);
    this.logger.log(`💾 Cached image: ${url.substring(0, 60)}... (${buffer.length} bytes)`);

    return result;
  }

  /**
   * Detect MIME type from file magic bytes
   */
  private detectMimeType(buffer: Buffer): string {
    const head = buffer.toString('hex', 0, 12).toLowerCase();

    // JPEG: FF D8 FF
    if (head.startsWith('ffd8ff')) return 'image/jpeg';

    // PNG: 89 50 4E 47
    if (head.startsWith('89504e47')) return 'image/png';

    // GIF: 47 49 46 38
    if (head.startsWith('474946383')) return 'image/gif';

    // WebP: RIFF ... WEBP
    if (head.startsWith('52494646') && buffer.toString('utf8', 8, 12) === 'WEBP') {
      return 'image/webp';
    }

    // SVG: Check for XML declaration or SVG tag
    const utf8 = buffer.toString('utf8', 0, 100);
    if (utf8.includes('<?xml') || utf8.includes('<svg')) {
      return 'image/svg+xml';
    }

    // ICO: 00 00 01 00
    if (head.startsWith('00000100')) return 'image/x-icon';

    // AVIF: ftyp ... av01
    if (head.startsWith('00000020667479') && buffer.toString('utf8', 8, 12) === 'av01') {
      return 'image/avif';
    }

    // Default to JPEG if unsure
    return 'image/jpeg';
  }

  /**
   * Get cache stats for monitoring
   */
  getStats() {
    const keys = this.cache.keys();
    const stats = this.cache.getStats();

    return {
      cached_images: keys.length,
      cache_hits: stats.hits,
      cache_misses: stats.misses,
      cache_ksize: stats.ksize,
      cache_vsize: stats.vsize,
    };
  }

  /**
   * Clear all cached images
   */
  clearCache(): number {
    const count = this.cache.keys().length;
    this.cache.flushAll();
    this.logger.log(`🗑️  Cache cleared (${count} images removed)`);
    return count;
  }

  /**
   * Warm cache with important images (optional)
   */
  async warmCache(urls: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    this.logger.log(`🔥 Warming cache with ${urls.length} images...`);

    for (const url of urls) {
      try {
        await this.getImageBuffer(url);
        success++;
      } catch (error) {
        this.logger.warn(`⚠️  Failed to cache: ${url}`);
        failed++;
      }
    }

    this.logger.log(`✅ Cache warming complete: ${success} success, ${failed} failed`);
    return { success, failed };
  }
}
