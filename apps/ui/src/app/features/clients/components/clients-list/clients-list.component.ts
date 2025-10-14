import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { ClientsService } from '../../services/clients.service';
import { 
  Client, 
  ClientQueryParams, 
  ClientStatus, 
  ClientType, 
  PaymentTerms, 
  Currency 
} from '../../../../shared/interfaces/client.interface';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AgGridAngular,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzCardModule,
    NzGridModule,
    NzSpaceModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
    NzMessageModule,
    NzSpinModule,
    NzEmptyModule
  ],
  template: `
    <div class="clients-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Clients Management</h1>
            <p>Manage your client relationships and track their information</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" (click)="createClient()">
              <span nz-icon nzType="plus"></span>
              Create Client
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="quick-filters">
        <div class="filter-group">
          <label>Status:</label>
          <div class="filter-chips">
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === 'ALL'" 
              (click)="setStatusFilter('ALL')">
              All
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === ClientStatus.ACTIVE" 
              (click)="setStatusFilter(ClientStatus.ACTIVE)">
              Active
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === ClientStatus.INACTIVE" 
              (click)="setStatusFilter(ClientStatus.INACTIVE)">
              Inactive
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === ClientStatus.PROSPECT" 
              (click)="setStatusFilter(ClientStatus.PROSPECT)">
              Prospect
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Type:</label>
          <div class="filter-chips">
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === 'ALL'" 
              (click)="setTypeFilter('ALL')">
              All
            </button>
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === ClientType.COMPANY" 
              (click)="setTypeFilter(ClientType.COMPANY)">
              Company
            </button>
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === ClientType.INDIVIDUAL" 
              (click)="setTypeFilter(ClientType.INDIVIDUAL)">
              Individual
            </button>
          </div>
        </div>
        
        <div class="filter-actions">
          <button class="clear-filters-btn" (click)="clearAllFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="enterprise-grid">
        <ag-grid-angular
          [class]="gridClass"
          [rowData]="clients()"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          (gridReady)="onGridReady($event)"
          (cellClicked)="onCellClicked($event)"
          style="width: 100%; height: 100%;"
        ></ag-grid-angular>
      </div>
    </div>
  `,
  styles: [`
    .clients-container {
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

    /* Quick Filters */
    .quick-filters {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-md) 0;
      margin-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      
      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        white-space: nowrap;
      }
    }

    .filter-chips {
      display: flex;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    }

    .filter-chip {
      padding: 6px 12px;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      background: var(--color-bg-container);
      color: var(--color-text-base);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      
      &:hover {
        border-color: var(--color-primary);
        background: var(--color-primary-bg);
        color: var(--color-primary);
      }
      
      &.active {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        
        &:hover {
          background: var(--color-primary-hover);
          border-color: var(--color-primary-hover);
        }
      }
    }

    .filter-actions {
      margin-left: auto;
    }

    .clear-filters-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 6px 12px;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      background: var(--color-bg-container);
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--color-error);
        background: var(--color-error-bg);
        color: var(--color-error);
      }
    }


    /* Action buttons */
    .action-buttons {
      display: flex;
      gap: var(--spacing-xs);
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
      .clients-container {
        padding: var(--spacing-sm);
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class ClientsListComponent implements OnInit {
  // Signals for reactive state
  clients = signal<Client[]>([]);
  loading = signal(false);
  totalClients = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);

  // Filter and search state
  searchQuery = '';
  statusFilter: ClientStatus | 'ALL' = 'ALL';
  typeFilter: ClientType | 'ALL' = 'ALL';
  cityFilter = '';
  tagsFilter = '';
  sortField = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Math property for template
  Math = Math;
  
  // Enum properties for template
  ClientStatus = ClientStatus;
  ClientType = ClientType;

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Client Name',
      flex: 2,
      minWidth: 200,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const client = params.data;
        return `
          <div class="client-info">
            <div class="client-name">
              <strong>${client.name}</strong>
              ${client.clientCode ? `<div class="client-code">${client.clientCode}</div>` : ''}
            </div>
          </div>
        `;
      }
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const type = params.value;
        return type;
      }
    },
    {
      field: 'email',
      headerName: 'Contact',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const client = params.data;
        return `
          <div class="contact-info">
            <div class="email">${client.email}</div>
            ${client.phone ? `<div class="phone">${client.phone}</div>` : ''}
          </div>
        `;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const status = params.value;
        return status;
      }
    },
    {
      field: 'billingCity',
      headerName: 'Location',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const client = params.data;
        return `
          <div class="location-info">
            <div class="city">${client.billingCity || '-'}</div>
            ${client.billingCountry ? `<div class="country">${client.billingCountry}</div>` : ''}
          </div>
        `;
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
        const client = params.data;
        return `
          <div class="action-buttons">
            <button class="action-btn view-btn" onclick="window.viewClient('${client.id}')" title="View Details">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </button>
            <button class="action-btn edit-btn" onclick="window.editClient('${client.id}')" title="Edit Client">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" onclick="window.deleteClient('${client.id}')" title="Delete Client">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
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

  private clientsService = inject(ClientsService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  ngOnInit() {
    // Register AG-Grid modules
    ModuleRegistry.registerModules([AllCommunityModule]);
    
    this.updateGridClass();
    this.loadClients();
    
    // Set up global window functions for AG-Grid cell renderers
    (window as any).viewClient = (id: string) => this.viewClient(id);
    (window as any).editClient = (id: string) => this.editClient(id);
    (window as any).deleteClient = (id: string) => {
      const client = this.clients().find(c => c.id === id);
      if (client) this.deleteClient(client);
    };
  }

  loadClients() {
    this.loading.set(true);
    
    const params: ClientQueryParams = {
      page: 1, // AG-Grid handles pagination internally
      limit: 1000, // Load all clients for AG-Grid
      sort: this.sortField,
      order: this.sortOrder,
      q: this.searchQuery || undefined,
      status: this.statusFilter !== 'ALL' ? this.statusFilter : undefined,
      type: this.typeFilter !== 'ALL' ? this.typeFilter : undefined,
      city: this.cityFilter || undefined,
      tags: this.tagsFilter || undefined
    };

    this.clientsService.getClients(params).subscribe({
      next: (response: any) => {
        this.clients.set(response.items);
        this.totalClients.set(response.total);
        this.loading.set(false);
        
        // Update grid if it's ready
        if (this.gridApi) {
          if (typeof this.gridApi.setGridOption === 'function') {
            this.gridApi.setGridOption('rowData', this.clients());
            this.gridApi.setGridOption('columnDefs', this.columnDefs);
            // Force grid refresh
            setTimeout(() => {
              this.gridApi.refreshCells();
            }, 100);
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        this.message.error('Failed to load clients');
        this.loading.set(false);
        
        // Update grid with empty data
        if (this.gridApi && typeof this.gridApi.setGridOption === 'function') {
          this.gridApi.setGridOption('rowData', []);
        }
      }
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadClients();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadClients();
  }

  // Quick filter methods
  setStatusFilter(status: ClientStatus | 'ALL') {
    this.statusFilter = status;
    this.onFilterChange();
  }

  setTypeFilter(type: ClientType | 'ALL') {
    this.typeFilter = type;
    // Apply client-side filtering since backend doesn't support type filtering
    this.applyClientSideFilters();
  }

  applyClientSideFilters() {
    if (this.gridApi) {
      // Clear existing filters first
      this.gridApi.setFilterModel(null);
      
      // Apply type filter if not 'ALL'
      if (this.typeFilter !== 'ALL') {
        this.gridApi.setFilterModel({
          type: {
            type: 'equals',
            filter: this.typeFilter
          }
        });
      }
    }
  }

  clearAllFilters() {
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.searchQuery = '';
    this.cityFilter = '';
    this.tagsFilter = '';
    
    // Clear client-side filters
    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
    }
    
    this.onFilterChange();
  }

  onSortChange() {
    this.loadClients();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadClients();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadClients();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadClients();
  }


  createClient() {
    this.router.navigate(['/clients/new']);
  }

  viewClient(id: string) {
    this.router.navigate(['/clients', id]);
  }

  editClient(id: string) {
    this.router.navigate(['/clients', id, 'edit']);
  }

  deleteClient(client: Client) {
    this.message.warning(`Delete functionality for ${client.name} will be implemented`);
  }

  getStatusColor(status: ClientStatus): string {
    switch (status) {
      case ClientStatus.ACTIVE:
        return 'green';
      case ClientStatus.INACTIVE:
        return 'red';
      case ClientStatus.PROSPECT:
        return 'orange';
      default:
        return 'default';
    }
  }

  // AG-Grid event handlers
  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    
    // If clients are already loaded, set them in the grid
    if (this.clients().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.clients());
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
}
