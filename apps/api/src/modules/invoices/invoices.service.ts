import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PricingResolutionService } from '../pricing/pricing-resolution.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingResolver: PricingResolutionService,
  ) {}

  async create(dto: CreateInvoiceDto, userId: string) {
    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: dto.clientId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes,
        discountPercent: dto.discountPercent ? new Decimal(dto.discountPercent) : new Decimal(0),
      },
      include: {
        client: true,
        items: true,
      },
    });

    // Add items if provided
    if (dto.items && dto.items.length > 0) {
      for (const itemDto of dto.items) {
        await this.addItem(invoice.id, itemDto, userId);
      }
    }

    await this.createAuditLog(invoice.id, 'CREATED', userId);

    // Return invoice with updated items
    return this.prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async addItem(invoiceId: string, dto: AddInvoiceItemDto, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.QUOTE) {
      throw new ForbiddenException('Cannot modify invoice after it has been issued');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Resolve pricing
    const resolvedPrice = await this.pricingResolver.resolvePrice(
      dto.productId,
      invoice.clientId,
    );

    const quantity = new Decimal(dto.quantity);
    const lineSubtotal = this.pricingResolver.calculateLineSubtotal(quantity, resolvedPrice.price);
    
    // Use manual discount if provided, otherwise use pricing discount
    const effectiveDiscountPercent = dto.discountPercent !== undefined 
      ? new Decimal(dto.discountPercent) 
      : resolvedPrice.discountPercent;
    
    const lineDiscount = this.pricingResolver.calculateLineDiscount(lineSubtotal, effectiveDiscountPercent);
    const lineTax = this.pricingResolver.calculateLineTax(lineSubtotal, lineDiscount, resolvedPrice.taxRate);
    const lineTotal = this.pricingResolver.calculateLineTotal(lineSubtotal, lineTax, lineDiscount);

    const item = await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        productId: dto.productId,
        sku: product.sku,
        productName: product.name || 'Unknown Product',
        quantity,
        unitPrice: resolvedPrice.price,
        taxRate: resolvedPrice.taxRate,
        discountPercent: effectiveDiscountPercent,
        lineSubtotal,
        lineDiscount,
        lineTax,
        lineTotal,
      },
    });

    // Recompute invoice totals
    await this.recomputeTotals(invoiceId);

    return item;
  }

  async updateDiscount(invoiceId: string, discountPercent: number, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.QUOTE) {
      throw new ForbiddenException('Cannot modify invoice after it has been issued');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        discountPercent: new Decimal(discountPercent),
      },
    });

    // Recompute totals to reflect the new discount
    await this.recomputeTotals(invoiceId);

    await this.createAuditLog(invoiceId, 'DISCOUNT_UPDATED', userId, {
      oldDiscount: invoice.discountPercent,
      newDiscount: discountPercent,
    });

    return updatedInvoice;
  }

  async issue(invoiceId: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.QUOTE) {
      throw new BadRequestException('Invoice is already issued');
    }

    if (invoice.items.length === 0) {
      throw new BadRequestException('Cannot issue invoice without items');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.ISSUED,
        issuedAt: new Date(),
      },
    });

    await this.createAuditLog(invoiceId, 'STATUS_CHANGED', userId, {
      from: InvoiceStatus.QUOTE,
      to: InvoiceStatus.ISSUED,
    });

    // Update linked order status if exists
    await this.syncOrderStatus(invoiceId, 'INVOICE_ISSUED');

    // TODO: Queue PDF generation job here

    return updatedInvoice;
  }

  async findAll(clientId?: string) {
    return this.prisma.invoice.findMany({
      where: clientId ? { clientId } : {},
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    return invoice;
  }

  private async recomputeTotals(invoiceId: string): Promise<void> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) return;

    const items = invoice.items;
    const subtotal = items.reduce((sum, item) => sum.plus(item.lineSubtotal), new Decimal(0));
    const taxTotal = items.reduce((sum, item) => sum.plus(item.lineTax), new Decimal(0));
    const itemDiscountTotal = items.reduce((sum, item) => sum.plus(item.lineDiscount), new Decimal(0));
    
    // Apply invoice-level discount to subtotal (after item discounts)
    const invoiceDiscountAmount = subtotal.minus(itemDiscountTotal).times(invoice.discountPercent).dividedBy(100);
    const discountTotal = itemDiscountTotal.plus(invoiceDiscountAmount);
    
    const grandTotal = subtotal.plus(taxTotal).minus(discountTotal);

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal,
      },
    });

    // Sync totals to linked order
    await this.syncOrderTotals(invoiceId, {
      subtotal: subtotal.toNumber(),
      taxTotal: taxTotal.toNumber(),
      grandTotal: grandTotal.toNumber(),
    });
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-`,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const lastNumber = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.split('-')[2], 10)
      : 0;

    return `INV-${year}-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  private async createAuditLog(
    entityId: string,
    action: string,
    userId: string,
    changes?: any,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'Invoice',
        entityId,
        action,
        userId,
        changes,
      },
    });
  }

  async markAsPaid(invoiceId: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.ISSUED) {
      throw new BadRequestException('Only issued invoices can be marked as paid');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });

    await this.createAuditLog(invoiceId, 'STATUS_CHANGED', userId, {
      from: InvoiceStatus.ISSUED,
      to: InvoiceStatus.PAID,
    });

    // Check if linked order is delivered and auto-complete it
    await this.checkAndCompleteOrder(invoiceId);

    return updatedInvoice;
  }

  private async syncOrderStatus(invoiceId: string, orderStatus: string): Promise<void> {
    try {
      await this.prisma.order.updateMany({
        where: { invoiceId },
        data: { status: orderStatus as any },
      });
    } catch (error) {
      console.error('Error syncing order status:', error);
      // Don't throw error as this is not critical for invoice operations
    }
  }

  private async checkAndCompleteOrder(invoiceId: string): Promise<void> {
    try {
      const order = await this.prisma.order.findFirst({
        where: { 
          invoiceId,
          status: 'DELIVERED'
        },
      });

      if (order) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        });
      }
    } catch (error) {
      console.error('Error checking order completion:', error);
      // Don't throw error as this is not critical for invoice operations
    }
  }

  private async syncOrderTotals(invoiceId: string, totals: { subtotal: number; taxTotal: number; grandTotal: number }): Promise<void> {
    try {
      // Find the order linked to this invoice
      const order = await this.prisma.order.findFirst({
        where: { invoiceId },
      });

      if (order) {
        // Update order totals to match invoice totals
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            subtotal: totals.subtotal,
            taxTotal: totals.taxTotal,
            grandTotal: totals.grandTotal,
          },
        });

        console.log(`Synced order ${order.id} totals with invoice ${invoiceId}:`, totals);
      }
    } catch (error) {
      console.error('Error syncing order totals:', error);
      // Don't throw error as this is not critical for invoice operations
    }
  }
}

