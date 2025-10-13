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
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { OrdersService, Order, OrderStatus } from '../../../shop/services/orders.service';
import { AuthService } from '../../../../core/services/auth.service';
import { InvoicesService } from '../../../invoices/services/invoices.service';

@Component({
  selector: 'app-order-management-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzStepsModule,
    NzTimelineModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule
  ],
  templateUrl: './order-management-detail.component.html',
  styleUrl: './order-management-detail.component.less'
})
export class OrderManagementDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  updatingStatus = false;
  
  // Status update modal
  isStatusModalVisible = false;
  newStatus: OrderStatus | null = null;
  trackingNumber = '';

  // Status options for employees
  statusOptions = [
    { label: 'Invoice Issued', value: OrderStatus.INVOICE_ISSUED },
    { label: 'Shipped', value: OrderStatus.SHIPPED },
    { label: 'Delivered', value: OrderStatus.DELIVERED }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private authService: AuthService,
    private invoicesService: InvoicesService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.message.error('Order ID not found');
      this.router.navigate(['/orders']);
      return;
    }

    this.loading = true;
    this.ordersService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.message.error('Failed to load order');
        this.loading = false;
        this.router.navigate(['/orders']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'orange',
      'INVOICE_CREATED': 'blue',
      'INVOICE_ISSUED': 'green',
      'SHIPPED': 'purple',
      'DELIVERED': 'cyan',
      'COMPLETED': 'success',
      'CANCELLED': 'red'
    };
    return statusMap[status] || 'default';
  }

  getStatusLabel(status: OrderStatus): string {
    return this.ordersService.getStatusLabel(status);
  }

  getCurrentStep(): number {
    if (!this.order) return 0;
    
    switch (this.order.status) {
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
        return -1;
      default:
        return 0;
    }
  }

  canUpdateStatus(): boolean {
    if (!this.order) return false;
    return this.order.status !== OrderStatus.COMPLETED && 
           this.order.status !== OrderStatus.CANCELLED;
  }

  showStatusModal(): void {
    this.isStatusModalVisible = true;
    this.newStatus = null;
    this.trackingNumber = '';
  }

  hideStatusModal(): void {
    this.isStatusModalVisible = false;
    this.newStatus = null;
    this.trackingNumber = '';
  }

  updateOrderStatus(): void {
    if (!this.order || !this.newStatus) {
      this.message.error('Please select a status');
      return;
    }

    this.updatingStatus = true;
    this.ordersService.updateOrderStatus(this.order.id, this.newStatus).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.updatingStatus = false;
        this.hideStatusModal();
        this.message.success(`Order status updated to ${this.getStatusLabel(this.newStatus!)}`);
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.message.error('Failed to update order status');
        this.updatingStatus = false;
      }
    });
  }

  markInvoiceAsPaid(): void {
    if (!this.order?.invoice) {
      this.message.error('No invoice found for this order');
      return;
    }

    this.updatingStatus = true;
    this.invoicesService.markAsPaid(this.order.invoice.id).subscribe({
      next: (updatedInvoice) => {
        // Update the invoice in the order
        if (this.order) {
          this.order.invoice = updatedInvoice;
        }
        
        // Refresh the order to get the latest status from backend
        // The backend automatically completes the order when invoice is paid and order is delivered
        this.refreshOrder();
        
        this.updatingStatus = false;
        this.message.success('Invoice marked as paid successfully');
      },
      error: (error) => {
        console.error('Error marking invoice as paid:', error);
        this.message.error('Failed to mark invoice as paid');
        this.updatingStatus = false;
      }
    });
  }

  completeOrder(): void {
    if (!this.order) return;

    // Safety check: don't try to complete an already completed order
    if (this.order.status === OrderStatus.COMPLETED) {
      this.message.warning('Order is already completed');
      return;
    }

    this.ordersService.updateOrderStatus(this.order.id, OrderStatus.COMPLETED).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.updatingStatus = false;
        this.message.success('Order completed successfully!');
      },
      error: (error) => {
        console.error('Error completing order:', error);
        this.message.error('Failed to complete order');
        this.updatingStatus = false;
      }
    });
  }

  refreshOrder(): void {
    if (!this.order) return;
    
    this.ordersService.getOrderById(this.order.id).subscribe({
      next: (refreshedOrder) => {
        this.order = refreshedOrder;
      },
      error: (error) => {
        console.error('Error refreshing order:', error);
      }
    });
  }

  canMarkAsPaid(): boolean {
    if (!this.order?.invoice) return false;
    return this.order.invoice.status === 'ISSUED' && 
           this.order.status === OrderStatus.DELIVERED;
  }

  canCompleteOrder(): boolean {
    if (!this.order?.invoice) return false;
    return this.order.invoice.status === 'PAID' && 
           this.order.status === OrderStatus.DELIVERED;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  getTimelineItems(): any[] {
    if (!this.order) return [];

    const items = [
      {
        color: 'green',
        icon: 'check-circle',
        title: 'Order Placed',
        description: `Order ${this.order.orderNumber} was placed`,
        time: this.order.createdAt
      }
    ];

    if (this.order.status !== OrderStatus.PENDING) {
      items.push({
        color: 'blue',
        icon: 'file-text',
        title: 'Invoice Created',
        description: 'Draft invoice was created',
        time: this.order.createdAt
      });
    }

    if (this.order.status === OrderStatus.INVOICE_ISSUED || 
        this.order.status === OrderStatus.SHIPPED || 
        this.order.status === OrderStatus.DELIVERED || 
        this.order.status === OrderStatus.COMPLETED) {
      items.push({
        color: 'orange',
        icon: 'send',
        title: 'Invoice Issued',
        description: 'Invoice was issued to client',
        time: this.order.createdAt
      });
    }

    if (this.order.status === OrderStatus.SHIPPED || 
        this.order.status === OrderStatus.DELIVERED || 
        this.order.status === OrderStatus.COMPLETED) {
      items.push({
        color: 'purple',
        icon: 'car',
        title: 'Order Shipped',
        description: this.order.shippedAt ? `Shipped on ${new Date(this.order.shippedAt).toLocaleDateString()}` : 'Order was shipped',
        time: this.order.shippedAt || ''
      });
    }

    if (this.order.status === OrderStatus.DELIVERED || 
        this.order.status === OrderStatus.COMPLETED) {
      items.push({
        color: 'green',
        icon: 'check',
        title: 'Order Delivered',
        description: this.order.deliveredAt ? `Delivered on ${new Date(this.order.deliveredAt).toLocaleDateString()}` : 'Order was delivered',
        time: this.order.deliveredAt || ''
      });
    }

    if (this.order.status === OrderStatus.COMPLETED) {
      items.push({
        color: 'success',
        icon: 'trophy',
        title: 'Order Completed',
        description: 'Order completed successfully',
        time: this.order.updatedAt
      });
    }

    return items;
  }
}
