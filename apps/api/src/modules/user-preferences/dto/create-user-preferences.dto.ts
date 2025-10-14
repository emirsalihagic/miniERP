import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  AUTO = 'AUTO',
}

export enum DateFormat {
  DD_MM_YYYY = 'DD_MM_YYYY',
  MM_DD_YYYY = 'MM_DD_YYYY',
  YYYY_MM_DD = 'YYYY_MM_DD',
  DD_MMM_YYYY = 'DD_MMM_YYYY',
  MMM_DD_YYYY = 'MMM_DD_YYYY',
}

export enum TimeFormat {
  HOUR_12 = 'HOUR_12',
  HOUR_24 = 'HOUR_24',
}

export enum Currency {
  BAM = 'BAM',
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CHF = 'CHF',
}

export enum Language {
  EN = 'EN',
  BS = 'BS',
  HR = 'HR',
  SR = 'SR',
}

export class CreateUserPreferencesDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @IsOptional()
  @IsEnum(DateFormat)
  dateFormat?: DateFormat;

  @IsOptional()
  @IsEnum(TimeFormat)
  timeFormat?: TimeFormat;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsBoolean()
  autoSaveForms?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @IsOptional()
  @IsEnum(DateFormat)
  dateFormat?: DateFormat;

  @IsOptional()
  @IsEnum(TimeFormat)
  timeFormat?: TimeFormat;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsBoolean()
  autoSaveForms?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsString()
  timezone?: string;
}
