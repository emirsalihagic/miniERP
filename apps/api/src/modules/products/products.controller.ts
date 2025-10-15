import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import type { CreateProductDto, ProductFilters } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, ProductStatus } from '@prisma/client';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get all products with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'groupId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: [String], description: 'Filter by status(es). Can be a single value or array of values.' })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'sku', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: [String], description: 'Filter by category(ies). Can be a single value or array of values.' })
  @ApiQuery({ name: 'unit', required: false, type: [String], description: 'Filter by unit(s). Can be a single value or array of values.' })
  @ApiQuery({ name: 'storageType', required: false, type: [String], description: 'Filter by storage type(s). Can be a single value or array of values.' })
  @ApiQuery({ name: 'attr.color', required: false, type: String, description: 'Filter by attribute (example: attr.color=blue)' })
  @ApiQuery({ name: 'attr.storage', required: false, type: String, description: 'Filter by attribute (example: attr.storage=256)' })
  @ApiResponse({ status: 200, description: 'List of products' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('groupId') groupId?: string,
    @Query('status') status?: string | string[],
    @Query('brand') brand?: string,
    @Query('sku') sku?: string,
    @Query('category') category?: string | string[],
    @Query('unit') unit?: string | string[],
    @Query('storageType') storageType?: string | string[],
    @Query() query?: any,
  ) {
    // Parse attribute filters from query parameters
    const attributes: Record<string, any> = {};
    Object.keys(query).forEach(key => {
      if (key.startsWith('attr.')) {
        const attrCode = key.substring(5); // Remove 'attr.' prefix
        attributes[attrCode] = query[key];
      }
    });

    // Handle array parameters - manually parse multiple query params with same name
    const parseArrayParam = (paramName: string): string[] | undefined => {
      const values = query[paramName];
      if (!values) return undefined;
      if (Array.isArray(values)) return values;
      if (typeof values === 'string') {
        // Check if it's a JSON array string
        try {
          const parsed = JSON.parse(values);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          // Not JSON, continue with other parsing
        }
        
        // Check if it's comma-separated values
        if (values.includes(',')) {
          return values.split(',').map(v => v.trim()).filter(v => v.length > 0);
        }
        return [values];
      }
      return [values];
    };

    const parsedStatus = parseArrayParam('status');
    const parsedCategory = parseArrayParam('category');
    const parsedUnit = parseArrayParam('unit');
    const parsedStorageType = parseArrayParam('storageType');

    const filters: ProductFilters = {
      page,
      limit,
      groupId,
      status: parsedStatus && parsedStatus.length === 1 ? parsedStatus[0] as ProductStatus : parsedStatus as ProductStatus[],
      brand,
      sku,
      // category: parsedCategory && parsedCategory.length === 1 ? parsedCategory[0] : parsedCategory, // Temporarily disabled
      unit: parsedUnit && parsedUnit.length === 1 ? parsedUnit[0] : parsedUnit,
      storageType: parsedStorageType && parsedStorageType.length === 1 ? parsedStorageType[0] : parsedStorageType,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    };

    return this.productsService.findAll(filters);
  }

  @Get('orderable')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get orderable products (ACTIVE status only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'groupId', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'sku', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of orderable products' })
  getOrderableProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('groupId') groupId?: string,
    @Query('brand') brand?: string,
    @Query('sku') sku?: string,
    @Query() query?: any,
  ) {
    // Parse attribute filters from query parameters
    const attributes: Record<string, any> = {};
    Object.keys(query).forEach(key => {
      if (key.startsWith('attr.')) {
        const attrCode = key.substring(5); // Remove 'attr.' prefix
        attributes[attrCode] = query[key];
      }
    });

    const filters: ProductFilters = {
      page,
      limit,
      groupId,
      brand,
      sku,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    };

    return this.productsService.getOrderableProducts(filters);
  }

  @Get('shop')
  @ApiOperation({ summary: 'Get shop products (active and sellable only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 500 })
  @ApiQuery({ name: 'groupId', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'sku', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of shop products' })
  getShopProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('groupId') groupId?: string,
    @Query('brand') brand?: string,
    @Query('sku') sku?: string,
    @Query() query?: any,
  ) {
    console.log('=== SHOP PRODUCTS DEBUG ===');
    console.log('Raw query params:', { page, limit, groupId, brand, sku, query });
    console.log('Limit type:', typeof limit, 'Value:', limit);
    
    // Parse attribute filters from query parameters
    const attributes: Record<string, any> = {};
    Object.keys(query).forEach(key => {
      if (key.startsWith('attr.')) {
        const attrCode = key.substring(5); // Remove 'attr.' prefix
        attributes[attrCode] = query[key];
      }
    });

    const filters: ProductFilters = {
      page,
      limit,
      groupId,
      brand,
      sku,
      status: ProductStatus.ACTIVE,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    };

    return this.productsService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Create new product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', example: 'uuid' },
        name: { type: 'string', example: 'iPhone 16 Black 128GB' },
        sku: { type: 'string', example: 'IPH16-BLK-128' },
        status: { 
          type: 'string', 
          enum: ['REGISTRATION', 'ACTIVE', 'INACTIVE'],
          example: 'ACTIVE' 
        },
        storageType: { 
          type: 'string', 
          enum: ['AMBIENT', 'CHILLED', 'FROZEN', 'HAZMAT', 'DRY'],
          example: 'AMBIENT' 
        },
        unitId: { type: 'string', example: 'uuid' },
        brand: { type: 'string', example: 'Apple' },
        shelfLifeDays: { type: 'number', example: null },
        weightPerItem: { type: 'number', example: 0.170 },
        attributes: {
          type: 'object',
          example: {
            color: 'black',
            storage: '128',
            warranty_months: 24,
            launch_year: 2024,
            charger_included: false
          }
        },
        preferredSuppliers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              supplierId: { type: 'string', example: 'uuid' },
              priority: { type: 'number', example: 1 },
              isPrimary: { type: 'boolean', example: true },
              supplierSku: { type: 'string', example: 'MQXY3' },
              price: { type: 'number', example: 1899.00 },
              currency: { type: 'string', example: 'BAM' },
            }
          }
        },
        // Legacy fields
        description: { type: 'string', example: 'High-quality smartphone' },
        category: { type: 'string', example: 'Electronics' },
        supplierId: { type: 'string', example: 'uuid' },
      },
      required: ['sku', 'status', 'storageType', 'unitId', 'supplierId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() updateProductDto: Partial<CreateProductDto>) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('supplier/:supplierId')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get products by supplier' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Supplier products' })
  findBySupplier(
    @Param('supplierId') supplierId: string, 
    @Query('page') page?: number, 
    @Query('limit') limit?: number
  ) {
    return this.productsService.findBySupplier(supplierId, { page, limit });
  }

  @Post(':id/suppliers')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Upsert preferred suppliers for product' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          supplierId: { type: 'string', example: 'uuid' },
          priority: { type: 'number', example: 1 },
          isPrimary: { type: 'boolean', example: true },
          supplierSku: { type: 'string', example: 'MQXY3' },
          price: { type: 'number', example: 1899.00 },
          currency: { type: 'string', example: 'BAM' },
        },
        required: ['supplierId'],
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Preferred suppliers updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  upsertPreferredSuppliers(
    @Param('id') id: string,
    @Body() suppliers: Array<{
      supplierId: string;
      priority?: number;
      isPrimary?: boolean;
      supplierSku?: string;
      price?: number;
      currency?: string;
    }>,
  ) {
    return this.productsService.upsertPreferredSuppliers(id, suppliers);
  }
}
