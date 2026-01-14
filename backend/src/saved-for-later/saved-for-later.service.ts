import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SavedForLater, SavedForLaterDocument } from '../schemas/saved-for-later.schema';

@Injectable()
export class SavedForLaterService {
  constructor(
    @InjectModel(SavedForLater.name)
    private savedModel: Model<SavedForLaterDocument>,
  ) {}

  /**
   * Generate session-based userId from request
   */
  generateUserId(req: any): string {
    if (req.user?.id) {
      return req.user.id;
    }
    if (req.sessionID) {
      return req.sessionID;
    }
    return req.ip || 'anonymous-' + Date.now();
  }

  /**
   * Save product for later
   */
  async saveForLater(userId: string, productId: string) {
    if (!userId || !productId) {
      throw new BadRequestException('userId and productId are required');
    }

    const objectId = this.validateObjectId(productId);

    // Check if already saved
    const existing = await this.savedModel.findOne({
      userId,
      productId: objectId,
    });

    if (existing) {
      return existing; // Already saved, just return it
    }

    // Create new saved item
    const saved = await this.savedModel.create({
      userId,
      productId: objectId,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

    return saved;
  }

  /**
   * Remove from saved list
   */
  async removeFromSaved(userId: string, productId: string) {
    const objectId = this.validateObjectId(productId);

    const deleted = await this.savedModel.findOneAndDelete({
      userId,
      productId: objectId,
    });

    if (!deleted) {
      throw new NotFoundException('Saved item not found');
    }

    return { success: true };
  }

  /**
   * Get all saved items for user
   */
  async getSavedItems(userId: string) {
    const items = await this.savedModel
      .find({ userId })
      .populate('productId')
      .exec();

    return {
      items,
      count: items.length,
    };
  }

  /**
   * Check if product is saved
   */
  async isProductSaved(userId: string, productId: string): Promise<boolean> {
    const objectId = this.validateObjectId(productId);

    const saved = await this.savedModel.findOne({
      userId,
      productId: objectId,
    });

    return !!saved;
  }

  /**
   * Clear all saved items
   */
  async clearSavedItems(userId: string) {
    await this.savedModel.deleteMany({ userId });
    return { success: true };
  }

  /**
   * Validate MongoDB ObjectId
   */
  private validateObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format');
    }
    return new Types.ObjectId(id);
  }
}
