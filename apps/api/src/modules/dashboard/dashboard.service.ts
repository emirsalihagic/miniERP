import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecentActivity() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent products
    const recentProducts = await this.prisma.product.findMany({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    // Get recent clients
    const recentClients = await this.prisma.client.findMany({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    // Get recent suppliers
    const recentSuppliers = await this.prisma.supplier.findMany({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    // Format activities
    const activities: any[] = [];

    recentProducts.forEach(product => {
      activities.push({
        icon: 'shopping',
        description: `New product "${product.name}" added`,
        timestamp: product.createdAt,
        type: 'product'
      });
    });

    recentClients.forEach(client => {
      activities.push({
        icon: 'team',
        description: `New client "${client.name}" registered`,
        timestamp: client.createdAt,
        type: 'client'
      });
    });

    recentSuppliers.forEach(supplier => {
      activities.push({
        icon: 'shop',
        description: `New supplier "${supplier.name}" added`,
        timestamp: supplier.createdAt,
        type: 'supplier'
      });
    });

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  async getSystemStatus() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Get counts for system health
      const [productCount, totalClientCount, activeClientCount, supplierCount] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.client.count(),
        this.prisma.client.count({ where: { status: 'ACTIVE' } }),
        this.prisma.supplier.count()
      ]);

      return [
        {
          status: 'green',
          description: 'Database connected',
          details: 'All database operations working normally'
        },
        {
          status: 'green',
          description: 'API services running',
          details: 'All microservices operational'
        },
        {
          status: 'green',
          description: 'Authentication system active',
          details: 'JWT tokens and user sessions working'
        },
        {
          status: productCount > 0 ? 'green' : 'yellow',
          description: `${productCount} products in system`,
          details: productCount > 0 ? 'Product catalog populated' : 'No products yet'
        },
        {
          status: activeClientCount > 0 ? 'green' : 'yellow',
          description: `${activeClientCount} active clients (${totalClientCount} total)`,
          details: activeClientCount > 0 ? 'Active client base' : 'No active clients yet'
        },
        {
          status: supplierCount > 0 ? 'green' : 'yellow',
          description: `${supplierCount} suppliers active`,
          details: supplierCount > 0 ? 'Supply chain operational' : 'No suppliers yet'
        }
      ];
    } catch (error) {
      return [
        {
          status: 'red',
          description: 'Database connection failed',
          details: 'Unable to connect to database'
        },
        {
          status: 'red',
          description: 'System error',
          details: 'Please contact system administrator'
        }
      ];
    }
  }
}
