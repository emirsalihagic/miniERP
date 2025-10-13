import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingResolutionService } from './pricing-resolution.service';
import { PricingController } from './pricing.controller';

@Module({
  controllers: [PricingController],
  providers: [PricingService, PricingResolutionService],
  exports: [PricingService, PricingResolutionService],
})
export class PricingModule {}

