import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop({ required: true, type: Number, default: 1, min: 1 })
  quantity: number;

  @Prop({ default: Date.now, index: true, expires: 2592000 }) // Expires in 30 days
  expiresAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ userId: 1, productId: 1 }, { unique: true });
CartSchema.index({ userId: 1 });
