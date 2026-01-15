import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Navigation, NavigationSchema } from '../schemas/navigation.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ScraperModule } from '../scraper/scraper.module';
import { ImageProxyModule } from '../image-proxy/image-proxy.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Navigation.name, schema: NavigationSchema },
    ]),
    ScraperModule,
    ImageProxyModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
