import { Controller, Get, Post, Body, Param, UseGuards, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ProductGroupsService } from './product-groups.service';
import type { CreateProductGroupDto, AssignGroupAttributeDto } from './product-groups.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Product Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product-groups')
export class ProductGroupsController {
  constructor(private readonly productGroupsService: ProductGroupsService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create new product group' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Apple iPhone 16' },
        code: { type: 'string', example: 'IPH16' },
        description: { type: 'string', example: 'Base model iPhone 16' },
      },
      required: ['name', 'code'],
    },
  })
  @ApiResponse({ status: 201, description: 'Product group created' })
  @ApiResponse({ status: 400, description: 'Product group code already exists' })
  create(@Body() createProductGroupDto: CreateProductGroupDto) {
    return this.productGroupsService.create(createProductGroupDto);
  }

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get all product groups' })
  @ApiResponse({ status: 200, description: 'List of product groups' })
  findAll() {
    return this.productGroupsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get product group by ID' })
  @ApiResponse({ status: 200, description: 'Product group found' })
  @ApiResponse({ status: 404, description: 'Product group not found' })
  findOne(@Param('id') id: string) {
    return this.productGroupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update product group' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Apple iPhone 16' },
        code: { type: 'string', example: 'IPH16' },
        description: { type: 'string', example: 'Base model iPhone 16' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Product group updated' })
  @ApiResponse({ status: 400, description: 'Product group code already exists' })
  @ApiResponse({ status: 404, description: 'Product group not found' })
  update(@Param('id') id: string, @Body() updateProductGroupDto: Partial<CreateProductGroupDto>) {
    return this.productGroupsService.update(id, updateProductGroupDto);
  }

  @Post(':id/attributes')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Assign attributes to product group' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          attributeId: { type: 'string', example: 'uuid' },
          required: { type: 'boolean', example: true },
          uniqueInGroup: { type: 'boolean', example: true },
          useInName: { type: 'boolean', example: true },
          sortOrder: { type: 'number', example: 1 },
        },
        required: ['attributeId'],
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Attributes assigned' })
  @ApiResponse({ status: 400, description: 'Invalid attributes or duplicates' })
  @ApiResponse({ status: 404, description: 'Product group not found' })
  assignAttributes(
    @Param('id') id: string,
    @Body() attributes: AssignGroupAttributeDto[],
  ) {
    return this.productGroupsService.assignAttributes(id, attributes);
  }

  @Get(':id/attributes')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get attributes assigned to product group' })
  @ApiResponse({ status: 200, description: 'Group attributes' })
  @ApiResponse({ status: 404, description: 'Product group not found' })
  getAttributes(@Param('id') id: string) {
    return this.productGroupsService.getAttributes(id);
  }

  @Delete(':id/attributes/:attributeId')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Remove attribute from product group' })
  @ApiResponse({ status: 200, description: 'Attribute removed' })
  @ApiResponse({ status: 404, description: 'Product group or attribute not found' })
  removeAttribute(
    @Param('id') groupId: string,
    @Param('attributeId') attributeId: string,
  ) {
    return this.productGroupsService.removeAttribute(groupId, attributeId);
  }
}
