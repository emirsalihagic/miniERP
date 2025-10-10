import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SuppliersService {
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
    return this.prisma.supplier.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        users: true,
        products: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
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
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

