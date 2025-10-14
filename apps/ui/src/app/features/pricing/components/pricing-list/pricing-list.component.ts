import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { PricingService, Pricing, PricingListResponse } from '../../services/pricing.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-pricing-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AgGridAngular, NzIconModule, NzButtonModule, NzMessageModule, NzModalModule],
  template: `
    <div class="pricing-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Product Pricing</h1>
            <p>Manage pricing rules, discounts, and client-specific pricing overrides</p>
          </div>
          <div class="header-actions">
            <button type="button" (click)="goToCreate()" class="btn btn-primary">
              <span nz-icon nzType="plus"></span>
              Add Pricing Rule
            </button>
          </div>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="enterprise-grid">
        <ag-grid-angular
          [class]="gridClass"
          [rowData]="pricingRules()"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          (gridReady)="onGridReady($event)"
          (cellClicked)="onCellClicked($event)"
          style="width: 100%; height: 100%;"
        ></ag-grid-angular>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && pricingRules().length === 0" class="empty-state">
        <div class="empty-icon">
          <span nz-icon nzType="dollar-circle" style="font-size: 3rem; color: #28a745;"></span>
        </div>
        <h3>No Pricing Rules Found</h3>
        <p>Start by creating your first pricing rule for a product.</p>
        <button type="button" (click)="goToCreate()" class="btn btn-primary">
          Add Pricing Rule
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pricing-container {
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

    /* Product info styling */
    .product-info {
      .product-name {
        font-weight: 500;
        color: var(--color-text-base);
      }
    }

    .sku {
      font-family: monospace;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .price {
      font-weight: 600;
      color: var(--color-success);
    }

    .currency {
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .tax-rate {
      color: var(--color-text-secondary);
    }

    .discount {
      color: var(--color-text-secondary);
    }

    .discount.has-discount {
      color: var(--color-error);
      font-weight: 500;
    }

    /* Scope badge styling */
    .scope-badge {
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      
      &.scope-base {
        background: rgba(136, 136, 136, 0.1);
        color: var(--color-text-secondary);
      }
      
      &.scope-client {
        background: rgba(34, 197, 94, 0.1);
        color: var(--color-success);
      }
      
      &.scope-supplier {
        background: rgba(59, 130, 246, 0.1);
        color: var(--color-primary);
      }
    }

    .entity-name {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .effective-period {
      display: flex;
      flex-direction: column;
      font-size: 0.875rem;
    }

    .from {
      color: var(--color-text-base);
    }

    .to {
      color: var(--color-text-secondary);
    }

    /* Action buttons */
    .action-buttons {
      display: flex;
      gap: var(--spacing-xs);
    }

    .empty-state {
      flex-shrink: 0;
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--color-text-secondary);
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
    }

    .empty-state h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-text-base);
    }

    .empty-state p {
      margin: 0 0 var(--spacing-lg) 0;
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
      .pricing-container {
        padding: var(--spacing-sm);
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class PricingListComponent implements OnInit {
  // Services
  private pricingService = inject(PricingService);
  private router = inject(Router);
  private navigationService = inject(NavigationService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  // Signals for reactive state
  pricingRules = signal<Pricing[]>([]);
  loading = signal(false);
  total = signal(0);

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'product',
      headerName: 'Product',
      flex: 2,
      minWidth: 200,
      pinned: 'left',
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const product = params.value;
        if (!product) {
          return '<span class="unknown-product">Unknown Product</span>';
        }
        return `
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="sku">${product.sku || 'N/A'}</div>
          </div>
        `;
      }
    },
    {
      field: 'price',
      headerName: 'Unit Price',
      width: 150,
      cellRenderer: (params: any) => {
        const pricing = params.data;
        return `<span class="price">${this.formatCurrency(pricing.price, pricing.currency)}</span>`;
      }
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 100,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'taxRate',
      headerName: 'Tax Rate',
      width: 100,
      cellRenderer: (params: any) => {
        return `<span class="tax-rate">${params.value}%</span>`;
      }
    },
    {
      field: 'discountPercent',
      headerName: 'Discount',
      width: 100,
      cellRenderer: (params: any) => {
        const discount = params.value;
        const hasDiscount = discount > 0;
        const discountClass = hasDiscount ? 'has-discount' : '';
        return `<span class="discount ${discountClass}">${discount}%</span>`;
      }
    },
    {
      field: 'scope',
      headerName: 'Scope',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const pricing = params.data;
        const scopeClass = this.getScopeClass(pricing);
        const scopeLabel = this.getScopeLabel(pricing);
        return `<span class="scope-badge scope-${scopeClass}">${scopeLabel}</span>`;
      }
    },
    {
      field: 'entity',
      headerName: 'Client/Supplier',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const pricing = params.data;
        const entityName = pricing.client?.name || pricing.supplier?.name || 'Base';
        return `<span class="entity-name">${entityName}</span>`;
      }
    },
    {
      field: 'effectivePeriod',
      headerName: 'Effective Period',
      width: 200,
      cellRenderer: (params: any) => {
        const pricing = params.data;
        const fromDate = new Date(pricing.effectiveFrom).toLocaleDateString();
        const toDate = pricing.effectiveTo ? new Date(pricing.effectiveTo).toLocaleDateString() : null;
        
        let html = `<div class="effective-period">`;
        html += `<div class="from">${fromDate}</div>`;
        if (toDate) {
          html += `<div class="to">- ${toDate}</div>`;
        }
        html += `</div>`;
        return html;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      pinned: 'right',
      filter: false,
      cellRenderer: (params: any) => {
        const pricing = params.data;
        return `
          <div class="action-buttons">
            <button class="btn btn-sm btn-outline" onclick="window.editPricing('${pricing.id}')" title="Edit Pricing">
              <span nz-icon nzType="edit"></span>
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.deletePricing('${pricing.id}')" title="Delete Pricing">
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

  ngOnInit() {
    // Register AG-Grid modules
    ModuleRegistry.registerModules([AllCommunityModule]);
    
    this.updateGridClass();
    this.loadPricing();
    
    // Set up global window functions for AG-Grid cell renderers
    (window as any).editPricing = (id: string) => this.editPricing(id);
    (window as any).deletePricing = (id: string) => this.deletePricing(id);
  }

  loadPricing() {
    this.loading.set(true);

    // Load all pricing rules for AG-Grid (no pagination needed)
    this.pricingService.getAll(1, 1000).subscribe({
      next: (response: PricingListResponse) => {
        this.pricingRules.set(response.data);
        this.total.set(response.meta.total);
        this.loading.set(false);
        
        // Update grid if it's ready
        if (this.gridApi) {
          if (typeof this.gridApi.setGridOption === 'function') {
            this.gridApi.setGridOption('rowData', this.pricingRules());
            this.gridApi.setGridOption('columnDefs', this.columnDefs);
            // Force grid refresh
            setTimeout(() => {
              this.gridApi.refreshCells();
            }, 100);
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading pricing:', error);
        this.message.error('Failed to load pricing rules');
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
    
    // If pricing rules are already loaded, set them in the grid
    if (this.pricingRules().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.pricingRules());
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

  formatCurrency(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  getScopeClass(pricing: Pricing): string {
    if (pricing.clientId) return 'client';
    if (pricing.supplierId) return 'supplier';
    return 'base';
  }

  getScopeLabel(pricing: Pricing): string {
    if (pricing.clientId) return 'Client Override';
    if (pricing.supplierId) return 'Supplier Override';
    return 'Base Pricing';
  }

  goToCreate() {
    this.router.navigate(['/pricing/new']);
  }

  editPricing(id: string) {
    this.router.navigate(['/pricing', id, 'edit']);
  }

  deletePricing(id: string) {
    const pricing = this.pricingRules().find(p => p.id === id);
    if (!pricing) return;

    this.modal.confirm({
      nzTitle: 'Delete Pricing Rule',
      nzContent: `Are you sure you want to delete this pricing rule for "${pricing.product?.name || 'Unknown Product'}"?`,
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.loading.set(true);
        this.pricingService.delete(id).subscribe({
          next: () => {
            this.message.success('Pricing rule deleted successfully');
            this.loadPricing(); // Reload the list
          },
          error: (error: any) => {
            console.error('Error deleting pricing rule:', error);
            this.message.error('Failed to delete pricing rule');
            this.loading.set(false);
          }
        });
      }
    });
  }

}
