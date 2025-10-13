import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    sku: string;
    name: string;
    description?: string;
    unit: {
      id: string;
      code: string;
      name: string;
      group: string;
      isBase: boolean;
      toBaseFactor: number;
    };
    supplier?: {
      id: string;
      name: string;
    };
  };
  quantity: number | string;
  unitPrice: number | string;
  lineTotal: number | string;
  taxRate?: number;
  lineSubtotal?: number;
  lineTax?: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number | string;
  taxTotal: number | string;
  grandTotal: number | string;
  currency: string;
}

export interface AddCartItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private itemCountSubject = new BehaviorSubject<number>(0);
  public itemCount$ = this.itemCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => {
        const itemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity), 0);
        this.itemCountSubject.next(itemCount);
      })
    );
  }

  addItem(productId: string, quantity: number): Observable<Cart> {
    const dto: AddCartItemDto = { productId, quantity };
    return this.http.post<Cart>(`${this.apiUrl}/items`, dto).pipe(
      tap(cart => {
        const itemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity), 0);
        this.itemCountSubject.next(itemCount);
      })
    );
  }

  updateItemQuantity(productId: string, quantity: number): Observable<Cart> {
    const dto: UpdateCartItemDto = { quantity };
    return this.http.put<Cart>(`${this.apiUrl}/items/${productId}`, dto).pipe(
      tap(cart => {
        const itemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity), 0);
        this.itemCountSubject.next(itemCount);
      })
    );
  }

  removeItem(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${productId}`).pipe(
      tap(() => {
        // Refresh cart to get updated item count
        this.getCart().subscribe();
      })
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => {
        this.itemCountSubject.next(0);
      })
    );
  }

  getItemCount(): Observable<number> {
    return this.itemCount$;
  }
}