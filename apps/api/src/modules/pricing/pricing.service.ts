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

  async findAll(options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [pricing, total] = await Promise.all([
      this.prisma.pricing.findMany({
        include: {
          product: true,
          client: true,
          supplier: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pricing.count(),
    ]);

    return {
      data: pricing,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.pricing.findUnique({
      where: { id },
      include: {
        product: true,
        client: true,
        supplier: true,
      },
    });
  }

  async update(id: string, data: Partial<{
    price: number;
    currency: string;
    taxRate: number;
    discountPercent: number;
    effectiveFrom: Date;
    effectiveTo: Date;
  }>) {
    return this.prisma.pricing.update({
      where: { id },
      data: {
        ...data,
        price: data.price ? new Decimal(data.price) : undefined,
        taxRate: data.taxRate ? new Decimal(data.taxRate) : undefined,
        discountPercent: data.discountPercent ? new Decimal(data.discountPercent) : undefined,
      },
      include: {
        product: true,
        client: true,
        supplier: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.pricing.delete({
      where: { id },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.pricing.findMany({
      where: { productId },
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

