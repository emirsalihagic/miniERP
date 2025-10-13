import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    let clientId = req.user.clientId;
    
    // For EMPLOYEE users, allow specifying clientId in request body
    if (!clientId && req.user.role === 'EMPLOYEE' && createOrderDto.clientId) {
      clientId = createOrderDto.clientId;
    }
    
    if (!clientId) {
      throw new Error('Client ID not found in user context');
    }
    return this.ordersService.createFromCart(clientId, createOrderDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req, @Query() query: any) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.ordersService.findAll(query, userId, userRole);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.ordersService.findOne(id, userId, userRole);
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.ordersService.updateStatus(id, updateOrderStatusDto, userId, userRole);
  }

  @Post(':id/cancel')
  async cancelOrder(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.ordersService.cancelOrder(id, userId, userRole);
  }
}
