import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { OrdersService, Order, OrderStatus, OrderFilters } from '../../../shop/services/orders.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-orders-management-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AgGridAngular,
    NzCardModule,
    NzTagModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzEmptyModule,
    NzSelectModule,
    NzInputModule,
    NzDatePickerModule
  ],
  templateUrl: './orders-management-list.component.html',
  styleUrl: './orders-management-list.component.less'
})
export class OrdersManagementListComponent implements OnInit {
  // Signals for reactive state
  orders = signal<Order[]>([]);
  loading = signal(false);
  total = signal(0);
  
  // Filters
  statusFilter: OrderStatus | 'ALL' = 'ALL';
  searchTerm = '';
  dateRange: Date[] | null = null;
  
  // Status options
  statusOptions = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Pending', value: OrderStatus.PENDING },
    { label: 'Invoice Created', value: OrderStatus.INVOICE_CREATED },
    { label: 'Invoice Issued', value: OrderStatus.INVOICE_ISSUED },
    { label: 'Shipped', value: OrderStatus.SHIPPED },
    { label: 'Delivered', value: OrderStatus.DELIVERED },
    { label: 'Completed', value: OrderStatus.COMPLETED },
    { label: 'Cancelled', value: OrderStatus.CANCELLED }
  ];

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'orderNumber',
      headerName: 'Order Number',
      flex: 1,
      minWidth: 150,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const order = params.data;
        return `<a href="/orders/${order.id}" class="order-link">${order.orderNumber}</a>`;
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
        return client ? client.name : '-';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const status = params.value;
        const statusClass = `status-${status.toLowerCase().replace('_', '-')}`;
        const statusLabel = this.getStatusLabel(status);
        return `<span class="status-badge ${statusClass}">${statusLabel}</span>`;
      }
    },
    {
      field: 'grandTotal',
      headerName: 'Total',
      width: 120,
      cellRenderer: (params: any) => {
        return this.formatPrice(params.value);
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
      field: 'invoice',
      headerName: 'Invoice',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const invoice = params.value;
        if (!invoice) {
          return '<span class="no-invoice">No invoice</span>';
        }
        return `<a href="/invoices/${invoice.id}" class="invoice-link">${invoice.invoiceNumber}</a>`;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      pinned: 'right',
      filter: false,
      cellRenderer: (params: any) => {
        const order = params.data;
        let buttons = '';
        
        if (this.canShipOrder(order)) {
          buttons += `<button class="action-btn ship-btn" onclick="window.shipOrder('${order.id}')" title="Ship Order">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </button>`;
        }
        
        if (this.canMarkDelivered(order)) {
          buttons += `<button class="action-btn delivered-btn" onclick="window.markDelivered('${order.id}')" title="Mark Delivered">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </button>`;
        }
        
        buttons += `<button class="action-btn view-btn" onclick="window.viewOrder('${order.id}')" title="View Order">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </button>`;
        
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
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  ngOnInit(): void {
    // Register AG-Grid modules
    ModuleRegistry.registerModules([AllCommunityModule]);
    
    this.updateGridClass();
    this.loadOrders();
    
    // Set up global window functions for AG-Grid cell renderers
    (window as any).viewOrder = (id: string) => this.viewOrder(id);
    (window as any).shipOrder = (id: string) => this.shipOrderById(id);
    (window as any).markDelivered = (id: string) => this.markDeliveredById(id);
  }

  loadOrders(): void {
    this.loading.set(true);
    
    const filters: OrderFilters = {
      page: 1, // AG-Grid handles pagination internally
      limit: 1000, // Load all orders for AG-Grid
      sort: 'createdAt,desc'
    };

    if (this.statusFilter !== 'ALL') {
      filters.status = this.statusFilter as OrderStatus;
    }

    this.ordersService.getOrders(filters).subscribe({
      next: (response) => {
        this.orders.set(response.items);
        this.total.set(response.total);
        this.loading.set(false);
        
        // Update grid if it's ready
        if (this.gridApi) {
          if (typeof this.gridApi.setGridOption === 'function') {
            this.gridApi.setGridOption('rowData', this.orders());
            this.gridApi.setGridOption('columnDefs', this.columnDefs);
            // Force grid refresh
            setTimeout(() => {
              this.gridApi.refreshCells();
            }, 100);
          }
        }
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.message.error('Failed to load orders');
        this.loading.set(false);
        
        // Update grid with empty data
        if (this.gridApi && typeof this.gridApi.setGridOption === 'function') {
          this.gridApi.setGridOption('rowData', []);
        }
      }
    });
  }

  onStatusFilterChange(): void {
    this.loadOrders();
  }

  onSearch(): void {
    this.loadOrders();
  }

  clearFilters(): void {
    this.statusFilter = 'ALL';
    this.searchTerm = '';
    this.dateRange = null;
    this.loadOrders();
  }

  // AG-Grid event handlers
  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    
    // If orders are already loaded, set them in the grid
    if (this.orders().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.orders());
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

  getStatusColor(status: OrderStatus): string {
    return this.ordersService.getStatusColor(status);
  }

  getStatusLabel(status: OrderStatus): string {
    return this.ordersService.getStatusLabel(status);
  }

  canShipOrder(order: Order): boolean {
    return order.status === OrderStatus.INVOICE_ISSUED;
  }

  canMarkDelivered(order: Order): boolean {
    return order.status === OrderStatus.SHIPPED;
  }

  viewOrder(id: string): void {
    // Navigate to order detail page
    window.location.href = `/orders/${id}`;
  }

  shipOrderById(id: string): void {
    const order = this.orders().find(o => o.id === id);
    if (order) {
      this.shipOrder(order);
    }
  }

  markDeliveredById(id: string): void {
    const order = this.orders().find(o => o.id === id);
    if (order) {
      this.markDelivered(order);
    }
  }

  shipOrder(order: Order): void {
    this.ordersService.updateOrderStatus(order.id, OrderStatus.SHIPPED).subscribe({
      next: (updatedOrder) => {
        this.message.success(`Order ${order.orderNumber} marked as shipped`);
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error shipping order:', error);
        this.message.error('Failed to ship order');
      }
    });
  }

  markDelivered(order: Order): void {
    this.ordersService.updateOrderStatus(order.id, OrderStatus.DELIVERED).subscribe({
      next: (updatedOrder) => {
        this.message.success(`Order ${order.orderNumber} marked as delivered`);
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error marking order as delivered:', error);
        this.message.error('Failed to mark order as delivered');
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Enum property for template
  OrderStatus = OrderStatus;

  // Quick filter methods
  setStatusFilter(status: OrderStatus | 'ALL') {
    this.statusFilter = status;
    this.onStatusFilterChange();
  }

  clearAllFilters() {
    this.statusFilter = 'ALL';
    this.searchTerm = '';
    this.dateRange = null;
    this.onStatusFilterChange();
  }
}
