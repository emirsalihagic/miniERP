import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellClickedEvent, GridOptions, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ProductsService, Product } from '../../services/products.service';
import { EnterpriseGridConfig } from '../../../../shared/interfaces/enterprise-grid.interface';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AgGridModule, NzIconModule],
  template: `
    <div class="products-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Products Management</h1>
            <p>Manage your product catalog, inventory, and pricing information</p>
          </div>
          <div class="header-actions">
            <button 
              class="btn btn-secondary" 
              routerLink="/products/product-groups"
            >
              <span nz-icon nzType="folder-add"></span>
              Add Product Group
            </button>
            <button 
              class="btn btn-primary" 
              routerLink="/products/new"
            >
              <span nz-icon nzType="plus"></span>
              Add Product
            </button>
          </div>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="enterprise-grid">
        <ag-grid-angular
          [class]="gridClass"
          [rowData]="products"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          (gridReady)="onGridReady($event)"
          (cellClicked)="onCellClicked($event)"
          style="width: 100%; height: 100%;"
        ></ag-grid-angular>
      </div>

      <!-- Empty State -->
      <div *ngIf="products.length === 0" class="empty-state">
        <p>No products found. <a routerLink="/products/new">Create your first product</a></p>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
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

    .filters {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-card);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      min-width: 150px;
    }

    .filter-group label {
      margin-bottom: var(--spacing-xs);
      font-weight: 500;
      color: var(--color-text-base);
    }

    .table-container {
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      overflow: hidden;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
    }

    .products-table th {
      background: var(--color-bg-base);
      padding: var(--spacing-md);
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid var(--color-border);
      color: var(--color-text-base);
    }

    .products-table td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-bg-container);
      color: var(--color-text-base);
    }

    .products-table tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .grouped-product {
      background: rgba(59, 130, 246, 0.05);
    }

    .product-name {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .product-name strong {
      color: var(--color-text-base);
      font-weight: 600;
    }

    .group-info, .variation-info {
      color: var(--color-text-secondary);
      font-size: 12px;
    }

    .type-tag {
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: bold;
    }

    .type-grouped {
      background: rgba(59, 130, 246, 0.1);
      color: var(--color-primary);
    }

    .type-individual {
      background: rgba(34, 197, 94, 0.1);
      color: var(--color-success);
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }

    .status-tag {
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: bold;
    }

    .status-registration { 
      background: rgba(245, 158, 11, 0.1); 
      color: var(--color-warning); 
    }
    .status-active { 
      background: rgba(34, 197, 94, 0.1); 
      color: var(--color-success); 
    }
    .status-inactive { 
      background: rgba(248, 113, 113, 0.1); 
      color: var(--color-error); 
    }
    .status-stand_by { 
      background: rgba(59, 130, 246, 0.1); 
      color: var(--color-primary); 
    }

    .product-group {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }

    .attributes {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }

    .attribute-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
    }

    .attribute-tag {
      background: var(--color-bg-base);
      color: var(--color-text-secondary);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      border: 1px solid var(--color-border);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--color-text-base);
      
      a {
        color: var(--color-primary);
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .products-container {
        padding: var(--spacing-sm);
      }
      
      .page-header .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
      }
      
      .page-header .header-content .header-actions {
        justify-content: stretch;
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.75rem;
      }
      
      .filters {
        flex-direction: column;
        gap: var(--spacing-md);
      }
      
      .enterprise-grid {
        height: 400px;
      }
    }

    .form-control {
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14px;
      background: var(--color-bg-container);
      color: var(--color-text-base);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: var(--focus-ring);
    }

    /* AG-Grid Styles */
    .enterprise-grid {
      flex: 1;
      min-height: 0;
      border: 1px solid #e5e7eb;
      border-radius: var(--radius-base);
      overflow: hidden;
      background: var(--color-bg-container);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .grid-fallback {
      padding: var(--spacing-lg);
      text-align: center;
      color: var(--color-text-base);
      background: var(--color-bg-container);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-base);
    }

    /* AG-Grid Cell Renderer Styles */
    :host ::ng-deep {
      .product-cell {
        .product-name {
          font-weight: 500;
          color: var(--color-text-base);
          margin-bottom: 4px;
        }
        
        .product-group,
        .product-variation {
          font-size: 12px;
          color: var(--color-text-secondary);
          opacity: 0.8;
        }
      }
      
      .type-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: 12px;
        font-weight: 500;
        
        &.type-primary {
          background: rgba(59, 130, 246, 0.1);
          color: var(--color-primary);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        &.type-secondary {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
      }
      
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        
        &.status-active {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        &.status-inactive {
          background: rgba(248, 113, 113, 0.1);
          color: var(--color-error);
          border: 1px solid rgba(248, 113, 113, 0.2);
        }
        
        &.status-registration {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        
        &.status-stand_by {
          background: rgba(59, 130, 246, 0.1);
          color: var(--color-primary);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 6px;
        align-items: center;
        
        button {
          padding: 6px 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-base);
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }

  `]
})
export class ProductsListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private router = inject(Router);

  products: Product[] = [];
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid Configuration
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 2,
      minWidth: 200,
      pinned: 'left'
    },
    {
      field: 'sku',
      headerName: 'SKU',
      width: 120
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => {
        const desc = params.value;
        return desc ? (desc.length > 50 ? desc.substring(0, 50) + '...' : desc) : '-';
      }
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
      },
      cellRenderer: (params: any) => {
        const status = params.value;
        const statusClass = `status-${status.toLowerCase()}`;
        return `<span class="status-badge ${statusClass}">${status}</span>`;
      }
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      width: 150,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
      },
      valueGetter: (params: any) => {
        return params.data.supplier?.name || '-';
      }
    },
    {
      field: 'unit',
      headerName: 'Unit',
      width: 100,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
      },
      valueGetter: (params: any) => {
        return params.data.unit?.name || '-';
      }
    },
    {
      field: 'storageType',
      headerName: 'Storage',
      width: 100,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
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
      width: 120,
      pinned: 'right',
      filter: false, // Disable filtering for actions column
      cellRenderer: (params: any) => {
        const product = params.data;
        return `
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary" onclick="window.editProduct('${product.id}')">
              Edit
            </button>
          </div>
        `;
      }
    }
  ];

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
    this.loadProducts();
    this.setupGlobalHandlers();
    this.updateGridClass();
  }

  setupGlobalHandlers() {
    // Setup global handlers for AG-Grid cell renderer buttons
    (window as any).editProduct = (id: string) => {
      this.router.navigate(['/products/edit', id]);
    };
    
    (window as any).showAttributes = (id: string) => {
      const product = this.products.find(p => p.id === id);
      if (product) {
        this.showAttributes(product);
      }
    };
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    
    // If products are already loaded, set them in the grid
    if (this.products.length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.products);
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

  loadProducts() {
    this.productsService.getAll({}).subscribe({
      next: (response) => {
        this.products = response.data;
        
        // Update grid if it's ready
        if (this.gridApi) {
          // Column definitions are now static with text filters
          
          // Use the correct method to update the grid
          if (typeof this.gridApi.setGridOption === 'function') {
            this.gridApi.setGridOption('rowData', this.products);
            this.gridApi.setGridOption('columnDefs', this.columnDefs);
            // Force grid refresh
            setTimeout(() => {
              this.gridApi.refreshCells();
            }, 100);
          }
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
        // Fallback to empty array if API fails
        this.products = [];
        
        // Update grid with empty data
        if (this.gridApi && typeof this.gridApi.setGridOption === 'function') {
          this.gridApi.setGridOption('rowData', []);
        }
      }
    });
  }

  showAttributes(product: Product) {
    // In a real app, you might open a modal or navigate to a detail page
    const attributes = product.attributeValues?.map(attr => 
      `${attr.attribute.name}: ${attr.value}`
    ).join(', ') || 'No attributes';
    
    alert(`Product Attributes:\n${attributes}`);
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productsService.delete(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }
}
