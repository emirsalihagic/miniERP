import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export type NavigationCommands = any[];

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationHistory: string[] = [];
  private readonly maxHistorySize = 10;

  constructor(
    private location: Location,
    private router: Router
  ) {
    // Track navigation history
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.addToHistory(event.urlAfterRedirects);
      });
  }

  /**
   * Navigate back to previous page if available, otherwise to fallback
   * @param fallback - Fallback route if no history available
   */
  navigateBackOr(fallback: NavigationCommands = ['/dashboard']): void {
    if (this.canGoBack()) {
      this.location.back();
    } else {
      this.router.navigate(fallback);
    }
  }

  /**
   * Check if we can go back in history
   */
  canGoBack(): boolean {
    return this.navigationHistory.length > 1;
  }

  /**
   * Navigate with query parameters
   */
  navigateWithQueryParams(
    commands: NavigationCommands,
    queryParams: { [key: string]: any } = {}
  ): void {
    this.router.navigate(commands, { queryParams });
  }

  /**
   * Navigate with fragment (hash anchor)
   */
  navigateWithFragment(
    commands: NavigationCommands,
    fragment: string
  ): void {
    this.router.navigate(commands, { fragment });
  }

  /**
   * Navigate with both query params and fragment
   */
  navigateWithParamsAndFragment(
    commands: NavigationCommands,
    queryParams: { [key: string]: any } = {},
    fragment?: string
  ): void {
    this.router.navigate(commands, { queryParams, fragment });
  }

  /**
   * Get current URL without query params
   */
  getCurrentUrl(): string {
    return this.router.url.split('?')[0];
  }

  /**
   * Get current query params
   */
  getCurrentQueryParams(): { [key: string]: any } {
    return this.router.parseUrl(this.router.url).queryParams;
  }

  /**
   * Get current fragment
   */
  getCurrentFragment(): string | null {
    return this.router.parseUrl(this.router.url).fragment;
  }

  /**
   * Update query params without navigation
   */
  updateQueryParams(queryParams: { [key: string]: any }, replaceUrl = true): void {
    this.router.navigate([], {
      relativeTo: this.router.routerState.root,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl
    });
  }

  /**
   * Update fragment without navigation
   */
  updateFragment(fragment: string, replaceUrl = true): void {
    this.router.navigate([], {
      relativeTo: this.router.routerState.root,
      fragment,
      replaceUrl
    });
  }

  /**
   * Navigate to the appropriate list page based on current route
   * Used by form components for consistent navigation after save/cancel
   */
  navigateToListPage(): void {
    const currentUrl = this.getCurrentUrl();
    
    if (currentUrl.includes('/invoices')) {
      this.router.navigate(['/invoices']);
    } else if (currentUrl.includes('/users')) {
      this.router.navigate(['/users']);
    } else if (currentUrl.includes('/clients')) {
      this.router.navigate(['/clients']);
    } else if (currentUrl.includes('/products')) {
      this.router.navigate(['/products']);
    } else if (currentUrl.includes('/pricing')) {
      this.router.navigate(['/pricing']);
    } else if (currentUrl.includes('/suppliers')) {
      this.router.navigate(['/suppliers']);
    } else {
      // Default fallback to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Navigate to dashboard (main landing page after login)
   */
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  private addToHistory(url: string): void {
    // Don't add duplicate consecutive URLs
    if (this.navigationHistory[this.navigationHistory.length - 1] !== url) {
      this.navigationHistory.push(url);
      
      // Keep history size manageable
      if (this.navigationHistory.length > this.maxHistorySize) {
        this.navigationHistory.shift();
      }
    }
  }
}
