import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: Types.ObjectId, ref: 'Navigation', required: true })
  navigation_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parent_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: 0 })
  product_count: number;

  @Prop({ default: null })
  last_scraped_at: Date;

  @Prop({ default: false })
  is_subcategory: boolean;

  @Prop({ default: 0 })
  depth: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ slug: 1 });
CategorySchema.index({ navigation_id: 1 });
CategorySchema.index({ parent_id: 1 });
CategorySchema.index({ last_scraped_at: 1 });
CategorySchema.index({ navigation_id: 1, slug: 1 }, { unique: true });
