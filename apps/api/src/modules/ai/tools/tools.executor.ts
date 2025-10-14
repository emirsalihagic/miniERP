import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ProductsService } from '../../products/products.service';
import { ClientsService } from '../../clients/clients.service';
import { CartService } from '../../cart/cart.service';
import { OrdersService } from '../../orders/orders.service';
import { UserPreferencesService } from '../../user-preferences/user-preferences.service';

@Injectable()
export class ToolsExecutor {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private clientsService: ClientsService,
    private cartService: CartService,
    private ordersService: OrdersService,
    private userPreferencesService: UserPreferencesService,
  ) {}

  async executeSearchProducts(args: any, user: any) {
    const { query, limit = 10 } = args;
    
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        supplier: {
          select: { name: true }
        },
        unit: {
          select: { name: true }
        }
      }
    });

    return {
      type: 'products',
      data: products,
      count: products.length
    };
  }

  async executeSearchClients(args: any, user: any) {
    const { query, email, limit = 10 } = args;
    
    let whereClause: any = {};
    
    // CLIENT_USER can only see their own client
    if (user.role === 'CLIENT_USER') {
      whereClause.id = user.clientId;
    } else {
      // EMPLOYEE can search all clients
      if (query) {
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ];
      }
      if (email) {
        whereClause.email = { contains: email, mode: 'insensitive' };
      }
    }

    const clients = await this.prisma.client.findMany({
      where: whereClause,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        status: true,
        contactPerson: true
      }
    });

    return {
      type: 'clients',
      data: clients,
      count: clients.length
    };
  }

  async executeAddToCart(args: any, user: any) {
    const { clientId, items } = args;
    
    // Validate client access
    await this.validateClientAccess(user, clientId);

    // Add items to cart
    for (const item of items) {
      await this.cartService.addItem(clientId, {
        productId: item.productId,
        quantity: item.quantity
      });
    }

    // Get updated cart
    const cart = await this.cartService.getCartWithPricing(clientId);

    return {
      type: 'cart_update',
      data: cart,
      message: `Added ${items.length} items to cart for client ${clientId}`
    };
  }

  async executeCreateOrderDirect(args: any, user: any) {
    const { clientId, items, note } = args;
    
    // Validate client access
    await this.validateClientAccess(user, clientId);

    // Create order directly
    const order = await this.ordersService.createFromCart(clientId, {
      notes: note
    }, user.id);

    return {
      type: 'order_created',
      data: order,
      message: `Order created successfully for client ${clientId}`
    };
  }

  async executeGetOrderStats(args: any, user: any) {
    const { from, to, groupBy, clientId, status } = args;
    
    let whereClause: any = {
      createdAt: {
        gte: new Date(from),
        lte: new Date(to)
      }
    };

    // CLIENT_USER can only see their own orders
    if (user.role === 'CLIENT_USER') {
      whereClause.clientId = user.clientId;
    } else if (clientId) {
      // EMPLOYEE can filter by specific client
      whereClause.clientId = clientId;
    }

    if (status && status.length > 0) {
      whereClause.status = { in: status };
    }

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        createdAt: true,
        status: true,
        grandTotal: true,
        client: {
          select: { name: true }
        }
      }
    });

    // Group by date
    const grouped = this.groupOrdersByDate(orders, groupBy);

    return {
      type: 'order_stats',
      data: grouped,
      totals: {
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + Number(order.grandTotal), 0)
      }
    };
  }

  async executeGetUserPreferences(args: any, user: any) {
    const preferences = await this.userPreferencesService.findByUserId(user.id);
    
    return {
      type: 'user_preferences',
      data: preferences || {
        theme: 'LIGHT',
        language: 'EN',
        currency: 'BAM',
        dateFormat: 'DD_MM_YYYY',
        timeFormat: 'HOUR_24',
        timezone: 'Europe/Sarajevo',
        emailNotifications: false,
        autoSaveForms: true
      }
    };
  }

  async executeUpdateUserPreferences(args: any, user: any) {
    const preferences = await this.userPreferencesService.update(user.id, args);
    
    return {
      type: 'user_preferences_updated',
      data: preferences,
      message: 'User preferences updated successfully'
    };
  }

  private async validateClientAccess(user: any, clientId: string) {
    if (user.role === 'CLIENT_USER' && user.clientId !== clientId) {
      throw new ForbiddenException('Cannot access other clients');
    }
    
    // EMPLOYEE: validate client exists
    if (user.role === 'EMPLOYEE') {
      const client = await this.prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }
  }

  private groupOrdersByDate(orders: any[], groupBy: 'day' | 'week' | 'month') {
    const groups: any = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groups[key]) {
        groups[key] = {
          date: key,
          count: 0,
          totalAmount: 0,
          statusBreakdown: {}
        };
      }
      
      groups[key].count++;
      groups[key].totalAmount += Number(order.grandTotal);
      
      if (!groups[key].statusBreakdown[order.status]) {
        groups[key].statusBreakdown[order.status] = 0;
      }
      groups[key].statusBreakdown[order.status]++;
    });
    
    return Object.values(groups).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }
}
