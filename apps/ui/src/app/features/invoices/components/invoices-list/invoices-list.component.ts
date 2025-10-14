import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { InvoicesService, Invoice } from '../../services/invoices.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AgGridAngular, NzButtonModule, NzIconModule, NzSelectModule, NzTagModule, NzSpinModule, NzEmptyModule, NzAlertModule],
  template: `
    <div class="invoices-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Invoices Management</h1>
            <p>Track and manage your invoices, quotes, and payments</p>
          </div>
          <div class="header-actions">
            <button 
              *ngIf="canCreateInvoice" 
              class="btn btn-primary"
              routerLink="/invoices/new"
            >
              <span nz-icon nzType="plus"></span>
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="enterprise-grid">
        <ag-grid-angular
          [class]="gridClass"
          [rowData]="invoices()"
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
    .invoices-container {
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
      
      &.status-quote {
        background: rgba(245, 158, 11, 0.1);
        color: var(--color-warning);
      }
      
      &.status-issued {
        background: rgba(37, 99, 235, 0.1);
        color: var(--color-primary);
      }
      
      &.status-paid {
        background: rgba(22, 163, 74, 0.1);
        color: var(--color-success);
      }
      
      &.status-cancelled {
        background: rgba(239, 68, 68, 0.1);
        color: var(--color-error);
      }
    }

    /* Action buttons */
    .action-buttons {
      display: flex;
      gap: var(--spacing-xs);
    }

    /* Links and info styling */
    .invoice-link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      
      &:hover {
        text-decoration: underline;
      }
    }

    .invoice-meta {
      font-size: 0.875rem;
      color: var(--color-text-base);
      opacity: 0.7;
      margin-top: var(--spacing-xs);
    }

    .client-name {
      color: var(--color-text-base);
      font-weight: 500;
    }

    .client-email {
      font-size: 0.875rem;
      color: var(--color-text-base);
      opacity: 0.7;
      margin-top: var(--spacing-xs);
    }

    .unknown-client {
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .due-date {
      color: var(--color-text-base);
      font-weight: 500;
    }

    .days-until {
      font-size: 0.75rem;
      margin-top: var(--spacing-xs);
      
      &.overdue {
        color: var(--color-error);
        font-weight: 500;
      }
      
      &.due-soon {
        color: var(--color-warning);
        font-weight: 500;
      }
      
      &.normal {
        color: var(--color-text-base);
        opacity: 0.6;
      }
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
      
      .results-summary .summary-info {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
        
        .status-summary {
          flex-wrap: wrap;
        }
      }
    }

    @media (max-width: 768px) {
      .invoices-container {
        padding: var(--spacing-sm);
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class InvoicesListComponent implements OnInit {
  private invoicesService = inject(InvoicesService);
  private clientsService = inject(ClientsService);
  private authService = inject(AuthService);

  // Signals for reactive state
  invoices = signal<Invoice[]>([]);
  clients: any[] = [];
  selectedClientId = '';
  loading = signal(false);
  errorMessage = '';

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'invoiceNumber',
      headerName: 'Invoice',
      flex: 1,
      minWidth: 150,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const invoice = params.data;
        let html = `<a href="/invoices/${invoice.id}" class="invoice-link">${invoice.invoiceNumber}</a>`;
        if (invoice.notes) {
          html += `<div class="invoice-meta">${invoice.notes}</div>`;
        }
        return html;
      }
    },
    {
      field: 'client',
      headerName: 'Client',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const client = params.value;
        if (!client) {
          return '<span class="unknown-client">Unknown Client</span>';
        }
        let html = `<div class="client-name">${client.name}</div>`;
        if (client.email) {
          html += `<div class="client-email">${client.email}</div>`;
        }
        return html;
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
      field: 'grandTotal',
      headerName: 'Amount',
      width: 120,
      cellRenderer: (params: any) => {
        return this.formatCurrency(params.value);
      }
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      cellRenderer: (params: any) => {
        const dueDate = params.value;
        if (!dueDate) return '-';
        
        const due = new Date(dueDate);
        const formattedDate = due.toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        });
        const daysClass = this.getDaysUntilClass(dueDate);
        const daysText = this.getDaysUntil(dueDate);
        
        return `
          <div class="due-date">${formattedDate}</div>
          <div class="days-until ${daysClass}">${daysText}</div>
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
        const invoice = params.data;
        let buttons = '';
        
        buttons += `<button class="btn btn-sm btn-outline" onclick="window.viewInvoice('${invoice.id}')" title="View Details">
          <span nz-icon nzType="eye"></span>
        </button>`;
        
        if (this.canManageInvoices && invoice.status === 'QUOTE') {
          buttons += `<button class="btn btn-sm btn-danger" onclick="window.issueInvoice('${invoice.id}')" title="Issue Invoice">
            <span nz-icon nzType="check-circle"></span>
          </button>`;
        }
        
        if (this.canManageInvoices && invoice.status === 'ISSUED') {
          buttons += `<button class="btn btn-sm btn-success" onclick="window.markAsPaid('${invoice.id}')" title="Mark as Paid">
            <span nz-icon nzType="dollar"></span>
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
      floatingFilter: false
    },
    rowSelection: 'multiple' as const,
    animateRows: true,
    suppressMenuHide: true
  };

  // Permission getters
  get canCreateInvoice(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.EMPLOYEE;
  }

  get canManageInvoices(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.EMPLOYEE;
  }

  ngOnInit() {
    // Register AG-Grid modules
    ModuleRegistry.registerModules([AllCommunityModule]);
    
    this.updateGridClass();
    this.loadInvoices();
    this.loadClients();
    
    // Set up global window functions for AG-Grid cell renderers
    (window as any).viewInvoice = (id: string) => this.viewInvoice(id);
    (window as any).issueInvoice = (id: string) => this.issueInvoice(id);
    (window as any).markAsPaid = (id: string) => this.markAsPaid(id);
  }

  loadInvoices() {
    this.loading.set(true);
    this.invoicesService.getAll(this.selectedClientId || undefined).subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.loading.set(false);
        
        // Update grid if it's ready
        if (this.gridApi) {
          if (typeof this.gridApi.setGridOption === 'function') {
            this.gridApi.setGridOption('rowData', this.invoices());
            this.gridApi.setGridOption('columnDefs', this.columnDefs);
            // Force grid refresh
            setTimeout(() => {
              this.gridApi.refreshCells();
            }, 100);
          }
        }
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading.set(false);
        
        // Update grid with empty data
        if (this.gridApi && typeof this.gridApi.setGridOption === 'function') {
          this.gridApi.setGridOption('rowData', []);
        }
      }
    });
  }

  loadClients() {
    this.clientsService.getClients().subscribe({
      next: (response: any) => {
        this.clients = response.data || response;
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  filterByClient() {
    this.loadInvoices();
  }

  // AG-Grid event handlers
  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    
    // If invoices are already loaded, set them in the grid
    if (this.invoices().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.invoices());
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

  viewInvoice(id: string): void {
    // Navigate to invoice detail page
    window.location.href = `/invoices/${id}`;
  }

  issueInvoice(invoiceId: string) {
    this.loading.set(true);
    this.invoicesService.issue(invoiceId).subscribe({
      next: () => {
        this.loadInvoices(); // Reload to get updated status
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error issuing invoice:', error);
        this.loading.set(false);
      }
    });
  }

  markAsPaid(invoiceId: string) {
    this.loading.set(true);
    this.invoicesService.markAsPaid(invoiceId).subscribe({
      next: () => {
        this.loadInvoices(); // Reload to get updated status
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error marking invoice as paid:', error);
        this.loading.set(false);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'QUOTE':
        return 'orange';
      case 'ISSUED':
        return 'blue';
      case 'PAID':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusCount(status: string): number {
    return this.invoices().filter(invoice => invoice.status === status).length;
  }

  getDaysUntil(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `${diffDays} days`;
    }
  }

  getDaysUntilClass(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays <= 7) {
      return 'due-soon';
    } else {
      return 'normal';
    }
  }
}
