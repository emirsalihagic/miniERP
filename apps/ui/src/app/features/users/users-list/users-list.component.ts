import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserService } from '../services/user.service';
import { ERPUser, UserRole } from '../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AgGridAngular,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzSpaceModule,
    NzGridModule,
    NzModalModule,
    NzMessageModule
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.less'],
  providers: [DatePipe]
})
export class UsersListComponent implements OnInit {
  // Signals for reactive state
  users = signal<ERPUser[]>([]);
  loading = signal(false);
  total = signal(0);

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      minWidth: 200,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const user = params.data;
        return `
          <div class="user-info">
            <div class="user-name">
              <strong>${user.firstName} ${user.lastName}</strong>
            </div>
          </div>
        `;
      }
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const role = params.value;
        const roleClass = `role-${role.toLowerCase().replace('_', '-')}`;
        const roleDisplay = this.getRoleDisplayName(role);
        return `<span class="role-badge ${roleClass}">${roleDisplay}</span>`;
      }
    },
    {
      field: 'isEmailVerified',
      headerName: 'Email Verified',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const isVerified = params.value;
        const statusClass = isVerified ? 'verified' : 'not-verified';
        const statusText = isVerified ? 'Verified' : 'Not Verified';
        return `<span class="verification-badge ${statusClass}">${statusText}</span>`;
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueFormatter: (params: any) => {
        return params.value ? new Date(params.value).toLocaleDateString() : '-';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      pinned: 'right',
      filter: false,
      cellRenderer: (params: any) => {
        const user = params.data;
        return `
          <div class="action-buttons">
            <button class="btn btn-sm btn-outline" onclick="window.editUser('${user.id}')" title="Edit User">
              <span nz-icon nzType="edit"></span>
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.deleteUser('${user.id}')" title="Delete User">
              <span nz-icon nzType="delete"></span>
            </button>
          </div>
        `;
      }
    }
  ];

  // AG-Grid options
  gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      floatingFilter: false
    },
    rowSelection: 'multiple' as const,
    animateRows: true,
    suppressMenuHide: true
  };

  // Services
  private userService = inject(UserService);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  userRole = UserRole;

  ngOnInit(): void {
    // Register AG-Grid modules
    ModuleRegistry.registerModules([AllCommunityModule]);
    
    this.updateGridClass();
    this.loadUsers();
    
    // Set up global window functions for AG-Grid cell renderers
    (window as any).editUser = (id: string) => this.editUser(id);
    (window as any).deleteUser = (id: string) => this.deleteUser(id);
  }

  loadUsers(): void {
    this.loading.set(true);
    // Load all users for AG-Grid (no pagination needed)
    this.userService.getUsers(1, 1000).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.total.set(response.meta.total);
        this.loading.set(false);
        
        // Update grid if it's ready
        if (this.gridApi) {
          if (typeof this.gridApi.setGridOption === 'function') {
            this.gridApi.setGridOption('rowData', this.users());
            this.gridApi.setGridOption('columnDefs', this.columnDefs);
            // Force grid refresh
            setTimeout(() => {
              this.gridApi.refreshCells();
            }, 100);
          }
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.message.error('Failed to load users');
        this.loading.set(false);
        
        // Update grid with empty data
        if (this.gridApi && typeof this.gridApi.setGridOption === 'function') {
          this.gridApi.setGridOption('rowData', []);
        }
      }
    });
  }

  // AG-Grid event handlers
  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    
    // If users are already loaded, set them in the grid
    if (this.users().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.users());
        event.api.setGridOption('columnDefs', this.columnDefs);
        // Force grid refresh
        setTimeout(() => {
          this.gridApi.refreshCells();
        }, 100);
      }
    }
  }

  onCellClicked(event: CellClickedEvent) {
    // Handle cell clicks if needed
  }

  updateGridClass() {
    // Check if dark mode is enabled
    this.isDarkMode = document.documentElement.classList.contains('dark') || 
                     document.body.classList.contains('dark');
    this.gridClass = this.isDarkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
  }

  createUser(): void {
    this.router.navigate(['/users/new']);
  }

  editUser(id: string): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  deleteUser(id: string): void {
    const user = this.users().find(u => u.id === id);
    if (!user) return;

    this.modal.confirm({
      nzTitle: 'Delete User',
      nzContent: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`,
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.loading.set(true);
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.message.success(`User "${user.firstName} ${user.lastName}" deleted successfully`);
            this.loadUsers(); // Reload the list
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.message.error('Failed to delete user');
            this.loading.set(false);
          }
        });
      }
    });
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.EMPLOYEE:
        return 'Employee';
      case UserRole.CLIENT_USER:
        return 'Client User';
      case UserRole.SUPPLIER_USER:
        return 'Supplier User';
      default:
        return role;
    }
  }

  getRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.EMPLOYEE:
        return 'blue';
      case UserRole.CLIENT_USER:
        return 'green';
      case UserRole.SUPPLIER_USER:
        return 'orange';
      default:
        return 'default';
    }
  }
}
