import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AttributeType } from '@prisma/client';

export interface CreateAttributeDto {
  name: string;
  type: AttributeType;
  options?: CreateAttributeOptionDto[];
}

export interface CreateAttributeOptionDto {
  option: string;
  sortOrder?: number;
}

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAttributeDto) {
    try {
      console.log('Starting create with data:', data);
      
      // Create attribute with options if provided
      const { options, ...attributeData } = data;
      
      console.log('Creating attribute with data:', attributeData);
      const attribute = await this.prisma.attribute.create({
        data: attributeData,
      });
      console.log('Created attribute:', attribute);

      // Add options if provided and attribute type is LIST
      if (options && options.length > 0 && data.type === AttributeType.LIST) {
        console.log('Adding options:', options);
        // Filter out empty options
        const validOptions = options.filter(opt => 
          opt.option !== null && 
          opt.option !== undefined && 
          opt.option.trim() !== ''
        );
        if (validOptions.length > 0) {
          await this.addOptions(attribute.id, validOptions);
        }
      }

      // Return attribute with options
      const result = await this.findOne(attribute.id);
      console.log('Final result:', result);
      return result;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      console.log('Starting findAll...');
      console.log('Prisma service:', this.prisma);
      console.log('Prisma service type:', typeof this.prisma);
      
      const result = await this.prisma.attribute.findMany({
        include: {
          options: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });
      console.log('findAll result:', result);
      return result;
    } catch (error) {
      console.error('Error in findAll:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID '${id}' not found`);
    }

    return attribute;
  }

  async addOptions(attributeId: string, optionsData: CreateAttributeOptionDto[]) {
    // Verify attribute exists
    const attribute = await this.prisma.attribute.findUnique({
      where: { id: attributeId },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID '${attributeId}' not found`);
    }

    // Check for duplicate values within the options array
    const optionValues = optionsData
      .map(opt => opt.option)
      .filter(opt => opt !== null && opt !== undefined && opt.trim() !== '');
    
    const duplicates = optionValues.filter((option, index) => optionValues.indexOf(option) !== index);
    if (duplicates.length > 0) {
      throw new BadRequestException(`Duplicate options found: ${duplicates.join(', ')}`);
    }

    // Check for existing values in database
    const existingOptions = await this.prisma.attributeOption.findMany({
      where: {
        attributeId,
        option: { in: optionValues },
      },
    });

    if (existingOptions.length > 0) {
      const existingValues = existingOptions.map(opt => opt.option);
      throw new BadRequestException(`Options already exist: ${existingValues.join(', ')}`);
    }

    // Create options
    return this.prisma.attributeOption.createMany({
      data: optionsData.map(option => ({
        attributeId,
        option: option.option,
        sortOrder: option.sortOrder || 0,
      })),
    });
  }

  async update(id: string, data: CreateAttributeDto) {
    // Check if attribute exists
    const existing = await this.prisma.attribute.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Attribute with ID '${id}' not found`);
    }

    // Update attribute
    const { options, ...attributeData } = data;
    
    const updatedAttribute = await this.prisma.attribute.update({
      where: { id },
      data: attributeData,
    });

    // Handle options if provided and attribute type is LIST
    if (options && data.type === AttributeType.LIST) {
      // Delete existing options
      await this.prisma.attributeOption.deleteMany({
        where: { attributeId: id },
      });

      // Add new options
      if (options.length > 0) {
        await this.addOptions(id, options);
      }
    }

    // Return attribute with options
    return this.findOne(id);
  }

  async remove(id: string) {
    // Check if attribute exists
    const existing = await this.prisma.attribute.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Attribute with ID '${id}' not found`);
    }

    // Check if attribute is being used in any product groups
    const groupAttributes = await this.prisma.groupAttribute.findMany({
      where: { attributeId: id },
    });

    if (groupAttributes.length > 0) {
      throw new BadRequestException(`Cannot delete attribute. It is being used in ${groupAttributes.length} product group(s)`);
    }

    // Check if attribute has product attribute values
    const productValues = await this.prisma.productAttributeValue.findMany({
      where: { attributeId: id },
    });

    if (productValues.length > 0) {
      throw new BadRequestException(`Cannot delete attribute. It has ${productValues.length} product value(s)`);
    }

    // Delete attribute options first (cascade should handle this, but being explicit)
    await this.prisma.attributeOption.deleteMany({
      where: { attributeId: id },
    });

    // Delete the attribute
    return this.prisma.attribute.delete({
      where: { id },
    });
  }

  async validateValue(attributeId: string, value: any): Promise<boolean> {
    const attribute = await this.findOne(attributeId);

    switch (attribute.type) {
      case AttributeType.TEXT:
        return typeof value === 'string';
      case AttributeType.NUMBER:
        return Number.isInteger(value);
      case AttributeType.DECIMAL:
        return typeof value === 'number' && !isNaN(value);
      case AttributeType.BOOLEAN:
        return typeof value === 'boolean';
      case AttributeType.DATE:
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      case AttributeType.LIST:
        return attribute.options.some(option => option.option === value);
      default:
        return false;
    }
  }
}
