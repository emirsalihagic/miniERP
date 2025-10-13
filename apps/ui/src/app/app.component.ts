import { Component, OnInit } from '@angular/core';
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
import { filter } from 'rxjs/operators';

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
export class AppComponent implements OnInit {
  title = 'miniERP-ui';
  isCollapsed = false;
  currentUser: User | null = null;
  hideSidebar = false;
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

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateMenuPermissions();
    });

    // Subscribe to route changes to check if sidebar should be hidden and update menu states
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkHideSidebar(event.url);
        this.updateMenuStates(event.url);
      });

    // Check initial route
    this.checkHideSidebar(this.router.url);
    this.updateMenuStates(this.router.url);
    this.updateMenuPermissions();
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
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
