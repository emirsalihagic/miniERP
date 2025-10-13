import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { OrdersService, Order, OrderStatus } from '../../../services/orders.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzStepsModule,
    NzTimelineModule
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.less'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  currentStep = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  loadOrder(orderId: string): void {
    this.loading = true;
    this.ordersService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.currentStep = this.getCurrentStep(order.status);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.message.error('Failed to load order');
        this.loading = false;
      }
    });
  }

  cancelOrder(): void {
    if (!this.order) return;

    this.ordersService.cancelOrder(this.order.id).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.message.success(`Order ${this.order.orderNumber} cancelled successfully`);
      },
      error: (error) => {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  getStatusColor(status: OrderStatus): string {
    return this.ordersService.getStatusColor(status);
  }

  getStatusLabel(status: OrderStatus): string {
    return this.ordersService.getStatusLabel(status);
  }

  canCancelOrder(): boolean {
    return this.order ? this.ordersService.canCancelOrder(this.order) : false;
  }

  getCurrentStep(status: OrderStatus): number {
    switch (status) {
      case OrderStatus.PENDING:
        return 0;
      case OrderStatus.INVOICE_CREATED:
        return 1;
      case OrderStatus.INVOICE_ISSUED:
        return 2;
      case OrderStatus.SHIPPED:
        return 3;
      case OrderStatus.DELIVERED:
        return 4;
      case OrderStatus.COMPLETED:
        return 5;
      case OrderStatus.CANCELLED:
        return -1; // Special case for cancelled
      default:
        return 0;
    }
  }

  getProductImage(item: any): string {
    return 'https://via.placeholder.com/60x60?text=' + encodeURIComponent(item.productName);
  }
}
