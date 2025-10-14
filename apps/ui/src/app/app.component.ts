import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { AuthService, User } from './core/services/auth.service';
import { PermissionService, MenuPermission } from './core/services/permission.service';
import { ThemeService } from './core/services/theme.service';
import { UserPreferencesService } from './core/services/user-preferences.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzAvatarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  title = 'miniERP-ui';
  isCollapsed = false;
  currentUser: User | null = null;
  hideSidebar = false;
  isDarkMode = false;
  currentTheme: 'light' | 'dark' | 'auto' = 'light';
  menuPermissions: MenuPermission = {
    invoices: false,
    products: false,
    clients: false,
    suppliers: false,
    users: false,
    pricing: false,
    shop: false,
    orders: false
  };

  // Submenu open states
  isInvoicesMenuOpen = false;
  isProductsMenuOpen = false;
  isClientsMenuOpen = false;
  isSuppliersMenuOpen = false;
  isUsersMenuOpen = false;
  isPricingMenuOpen = false;
  isShopMenuOpen = false;
  isOrdersMenuOpen = false;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private themeService: ThemeService,
    private userPreferencesService: UserPreferencesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Load user preferences first
    this.loadUserPreferences();

    // Subscribe to user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.updateMenuPermissions();
        if (user) {
          this.loadUserPreferences();
        }
      });

    // Subscribe to theme changes
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });

    // Subscribe to user preferences changes
    this.userPreferencesService.preferences$
      .pipe(takeUntil(this.destroy$))
      .subscribe(preferences => {
        if (preferences) {
          this.currentTheme = this.userPreferencesService.getTheme();
          // Apply theme immediately
          this.themeService.setTheme(this.userPreferencesService.getTheme());
        }
      });

    // Subscribe to route changes to check if sidebar should be hidden and update menu states
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.checkHideSidebar(event.url);
        this.updateMenuStates(event.url);
      });

    // Check initial route
    this.checkHideSidebar(this.router.url);
    this.updateMenuStates(this.router.url);
    this.updateMenuPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserPreferences(): void {
    if (this.currentUser) {
      this.userPreferencesService.getUserPreferences().subscribe({
        next: (response) => {
          // Preferences are automatically applied via the preferences$ subscription
        },
        error: (error) => {
          console.error('Error loading user preferences:', error);
          // Use default theme if preferences fail to load
          this.currentTheme = 'light';
          this.themeService.setTheme('light');
        }
      });
    }
  }

  private updateMenuPermissions(): void {
    if (this.currentUser?.role) {
      this.menuPermissions = this.permissionService.getMenuPermissions(this.currentUser.role);
    }
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/invoices')) return 'Invoices';
    if (url.includes('/products')) return 'Products';
    if (url.includes('/clients')) return 'Clients';
    if (url.includes('/suppliers')) return 'Suppliers';
    if (url.includes('/users')) return 'Users';
    if (url.includes('/pricing')) return 'Pricing';
    if (url.includes('/shop')) return 'Shop';
    if (url.includes('/orders')) return 'Orders';
    if (url.includes('/settings')) return 'User Preferences';
    return 'miniERP';
  }

  private checkHideSidebar(url: string): void {
    // Hide sidebar on auth routes
    this.hideSidebar = url.startsWith('/auth');
  }

  private updateMenuStates(url: string): void {
    // Reset all menu states
    this.isInvoicesMenuOpen = false;
    this.isProductsMenuOpen = false;
    this.isClientsMenuOpen = false;
    this.isSuppliersMenuOpen = false;
    this.isUsersMenuOpen = false;
    this.isPricingMenuOpen = false;
    this.isShopMenuOpen = false;
    this.isOrdersMenuOpen = false;

    // Open the appropriate submenu based on current route
    if (url.startsWith('/invoices')) {
      this.isInvoicesMenuOpen = true;
    } else if (url.startsWith('/products')) {
      this.isProductsMenuOpen = true;
    } else if (url.startsWith('/clients')) {
      this.isClientsMenuOpen = true;
    } else if (url.startsWith('/suppliers')) {
      this.isSuppliersMenuOpen = true;
    } else if (url.startsWith('/users')) {
      this.isUsersMenuOpen = true;
    } else if (url.startsWith('/pricing')) {
      this.isPricingMenuOpen = true;
    } else if (url.startsWith('/shop')) {
      this.isShopMenuOpen = true;
    } else if (url.startsWith('/orders')) {
      this.isOrdersMenuOpen = true;
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) {
      return 'U';
    }
    
    const nameParts = this.currentUser.name.trim().split(' ');
    if (nameParts.length >= 2) {
      // First letter of first name + first letter of last name
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    } else if (nameParts.length === 1) {
      // If only one name, use first two letters
      const name = nameParts[0];
      return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name.charAt(0).toUpperCase();
    }
    
    return 'U';
  }

  // Permission getter for creating invoices (EMPLOYEE only)
  get canCreateInvoice(): boolean {
    return this.currentUser?.role === 'EMPLOYEE';
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // Method to handle dropdown positioning
  onDropdownVisibleChange(visible: boolean): void {
    if (visible) {
      // Force correct positioning when dropdown becomes visible
      setTimeout(() => {
        const dropdown = document.querySelector('.ant-dropdown');
        const avatar = document.querySelector('.user-avatar');
        
        if (dropdown && avatar) {
          const avatarRect = avatar.getBoundingClientRect();
          const dropdownElement = dropdown as HTMLElement;
          
          // Position dropdown below and to the right of avatar
          dropdownElement.style.position = 'fixed';
          dropdownElement.style.top = `${avatarRect.bottom + 4}px`;
          dropdownElement.style.left = `${avatarRect.right - 160}px`; // 160px is approximate menu width
          dropdownElement.style.zIndex = '1050';
        }
      }, 0);
    }
  }
}
