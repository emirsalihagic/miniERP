import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SuppliersService, Supplier } from '../../../products/services/suppliers.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AgGridAngular,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpinModule,
    NzEmptyModule,
    NzAlertModule
  ],
  template: `
    <div class="suppliers-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Suppliers Management</h1>
            <p>Manage your supplier relationships and track supplier information</p>
          </div>
          <div class="header-actions">
            <button 
              *ngIf="canCreateSupplier" 
              class="btn btn-primary"
              routerLink="/suppliers/new"
            >
              <span nz-icon nzType="plus"></span>
              Add Supplier
            </button>
          </div>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="enterprise-grid">
        <ag-grid-angular
          [class]="gridClass"
          [rowData]="suppliers()"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          (gridReady)="onGridReady($event)"
          (cellClicked)="onCellClicked($event)"
          style="width: 100%; height: 100%;"
        ></ag-grid-angular>
      </div>

      <!-- Error Alert -->
      <nz-alert
        *ngIf="errorMessage"
        nzType="error"
        [nzMessage]="errorMessage"
        nzShowIcon
        nzCloseable
        (nzOnClose)="errorMessage = ''"
        class="error-alert">
      </nz-alert>
    </div>
  `,
  styles: [`
    .suppliers-container {
      display: flex;
      flex-direction: column;
      height: 90vh;
      background: var(--color-bg-base);
      padding: var(--spacing-lg);
    }

    .page-header {
      flex-shrink: 0;
      margin-bottom: var(--spacing-lg);
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--spacing-lg);
        
        .header-info {
          flex: 1;
          
          h1 {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: 2rem;
            font-weight: 600;
            color: var(--color-text-base);
            line-height: 1.2;
          }
          
          p {
            margin: 0;
            color: var(--color-text-base);
            opacity: 0.7;
            font-size: 1rem;
            line-height: 1.5;
          }
        }
        
        .header-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-shrink: 0;
        }
      }
    }

    .enterprise-grid {
      flex: 1;
      min-height: 0;
      border: 1px solid #e5e7eb;
      border-radius: var(--radius-base);
      overflow: hidden;
      background: var(--color-bg-container);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Action buttons */
    .action-buttons {
      display: flex;
      gap: var(--spacing-xs);
    }

    /* Links and info styling */
    .supplier-link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      
      &:hover {
        text-decoration: underline;
      }
    }

    .supplier-info {
      .supplier-name {
        color: var(--color-text-base);
        font-weight: 500;
      }
      
      .supplier-contact {
        font-size: 0.875rem;
        color: var(--color-text-base);
        opacity: 0.7;
        margin-top: var(--spacing-xs);
      }
    }

    .contact-info {
      .email {
        color: var(--color-text-base);
        font-weight: 500;
      }
      
      .phone {
        font-size: 0.875rem;
        color: var(--color-text-base);
        opacity: 0.7;
        margin-top: var(--spacing-xs);
      }
    }

    .address-info {
      color: var(--color-text-base);
      opacity: 0.8;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .no-address {
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .error-alert {
      margin-top: var(--spacing-lg);
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
      .page-header .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
        
        .header-actions {
          justify-content: flex-start;
        }
      }
    }

    @media (max-width: 768px) {
      .suppliers-container {
        padding: var(--spacing-sm);
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class SuppliersListComponent implements OnInit {
  // Signals for reactive state
  suppliers = signal<Supplier[]>([]);
  loading = signal(false);
  errorMessage = '';

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Supplier Name',
      flex: 2,
      minWidth: 200,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const supplier = params.data;
        return `
          <div class="supplier-info">
            <div class="supplier-name">
              <strong>${supplier.name}</strong>
            </div>
          </div>
        `;
      }
    },
    {
      field: 'email',
      headerName: 'Contact',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const supplier = params.data;
        let html = '';
        
        if (supplier.email) {
          html += `<div class="email">${supplier.email}</div>`;
        }
        
        if (supplier.phone) {
          html += `<div class="phone">${supplier.phone}</div>`;
        }
        
        if (!supplier.email && !supplier.phone) {
          html = '<span class="no-contact">No contact info</span>';
        }
        
        return `<div class="contact-info">${html}</div>`;
      }
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const address = params.value;
        if (!address) {
          return '<span class="no-address">No address</span>';
        }
        return `<div class="address-info">${address}</div>`;
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
        const supplier = params.data;
        let buttons = '';
        
        buttons += `<button class="action-btn view-btn" onclick="window.viewSupplier('${supplier.id}')" title="View Details">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </button>`;
        
        if (this.canManageSuppliers) {
          buttons += `<button class="action-btn edit-btn" onclick="window.editSupplier('${supplier.id}')" title="Edit Supplier">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>`;
          
          buttons += `<button class="action-btn delete-btn" onclick="window.deleteSupplier('${supplier.id}')" title="Delete Supplier">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>`;
        }
        
        return `<div class="action-buttons">${buttons}</div>`;
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
      floatingFilter: false,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '400',
        color: '#181d1f',
        borderBottom: '1px solid #babfc7'
      },
      headerClass: 'custom-header'
    },
    rowSelection: 'multiple' as const,
    animateRows: true,
    suppressMenuHide: true,
    // Custom no rows overlay
    overlayNoRowsTemplate: 'No matching criteria',
    rowHeight: 56,
    headerHeight: 48,
    suppressRowHoverHighlight: false,
    rowClassRules: {
      'row-hover': () => true
    },
    getRowStyle: (params) => {
      if (params.node?.rowIndex !== null && params.node.rowIndex % 2 === 0) {
        return { backgroundColor: '#ffffff' };
      } else {
        return { backgroundColor: '#f8f9fa' };
      }
    }
  };

  // Services
  private suppliersService = inject(SuppliersService);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  // Permission getters
  get canCreateSupplier(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.EMPLOYEE;
  }

  get canManageSuppliers(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.EMPLOYEE;
  }

  ngOnInit() {
    // Register AG-Grid modules
    ModuleRegistry.registerModules([AllCommunityModule]);
    
    this.updateGridClass();
    this.loadSuppliers();
    
    // Set up global window functions for AG-Grid cell renderers
    (window as any).viewSupplier = (id: string) => this.viewSupplier(id);
    (window as any).editSupplier = (id: string) => this.editSupplier(id);
    (window as any).deleteSupplier = (id: string) => this.deleteSupplier(id);
  }

  loadSuppliers() {
    this.loading.set(true);
    
    this.suppliersService.getAll().subscribe({
      next: (suppliers: Supplier[]) => {
        this.suppliers.set(suppliers);
        this.loading.set(false);
        
        // Update grid if it's ready
        if (this.gridApi) {
          if (typeof this.gridApi.setGridOption === 'function') {
            this.gridApi.setGridOption('rowData', this.suppliers());
            this.gridApi.setGridOption('columnDefs', this.columnDefs);
            // Force grid refresh
            setTimeout(() => {
              this.gridApi.refreshCells();
            }, 100);
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading suppliers:', error);
        this.errorMessage = 'Failed to load suppliers';
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
    
    // If suppliers are already loaded, set them in the grid
    if (this.suppliers().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.suppliers());
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

  viewSupplier(id: string): void {
    // Navigate to supplier detail page
    window.location.href = `/suppliers/${id}`;
  }

  editSupplier(id: string): void {
    // Navigate to supplier edit page
    window.location.href = `/suppliers/${id}/edit`;
  }

  deleteSupplier(id: string): void {
    const supplier = this.suppliers().find(s => s.id === id);
    if (!supplier) return;

    if (confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
      this.loading.set(true);
      
      this.suppliersService.delete(id).subscribe({
        next: () => {
          this.message.success(`Supplier "${supplier.name}" deleted successfully`);
          this.loadSuppliers(); // Reload the list
        },
        error: (error: any) => {
          console.error('Error deleting supplier:', error);
          this.message.error('Failed to delete supplier');
          this.loading.set(false);
        }
      });
    }
  }
}
