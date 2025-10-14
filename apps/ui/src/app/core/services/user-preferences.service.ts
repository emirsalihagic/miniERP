import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  UserPreferences, 
  UpdateUserPreferencesRequest, 
  UserPreferencesResponse,
  DEFAULT_USER_PREFERENCES,
  DateFormat,
  TimeFormat,
  Currency,
  Language
} from '../../shared/interfaces/user-preferences.interface';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly apiUrl = `${environment.apiUrl}/user-preferences`;
  private preferencesSubject = new BehaviorSubject<UserPreferences | null>(null);
  public preferences$ = this.preferencesSubject.asObservable();
  
  // Debounced update mechanism
  private pendingUpdates = new Subject<UpdateUserPreferencesRequest>();
  private currentPreferences: UserPreferences | null = null;

  constructor(private http: HttpClient) {
    // Set up immediate updates with short debounce to prevent excessive calls
    this.pendingUpdates.pipe(
      debounceTime(300), // Short delay to prevent excessive API calls
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(updates => {
      this.updateUserPreferences(updates).subscribe();
    });
  }

  getUserPreferences(): Observable<UserPreferencesResponse> {
    console.log('UserPreferencesService: Getting user preferences from', this.apiUrl);
    return this.http.get<UserPreferencesResponse>(this.apiUrl).pipe(
      tap(response => {
        console.log('UserPreferencesService: Received preferences', response);
        this.currentPreferences = response.data;
        this.preferencesSubject.next(response.data);
      })
    );
  }

  updateUserPreferences(preferences: UpdateUserPreferencesRequest): Observable<UserPreferencesResponse> {
    console.log('UserPreferencesService: Updating user preferences', preferences);
    return this.http.patch<UserPreferencesResponse>(this.apiUrl, preferences).pipe(
      tap(response => {
        console.log('UserPreferencesService: Updated preferences', response);
        this.currentPreferences = response.data;
        this.preferencesSubject.next(response.data);
      })
    );
  }

  getCurrentPreferences(): UserPreferences | null {
    return this.currentPreferences;
  }

  // Theme management
  getTheme(): 'light' | 'dark' | 'auto' {
    const preferences = this.getCurrentPreferences();
    const backendTheme = preferences?.theme || DEFAULT_USER_PREFERENCES.theme || 'LIGHT';
    return this.convertThemeFromBackend(backendTheme);
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    const backendTheme = this.convertThemeToBackend(theme);
    this.pendingUpdates.next({ theme: backendTheme });
  }

  private convertThemeFromBackend(backendTheme: 'LIGHT' | 'DARK' | 'AUTO'): 'light' | 'dark' | 'auto' {
    return backendTheme.toLowerCase() as 'light' | 'dark' | 'auto';
  }

  private convertThemeToBackend(frontendTheme: 'light' | 'dark' | 'auto'): 'LIGHT' | 'DARK' | 'AUTO' {
    return frontendTheme.toUpperCase() as 'LIGHT' | 'DARK' | 'AUTO';
  }

  // Date/Time format management
  getDateFormat(): DateFormat {
    const preferences = this.getCurrentPreferences();
    return preferences?.dateFormat || DEFAULT_USER_PREFERENCES.dateFormat || DateFormat.DD_MM_YYYY;
  }

  getTimeFormat(): TimeFormat {
    const preferences = this.getCurrentPreferences();
    return preferences?.timeFormat || DEFAULT_USER_PREFERENCES.timeFormat || TimeFormat.HOUR_24;
  }

  setDateFormat(dateFormat: DateFormat): void {
    this.pendingUpdates.next({ dateFormat });
  }

  setTimeFormat(timeFormat: TimeFormat): void {
    this.pendingUpdates.next({ timeFormat });
  }

  // Currency management
  getCurrency(): Currency {
    const preferences = this.getCurrentPreferences();
    return preferences?.currency || DEFAULT_USER_PREFERENCES.currency || Currency.BAM;
  }

  setCurrency(currency: Currency): void {
    this.pendingUpdates.next({ currency });
  }

  // Language management
  getLanguage(): Language {
    const preferences = this.getCurrentPreferences();
    return preferences?.language || DEFAULT_USER_PREFERENCES.language || Language.EN;
  }

  setLanguage(language: Language): void {
    this.pendingUpdates.next({ language });
  }

  // Timezone management
  getTimezone(): string {
    const preferences = this.getCurrentPreferences();
    return preferences?.timezone || DEFAULT_USER_PREFERENCES.timezone || 'Europe/Sarajevo';
  }

  setTimezone(timezone: string): void {
    this.pendingUpdates.next({ timezone });
  }

  // Auto-save forms
  getAutoSaveForms(): boolean {
    const preferences = this.getCurrentPreferences();
    return preferences?.autoSaveForms ?? DEFAULT_USER_PREFERENCES.autoSaveForms ?? true;
  }

  setAutoSaveForms(autoSave: boolean): void {
    this.pendingUpdates.next({ autoSaveForms: autoSave });
  }

  // Email notifications
  getEmailNotifications(): boolean {
    const preferences = this.getCurrentPreferences();
    return preferences?.emailNotifications ?? DEFAULT_USER_PREFERENCES.emailNotifications ?? false;
  }

  setEmailNotifications(notifications: boolean): void {
    this.pendingUpdates.next({ emailNotifications: notifications });
  }

  // System theme detection
  getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Get effective theme (considering auto mode)
  getEffectiveTheme(): 'light' | 'dark' {
    const theme = this.getTheme();
    if (theme === 'auto') {
      return this.getSystemTheme();
    }
    return theme;
  }

  // Format date according to user preferences
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const format = this.getDateFormat();
    
    switch (format) {
      case DateFormat.DD_MM_YYYY:
        return dateObj.toLocaleDateString('en-GB');
      case DateFormat.MM_DD_YYYY:
        return dateObj.toLocaleDateString('en-US');
      case DateFormat.YYYY_MM_DD:
        return dateObj.toISOString().split('T')[0];
      case DateFormat.DD_MMM_YYYY:
        return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      case DateFormat.MMM_DD_YYYY:
        return dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      default:
        return dateObj.toLocaleDateString();
    }
  }

  // Format time according to user preferences
  formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const format = this.getTimeFormat();
    
    if (format === TimeFormat.HOUR_12) {
      return dateObj.toLocaleTimeString('en-US', { hour12: true });
    } else {
      return dateObj.toLocaleTimeString('en-US', { hour12: false });
    }
  }

  // Format currency according to user preferences
  formatCurrency(amount: number): string {
    const currency = this.getCurrency();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
