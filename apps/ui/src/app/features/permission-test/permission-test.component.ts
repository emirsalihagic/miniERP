import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService, User } from '../../core/services/auth.service';
import { PermissionService, MenuPermission } from '../../core/services/permission.service';

@Component({
  selector: 'app-permission-test',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule
  ],
  template: `
    <div class="permission-test-container">
      <nz-card nzTitle="Role-Based Menu Permissions Test">
        <div class="user-info">
          <h3>Current User</h3>
          <p><strong>Name:</strong> {{ currentUser?.name || 'Not logged in' }}</p>
          <p><strong>Email:</strong> {{ currentUser?.email || 'N/A' }}</p>
          <p><strong>Role:</strong> 
            <nz-tag [nzColor]="getRoleColor(currentUser?.role)">
              {{ currentUser?.role || 'N/A' }}
            </nz-tag>
          </p>
        </div>

        <div class="permissions-info">
          <h3>Menu Permissions</h3>
          <div class="permission-grid">
            <div class="permission-item" *ngFor="let permission of permissionKeys">
              <nz-tag [nzColor]="menuPermissions[permission] ? 'green' : 'red'">
                {{ permission | titlecase }}
              </nz-tag>
              <span class="permission-status">
                {{ menuPermissions[permission] ? 'Allowed' : 'Denied' }}
              </span>
            </div>
          </div>
        </div>

        <div class="available-routes">
          <h3>Available Routes</h3>
          <div class="route-list">
            <nz-tag *ngFor="let route of availableRoutes" nzColor="blue">
              {{ route }}
            </nz-tag>
          </div>
        </div>

        <div class="actions">
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .permission-test-container {
      padding: 24px;
    }
    
    .user-info, .permissions-info, .available-routes {
      margin-bottom: 24px;
    }
    
    .permission-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    
    .permission-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .permission-status {
      font-size: 12px;
      color: #666;
    }
    
    .route-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    
    .actions {
      margin-top: 24px;
      text-align: center;
    }
  `]
})
export class PermissionTestComponent implements OnInit {
  currentUser: User | null = null;
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
  
  permissionKeys: (keyof MenuPermission)[] = ['invoices', 'products', 'clients', 'suppliers', 'users', 'pricing', 'shop', 'orders'];
  availableRoutes: string[] = [];

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadUserAndPermissions();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updatePermissions();
    });
  }

  private loadUserAndPermissions(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.updatePermissions();
  }

  private updatePermissions(): void {
    if (this.currentUser?.role) {
      this.menuPermissions = this.permissionService.getMenuPermissions(this.currentUser.role);
      this.availableRoutes = this.permissionService.getAvailableMenuItems(this.currentUser.role);
    } else {
      this.menuPermissions = {
        invoices: false,
        products: false,
        clients: false,
        suppliers: false,
        users: false,
        pricing: false,
        shop: false,
        orders: false
      };
      this.availableRoutes = [];
    }
  }


  getRoleColor(role: string | undefined): string {
    switch (role) {
      case 'EMPLOYEE':
        return 'blue';
      case 'CLIENT_USER':
        return 'green';
      case 'SUPPLIER_USER':
        return 'orange';
      default:
        return 'default';
    }
  }
}
