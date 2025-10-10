import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    sku: string;
    name: string;
    description?: string;
    category?: string;
    unit?: string;
    supplierId: string;
  }) {
    return this.prisma.product.create({
      data,
      include: {
        supplier: true,
      },
    });
  }

  async findAll(supplierId?: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(supplierId && { supplierId }),
      },
      include: {
        supplier: true,
        pricing: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        supplier: true,
        pricing: true,
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, data: Partial<{
    sku: string;
    name: string;
    description: string;
    category: string;
    unit: string;
    isActive: boolean;
  }>) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        supplier: true,
      },
    });
  }

  async softDelete(id: string) {
    // Check if product is referenced in invoices
    const invoiceItems = await this.prisma.invoiceItem.findFirst({
      where: { productId: id },
    });

    if (invoiceItems) {
      throw new BadRequestException(
        'Cannot delete product that is referenced in invoices. Use deactivation instead.',
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}

