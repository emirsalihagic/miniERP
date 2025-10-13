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
import { OrdersService, Order, OrderStatus, OrderFilters } from '../../../services/orders.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-orders-list',
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
    NzPaginationModule
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.less'
})
export class OrdersListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  total = 0;
  page = 1;
  pageSize = 10;
  
  // Filters
  selectedStatus: OrderStatus | null = null;
  statusOptions = [
    { label: 'All Orders', value: null },
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
      status: this.selectedStatus || undefined
    };

    this.ordersService.getOrders(filters).subscribe({
      next: (response: any) => {
        this.orders = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.message.error('Failed to load orders');
        this.loading = false;
      }
    });
  }

  onStatusFilterChange(): void {
    this.page = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadOrders();
  }

  cancelOrder(order: Order): void {
    this.ordersService.cancelOrder(order.id).subscribe({
      next: (updatedOrder: any) => {
        this.message.success(`Order ${order.orderNumber} cancelled successfully`);
        this.loadOrders(); // Reload to get updated data
      },
      error: (error: any) => {
        console.error('Error cancelling order:', error);
        this.message.error('Failed to cancel order');
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: OrderStatus): string {
    return this.ordersService.getStatusColor(status);
  }

  getInvoiceStatusColor(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'ISSUED':
        return 'blue';
      case 'SENT':
        return 'orange';
      case 'PAID':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    return this.ordersService.getStatusLabel(status);
  }

  canCancelOrder(order: Order): boolean {
    return this.ordersService.canCancelOrder(order);
  }

  getCurrentUserRole(): string {
    return this.authService.getCurrentUser()?.role || '';
  }
}
