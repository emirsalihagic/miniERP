import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
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
    NzCardModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzEmptyModule,
    NzSelectModule,
    NzPaginationModule,
    NzInputModule,
    NzDatePickerModule
  ],
  templateUrl: './orders-management-list.component.html',
  styleUrl: './orders-management-list.component.less'
})
export class OrdersManagementListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  total = 0;
  page = 1;
  pageSize = 10;
  
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

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    
    const filters: OrderFilters = {
      page: this.page,
      limit: this.pageSize,
      sort: 'createdAt,desc'
    };

    if (this.statusFilter !== 'ALL') {
      filters.status = this.statusFilter as OrderStatus;
    }

    this.ordersService.getOrders(filters).subscribe({
      next: (response) => {
        this.orders = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.message.error('Failed to load orders');
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadOrders();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.page = 1;
    this.loadOrders();
  }

  onStatusFilterChange(): void {
    this.page = 1;
    this.loadOrders();
  }

  onSearch(): void {
    this.page = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.statusFilter = 'ALL';
    this.searchTerm = '';
    this.dateRange = null;
    this.page = 1;
    this.loadOrders();
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
}
