import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get all units' })
  @ApiResponse({ status: 200, description: 'List of units' })
  listUnits() {
    return this.unitsService.listUnits();
  }

  @Get('convert')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Convert quantity between units' })
  @ApiQuery({ name: 'from', description: 'Source unit code', example: 'kg' })
  @ApiQuery({ name: 'to', description: 'Target unit code', example: 't' })
  @ApiQuery({ name: 'qty', description: 'Quantity to convert', example: 500 })
  @ApiResponse({ 
    status: 200, 
    description: 'Converted quantity',
    schema: {
      type: 'object',
      properties: {
        from: { type: 'string', example: 'kg' },
        to: { type: 'string', example: 't' },
        qty: { type: 'number', example: 500 },
        result: { type: 'number', example: 0.5 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid conversion (different unit groups)' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async convert(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('qty') qty: number,
  ) {
    const result = await this.unitsService.convert(qty, from, to);
    return {
      from,
      to,
      qty,
      result,
    };
  }
}
