import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CartService } from '../cart/cart.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private invoicesService: InvoicesService,
  ) {}

  async createFromCart(clientId: string, createOrderDto: CreateOrderDto, userId?: string) {
    const { notes } = createOrderDto;

    // Get cart with pricing
    const cart = await this.cartService.getCartWithPricing(clientId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        clientId,
        status: OrderStatus.PENDING,
        subtotal: cart.subtotal,
        taxTotal: cart.taxTotal,
        grandTotal: cart.grandTotal,
        currency: 'EUR',
        notes,
        items: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            sku: item.product.sku,
            productName: item.product.name || 'Unknown Product',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            lineSubtotal: item.lineSubtotal,
            lineTax: item.lineTax,
            lineTotal: item.lineTotal,
          })),
        },
      },
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
        client: true,
      },
    });

    // Auto-create draft invoice
    const invoice = await this.invoicesService.create({
      clientId,
      currency: 'EUR',
      discountPercent: 0,
      notes: `Invoice for order ${orderNumber}`,
      items: cart.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        discountPercent: 0,
      })),
    }, userId || 'system');

    // Link invoice to order
    if (invoice) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { 
          invoiceId: invoice.id,
          status: OrderStatus.INVOICE_CREATED,
        },
      });
    }

    // Clear cart
    await this.cartService.clearCart(clientId);

    // Return order with invoice
    return this.prisma.order.findUnique({
      where: { id: order.id },
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
        client: true,
        invoice: true,
      },
    });
  }

  async findAll(filters: any, userId: string, userRole: string) {
    const where: any = {};

    // Client users can only see their own orders
    if (userRole === 'CLIENT_USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { clientId: true },
      });
      if (!user?.clientId) {
        throw new ForbiddenException('Client ID not found');
      }
      where.clientId = user.clientId;
    }

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.clientId && userRole === 'EMPLOYEE') {
      where.clientId = filters.clientId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
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
          client: true,
          invoice: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: filters.skip || 0,
        take: filters.take || 10,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items: orders, total };
  }

  async findOne(id: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
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
        client: true,
        invoice: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Client users can only see their own orders
    if (userRole === 'CLIENT_USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { clientId: true },
      });
      if (!user?.clientId || order.clientId !== user.clientId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userId: string, userRole: string) {
    const { status, trackingNumber } = updateOrderStatusDto;

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check permissions
    if (userRole === 'CLIENT_USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { clientId: true },
      });
      if (!user?.clientId || order.clientId !== user.clientId) {
        throw new ForbiddenException('Access denied');
      }
      // Client users can only cancel pending orders
      if (status !== OrderStatus.CANCELLED || order.status !== OrderStatus.PENDING) {
        throw new ForbiddenException('Can only cancel pending orders');
      }
    }

    // Validate status transitions
    this.validateStatusTransition(order.status, status);

    const updateData: any = { status };

    if (status === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
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
        client: true,
        invoice: true,
      },
    });

    // Auto-complete order if invoice is paid and order is delivered
    if (status === OrderStatus.DELIVERED && order.invoice?.status === 'PAID') {
      await this.prisma.order.update({
        where: { id },
        data: { status: OrderStatus.COMPLETED },
      });
    }

    return updatedOrder;
  }

  async cancelOrder(id: string, userId: string, userRole: string) {
    return this.updateStatus(id, { status: OrderStatus.CANCELLED }, userId, userRole);
  }

  async getOrdersByClient(clientId: string) {
    return this.prisma.order.findMany({
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
        client: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.prisma.order.count();
    return `ORD-${String(count + 1).padStart(6, '0')}`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.INVOICE_CREATED, OrderStatus.CANCELLED],
      [OrderStatus.INVOICE_CREATED]: [OrderStatus.INVOICE_ISSUED, OrderStatus.CANCELLED],
      [OrderStatus.INVOICE_ISSUED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
