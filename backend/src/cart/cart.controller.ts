import { Controller, Get, Post, Delete, Body, Param, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';

interface AddToCartDto {
  productId: string;
  quantity?: number;
}

interface UpdateQuantityDto {
  quantity: number;
}

@ApiTags('cart')
@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Generate userId from request (helper)
   * Checks: header, user, session, IP
   */
  private getUserId(req: any): string {
    // First check if userId is passed in header from frontend
    if (req.headers['x-user-id']) {
      return req.headers['x-user-id'];
    }
    // Then check authenticated user
    if (req.user?.id) return req.user.id;
    // Then check session
    if (req.sessionID) return req.sessionID;
    // Fallback to IP
    return req.ip || 'anonymous-' + Date.now();
  }

  /**
   * Get user's cart
   */
  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'User cart with items and total' })
  async getCart(@Req() req: any) {
    const userId = this.getUserId(req);
    console.log(`[CART] 📦 GET CART - userId: ${userId}`);
    const result = await this.cartService.getCart(userId);
    console.log(`[CART] ✅ FOUND ${result.items.length} items in cart`);
    return result;
  }

  /**
   * Add product to cart
   */
  @Post('add')
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  async addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    if (!dto.productId) {
      throw new BadRequestException('productId is required');
    }

    const userId = this.getUserId(req);
    const quantity = Math.max(1, dto.quantity || 1);

    console.log(`\n[CART] ➕ ADD TO CART - userId: ${userId}, productId: ${dto.productId}, quantity: ${quantity}`);

    const result = await this.cartService.addToCart(userId, dto.productId, quantity);
    
    console.log(`[CART] ✅ ITEM ADDED - ${dto.productId}`);
    
    return result;
  }

  /**
   * Update cart item quantity
   */
  @Post(':productId/quantity')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Quantity updated' })
  async updateQuantity(@Req() req: any, @Param('productId') productId: string, @Body() dto: UpdateQuantityDto) {
    if (dto.quantity === undefined) {
      throw new BadRequestException('quantity is required');
    }

    const userId = this.getUserId(req);
    return this.cartService.updateQuantity(userId, productId, dto.quantity);
  }

  /**
   * Remove product from cart
   */
  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  async removeFromCart(@Req() req: any, @Param('productId') productId: string) {
    const userId = this.getUserId(req);
    console.log(`[CART] 🗑️  REMOVE FROM CART - userId: ${userId}, productId: ${productId}`);
    const result = await this.cartService.removeFromCart(userId, productId);
    console.log(`[CART] ✅ ITEM REMOVED`);
    return result;
  }

  /**
   * Clear entire cart
   */
  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.cartService.clearCart(userId);
  }
}
