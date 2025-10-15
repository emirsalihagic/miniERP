import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellClickedEvent, GridOptions, ModuleRegistry, AllCommunityModule, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { MenuItemDef } from 'ag-grid-community';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ProductsService, Product } from '../../services/products.service';
import { EnterpriseGridConfig } from '../../../../shared/interfaces/enterprise-grid.interface';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

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
              [class.active]="statusFilter === 'ACTIVE'" 
              (click)="setStatusFilter('ACTIVE')">
              Active
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === 'INACTIVE'" 
              (click)="setStatusFilter('INACTIVE')">
              Inactive
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === 'DISCONTINUED'" 
              (click)="setStatusFilter('DISCONTINUED')">
              Discontinued
            </button>
            <button 
              class="filter-chip" 
              [class.active]="statusFilter === 'DRAFT'" 
              (click)="setStatusFilter('DRAFT')">
              Draft
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
    .products-container {
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

    .quick-filters .filter-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-direction: row;
      min-width: auto;
      
      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        white-space: nowrap;
        margin-bottom: 0;
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
        
        .edit-btn {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #f59e0b;
          
          &:hover {
            background: #f59e0b;
            color: white;
            border-color: #f59e0b;
          }
        }
        
        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #ef4444;
          
          &:hover {
            background: #ef4444;
            color: white;
            border-color: #ef4444;
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
  gridColumnApi: any = null;

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 20;
  totalRecords: number = 0;
  isLoading: boolean = false;

  // Quick filter state
  statusFilter: string | 'ALL' = 'ALL';

  // AG-Grid Configuration
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      minWidth: 200,
      pinned: 'left',
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
      }
    },
    {
      field: 'sku',
      headerName: 'SKU',
      width: 120,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
      }
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
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
      width: 120,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith']
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
            <button class="action-btn edit-btn" onclick="window.editProduct('${product.id}')" title="Edit Product">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" onclick="window.deleteProduct('${product.id}')" title="Delete Product">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
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
    // Enable filter indicators
    suppressMenuHide: false,
    suppressColumnVirtualisation: false,
    rowSelection: 'multiple' as const,
    // Custom no rows overlay
    overlayNoRowsTemplate: 'No matching criteria',
    animateRows: true,
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
    },
    // Use server-side row model with infinite scrolling for better performance
    rowModelType: 'serverSide',
    infiniteInitialRowCount: 20,
    cacheBlockSize: 20,
    maxBlocksInCache: 5,
    suppressPaginationPanel: true,
    theme: 'legacy',
    // Enterprise features
    getContextMenuItems: (params: any): MenuItemDef[] => {
      const product = params.node?.data;
      if (!product) return [];
      
      return [
        {
          name: 'Edit Product',
          action: () => {
            this.router.navigate(['/products/edit', product.id]);
          },
          icon: '<span class="ag-icon ag-icon-edit"></span>'
        },
        {
          name: 'Delete Product',
          action: () => {
            this.deleteProduct(product.id);
          },
          icon: '<span class="ag-icon ag-icon-trash"></span>'
        },
        { name: 'separator' },
        { name: 'copy' },
        { name: 'copyWithHeaders' },
        { name: 'separator' },
        { name: 'export' }
      ];
    },
    enableRangeSelection: true,
    enableCharts: true,
    sideBar: {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        }
      ],
      defaultToolPanel: 'columns',
      hiddenByDefault: true
    }
  };

  ngOnInit() {
    this.loadProducts();
    this.setupGlobalHandlers();
    this.updateGridClass();
  }

  setupGlobalHandlers() {
    // Setup global handlers for AG-Grid cell renderer buttons
    (window as any).viewProduct = (id: string) => {
      this.router.navigate(['/products', id]);
    };
    
    (window as any).editProduct = (id: string) => {
      this.router.navigate(['/products/edit', id]);
    };
    
    (window as any).deleteProduct = (id: string) => {
      this.deleteProduct(id);
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
    
    // Set up server-side datasource for infinite scrolling
    const datasource: IServerSideDatasource = {
      getRows: (params: IServerSideGetRowsParams) => {
        this.loadProductsForServerSide(params);
      }
    };
    
    this.gridApi.setGridOption('serverSideDatasource', datasource);
    
    // Set up global handlers for action buttons
    this.setupGlobalHandlers();
    
    // Update grid class for styling
    this.updateGridClass();
    
    // Listen for filter changes to update visual indicators
    this.gridApi.addEventListener('filterChanged', () => {
      this.updateFilterIndicators();
    });
  }

  onCellClicked(event: CellClickedEvent) {
    // Handle cell clicks if needed
  }

  private getProductValue(product: any, columnKey: string): any {
    switch (columnKey) {
      case 'status':
        return product.status;
      case 'category':
        return product.category;
      case 'unit':
        return product.unit?.name;
      case 'storageType':
        return product.storageType;
      case 'sku':
        return product.sku;
      case 'name':
        return product.name;
      default:
        return product[columnKey];
    }
  }

  updateFilterIndicators() {
    // Force update of filter indicators by adding/removing classes
    setTimeout(() => {
      const filterModel = this.gridApi?.getFilterModel();
      if (!filterModel) return;
      
      // Get all column headers
      const headerElements = document.querySelectorAll('.ag-header-cell');
      
      headerElements.forEach((headerElement: Element) => {
        const columnId = headerElement.getAttribute('col-id');
        if (!columnId) return;
        
        const isFiltered = filterModel[columnId] !== undefined;
        
        if (isFiltered) {
          headerElement.classList.add('ag-header-cell-filtered');
          headerElement.classList.add('filtered-column');
        } else {
          headerElement.classList.remove('ag-header-cell-filtered');
          headerElement.classList.remove('filtered-column');
        }
      });
    }, 100);
  }

  updateGridClass() {
    // Check if dark mode is enabled
    this.isDarkMode = document.documentElement.classList.contains('dark') || 
                     document.body.classList.contains('dark');
    this.gridClass = this.isDarkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
  }

  loadProducts() {
    // For server-side pagination, we don't need to load all products upfront
    // The grid will handle loading data through the datasource
    this.setupGlobalHandlers();
    this.updateGridClass();
  }

  loadProductsForServerSide(params: IServerSideGetRowsParams) {
    this.isLoading = true;
    
    // Calculate pagination parameters
    const startRow = params.request.startRow || 0;
    const endRow = params.request.endRow || 20;
    const pageSize = endRow - startRow;
    const page = Math.floor(startRow / pageSize) + 1;
    
    // Build filters from AG-Grid filter model
    const filterModel = params.request.filterModel || {};
    const filters: any = {
      page: page,
      limit: pageSize,
      sort: 'name',
      order: 'asc'
    };

    // Map AG-Grid filter model to API parameters
    Object.keys(filterModel).forEach(columnKey => {
      const filter = (filterModel as any)[columnKey];
      
      if (filter && filter.filterType === 'set') {
        // Set filter - multiple values selected
        if (filter.values && filter.values.length > 0) {
          // Send as JSON string for proper array handling
          filters[columnKey] = JSON.stringify(filter.values);
        }
      } else if (filter && filter.filterType === 'text') {
        // Text filter
        if (filter.filter) {
          filters[columnKey] = filter.filter;
        }
      }
    });
    
    console.log('Loading products for server-side:', { startRow, endRow, page, pageSize, filters, filterModel });
    
    this.productsService.getAll(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        const totalRecords = response.meta?.total || 0;
        let products = response.data;
        
        // Client-side filtering is now handled by the backend
        
        console.log('Products loaded for server-side:', products.length, 'Total:', totalRecords);
        
        // Check if we have any filters applied
        const hasFilters = Object.keys(filterModel).length > 0;
        
        // Call success callback with the data
        params.success({
          rowData: products,
          rowCount: hasFilters && products.length === 0 ? -1 : totalRecords // Use -1 to trigger no rows overlay
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading products for server-side:', error);
        
        // Call fail callback
        params.fail();
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

  // Quick filter methods
  setStatusFilter(status: string | 'ALL') {
    this.statusFilter = status;
    this.applyClientSideFilters();
  }

  applyClientSideFilters() {
    if (this.gridApi) {
      // Clear existing filters first
      this.gridApi.setFilterModel(null);
      
      const filters: any = {};
      
      // Apply status filter if not 'ALL'
      if (this.statusFilter !== 'ALL') {
        filters.status = {
          type: 'equals',
          filter: this.statusFilter
        };
      }
      
      // Apply filters if any exist
      if (Object.keys(filters).length > 0) {
        this.gridApi.setFilterModel(filters);
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
