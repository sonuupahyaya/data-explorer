import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { NavigationModule } from './navigation/navigation.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { HistoryModule } from './history/history.module';
import { SearchModule } from './search/search.module';
import { ScraperModule } from './scraper/scraper.module';
import { ImageProxyModule } from './image-proxy/image-proxy.module';
import { CartModule } from './cart/cart.module';
import { SavedForLaterModule } from './saved-for-later/saved-for-later.module';

@Module({
  imports: [
    DatabaseModule,
    ScraperModule,
    NavigationModule,
    CategoriesModule,
    ProductsModule,
    HistoryModule,
    SearchModule,
    ImageProxyModule,
    CartModule,
    SavedForLaterModule,
  ],
})
export class AppModule {}
