import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { PricingResolutionService } from './pricing-resolution.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Pricing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly pricingResolutionService: PricingResolutionService,
  ) {}

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get all pricing rules' })
  @ApiResponse({ status: 200, description: 'List of pricing rules' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.pricingService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get pricing rule by ID' })
  @ApiResponse({ status: 200, description: 'Pricing rule found' })
  @ApiResponse({ status: 404, description: 'Pricing rule not found' })
  findOne(@Param('id') id: string) {
    return this.pricingService.findOne(id);
  }

  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Create new pricing rule' })
  @ApiResponse({ status: 201, description: 'Pricing rule created' })
  create(@Body() createPricingDto: any) {
    return this.pricingService.create(createPricingDto);
  }

  @Put(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Update pricing rule' })
  @ApiResponse({ status: 200, description: 'Pricing rule updated' })
  @ApiResponse({ status: 404, description: 'Pricing rule not found' })
  update(@Param('id') id: string, @Body() updatePricingDto: any) {
    return this.pricingService.update(id, updatePricingDto);
  }

  @Delete(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Delete pricing rule' })
  @ApiResponse({ status: 200, description: 'Pricing rule deleted' })
  @ApiResponse({ status: 404, description: 'Pricing rule not found' })
  remove(@Param('id') id: string) {
    return this.pricingService.remove(id);
  }

  @Post('resolve')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Resolve product pricing' })
  @ApiResponse({ status: 200, description: 'Pricing resolved' })
  resolvePricing(@Body() resolvePricingDto: { productId: string; clientId?: string; supplierId?: string }) {
    return this.pricingResolutionService.resolvePrice(
      resolvePricingDto.productId,
      resolvePricingDto.clientId,
    );
  }

  @Get('product/:productId')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get pricing rules for product' })
  @ApiResponse({ status: 200, description: 'Product pricing rules' })
  findByProduct(@Param('productId') productId: string) {
    return this.pricingService.findByProduct(productId);
  }
}
