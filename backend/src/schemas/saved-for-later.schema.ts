import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedForLaterDocument = SavedForLater & Document;

@Schema({ timestamps: true })
export class SavedForLater {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop({ default: Date.now, index: true, expires: 7776000 }) // Expires in 90 days
  expiresAt: Date;
}

export const SavedForLaterSchema = SchemaFactory.createForClass(SavedForLater);
SavedForLaterSchema.index({ userId: 1, productId: 1 }, { unique: true });
SavedForLaterSchema.index({ userId: 1 });
