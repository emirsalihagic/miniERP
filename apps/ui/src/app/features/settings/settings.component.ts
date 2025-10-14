import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';
import { 
  UserPreferencesService
} from '../../core/services/user-preferences.service';
import { 
  UserPreferences,
  DateFormat,
  TimeFormat,
  Currency,
  Language
} from '../../shared/interfaces/user-preferences.interface';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzSwitchModule,
    NzSelectModule,
    NzIconModule,
    NzDividerModule,
    NzTypographyModule,
    NzSpaceModule,
    NzButtonModule,
    NzMessageModule,
    NzSpinModule
  ],
  template: `
    <div class="settings-container">
      <nz-card nzTitle="User Preferences" class="settings-card">
        <div class="settings-content">
          <nz-spin [nzSpinning]="loading">
            <nz-space nzDirection="vertical" nzSize="large" style="width: 100%;">
              
              <!-- Theme Settings -->
              <div class="setting-section">
                <h3 class="section-title">
                  <span nz-icon nzType="setting"></span>
                  Appearance
                </h3>
                <nz-divider></nz-divider>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">Theme</div>
                    <div class="setting-description">
                      Choose your preferred theme. Auto will follow your system settings.
                    </div>
                  </div>
                  <nz-select
                    [ngModel]="currentTheme"
                    (ngModelChange)="onThemeChange($event)"
                    style="width: 120px;"
                    nzPlaceHolder="Select theme"
                  >
                    <nz-option nzValue="light" nzLabel="Light">
                      <span nz-icon nzType="sun"></span> Light
                    </nz-option>
                    <nz-option nzValue="dark" nzLabel="Dark">
                      <span nz-icon nzType="moon"></span> Dark
                    </nz-option>
                    <nz-option nzValue="auto" nzLabel="Auto">
                      <span nz-icon nzType="sync"></span> Auto
                    </nz-option>
                  </nz-select>
                </div>
              </div>

              <!-- Date & Time Settings -->
              <div class="setting-section">
                <h3 class="section-title">
                  <span nz-icon nzType="calendar"></span>
                  Date & Time
                </h3>
                <nz-divider></nz-divider>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">Date Format</div>
                    <div class="setting-description">
                      How dates should be displayed throughout the application
                    </div>
                  </div>
                  <nz-select
                    [ngModel]="currentDateFormat"
                    (ngModelChange)="onDateFormatChange($event)"
                    style="width: 150px;"
                    nzPlaceHolder="Select format"
                  >
                    <nz-option *ngFor="let format of dateFormats" [nzValue]="format.value" [nzLabel]="format.label">
                      {{ format.label }}
                    </nz-option>
                  </nz-select>
                </div>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">Time Format</div>
                    <div class="setting-description">
                      Choose between 12-hour or 24-hour time format
                    </div>
                  </div>
                  <nz-select
                    [ngModel]="currentTimeFormat"
                    (ngModelChange)="onTimeFormatChange($event)"
                    style="width: 120px;"
                    nzPlaceHolder="Select format"
                  >
                    <nz-option nzValue="HOUR_12" nzLabel="12-hour (AM/PM)">12-hour (AM/PM)</nz-option>
                    <nz-option nzValue="HOUR_24" nzLabel="24-hour">24-hour</nz-option>
                  </nz-select>
                </div>
              </div>

              <!-- Currency Settings -->
              <div class="setting-section">
                <h3 class="section-title">
                  <span nz-icon nzType="dollar-circle"></span>
                  Currency & Localization
                </h3>
                <nz-divider></nz-divider>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">Display Currency</div>
                    <div class="setting-description">
                      Currency used for displaying prices in shop, orders, and invoices
                    </div>
                  </div>
                  <nz-select
                    [ngModel]="currentCurrency"
                    (ngModelChange)="onCurrencyChange($event)"
                    style="width: 100px;"
                    nzPlaceHolder="Select currency"
                  >
                    <nz-option *ngFor="let currency of currencies" [nzValue]="currency.value" [nzLabel]="currency.label">
                      {{ currency.label }}
                    </nz-option>
                  </nz-select>
                </div>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">Language</div>
                    <div class="setting-description">
                      Interface language (coming soon)
                    </div>
                  </div>
                  <nz-select
                    [ngModel]="currentLanguage"
                    (ngModelChange)="onLanguageChange($event)"
                    style="width: 120px;"
                    nzPlaceHolder="Select language"
                    nzDisabled="true"
                  >
                    <nz-option nzValue="EN" nzLabel="English">English</nz-option>
                    <nz-option nzValue="BS" nzLabel="Bosanski">Bosanski</nz-option>
                    <nz-option nzValue="HR" nzLabel="Hrvatski">Hrvatski</nz-option>
                    <nz-option nzValue="SR" nzLabel="Српски">Српски</nz-option>
                  </nz-select>
                </div>
              </div>

              <!-- User Preferences -->
              <div class="setting-section">
                <h3 class="section-title">
                  <span nz-icon nzType="user"></span>
                  Preferences
                </h3>
                <nz-divider></nz-divider>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">Auto-save Forms</div>
                    <div class="setting-description">
                      Automatically save form data as you type to prevent data loss
                    </div>
                  </div>
                  <nz-switch 
                    [ngModel]="autoSaveForms" 
                    (ngModelChange)="onAutoSaveFormsChange($event)"
                  ></nz-switch>
                </div>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-label">Email Notifications</div>
                    <div class="setting-description">
                      Receive email notifications for important updates and events
                    </div>
                  </div>
                  <nz-switch 
                    [ngModel]="emailNotifications" 
                    (ngModelChange)="onEmailNotificationsChange($event)"
                  ></nz-switch>
                </div>
              </div>

              <!-- System Information -->
              <div class="setting-section">
                <h3 class="section-title">
                  <span nz-icon nzType="info-circle"></span>
                  System Information
                </h3>
                <nz-divider></nz-divider>
                
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Application Version</div>
                    <div class="info-value">1.0.0</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Last Updated</div>
                    <div class="info-value">{{ lastUpdated | date:'medium' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Current Theme</div>
                    <div class="info-value">{{ getEffectiveTheme() }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Timezone</div>
                    <div class="info-value">{{ currentTimezone }}</div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="setting-section">
                <div class="actions">
                  <button nz-button (click)="resetToDefaults()" [nzLoading]="resetting">
                    <span nz-icon nzType="reload"></span>
                    Reset to Defaults
                  </button>
                </div>
              </div>

            </nz-space>
          </nz-spin>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 900px;
      margin: 0 auto;
      padding: var(--spacing-lg);
    }

    .settings-card {
      border-radius: var(--radius-base);
      box-shadow: var(--shadow-card);
    }

    .settings-content {
      padding: var(--spacing-md);
    }

    .setting-section {
      margin-bottom: var(--spacing-xl);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin: 0 0 var(--spacing-xs) 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-base);
      
      span {
        color: var(--color-primary);
      }
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
    }

    .setting-info {
      flex: 1;
      margin-right: var(--spacing-md);
    }

    .setting-label {
      font-weight: 500;
      color: var(--color-text-base);
      margin-bottom: var(--spacing-xs);
    }

    .setting-description {
      font-size: 14px;
      color: var(--color-text-base);
      opacity: 0.7;
      line-height: 1.4;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    .info-item {
      padding: var(--spacing-sm);
      background: var(--color-bg-base);
      border-radius: var(--radius-base);
      border: 1px solid var(--color-border);
    }

    .info-label {
      font-size: 12px;
      color: var(--color-text-base);
      opacity: 0.6;
      margin-bottom: var(--spacing-xs);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-weight: 500;
      color: var(--color-text-base);
    }

    .actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      padding: var(--spacing-lg) 0;
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: var(--spacing-sm);
      }
      
      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }
      
      .setting-info {
        margin-right: 0;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Current settings
  currentTheme: 'light' | 'dark' | 'auto' = 'light';
  currentDateFormat: DateFormat = DateFormat.DD_MM_YYYY;
  currentTimeFormat: TimeFormat = TimeFormat.HOUR_24;
  currentCurrency: Currency = Currency.BAM;
  currentLanguage: Language = Language.EN;
  currentTimezone: string = 'Europe/Sarajevo';
  autoSaveForms: boolean = true;
  emailNotifications: boolean = false;
  
  // Loading states
  loading: boolean = true;
  resetting: boolean = false;
  
  // Last updated
  lastUpdated = new Date();
  
  // Options
  dateFormats = [
    { value: DateFormat.DD_MM_YYYY, label: 'DD/MM/YYYY' },
    { value: DateFormat.MM_DD_YYYY, label: 'MM/DD/YYYY' },
    { value: DateFormat.YYYY_MM_DD, label: 'YYYY-MM-DD' },
    { value: DateFormat.DD_MMM_YYYY, label: 'DD MMM YYYY' },
    { value: DateFormat.MMM_DD_YYYY, label: 'MMM DD, YYYY' }
  ];
  
  currencies = [
    { value: Currency.BAM, label: 'BAM' },
    { value: Currency.EUR, label: 'EUR' },
    { value: Currency.USD, label: 'USD' },
    { value: Currency.GBP, label: 'GBP' },
    { value: Currency.CHF, label: 'CHF' }
  ];

  constructor(
    private userPreferencesService: UserPreferencesService,
    private themeService: ThemeService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadUserPreferences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserPreferences(): void {
    console.log('SettingsComponent: Loading user preferences...');
    this.loading = true;
    
    this.userPreferencesService.getUserPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('SettingsComponent: Received preferences response', response);
          const preferences = response.data;
          this.currentTheme = preferences.theme.toLowerCase() as 'light' | 'dark' | 'auto';
          this.currentDateFormat = preferences.dateFormat;
          this.currentTimeFormat = preferences.timeFormat;
          this.currentCurrency = preferences.currency;
          this.currentLanguage = preferences.language;
          this.currentTimezone = preferences.timezone;
          this.autoSaveForms = preferences.autoSaveForms;
          this.emailNotifications = preferences.emailNotifications;
          this.loading = false;
          console.log('SettingsComponent: Settings loaded successfully');
          console.log('SettingsComponent: Current theme:', this.currentTheme);
          console.log('SettingsComponent: Current dateFormat:', this.currentDateFormat);
          console.log('SettingsComponent: Current timeFormat:', this.currentTimeFormat);
          console.log('SettingsComponent: Current currency:', this.currentCurrency);
        },
        error: (error) => {
          console.error('SettingsComponent: Error loading user preferences:', error);
          // Use default values if API fails
          this.currentTheme = 'light';
          this.currentDateFormat = DateFormat.DD_MM_YYYY;
          this.currentTimeFormat = TimeFormat.HOUR_24;
          this.currentCurrency = Currency.BAM;
          this.currentLanguage = Language.EN;
          this.currentTimezone = 'Europe/Sarajevo';
          this.autoSaveForms = true;
          this.emailNotifications = false;
          this.loading = false;
          this.message.warning('Settings loaded with default values. API connection failed.');
        }
      });
  }

  onThemeChange(theme: 'light' | 'dark' | 'auto'): void {
    this.currentTheme = theme;
    this.userPreferencesService.setTheme(theme);
  }

  onDateFormatChange(dateFormat: DateFormat): void {
    this.currentDateFormat = dateFormat;
    this.userPreferencesService.setDateFormat(dateFormat);
  }

  onTimeFormatChange(timeFormat: TimeFormat): void {
    this.currentTimeFormat = timeFormat;
    this.userPreferencesService.setTimeFormat(timeFormat);
  }

  onCurrencyChange(currency: Currency): void {
    this.currentCurrency = currency;
    this.userPreferencesService.setCurrency(currency);
  }

  onLanguageChange(language: Language): void {
    this.currentLanguage = language;
    this.userPreferencesService.setLanguage(language);
  }

  onAutoSaveFormsChange(autoSave: boolean): void {
    this.autoSaveForms = autoSave;
    this.userPreferencesService.setAutoSaveForms(autoSave);
  }

  onEmailNotificationsChange(notifications: boolean): void {
    this.emailNotifications = notifications;
    this.userPreferencesService.setEmailNotifications(notifications);
  }

  resetToDefaults(): void {
    this.resetting = true;
    
    // Reset to default values
    this.currentTheme = 'light';
    this.currentDateFormat = DateFormat.DD_MM_YYYY;
    this.currentTimeFormat = TimeFormat.HOUR_24;
    this.currentCurrency = Currency.BAM;
    this.currentLanguage = Language.EN;
    this.currentTimezone = 'Europe/Sarajevo';
    this.autoSaveForms = true;
    this.emailNotifications = false;

    // Apply all changes immediately (they will sync automatically)
    this.userPreferencesService.setTheme('light');
    this.userPreferencesService.setDateFormat(DateFormat.DD_MM_YYYY);
    this.userPreferencesService.setTimeFormat(TimeFormat.HOUR_24);
    this.userPreferencesService.setCurrency(Currency.EUR);
    this.userPreferencesService.setLanguage(Language.EN);
    this.userPreferencesService.setTimezone('Europe/Sarajevo');
    this.userPreferencesService.setAutoSaveForms(true);
    this.userPreferencesService.setEmailNotifications(false);
    
    this.resetting = false;
    this.message.success('Settings reset to defaults');
  }

  getEffectiveTheme(): string {
    return this.userPreferencesService.getEffectiveTheme();
  }
}