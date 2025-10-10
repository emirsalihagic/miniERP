import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ProductsModule } from './modules/products/products.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { HealthModule } from './modules/health/health.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { validationSchema } from './config/validation.schema';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [jwtConfig, redisConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    SuppliersModule,
    ProductsModule,
    PricingModule,
    InvoicesModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
