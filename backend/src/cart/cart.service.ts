import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  /**
   * Generate session-based userId from request
   * In production, use real auth/session
   */
  generateUserId(req: any): string {
    if (req.user?.id) {
      return req.user.id;
    }
    // Fallback to session or cookie-based ID
    if (req.sessionID) {
      return req.sessionID;
    }
    // Fallback to a client IP or temporary ID
    return req.ip || 'anonymous-' + Date.now();
  }

  /**
   * Add product to cart or update quantity
   */
  async addToCart(userId: string, productId: string, quantity: number = 1) {
    if (!userId || !productId) {
      throw new BadRequestException('userId and productId are required');
    }

    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const objectId = this.validateObjectId(productId);

    // Try to update existing item
    const existing = await this.cartModel.findOneAndUpdate(
      { userId, productId: objectId },
      { quantity: quantity },
      { new: true },
    );

    if (existing) {
      return existing;
    }

    // Create new cart item
    const cartItem = await this.cartModel.create({
      userId,
      productId: objectId,
      quantity,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return cartItem;
  }

  /**
   * Update quantity in cart
   */
  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const objectId = this.validateObjectId(productId);

    const updated = await this.cartModel.findOneAndUpdate(
      { userId, productId: objectId },
      { quantity },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Cart item not found');
    }

    return updated;
  }

  /**
   * Remove product from cart
   */
  async removeFromCart(userId: string, productId: string) {
    const objectId = this.validateObjectId(productId);

    const deleted = await this.cartModel.findOneAndDelete({
      userId,
      productId: objectId,
    });

    if (!deleted) {
      throw new NotFoundException('Cart item not found');
    }

    return { success: true };
  }

  /**
   * Get all cart items for user
   */
  async getCart(userId: string) {
    const cartItems = await this.cartModel
      .find({ userId })
      .populate('productId')
      .exec();

    const total = cartItems.reduce((sum, item) => {
      const product = item.productId as any;
      return sum + (product.price || 0) * item.quantity;
    }, 0);

    return {
      items: cartItems,
      itemCount: cartItems.length,
      total: parseFloat(total.toFixed(2)),
    };
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string) {
    await this.cartModel.deleteMany({ userId });
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
