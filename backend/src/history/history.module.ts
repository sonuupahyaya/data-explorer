import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { ViewHistory, ViewHistorySchema } from '../schemas/view-history.schema';
import { Product, ProductSchema } from '../schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ViewHistory.name, schema: ViewHistorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
