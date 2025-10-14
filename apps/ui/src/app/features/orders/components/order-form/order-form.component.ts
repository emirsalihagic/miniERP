import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { OrdersService } from '../../../shop/services/orders.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzSpinModule
  ],
  template: `
    <div class="order-form-container">
      <nz-card nzTitle="Create New Order">
        <div class="form-content">
          <p class="info-text">
            Orders are typically created from your shopping cart. If you need to create an order directly, 
            please add items to your cart first and then proceed to checkout.
          </p>
          
          <div class="form-group">
            <label for="notes">Order Notes (Optional)</label>
            <textarea
              id="notes"
              nz-input
              [(ngModel)]="orderNotes"
              placeholder="Add any special instructions or notes for this order..."
              rows="4"
              class="notes-textarea">
            </textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="goBack()">
              Cancel
            </button>
            <button 
              type="button"
              class="btn btn-primary" 
              (click)="createOrder()"
              [disabled]="loading">
              <span *ngIf="loading" class="spinner"></span>
              Create Order
            </button>
          </div>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .order-form-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .form-content {
      padding: 16px 0;
    }
    
    .info-text {
      background: var(--color-bg-container);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-base);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      color: var(--color-text-secondary);
      font-size: 14px;
      line-height: 1.5;
    }
    
    .form-group {
      margin-bottom: var(--spacing-lg);
    }
    
    .form-group label {
      display: block;
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
      color: var(--color-text-base);
    }
    
    .notes-textarea {
      width: 100%;
      resize: vertical;
    }
    
    .form-actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: flex-end;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }
  `]
})
export class OrderFormComponent implements OnInit {
  orderNotes = '';
  loading = false;

  constructor(
    private ordersService: OrdersService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  createOrder(): void {
    this.loading = true;
    
    this.ordersService.createOrder(this.orderNotes || undefined).subscribe({
      next: (order) => {
        this.loading = false;
        this.message.success(`Order ${order.orderNumber} created successfully!`);
        this.router.navigate(['/orders', order.id]);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.message.error('Failed to create order. Please try again.');
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
