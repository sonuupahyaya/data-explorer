import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { RealScraper } from './real-scraper';

@Module({
  providers: [ScraperService, RealScraper],
  exports: [ScraperService],
})
export class ScraperModule {}
