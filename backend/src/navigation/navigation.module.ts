import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Navigation, NavigationSchema } from '../schemas/navigation.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Navigation.name, schema: NavigationSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    ScraperModule,
  ],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
