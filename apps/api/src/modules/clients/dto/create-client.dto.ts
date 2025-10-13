import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Matches, MaxLength, Min } from 'class-validator';

export enum ClientType { 
  INDIVIDUAL = 'INDIVIDUAL', 
  COMPANY = 'COMPANY' 
}

export enum ClientStatus { 
  ACTIVE = 'ACTIVE', 
  INACTIVE = 'INACTIVE', 
  PROSPECT = 'PROSPECT' 
}

export enum PaymentTerms { 
  ON_RECEIPT = 'ON_RECEIPT', 
  D7 = 'D7', 
  D15 = 'D15', 
  D30 = 'D30', 
  D45 = 'D45', 
  D60 = 'D60' 
}

export enum Currency { 
  BAM = 'BAM', 
  EUR = 'EUR', 
  USD = 'USD' 
}

export class CreateClientDto {
  @ApiProperty() 
  @IsString() 
  @MaxLength(190) 
  name!: string;

  @ApiProperty({ enum: ClientType, default: ClientType.COMPANY }) 
  @IsEnum(ClientType) 
  type: ClientType = ClientType.COMPANY;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  @MaxLength(120) 
  contactPerson?: string;

  @ApiProperty() 
  @IsEmail() 
  @MaxLength(190) 
  email!: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  @MaxLength(40) 
  phone?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsUrl() 
  website?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  @MaxLength(64) 
  taxNumber?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  billingStreet?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  @MaxLength(120) 
  billingCity?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  @MaxLength(20)  
  billingZip?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  @MaxLength(120) 
  billingCountry?: string;

  @ApiProperty({ enum: PaymentTerms, default: PaymentTerms.D30 }) 
  @IsEnum(PaymentTerms) 
  paymentTerms: PaymentTerms = PaymentTerms.D30;

  @ApiProperty({ enum: Currency, default: Currency.BAM }) 
  @IsEnum(Currency) 
  preferredCurrency: Currency = Currency.BAM;

  @ApiPropertyOptional({ default: 0 }) 
  @IsOptional() 
  @IsNumber() 
  @Min(0) 
  creditLimit?: number;

  @ApiProperty({ enum: ClientStatus, default: ClientStatus.ACTIVE }) 
  @IsEnum(ClientStatus) 
  status: ClientStatus = ClientStatus.ACTIVE;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  @MaxLength(80) 
  leadSource?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsDateString() 
  lastContactedAt?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsDateString() 
  nextFollowupAt?: string;

  @ApiPropertyOptional({ type: [String] }) 
  @IsOptional() 
  @IsArray() 
  tags?: string[];

  @ApiPropertyOptional({ description: 'Uppercase letters/numbers/-_., 3-40 chars' })
  @IsOptional() 
  @IsString() 
  @Matches(/^[A-Z0-9\-_.]{3,40}$/) 
  clientCode?: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  assignedToId?: string; // If User.id is Int, use number

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  notes?: string;
}
