import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PricingResolutionService } from './pricing-resolution.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolutionService: PricingResolutionService,
  ) {}

  async create(data: {
    productId: string;
    clientId?: string;
    supplierId?: string;
    price: number;
    currency?: string;
    taxRate?: number;
    discountPercent?: number;
    effectiveFrom?: Date;
    effectiveTo?: Date;
  }) {
    return this.prisma.pricing.create({
      data: {
        productId: data.productId,
        clientId: data.clientId,
        supplierId: data.supplierId,
        price: new Decimal(data.price),
        currency: data.currency || 'USD',
        taxRate: new Decimal(data.taxRate || 0),
        discountPercent: new Decimal(data.discountPercent || 0),
        effectiveFrom: data.effectiveFrom || new Date(),
        effectiveTo: data.effectiveTo,
      },
    });
  }

  async findAll(productId?: string) {
    return this.prisma.pricing.findMany({
      where: productId ? { productId } : {},
      include: {
        product: true,
        client: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolvePrice(productId: string, clientId?: string) {
    return this.resolutionService.resolvePrice(productId, clientId);
  }
}

