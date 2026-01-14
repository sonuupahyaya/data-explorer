import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NavigationDocument = Navigation & Document;

@Schema({ timestamps: true })
export class Navigation {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  image_url: string;

  @Prop({ default: null })
  last_scraped_at: Date;

  @Prop({ default: 0 })
  category_count: number;

  @Prop({ default: false })
  is_active: boolean;
}

export const NavigationSchema = SchemaFactory.createForClass(Navigation);
NavigationSchema.index({ last_scraped_at: 1 });
