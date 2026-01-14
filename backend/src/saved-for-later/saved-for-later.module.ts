import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedForLater, SavedForLaterSchema } from '../schemas/saved-for-later.schema';
import { SavedForLaterService } from './saved-for-later.service';
import { SavedForLaterController } from './saved-for-later.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedForLater.name, schema: SavedForLaterSchema },
    ]),
  ],
  controllers: [SavedForLaterController],
  providers: [SavedForLaterService],
  exports: [SavedForLaterService],
})
export class SavedForLaterModule {}
