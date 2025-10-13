import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Product {
  id: string;
  name: string;
  baseName?: string;
  groupName?: string;
  localName?: string;
  description?: string;
  unitString?: string; // Renamed to avoid conflict
  unitId?: string;
  storageType?: string;
  sku?: string;
  barcode?: string;
  exclusivity: string;
  status: string;
  forbidSale: boolean;
  category?: {
    id: string;
    name: string;
  };
  brandObject?: { // Renamed to avoid conflict
    id: string;
    name: string;
  };
  // New fields for extended functionality
  groupId?: string;
  brand?: string;
  unit?: {
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
  attributes?: Record<string, any>; // String field for brand name
  shelfLifeDays?: number;
  weightPerItem?: number;
  variationKey?: string;
  productGroup?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
  attributeValues?: {
    id: string;
    attributeId: string;
    value: any;
    attribute: {
      id: string;
      code: string;
      name: string;
      type: string;
    };
  }[];
  preferredSuppliers?: {
    id: string;
    supplierId: string;
    priority: number;
    isPrimary: boolean;
    supplierSku?: string;
    price?: number;
    currency?: string;
    supplier: {
      id: string;
      name: string;
    };
  }[];
}

export interface CreateProductDto {
  name: string;
  baseName: string;
  groupName?: string;
  localName?: string;
  description?: string;
  unitId?: string;
  storageType: string;
  sku?: string;
  barcode?: string;
  exclusivity: string;
  status: string;
  forbidSale?: boolean;
  categoryId: string;
  brandId: string;
  groupId?: string;
  brand?: string;
  shelfLifeDays?: number;
  weightPerItem?: number;
  attributes?: Record<string, any>;
}

export interface ProductFilters {
  groupId?: string;
  status?: string;
  brand?: string;
  sku?: string;
  attributes?: Record<string, any>;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Get all products with optional filtering
   */
  getAll(filters?: ProductFilters): Observable<{ data: Product[]; meta: any }> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof ProductFilters] !== undefined) {
          if (key === 'attributes' && filters.attributes) {
            // Convert attributes to query parameters
            Object.keys(filters.attributes).forEach(attrKey => {
              params = params.set(`attr.${attrKey}`, filters.attributes![attrKey]);
            });
          } else {
            params = params.set(key, filters[key as keyof ProductFilters] as string);
          }
        }
      });
    }

    return this.http.get<{ data: Product[]; meta: any }>(this.apiUrl, { params });
  }

  /**
   * Get a single product by ID
   */
  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new product
   */
  create(product: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  /**
   * Update an existing product
   */
  update(id: string, product: Partial<CreateProductDto>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  /**
   * Delete a product
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get orderable products (ACTIVE status only)
   */
  getOrderableProducts(filters?: any): Observable<{ data: Product[]; meta: any }> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<{ data: Product[]; meta: any }>(`${this.apiUrl}/orderable`, { params });
  }

  /**
   * Upsert preferred suppliers for a product
   */
  upsertPreferredSuppliers(productId: string, suppliers: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/suppliers`, suppliers);
  }

  /**
   * Get products by supplier
   */
  getProductsBySupplier(supplierId: string, options?: { page?: number; limit?: number }): Observable<{ data: Product[]; meta: any }> {
    let params = new HttpParams();
    if (options) {
      Object.keys(options).forEach(key => {
        const value = options[key as keyof typeof options];
        if (value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<{ data: Product[]; meta: any }>(`${this.apiUrl}/supplier/${supplierId}`, { params });
  }
}
