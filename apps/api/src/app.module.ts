import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ProductsModule } from './modules/products/products.module';
import { UnitsModule } from './modules/units/units.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ProductGroupsModule } from './modules/product-groups/product-groups.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { TestModule } from './modules/test/test.module';
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
    UnitsModule,
    AttributesModule,
    ProductGroupsModule,
    PricingModule,
    InvoicesModule,
    CartModule,
    OrdersModule,
    DashboardModule,
    HealthModule,
    TestModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
