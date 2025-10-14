export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'LIGHT' | 'DARK' | 'AUTO';
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  currency: Currency;
  autoSaveForms: boolean;
  emailNotifications: boolean;
  language: Language;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export enum DateFormat {
  DD_MM_YYYY = 'DD_MM_YYYY',
  MM_DD_YYYY = 'MM_DD_YYYY',
  YYYY_MM_DD = 'YYYY_MM_DD',
  DD_MMM_YYYY = 'DD_MMM_YYYY',
  MMM_DD_YYYY = 'MMM_DD_YYYY'
}

export enum TimeFormat {
  HOUR_12 = 'HOUR_12',
  HOUR_24 = 'HOUR_24'
}

export enum Currency {
  BAM = 'BAM',
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CHF = 'CHF'
}

export enum Language {
  EN = 'EN',
  BS = 'BS',
  HR = 'HR',
  SR = 'SR'
}

export interface UpdateUserPreferencesRequest {
  theme?: 'LIGHT' | 'DARK' | 'AUTO';
  dateFormat?: DateFormat;
  timeFormat?: TimeFormat;
  currency?: Currency;
  autoSaveForms?: boolean;
  emailNotifications?: boolean;
  language?: Language;
  timezone?: string;
}

export interface UserPreferencesResponse {
  data: UserPreferences;
}

export const DEFAULT_USER_PREFERENCES: Partial<UserPreferences> = {
  theme: 'LIGHT' as 'LIGHT' | 'DARK' | 'AUTO',
  dateFormat: DateFormat.DD_MM_YYYY,
  timeFormat: TimeFormat.HOUR_24,
  currency: Currency.BAM,
  autoSaveForms: true,
  emailNotifications: false,
  language: Language.EN,
  timezone: 'Europe/Sarajevo'
};
