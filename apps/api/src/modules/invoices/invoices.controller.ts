import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddInvoiceItemDto } from './dto/add-invoice-item.dto';
import { UpdateInvoiceDiscountDto } from './dto/update-invoice-discount.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  findAll(@Query('clientId') clientId?: string) {
    return this.invoicesService.findAll(clientId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post(':id/items')
  @Roles(UserRole.EMPLOYEE)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Add item to invoice' })
  @ApiResponse({ status: 201, description: 'Item added successfully' })
  addItem(
    @Param('id') id: string,
    @Body() dto: AddInvoiceItemDto,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.addItem(id, dto, user.id);
  }

  @Patch(':id/discount')
  @Roles(UserRole.EMPLOYEE)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Update invoice discount' })
  @ApiResponse({ status: 200, description: 'Discount updated successfully' })
  updateDiscount(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDiscountDto,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.updateDiscount(id, dto.discountPercent || 0, user.id);
  }

  @Post(':id/issue')
  @Roles(UserRole.EMPLOYEE)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Issue invoice' })
  @ApiResponse({ status: 200, description: 'Invoice issued successfully' })
  issue(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.issue(id, user.id);
  }

  @Post(':id/paid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid successfully' })
  markAsPaid(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.markAsPaid(id, user.id);
  }
}

