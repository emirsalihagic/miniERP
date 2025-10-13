import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export enum OrderStatus {
  PENDING = 'PENDING',
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_ISSUED = 'INVOICE_ISSUED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    supplier?: {
      name: string;
    };
  };
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  status: OrderStatus;
  invoiceId?: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  notes?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  client: {
    id: string;
    name: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    grandTotal: number;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  trackingNumber?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(notes?: string): Observable<Order> {
    const dto: CreateOrderDto = { notes };
    return this.http.post<Order>(this.apiUrl, dto);
  }

  getOrders(filters: OrderFilters = {}): Observable<OrdersResponse> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.clientId) params = params.set('clientId', filters.clientId);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.sort) params = params.set('sort', filters.sort);

    return this.http.get<OrdersResponse>(this.apiUrl, { params });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Observable<Order> {
    const dto: UpdateOrderStatusDto = { status, trackingNumber };
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, dto);
  }

  cancelOrder(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getOrdersByClient(clientId: string, filters: OrderFilters = {}): Observable<OrdersResponse> {
    const clientFilters = { ...filters, clientId };
    return this.getOrders(clientFilters);
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'default';
      case OrderStatus.INVOICE_CREATED:
        return 'blue';
      case OrderStatus.INVOICE_ISSUED:
        return 'orange';
      case OrderStatus.SHIPPED:
        return 'purple';
      case OrderStatus.DELIVERED:
        return 'green';
      case OrderStatus.COMPLETED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.INVOICE_CREATED:
        return 'Invoice Created';
      case OrderStatus.INVOICE_ISSUED:
        return 'Invoice Issued';
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.COMPLETED:
        return 'Completed';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.PENDING;
  }
}