import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, QueryClientDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UseGuards } from '@nestjs/common';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create new client' })
  @ApiResponse({ status: 201, description: 'Client created' })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER)
  @ApiOperation({ summary: 'Get all clients with filtering and pagination' })
  @ApiOkResponse({ description: 'Paginated list of clients' })
  findAll(@Query() query: QueryClientDto) {
    return this.clientsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER)
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Client found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200, description: 'Client updated' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Delete client' })
  @ApiResponse({ status: 200, description: 'Client deleted' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  @Get(':id/invoices')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER)
  @ApiOperation({ summary: 'Get client invoices' })
  @ApiResponse({ status: 200, description: 'Client invoices' })
  getInvoices(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.clientsService.getInvoices(id, { page, limit });
  }

  @Get(':id/summary')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER)
  @ApiOperation({ summary: 'Get client summary with invoice statistics' })
  @ApiResponse({ status: 200, description: 'Client summary' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  summary(@Param('id') id: string) {
    return this.clientsService.summary(id);
  }
}
