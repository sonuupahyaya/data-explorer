import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Navigation, NavigationSchema } from '../schemas/navigation.schema';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Navigation.name, schema: NavigationSchema },
    ]),
    ScraperModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
