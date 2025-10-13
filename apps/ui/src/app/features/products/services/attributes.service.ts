import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Attribute {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  options?: AttributeOption[];
}

export interface AttributeOption {
  id: string;
  attributeId: string;
  option: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttributeDto {
  name: string;
  type: string;
  options?: CreateAttributeOptionDto[];
}

export interface CreateAttributeOptionDto {
  option: string;
  sortOrder?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttributesService {
  private apiUrl = `${environment.apiUrl}/attributes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Attribute[]> {
    return this.http.get<Attribute[]>(`${this.apiUrl}`);
  }

  getOne(id: string): Observable<Attribute> {
    return this.http.get<Attribute>(`${this.apiUrl}/${id}`);
  }

  create(attribute: CreateAttributeDto): Observable<Attribute> {
    return this.http.post<Attribute>(`${this.apiUrl}`, attribute);
  }

  update(id: string, attribute: Partial<CreateAttributeDto>): Observable<Attribute> {
    return this.http.put<Attribute>(`${this.apiUrl}/${id}`, attribute);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addOption(attributeId: string, option: CreateAttributeOptionDto): Observable<AttributeOption> {
    return this.http.post<AttributeOption>(`${this.apiUrl}/${attributeId}/options`, option);
  }
}
