import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { NavigationModule } from './navigation/navigation.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { HistoryModule } from './history/history.module';
import { SearchModule } from './search/search.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [
    DatabaseModule,
    ScraperModule,
    NavigationModule,
    CategoriesModule,
    ProductsModule,
    HistoryModule,
    SearchModule,
  ],
})
export class AppModule {}
