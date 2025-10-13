import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ClientStatus } from './create-client.dto';

export class QueryClientDto {
  @ApiPropertyOptional({ description: 'Search over name,email,clientCode,taxNumber' }) 
  @IsOptional() 
  @IsString() 
  q?: string;

  @ApiPropertyOptional({ enum: ClientStatus }) 
  @IsOptional() 
  @IsEnum(ClientStatus) 
  status?: ClientStatus;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  city?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Comma-separated tags' }) 
  @IsOptional() 
  @IsString() 
  tags?: string;

  @ApiPropertyOptional({ default: 'name' }) 
  @IsOptional() 
  @IsString() 
  sort?: string;

  @ApiPropertyOptional({ default: 'asc' }) 
  @IsOptional() 
  @IsString() 
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ default: '1' }) 
  @IsOptional() 
  @IsNumberString() 
  page?: string;

  @ApiPropertyOptional({ default: '20' }) 
  @IsOptional() 
  @IsNumberString() 
  limit?: string;
}
