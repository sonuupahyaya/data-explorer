/**
 * Advanced Image Proxy Features (Optional)
 * 
 * This file contains optional enhancements for the image proxy system:
 * - Redis caching instead of in-memory
 * - Request rate limiting
 * - Image optimization/compression
 * - CDN fallback integration
 */

import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

/**
 * Redis-based Cache Implementation
 * Use this to replace NodeCache for production scale
 * 
 * Installation:
 * npm install redis
 */
@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: RedisClientType | null = null;
  private readonly defaultTTL = 86400; // 24 hours
  private isConnected = false;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      this.client = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
      });

      this.client.on('error', (err) => this.logger.error('Redis error:', err));
      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('✅ Redis connected');
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error);
      this.client = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Error getting from Redis: ${key}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    if (!this.client || !this.isConnected) return;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Error setting in Redis: ${key}`, error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client || !this.isConnected) return;

    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting from Redis: ${key}`, error);
    }
  }

  async flushAll(): Promise<void> {
    if (!this.client || !this.isConnected) return;

    try {
      await this.client.flushDb();
      this.logger.log('✅ Redis flushed');
    } catch (error) {
      this.logger.error('Error flushing Redis:', error);
    }
  }

  async getStats(): Promise<any> {
    if (!this.client || !this.isConnected) return {};

    try {
      const info = await this.client.info('stats');
      return info;
    } catch (error) {
      this.logger.error('Error getting Redis stats:', error);
      return {};
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      this.logger.log('✅ Redis disconnected');
    }
  }
}

/**
 * Rate Limiter for Image Proxy
 * Prevent abuse and excessive requests
 */
@Injectable()
export class ImageProxyRateLimiter {
  private readonly logger = new Logger(ImageProxyRateLimiter.name);
  private readonly limits = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequestsPerMinute = 60; // Per IP
  private readonly cleanupInterval = 60000; // 1 minute

  constructor() {
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  isAllowed(clientIp: string): boolean {
    const key = `rate_limit_${clientIp}`;
    const now = Date.now();

    let record = this.limits.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      record = {
        count: 1,
        resetTime: now + 60000, // 1 minute from now
      };
      this.limits.set(key, record);
      return true;
    }

    record.count++;

    if (record.count > this.maxRequestsPerMinute) {
      this.logger.warn(`⚠️  Rate limit exceeded for ${clientIp}: ${record.count} requests`);
      return false;
    }

    return true;
  }

  getRemainingRequests(clientIp: string): number {
    const key = `rate_limit_${clientIp}`;
    const record = this.limits.get(key);

    if (!record) {
      return this.maxRequestsPerMinute;
    }

    return Math.max(0, this.maxRequestsPerMinute - record.count);
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key);
      }
    }

    this.logger.debug(`🧹 Rate limiter cleanup: ${this.limits.size} active IPs`);
  }
}

/**
 * Image Optimization Service
 * Compress and resize images on the fly
 */
@Injectable()
export class ImageOptimizationService {
  private readonly logger = new Logger(ImageOptimizationService.name);

  /**
   * Compress image buffer
   * Requires: npm install sharp
   */
  async compressImage(buffer: Buffer, format: 'jpeg' | 'png' | 'webp' = 'jpeg'): Promise<Buffer> {
    try {
      // For production, use sharp library
      // const sharp = require('sharp');
      // return await sharp(buffer)
      //   .resize(800, 1200, { fit: 'inside', withoutEnlargement: true })
      //   .toFormat(format)
      //   .toBuffer();

      // For now, return original buffer
      this.logger.debug(`Optimization requested for ${format} format`);
      return buffer;
    } catch (error) {
      this.logger.error('Image compression failed:', error);
      return buffer; // Return original on error
    }
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number } | null> {
    try {
      // For production:
      // const sharp = require('sharp');
      // const metadata = await sharp(buffer).metadata();
      // return { width: metadata.width, height: metadata.height };

      return null; // Placeholder
    } catch (error) {
      this.logger.error('Failed to get image dimensions:', error);
      return null;
    }
  }
}

/**
 * CDN Fallback Integration
 * Store image proxies to CDN for faster delivery
 */
@Injectable()
export class CDNFallbackService {
  private readonly logger = new Logger(CDNFallbackService.name);

  /**
   * Upload image to CDN
   * Supports: Cloudinary, AWS S3, Azure Blob, etc.
   */
  async uploadToCDN(buffer: Buffer, imageHash: string): Promise<string | null> {
    const cdnProvider = process.env.CDN_PROVIDER || 'none';

    if (cdnProvider === 'none') {
      return null; // CDN disabled
    }

    try {
      // Example: Cloudinary
      // const cloudinary = require('cloudinary').v2;
      // const result = await cloudinary.uploader.upload_stream(...).end(buffer);
      // return result.secure_url;

      this.logger.debug(`📤 Would upload to ${cdnProvider}`);
      return null;
    } catch (error) {
      this.logger.error(`Failed to upload to ${cdnProvider}:`, error);
      return null;
    }
  }

  /**
   * Get cached CDN URL for image
   */
  getCDNUrl(imageHash: string): string | null {
    const cdnBase = process.env.CDN_BASE_URL;

    if (!cdnBase) {
      return null;
    }

    return `${cdnBase}/images/${imageHash}`;
  }
}

/**
 * Example: Switching to Redis in ImageProxyService
 * 
 * // In image-proxy.service.ts
 * 
 * @Injectable()
 * export class ImageProxyService {
 *   constructor(
 *     private readonly redisCache: RedisCacheService,
 *     private readonly rateLimiter: ImageProxyRateLimiter,
 *     private readonly optimization: ImageOptimizationService,
 *     private readonly cdnFallback: CDNFallbackService,
 *   ) {}
 * 
 *   async getImageBuffer(url: string, req: any): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
 *     // Rate limiting
 *     const clientIp = req.ip;
 *     if (!this.rateLimiter.isAllowed(clientIp)) {
 *       throw new TooManyRequestsException('Rate limit exceeded');
 *     }
 *
 *     // Validate URL
 *     this.validateUrl(url);
 *
 *     const cacheKey = this.getCacheKey(url);
 *
 *     // Check Redis cache
 *     const cached = await this.redisCache.get<{ buffer: Buffer; mimeType: string; size: number }>(cacheKey);
 *     if (cached) {
 *       this.logger.debug(`💾 Redis cache hit: ${url.substring(0, 60)}...`);
 *       return cached;
 *     }
 *
 *     // Check CDN
 *     const cdnUrl = this.cdnFallback.getCDNUrl(cacheKey);
 *     if (cdnUrl) {
 *       this.logger.debug(`🌍 CDN hit: ${cdnUrl}`);
 *       // Redirect or fetch from CDN...
 *     }
 *
 *     // Download image
 *     const buffer = await this.downloadImageWithRetry(url);
 *     const mimeType = this.detectMimeType(buffer);
 *
 *     // Optimize (optional)
 *     const optimized = process.env.OPTIMIZE_IMAGES === 'true' 
 *       ? await this.optimization.compressImage(buffer, 'jpeg')
 *       : buffer;
 *
 *     const result = {
 *       buffer: optimized,
 *       mimeType,
 *       size: optimized.length,
 *     };
 *
 *     // Cache in Redis (24 hours)
 *     await this.redisCache.set(cacheKey, result, 86400);
 *
 *     // Upload to CDN
 *     if (process.env.CDN_PROVIDER !== 'none') {
 *       await this.cdnFallback.uploadToCDN(result.buffer, cacheKey);
 *     }
 *
 *     return result;
 *   }
 * }
 */
