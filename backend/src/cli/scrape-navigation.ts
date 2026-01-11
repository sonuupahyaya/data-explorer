import { MongooseModule } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { NavigationService } from '../navigation/navigation.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const navigationService = app.get(NavigationService);

  console.log('🕷️  Starting navigation scrape...');

  try {
    const startTime = Date.now();
    const results = await navigationService.refreshNavigation();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Successfully scraped ${results.length} navigation items in ${duration}s`);
    results.forEach((item: any) => {
      console.log(`   - ${item.title} (${item.category_count} categories)`);
    });
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
