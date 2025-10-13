import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { CartService, Cart, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzTableModule,
    NzInputNumberModule,
    NzSpinModule,
    NzIconModule,
    NzEmptyModule,
    NzTagModule
  ],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.less'
})
export class ShoppingCartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  updating = false;

  // Make Number function available in template
  Number = Number;

  constructor(
    private cartService: CartService,
    private message: NzMessageService
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

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(item);
      return;
    }

    this.updating = true;
    this.cartService.updateItemQuantity(item.productId, quantity).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.updating = false;
        this.message.success('Cart updated');
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.message.error('Failed to update quantity');
        this.updating = false;
      }
    });
  }

  removeItem(item: CartItem): void {
    this.updating = true;
    this.cartService.removeItem(item.productId).subscribe({
      next: () => {
        this.loadCart(); // Reload cart to get updated data
        this.updating = false;
        this.message.success('Item removed from cart');
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.message.error('Failed to remove item');
        this.updating = false;
      }
    });
  }

  clearCart(): void {
    this.updating = true;
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = null;
        this.updating = false;
        this.message.success('Cart cleared');
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        this.message.error('Failed to clear cart');
        this.updating = false;
      }
    });
  }

  formatPrice(price: number): string {
    // Convert USD to EUR (approximate rate: 1 USD = 0.85 EUR)
    // In a real application, this would use a live exchange rate API
    const eurPrice = price * 0.85;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(eurPrice);
  }

  getProductImage(item: CartItem): string {
    return 'https://via.placeholder.com/80x80?text=' + encodeURIComponent(item.product.name);
  }

  canProceedToCheckout(): boolean {
    return this.cart !== null && this.cart.items.length > 0;
  }

  getTotalItemCount(): number {
    if (!this.cart || !this.cart.items) {
      return 0;
    }
    return this.cart.items.reduce((sum, item) => sum + Number(item.quantity), 0);
  }

  isUnitString(unit: any): boolean {
    return typeof unit === 'string';
  }

  isUnitObject(unit: any): boolean {
    return typeof unit === 'object' && unit !== null;
  }
}
