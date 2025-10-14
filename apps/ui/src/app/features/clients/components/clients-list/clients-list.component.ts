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
      height: 100vh;
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

    /* Status badge styling */
    .status-badge {
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      
      &.status-active {
        background: rgba(22, 163, 74, 0.1);
        color: var(--color-success);
      }
      
      &.status-inactive {
        background: rgba(107, 114, 128, 0.1);
        color: var(--color-text-secondary);
      }
      
      &.status-prospect {
        background: rgba(245, 158, 11, 0.1);
        color: var(--color-warning);
      }
    }

    /* Type badge styling */
    .type-badge {
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      
      &.type-company {
        background: rgba(37, 99, 235, 0.1);
        color: var(--color-primary);
      }
      
      &.type-individual {
        background: rgba(22, 163, 74, 0.1);
        color: var(--color-success);
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
  statusFilter: ClientStatus | null = null;
  cityFilter = '';
  tagsFilter = '';
  sortField = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Math property for template
  Math = Math;

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
        const typeClass = `type-${type.toLowerCase()}`;
        return `<span class="type-badge ${typeClass}">${type}</span>`;
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
        const statusClass = `status-${status.toLowerCase()}`;
        return `<span class="status-badge ${statusClass}">${status}</span>`;
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
      field: 'tags',
      headerName: 'Tags',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const tags = params.value || [];
        if (tags.length === 0) {
          return '<span class="no-tags">-</span>';
        }
        const visibleTags = tags.slice(0, 2);
        const remainingCount = tags.length - 2;
        let html = visibleTags.map((tag: string) => `<span class="tag">${tag}</span>`).join('');
        if (remainingCount > 0) {
          html += `<span class="tag">+${remainingCount}</span>`;
        }
        return `<div class="tags-container">${html}</div>`;
      }
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const assignedTo = params.value;
        if (!assignedTo) {
          return '<span class="not-assigned">-</span>';
        }
        return `<span class="assigned-user">${assignedTo.firstName} ${assignedTo.lastName}</span>`;
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
            <button class="btn btn-sm btn-outline" onclick="window.viewClient('${client.id}')" title="View Details">
              <span nz-icon nzType="eye"></span>
            </button>
            <button class="btn btn-sm btn-outline" onclick="window.editClient('${client.id}')" title="Edit Client">
              <span nz-icon nzType="edit"></span>
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.deleteClient('${client.id}')" title="Delete Client">
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
      status: this.statusFilter || undefined,
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
