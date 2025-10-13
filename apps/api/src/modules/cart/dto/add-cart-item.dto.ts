import { IsString, IsNotEmpty, IsNumber, IsPositive, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsPositive()
  @Min(0.001)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  clientId?: string; // For EMPLOYEE users to specify which client's cart to use
}
