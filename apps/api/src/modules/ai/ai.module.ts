import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { ProductsModule } from '../products/products.module';
import { ClientsModule } from '../clients/clients.module';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiProviderService } from './ai-provider.service';
import { ToolsExecutor } from './tools/tools.executor';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    ClientsModule,
    CartModule,
    OrdersModule,
    UserPreferencesModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AiProviderService,
    ToolsExecutor,
  ],
  exports: [AiService],
})
export class AiModule {}
