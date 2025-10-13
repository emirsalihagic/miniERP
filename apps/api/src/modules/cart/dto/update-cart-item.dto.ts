import { IsNumber, IsPositive, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @IsNumber()
  @IsPositive()
  @Min(0.001)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  clientId?: string; // For EMPLOYEE users to specify which client's cart to use
}
