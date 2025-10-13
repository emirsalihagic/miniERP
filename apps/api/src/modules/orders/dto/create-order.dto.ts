import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
