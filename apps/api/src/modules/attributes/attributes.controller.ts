import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import type { CreateAttributeDto, CreateAttributeOptionDto } from './attributes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Attributes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create new attribute' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Color' },
        type: { 
          type: 'string', 
          enum: ['TEXT', 'NUMBER', 'DECIMAL', 'BOOLEAN', 'DATE', 'LIST'],
          example: 'LIST' 
        },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              option: { type: 'string', example: 'Red' },
              sortOrder: { type: 'number', example: 1 }
            },
            required: ['option']
          },
          description: 'Options for LIST type attributes'
        },
      },
      required: ['name', 'type'],
    },
  })
  @ApiResponse({ status: 201, description: 'Attribute created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get all attributes' })
  @ApiResponse({ status: 200, description: 'List of attributes' })
  findAll() {
    return this.attributesService.findAll();
  }

  @Get('test')
  @ApiOperation({ summary: 'Test database connection' })
  async test() {
    try {
      console.log('Test endpoint called');
      // Test basic Prisma connection
      const count = await this.attributesService['prisma'].attribute.count();
      console.log('Count result:', count);
      return { message: 'Database connection OK', count };
    } catch (error) {
      console.error('Test endpoint error:', error);
      return { message: 'Database connection failed', error: error.message };
    }
  }

  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.CLIENT_USER, UserRole.SUPPLIER_USER)
  @ApiOperation({ summary: 'Get attribute by ID' })
  @ApiResponse({ status: 200, description: 'Attribute found' })
  @ApiResponse({ status: 404, description: 'Attribute not found' })
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update attribute' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Color' },
        type: { 
          type: 'string', 
          enum: ['TEXT', 'NUMBER', 'DECIMAL', 'BOOLEAN', 'DATE', 'LIST'],
          example: 'TEXT' 
        },
      },
      required: ['name', 'type'],
    },
  })
  @ApiResponse({ status: 200, description: 'Attribute updated' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Attribute not found' })
  update(@Param('id') id: string, @Body() updateAttributeDto: CreateAttributeDto) {
    return this.attributesService.update(id, updateAttributeDto);
  }

  @Delete(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Delete attribute' })
  @ApiResponse({ status: 200, description: 'Attribute deleted' })
  @ApiResponse({ status: 404, description: 'Attribute not found' })
  remove(@Param('id') id: string) {
    return this.attributesService.remove(id);
  }

  @Post(':id/options')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Add options to ENUM attribute' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', example: 'black' },
          label: { type: 'string', example: 'Black' },
          sortOrder: { type: 'number', example: 1 },
        },
        required: ['value', 'label'],
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Options added' })
  @ApiResponse({ status: 400, description: 'Invalid options or duplicates' })
  @ApiResponse({ status: 404, description: 'Attribute not found' })
  addOptions(
    @Param('id') id: string,
    @Body() options: CreateAttributeOptionDto[],
  ) {
    return this.attributesService.addOptions(id, options);
  }
}
