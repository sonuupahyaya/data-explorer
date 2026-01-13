import { Module } from '@nestjs/common';
import { ImageProxyService } from './image-proxy.service';
import { ImageProxyController } from './image-proxy.controller';

@Module({
  providers: [ImageProxyService],
  controllers: [ImageProxyController],
  exports: [ImageProxyService],
})
export class ImageProxyModule {}
