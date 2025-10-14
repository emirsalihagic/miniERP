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
              [class.active]="statusFilter === 'QUOTE'" 
              (click)="setStatusFilter('QUOTE')">
              Quote
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === 'ISSUED'" 
              (click)="setStatusFilter('ISSUED')">
              Issued
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === 'SENT'" 
              (click)="setStatusFilter('SENT')">
              Sent
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === 'PAID'" 
              (click)="setStatusFilter('PAID')">
              Paid
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === 'VOID'" 
              (click)="setStatusFilter('VOID')">
              Void
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
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--color-bg-container);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      
      // Center content in all cells
      ::ng-deep .ag-cell {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
      }
      
      // Center headers
      ::ng-deep .ag-header-cell {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
      }
    }

    /* AG Grid Custom Styling */
    :host ::ng-deep {
      .ag-theme-alpine {
        --ag-background-color: #ffffff;
        --ag-header-background-color: #f8fafc;
        --ag-odd-row-background-color: #ffffff;
        --ag-even-row-background-color: #f8fafc;
        --ag-row-hover-color: rgba(37, 99, 235, 0.08);
        --ag-border-color: #e2e8f0;
        --ag-header-foreground-color: #1e293b;
        --ag-foreground-color: #1e293b;
        --ag-font-size: 14px;
        --ag-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --ag-header-height: 48px;
        --ag-row-height: 56px;
      }

      .custom-header {
        font-weight: 600 !important;
        font-size: 13px !important;
        color: var(--color-text-base) !important;
        background: var(--color-bg-base) !important;
        border-bottom: 2px solid var(--color-border) !important;
        padding: 12px 16px !important;
      }

      .ag-header-cell {
        border-right: 1px solid var(--color-border) !important;
      }

      .ag-row {
        border-bottom: 1px solid var(--color-border) !important;
        transition: background-color 0.2s ease !important;
      }

      .ag-row:hover {
        background-color: rgba(37, 99, 235, 0.05) !important;
      }

      .ag-cell {
        border-right: 1px solid var(--color-border) !important;
        padding: 0 !important;
      }

      .ag-cell-focus {
        border: 2px solid #3b82f6 !important;
        border-radius: 4px !important;
      }

      .ag-header-cell-label {
        font-weight: 600 !important;
        color: #1e293b !important;
      }

      .ag-header-cell-menu-button {
        color: #64748b !important;
      }

      .ag-header-cell-menu-button:hover {
        color: #1e293b !important;
      }

      .ag-icon {
        color: #64748b !important;
      }

      .ag-icon:hover {
        color: #1e293b !important;
      }
    }

    /* Cell Content Styling */
    .invoice-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .invoice-link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--color-primary-hover);
        text-decoration: underline;
      }
    }

    .invoice-meta {
      font-size: 12px;
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .client-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .client-name {
      color: var(--color-text-base);
      font-weight: 500;
      font-size: 14px;
    }

    .client-email {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .unknown-client {
      color: var(--color-text-secondary);
      font-style: italic;
      font-size: 14px;
    }

    .status-cell {
      display: flex;
      align-items: center;
      justify-content: center;
    }


    .amount-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .amount-value {
      font-weight: 600;
      font-size: 14px;
      color: var(--color-text-base);
    }

    .due-date-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .due-date {
      color: var(--color-text-base);
      font-weight: 500;
      font-size: 14px;
    }

    .days-until {
      font-size: 11px;
      font-weight: 500;
      
      &.overdue {
        color: var(--color-error);
      }
      
      &.due-soon {
        color: var(--color-warning);
      }
      
      &.normal {
        color: var(--color-text-secondary);
      }
    }

    .no-date {
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .date-cell {
      display: flex;
      align-items: center;
    }

    .date-value {
      color: var(--color-text-base);
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: center;
      padding: 8px;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      font-size: 0;
      
      &.view-btn {
        background: #f1f5f9;
        color: #64748b;
        border: 1px solid #e2e8f0;
        
        &:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
      }
      
      &.issue-btn {
        background: #fef3c7;
        color: #d97706;
        border: 1px solid #f59e0b;
        
        &:hover {
          background: #f59e0b;
          color: white;
          border-color: #f59e0b;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
        }
      }
      
      &.paid-btn {
        background: #dcfce7;
        color: #16a34a;
        border: 1px solid #22c55e;
        
        &:hover {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
        }
      }
      
      svg {
        width: 14px;
        height: 14px;
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
    }

    @media (max-width: 768px) {
      .invoices-container {
        padding: var(--spacing-sm);
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.75rem;
      }
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

  // Filter state
  statusFilter: string | 'ALL' = 'ALL';

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'invoiceNumber',
      headerName: 'Invoice',
      flex: 1.2,
      minWidth: 180,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const invoice = params.data;
        return `<a href="/invoices/${invoice.id}" class="invoice-link">${invoice.invoiceNumber}</a>`;
      }
    },
    {
      field: 'client',
      headerName: 'Client',
      flex: 1.8,
      minWidth: 220,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const client = params.value;
        if (!client) {
          return 'Unknown Client';
        }
        return client.name;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const status = params.value;
        const statusClass = `status-${status.toLowerCase()}`;
        return `
          <div class="status-cell">
            <span class="status-badge ${statusClass}">${status}</span>
          </div>
        `;
      }
    },
    {
      field: 'grandTotal',
      headerName: 'Amount',
      width: 140,
      cellRenderer: (params: any) => {
        return `
          <div class="amount-cell">
            <span class="amount-value">${this.formatCurrency(params.value)}</span>
          </div>
        `;
      }
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 160,
      cellRenderer: (params: any) => {
        const dueDate = params.value;
        if (!dueDate) return '<div class="due-date-cell"><span class="no-date">-</span></div>';
        
        const due = new Date(dueDate);
        const formattedDate = due.toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        });
        const daysClass = this.getDaysUntilClass(dueDate);
        const daysText = this.getDaysUntil(dueDate);
        
        return `
          <div class="due-date-cell">
            <div class="due-date">${formattedDate}</div>
            <div class="days-until ${daysClass}">${daysText}</div>
          </div>
        `;
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 130,
      cellRenderer: (params: any) => {
        const date = params.value;
        if (!date) return '<div class="date-cell"><span class="no-date">-</span></div>';
        const formattedDate = new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        });
        return `<div class="date-cell"><span class="date-value">${formattedDate}</span></div>`;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      pinned: 'right',
      filter: false,
      cellRenderer: (params: any) => {
        const invoice = params.data;
        let buttons = '';
        
        buttons += `<button class="action-btn view-btn" onclick="window.viewInvoice('${invoice.id}')" title="View Details">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </button>`;
        
        if (this.canManageInvoices && invoice.status === 'QUOTE') {
          buttons += `<button class="action-btn issue-btn" onclick="window.issueInvoice('${invoice.id}')" title="Issue Invoice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </button>`;
        }
        
        if (this.canManageInvoices && invoice.status === 'ISSUED') {
          buttons += `<button class="action-btn paid-btn" onclick="window.markAsPaid('${invoice.id}')" title="Mark as Paid">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
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
        color: 'var(--color-text-base)',
        borderBottom: '1px solid var(--color-border)'
      },
      headerClass: 'custom-header'
    },
    rowSelection: 'multiple' as const,
    animateRows: true,
    suppressMenuHide: true,
    rowHeight: 60,
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

  // Quick filter methods
  setStatusFilter(status: string | 'ALL') {
    this.statusFilter = status;
    this.applyClientSideFilters();
  }

  applyClientSideFilters() {
    if (this.gridApi) {
      // Clear existing filters first
      this.gridApi.setFilterModel(null);
      
      // Apply status filter if not 'ALL'
      if (this.statusFilter !== 'ALL') {
        this.gridApi.setFilterModel({
          status: {
            type: 'equals',
            filter: this.statusFilter
          }
        });
      }
    }
  }

  clearAllFilters() {
    this.statusFilter = 'ALL';
    
    // Clear client-side filters
    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
    }
  }
}
