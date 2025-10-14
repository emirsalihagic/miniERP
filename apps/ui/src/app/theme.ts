import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';

export const lightTheme: NzConfig = {
  theme: {
    primaryColor: 'var(--color-primary)',
    infoColor: 'var(--color-primary)',
    successColor: 'var(--color-success)',
    warningColor: 'var(--color-warning)',
    errorColor: 'var(--color-error)'
  }
};

export const darkTheme: NzConfig = {
  theme: {
    primaryColor: 'var(--color-primary)',
    infoColor: 'var(--color-primary)',
    successColor: 'var(--color-success)',
    warningColor: 'var(--color-warning)',
    errorColor: 'var(--color-error)'
  }
};

export function resolveNzTheme(): NzConfig {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark') || document.body.classList.contains('dark');
  return isDark ? darkTheme : lightTheme;
}

export const THEME_PROVIDER = { 
  provide: NZ_CONFIG, 
  useFactory: () => resolveNzTheme() 
};

// Theme toggle functionality
export function toggleDarkMode(on?: boolean): void {
  const el = document.documentElement;
  const isDark = el.classList.contains('dark');
  const next = typeof on === 'boolean' ? on : !isDark;
  el.classList.toggle('dark', next);
  
  // Store preference in localStorage
  localStorage.setItem('theme', next ? 'dark' : 'light');
}

export function initializeTheme(): () => Promise<void> {
  return () => {
    return new Promise<void>((resolve) => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme) {
        toggleDarkMode(savedTheme === 'dark');
      } else if (prefersDark) {
        toggleDarkMode(true);
      }
      
      resolve();
    });
  };
}
