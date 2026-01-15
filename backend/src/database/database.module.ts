import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Navigation, NavigationSchema } from '../schemas/navigation.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { ScrapeJob, ScrapeJobSchema } from '../schemas/scrape-job.schema';
import { ViewHistory, ViewHistorySchema } from '../schemas/view-history.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/bookvault',
    ),
    MongooseModule.forFeature([
      { name: Navigation.name, schema: NavigationSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: ScrapeJob.name, schema: ScrapeJobSchema },
      { name: ViewHistory.name, schema: ViewHistorySchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
