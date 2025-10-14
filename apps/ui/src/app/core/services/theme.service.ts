import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserPreferencesService } from './user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor(private userPreferencesService: UserPreferencesService) {
    // Initialize theme state
    this.initializeTheme();
    
    // Subscribe to user preferences changes to apply theme
    this.userPreferencesService.preferences$.subscribe(preferences => {
      if (preferences) {
        const effectiveTheme = this.userPreferencesService.getEffectiveTheme();
        this.setDarkMode(effectiveTheme === 'dark');
      }
    });
  }

  private initializeTheme(): void {
    // Fallback to localStorage and system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let isDark = false;
    if (savedTheme) {
      isDark = savedTheme === 'dark';
    } else if (prefersDark) {
      isDark = true;
    }
    
    this.setDarkMode(isDark);
  }

  toggleDarkMode(): void {
    const currentMode = this.isDarkModeSubject.value;
    const newTheme = currentMode ? 'light' : 'dark';
    this.userPreferencesService.setTheme(newTheme);
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    const effectiveTheme = theme === 'auto' ? this.userPreferencesService.getSystemTheme() : theme;
    this.setDarkMode(effectiveTheme === 'dark');
  }

  setDarkMode(isDark: boolean): void {
    const el = document.documentElement;
    el.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.isDarkModeSubject.next(isDark);
  }

  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  getCurrentTheme(): 'light' | 'dark' | 'auto' {
    return this.userPreferencesService.getTheme();
  }
}
