import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    const clientId = req.user.clientId;
    if (!clientId) {
      throw new Error('Client ID not found in user context');
    }
    return this.cartService.getCartWithPricing(clientId);
  }

  @Post('items')
  async addItem(@Request() req, @Body() addCartItemDto: AddCartItemDto) {
    const clientId = req.user.clientId;
    if (!clientId) {
      throw new Error('Client ID not found in user context');
    }
    return this.cartService.addItem(clientId, addCartItemDto);
  }

  @Put('items/:productId')
  async updateItemQuantity(
    @Request() req,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const clientId = req.user.clientId;
    if (!clientId) {
      throw new Error('Client ID not found in user context');
    }
    return this.cartService.updateItemQuantity(clientId, productId, updateCartItemDto.quantity);
  }

  @Delete('items/:productId')
  async removeItem(@Request() req, @Param('productId') productId: string) {
    const clientId = req.user.clientId;
    if (!clientId) {
      throw new Error('Client ID not found in user context');
    }
    return this.cartService.removeItem(clientId, productId);
  }

  @Delete()
  async clearCart(@Request() req) {
    const clientId = req.user.clientId;
    if (!clientId) {
      throw new Error('Client ID not found in user context');
    }
    return this.cartService.clearCart(clientId);
  }
}
