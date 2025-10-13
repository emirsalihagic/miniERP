import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../products/services/products.service';
import { environment } from '../../../../environments/environment';

// Re-export Product for convenience
export type { Product };

export interface ShopProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  groupId?: string;
  sku?: string;
  attributes?: Record<string, any>;
}

export interface ShopProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ShopProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getShopProducts(filters: ShopProductFilters = {}): Observable<ShopProductsResponse> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.brand) params = params.set('brand', filters.brand);
    if (filters.groupId) params = params.set('groupId', filters.groupId);
    if (filters.sku) params = params.set('sku', filters.sku);
    
    // Add attribute filters
    if (filters.attributes) {
      Object.keys(filters.attributes).forEach(key => {
        params = params.set(`attr.${key}`, filters.attributes![key]);
      });
    }

    return this.http.get<ShopProductsResponse>(`${this.apiUrl}/shop`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}