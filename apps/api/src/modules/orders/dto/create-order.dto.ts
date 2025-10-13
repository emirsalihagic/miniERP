import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  clientId?: string; // For EMPLOYEE users to specify which client's order to create
}
