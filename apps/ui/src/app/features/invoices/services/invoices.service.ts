import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface InvoiceItem {
  id?: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountPercent: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTax: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  status: 'DRAFT' | 'ISSUED' | 'SENT' | 'PAID' | 'CANCELLED';
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  discountPercent: number;
  dueDate?: string;
  issuedAt?: string;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  clientId: string;
  dueDate?: string;
  notes?: string;
  discountPercent?: number;
}

export interface AddInvoiceItemDto {
  productId: string;
  quantity: number;
  discountPercent?: number;
}

export interface UpdateInvoiceDiscountDto {
  discountPercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/invoices`;

  getAll(clientId?: string): Observable<Invoice[]> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }
    return this.http.get<Invoice[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  create(invoice: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  addItem(invoiceId: string, item: AddInvoiceItemDto): Observable<InvoiceItem> {
    return this.http.post<InvoiceItem>(`${this.apiUrl}/${invoiceId}/items`, item);
  }

  updateDiscount(invoiceId: string, discount: UpdateInvoiceDiscountDto): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${invoiceId}/discount`, discount);
  }

  issue(invoiceId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${invoiceId}/issue`, {});
  }

  markAsPaid(invoiceId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${invoiceId}/paid`, {});
  }
}
