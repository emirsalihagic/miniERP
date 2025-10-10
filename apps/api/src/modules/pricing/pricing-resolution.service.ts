import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface ResolvedPrice {
  price: Decimal;
  currency: string;
  taxRate: Decimal;
  discountPercent: Decimal;
  source: 'client_override' | 'supplier_override' | 'base_price';
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

@Injectable()
export class PricingResolutionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve price for a product with precedence:
   * 1. Client-specific override (highest priority)
   * 2. Supplier-specific override
   * 3. Base product price (no overrides)
   * 
   * All filtered by current date within effectiveFrom/effectiveTo window
   */
  async resolvePrice(
    productId: string,
    clientId?: string,
    date: Date = new Date(),
  ): Promise<ResolvedPrice> {
    const pricing = await this.prisma.pricing.findMany({
      where: {
        productId,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    // 1. Try client-specific override
    if (clientId) {
      const clientPrice = pricing.find(
        (p) => p.clientId === clientId && p.supplierId === null,
      );
      if (clientPrice) {
        return this.buildResolvedPrice(clientPrice, 'client_override');
      }
    }

    // 2. Try supplier-specific override
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { supplierId: true },
    });

    if (product) {
      const supplierPrice = pricing.find(
        (p) => p.supplierId === product.supplierId && p.clientId === null,
      );
      if (supplierPrice) {
        return this.buildResolvedPrice(supplierPrice, 'supplier_override');
      }
    }

    // 3. Base price (no overrides)
    const basePrice = pricing.find(
      (p) => p.clientId === null && p.supplierId === null,
    );

    if (!basePrice) {
      throw new Error(`No pricing found for product ${productId}`);
    }

    return this.buildResolvedPrice(basePrice, 'base_price');
  }

  private buildResolvedPrice(
    pricing: any,
    source: ResolvedPrice['source'],
  ): ResolvedPrice {
    return {
      price: pricing.price,
      currency: pricing.currency,
      taxRate: pricing.taxRate,
      discountPercent: pricing.discountPercent,
      source,
      effectiveFrom: pricing.effectiveFrom,
      effectiveTo: pricing.effectiveTo,
    };
  }

  /**
   * Pure calculation functions for invoice line items
   */
  calculateLineSubtotal(quantity: Decimal, unitPrice: Decimal): Decimal {
    return new Decimal(quantity).times(unitPrice);
  }

  calculateLineDiscount(subtotal: Decimal, discountPercent: Decimal): Decimal {
    return subtotal.times(discountPercent).dividedBy(100);
  }

  calculateLineTax(subtotal: Decimal, discount: Decimal, taxRate: Decimal): Decimal {
    return subtotal.minus(discount).times(taxRate).dividedBy(100);
  }

  calculateLineTotal(subtotal: Decimal, tax: Decimal, discount: Decimal): Decimal {
    return subtotal.plus(tax).minus(discount);
  }
}

