import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Pricing {
  id: string;
  productId: string;
  clientId?: string;
  supplierId?: string;
  price: number;
  currency: string;
  taxRate: number;
  discountPercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  client?: {
    id: string;
    name: string;
    email: string;
  };
  supplier?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PricingListResponse {
  data: Pricing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePricingDto {
  productId: string;
  clientId?: string;
  supplierId?: string;
  price: number;
  currency?: string;
  taxRate?: number;
  discountPercent?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdatePricingDto {
  price?: number;
  currency?: string;
  taxRate?: number;
  discountPercent?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface ResolvePricingDto {
  productId: string;
  clientId?: string;
  supplierId?: string;
}

export interface ResolvedPrice {
  price: number;
  currency: string;
  taxRate: number;
  discountPercent: number;
  source: 'BASE' | 'CLIENT_OVERRIDE' | 'SUPPLIER_OVERRIDE';
  effectiveFrom: string;
  effectiveTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pricing`;

  getAll(page?: number, limit?: number): Observable<PricingListResponse> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    
    return this.http.get<PricingListResponse>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Pricing> {
    return this.http.get<Pricing>(`${this.apiUrl}/${id}`);
  }

  create(pricing: CreatePricingDto): Observable<Pricing> {
    return this.http.post<Pricing>(this.apiUrl, pricing);
  }

  update(id: string, pricing: UpdatePricingDto): Observable<Pricing> {
    return this.http.put<Pricing>(`${this.apiUrl}/${id}`, pricing);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByProduct(productId: string): Observable<Pricing[]> {
    return this.http.get<Pricing[]>(`${this.apiUrl}/product/${productId}`);
  }

  resolvePricing(request: ResolvePricingDto): Observable<ResolvedPrice> {
    return this.http.post<ResolvedPrice>(`${this.apiUrl}/resolve`, request);
  }
}
