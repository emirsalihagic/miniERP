import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductStatus, UnitGroup, Prisma } from '@prisma/client';
import { ValidationException } from '../../common/exceptions/validation.exception';

export interface CreateProductDto {
  groupId?: string;
  name?: string;
  sku: string;
  status: ProductStatus;
  storageType: string;
  unitId: string;
  brand?: string;
  shelfLifeDays?: number;
  weightPerItem?: number;
  attributes?: Record<string, any>;
  preferredSuppliers?: Array<{
    supplierId: string;
    priority?: number;
    isPrimary?: boolean;
    supplierSku?: string;
    price?: number;
    currency?: string;
  }>;
  // Legacy fields for backward compatibility
  description?: string;
  category?: string;
  supplierId: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

export interface ProductFilters {
  groupId?: string;
  status?: ProductStatus;
  brand?: string;
  sku?: string;
  attributes?: Record<string, any>;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    // Collect all validation errors
    const validationErrors: string[] = [];

    // Validate unit exists and get its group
    let unit: any = null;
    try {
      unit = await this.prisma.unit.findUnique({
        where: { id: data.unitId },
      });
    } catch (error) {
      validationErrors.push(`Invalid unit ID format`);
    }

    if (!unit && validationErrors.filter(e => e.includes('unit')).length === 0) {
      validationErrors.push(`Unit with ID '${data.unitId}' not found`);
    } else if (unit) {
      // Validate weightPerItem requirement
      if (unit.group !== UnitGroup.WEIGHT && !data.weightPerItem) {
        validationErrors.push(`weightPerItem is required when unit group is ${unit.group}`);
      }
    }

    let variationKey = '';
    let productName = data.name;

    // Handle product group logic if groupId is provided
    if (data.groupId) {
      const group = await this.prisma.productGroup.findUnique({
        where: { id: data.groupId },
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
        validationErrors.push(`Product group with ID '${data.groupId}' not found`);
      } else {
        // Validate required attributes
        const requiredAttributes = group.groupAttributes.filter(ga => ga.required);
        for (const groupAttribute of requiredAttributes) {
          const value = data.attributes?.[groupAttribute.attributeId];
          if (value === undefined || value === null) {
            validationErrors.push(`Required attribute '${groupAttribute.attribute.name}' is missing`);
          }
        }

        // Generate variation key
        variationKey = await this.generateVariationKey(data.groupId, data.attributes || {});

        // Check for uniqueness
        const existingProduct = await this.prisma.product.findUnique({
          where: {
            groupId_variationKey: {
              groupId: data.groupId,
              variationKey,
            },
          },
        });

        if (existingProduct) {
          // Get the conflicting product details and attribute values
          const conflictingProduct = await this.prisma.product.findUnique({
            where: { id: existingProduct.id },
            include: {
              attributeValues: {
                include: {
                  attribute: {
                include: {
                  options: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
                },
              },
            },
          });

          // Build detailed error message
          const attributeDetails = conflictingProduct?.attributeValues
            .map(av => `${av.attribute.name}: ${av.value}`)
            .join(', ') || 'unknown attributes';

          validationErrors.push(
            `A product with this combination of attributes already exists. ` +
            `Conflicting product: "${existingProduct.name}" (SKU: ${existingProduct.sku}) ` +
            `with attributes: ${attributeDetails}. ` +
            `Please change one or more attribute values to create a unique combination.`
          );
        }

        // Generate name if not provided
        if (!productName) {
          productName = group.name; // Use group name as base name
        }
      }
    }

    // Check for SKU uniqueness
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      validationErrors.push(`A product with SKU '${data.sku}' already exists. Please use a different SKU.`);
    }

    // Validate supplier exists
    let supplier: any = null;
    try {
      supplier = await this.prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });
    } catch (error) {
      validationErrors.push(`Invalid supplier ID format`);
    }

    if (!supplier && validationErrors.filter(e => e.includes('supplier')).length === 0) {
      validationErrors.push(`Supplier with ID '${data.supplierId}' not found`);
    }

    // If there are validation errors, throw them all at once
    if (validationErrors.length > 0) {
      throw new ValidationException(validationErrors);
    }

    // Create the product
    let product;
    try {
      product = await this.prisma.product.create({
        data: {
          sku: data.sku,
          name: productName,
          description: data.description,
          category: data.category,
          supplierId: data.supplierId,
          groupId: data.groupId,
          unitId: data.unitId,
          status: data.status,
          storageType: data.storageType as any,
          brand: data.brand,
          shelfLifeDays: data.shelfLifeDays,
          weightPerItem: data.weightPerItem,
          variationKey,
        },
        include: {
          supplier: true,
          productGroup: true,
          unit: true,
          attributeValues: {
            include: {
              attribute: {
                include: {
                  options: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          preferredSuppliers: {
            include: {
              supplier: true,
            },
            orderBy: { priority: 'asc' },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          const target = error.meta?.target as string[];
          if (target?.includes('sku')) {
            throw new BadRequestException(`A product with SKU '${data.sku}' already exists. Please use a different SKU.`);
          }
          if (target?.includes('variationKey')) {
            throw new BadRequestException(`A product with this combination of attributes already exists in this group. Please change one or more attribute values to create a unique combination.`);
          }
        }
      }
      throw error; // Re-throw if it's not a handled Prisma error
    }

    // Create attribute values if provided
    if (data.attributes) {
      if (data.groupId) {
        // For group products, use group attributes
        await this.createAttributeValues(product.id, data.groupId, data.attributes);
      } else {
        // For individual products, create attribute values directly
        await this.createIndividualAttributeValues(product.id, data.attributes);
      }
    }

    // Create preferred suppliers if provided
    if (data.preferredSuppliers && data.preferredSuppliers.length > 0) {
      await this.createPreferredSuppliers(product.id, data.preferredSuppliers);
    }

    return this.findOne(product.id);
  }

  async findAll(filters: ProductFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      deletedAt: null,
    };

    // Apply filters
    if (filters.groupId) {
      where.groupId = filters.groupId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.brand) {
      where.brand = filters.brand;
    }
    if (filters.sku) {
      where.sku = { contains: filters.sku, mode: 'insensitive' };
    }

    // Handle attribute filters
    if (filters.attributes && Object.keys(filters.attributes).length > 0) {
      const attributeConditions: any[] = [];
      
      for (const [attrId, value] of Object.entries(filters.attributes)) {
        attributeConditions.push({
          attributeValues: {
            some: {
              attribute: {
                id: attrId,
              },
              value: value,
            },
          },
        });
      }

      if (attributeConditions.length > 0) {
        where.AND = attributeConditions;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          supplier: true,
          productGroup: true,
          unit: true,
          attributeValues: {
            include: {
              attribute: {
                include: {
                  options: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          preferredSuppliers: {
            include: {
              supplier: true,
            },
            orderBy: { priority: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Partial<CreateProductDto>) {
    console.log('=== PRODUCT UPDATE CALLED ===');
    console.log('Product ID:', id);
    console.log('Update data:', JSON.stringify(data, null, 2));
    
    const existingProduct = await this.findOne(id);
    
    // Collect all validation errors
    const validationErrors: string[] = [];

    // Check for SKU uniqueness if SKU is being changed
    if (data.sku && data.sku !== existingProduct.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existingSku) {
        validationErrors.push(`A product with SKU '${data.sku}' already exists. Please use a different SKU.`);
      }
    }

    // Validate unit if being changed
    if (data.unitId && data.unitId !== existingProduct.unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: data.unitId },
      });

      if (!unit) {
        validationErrors.push(`Unit with ID '${data.unitId}' not found`);
      } else {
        // Validate weightPerItem requirement
        if (unit && unit.group !== UnitGroup.WEIGHT && !data.weightPerItem) {
          validationErrors.push(`weightPerItem is required when unit group is ${unit.group}`);
        }
      }
    }

    // Validate supplier if being changed
    if (data.supplierId && data.supplierId !== existingProduct.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });

      if (!supplier) {
        validationErrors.push(`Supplier with ID '${data.supplierId}' not found`);
      }
    }

    // Handle variation key regeneration if attributes changed
    let variationKey = existingProduct.variationKey;
    let productName = data.name || existingProduct.name;

    if (data.attributes && existingProduct.groupId) {
      variationKey = await this.generateVariationKey(existingProduct.groupId!, data.attributes as Record<string, any>);
      
      // Check for uniqueness if variation key changed
      if (variationKey !== existingProduct.variationKey) {
        const duplicateProduct = await this.prisma.product.findFirst({
          where: {
            groupId: existingProduct.groupId,
            variationKey,
            id: { not: id },
          },
        });

        if (duplicateProduct) {
          // Get the conflicting product details and attribute values
          const conflictingProduct = await this.prisma.product.findUnique({
            where: { id: duplicateProduct.id },
            include: {
              attributeValues: {
                include: {
                  attribute: {
                include: {
                  options: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
                },
              },
            },
          });

          // Build detailed error message
          const attributeDetails = conflictingProduct?.attributeValues
            .map(av => `${av.attribute.name}: ${av.value}`)
            .join(', ') || 'unknown attributes';

          validationErrors.push(
            `A product with this combination of attributes already exists. ` +
            `Conflicting product: "${duplicateProduct.name}" (SKU: ${duplicateProduct.sku}) ` +
            `with attributes: ${attributeDetails}. ` +
            `Please change one or more attribute values to create a unique combination.`
          );
        }
      }

      // Regenerate name if not explicitly provided
      if (!data.name) {
        const group = await this.prisma.productGroup.findUnique({
          where: { id: existingProduct.groupId! },
        });
        productName = group ? group.name : existingProduct.name;
      }
    }

    // If there are validation errors, throw them all at once
    if (validationErrors.length > 0) {
      throw new ValidationException(validationErrors);
    }

    let updatedProduct;
    try {
      updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          sku: data.sku,
          name: productName,
          description: data.description,
          category: data.category,
          supplierId: data.supplierId,
          groupId: data.groupId,
          unitId: data.unitId,
          status: data.status,
          storageType: data.storageType as any,
          brand: data.brand,
          shelfLifeDays: data.shelfLifeDays,
          weightPerItem: data.weightPerItem,
          variationKey,
        },
        include: {
          supplier: true,
          productGroup: true,
          unit: true,
          attributeValues: {
            include: {
              attribute: {
                include: {
                  options: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          preferredSuppliers: {
            include: {
              supplier: true,
            },
            orderBy: { priority: 'asc' },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          const target = error.meta?.target as string[];
          if (target?.includes('sku')) {
            throw new BadRequestException(`A product with SKU '${data.sku}' already exists. Please use a different SKU.`);
          }
          if (target?.includes('variationKey')) {
            throw new BadRequestException(`A product with this combination of attributes already exists in this group. Please change one or more attribute values to create a unique combination.`);
          }
        }
      }
      throw error; // Re-throw if it's not a handled Prisma error
    }

    // Update attribute values if provided
    console.log('UPDATE: Checking attributes condition:', { hasAttributes: !!data.attributes, attributes: data.attributes });
    if (data.attributes) {
      console.log('UPDATE: About to call updateAttributeValues with:', { id, existingProductGroupId: existingProduct.groupId, attributes: data.attributes });
      await this.updateAttributeValues(id, existingProduct.groupId, data.attributes as Record<string, any>);
    } else {
      console.log('UPDATE: No attributes provided, skipping updateAttributeValues');
    }

    // Update preferred suppliers if provided
    if (data.preferredSuppliers) {
      await this.upsertPreferredSuppliers(id, data.preferredSuppliers as any);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Check if product is referenced in invoices
    const invoiceItems = await this.prisma.invoiceItem.findFirst({
      where: { productId: id },
    });

    if (invoiceItems) {
      throw new BadRequestException(
        'Cannot delete product that is referenced in invoices. Use deactivation instead.',
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async findBySupplier(supplierId: string, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          supplierId,
          isActive: true,
          deletedAt: null,
        },
        include: {
          supplier: true,
          productGroup: true,
          unit: true,
          attributeValues: {
            include: {
              attribute: {
                include: {
                  options: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          preferredSuppliers: {
            include: {
              supplier: true,
            },
            orderBy: { priority: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({
        where: {
          supplierId,
          isActive: true,
          deletedAt: null,
        },
      }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async upsertPreferredSuppliers(productId: string, suppliers: Array<{
    supplierId: string;
    priority?: number;
    isPrimary?: boolean;
    supplierSku?: string;
    price?: number;
    currency?: string;
  }>) {
    // Verify product exists
    await this.findOne(productId);

    // Delete existing preferred suppliers
    await this.prisma.productPreferredSupplier.deleteMany({
      where: { productId },
    });

    // Create new preferred suppliers
    if (suppliers.length > 0) {
      await this.createPreferredSuppliers(productId, suppliers);
    }

    return this.prisma.productPreferredSupplier.findMany({
      where: { productId },
      include: {
        supplier: true,
      },
      orderBy: { priority: 'asc' },
    });
  }

  // Helper methods
  private async generateVariationKey(groupId: string, attributeValues: Record<string, any>): Promise<string> {
    const group = await this.prisma.productGroup.findUnique({
      where: { id: groupId },
      include: {
        groupAttributes: {
          where: { uniqueInGroup: true },
          include: {
            attribute: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Product group with ID '${groupId}' not found`);
    }

    const variationParts: string[] = [];
    
    for (const groupAttribute of group.groupAttributes) {
      const value = attributeValues[groupAttribute.attributeId];
      if (value !== undefined && value !== null) {
        variationParts.push(`${groupAttribute.attributeId}=${value}`);
      }
    }
    
    return variationParts.join('|');
  }

  private async createAttributeValues(productId: string, groupId: string, attributeValues: Record<string, any>) {
    const group = await this.prisma.productGroup.findUnique({
      where: { id: groupId },
      include: {
        groupAttributes: {
          include: {
            attribute: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Product group with ID '${groupId}' not found`);
    }

    const valuesToCreate: any[] = [];

    for (const [attrId, value] of Object.entries(attributeValues)) {
      const groupAttribute = group.groupAttributes.find(ga => ga.attributeId === attrId);
      if (groupAttribute) {
        valuesToCreate.push({
          productId,
          attributeId: groupAttribute.attributeId,
          value: value,
        });
      }
    }

    if (valuesToCreate.length > 0) {
      await this.prisma.productAttributeValue.createMany({
        data: valuesToCreate,
      });
    }
  }

  private async createIndividualAttributeValues(productId: string, attributeValues: Record<string, any>) {
    console.log('createIndividualAttributeValues called with:', { productId, attributeValues });
    const valuesToCreate: any[] = [];

    for (const [attrId, value] of Object.entries(attributeValues)) {
      console.log('Processing attribute:', { attrId, value });
      // Find attribute by ID
      const attribute = await this.prisma.attribute.findUnique({
        where: { id: attrId },
      });
      console.log('Found attribute:', attribute);

      if (attribute) {
        valuesToCreate.push({
          productId,
          attributeId: attribute.id,
          value: value,
        });
      }
    }

    console.log('Values to create:', valuesToCreate);
    if (valuesToCreate.length > 0) {
      await this.prisma.productAttributeValue.createMany({
        data: valuesToCreate,
      });
      console.log('Created attribute values');
    }
  }

  private async updateAttributeValues(productId: string, groupId: string | null, attributeValues: Record<string, any>) {
    console.log('updateAttributeValues called with:', { productId, groupId, attributeValues });
    
    // Delete existing attribute values
    await this.prisma.productAttributeValue.deleteMany({
      where: { productId },
    });
    console.log('Deleted existing attribute values');

    // Create new ones
    if (groupId) {
      console.log('Creating group attribute values');
      await this.createAttributeValues(productId, groupId, attributeValues);
    } else {
      console.log('Creating individual attribute values');
      await this.createIndividualAttributeValues(productId, attributeValues);
    }
    console.log('updateAttributeValues completed');
  }

  private async createPreferredSuppliers(productId: string, suppliers: Array<{
    supplierId: string;
    priority?: number;
    isPrimary?: boolean;
    supplierSku?: string;
    price?: number;
    currency?: string;
  }>) {
    // Ensure only one primary supplier
    const primarySuppliers = suppliers.filter(s => s.isPrimary);
    if (primarySuppliers.length > 1) {
      throw new BadRequestException('Only one supplier can be marked as primary');
    }

    const suppliersToCreate = suppliers.map((supplier, index) => ({
      productId,
      supplierId: supplier.supplierId,
      priority: supplier.priority || index + 1,
      isPrimary: supplier.isPrimary || false,
      supplierSku: supplier.supplierSku,
      price: supplier.price,
      currency: supplier.currency,
    }));

    await this.prisma.productPreferredSupplier.createMany({
      data: suppliersToCreate,
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        supplier: true,
        productGroup: {
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
            },
          },
        },
        unit: true,
        attributeValues: {
          include: {
            attribute: {
              include: {
                options: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        preferredSuppliers: {
          include: {
            supplier: true,
          },
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async getOrderableProducts(filters: ProductFilters = {}) {
    const where: any = {
      status: ProductStatus.ACTIVE,
      forbidSale: false,
    };

    if (filters.groupId) {
      where.groupId = filters.groupId;
    }

    if (filters.brand) {
      where.brand = filters.brand;
    }

    if (filters.sku) {
      where.sku = { contains: filters.sku, mode: 'insensitive' };
    }

    // Handle attribute filters
    if (filters.attributes) {
      const attributeConditions = Object.entries(filters.attributes).map(([attrId, value]) => ({
        attributeValues: {
          some: {
            attributeId: attrId,
            value: value,
          },
        },
      }));

      if (attributeConditions.length > 0) {
        where.AND = attributeConditions;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          supplier: true,
          productGroup: true,
          unit: true,
          attributeValues: {
            include: {
              attribute: {
                include: {
                  options: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          preferredSuppliers: {
            include: {
              supplier: true,
            },
            orderBy: { priority: 'asc' },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
