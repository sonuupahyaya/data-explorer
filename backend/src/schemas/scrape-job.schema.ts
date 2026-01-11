import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ScrapeJobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ScrapeJobType {
  NAVIGATION = 'navigation',
  CATEGORY = 'category',
  PRODUCT = 'product',
  PRODUCT_LIST = 'product_list',
}

export type ScrapeJobDocument = ScrapeJob & Document;

@Schema({ timestamps: true })
export class ScrapeJob {
  @Prop({ required: true })
  target_url: string;

  @Prop({ enum: ScrapeJobType, required: true })
  target_type: ScrapeJobType;

  @Prop({ enum: ScrapeJobStatus, default: ScrapeJobStatus.PENDING })
  status: ScrapeJobStatus;

  @Prop({ default: null })
  started_at: Date;

  @Prop({ default: null })
  finished_at: Date;

  @Prop({ default: 0 })
  retry_count: number;

  @Prop({ default: null })
  error_log: string;

  @Prop({ default: 0 })
  items_found: number;

  @Prop({ default: 0 })
  items_inserted: number;

  @Prop({ default: 0 })
  items_updated: number;
}

export const ScrapeJobSchema = SchemaFactory.createForClass(ScrapeJob);
ScrapeJobSchema.index({ status: 1 });
ScrapeJobSchema.index({ target_type: 1 });
ScrapeJobSchema.index({ created_at: 1 });
ScrapeJobSchema.index({ target_url: 1 });
