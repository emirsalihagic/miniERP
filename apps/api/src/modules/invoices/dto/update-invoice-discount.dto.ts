import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateInvoiceDiscountDto {
  @ApiPropertyOptional({ description: 'Invoice-level discount percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;
}
