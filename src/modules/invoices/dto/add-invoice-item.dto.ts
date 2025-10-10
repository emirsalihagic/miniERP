import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';

export class AddInvoiceItemDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  quantity: number;
}

