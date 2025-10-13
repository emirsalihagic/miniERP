import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Test')
@Controller('test')
export class TestController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db')
  @ApiOperation({ summary: 'Test database connection' })
  async testDatabase() {
    try {
      console.log('Test endpoint called');
      // Test basic Prisma connection without any complex queries
      const result = await this.prisma.$queryRaw`SELECT 1 as test`;
      console.log('Query result:', result);
      return { message: 'Database connection OK', result };
    } catch (error) {
      console.error('Test endpoint error:', error);
      return { message: 'Database connection failed', error: error.message };
    }
  }

  @Get('simple')
  @ApiOperation({ summary: 'Simple test' })
  async simpleTest() {
    return { message: 'Simple test OK', timestamp: new Date().toISOString() };
  }
}
