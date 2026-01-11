import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ default: 'Anonymous' })
  author: string;

  @Prop({ required: true, type: Number })
  rating: number;

  @Prop({ required: true })
  text: string;

  @Prop({ default: 0 })
  helpful_count: number;

  @Prop({ default: new Date() })
  created_at: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ product_id: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ created_at: 1 });
