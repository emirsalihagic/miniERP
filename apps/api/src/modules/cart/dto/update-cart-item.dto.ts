import { IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @IsNumber()
  @IsPositive()
  @Min(0.001)
  @Type(() => Number)
  quantity: number;
}
