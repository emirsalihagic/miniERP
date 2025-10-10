import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingResolutionService } from './pricing-resolution.service';

@Module({
  providers: [PricingService, PricingResolutionService],
  exports: [PricingService, PricingResolutionService],
})
export class PricingModule {}

