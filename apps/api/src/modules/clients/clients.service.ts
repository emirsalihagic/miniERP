import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClientDto, UpdateClientDto, QueryClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const tags = dto.tags?.map(t => t.toLowerCase());
    const createdClient = await this.prisma.client.create({ 
      data: { 
        ...dto, 
        tags,
        creditLimit: dto.creditLimit || 0,
        lastContactedAt: dto.lastContactedAt ? new Date(dto.lastContactedAt) : null,
        nextFollowupAt: dto.nextFollowupAt ? new Date(dto.nextFollowupAt) : null,
      } 
    });

    // Convert Decimal fields to numbers for JSON serialization
    return {
      ...createdClient,
      creditLimit: createdClient.creditLimit ? Number(createdClient.creditLimit) : 0,
    };
  }

  async findAll(qp: QueryClientDto) {
    const page = Math.max(parseInt(qp.page ?? '1', 10), 1);
    const take = Math.min(Math.max(parseInt(qp.limit ?? '20', 10), 1), 100);
    const skip = (page - 1) * take;

    const whereConditions: any[] = [];

    if (qp.status) {
      whereConditions.push({ status: qp.status });
    }

    if (qp.city) {
      whereConditions.push({ billingCity: qp.city });
    }

    if (qp.assignedToId) {
      whereConditions.push({ assignedToId: qp.assignedToId });
    }

    if (qp.q) {
      whereConditions.push({
        OR: [
          { name: { contains: qp.q, mode: 'insensitive' as any } },
          { email: { contains: qp.q, mode: 'insensitive' as any } },
          { clientCode: { contains: qp.q, mode: 'insensitive' as any } },
          { taxNumber: { contains: qp.q, mode: 'insensitive' as any } },
        ],
      });
    }

    if (qp.tags) {
      whereConditions.push({
        tags: {
          hasSome: qp.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        },
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const orderBy = { [qp.sort ?? 'name']: (qp.order ?? 'asc') as 'asc' | 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({ 
        where, 
        orderBy, 
        skip, 
        take,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      }),
      this.prisma.client.count({ where }),
    ]);

    // Convert Decimal fields to numbers for JSON serialization
    const transformedItems = items.map(client => ({
      ...client,
      creditLimit: client.creditLimit ? Number(client.creditLimit) : 0,
    }));

    return { 
      items: transformedItems, 
      total, 
      page, 
      limit: take, 
      pages: Math.ceil(total / take) 
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        users: true,
        invoices: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            grandTotal: true,
            remainingAmount: true,
            issuedAt: true,
            dueDate: true,
          }
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Convert Decimal fields to numbers for JSON serialization
    return {
      ...client,
      creditLimit: client.creditLimit ? Number(client.creditLimit) : 0,
    };
  }

  async update(id: string, dto: UpdateClientDto) {
    const tags = dto.tags?.map(t => t.toLowerCase());
    const updateData: any = { ...dto };
    
    if (tags) {
      updateData.tags = tags;
    }
    
    if (dto.lastContactedAt) {
      updateData.lastContactedAt = new Date(dto.lastContactedAt);
    }
    
    if (dto.nextFollowupAt) {
      updateData.nextFollowupAt = new Date(dto.nextFollowupAt);
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: updateData,
    });

    // Convert Decimal fields to numbers for JSON serialization
    return {
      ...updatedClient,
      creditLimit: updatedClient.creditLimit ? Number(updatedClient.creditLimit) : 0,
    };
  }

  async remove(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }

  async getInvoices(clientId: string, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { clientId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where: { clientId } }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async summary(id: string) {
    const [count, unpaid, lastInvoice] = await this.prisma.$transaction([
      this.prisma.invoice.count({ where: { clientId: id } }),
      this.prisma.invoice.aggregate({
        _sum: { remainingAmount: true },
        where: { clientId: id, status: { in: ['ISSUED', 'SENT'] } },
      }),
      this.prisma.invoice.findFirst({
        where: { clientId: id },
        orderBy: { issuedAt: 'desc' },
        select: { issuedAt: true, id: true, invoiceNumber: true },
      }),
    ]);

    return {
      invoicesCount: count,
      unpaidTotal: unpaid._sum.remainingAmount ?? 0,
      lastInvoiceAt: lastInvoice?.issuedAt ?? null,
      lastInvoiceId: lastInvoice?.id ?? null,
      lastInvoiceNumber: lastInvoice?.invoiceNumber ?? null,
    };
  }
}

