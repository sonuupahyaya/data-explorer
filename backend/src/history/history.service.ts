import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViewHistory, ViewHistoryDocument } from '../schemas/view-history.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateViewHistoryDto } from './dto/create-view-history.dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectModel(ViewHistory.name) private viewHistoryModel: Model<ViewHistoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Record a product view
   */
  async recordView(createViewDto: CreateViewHistoryDto) {
    this.logger.log(`📊 Recording view for product: ${createViewDto.product_id}`);

    try {
      const view = new this.viewHistoryModel({
        product_id: createViewDto.product_id,
        user_id: createViewDto.user_id || 'anonymous',
        user_agent: createViewDto.user_agent,
        ip_address: createViewDto.ip_address,
        referrer: createViewDto.referrer,
        viewed_at: new Date(),
      });

      const savedView = await view.save();
      this.logger.log(`✅ View recorded for product ${createViewDto.product_id}`);
      return savedView;
    } catch (error) {
      this.logger.error(`Error recording view:`, error);
      throw error;
    }
  }

  /**
   * Get view history for a user
   */
  async getViewHistory(userId?: string, limit: number = 20) {
    this.logger.log(`📊 Fetching view history for user: ${userId || 'all'}`);

    let query: any = {};
    if (userId) {
      query.user_id = userId;
    }

    const history = await this.viewHistoryModel
      .find(query)
      .sort({ viewed_at: -1 })
      .limit(limit)
      .populate('product_id', 'title price image_url')
      .lean()
      .exec();

    this.logger.log(`✅ Found ${history.length} views`);
    return history;
  }

  /**
   * Get popular products based on view count
   */
  async getPopularProducts(limit: number = 10) {
    this.logger.log(`📊 Fetching popular products`);

    const popular = await this.viewHistoryModel.aggregate([
      {
        $group: {
          _id: '$product_id',
          view_count: { $sum: 1 },
          last_viewed: { $max: '$viewed_at' },
        },
      },
      { $sort: { view_count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          product_id: '$_id',
          product: {
            title: '$product.title',
            price: '$product.price',
            image_url: '$product.image_url',
            rating_avg: '$product.rating_avg',
          },
          view_count: 1,
          last_viewed: 1,
        },
      },
    ]);

    this.logger.log(`✅ Found ${popular.length} popular products`);
    return popular;
  }

  /**
   * Get analytics statistics
   */
  async getAnalyticsStats() {
    this.logger.log(`📊 Fetching analytics statistics`);

    const totalViews = await this.viewHistoryModel.countDocuments().exec();
    const uniqueUsers = await this.viewHistoryModel
      .countDocuments({ user_id: { $ne: 'anonymous' } })
      .exec();
    const uniqueProducts = await this.viewHistoryModel.distinct('product_id').then((ids) => ids.length);

    const viewsPerDay = await this.viewHistoryModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$viewed_at' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    return {
      total_views: totalViews,
      unique_users: uniqueUsers,
      unique_products: uniqueProducts,
      views_last_30_days: viewsPerDay,
    };
  }
}
