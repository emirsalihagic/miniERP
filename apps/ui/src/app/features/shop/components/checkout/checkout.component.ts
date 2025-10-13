import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { CartService, Cart } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzSpinModule,
    NzIconModule,
    NzEmptyModule,
    NzTagModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.less'
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  submitting = false;
  orderNotes = '';

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.message.error('Failed to load cart');
        this.loading = false;
      }
    });
  }

  submitOrder(): void {
    if (!this.cart || this.cart.items.length === 0) {
      this.message.error('Cart is empty');
      return;
    }

    this.submitting = true;
    this.ordersService.createOrder(this.orderNotes || undefined).subscribe({
      next: (order) => {
        this.submitting = false;
        this.message.success(`Order ${order.orderNumber} created successfully!`);
        
        // Navigate to order detail page
        this.router.navigate(['/shop/orders', order.id]);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.message.error('Failed to create order');
        this.submitting = false;
      }
    });
  }

  formatPrice(price: number | string): string {
    // Price is already in EUR, no conversion needed
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(numericPrice);
  }

  getProductImage(item: any): string {
    return 'https://via.placeholder.com/60x60?text=' + encodeURIComponent(item.product.name);
  }

  canSubmitOrder(): boolean {
    return this.cart !== null && this.cart.items.length > 0 && !this.submitting;
  }

  isUnitString(unit: any): boolean {
    return typeof unit === 'string';
  }

  isUnitObject(unit: any): boolean {
    return typeof unit === 'object' && unit !== null;
  }
}
