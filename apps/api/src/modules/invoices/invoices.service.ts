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
      },
      include: {
        client: true,
        items: true,
      },
    });

    await this.createAuditLog(invoice.id, 'CREATED', userId);

    return invoice;
  }

  async addItem(invoiceId: string, dto: AddInvoiceItemDto, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
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
    const lineDiscount = this.pricingResolver.calculateLineDiscount(lineSubtotal, resolvedPrice.discountPercent);
    const lineTax = this.pricingResolver.calculateLineTax(lineSubtotal, lineDiscount, resolvedPrice.taxRate);
    const lineTotal = this.pricingResolver.calculateLineTotal(lineSubtotal, lineTax, lineDiscount);

    const item = await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        productId: dto.productId,
        sku: product.sku,
        productName: product.name,
        quantity,
        unitPrice: resolvedPrice.price,
        taxRate: resolvedPrice.taxRate,
        discountPercent: resolvedPrice.discountPercent,
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

  async issue(invoiceId: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
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
      from: InvoiceStatus.DRAFT,
      to: InvoiceStatus.ISSUED,
    });

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
    const items = await this.prisma.invoiceItem.findMany({
      where: { invoiceId },
    });

    const subtotal = items.reduce((sum, item) => sum.plus(item.lineSubtotal), new Decimal(0));
    const taxTotal = items.reduce((sum, item) => sum.plus(item.lineTax), new Decimal(0));
    const discountTotal = items.reduce((sum, item) => sum.plus(item.lineDiscount), new Decimal(0));
    const grandTotal = items.reduce((sum, item) => sum.plus(item.lineTotal), new Decimal(0));

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal,
      },
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
}

