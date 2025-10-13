import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
  ) {}

  async getOrCreateCart(clientId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { clientId },
      include: {
        items: {
          include: {
            product: {
              include: {
                unit: true,
                supplier: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { clientId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  unit: true,
                  supplier: true,
                },
              },
            },
          },
        },
      });
    }

    return this.enrichCartWithPricing(cart, clientId);
  }

  async addItem(clientId: string, addCartItemDto: AddCartItemDto) {
    const { productId, quantity } = addCartItemDto;

    // Verify product exists and is active
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or not available');
    }

    // Get or create cart (raw data, not enriched)
    const cart = await this.getRawCart(clientId);

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      // Update quantity - use explicit arithmetic
      const currentQuantity = parseFloat(existingItem.quantity.toString());
      const incomingQuantity = parseFloat(quantity.toString());
      const newQuantity = currentQuantity + incomingQuantity;
      
      return this.updateItemQuantity(clientId, productId, newQuantity);
    } else {
      // Add new item - convert to number
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: Number(quantity),
        },
      });
    }

    return this.getRawCart(clientId);
  }

  async updateItemQuantity(clientId: string, productId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { clientId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existingItem = cart.items.find(item => item.productId === productId);
    if (!existingItem) {
      throw new NotFoundException('Item not found in cart');
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await this.removeItem(clientId, productId);
    } else {
        // Update quantity - convert to number
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: parseFloat(quantity.toString()) },
        });
    }

    return this.getRawCart(clientId);
  }

  async removeItem(clientId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { clientId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existingItem = cart.items.find(item => item.productId === productId);
    if (!existingItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.delete({
      where: { id: existingItem.id },
    });

    return this.getOrCreateCart(clientId);
  }

  async clearCart(clientId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { clientId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getOrCreateCart(clientId);
  }

  async getCartWithPricing(clientId: string) {
    return this.getOrCreateCart(clientId);
  }

  private async getRawCart(clientId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { clientId },
      include: {
        items: {
          include: {
            product: {
              include: {
                unit: true,
                supplier: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { clientId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  unit: true,
                  supplier: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  private async enrichCartWithPricing(cart: any, clientId: string) {
    const enrichedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const pricing = await this.pricingService.resolvePrice(
            item.productId,
            clientId,
          );

          const lineSubtotal = Number(item.quantity) * Number(pricing.price);
          const lineTax = lineSubtotal * (Number(pricing.taxRate) / 100);
          const lineTotal = lineSubtotal + lineTax;

          return {
            ...item,
            quantity: Number(item.quantity), // Ensure quantity is a number
            unitPrice: pricing.price,
            taxRate: pricing.taxRate,
            lineSubtotal,
            lineTax,
            lineTotal,
          };
        } catch (error) {
          console.error(`Error resolving price for product ${item.productId}:`, error);
          // Return item with zero pricing if price resolution fails
          return {
            ...item,
            unitPrice: 0,
            taxRate: 0,
            lineSubtotal: 0,
            lineTax: 0,
            lineTotal: 0,
          };
        }
      }),
    );

    const subtotal = enrichedItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
    const taxTotal = enrichedItems.reduce((sum, item) => sum + item.lineTax, 0);
    const grandTotal = subtotal + taxTotal;

    return {
      ...cart,
      items: enrichedItems,
      subtotal,
      taxTotal,
      grandTotal,
    };
  }
}
