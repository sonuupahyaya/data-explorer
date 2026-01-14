import { Controller, Get, Post, Delete, Body, Param, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SavedForLaterService } from './saved-for-later.service';

interface SaveForLaterDto {
  productId: string;
}

@ApiTags('saved')
@Controller('api/saved')
export class SavedForLaterController {
  constructor(private readonly savedForLaterService: SavedForLaterService) {}

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
   * Get user's saved items
   */
  @Get()
  @ApiOperation({ summary: 'Get user saved items' })
  @ApiResponse({ status: 200, description: 'User saved items' })
  async getSavedItems(@Req() req: any) {
    const userId = this.getUserId(req);
    console.log(`[FAVORITES] ❤️  GET FAVORITES - userId: ${userId}`);
    const result = await this.savedForLaterService.getSavedItems(userId);
    console.log(`[FAVORITES] ✅ FOUND ${result.items.length} saved items`);
    return result;
  }

  /**
   * Save product for later
   */
  @Post('add')
  @ApiOperation({ summary: 'Save product for later' })
  @ApiResponse({ status: 201, description: 'Product saved' })
  async saveForLater(@Req() req: any, @Body() dto: SaveForLaterDto) {
    if (!dto.productId) {
      throw new BadRequestException('productId is required');
    }

    const userId = this.getUserId(req);
    console.log(`\n[FAVORITES] ❤️  SAVE FOR LATER - userId: ${userId}, productId: ${dto.productId}`);
    const result = await this.savedForLaterService.saveForLater(userId, dto.productId);
    console.log(`[FAVORITES] ✅ ITEM SAVED - ${dto.productId}`);
    return result;
  }

  /**
   * Check if product is saved
   */
  @Get(':productId/is-saved')
  @ApiOperation({ summary: 'Check if product is saved' })
  @ApiResponse({ status: 200, description: 'Boolean indicating if saved' })
  async isProductSaved(@Req() req: any, @Param('productId') productId: string) {
    const userId = this.getUserId(req);
    const isSaved = await this.savedForLaterService.isProductSaved(userId, productId);
    return { isSaved };
  }

  /**
   * Remove from saved list
   */
  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from saved list' })
  @ApiResponse({ status: 200, description: 'Item removed from saved' })
  async removeFromSaved(@Req() req: any, @Param('productId') productId: string) {
    const userId = this.getUserId(req);
    console.log(`[FAVORITES] 🗑️  REMOVE FROM FAVORITES - userId: ${userId}, productId: ${productId}`);
    const result = await this.savedForLaterService.removeFromSaved(userId, productId);
    console.log(`[FAVORITES] ✅ ITEM REMOVED`);
    return result;
  }

  /**
   * Clear all saved items
   */
  @Delete()
  @ApiOperation({ summary: 'Clear all saved items' })
  @ApiResponse({ status: 200, description: 'Saved items cleared' })
  async clearSavedItems(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.savedForLaterService.clearSavedItems(userId);
  }
}
