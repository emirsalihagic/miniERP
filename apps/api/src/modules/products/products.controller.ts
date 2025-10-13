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
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'sku', required: false, type: String })
  @ApiQuery({ name: 'attr.color', required: false, type: String, description: 'Filter by attribute (example: attr.color=blue)' })
  @ApiQuery({ name: 'attr.storage', required: false, type: String, description: 'Filter by attribute (example: attr.storage=256)' })
  @ApiResponse({ status: 200, description: 'List of products' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('groupId') groupId?: string,
    @Query('status') status?: ProductStatus,
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
      status,
      brand,
      sku,
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
  @Roles(UserRole.CLIENT_USER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get shop products (active and sellable only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
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
