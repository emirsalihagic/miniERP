import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    taxId?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }) {
    return this.prisma.client.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.client.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        users: true,
        invoices: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(id: string, data: Partial<{
    name: string;
    taxId: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    isActive: boolean;
  }>) {
    return this.prisma.client.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.client.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

