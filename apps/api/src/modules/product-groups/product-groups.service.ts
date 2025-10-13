import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateProductGroupDto {
  name: string;
  code: string;
  description?: string;
}

export interface AssignGroupAttributeDto {
  attributeId: string;
  required?: boolean;
  uniqueInGroup?: boolean;
  sortOrder?: number;
}

@Injectable()
export class ProductGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductGroupDto) {
    // Check if group code already exists
    const existing = await this.prisma.productGroup.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new BadRequestException(`Product group with code '${data.code}' already exists`);
    }

    return this.prisma.productGroup.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.productGroup.findMany({
      include: {
        groupAttributes: {
          include: {
            attribute: {
              include: {
                options: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.productGroup.findUnique({
      where: { id },
      include: {
        groupAttributes: {
          include: {
            attribute: {
              include: {
                options: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          include: {
            attributeValues: {
              include: {
                attribute: true,
              },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Product group with ID '${id}' not found`);
    }

    return group;
  }

  async update(id: string, data: Partial<CreateProductGroupDto>) {
    // Check if group exists
    const existing = await this.prisma.productGroup.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product group with ID '${id}' not found`);
    }

    // If updating code, check if it already exists for another group
    if (data.code && data.code !== existing.code) {
      const codeExists = await this.prisma.productGroup.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        throw new BadRequestException(`Product group with code '${data.code}' already exists`);
      }
    }

    return this.prisma.productGroup.update({
      where: { id },
      data,
    });
  }

  async assignAttributes(groupId: string, attributes: AssignGroupAttributeDto[]) {
    // Verify group exists
    const group = await this.prisma.productGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Product group with ID '${groupId}' not found`);
    }

    // Check for duplicate attribute assignments
    const attributeIds = attributes.map(attr => attr.attributeId);
    const duplicates = attributeIds.filter((id, index) => attributeIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      throw new BadRequestException(`Duplicate attribute assignments found`);
    }

    // Verify all attributes exist
    const existingAttributes = await this.prisma.attribute.findMany({
      where: { id: { in: attributeIds } },
    });

    if (existingAttributes.length !== attributeIds.length) {
      const foundIds = existingAttributes.map(attr => attr.id);
      const missingIds = attributeIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Attributes not found: ${missingIds.join(', ')}`);
    }

    // Check for existing assignments
    const existingAssignments = await this.prisma.groupAttribute.findMany({
      where: {
        groupId,
        attributeId: { in: attributeIds },
      },
    });

    if (existingAssignments.length > 0) {
      const existingIds = existingAssignments.map(assignment => assignment.attributeId);
      throw new BadRequestException(`Attributes already assigned: ${existingIds.join(', ')}`);
    }

    // Create assignments
    return this.prisma.groupAttribute.createMany({
      data: attributes.map(attr => ({
        groupId,
        attributeId: attr.attributeId,
        required: attr.required || false,
        uniqueInGroup: attr.uniqueInGroup || false,
        sortOrder: attr.sortOrder || 0,
      })),
    });
  }

  async getAttributes(groupId: string) {
    const group = await this.prisma.productGroup.findUnique({
      where: { id: groupId },
      include: {
        groupAttributes: {
          include: {
            attribute: {
              include: {
                options: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Product group with ID '${groupId}' not found`);
    }

    return group.groupAttributes;
  }

  async removeAttribute(groupId: string, attributeId: string) {
    // Verify group exists
    const group = await this.prisma.productGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Product group with ID '${groupId}' not found`);
    }

    // Check if attribute assignment exists
    const existingAssignment = await this.prisma.groupAttribute.findFirst({
      where: {
        groupId,
        attributeId,
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException(`Attribute assignment not found for group '${groupId}' and attribute '${attributeId}'`);
    }

    // Remove the assignment
    await this.prisma.groupAttribute.delete({
      where: {
        id: existingAssignment.id,
      },
    });

    return { message: 'Attribute removed successfully' };
  }

  async generateVariationKey(groupId: string, attributeValues: Record<string, any>): Promise<string> {
    const group = await this.findOne(groupId);
    const uniqueAttributes = group.groupAttributes.filter(ga => ga.uniqueInGroup);
    
    const variationParts: string[] = [];
    
    for (const groupAttribute of uniqueAttributes) {
      const value = attributeValues[groupAttribute.attributeId];
      if (value !== undefined && value !== null) {
        variationParts.push(`${groupAttribute.attributeId}=${value}`);
      }
    }
    
    return variationParts.join('|');
  }
}
