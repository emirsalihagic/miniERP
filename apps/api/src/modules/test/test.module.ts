import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestEnvController } from './test-env.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TestController, TestEnvController],
})
export class TestModule {}
