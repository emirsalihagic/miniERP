import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ProductGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  groupAttributes?: GroupAttribute[];
}

export interface GroupAttribute {
  groupId: string;
  attributeId: string;
  required: boolean;
  uniqueInGroup: boolean;
  sortOrder?: number;
  attribute?: {
    id: string;
    name: string;
    type: string;
    options?: {
      id: string;
      attributeId: string;
      option: string;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
    }[];
  };
}

export interface CreateProductGroupDto {
  name: string;
  code: string;
  description?: string;
}

export interface AssignAttributeDto {
  attributeId: string;
  required: boolean;
  uniqueInGroup: boolean;
  sortOrder?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductGroupsService {
  private apiUrl = `${environment.apiUrl}/product-groups`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductGroup[]> {
    return this.http.get<ProductGroup[]>(`${this.apiUrl}`);
  }

  getOne(id: string): Observable<ProductGroup> {
    return this.http.get<ProductGroup>(`${this.apiUrl}/${id}`);
  }

  create(productGroup: CreateProductGroupDto): Observable<ProductGroup> {
    return this.http.post<ProductGroup>(`${this.apiUrl}`, productGroup);
  }

  update(id: string, productGroup: Partial<CreateProductGroupDto>): Observable<ProductGroup> {
    return this.http.patch<ProductGroup>(`${this.apiUrl}/${id}`, productGroup);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getGroupAttributes(groupId: string): Observable<GroupAttribute[]> {
    return this.http.get<GroupAttribute[]>(`${this.apiUrl}/${groupId}/attributes`);
  }

  assignAttributes(groupId: string, attributes: AssignAttributeDto[]): Observable<GroupAttribute[]> {
    return this.http.post<GroupAttribute[]>(`${this.apiUrl}/${groupId}/attributes`, attributes);
  }

  removeAttribute(groupId: string, attributeId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}/attributes/${attributeId}`);
  }
}
