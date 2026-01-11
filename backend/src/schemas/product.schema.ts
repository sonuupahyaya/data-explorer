import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  source_id: string;

  @Prop({ required: true, unique: true })
  source_url: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ default: null })
  image_url: string;

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  categories: Types.ObjectId[];

  @Prop({ default: null })
  isbn: string;

  @Prop({ default: null })
  publisher: string;

  @Prop({ default: null })
  publication_date: Date;

  @Prop({ default: null })
  description: string;

  @Prop({ type: Object, default: {} })
  specs: Record<string, any>;

  @Prop({ default: 0, type: Number })
  rating_avg: number;

  @Prop({ default: 0, type: Number })
  reviews_count: number;

  @Prop({ default: null })
  last_scraped_at: Date;

  @Prop({ default: true })
  is_available: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ source_id: 1 });
ProductSchema.index({ source_url: 1 });
ProductSchema.index({ title: 'text', author: 'text' });
ProductSchema.index({ last_scraped_at: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
