import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ViewHistoryDocument = ViewHistory & Document;

@Schema({ timestamps: true })
export class ViewHistory {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ default: 'anonymous' })
  user_id: string;

  @Prop({ default: null })
  user_agent: string;

  @Prop({ default: null })
  ip_address: string;

  @Prop({ default: null })
  referrer: string;

  @Prop({ default: new Date() })
  viewed_at: Date;

  @Prop({ type: Object, default: {} })
  meta: Record<string, any>;
}

export const ViewHistorySchema = SchemaFactory.createForClass(ViewHistory);
ViewHistorySchema.index({ product_id: 1 });
ViewHistorySchema.index({ user_id: 1 });
ViewHistorySchema.index({ viewed_at: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL for auto-cleanup
